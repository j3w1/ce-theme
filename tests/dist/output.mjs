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
 * The start tags of built HTML with their decoded attributes, and the body of each script and style element. Text, comments
 * and the bodies of textarea and title elements are not markup, so a consumer example such as
 * `<code>&lt;link href="/styles/tokens.css"&gt;</code>` or a `data-copy` snippet is never read as a URL of this site.
 */
export function* elements(html) {
  const markup = /<!--[\s\S]*?-->|<(script|style|textarea|title)\b((?:"[^"]*"|'[^']*'|[^>"'])*)>([\s\S]*?)<\/\1\s*>|<([a-z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi;
  for (const [all, raw, rawAttrs, body, name, attrs] of html.matchAll(markup)) {
    if (all.startsWith('<!--')) continue;
    const list = [...(rawAttrs ?? attrs).matchAll(/([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)]
      .map(([, attr, double, single, bare]) => [attr.toLowerCase(), decode(double ?? single ?? bare ?? '')]);
    const tag = (raw ?? name).toLowerCase();
    yield { name: tag, attrs: list, body: tag === 'script' || tag === 'style' ? body : undefined };
  }
}

/**
 * The URL of every CSS url() reference. A small tokenizer after CSS Syntax: comments and strings are not URLs, the function
 * name is case-insensitive and may be written with escapes (u\72l), and escapes in the URL itself are decoded.
 */
export function cssUrls(css) {
  const urls = [];
  let i = 0;
  const escape = () => { // css[i] is a backslash; returns the escaped character and moves past it.
    const digits = css.slice(i + 1, i + 7).match(/^[\da-f]+/i)?.[0];
    if (!digits) { i += 2; return css[i - 1] ?? ''; }
    i += 1 + digits.length;
    if (/\s/.test(css[i] ?? '')) i += 1;
    return String.fromCodePoint(Math.min(parseInt(digits, 16), 0x10ffff) || 0xfffd);
  };
  const string = (quote) => {
    let value = '';
    for (i += 1; i < css.length && css[i] !== quote && css[i] !== '\n';) {
      if (css[i] === '\\') { if (css[i + 1] === '\n') i += 2; else value += escape(); } else value += css[i++];
    }
    i += 1;
    return value;
  };
  const nameChar = (c) => /[\w-]/.test(c) || c > '\x7f' || c === '\\';
  while (i < css.length) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') { const end = css.indexOf('*/', i + 2); i = end < 0 ? css.length : end + 2; continue; }
    if (c === '"' || c === "'") { string(c); continue; }
    if (!nameChar(c)) { i += 1; continue; }
    let name = '';
    while (i < css.length && nameChar(css[i])) name += css[i] === '\\' ? escape() : css[i++];
    if (css[i] !== '(' || name.toLowerCase() !== 'url') continue;
    for (i += 1; /\s/.test(css[i] ?? '');) i += 1;
    if (css[i] === '"' || css[i] === "'") { urls.push(string(css[i])); continue; }
    let value = '';
    while (i < css.length && css[i] !== ')') value += css[i] === '\\' ? escape() : css[i++];
    urls.push(value.trim());
  }
  return urls;
}

/** The specifiers of static, side-effect and dynamic imports with a literal string: from"./a.js", import"./b.js", import("./c.js"). */
export const jsImports = (js) => [...js.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(["'`])([^"'`\n]+)\1/g)].map((match) => match[2]);

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

/**
 * The destinations of Markdown links and images, after CommonMark: an inline destination is <…> or a run without spaces whose
 * parentheses balance, with backslash escapes; reference definitions are [label]: destination. Code is removed first.
 */
export function markdownLinks(markdown) {
  const text = markdown.replace(/^ {0,3}(```|~~~)[\s\S]*?^ {0,3}\1/gm, '').replace(/(`+)[^`\n][\s\S]*?\1/g, '');
  const links = [];
  for (let at = text.indexOf(']('); at >= 0; at = text.indexOf('](', at + 2)) {
    let i = at + 2;
    while (/[ \t\n]/.test(text[i] ?? '')) i += 1;
    let destination = '';
    if (text[i] === '<') {
      const end = text.indexOf('>', i);
      if (end < 0) continue;
      destination = text.slice(i + 1, end).replace(/\\(.)/g, '$1');
    } else {
      for (let depth = 0; i < text.length; i += 1) {
        const c = text[i];
        if (c === '\\' && i + 1 < text.length) { destination += text[++i]; continue; }
        if (/\s/.test(c) || (c === ')' && depth === 0)) break;
        if (c === '(') depth += 1;
        if (c === ')') depth -= 1;
        destination += c;
      }
    }
    if (destination) links.push(destination);
  }
  for (const [, angle, bare] of text.matchAll(/^ {0,3}\[[^\]\n]+\]:[ \t]*\n?[ \t]*(?:<([^>\n]*)>|(\S+))/gm)) links.push(angle ?? bare);
  return links;
}
