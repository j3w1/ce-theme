import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { NAMES } from '../recipes/names.mjs';

// Every public Casa Elida Vue component is named CE + PascalCase (CEButton, CEDateRangePicker).
// CSS keeps its own convention: ce-* classes and --ce-* tokens.
const COMPONENT_NAME = /^CE[A-Z][A-Za-z0-9]*$/;
const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('component files are named CE + PascalCase', async () => {
  const files = (await readdir(new URL('packages/vue/src/components/', root))).filter((file) => file.endsWith('.vue'));
  assert.ok(files.length > 0);
  for (const file of files) assert.match(file.replace(/\.vue$/, ''), COMPONENT_NAME, `packages/vue/src/components/${file}`);
});

test('public exports are named CE + PascalCase and match their files', async () => {
  const index = await read('packages/vue/src/index.ts');
  const components = [...index.matchAll(/export \{ default as (\w+) \} from '\.\/components\/(\w+)\.vue';/g)];
  assert.ok(components.length > 0);
  for (const [, name, file] of components) {
    assert.match(name, COMPONENT_NAME, `export ${name}`);
    assert.equal(name, file, `export ${name} comes from ${file}.vue`);
  }
  const files = (await readdir(new URL('packages/vue/src/components/', root))).filter((file) => file.endsWith('.vue')).map((file) => file.replace(/\.vue$/, ''));
  assert.deepEqual(components.map(([, name]) => name).sort(), files.sort(), 'every component file is exported from src/index.ts');
  for (const [, name] of index.matchAll(/export type \{ (\w+) \}/g)) assert.match(name, /^CE[A-Z][A-Za-z0-9]*Props$/, `type ${name}`);
});

test('the names registry points only at real CE components', async () => {
  const index = await read('packages/vue/src/index.ts');
  for (const entry of NAMES.filter((item) => item.vue)) {
    assert.match(entry.vue, COMPONENT_NAME, entry.id);
    assert.ok(index.includes(`default as ${entry.vue} `), `${entry.id} → ${entry.vue} is exported`);
  }
});

test('no Ce-prefixed component names in code, docs or examples', async () => {
  const folders = ['packages/vue/src/', 'packages/vue/src/components/', 'packages/vue/test/', 'site/components/', 'site/pages/', 'site/layouts/', 'docs/'];
  const files = ['AGENTS.md', 'README.md', 'packages/vue/README.md', 'packages/vue/CONTRIBUTING.md', 'recipes/names.mjs'];
  for (const folder of folders) {
    for (const file of await readdir(new URL(folder, root), { recursive: true })) {
      if (/\.(vue|ts|mjs|astro|md)$/.test(file)) files.push(folder + file);
    }
  }
  for (const file of files) {
    // The rule itself names the wrong form as a counter-example: “never `CeButton`”.
    const text = (await read(file)).replace(/\b[Nn]ever\s+`Ce[A-Z][A-Za-z0-9]*`/g, '');
    const wrong = text.match(/\bCe[A-Z][A-Za-z0-9]*/g);
    assert.equal(wrong, null, `${file} uses ${wrong?.join(', ')}; public components are CE + PascalCase`);
  }
});
