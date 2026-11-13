// The built site is public. Only known files may be published, and no published text may carry private material. Adapted
// from the theme repository's private-material scan of dist/; CI runs it on the exact dist/ it uploads to GitHub Pages.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WITHHELD } from '../../scripts/withheld.mjs';
import { SITE, cssUrls, distFiles, distPath, elements, jsImports, listFiles, readDist, root, servedAt } from './output.mjs';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const FONT = /\.(woff2?|ttf|otf|eot)$/i;
const BINARY = /\.(png|jpe?g|webp|gif|avif|ico|woff2?|ttf|otf|eot)$/i;
const ASTRO = new URL('_astro/', SITE);

/** The page a source in site/pages builds: index.astro → index.html, 404.astro → 404.html, a/b.astro → a/b/index.html. */
const pageOutput = (source) => (/^(.*\/)?index\.astro$|^404\.astro$/.test(source) ? source.replace(/\.astro$/, '.html') : source.replace(/\.astro$/, '/index.html'));

/** Each published file of a public/ folder that the build copies as-is, with its exact bytes. */
async function copied(folder) {
  const base = new URL(`public/${folder}/`, root);
  return new Map(await Promise.all((await listFiles(base)).map(async (path) => [`${folder}/${path}`, await readFile(new URL(path, base))])));
}

/** The sha256 of every recorded image and font: the only binary files the build may publish. */
async function recordedHashes() {
  const hashes = new Map();
  for (const folder of ['assets', 'references']) {
    hashes.set(`${folder}/manifest.json`, null);
    for (const asset of await readJson(`public/${folder}/manifest.json`)) hashes.set(`${folder}/${asset.file}`, asset.sha256);
  }
  return { assets: hashes, fonts: new Set((await readJson('fonts/manifest.json')).map((font) => font.sha256)) };
}

/**
 * The _astro/ files the pages really load: resources named by page elements (stylesheets, module scripts, island component
 * and renderer URLs), the imports of the pages' inline module scripts, and, from there, every bundle's imports and CSS url().
 * A path that only appears in text, such as a code example, loads nothing.
 */
async function pageBundles(pages) {
  const found = new Set();
  const queue = [];
  const reach = (value, from) => {
    let target;
    try { target = new URL(value, from); } catch { return; }
    const file = target.href.startsWith(ASTRO.href) ? `_astro/${target.pathname.slice(ASTRO.pathname.length)}` : undefined;
    if (file && !found.has(file)) { found.add(file); queue.push(file); }
  };
  for (const page of pages) {
    const at = servedAt(page);
    for (const element of elements(await readDist(page, 'utf8').catch(() => ''))) {
      for (const [name, value] of element.attrs) {
        if ((element.name === 'script' && name === 'src') || (element.name === 'link' && name === 'href') || ['component-url', 'renderer-url', 'before-hydration-url'].includes(name)) reach(value, at);
      }
      if (element.name === 'script' && element.body) for (const specifier of jsImports(element.body)) reach(specifier, at);
    }
  }
  while (queue.length) {
    const file = queue.shift();
    const text = /\.(m?js|css)$/.test(file) ? await readDist(file, 'utf8').catch(() => '') : '';
    for (const value of file.endsWith('.css') ? cssUrls(text) : jsImports(text)) reach(value, new URL(file, SITE));
  }
  return found;
}

test('the build publishes only pages, their bundles, recorded assets and fonts, the generated downloads and the licenses', async () => {
  const pages = new Set((await listFiles(new URL('site/pages/', root))).filter((file) => file.endsWith('.astro')).map(pageOutput));
  const bundles = await pageBundles(pages);
  const { assets, fonts } = await recordedHashes();
  const exact = new Map([...await copied('downloads'), ...await copied('licenses')]);
  // Astro's own favicon is allowed only as the exact file the site supplies in public/ (there is none today).
  for (const favicon of ['favicon.svg', 'favicon.ico']) {
    const bytes = await readFile(new URL(`public/${favicon}`, root)).catch(() => null);
    if (bytes) exact.set(favicon, bytes);
  }
  const problems = [];
  const files = await distFiles();
  for (const file of files) {
    if (!(await lstat(join(distPath, file))).isFile()) { problems.push(`${file}: not a regular file`); continue; }
    const bytes = await readDist(file);
    if (FONT.test(file)) { if (!fonts.has(sha256(bytes))) problems.push(`${file}: font not recorded in fonts/manifest.json`); }
    else if (pages.has(file)) continue;
    else if (/^_astro\/[^/]+\.(js|css)$/.test(file)) { if (!bundles.has(file)) problems.push(`${file}: a bundle no page loads`); }
    else if (assets.has(file)) { if (assets.get(file) !== null && assets.get(file) !== sha256(bytes)) problems.push(`${file}: differs from its manifest sha256`); }
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
  const { assets, fonts } = await recordedHashes();
  const recorded = new Set([...assets.values(), ...fonts].filter(Boolean));
  const problems = [];
  let scanned = 0;
  for (const file of await distFiles()) {
    const bytes = await readDist(file);
    // Only an image or font whose bytes match its manifest sha256 is binary and skipped; every other file is read as text,
    // whatever its name or extension.
    if (BINARY.test(file) && recorded.has(sha256(bytes))) continue;
    scanned += 1;
    const text = bytes.toString('utf8');
    for (const [rule, pattern] of RULES) if (pattern.test(text)) problems.push(`${file}: ${rule}`);
  }
  assert.ok(scanned > 0);
  assert.deepEqual(problems, []);
});
