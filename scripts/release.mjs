// The publish step of .github/workflows/check.yml (SEAL #7 B1-release, #10). It releases the package file that the
// validate job built, packed and proved, once, as an immutable GitHub Release asset, or verifies the release that
// already exists. It only reads and writes releases through `gh`; it installs, builds and tests nothing.
//   node scripts/release.mjs casaelida-vue-X.Y.Z.tgz      with GH_TOKEN, GH_REPO and the GitHub Actions run variables
// The release state is read in this order. A read that fails fails the run; it never counts as "absent".
//   1. A published release: verify its asset and compare its unpacked contents with the validated file. Publish nothing.
//   2. Nothing: one `gh release create` (it drafts, uploads and publishes), then check the tag, the asset and its attestation.
//   3. A draft: recover only this workflow's own draft for this commit, holding at most its one asset. Any other: stop.
//   4. A tag without a release: stop. An orphan tag is never adopted.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const BOT = 'github-actions[bot]';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const fail = (message) => { throw new Error(message); };

// The release notes. A recoverable draft must carry this workflow's and this commit's lines.
export const notes = ({ url, sha, asset, workflow, commit, run }) =>
  `Install: \`pnpm add ${url}\`\n\n- sha256: \`${sha}\` (${asset})\n- Workflow: ${workflow}\n- Commit: ${commit}\n- Run: ${run}\n`;

// Every file in a package file with its sha256, so two packs of the same contents are equal whatever their gzip bytes.
export function contents(file) {
  const dir = mkdtempSync(join(tmpdir(), 'ce-release-'));
  try {
    execFileSync('tar', ['-xzf', file, '-C', dir]);
    return new Map(readdirSync(dir, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name)).sort().map((path) => [relative(dir, path), sha256(readFileSync(path))]));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

export function release({ gh, file, repo, commit, workflow, run, server = 'https://github.com' }) {
  const [asset, version] = basename(file).match(/^casaelida-vue-(\d+\.\d+\.\d+)\.tgz$/) ?? fail(`${file} is not a casaelida-vue-X.Y.Z.tgz package file.`);
  const tag = `vue-v${version}`, url = `${server}/${repo}/releases/download/${tag}/${asset}`, validated = sha256(readFileSync(file));
  const api = (path) => JSON.parse(gh(['api', ...path]));
  // The commit the tag resolves to, through annotated tags, or null when there is no such tag.
  const peel = () => {
    const ref = api([`repos/${repo}/git/matching-refs/tags/${tag}`]).find((item) => item.ref === `refs/tags/${tag}`);
    if (!ref) return null;
    let { type, sha } = ref.object;
    while (type === 'tag') ({ type, sha } = api([`repos/${repo}/git/tags/${sha}`]).object);
    return type === 'commit' ? sha : fail(`Tag ${tag} points to a ${type}, not a commit.`);
  };
  const work = mkdtempSync(join(tmpdir(), 'ce-release-'));
  // The published asset, downloaded and checked against the release's attestation.
  const download = () => {
    gh(['release', 'download', tag, '--pattern', asset, '--dir', work]);
    gh(['release', 'verify', tag]);
    gh(['release', 'verify-asset', tag, join(work, asset)]);
    return join(work, asset);
  };
  // After this run published: the tag is this commit and the public file is the validated one.
  const confirm = (state) => {
    const tagged = peel();
    if (tagged !== commit) fail(`Tag ${tag} resolves to ${tagged}, not to this run's commit ${commit}.`);
    if (sha256(readFileSync(download())) !== validated) fail(`The published ${asset} is not the validated file (sha256 ${validated}).`);
    return { state, tag, version, url, sha256: validated, commit };
  };
  try {
    const releases = api(['--paginate', '--slurp', `repos/${repo}/releases?per_page=100`]).flat().filter((item) => item.tag_name === tag);
    const tagged = peel();
    const published = releases.find((item) => !item.draft);
    if (published) {
      const original = tagged ?? fail(`Release ${tag} is published but its tag cannot be read.`);
      const shipped = download(), was = contents(shipped), now = contents(file);
      const differ = [...new Set([...was.keys(), ...now.keys()])].filter((path) => was.get(path) !== now.get(path)).sort();
      if (differ.length) fail(`Shipped contents changed without a version bump: ${differ.join(', ')} differ from the published ${tag}. Release them as a new version of packages/vue.`);
      return { state: 'published', tag, version, url, sha256: sha256(readFileSync(shipped)), commit: original };
    }
    if (!releases.length) {
      if (tagged) fail(`Tag ${tag} exists without a release (it resolves to ${tagged}). An orphan tag is never adopted: report it.`);
      gh(['release', 'create', tag, file, '--target', commit, '--title', `@casaelida/vue ${version}`, '--notes', notes({ url, sha: validated, asset, workflow, commit, run })]);
      return confirm('created');
    }
    const [draft] = releases, lines = (draft.body ?? '').split(/\r?\n/);
    const why = [
      [releases.length > 1, `${releases.length} drafts exist for ${tag}`],
      [draft.author?.login !== BOT, `its author is ${draft.author?.login}, not ${BOT}`],
      [!lines.includes(`- Workflow: ${workflow}`) || !lines.includes(`- Commit: ${commit}`), `its notes do not name the workflow "${workflow}" and this run's commit ${commit}`],
      [draft.target_commitish !== commit, `it targets ${draft.target_commitish}, not this run's commit ${commit}`],
      [tagged && tagged !== commit, `tag ${tag} already resolves to ${tagged}, not this run's commit ${commit}`],
      [draft.assets.some((item) => item.name !== asset), `it holds assets other than ${asset}`],
    ].find(([unsafe]) => unsafe)?.[1];
    if (why) fail(`A draft release for ${tag} exists that this run may not recover: ${why}. It is left untouched; report it.`);
    gh(['release', 'upload', tag, file, '--clobber']);
    // Fresh notes: they state the sha256 of the file this run uploaded, not that of an earlier attempt's file.
    gh(['release', 'edit', tag, '--notes', notes({ url, sha: validated, asset, workflow, commit, run }), '--draft=false']);
    return confirm('recovered');
  } finally { rmSync(work, { recursive: true, force: true }); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const need = (name) => process.env[name] || fail(`${name} is not set.`);
  const repo = need('GH_REPO'), server = need('GITHUB_SERVER_URL');
  const gh = (args) => {
    console.log(`$ gh ${args.join(' ')}`);
    const out = execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 64 << 20 });
    if (args[0] !== 'api') process.stdout.write(out);
    return out;
  };
  const result = release({
    gh, repo, server, file: process.argv[2] ?? fail('Usage: node scripts/release.mjs casaelida-vue-X.Y.Z.tgz'),
    commit: need('GITHUB_SHA'), workflow: need('GITHUB_WORKFLOW'), run: `${server}/${repo}/actions/runs/${need('GITHUB_RUN_ID')}`,
  });
  appendFileSync(need('GITHUB_OUTPUT'), `url=${result.url}\nsha256=${result.sha256}\n`);
  appendFileSync(need('GITHUB_STEP_SUMMARY'), `### @casaelida/vue ${result.version}: ${result.state}\n\n- Release: ${server}/${repo}/releases/tag/${result.tag}\n`
    + `- Asset: ${result.url}\n- sha256: \`${result.sha256}\`\n- Release commit: ${result.commit}\n`);
}
