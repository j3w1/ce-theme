// The built site is public. Only known files may be published, and no published text may carry private material. Adapted
// from the theme repository's private-material scan of dist/; CI runs it on the exact dist/ it uploads to GitHub Pages.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WITHHELD } from '../../scripts/withheld.mjs';
import { distFiles, distPath, listFiles, readDist, root } from './output.mjs';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const FONT = /\.(woff2?|ttf|otf|eot)$/i;
/** Images and fonts are binary. The allowlist accepts each only with the sha256 its manifest records; everything else is text. */
const BINARY = /\.(png|jpe?g|webp|gif|avif|ico|woff2?|ttf|otf|eot)$/i;

/** The page a source in site/pages builds: index.astro → index.html, 404.astro → 404.html, a/b.astro → a/b/index.html. */
const pageOutput = (source) => (/^(.*\/)?index\.astro$|^404\.astro$/.test(source) ? source.replace(/\.astro$/, '.html') : source.replace(/\.astro$/, '/index.html'));

/** Each published file of a public/ folder that the build copies as-is, with its exact bytes. */
async function copied(folder) {
  const base = new URL(`public/${folder}/`, root);
  return new Map(await Promise.all((await listFiles(base)).map(async (path) => [`${folder}/${path}`, await readFile(new URL(path, base))])));
}

/** The _astro/ files the pages load: referenced from a page, or from a bundle a page loads (chunk imports and CSS url()). */
async function pageBundles(pages) {
  const found = new Set();
  const queue = [];
  const add = (text) => { for (const [, name] of text.matchAll(/(?:\/_astro\/|\.\/)([\w.-]+\.(?:m?js|css|woff2?))\b/g)) if (!found.has(`_astro/${name}`)) { found.add(`_astro/${name}`); queue.push(`_astro/${name}`); } };
  for (const page of pages) add(await readDist(page, 'utf8').catch(() => ''));
  while (queue.length) {
    const file = queue.shift();
    if (/\.(m?js|css)$/.test(file)) add(await readDist(file, 'utf8').catch(() => ''));
  }
  return found;
}

test('the build publishes only pages, their bundles, recorded assets and fonts, the generated downloads and the licenses', async () => {
  const pages = new Set((await listFiles(new URL('site/pages/', root))).filter((file) => file.endsWith('.astro')).map(pageOutput));
  const bundles = await pageBundles(pages);
  const fonts = new Set((await readJson('fonts/manifest.json')).map((font) => font.sha256));
  const recorded = new Map();
  for (const folder of ['assets', 'references']) {
    recorded.set(`${folder}/manifest.json`, null);
    for (const asset of await readJson(`public/${folder}/manifest.json`)) recorded.set(`${folder}/${asset.file}`, asset.sha256);
  }
  const exact = new Map([...await copied('downloads'), ...await copied('licenses')]);
  const problems = [];
  const files = await distFiles();
  for (const file of files) {
    if (!(await lstat(join(distPath, file))).isFile()) { problems.push(`${file}: not a regular file`); continue; }
    const bytes = await readDist(file);
    if (FONT.test(file)) { if (!fonts.has(sha256(bytes))) problems.push(`${file}: font not recorded in fonts/manifest.json`); }
    else if (pages.has(file) || /^favicon\.(svg|ico)$/.test(file)) continue;
    else if (/^_astro\/[^/]+\.(js|css)$/.test(file)) { if (!bundles.has(file)) problems.push(`${file}: a bundle no page loads`); }
    else if (recorded.has(file)) { if (recorded.get(file) !== null && recorded.get(file) !== sha256(bytes)) problems.push(`${file}: differs from its manifest sha256`); }
    else if (exact.has(file)) { if (!exact.get(file).equals(bytes)) problems.push(`${file}: differs from the generated public/ copy`); }
    else problems.push(`${file}: not an allowed output`);
  }
  for (const file of [...pages, ...exact.keys()]) if (!files.includes(file)) problems.push(`${file}: missing from the build`);
  assert.deepEqual(problems, []);
});

// Patterns that must never be published. A finding names the file and the rule only, never the matched text.
const RULES = [
  ['an absolute home or devbox path', /\/home\/|\/Users\/|C:\\|~\//],
  ['a private-network address', /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b|\b[a-z\d-]+\.(?:local|lan)\b/i],
  ['a private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['a GitHub token', /\b(?:gh[pousr]_[A-Za-z\d]{20,}|github_pat_\w{20,})/],
  ['a Slack token', /\bxox[abposr]-[A-Za-z\d-]{10,}/],
  ['an AWS access key', /\b(?:AKIA|ASIA)[A-Z\d]{16}\b/],
  ['an OpenAI key', /\bsk-(?:proj-|svcacct-|admin-)?[A-Za-z\d_-]{20,}/],
  ['the withheld name of the external retail reference', WITHHELD],
];

test('no published text carries a home path, a private address, a credential or the withheld reference name', async () => {
  const problems = [];
  // Every file except hash-pinned images and fonts is read as text, whatever its extension (licenses have none).
  const files = (await distFiles()).filter((file) => !BINARY.test(file));
  for (const kind of [/\.js$/, /\.md$/, /^licenses\//]) assert.ok(files.some((file) => kind.test(file)), `scans ${kind}`);
  for (const file of files) {
    const text = await readDist(file, 'utf8');
    for (const [rule, pattern] of RULES) if (pattern.test(text)) problems.push(`${file}: ${rule}`);
  }
  assert.deepEqual(problems, []);
});
