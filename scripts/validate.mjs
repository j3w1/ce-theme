import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readSources, contrast } from './tokens.mjs';
import { RECIPE_SOURCES } from './sources.mjs';

const root = new URL('../', import.meta.url);
const { manifest, tokens } = await readSources();
for (const [fg, bg, minimum] of manifest.contrastPairs) {
  if (tokens[fg]?.type !== 'color' || tokens[bg]?.type !== 'color') throw new Error(`Invalid contrast pair: ${fg}, ${bg}`);
  const ratio = contrast(tokens[fg].value, tokens[bg].value);
  if (ratio < minimum) throw new Error(`Contrast ${fg} on ${bg}: ${ratio.toFixed(2)} < ${minimum}`);
}
const recipes = await Promise.all(RECIPE_SOURCES.map((path) => readFile(new URL(path, root), 'utf8')));
const site = await readFile(new URL('site/styles/site.css', root), 'utf8');
const shareCard = await readFile(new URL('recipes/share-card.css', root), 'utf8');
const printLabel = await readFile(new URL('recipes/print-label.css', root), 'utf8');
const variables = new Set(Object.values(tokens).map((token) => token.variable));
// Component inputs set by consumers on an element; documented with each component.
const componentInputs = ['--ce-x', '--ce-y', '--ce-line', '--ce-size', '--ce-product-text', '--ce-campaign-surface', '--ce-campaign-text', '--ce-columns', '--ce-control', '--ce-row', '--ce-cell-pad'];
componentInputs.forEach((name) => variables.add(name));
for (const css of [...recipes, site, shareCard, printLabel]) {
  for (const [, variable] of css.matchAll(/var\((--ce-[\w-]+)/g)) {
    if (!variables.has(variable)) throw new Error(`Unresolved CSS variable: ${variable}`);
  }
  if (/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i.test(css)) throw new Error('Use color tokens instead of literal CSS colors.');
}
const assets = [];
for (const folder of ['public/assets/', 'public/references/']) {
  const entries = JSON.parse(await readFile(new URL(`${folder}manifest.json`, root), 'utf8'));
  const role = folder.includes('references') ? 'reference' : 'production';
  const listed = new Set();
  for (const asset of entries) {
    if (!asset.source || !asset.rights || !asset.originalName || asset.role !== role || !/^[a-z0-9][a-z0-9.-]*$/.test(asset.file)) throw new Error(`Invalid asset provenance: ${folder}${asset.file}`);
    if (listed.has(asset.file)) throw new Error(`Duplicate asset: ${asset.file}`);
    listed.add(asset.file);
    const bytes = await readFile(new URL(`${folder}${asset.file}`, root));
    if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error(`Asset hash changed: ${folder}${asset.file}`);
  }
  for (const file of await readdir(new URL(folder, root))) {
    if (file !== 'manifest.json' && !listed.has(file)) throw new Error(`Unrecorded asset: ${folder}${file}`);
  }
  assets.push(...entries);
}
const fonts = JSON.parse(await readFile(new URL('fonts/manifest.json', root), 'utf8'));
for (const font of fonts) {
  if (!font.source || !font.license || !font.version) throw new Error(`Invalid font provenance: ${font.file}`);
  const bytes = await readFile(new URL(`fonts/${font.file}`, root));
  if (createHash('sha256').update(bytes).digest('hex') !== font.sha256) throw new Error(`Font hash changed: ${font.file}`);
}
for (const file of await readdir(new URL('fonts/inter/', root))) {
  if (file.endsWith('.woff2') && !fonts.some((font) => font.file === `inter/${file}`)) throw new Error(`Unrecorded font: ${file}`);
}
// The retail reference used for design research is kept out of this public repository by name.
const withheld = new RegExp(String.fromCharCode(105, 107, 101, 97), 'i');
for (const file of execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).split('\n')) {
  if (!file || /\.(png|jpe?g|webp|woff2?|ttf|otf|eot|ico|zip)$/i.test(file) || file === 'pnpm-lock.yaml') continue;
  const text = await readFile(new URL(file, root), 'utf8').catch(() => '');
  if (withheld.test(text) || withheld.test(file)) throw new Error(`Retail reference named in a public file: ${file}`);
}
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (pkg.version !== manifest.version) throw new Error('Package and theme versions differ.');
console.log(`Validated ${Object.keys(tokens).length} tokens, ${manifest.contrastPairs.length} contrast pairs, CSS references, ${assets.length} asset hashes, and ${fonts.length} font hashes.`);
