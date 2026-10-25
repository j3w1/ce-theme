import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { readSources } from '../scripts/tokens.mjs';
import { readRecipes } from '../scripts/sources.mjs';

const root = new URL('../', import.meta.url);
const project = new URL('exports/design-system/project/', root);
const read = (path) => readFile(new URL(path, project), 'utf8');
const NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;

test('design-system tokens use the list shape with valid, unique names and resolvable aliases', async () => {
  const ds = JSON.parse(await read('tokens.json'));
  const names = new Set();
  for (const [family, value] of Object.entries(ds)) {
    if (['name', 'version', 'meta', 'type'].includes(family)) continue;
    assert.ok(Array.isArray(value.tokens), `${family} must be a token list`);
    assert.ok(value.tokens.length <= (family === 'color' ? 600 : 60), `${family} has too many tokens`);
    for (const token of value.tokens) {
      assert.match(token.name, NAME);
      assert.ok(!names.has(token.name), `duplicate token ${token.name}`);
      names.add(token.name);
      assert.ok(token.usage, `${token.name} needs a usage note`);
      assert.equal(typeof token.value, 'string', `${token.name} value`);
      if (family !== 'color') assert.match(token.value, /^[A-Za-z0-9 #%(),./+_-]{1,200}$/, `${token.name} value`);
    }
  }
  const colors = new Set(ds.color.tokens.map((t) => t.name));
  for (const { name, value } of ds.color.tokens) {
    if (value.startsWith('{')) assert.ok(colors.has(value.slice(1, -1)) && value.slice(1, -1) !== name, `${name} alias`);
    else assert.match(value, /^(#[0-9a-f]{6}|rgba\(\d+, \d+, \d+, [\d.]+\))$/, `${name} color`);
  }
  assert.ok(ds.type.groups.flatMap((g) => g.styles).every((s) => NAME.test(s.name) && /^[\d.]+(px|rem)$/.test(s.fontSize)));
});

test('design-system CSS variables match the foundation exports exactly', async () => {
  const { tokens } = await readSources();
  const ds = await read('tokens.css');
  const declared = new Set([...ds.matchAll(/(--[\w-]+):/g)].map(([, name]) => name));
  for (const token of Object.values(tokens)) {
    if (token.type === 'fontFamily') continue; // bundle.css maps --ce-font-family to --font-sans
    assert.ok(declared.has(token.variable), `${token.variable} missing from design-system tokens.css`);
  }
  const bundle = await read('components/bundle.css');
  assert.ok(bundle.includes('--ce-font-family: var(--font-sans)'));
  const css = (path) => readFile(new URL(path, root), 'utf8');
  assert.ok(bundle.endsWith(await readRecipes() + await css('recipes/share-card.css') + await css('recipes/print-label.css')));
});

test('every component has guidelines and a marked live preview using only shipped media', async () => {
  const publish = JSON.parse(await readFile(new URL('exports/design-system/publish.json', root), 'utf8'));
  const components = await readdir(new URL('components/', project), { withFileTypes: true });
  for (const entry of components.filter((e) => e.isDirectory())) {
    const preview = await read(`components/${entry.name}/preview.html`);
    assert.match(preview.split('\n')[0], /^<!-- @dsCard (group="[A-Za-z ]+" )?height=\d+( width=\d+)?( subtitle="[^"]*")? -->$/, entry.name);
    assert.ok(preview.length < 256 * 1024);
    assert.doesNotMatch(preview, /<(iframe|object|embed|frame|noscript)\b/i);
    for (const [, src] of preview.matchAll(/src="([^"]+)"/g)) {
      assert.ok(publish.files[`project/${src.replace('../../', '')}`], `${entry.name} loads unpublished ${src}`);
    }
    if (entry.name !== 'Cover') assert.ok((await read(`components/${entry.name}/README.md`)).startsWith(`# ${entry.name}\n`));
  }
});

test('published binary sources exist and preview media fits the file cap', async () => {
  const publish = JSON.parse(await readFile(new URL('exports/design-system/publish.json', root), 'utf8'));
  for (const [path, source] of Object.entries(publish.files)) {
    const { size } = await stat(new URL(source, root));
    if (path.startsWith('project/media/')) assert.ok(size <= 512 * 1024, `${source} exceeds 512 KB`);
  }
  for (const group of publish.assetGroups) {
    assert.ok(await read(`assets/${group.name}/README.md`));
    for (const file of group.files) await stat(new URL(file.source, root));
  }
});
