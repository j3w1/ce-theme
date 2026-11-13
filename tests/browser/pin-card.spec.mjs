import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { CEPrice } from '../../packages/vue/dist/index.js';

// CR-09: the pin card follows the ProductStack without specs. NAME and Description are 2px apart
// (size.product.gap-identity); the price block, or the store note or pending-price message that takes its place,
// starts 8px under the Description (size.product.gap-note). Distances are measured between rendered element boxes.
const IDENTITY = 2;
const OFFSET = 8;
const near = (actual, expected, label) => expect(Math.abs(actual - expected), `${label}: ${actual}px, expected ${expected}px`).toBeLessThan(0.5);

// Everything a pin card can show under its identity: each case is the content of one card.
const next = '.ce-price-block, .ce-store-note, .ce-price-pending';
function measure(card) {
  const box = (el) => el.getBoundingClientRect();
  const text = card.querySelector('.ce-pin-text');
  const name = box(card.querySelector('.ce-product-name'));
  const description = box(card.querySelector('.ce-product-description'));
  const follower = [...card.querySelectorAll('.ce-price-block, .ce-store-note, .ce-price-pending')].find((el) => el.getClientRects().length);
  const history = follower?.querySelector('.ce-price-history');
  const frame = box(card.closest('.ce-tagged-media'));
  const outer = box(card);
  const spill = [...card.querySelectorAll('*')].filter((el) => { const r = box(el); return r.width > 0 && (r.left < outer.left - 1 || r.right > outer.right + 1); }).length;
  return {
    identity: description.top - name.bottom,
    offset: follower ? box(follower).top - description.bottom : null,
    // The promotional block keeps its own layout (history beside or above the offer price) inside the block's box.
    history: history ? (() => { const b = box(follower), r = box(history); return r.top >= b.top - 0.5 && r.bottom <= b.bottom + 0.5 && r.width > 0; })() : null,
    descriptionLines: Math.round(description.height / parseFloat(getComputedStyle(card.querySelector('.ce-product-description')).lineHeight)),
    card: { left: outer.left, right: outer.right, top: outer.top, bottom: outer.bottom },
    frame: { left: frame.left, right: frame.right, top: frame.top, bottom: frame.bottom },
    overflow: text.scrollWidth > text.clientWidth + 1 || spill > 0,
  };
}
const inside = (m, label) => {
  expect(m.card.left, `${label} left`).toBeGreaterThanOrEqual(m.frame.left - 1);
  expect(m.card.right, `${label} right`).toBeLessThanOrEqual(m.frame.right + 1);
  expect(m.card.top, `${label} top`).toBeGreaterThanOrEqual(m.frame.top - 1);
  expect(m.card.bottom, `${label} bottom`).toBeLessThanOrEqual(m.frame.bottom + 1);
};

// The scene page: the real site, its supplied prices and its per-store views (?tienda=), with enhancePins() as shipped.
// Tacna shows two prices and one promotional price; Arequipa has no price for TILEN; without a store every pin shows a note.
const STORES = { tacna: ['price', 'price', 'promo'], arequipa: ['price', 'price', 'note'], ninguna: ['note', 'note', 'note'] };
for (const width of [390, 768, 1440]) {
  test(`scene at ${width}px: pin cards keep 2px identity and 8px price or note offsets and open inside the photo`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [store, kinds] of Object.entries(STORES)) {
      await page.goto(`/tienda/escena/?tienda=${store}`);
      const pins = page.locator('#escena-cocina .ce-pin');
      await expect(pins).toHaveCount(3);
      for (let index = 0; index < 3; index += 1) {
        const label = `${store} pin ${index} at ${width}px`;
        await pins.nth(index).locator('.ce-pin-dot').click();
        const card = pins.nth(index).locator('.ce-pin-card');
        await expect(card).toBeVisible();
        const m = await card.evaluate(measure);
        near(m.identity, IDENTITY, `${label} NAME to Description`);
        near(m.offset, OFFSET, `${label} Description to ${kinds[index]}`);
        if (kinds[index] === 'promo') expect(m.history, `${label} promotional history inside its block`).toBe(true);
        if (kinds[index] === 'note') await expect(card.locator('.ce-store-note:visible')).toHaveCount(1);
        expect(m.overflow, `${label} overflow`).toBe(false);
        inside(m, label);
      }
    }
  });
}

