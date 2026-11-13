import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { readRecipes } from '../scripts/sources.mjs';
import { nameById } from '../recipes/names.mjs';

// CR-03: the demonstration cue. The recipe is appearance only; the words belong to the consumer, and CE Theme's own
// examples use the design canon's exact wording.
const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const CANON = 'Demostración — datos y operaciones simulados';

const cueRules = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]*ce-demo-cue[^{}]*)\{([^}]*)\}/g)]
  .map(([, selector, body]) => ({ selector: selector.trim(), body: body.trim() }));

test('the canon wording uses an em dash (U+2014)', () => {
  assert.equal(CANON.normalize('NFC'), CANON);
  assert.equal([...CANON].filter((ch) => ch === '—').length, 1);
  assert.doesNotMatch(CANON, /[–-]/);
});

test('ce-demo-cue is one block recipe from tokens only: no literal text, no raw colour, no modifier, no hiding', async () => {
  const sources = await readRecipes();
  const optIn = await read('recipes/share-card.css') + await read('recipes/print-label.css');
  assert.deepEqual(cueRules(optIn), []);
  const rules = cueRules(sources);
  assert.deepEqual(rules.map((rule) => rule.selector), ['.ce-demo-cue'], 'one rule, no modifiers, parts or pseudo-elements');
  assert.deepEqual(cueRules(await read('exports/recipes.css')), rules, 'the generated recipes ship the same rule');
  const declarations = Object.fromEntries(rules[0].body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
    const at = d.indexOf(':');
    return [d.slice(0, at).trim(), d.slice(at + 1).trim()];
  }));
  assert.ok(!('content' in declarations), 'the recipe holds no text');
  for (const [property, value] of Object.entries(declarations)) {
    // Every value is a --ce- token or a plain keyword; nothing is left for a raw colour or a raw length.
    const rest = value.replace(/var\(--ce-[\w-]+\)/g, '').trim();
    assert.match(rest, /^(|0|100%|flex|fit-content|center|solid|anywhere)$/, `${property}: ${value}`);
    assert.doesNotMatch(value, /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i, `${property}: ${value}`);
    for (const [, token] of value.matchAll(/var\((--ce-[\w-]+)\)/g)) {
      if (/color|border/.test(property) && token.startsWith('--ce-color-')) assert.equal(token, '--ce-color-text-primary', property);
    }
  }
  assert.equal(declarations.border, 'var(--ce-stroke-focus) solid var(--ce-color-text-primary)', 'the 2px border reuses the focus stroke');
  assert.equal(declarations.color, 'var(--ce-color-text-primary)');
  assert.equal(declarations.display, 'flex', 'shown as a block, never hidden by the recipe');
  for (const property of ['visibility', 'opacity', 'clip', 'clip-path', 'background', 'background-color']) assert.ok(!(property in declarations), property);
  assert.doesNotMatch((sources + optIn).replace(/\/\*[\s\S]*?\*\//g, ''), /Demostraci|simulad/i, 'the words stay with the consumer');
});

test('DemoCue is a registry name with a card and no Vue component', async () => {
  const entry = nameById('DemoCue');
  assert.ok(entry);
  assert.equal(entry.es, 'Aviso de demostración');
  assert.equal(entry.group, 'Retroalimentación');
  assert.deepEqual(entry.recipe, ['ce-demo-cue']);
  assert.ok(!('vue' in entry), 'no Vue component renders the cue');
  for (const file of await readdir(new URL('packages/vue/src/', root), { recursive: true })) {
    if (/\.(vue|ts)$/.test(file)) assert.doesNotMatch(await read(`packages/vue/src/${file}`), /demo-cue/i, file);
  }
  const card = 'exports/design-system/project/components/DemoCue/';
  assert.match((await read(`${card}preview.html`)).split('\n')[0], /^<!-- @dsCard group="Feedback" height=\d+ -->$/);
  assert.ok((await read(`${card}README.md`)).startsWith('# DemoCue\n'));
  assert.match(await read('exports/design-system/project/components/bundle.js'), /\{"name":"DemoCue"\}/);
  assert.match(await read('docs/names.md'), /## Demonstration cue[\s\S]*role="note"[\s\S]*## Registry/);
});

test('every shipped cue example says exactly the canon wording, as a note', async () => {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
    .split('\n').filter((file) => /\.(html|md|mjs|astro|vue|ts)$/.test(file));
  const seen = new Set();
  for (const file of files) {
    const text = await read(file).catch(() => '');
    const tags = [...text.matchAll(/<(\w+)\b([^>]*\bclass="[^"]*\bce-demo-cue\b[^"]*"[^>]*)>([\s\S]*?)<\/\1>/g)];
    assert.equal(tags.length, (text.match(/class="[^"]*\bce-demo-cue\b/g) ?? []).length, `${file}: every cue is a closed element`);
    for (const [, , attributes, words] of tags) {
      assert.match(attributes, /\brole="note"/, `${file}: role="note"`);
      assert.doesNotMatch(attributes, /\b(hidden|aria-hidden)\b|style="/, `${file}: never hidden or restyled`);
      assert.equal(words, CANON, `${file}: canon wording`);
      seen.add(file);
    }
  }
  for (const file of ['recipes/names.mjs', 'docs/names.md', 'design-system/components/DemoCue/preview.html', 'exports/design-system/project/components/DemoCue/preview.html', 'exports/design-system/project/components/StandardNamesFeedback/preview.html']) {
    assert.ok(seen.has(file), `${file} shows the cue`);
  }
});
