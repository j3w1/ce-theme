// Builds the Claude Design System bundle in exports/design-system/ from the foundation sources.
// Text files are generated here; binary files (font, photos, logos) are listed in publish.json
// with their repository source paths so they are never duplicated in the repository.
import { readFile, readdir } from 'node:fs/promises';
import { posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { icons } from '../site/data/icons.mjs';
import { readRecipes } from './sources.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
export const OUT = 'exports/design-system';
const REPO_URL = 'https://github.com/j3w1/ce-theme/blob/main/';

// Supplied Inter files, recorded with provenance in fonts/manifest.json.
const FONTS = JSON.parse(await read('fonts/manifest.json')).map((font) => ({
  family: font.family, weight: String(font.weight), style: font.style,
  file: `fonts/${font.file.split('/').pop()}`, source: `fonts/${font.file}`,
}));

// Supplied assets as they appear in the design system's asset library.
// Production files come from public/assets/; reference-only files from public/references/.
const ASSET_GROUPS = [
  { name: 'Logos', tile: 'l', dir: 'public/assets/', files: ['logo-wordmark-color.png', 'logo-wordmark-black.png', 'logo-wordmark-white-yellow.png', 'logo-on-white.jpg', 'logo-on-yellow.jpg', 'logo-on-red.png', 'logo-matte-red.jpg', 'logo-matte-red-tagline.jpg', 'logo-square-red.jpg', 'logo-ce-radio.png', 'logo-ce-radio-navidad.png'] },
  { name: 'Products', tile: 'm', dir: 'public/assets/', files: ['product-mene.png', 'product-nome.png', 'product-tilen.png', 'product-talen.png'] },
  { name: 'References', tile: 'l', dir: 'public/references/', files: ['product-card-wilul.png', 'price-label-yellow-historical.png', 'price-label-white-historical.png', 'campaign-umbrella.jpg', 'campaign-organisers.jpg', 'campaign-kitchen.jpg', 'brand-tote-bag.png'] },
  { name: 'Icons', tile: 'xs', dir: null, files: Object.keys(icons).map((name) => `${name}.svg`) },
];
// Files that component previews load by relative path (each must stay under 512 KB).
const PREVIEW_MEDIA = ['product-mene.png', 'product-nome.png', 'product-tilen.png', 'logo-square-red.jpg', 'logo-wordmark-color.png', 'logo-wordmark-black.png', 'logo-wordmark-white-yellow.png', 'logo-ce-radio.png', 'logo-ce-radio-navidad.png'];

// Docs copied into the bundle as [bundle name, repository path].
const DOCS = [
  ['apply-ce-theme.md', 'docs/apply-ce-theme.md'], ['product-identity.md', 'docs/product-identity.md'],
  ['pricing.md', 'docs/pricing.md'], ['sharing.md', 'docs/sharing.md'], ['accessibility.md', 'docs/accessibility.md'],
  ['coverage.md', 'docs/coverage.md'], ['decisions.md', 'docs/decisions.md'], ['sources.md', 'docs/sources.md'],
  ['evolution.md', 'docs/evolution/2026-10-design-evolution.md'],
];

// Type styles. Values come from the font tokens; letter spacing and price sizes come from recipes.css and the site.
const TYPE_GROUPS = [
  { name: 'Display', styles: [
    ['signage', 'signage', 'tight', 'heavy', '-0.05em', 'S/18.5', 'In-store signage prices and one-word callouts read at distance.'],
    ['hero', 'hero', 'tight', 'bold', '-0.035em', 'Diseñamos para la vida en casa', 'Page and campaign heroes (h1). Scale between 36px and 64px with the viewport.'],
    ['display', 'display', 'tight', 'heavy', '-0.05em', 'Todo lo que hace casa.', 'Display statements and yellow promotional panels.'],
    ['heading', 'heading', 'heading', 'bold', '-0.035em', 'Precios y productos', 'Section headings (h2) and photo-panel titles.'],
    ['title', 'title', 'heading', 'bold', '-0.035em', 'Taza de vidrio resistente al calor', 'Card and subsection titles (h3).'],
  ] },
  { name: 'Text', styles: [
    ['lead', 'lead', 'body', 'regular', null, 'Una fotografía cuenta la historia. Una jerarquía clara muestra el producto.', 'Intro paragraphs below a page heading.'],
    ['body', 'body', 'body', 'regular', null, 'Taza de vidrio resistente al calor', 'Body copy and product names.'],
    ['small', 'sm', 'body', 'regular', null, 'Vidrio borosilicato, 250ml', 'Product details, field notes and captions, in color.text.muted.'],
    ['label', 'sm', 'heading', 'bold', null, 'Ver productos', 'Field labels, buttons, chips and product models (MENE).'],
    ['eyebrow', 'xs', 'body', 'bold', '0.1em', 'PRECIOS Y PRODUCTOS', 'Section eyebrows, always uppercase.'],
    ['badge', 'xs', 'heading', 'bold', null, 'Precio especial', 'Badges and fine print.'],
  ] },
  { name: 'Price', styles: [
    ['price-card', '44px', 1, 'heavy', '-0.045em', 'S/8.5', 'Product-card price amount; 36px below 640px. The S/ prefix is 46% of the amount.'],
    ['price-callout', '48px', 1, 'heavy', '-0.045em', 'S/14.5', 'Price inside a floating product callout.'],
    ['price-campaign', '96px', 1, 'heavy', '-0.045em', 'S/4.5', 'Largest price on photography; scale from 48px to 96px.'],
  ] },
];

const dsName = (path) => `ce-${path.replaceAll('.', '-')}`;

// Walk DTCG sources in file order, recording aliases that the resolved export flattens.
function walk(group, prefix, into) {
  for (const [name, value] of Object.entries(group)) {
    if (name.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${name}` : name;
    if ('$value' in value) into.push({ path, alias: typeof value.$value === 'string' ? value.$value.match(/^\{([^{}]+)\}$/)?.[1] : undefined });
    else walk(value, path, into);
  }
}

function colorValue({ value }) {
  const [r, g, b] = value.components.map((n) => Math.round(n * 255));
  if (value.alpha !== undefined && value.alpha < 1) return `rgba(${r}, ${g}, ${b}, ${value.alpha})`;
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

function familyOf(path) {
  if (path.startsWith('space.')) return 'spacing';
  if (path.startsWith('radius.')) return 'radius';
  if (path.startsWith('font.size.')) return 'fontSize';
  if (path.startsWith('font.weight.')) return 'fontWeight';
  if (path.startsWith('font.line.')) return 'lineHeight';
  if (path.startsWith('layout.')) return 'layout';
  if (path.startsWith('stroke.')) return 'stroke';
  if (path.startsWith('motion.')) return 'duration';
  if (path.startsWith('size.')) return 'size';
  if (path.startsWith('layer.')) return 'zIndex';
  if (path.startsWith('font.ratio.')) return 'ratio';
  throw new Error(`No design-system family for token: ${path}`);
}

export async function buildTokens(manifest, tokens) {
  const order = [];
  for (const source of manifest.tokenSources) walk(JSON.parse(await read(source)), '', order);
  const families = { spacing: [], radius: [], fontSize: [], fontWeight: [], lineHeight: [], layout: [], stroke: [], duration: [], size: [], zIndex: [], ratio: [] };
  const colors = [];
  let fontStack;
  for (const { path, alias } of order) {
    const token = tokens[path];
    if (!token.description) throw new Error(`Design-system tokens need a usage description: ${path}`);
    if (token.type === 'color') {
      colors.push({ name: dsName(path), value: alias ? `{${dsName(alias)}}` : colorValue(token), usage: token.description });
    } else if (token.type === 'fontFamily') {
      fontStack = token.css;
    } else {
      families[familyOf(path)].push({ name: dsName(path), value: token.css, usage: token.description });
    }
  }
  const length = (key) => tokens[`font.size.${key}`]?.css ?? key;
  const groups = TYPE_GROUPS.map(({ name, styles }) => ({
    name, family: 'sans',
    styles: styles.map(([style, size, line, weight, tracking, sample, usage]) => ({
      name: `ce-type-${style}`, fontSize: length(size),
      lineHeight: typeof line === 'number' ? line : tokens[`font.line.${line}`].value,
      fontWeight: tokens[`font.weight.${weight}`].value,
      ...(tracking ? { letterSpacing: tracking } : {}), sample, usage,
    })),
  }));
  return {
    name: manifest.name,
    version: 1,
    meta: {
      source: 'github', repo: 'j3w1/ce-theme', package: '.', foundation: manifest.version,
      paths: { tokens: manifest.tokenSources, fonts: FONTS.map((font) => font.source), assets: ['public/assets/', 'public/references/'], docs: ['design-system/', ...DOCS.map(([, path]) => path)] },
      generator: 'scripts/design-system.mjs',
    },
    color: { themes: [{ id: manifest.theme, name: 'Light' }], tokens: colors },
    type: {
      fonts: FONTS.map(({ family, file, weight, style }) => ({ family, file, weight, style })),
      families: { sans: fontStack },
      groups,
    },
    spacing: { tokens: families.spacing },
    radius: { tokens: families.radius },
    fontSize: { note: 'Font-size scale used by the recipes. Text styles above pair each size with its line height and weight.', tokens: families.fontSize },
    fontWeight: { tokens: families.fontWeight },
    lineHeight: { tokens: families.lineHeight },
    stroke: { tokens: families.stroke },
    layout: { note: 'Content width, breakpoints and side gutters.', tokens: families.layout },
    duration: { tokens: families.duration },
    size: { note: 'Control and row heights for touch, comfortable and compact density.', tokens: families.size },
    zIndex: { tokens: families.zIndex },
    ratio: { tokens: families.ratio },
  };
}

// Matches the layout the Design System page compiles from tokens.json.
export function compileTokensCss(ds) {
  const theme = ds.color.themes[0].id;
  const value = (v) => (v.startsWith('{') ? `var(--${v.slice(1, -1)})` : v);
  const others = ['spacing', 'radius', 'fontSize', 'fontWeight', 'lineHeight', 'stroke', 'layout', 'duration', 'size', 'zIndex', 'ratio'].flatMap((k) => ds[k].tokens);
  const font = ds.type.fonts.map((f) => `@font-face { font-family: "${f.family}"; src: url("${f.file}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; }`);
  const styles = ds.type.groups.flatMap((g) => g.styles.map((s) => `.${s.name} { font-family: var(--font-${s.family ?? g.family}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight};${s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : ''} }`));
  return [
    `/* ${ds.name} — generated from tokens.json */`,
    ...font,
    `:root, [data-theme="${theme}"] {`, ...ds.color.tokens.map((t) => `  --${t.name}: ${value(t.value)};`), '}',
    ':root {', ...others.map((t) => `  --${t.name}: ${t.value};`), ...Object.entries(ds.type.families).map(([k, v]) => `  --font-${k}: ${v};`), '}',
    ...styles, '',
  ].join('\n');
}

const iconSvg = (path) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>\n`;

async function listFiles(dir) {
  const entries = await readdir(new URL(dir, root), { withFileTypes: true, recursive: true });
  const base = fileURLToPath(new URL(dir, root));
  return entries.filter((e) => e.isFile()).map((e) => relative(base, `${e.parentPath ?? e.path}/${e.name}`).split(sep).join('/')).sort();
}

export async function buildDesignSystem(manifest, tokens) {
  const outputs = new Map();
  const put = (path, content) => outputs.set(`${OUT}/project/${path}`, content);
  const ds = await buildTokens(manifest, tokens);
  put('tokens.json', JSON.stringify(ds, null, 2) + '\n');
  put('tokens.css', compileTokensCss(ds));
  const recipes = await readRecipes() + await read('recipes/share-card.css') + await read('recipes/print-label.css');
  put('components/bundle.css', `/* ${manifest.name} ${manifest.version} — generated from the recipes/*.css sources. Do not edit. */\n/* The design system declares the font stack as --font-sans; the recipes read --ce-font-family. */\n:root { --ce-font-family: var(--font-sans); }\n${recipes}`);
  for (const file of await listFiles('design-system/')) put(file, await read(`design-system/${file}`));
  // Repository docs travel with the bundle; links to files outside it point at the repository.
  const bundled = new Map(DOCS.map(([name, path]) => [path, name]));
  const relink = (text, from) => text.replace(/\]\(([\w./-]+)(#[\w-]*)?\)/g, (match, target, hash = '') => {
    const path = posix.normalize(posix.join(posix.dirname(from), target));
    return `](${bundled.get(path) ?? `${REPO_URL}${path}`}${hash})`;
  });
  for (const [name, path] of DOCS) put(name, relink(await read(path), path));
  put('licenses/inter-OFL.txt', await read('fonts/inter/OFL.txt'));
  for (const [name, path] of Object.entries(icons)) put(`assets/Icons/${name}.svg`, iconSvg(path));

  // Binary files are published from their repository sources; uploads become the asset library.
  const source = (group, file) => (group.dir ? `${group.dir}${file}` : `${OUT}/project/assets/Icons/${file}`);
  const publish = {
    title: manifest.name,
    namespace: 'CasaElida',
    libraries: [],
    files: {
      ...Object.fromEntries(FONTS.map((font) => [`project/${font.file}`, font.source])),
      ...Object.fromEntries(PREVIEW_MEDIA.map((file) => [`project/media/${file}`, `public/assets/${file}`])),
    },
    assetGroups: ASSET_GROUPS.map((group) => ({ name: group.name, tile: group.tile, files: group.files.map((file) => ({ name: file, source: source(group, file) })) })),
  };
  outputs.set(`${OUT}/publish.json`, JSON.stringify(publish, null, 2) + '\n');
  return outputs;
}
