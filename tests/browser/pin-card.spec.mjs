import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { CEPrice } from '../../packages/vue/dist/index.js';

// CR-09: the pin card follows the ProductStack without specs. NAME and Description are 2px apart
// (size.product.gap-identity); the price block, or the store note or pending-price message that takes its place,
// starts 8px under the Description (size.product.gap-note). The open card stays inside its photo at 390, 768 and
// 1440px with text at x1, x1.5 and x2, long NAMEs and Descriptions wrap, and nothing overflows: a card taller than the
// photo is limited to the photo's height and scrolls. Distances are measured between rendered element boxes.
const IDENTITY = 2;
const OFFSET = 8;
const WIDTHS = [390, 768, 1440];
const FACTORS = [1, 1.5, 2];
const near = (actual, expected, label) => expect(Math.abs(actual - expected), `${label}: ${actual}px, expected ${expected}px`).toBeLessThan(0.5);
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
const behaviours = readFileSync('recipes/behaviors.mjs', 'utf8');

const next = '.ce-price-block, .ce-store-note, .ce-price-pending';
function measure(card) {
  const box = (el) => el.getBoundingClientRect();
  const text = card.querySelector('.ce-pin-text');
  const nameEl = card.querySelector('.ce-product-name');
  const name = box(nameEl);
  const description = box(card.querySelector('.ce-product-description'));
  const follower = [...card.querySelectorAll('.ce-price-block, .ce-store-note, .ce-price-pending')].find((el) => el.getClientRects().length);
  const history = follower?.querySelector('.ce-price-history');
  const frame = box(card.closest('.ce-tagged-media'));
  const outer = box(card);
  const spill = [...card.querySelectorAll('*')].filter((el) => { const r = box(el); return r.width > 0 && (r.left < outer.left - 1 || r.right > outer.right + 1); }).length;
  // The width the NAME would need on one line (with its own, possibly enlarged, size), to tell whether it has to wrap.
  const probe = nameEl.cloneNode(true);
  probe.style.cssText += ';position:absolute;visibility:hidden;white-space:nowrap;max-width:none;width:max-content';
  text.append(probe);
  const nameOneLine = box(probe).width;
  probe.remove();
  return {
    identity: description.top - name.bottom,
    offset: follower ? box(follower).top - description.bottom : null,
    // The promotional block keeps its own layout (history beside or above the offer price) inside the block's box.
    history: history ? (() => { const b = box(follower), r = box(history); return r.top >= b.top - 0.5 && r.bottom <= b.bottom + 0.5 && r.width > 0; })() : null,
    nameMustWrap: nameOneLine > name.width + 0.5,
    nameLines: Math.round(name.height / parseFloat(getComputedStyle(nameEl).lineHeight)),
    descriptionLines: Math.round(description.height / parseFloat(getComputedStyle(card.querySelector('.ce-product-description')).lineHeight)),
    card: { left: outer.left, right: outer.right, top: outer.top, bottom: outer.bottom },
    frame: { left: frame.left, right: frame.right, top: frame.top, bottom: frame.bottom },
    overflow: text.scrollWidth > text.clientWidth + 1 || spill > 0,
    scrolls: card.scrollHeight > card.clientHeight + 1,
    overflowY: getComputedStyle(card).overflowY,
  };
}
// An opening card moves 4px into place (a 160ms transition); measure it where it settles.
const settle = (card) => card.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
const inside = (m, label) => {
  expect(m.card.left, `${label} left`).toBeGreaterThanOrEqual(m.frame.left - 1);
  expect(m.card.right, `${label} right`).toBeLessThanOrEqual(m.frame.right + 1);
  expect(m.card.top, `${label} top`).toBeGreaterThanOrEqual(m.frame.top - 1);
  expect(m.card.bottom, `${label} bottom`).toBeLessThanOrEqual(m.frame.bottom + 1);
};
// A card limited to the photo's height is reachable to its end from the keyboard: the card is the focused link.
async function keyboardReachesEnd(page, card) {
  await page.keyboard.press('Shift');
  await card.focus();
  for (let press = 0; press < 30; press += 1) {
    const { top, max } = await card.evaluate((el) => ({ top: el.scrollTop, max: el.scrollHeight - el.clientHeight }));
    if (top >= max - 1) return true;
    await page.keyboard.press('ArrowDown');
  }
  return false;
}
async function checkCard(page, card, label, kind) {
  await expect(card).toBeVisible();
  await settle(card);
  const m = await card.evaluate(measure);
  near(m.identity, IDENTITY, `${label} NAME to Description`);
  near(m.offset, OFFSET, `${label} Description to the ${kind}`);
  if (m.history !== null) expect(m.history, `${label} promotional history inside its block`).toBe(true);
  if (m.nameMustWrap) expect(m.nameLines, `${label} NAME wraps`).toBeGreaterThan(1);
  expect(m.overflow, `${label} overflow`).toBe(false);
  inside(m, label);
  if (m.scrolls) {
    expect(m.overflowY, `${label} a card limited to the photo scrolls`).toBe('auto');
    expect(await keyboardReachesEnd(page, card), `${label} keyboard reaches the end of the card`).toBe(true);
  }
  return m;
}

