// CR-06 availability line (StockLine, `ce-stock`): the wording contract, the accessible name and the fixture-scoped
// acceptance check 3. Rendering, dots, forced colours and greyscale are checked in tests/browser/availability.spec.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { NAMES } from '../recipes/names.mjs';
import { readRecipes } from '../scripts/sources.mjs';
import { catalogue, stores, stockLine, stockListAttributes, cardFor } from '../site/data/store.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

// docs/names.md#stockline. `{tienda}` is the supplied store label.
const WORDING = {
  available: /^Disponible en \S.*$/,
  limited: /^Pocas unidades en \S.*$/,
  unavailable: /^Agotado en \S.*$/,
  unknown: /^Disponibilidad por confirmar en \S.*$/,
  pending: /^Consultando disponibilidad…$/,
};
const STATES = Object.keys(WORDING);

/** Every `ul.ce-stock` in an HTML string, with its attributes and statements. */
function stockLists(html) {
  return [...html.matchAll(/<ul\b([^>]*\bclass="(?:[^"]*\s)?ce-stock(?:\s[^"]*)?"[^>]*)>([\s\S]*?)<\/ul>/g)].map(([, attrs, body]) => ({
    attrs,
    items: [...body.matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)].map(([, itemAttrs, text]) => ({
      state: itemAttrs.match(/\bdata-state="([^"]*)"/)?.[1],
      text: text.replace(/<[^>]+>/g, '').trim(),
    })),
  }));
}

/** The availability samples CE Theme ships: the design-system cards, the names registry and the StockLine doc. */
async function samples() {
  const found = [];
  const dir = new URL('design-system/components/', root);
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const html = await read(`design-system/components/${entry.name}/preview.html`).catch(() => '');
    for (const list of stockLists(html)) found.push({ where: `${entry.name} card`, ...list });
  }
  for (const entry of NAMES) for (const list of stockLists(entry.sample)) found.push({ where: `names registry ${entry.id}`, ...list });
  for (const list of stockLists(await read('docs/names.md'))) found.push({ where: 'docs/names.md', ...list });
  return found;
}

test('every availability sample is a named list whose words match its state', async () => {
  const lists = await samples();
  assert.ok(lists.length >= 8, 'the cards and the registry carry availability samples');
  for (const { where, attrs, items } of lists) {
    assert.match(attrs, /\baria-label="Disponibilidad"/, `${where}: the list is named Disponibilidad (X-7)`);
    assert.doesNotMatch(attrs, /\brole="status"/, `${where}: the list is not a live region by default`);
    assert.ok(items.length > 0, `${where}: one item per statement`);
    for (const { state, text } of items) {
      const shown = state ?? 'unknown'; // an item with no data-state looks unknown, so it must read unknown
      assert.ok(STATES.includes(shown), `${where}: unknown data-state "${state}"`);
      assert.match(text, WORDING[shown], `${where}: «${text}» is not the ${shown} wording`);
    }
    const pending = items.some((item) => item.state === 'pending');
    assert.equal(/\baria-busy="true"/.test(attrs), pending, `${where}: aria-busy="true" exactly when a reading is pending`);
  }
});

test('the ProductCard and StoreContext cards add an unknown sample beside the kept confirmed readings (X-9)', async () => {
  const productCard = await read('design-system/components/ProductCard/preview.html');
  const storeContext = await read('design-system/components/StoreContext/preview.html');
  for (const [name, html] of [['ProductCard', productCard], ['StoreContext', storeContext]]) {
    const items = stockLists(html).flatMap((list) => list.items);
    assert.ok(items.some((item) => item.state === 'unknown' && WORDING.unknown.test(item.text)), `${name}: an explicit unknown sample`);
  }
  // The two confirmed readings next to a missing price stay; a missing price never rejects a supplied reading.
  assert.match(productCard, /<p class="ce-store-note">Precio no disponible en Arequipa\.<\/p>\s*<ul class="ce-stock" aria-label="Disponibilidad"><li data-state="limited">Pocas unidades en Arequipa<\/li><\/ul>/);
  assert.match(storeContext, /<p class="ce-store-note">Precio no disponible en Arequipa\.<\/p><ul class="ce-stock" aria-label="Disponibilidad"><li data-state="unavailable">Agotado en Arequipa<\/li><\/ul>/);
  assert.match(storeContext, /<ul class="ce-stock" aria-label="Disponibilidad" aria-busy="true"><li data-state="pending">Consultando disponibilidad…<\/li><\/ul>/);
});

test('acceptance 3: the canon fixtures NOME, TILEN and TALEN in Tienda B read «Disponibilidad por confirmar en …»', async () => {
  // CANON R-03 and section B (docs/design-canon.md): Tienda B supplies no price for NOME, TILEN and TALEN, and its
  // inventory source has had no response, so the fixture holds no reading for Tienda B. CE Theme's own samples use
  // Tacna and Arequipa; this renders the canon fixtures through the reference site's own statement renderer.
  const canon = await read('docs/design-canon.md');
  assert.match(canon, /\*\*NOME\*\* A «Disponible…», B «Disponibilidad por confirmar…» \(and no price in B\)/);
  assert.match(canon, /\*\*TILEN\*\* A «Disponibilidad por confirmar en Tienda A — demostración», B same wording for B \(no price in B\)\. \*\*TALEN\*\* same as TILEN\./);
  assert.match(canon, /nothing in B is ever shown as available or sold out/);
  const tiendaB = { id: 'tienda-b', name: 'Tienda B — demostración' };
  for (const name of ['NOME', 'TILEN', 'TALEN']) {
    const fixture = { name, prices: {}, stock: {} }; // no price and no inventory response in Tienda B
    const line = stockLine(fixture, tiendaB);
    assert.deepEqual(line, { state: 'unknown', text: 'Disponibilidad por confirmar en Tienda B — demostración' }, name);
    assert.doesNotMatch(line.text, /Agotado|Disponible en|Pocas unidades/, `${name}: unknown is never sold out or available`);
  }
});

