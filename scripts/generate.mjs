import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSources } from './tokens.mjs';
import { buildDesignSystem } from './design-system.mjs';
import { readRecipes } from './sources.mjs';
import { vuetifyAdapter } from './adapters.mjs';

const check = process.argv.includes('--check');
const { manifest, tokens } = await readSources();
const css = `/* Casa Elida ${manifest.version} — generated from tokens/. Do not edit. */\n:root {\n${Object.values(tokens).map((t) => `  ${t.variable}: ${t.css};`).join('\n')}\n}\n`;
const resolved = JSON.stringify({ version: manifest.version, theme: manifest.theme, tokens }, null, 2) + '\n';
const recipes = await readRecipes();
const source = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const price = await source('recipes/price.mjs');
const usage = await source('docs/usage.md');
const fonts = await readFile(new URL('../recipes/fonts.css', import.meta.url), 'utf8');
const shareCard = await readFile(new URL('../recipes/share-card.css', import.meta.url), 'utf8');
const printLabel = await readFile(new URL('../recipes/print-label.css', import.meta.url), 'utf8');
const outputs = new Map([
  ['exports/tokens.css', css], ['exports/tokens.resolved.json', resolved], ['exports/recipes.css', recipes], ['exports/fonts.css', fonts], ['exports/share-card.css', shareCard], ['exports/print-label.css', printLabel],
  ['exports/adapters/vuetify.mjs', vuetifyAdapter(manifest, tokens)],
  ['public/downloads/tokens.css', css], ['public/downloads/tokens.resolved.json', resolved],
  ['public/downloads/recipes.css', recipes], ['public/downloads/price.mjs', price],
  ['public/downloads/ce-theme.json', JSON.stringify(manifest, null, 2) + '\n'],
  ['public/downloads/usage.md', usage],
  ['public/downloads/share-card.css', shareCard], ['public/downloads/print-label.css', printLabel],
  ...await Promise.all(['product.mjs', 'campaign.mjs', 'behaviors.mjs'].map(async (file) => [`public/downloads/${file}`, await source(`recipes/${file}`)])),
  ...await Promise.all(['apply-ce-theme.md', 'product-identity.md', 'pricing.md', 'sharing.md', 'coverage.md'].map(async (file) => [`public/downloads/${file}`, await source(`docs/${file}`)])),
  ...await buildDesignSystem(manifest, tokens),
]);
for (const [path, content] of outputs) {
  const file = new URL(`../${path}`, import.meta.url);
  if (check) {
    const actual = await readFile(file, 'utf8').catch(() => null);
    if (actual !== content) throw new Error(`Generated file is stale: ${path}. Run pnpm generate.`);
  } else {
    await mkdir(new URL('.', file), { recursive: true });
    await writeFile(file, content);
  }
}
// Generated folders hold only current outputs: the design-system bundle is published file by file and
// downloads are served as-is, so leftover files would be republished.
for (const dir of ['exports/design-system/project/', 'public/downloads/']) {
  const base = new URL(`../${dir}`, import.meta.url);
  for (const entry of await readdir(base, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = `${dir}${relative(fileURLToPath(base), `${entry.parentPath}/${entry.name}`)}`;
    if (outputs.has(path)) continue;
    if (check) throw new Error(`Stale generated file: ${path}. Run pnpm generate.`);
    await rm(new URL(`../${path}`, import.meta.url));
  }
}
console.log(`${check ? 'Checked' : 'Generated'} ${outputs.size} exports from ${Object.keys(tokens).length} tokens.`);