// Text enlargement as a reader's text-size setting applies it: every font size, including the pin card's px sizes, and
// the root size (so rem lengths follow) grow by the factor; px spacing stays. Returns the pin text sizes before and after.
async function enlargeText(page, factor) {
  const sizes = await page.evaluate((k) => {
    const text = ['.ce-product-name', '.ce-product-description', '.ce-price-value', '.ce-price-history', '.ce-store-note', '.ce-price-pending'];
    const read = () => text.map((query) => [...document.querySelectorAll(`.ce-pin-card ${query}`)].map((el) => parseFloat(getComputedStyle(el).fontSize))).flat();
    const before = read();
    const all = [document.body, ...document.body.querySelectorAll('*')];
    const own = all.map((el) => parseFloat(getComputedStyle(el).fontSize));
    all.forEach((el, i) => { el.style.fontSize = `${own[i] * k}px`; });
    document.documentElement.style.fontSize = `${parseFloat(getComputedStyle(document.documentElement).fontSize) * k}px`;
    return { before, after: read() };
  }, factor);
  expect(sizes.before.length, 'pin text to enlarge').toBeGreaterThan(0);
  sizes.after.forEach((size, i) => near(size, sizes.before[i] * factor, `pin text size ${i} grows x${factor}`));
}
// Runs the shipped placement again after the text grew, as enhancePins() does when its photo or fonts change.
async function placeAgain(page, frame) {
  await page.addScriptTag({ type: 'module', content: `${behaviours}\nplacePins(document.querySelector(${JSON.stringify(frame)}));\ndocument.documentElement.dataset.placed = '';` });
  await page.locator('html[data-placed]').waitFor({ state: 'attached' });
}