test('scene: an open pin card with a promotional price or a store note has no accessibility violations; focus and targets are unchanged', async ({ page }) => {
  for (const [store, index] of [['tacna', 2], ['ninguna', 0]]) {
    await page.goto(`/tienda/escena/?tienda=${store}`);
    const pin = page.locator('#escena-cocina .ce-pin').nth(index);
    await pin.locator('.ce-pin-dot').click();
    await expect(pin.locator('.ce-pin-card')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#escena-cocina').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((n) => n.target) }))).toEqual([]);
  }
  // Keyboard focus on the card link (after the dot opened it) shows the 2px focus outline at the focus offset; the chevron
  // cell stays 44px wide.
  await page.goto('/tienda/escena/');
  const pin = page.locator('#escena-cocina .ce-pin').first();
  await pin.locator('.ce-pin-dot').focus();
  await page.keyboard.press('Shift');
  const card = pin.locator('.ce-pin-card');
  await card.focus();
  await expect(card).toBeFocused();
  const ring = await card.evaluate((el) => { const s = getComputedStyle(el); return { width: s.outlineWidth, style: s.outlineStyle, offset: s.outlineOffset }; });
  expect(ring).toEqual({ width: '2px', style: 'solid', offset: '3px' });
  expect((await pin.locator('.ce-pin-chevron').boundingBox()).width).toBeCloseTo(44, 0);
});

// The harness: only the generated tokens and recipes, the built CEPrice and the shipped behaviours, so the pending-price
// message, long text and enlarged text are measured on the recipe itself. The pin card is one link, so the pending-price
// message carries no button inside it.
const css = readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');
const behaviours = readFileSync('recipes/behaviors.mjs', 'utf8');
const price = (props) => renderToString(createSSRApp({ render: () => h(CEPrice, props) }));
const chevron = '<span class="ce-pin-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" focusable="false"><path d="m9 5 7 7-7 7"/></svg></span>';
async function cases() {
  return [
    { kind: 'price', name: 'MENE', description: 'Taza de Vidrio Resistente al Calor', after: await price({ amount: '6.50' }), x: '12%', y: '12%' },
    { kind: 'promo', name: 'TILEN', description: 'Tapete de Ducha Antideslizante', after: await price({ amount: '6.00', previousAmount: '7.50', discountLabel: '20%' }), x: '88%', y: '12%' },
    { kind: 'note', name: 'NOME', description: 'Taza de Vidrio Resistente al Calor', after: '<span class="ce-store-note">Precio no disponible en Arequipa.</span>', x: '12%', y: '88%' },
    { kind: 'pending', name: 'TALEN', description: 'Frasco con Cucharita', after: '<div class="ce-price-pending"><span>Elige tu tienda para ver precio y disponibilidad.</span></div>', x: '88%', y: '88%' },
    { kind: 'long', name: 'BALTEL STORM', description: 'Juego de Frascos Herméticos de Vidrio Borosilicato con Tapa de Bambú y Cucharita de Acero', after: await price({ amount: '1250.90', previousAmount: '1499.90', discountLabel: '16.6%' }), x: '50%', y: '50%' },
  ];
}
async function mount(page, width, scale) {
  const pins = (await cases()).map((c, i) => `<div class="ce-pin" style="--ce-x:${c.x};--ce-y:${c.y}"><button class="ce-pin-dot" type="button" aria-expanded="false" aria-controls="p${i}"><span class="ce-sr-only">Ver ${c.name}, ${c.description}</span></button><a class="ce-pin-card" id="p${i}" href="#p${i}" data-kind="${c.kind}"><div class="ce-pin-text"><span class="ce-product-name">${c.name}</span><span class="ce-product-description">${c.description}</span>${c.after}</div>${chevron}</a></div>`).join('');
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html lang="es"><head><style>${css}body{margin:0}html{font-size:${scale}}</style></head><body><main><div class="ce-tagged-media" id="frame" style="aspect-ratio:4/3;background:var(--ce-color-surface-subtle)">${pins}</div></main></body></html>`);
  await page.addScriptTag({ type: 'module', content: `${behaviours}\nenhancePins(document);\ndocument.documentElement.dataset.ready = '';` });
  await page.locator('html[data-ready]').waitFor({ state: 'attached' });
}
for (const width of [390, 768, 1440]) {
  for (const scale of ['100%', '150%', '200%']) {
    test(`recipe at ${width}px, text ${scale}: price, promotion, store note, pending price and long text keep the offsets without overflow`, async ({ page }) => {
      await mount(page, width, scale);
      const pins = page.locator('#frame .ce-pin');
      for (let index = 0; index < 5; index += 1) {
        await pins.nth(index).locator('.ce-pin-dot').click();
        const card = pins.nth(index).locator('.ce-pin-card');
        await expect(card).toBeVisible();
        const kind = await card.getAttribute('data-kind');
        const label = `${kind} at ${width}px, text ${scale}`;
        const m = await card.evaluate(measure);
        near(m.identity, IDENTITY, `${label} NAME to Description`);
        near(m.offset, OFFSET, `${label} Description to the next line`);
        if (kind === 'promo' || kind === 'long') expect(m.history, `${label} promotional history inside its block`).toBe(true);
        if (kind === 'long') expect(m.descriptionLines, `${label} Description wraps`).toBeGreaterThan(1);
        expect(m.overflow, `${label} overflow`).toBe(false);
        inside(m, label);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

test('recipe source: the pin text spacing is written from the ProductStack tokens only', () => {
  const recipe = readFileSync('recipes/recipes.css', 'utf8');
  expect(recipe).toContain('.ce-pin-text { display: grid; gap: var(--ce-size-product-gap-identity);');
  expect(recipe).toContain(`.ce-pin-text :is(${next}) { margin-top: calc(var(--ce-size-product-gap-note) - var(--ce-size-product-gap-identity)); }`);
  expect(recipe).not.toMatch(/\.ce-pin-text[^{]*\{[^}]*margin-top: *\d/);
});