test('acceptance 3: elsewhere every limited or unavailable sample carries a supplied reading, with or without a price', async () => {
  // Static samples: the reading is the explicit data-state of the item; the words must agree with it (checked above),
  // so «Agotado» or «Pocas unidades» never appears on an item without that supplied state.
  for (const { where, items } of await samples()) {
    for (const { state, text } of items) {
      if (/^(Agotado|Pocas unidades) en /.test(text)) assert.ok(state === 'unavailable' || state === 'limited', `${where}: «${text}» needs its supplied reading`);
    }
  }
  // Site fixtures: each statement is the supplied per-store reading, never derived from the price.
  let confirmedWithoutPrice = 0;
  for (const item of catalogue) {
    for (const store of stores) {
      const reading = item.stock[store.id];
      const card = cardFor(item, store.id);
      assert.equal(card.stock.length, 1, `${item.name} in ${store.name}: one statement`);
      assert.equal(card.stock[0].state, reading ?? 'unknown', `${item.name} in ${store.name}: the supplied reading`);
      assert.match(card.stock[0].text, WORDING[card.stock[0].state]);
      if ((reading === 'limited' || reading === 'unavailable') && !item.prices[store.id]) confirmedWithoutPrice += 1;
    }
  }
  assert.ok(confirmedWithoutPrice > 0, 'a confirmed reading next to a missing price is accepted (X-9)');
  // A store without a reading is unknown, never sold out.
  assert.deepEqual(stockLine({ stock: {} }, stores[1]), { state: 'unknown', text: 'Disponibilidad por confirmar en Arequipa' });
  assert.deepEqual(stockLine({}, stores[0]), { state: 'unknown', text: 'Disponibilidad por confirmar en Tacna' });
});

test('with no store chosen there is no availability line', async () => {
  for (const item of catalogue) {
    const card = cardFor(item, 'ninguna');
    assert.equal(card.stock, undefined, `${item.name}: no availability line without a store`);
    assert.equal(card.priceNote, 'Elige tu tienda para ver precio y disponibilidad.');
  }
  for (const page of ['site/pages/tienda/producto.astro', 'site/pages/tienda/escena.astro', 'site/components/ProductCard.astro']) {
    const source = await read(page);
    assert.doesNotMatch(source, /<ul class="(?:[^"]*\s)?ce-stock\b[^>]*data-store-view="ninguna"/, `${page}: no availability line for no store`);
    const tags = [...source.matchAll(/<ul class="(?:[^"]*\s)?ce-stock\b[^>]*>/g)].map(([tag]) => tag);
    assert.ok(tags.length > 0, `${page}: renders an availability list`);
    // Every list the site renders takes its name and its busy state from stockListAttributes(), checked below.
    for (const tag of tags) assert.match(tag, /\{\.\.\.stockListAttributes\((\[line\]|stock)\)\}/, `${page}: ${tag}`);
  }
});

test('the site names every availability list and marks it busy exactly while a reading is pending', () => {
  for (const state of STATES) {
    const lines = [{ state, text: '' }];
    assert.deepEqual(stockListAttributes(lines), { 'aria-label': 'Disponibilidad', 'aria-busy': state === 'pending' ? 'true' : undefined }, state);
  }
  assert.equal(stockListAttributes([{ state: 'available' }, { state: 'pending' }])['aria-busy'], 'true');
  assert.deepEqual(stockLine({ stock: { tacna: 'pending' } }, stores[0]), { state: 'pending', text: 'Consultando disponibilidad…' });
});

test('the recipe makes unknown and pending explicit, keeps the ring for unavailable only and leaves ce-availability as it was', async () => {
  const css = await readRecipes();
  assert.ok(css.includes('.ce-stock > li::before { width: 10px; height: 10px; content: \'\'; border-radius: var(--ce-radius-pill); background: var(--ce-color-border-control); transform: translateY(1px); }'), 'the default neutral dot stays');
  assert.ok(css.includes('.ce-stock > [data-state="unknown"]::before, .ce-stock > [data-state="pending"]::before { background: var(--ce-color-border-control); }'));
  const stockRules = [...css.matchAll(/^\.ce-stock[^{]*\{[^}]*\}/gm)].map(([rule]) => rule);
  assert.deepEqual(stockRules.filter((rule) => rule.includes('box-shadow')), ['.ce-stock > [data-state="unavailable"]::before { background: transparent; box-shadow: inset 0 0 0 2px var(--ce-color-status-danger-text); }']);
  assert.ok(css.includes('.ce-availability { margin: 0; color: var(--ce-color-text-secondary); font-size: var(--ce-font-size-xs); font-weight: var(--ce-font-weight-semibold); line-height: var(--ce-font-line-heading); }'), 'ce-availability is unchanged');
  assert.equal((css.match(/\.ce-availability\b/g) ?? []).length, 1, 'no new ce-availability rule');
});
