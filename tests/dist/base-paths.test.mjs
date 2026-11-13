// GitHub Pages serves the site under /ce-theme/. Every URL the built site emits must resolve under that base, to a regular
// file that exists in dist/: a root-absolute URL outside the base would 404. Adapted from the theme repository's dist
// base-path test, with its exceptions: fragment-only links (#contenido), external links and mailto: links.
import test from 'node:test';
import assert from 'node:assert/strict';
import { lstat } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { SITE, cssUrls, distFiles, distPath, elements, markdownLinks, readDist, servedAt, srcsetUrls } from './output.mjs';

const URL_ATTRIBUTES = new Set(['href', 'src', 'action', 'poster', 'component-url', 'renderer-url', 'before-hydration-url']);

/**
 * Why `value`, found in a file served at `page`, is not a valid reference; undefined when it is. The reason is a fixed
 * category: no part of the URL is repeated, so a credential in a broken link never reaches a test log.
 */
async function problem(value, page) {
  const raw = value.trim();
  if (raw === '' || raw.startsWith('#') || /^mailto:/i.test(raw)) return undefined;
  if (/^data:/i.test(raw)) return 'is a data: URI';
  let target;
  try { target = new URL(raw, page); } catch { return 'is not a valid URL'; }
  if (!/^https?:$/.test(target.protocol)) return 'uses a scheme other than http or https';
  if (target.host !== SITE.host) return undefined;
  if (!target.pathname.startsWith(SITE.pathname)) return `resolves outside ${SITE.pathname}`;
  let path;
  try { path = decodeURIComponent(target.pathname.slice(SITE.pathname.length)); } catch { return 'has a malformed percent escape'; }
  const inside = posix.normalize(path === '' ? '.' : path);
  if (inside === '..' || inside.startsWith('../') || posix.isAbsolute(inside) || path.includes('\0')) return 'leaves dist/';
  const file = path === '' || path.endsWith('/') ? posix.join(inside, 'index.html') : inside;
  const entry = await lstat(join(distPath, file)).catch(() => null);
  return entry?.isFile() ? undefined : 'does not resolve to a built file';
}

/** Collects problems as "file: where #n reason", numbering the URL-bearing values of each file so a failure can be found. */
function collector() {
  const problems = [];
  const counts = new Map();
  const check = async (file, where, value) => {
    const n = (counts.get(file) ?? 0) + 1;
    counts.set(file, n);
    const why = await problem(value, servedAt(file));
    if (why) problems.push(`${file}: ${where} (URL #${n} in this file) ${why}`);
  };
  return { problems, check };
}

test('every href, src, srcset, action and CSS url() in the built HTML and CSS resolves under the base to a built file', async () => {
  const { problems, check } = collector();
  const files = await distFiles();
  for (const file of files.filter((name) => name.endsWith('.html'))) {
    for (const element of elements(await readDist(file, 'utf8'))) {
      for (const [name, value] of element.attrs) {
        if (URL_ATTRIBUTES.has(name)) await check(file, `<${element.name} ${name}>`, value);
        if (name === 'srcset') for (const candidate of srcsetUrls(value)) await check(file, `<${element.name} srcset>`, candidate);
        if (name === 'style') for (const ref of cssUrls(value)) await check(file, `<${element.name} style> url()`, ref);
        if (element.name === 'meta' && name === 'content' && /^(https?:\/\/|\/)/.test(value)) await check(file, '<meta content>', value);
      }
      if (element.name === 'style') for (const ref of cssUrls(element.body)) await check(file, '<style> url()', ref);
    }
  }
  for (const file of files.filter((name) => name.endsWith('.css'))) {
    for (const ref of cssUrls(await readDist(file, 'utf8'))) await check(file, 'url()', ref);
  }
  assert.deepEqual(problems, []);
});

test('every relative link in the generated Markdown downloads resolves to a file in the build', async () => {
  const { problems, check } = collector();
  const files = (await distFiles()).filter((name) => name.startsWith('downloads/') && name.endsWith('.md'));
  assert.ok(files.length > 0, 'the build publishes the Markdown downloads');
  for (const file of files) {
    for (const link of markdownLinks(await readDist(file, 'utf8'))) await check(file, 'a link', link.trim().replace(/ /g, '%20'));
  }
  assert.deepEqual(problems, []);
});
