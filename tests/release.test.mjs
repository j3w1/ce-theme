import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { notes, release } from '../scripts/release.mjs';

// The four release states of scripts/release.mjs against a stand-in for `gh`: GitHub's releases, the tag and the published file.
const COMMIT = 'a'.repeat(40), OLDER = 'b'.repeat(40), WORKFLOW = 'Foundation checks and release', TAG = 'vue-v0.2.0', RUN = 'https://github.com/j3w1/ce-theme/actions/runs/1';
const work = mkdtempSync(join(tmpdir(), 'ce-release-test-'));
after(() => rmSync(work, { recursive: true, force: true }));
const pack = (files, time = 1000) => {
  const dir = mkdtempSync(join(work, 'pack-'));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, 'package', path)), { recursive: true });
    writeFileSync(join(dir, 'package', path), text);
    utimesSync(join(dir, 'package', path), time, time);
  }
  execFileSync('tar', ['-czf', join(dir, 'casaelida-vue-0.2.0.tgz'), '-C', dir, 'package']);
  return join(dir, 'casaelida-vue-0.2.0.tgz');
};
const FILES = { 'package.json': '{"name":"@casaelida/vue","version":"0.2.0"}', 'dist/index.js': 'export {};\n' };
const file = pack(FILES);
const own = (sha) => notes({ url: 'URL', sha, asset: 'casaelida-vue-0.2.0.tgz', workflow: WORKFLOW, commit: COMMIT, run: RUN });

function github({ releases = [], tag = null, published = file, fails } = {}) {
  const calls = [];
  const gh = (args) => {
    calls.push(args);
    const line = args.join(' ');
    if (fails && line.includes(fails)) throw new Error(`gh: HTTP 502 (${fails})`);
    if (line.includes('/releases?')) return JSON.stringify([releases]);
    if (line.includes('/matching-refs/')) return JSON.stringify(tag ? [{ ref: `refs/tags/${TAG}`, object: { type: 'commit', sha: tag } }] : []);
    if (args[1] === 'download') copyFileSync(published, join(args[args.indexOf('--dir') + 1], 'casaelida-vue-0.2.0.tgz'));
    if (args[1] === 'create' || line.includes('--draft=false')) tag = COMMIT;
    return '';
  };
  const writes = () => calls.filter(([command, sub]) => command === 'release' && ['create', 'upload', 'edit', 'delete'].includes(sub));
  return { gh, calls, writes, run: () => release({ gh, file, repo: 'j3w1/ce-theme', commit: COMMIT, workflow: WORKFLOW, run: RUN }) };
}
const published = { tag_name: TAG, draft: false };
const draft = (changes = {}) => ({ tag_name: TAG, draft: true, author: { login: 'github-actions[bot]' }, target_commitish: COMMIT, body: own('x'), assets: [{ name: 'casaelida-vue-0.2.0.tgz' }], ...changes });
const verified = (calls) => ['verify', 'verify-asset'].every((sub) => calls.some((args) => args[0] === 'release' && args[1] === sub && args[2] === TAG));

test('1. a published release with the same contents is verified and reused, whatever its gzip bytes', () => {
  const same = pack(FILES, 2000);
  assert.notDeepEqual(readFileSync(same), readFileSync(file));
  const github1 = github({ releases: [published, draft()], tag: OLDER, published: same });
  const result = github1.run();
  assert.equal(result.state, 'published');
  assert.equal(result.commit, OLDER, 'records the original commit');
  assert.equal(result.url, `https://github.com/j3w1/ce-theme/releases/download/${TAG}/casaelida-vue-0.2.0.tgz`);
  assert.deepEqual(github1.writes(), []);
  assert.ok(verified(github1.calls));
});

test('1. shipped contents changed without a version bump fail and publish nothing', () => {
  const changed = github({ releases: [published], tag: OLDER, published: pack({ ...FILES, 'dist/index.js': 'export const x = 1;\n', 'README.md': '#\n' }) });
  assert.throws(changed.run, /Shipped contents changed without a version bump: package\/README\.md, package\/dist\/index\.js/);
  assert.deepEqual(changed.writes(), []);
});

test('2. with nothing there, one release create of the validated file at this commit, then tag, asset and attestation checks', () => {
  const fresh = github();
  const result = fresh.run();
  assert.equal(result.state, 'created');
  assert.equal(result.commit, COMMIT);
  const [create, ...others] = fresh.writes();
  assert.deepEqual(others, []);
  assert.deepEqual(create.slice(0, 6), ['release', 'create', TAG, file, '--target', COMMIT]);
  const body = create[create.indexOf('--notes') + 1];
  for (const line of [`(casaelida-vue-0.2.0.tgz)`, `- sha256: \`${result.sha256}\``, `- Workflow: ${WORKFLOW}`, `- Commit: ${COMMIT}`, `- Run: ${RUN}`]) assert.ok(body.includes(line), line);
  assert.ok(verified(fresh.calls));
  assert.throws(github({ published: pack({ other: '' }) }).run, /The published casaelida-vue-0\.2\.0\.tgz is not the validated file/);
});

test("3. this workflow's own draft for this commit is recovered: its one asset replaced, then published", () => {
  for (const ownDraft of [draft(), draft({ assets: [] })]) {
    const recovery = github({ releases: [ownDraft] });
    assert.equal(recovery.run().state, 'recovered');
    assert.deepEqual(recovery.writes(), [['release', 'upload', TAG, file, '--clobber'], ['release', 'edit', TAG, '--draft=false']]);
    assert.ok(verified(recovery.calls));
  }
});

test('3. a foreign draft, a draft with another asset and a draft whose tag is elsewhere are left untouched', () => {
  for (const [why, setup] of [
    ['another author', { releases: [draft({ author: { login: 'j3w1' } })] }],
    ['another workflow', { releases: [draft({ body: own('x').replace(WORKFLOW, 'Other') })] }],
    ['another commit', { releases: [draft({ body: own('x').replace(COMMIT, OLDER) })] }],
    ['another target', { releases: [draft({ target_commitish: OLDER })] }],
    ['an extra asset', { releases: [draft({ assets: [{ name: 'casaelida-vue-0.2.0.tgz' }, { name: 'extra.txt' }] })] }],
    ['a tag at another commit', { releases: [draft()], tag: OLDER }],
    ['two drafts', { releases: [draft(), draft()] }],
  ]) {
    const unsafe = github(setup);
    assert.throws(unsafe.run, /may not recover: .* It is left untouched/, why);
    assert.deepEqual(unsafe.writes(), [], why);
  }
});

test('4. a tag without any release fails; an orphan tag is never adopted', () => {
  const orphan = github({ tag: OLDER });
  assert.throws(orphan.run, /Tag vue-v0\.2\.0 exists without a release/);
  assert.deepEqual(orphan.writes(), []);
});

test('a failed read fails the run and never counts as absent', () => {
  for (const fails of ['/releases?', '/matching-refs/', 'release download', 'release verify']) {
    const failing = github(fails.startsWith('release') ? { releases: [published], tag: OLDER, fails } : { fails });
    assert.throws(failing.run, /HTTP 502/, fails);
    assert.deepEqual(failing.writes(), [], fails);
  }
});
