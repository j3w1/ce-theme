// Shared by the post-build tests: they read dist/ exactly as `astro build` left it, the tree CI uploads to GitHub Pages.
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../../astro.config.mjs';

export const root = new URL('../../', import.meta.url);
export const dist = new URL('dist/', root);
export const distPath = fileURLToPath(dist);
/** The published site, https://j3w1.github.io/ce-theme/. Every internal URL must stay under it. */
export const SITE = new URL(config.base, config.site);

/**
 * Every entry below a directory URL that is not a directory, as a sorted path relative to it with "/". Symbolic links and
 * other special entries are listed too (a linked directory is not followed), so a check rejects them instead of missing them.
 */
export async function listFiles(directory) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true }).catch(() => []);
  return entries.filter((entry) => !entry.isDirectory()).map((entry) => relative(fileURLToPath(directory), join(entry.parentPath, entry.name)).split(sep).join('/')).sort();
}

/** Every entry in dist/. */
export async function distFiles() {
  const files = await listFiles(dist);
  if (files.length === 0) throw new Error('dist/ is empty: run pnpm build first.');
  return files;
}

export const readDist = (file, encoding) => readFile(join(distPath, file), encoding);

/** The URL a built file is served at: dist/fundamentos/index.html is https://j3w1.github.io/ce-theme/fundamentos/. */
export const servedAt = (file) => new URL(file.replace(/(^|\/)index\.html$/, '$1'), SITE);

const entity = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
const decode = (value) => value.replace(/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi, (all, dec, hex, name) => (dec ? String.fromCodePoint(+dec) : hex ? String.fromCodePoint(parseInt(hex, 16)) : entity[name] ?? all));

/**
 * The start tags of built HTML with their decoded attributes, and the text of each <style> element. Text, comments and the
 * bodies of script, style, textarea and title elements are not markup, so a consumer example such as
 * `<code>&lt;link href="/styles/tokens.css"&gt;</code>` or a `data-copy` snippet is never read as a URL of this site.
 */
export function* elements(html) {
  const markup = /<!--[\s\S]*?-->|<(script|style|textarea|title)\b((?:"[^"]*"|'[^']*'|[^>"'])*)>([\s\S]*?)<\/\1\s*>|<([a-z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi;
  for (const [all, raw, rawAttrs, body, name, attrs] of html.matchAll(markup)) {
    if (all.startsWith('<!--')) continue;
    const list = [...(rawAttrs ?? attrs).matchAll(/([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)]
      .map(([, attr, double, single, bare]) => [attr.toLowerCase(), decode(double ?? single ?? bare ?? '')]);
    yield { name: (raw ?? name).toLowerCase(), attrs: list, style: raw?.toLowerCase() === 'style' ? body : undefined };
  }
}

/** The values of CSS url() references, outside comments. CSS function names are case-insensitive. */
export const cssUrls = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\burl\(\s*(["']?)(.*?)\1\s*\)/gi)].map((match) => match[2]);

/** The URL of each srcset candidate. A URL may contain commas; one at its end, or after its descriptors, ends the candidate. */
export function srcsetUrls(value) {
  const urls = [];
  let rest = value;
  for (;;) {
    rest = rest.replace(/^[\s,]+/, '');
    if (rest === '') return urls;
    const [candidate] = rest.match(/^\S+/);
    rest = rest.slice(candidate.length);
    urls.push(candidate.replace(/,+$/, ''));
    if (!candidate.endsWith(',')) rest = rest.replace(/^[^,]*,?/, '');
  }
}
