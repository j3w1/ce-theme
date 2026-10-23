import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { readSources, contrast } from './tokens.mjs';

const root = new URL('../', import.meta.url);
const { manifest, tokens } = await readSources();
for (const [fg, bg, minimum] of manifest.contrastPairs) {
  if (tokens[fg]?.type !== 'color' || tokens[bg]?.type !== 'color') throw new Error(`Invalid contrast pair: ${fg}, ${bg}`);
  const ratio = contrast(tokens[fg].value, tokens[bg].value);
  if (ratio < minimum) throw new Error(`Contrast ${fg} on ${bg}: ${ratio.toFixed(2)} < ${minimum}`);
}
const recipe = await readFile(new URL('recipes/recipes.css', root), 'utf8');
const site = await readFile(new URL('site/styles/site.css', root), 'utf8');
const shareCard = await readFile(new URL('recipes/share-card.css', root), 'utf8');
const variables = new Set(Object.values(tokens).map((token) => token.variable));
for (const css of [recipe, site, shareCard]) {
  for (const [, variable] of css.matchAll(/var\((--ce-[\w-]+)/g)) {
    if (!variables.has(variable)) throw new Error(`Unresolved CSS variable: ${variable}`);
  }
  if (/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i.test(css)) throw new Error('Use color tokens instead of literal CSS colors.');
}
const assets = JSON.parse(await readFile(new URL('public/assets/manifest.json', root), 'utf8'));
const listed = new Set();
for (const asset of assets) {
  if (!asset.source || !asset.rights || !/^[a-z0-9][a-z0-9.-]*$/.test(asset.file)) throw new Error('Invalid asset provenance.');
  if (listed.has(asset.file)) throw new Error(`Duplicate asset: ${asset.file}`);
  listed.add(asset.file);
  const bytes = await readFile(new URL(`public/assets/${asset.file}`, root));
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error(`Asset hash changed: ${asset.file}`);
}
for (const file of await readdir(new URL('public/assets/', root))) {
  if (file !== 'manifest.json' && !listed.has(file)) throw new Error(`Unrecorded asset: ${file}`);
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
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (pkg.version !== manifest.version) throw new Error('Package and theme versions differ.');
console.log(`Validated ${Object.keys(tokens).length} tokens, ${manifest.contrastPairs.length} contrast pairs, CSS references, ${assets.length} asset hashes, and ${fonts.length} font hashes.`);