// The scene page: the real site, its supplied prices and per-store views (?tienda=), and its 16:9 photo.
// Tacna shows two prices and one promotional price; Arequipa has no price for TILEN; without a store every pin shows a note.
const STORES = { tacna: ['price', 'price', 'promo'], arequipa: ['price', 'price', 'note'], ninguna: ['note', 'note', 'note'] };
for (const width of WIDTHS) {
  for (const factor of FACTORS) {
    test(`scene at ${width}px, text x${factor}: pin cards keep 2px and 8px, wrap, and open inside the photo without overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const [store, kinds] of Object.entries(STORES)) {
        await page.goto(`/tienda/escena/?tienda=${store}`);
        const pins = page.locator('#escena-cocina .ce-pin');
        await expect(pins).toHaveCount(3);
        if (factor !== 1) { await enlargeText(page, factor); await placeAgain(page, '#escena-cocina'); }
        for (let index = 0; index < 3; index += 1) {
          await pins.nth(index).locator('.ce-pin-dot').click();
          const card = pins.nth(index).locator('.ce-pin-card');
          if (kinds[index] === 'note') await expect(card.locator('.ce-store-note:visible')).toHaveCount(1);
          await checkCard(page, card, `${store} pin ${index} at ${width}px, text x${factor}`, kinds[index]);
        }
      }
    });
  }
}

test('scene: open pin cards, also one limited to the photo, have no accessibility violations; focus and targets are unchanged', async ({ page }) => {
  for (const [store, index, factor] of [['tacna', 2, 1], ['ninguna', 0, 1], ['tacna', 2, 2]]) {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(`/tienda/escena/?tienda=${store}`);
    if (factor !== 1) { await enlargeText(page, factor); await placeAgain(page, '#escena-cocina'); }
    const pin = page.locator('#escena-cocina .ce-pin').nth(index);
    await pin.locator('.ce-pin-dot').click();
    const card = pin.locator('.ce-pin-card');
    await expect(card).toBeVisible();
    await settle(card);
    if (factor !== 1) expect((await card.evaluate(measure)).scrolls, 'with x2 text at 390px the card is limited to the photo').toBe(true);
    const results = await new AxeBuilder({ page }).include('#escena-cocina').withTags(AXE_TAGS).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((n) => n.target) }))).toEqual([]);
  }
  // Keyboard focus on the card link (after the dot opened it) shows the 2px focus outline at the focus offset; the chevron
  // cell stays 44px wide.
  await page.setViewportSize({ width: 1440, height: 900 });
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

// The harness: only the generated tokens and recipes, the supplied Inter files, the built CEPrice and the shipped
// behaviours, inside a .ce-scope as a consumer page has it, so the pending-price message, the longest identity and
// enlarged text are measured on the recipe itself. The pin card is one link, so the pending-price message carries no
// button inside it.
const inter = [['Regular', 400], ['SemiBold', 600], ['Bold', 700], ['ExtraBold', 800]].map(([file, weight]) =>
  `@font-face{font-family:"Inter";src:url(data:font/woff2;base64,${readFileSync(`fonts/inter/Inter-${file}.woff2`).toString('base64')}) format("woff2");font-weight:${weight};font-style:normal}`).join('');
const css = inter + readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');
const price = (props) => renderToString(createSSRApp({ render: () => h(CEPrice, props) }));
const chevron = '<span class="ce-pin-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" focusable="false"><path d="m9 5 7 7-7 7"/></svg></span>';
// The longest NAME the naming rule allows: two invented words of eight letters.
const LONG_NAME = 'BALTERUN NOMELIKO';
const LONG_DESCRIPTION = 'Juego de Frascos Herméticos de Vidrio Borosilicato con Tapa de Bambú y Cucharita de Acero';
async function cases() {
  return [
    { kind: 'price', name: 'MENE', description: 'Taza de Vidrio Resistente al Calor', after: await price({ amount: '6.50' }), x: '12%', y: '12%' },
    { kind: 'promo', name: 'TILEN', description: 'Tapete de Ducha Antideslizante', after: await price({ amount: '6.00', previousAmount: '7.50', discountLabel: '20%' }), x: '88%', y: '12%' },
    { kind: 'note', name: 'NOME', description: 'Taza de Vidrio Resistente al Calor', after: '<span class="ce-store-note">Precio no disponible en Arequipa.</span>', x: '12%', y: '88%' },
    { kind: 'pending', name: 'TALEN', description: 'Frasco con Cucharita', after: '<div class="ce-price-pending"><span>Elige tu tienda para ver precio y disponibilidad.</span></div>', x: '88%', y: '88%' },
    { kind: 'long', name: LONG_NAME, description: LONG_DESCRIPTION, after: await price({ amount: '16.90', previousAmount: '20.50', discountLabel: '17%' }), x: '50%', y: '50%' },
  ];
}
const pinMarkup = (c, i) => `<div class="ce-pin" style="--ce-x:${c.x};--ce-y:${c.y}"><button class="ce-pin-dot" type="button" aria-expanded="false" aria-controls="p${i}"><span class="ce-sr-only">Ver ${c.name}, ${c.description}</span></button><a class="ce-pin-card" id="p${i}" href="#p${i}" data-kind="${c.kind}"><div class="ce-pin-text"><span class="ce-product-name">${c.name}</span><span class="ce-product-description">${c.description}</span>${c.after}</div>${chevron}</a></div>`;
// The text is enlarged before enhancePins() places the cards, as when a reader's setting is on when the page loads.
async function mount(page, { width, factor = 1, frame = '' }, list) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html lang="es"><head><style>${css}body{margin:0}</style></head><body><main class="ce-scope"><div class="ce-tagged-media" id="frame" style="${frame}aspect-ratio:4/3;background:var(--ce-color-surface-subtle)">${list.map(pinMarkup).join('')}</div></main></body></html>`);
  await page.evaluate(async () => { await Promise.all([400, 600, 700, 800].map((weight) => document.fonts.load(`${weight} 16px Inter`))); });
  expect(await page.evaluate(() => document.fonts.check('700 16px Inter') && document.fonts.check('800 16px Inter')), 'the Inter files are in use').toBe(true);
  if (factor !== 1) await enlargeText(page, factor);
  await page.addScriptTag({ type: 'module', content: `${behaviours}\nenhancePins(document);\ndocument.documentElement.dataset.ready = '';` });
  await page.locator('html[data-ready]').waitFor({ state: 'attached' });
}
async function checkPins(page, label) {
  const pins = page.locator('#frame .ce-pin');
  const results = [];
  for (let index = 0; index < await pins.count(); index += 1) {
    await pins.nth(index).locator('.ce-pin-dot').click();
    const card = pins.nth(index).locator('.ce-pin-card');
    const kind = await card.getAttribute('data-kind');
    const m = await checkCard(page, card, `${kind} ${label}`, kind);
    if (kind === 'long') expect(m.descriptionLines, `long ${label} Description wraps`).toBeGreaterThan(1);
    results.push({ kind, ...m });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} page width`).toBe(true);
  return results;
}
for (const width of WIDTHS) {
  for (const factor of FACTORS) {
    test(`recipe at ${width}px, text x${factor}: price, promotion, store note, pending price and the longest identity keep the offsets, fit and do not overflow`, async ({ page }) => {
      await mount(page, { width, factor }, await cases());
      const results = await checkPins(page, `at ${width}px, text x${factor}`);
      // The longest NAME has to wrap once the text is doubled at phone width.
      if (width === 390 && factor === 2) expect(results.find((r) => r.kind === 'long').nameMustWrap, 'the longest NAME has to wrap').toBe(true);
    });
  }
}

// A small photo (a phone grid column) narrows the card to 80% of the photo, so the longest valid NAME has to wrap.
test('recipe in a 240px photo: the longest NAME wraps and the card stays inside the photo', async ({ page }) => {
  const [long] = (await cases()).filter((c) => c.kind === 'long');
  await mount(page, { width: 390, frame: 'width:240px;' }, [{ ...long, description: 'Taza de Vidrio Resistente al Calor', after: await price({ amount: '16.90' }), x: '50%', y: '20%' }]);
  const [m] = await checkPins(page, 'in a 240px photo');
  expect(m.nameMustWrap, 'the NAME has to wrap in a 240px photo').toBe(true);
});

test('recipe source: the pin text spacing is written from the ProductStack tokens only', () => {
  const recipe = readFileSync('recipes/recipes.css', 'utf8');
  expect(recipe).toContain('.ce-pin-text { display: grid; gap: var(--ce-size-product-gap-identity);');
  expect(recipe).toContain(`.ce-pin-text :is(${next}) { margin-top: calc(var(--ce-size-product-gap-note) - var(--ce-size-product-gap-identity)); }`);
  expect(recipe).not.toMatch(/\.ce-pin-text[^{]*\{[^}]*margin-top: *\d/);
});
