import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { NAMES } from '../recipes/names.mjs';
import { icons } from '../site/data/icons.mjs';

// CR-07, the shopping-action rule: the records, the registry and the recipe source that its browser checks
// (tests/browser/shopping-actions.spec.mjs) cannot see. Acceptance 5 in docs/change-requests/CR-07-shopping-action-rule.md.
const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const tracked = (...paths) => execFileSync('git', ['ls-files', '--', ...paths], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const row = (text, title) => text.split('\n').find((line) => line.split('|')[2]?.trim() === title);

test('decisions: the 2026-10-25 row stays, marked superseded for behaviour, and a new row carries the copy forward', async () => {
  const decisions = await read('docs/decisions.md');
  const old = row(decisions, 'Add to cart');
  assert.ok(old?.startsWith('| 2026-10-25 |'), 'the 2026-10-25 “Add to cart” row is kept');
  assert.match(old, /\*Behaviour superseded on 2026-11-13: see “Shopping actions \(CR-07\)”\. The copy “Añadir al carrito” stands/);
  const next = row(decisions, 'Shopping actions (CR-07)');
  assert.ok(next?.startsWith('| 2026-11-13 |'), 'the new row is dated 2026-11-13');
  for (const part of ['«Añadir al carrito»', '«carrito» everywhere', '`QuickAdd`', '`AddToCart`', '`size.target.public`', 'open pin card', 'no sticky-bar recipe', '`ce-product-add`', 'no opt-in variant']) assert.ok(next.includes(part), `the new row says ${part}`);
  // The source column keeps j3w1's own decisions apart from the lead's delegated selections.
  assert.match(next, /decided under j3w1's delegation \(msg 2026-11-13 12:35, Supervisor recommendation\), not j3w1-typed/);
  assert.match(next, /issuecomment-6844081160/);
  // Eligibility stays with the application or the service: the demonstration fixture gating is not a row of the shared ledger.
  assert.doesNotMatch(next, /R-17|quote pending|invalid quantity|sold-out|unknown availability/i);
});

test('names: QuickAdd is added, AddToCart is the product page action, and no bag name exists', async () => {
  const quick = NAMES.find((entry) => entry.id === 'QuickAdd');
  assert.equal(quick?.es, 'Añadir rápido');
  assert.equal(quick.group, 'Superficies');
  assert.deepEqual(quick.recipe, ['ce-icon-button--action']);
  const add = NAMES.find((entry) => entry.id === 'AddToCart');
  assert.equal(add?.es, 'Añadir al carrito');
  assert.deepEqual(add.recipe, ['ce-buy-actions']);
  assert.doesNotMatch(add.rule, /card|hover|full-width/i);
  for (const entry of NAMES) {
    assert.ok(!/bag/i.test(entry.id) && !(entry.aliases ?? []).some((alias) => /bag/i.test(alias)), `${entry.id} uses no bag name`);
    assert.doesNotMatch(entry.sample, /ce-product-add/, `${entry.id} sample draws no ce-product-add`);
  }
  const names = await read('docs/names.md');
  assert.match(names, /\| `QuickAdd` \| Añadir rápido \| `ce-icon-button--action` \|/);
  assert.match(names, /\| `AddToCart` \| Añadir al carrito \| `ce-buy-actions` \|/);
  assert.doesNotMatch(names.slice(names.indexOf('<!-- registry:start -->')), /AddToBag|`\w*Bag\w*`/, 'the registry has no bag name');
});

test('recipe: the deprecated ce-product-add stays hidden at every width and nothing shows it again', async () => {
  const retail = (await read('recipes/retail.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(retail, /^\.ce-product-add \{ display: none; \}$/m);
  assert.equal(retail.match(/ce-product-add/g).length, 1, 'no other rule names ce-product-add');
  assert.match(retail, /\.ce-product-row > \.ce-icon-button--action \{[^}]*width: var\(--ce-size-target-public\); min-height: var\(--ce-size-target-public\);/);
  assert.match(retail, /@media \(prefers-reduced-motion: reduce\) \{[^\n]*\.ce-product-row > \.ce-icon-button--action \{ transition: none; \}/);
});

test('previews and reference pages draw browse-first cards: no ce-product-add, no favourite on a card', async () => {
  // Markup only: the guidelines still name the deprecated class to say it is deprecated.
  for (const file of tracked('design-system/components', 'site').filter((path) => !path.endsWith('.md'))) {
    const text = await read(file);
    assert.doesNotMatch(text, /ce-product-add/, `${file} still draws the deprecated ce-product-add`);
  }
  for (const file of ['site/components/ProductCard.astro', 'design-system/components/ProductCard/preview.html']) assert.doesNotMatch(await read(file), /favoritos|heart/, `${file} has no favourite on the card`);
});

test('the cart is «carrito» and cart in the sources; the icons keep their drawing under cart names', async () => {
  assert.ok(icons.cart && icons['cart-plus'] && !icons.bag && !icons['bag-plus']);
  // docs/names.md is left out: it says that “bag” and «bolsa» are not used.
  for (const file of tracked('site', 'design-system/components', 'design-system/assets/Icons/README.md', 'docs/coverage.md', 'recipes/names.mjs')) {
    const text = (await read(file)).replace(/brand-tote-bag\.png/g, '');
    assert.doesNotMatch(text, /«?\b[Bb]olsa\b|\bbag\b|bag-plus|add-to-bag|AddToBag/, `${file} names the cart a bag`);
  }
});
