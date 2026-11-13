import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { packageFiles } from '../scripts/package.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

// The offline half of the package checks; `pnpm test:consumer` packs the package and proves it in a clean install.
test('@casaelida/vue exports its styles as a side effect, keeps Vue a peer and stays private', async () => {
  const pkg = JSON.parse(await read('packages/vue/package.json'));
  assert.equal(pkg.private, true);
  assert.equal(pkg.exports['./styles.css'], './dist/styles.css');
  assert.deepEqual(pkg.sideEffects, ['./dist/styles.css']);
  assert.deepEqual(pkg.files, ['dist', 'NOTICE']);
  assert.deepEqual(pkg.peerDependencies, { vue: '^3.5.0' });
  assert.equal(pkg.dependencies, undefined);
  assert.match(await read('packages/vue/NOTICE'), /The Casa Elida name, logo and brand assets are not licensed by this package/);
  assert.doesNotMatch(await read('packages/vue/README.md'), /still an owner decision/);
});

test('styles.css is built from the tokens, recipes and fonts, with font URLs inside the package', async () => {
  const files = await packageFiles();
  const css = files.get('styles.css');
  assert.ok(css.includes(await read('exports/tokens.css')), 'holds the tokens');
  assert.ok(css.includes(await read('exports/recipes.css')), 'holds the recipes');
  assert.equal(css.match(/@font-face/g).length, 4);
  assert.doesNotMatch(css, /url\("(?!\.\/fonts\/)/);
  for (const font of JSON.parse(await read('fonts/manifest.json'))) {
    const name = font.file.split('/').pop();
    assert.match(css, new RegExp(`url\\("\\./fonts/${name}"\\) format\\("woff2"\\); font-weight: ${font.weight};`));
    assert.equal(createHash('sha256').update(files.get(`fonts/${name}`)).digest('hex'), font.sha256, name);
  }
  assert.equal(String(files.get('fonts/OFL.txt')), await read('fonts/inter/OFL.txt'));
});
