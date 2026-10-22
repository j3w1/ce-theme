import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readSources } from './tokens.mjs';

const check = process.argv.includes('--check');
const { manifest, tokens } = await readSources();
const css = `/* Casa Elida ${manifest.version} — generated from tokens/. Do not edit. */\n:root {\n${Object.values(tokens).map((t) => `  ${t.variable}: ${t.css};`).join('\n')}\n}\n`;
const resolved = JSON.stringify({ version: manifest.version, theme: manifest.theme, tokens }, null, 2) + '\n';
const recipes = await readFile(new URL('../recipes/recipes.css', import.meta.url), 'utf8');
const price = await readFile(new URL('../recipes/price.mjs', import.meta.url), 'utf8');
const usage = await readFile(new URL('../docs/usage.md', import.meta.url), 'utf8');
const outputs = new Map([
  ['exports/tokens.css', css], ['exports/tokens.resolved.json', resolved], ['exports/recipes.css', recipes],
  ['public/downloads/tokens.css', css], ['public/downloads/tokens.resolved.json', resolved],
  ['public/downloads/recipes.css', recipes], ['public/downloads/price.mjs', price],
  ['public/downloads/ce-theme.json', JSON.stringify(manifest, null, 2) + '\n'],
  ['public/downloads/usage.md', usage],
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
console.log(`${check ? 'Checked' : 'Generated'} ${outputs.size} exports from ${Object.keys(tokens).length} tokens.`);
