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
  // Overflow: any visible box of the text that leaves the text column's content box (its padding excluded).
  const ts = getComputedStyle(text), tb = box(text);
  const contentLeft = tb.left + parseFloat(ts.paddingLeft), contentRight = tb.right - parseFloat(ts.paddingRight);
  const spill = [...text.querySelectorAll('*')].filter((el) => { if (el.closest('.ce-sr-only')) return false; const r = box(el); return r.width > 0 && (r.left < contentLeft - 0.5 || r.right > contentRight + 0.5); }).length;
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
    overflow: spill > 0 || text.scrollWidth > text.clientWidth + 1,
    scrolls: card.scrollHeight > card.clientHeight + 1,
    // The photo clips (overflow: hidden) but can still be scrolled by focus; a scrolled photo would shift every card.
    photoScrolled: card.closest('.ce-tagged-media').scrollTop !== 0 || card.closest('.ce-tagged-media').scrollLeft !== 0,
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
// Keyboard focus on the card, as the repository's focus tests reach it in Chromium and WebKit: back to the dot and Tab
// onto the card, so :focus-visible comes from keyboard navigation (WebKit does not show it for script focus after a click).
async function keyboardFocus(page, card) {
  await card.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(card).toBeFocused();
}
// Keyboard focus on the card: its outline (stroke.focus at stroke.offset) must lie inside the photo, which clips.
async function focusRingInside(page, card, label) {
  await keyboardFocus(page, card);
  const r = await card.evaluate((el) => {
    // The card's own token values (its cascade, overrides included), resolved to px in an isolated probe.
    const cs = getComputedStyle(el);
    const resolve = (value) => {
      const probe = document.createElement('span');
      probe.style.cssText = 'all:initial!important;position:absolute!important;display:block!important;visibility:hidden!important;zoom:1!important;height:0!important';
      probe.style.setProperty('font-size', cs.fontSize, 'important');
      probe.style.setProperty('width', value, 'important');
      el.append(probe);
      const px = probe.getBoundingClientRect().width;
      probe.remove();
      return px;
    };
    const tokens = { width: resolve(cs.getPropertyValue('--ce-stroke-focus').trim()), offset: resolve(cs.getPropertyValue('--ce-stroke-offset').trim()) };
    const s = getComputedStyle(el), c = el.getBoundingClientRect(), f = el.closest('.ce-tagged-media').getBoundingClientRect();
    const ring = parseFloat(s.outlineOffset) + parseFloat(s.outlineWidth);
    return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), offset: parseFloat(s.outlineOffset), tokens, left: c.left - ring - f.left, right: f.right - c.right - ring, top: c.top - ring - f.top, bottom: f.bottom - c.bottom - ring };
  });
  expect(r.style, `${label} focus ring style`).toBe('solid');
  expect(r.tokens.width, `${label} stroke.focus resolves`).toBeGreaterThan(0);
  near(r.width, r.tokens.width, `${label} focus ring width is stroke.focus`);
  near(r.offset, r.tokens.offset, `${label} focus ring offset is stroke.offset`);
  for (const side of ['left', 'right', 'top', 'bottom']) expect(r[side], `${label} focus ring ${side} edge inside the photo`).toBeGreaterThanOrEqual(-0.5);
}
// The focus ring is painted on every side: a 1px strip through the middle of the outline band differs between the
// focused and the unfocused card (the photo would clip a ring outside it, and both strips would then be equal).
async function focusRingPainted(page, card) {
  await keyboardFocus(page, card);
  const bands = await card.evaluate((el) => {
    const s = getComputedStyle(el), c = el.getBoundingClientRect();
    const mid = parseFloat(s.outlineOffset) + parseFloat(s.outlineWidth) / 2;
    const w = (c.right - c.left) / 3, h = (c.bottom - c.top) / 3;
    const strip = (x, y, width, height) => ({ x: Math.round(x), y: Math.round(y), width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) });
    return { left: strip(c.left - mid - 0.5, c.top + h, 1, h), right: strip(c.right + mid - 0.5, c.top + h, 1, h), top: strip(c.left + w, c.top - mid - 0.5, w, 1), bottom: strip(c.left + w, c.bottom + mid - 0.5, w, 1) };
  });
  const shoot = async () => { const out = {}; for (const [side, clip] of Object.entries(bands)) out[side] = await page.screenshot({ clip }); return out; };
  const focused = await shoot();
  await card.evaluate((el) => el.blur());
  const unfocused = await shoot();
  return Object.fromEntries(Object.keys(bands).map((side) => [side, !focused[side].equals(unfocused[side])]));
}
const PAINTED = { left: true, right: true, top: true, bottom: true };
// A card limited to the photo's height is reachable to its end from the keyboard: the card is the focused link.
// The keyboard reaches the end of a card limited to its photo: ArrowDown on the focused card, up to a generous number
// of presses. Each press may take a moment to register on a loaded machine, so the check waits briefly for progress after
// each one and then requires the end; a card the keyboard cannot scroll never gets there and fails with its state.
async function keyboardReachesEnd(page, card) {
  await keyboardFocus(page, card);
  const read = () => card.evaluate((el) => ({ top: el.scrollTop, max: el.scrollHeight - el.clientHeight }));
  let state = await read();
  for (let press = 0; press < 60 && state.top < state.max - 1; press += 1) {
    const before = state.top;
    await page.keyboard.press('ArrowDown');
    for (let wait = 0; wait < 20; wait += 1) { state = await read(); if (state.top > before + 0.5 || state.top >= state.max - 1) break; await page.waitForTimeout(50); }
  }
  await expect.poll(async () => { state = await read(); return state.top >= state.max - 1; }, { message: 'the keyboard reaches the end of the card', timeout: 10000 }).toBe(true);
  return true;
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
  expect(m.photoScrolled, `${label} the photo is not scrolled`).toBe(false);
  inside(m, label);
  await focusRingInside(page, card, label);
  if (m.scrolls) {
    expect(m.overflowY, `${label} a card limited to the photo scrolls`).toBe('auto');
    expect(await focusRingPainted(page, card), `${label} focus ring painted on every side`).toEqual(PAINTED);
    expect(await keyboardReachesEnd(page, card), `${label} keyboard reaches the end of the card`).toBe(true);
  }
  expect((await card.evaluate(measure)).photoScrolled, `${label} the photo is not scrolled after focus and keyboard scrolling`).toBe(false);
  return m;
}

// Text enlargement as a reader's text-size setting applies it: every font size, including the pin card's px sizes, and
// the root size (so rem lengths follow) grow by the factor; px spacing stays. Returns the pin text sizes before and after.
async function enlargeText(page, factor) {
  const sizes = await page.evaluate((k) => {
    const text = ['.ce-product-name', '.ce-product-description', '.ce-price-value', '.ce-price-history', '.ce-store-note', '.ce-price-pending'];
    // Only rendered text is sampled: WebKit can report a stale computed style for an element in a display:none subtree
    // (a hidden per-store view) after its inline style changes. Every element is enlarged all the same.
    const read = () => text.map((query) => [...document.querySelectorAll(`.ce-pin-card ${query}`)].filter((el) => el.getClientRects().length).map((el) => parseFloat(getComputedStyle(el).fontSize))).flat();
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
  const card = pin.locator('.ce-pin-card');
  await keyboardFocus(page, card);
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
const pinMarkup = (c, i) => `<div class="ce-pin" style="--ce-x:${c.x};--ce-y:${c.y}"><button class="ce-pin-dot" type="button" aria-expanded="false" aria-controls="p${i}"><span class="ce-sr-only">Ver ${c.name}, ${c.description}</span></button><a class="ce-pin-card" id="p${i}" href="#p${i}" data-kind="${c.kind}"${c.cardStyle ? ` style="${c.cardStyle}"` : ''}><div class="ce-pin-text"><span class="ce-product-name">${c.name}</span><span class="ce-product-description">${c.description}</span>${c.after}</div>${chevron}</a></div>`;
// The text is enlarged before enhancePins() places the cards, as when a reader's setting is on when the page loads.
async function mount(page, { width, factor = 1, frame = '', scope = '', consumerCss = '' }, list) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html lang="es"><head><style>${css}body{margin:0}${consumerCss}</style></head><body><main class="ce-scope" style="${scope}"><div class="ce-tagged-media" id="frame" style="${frame}aspect-ratio:4/3;background:var(--ce-color-surface-subtle)">${list.map(pinMarkup).join('')}</div></main></body></html>`);
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

// Below the acceptance widths: a 280px photo with x1.5 and x2 text and the longest identity with a regular price. The card
// is as large as the photo allows (its focus ring's width from both sides), scrolls, and keeps the ring visible on every
// side. (A price needs a text column at least as wide as itself: with x2 text a promotional offer price, about 180px with
// its offer padding, needs a photo of about 266px or more, and font metrics differ slightly between engines.)
for (const factor of [1.5, 2]) {
  test(`recipe in a 280px photo, text x${factor}: the longest identity fits, scrolls and keeps a visible focus ring`, async ({ page }) => {
    const [long] = (await cases()).filter((c) => c.kind === 'long');
    await mount(page, { width: 390, factor, frame: 'width:280px;' }, [{ ...long, after: await price({ amount: '16.90' }), x: '50%', y: '20%' }]);
    const [m] = await checkPins(page, `in a 280px photo, text x${factor}`);
    expect(m.scrolls, 'the card is limited to the photo and scrolls').toBe(true);
  });
}

// A consumer may set the focus tokens in other units: the ring must still stay visible inside the photo. Pins at the
// corners of the 8% safety margin and the longest identity put cards against the clamp on every side.
const OVERRIDES = { rem: '--ce-stroke-focus:.125rem;--ce-stroke-offset:.1875rem;', calc: '--ce-stroke-focus:calc(1px + 1px);--ce-stroke-offset:calc(2px + 1px);' };
for (const [unit, scope] of Object.entries(OVERRIDES)) {
  for (const [width, factor, frame] of [[390, 1, ''], [390, 2, ''], [390, 2, 'width:280px;']]) {
    test(`recipe with ${unit} focus tokens at ${frame ? '280px photo' : `${width}px`}, text x${factor}: the focus ring stays visible inside the photo`, async ({ page }) => {
      const all = await cases();
      const long = all.find((c) => c.kind === 'long');
      const list = frame ? [{ ...long, after: await price({ amount: '16.90' }), x: '92%', y: '8%' }] : [{ ...all[0], x: '8%', y: '8%' }, { ...all[1], x: '92%', y: '8%' }, { ...long, x: '92%', y: '92%' }];
      await mount(page, { width, factor, frame, scope }, list);
      const results = await checkPins(page, `${unit} tokens, ${frame || `${width}px`}, text x${factor}`);
      for (const [index, m] of results.entries()) {
        if (!m.scrolls) {
          const card = page.locator('#frame .ce-pin-card').nth(index);
          await page.locator('#frame .ce-pin-dot').nth(index).click();
          await settle(card);
          expect(await focusRingPainted(page, card), `${unit} tokens card ${index} focus ring painted`).toEqual(PAINTED);
        }
      }
    });
  }
}

// A consumer's own styles stay as they were: placement measures the ring without touching the card's declarations, so
// a transition on outline-offset cannot skew it, and an inline outline-offset or max-height keeps its value and priority,
// also after the card was limited to a small photo and released again when the photo grew.
test('recipe with consumer styles: transitions and inline declarations keep the ring visible and are left as they were', async ({ page }) => {
  const all = await cases();
  const long = all.find((c) => c.kind === 'long');
  const cardStyle = 'outline-offset: var(--ce-stroke-offset) !important; max-height: 40rem';
  const consumerCss = '.ce-pin-card{outline-offset:var(--ce-stroke-offset);transition:outline-offset 1s linear}';
  await mount(page, { width: 1440, factor: 2, frame: 'width:280px;', consumerCss }, [{ ...long, after: await price({ amount: '16.90' }), cardStyle, x: '92%', y: '8%' }]);
  const card = page.locator('#frame .ce-pin-card');
  const inline = () => card.evaluate((el) => ({ offset: [el.style.getPropertyValue('outline-offset'), el.style.getPropertyPriority('outline-offset')], max: [el.style.getPropertyValue('max-height'), el.style.getPropertyPriority('max-height')] }));
  const [m] = await checkPins(page, 'consumer styles in a 280px photo, text x2');
  expect(m.scrolls, 'the card is limited to the small photo').toBe(true);
  const limited = await inline();
  expect(limited.offset, 'inline outline-offset untouched').toEqual(['var(--ce-stroke-offset)', 'important']);
  expect(limited.max[1], 'the limit is placePins’ own').toBe('important');
  // The photo grows to the full 1440px width, where the card fits: the limit is released and the consumer's inline
  // max-height comes back as it was.
  await page.locator('#frame').evaluate((el) => { el.style.width = '100%'; });
  await expect.poll(async () => (await inline()).max, { message: 'consumer max-height restored' }).toEqual(['40rem', '']);
  expect((await inline()).offset, 'inline outline-offset still untouched').toEqual(['var(--ce-stroke-offset)', 'important']);
  await page.locator('#frame .ce-pin-dot').click();
  await checkCard(page, card, 'consumer styles in the full-width photo, text x2', 'long');
});

// Consumer CSS that reaches inside the card cannot skew the measurement: universal token values with a card-specific
// override (the card's own ring is 4px at 6px), and a rule aimed at any class-less child span of the card (where a
// measuring element would be) that changes its width, zoom and transform.
test('recipe with consumer selectors inside the card: the card’s own focus tokens keep the ring visible', async ({ page }) => {
  const all = await cases();
  const long = all.find((c) => c.kind === 'long');
  const consumerCss = '*{--ce-stroke-focus:2px;--ce-stroke-offset:3px}.ce-pin-card{--ce-stroke-focus:4px;--ce-stroke-offset:6px}'
    + '.ce-pin-card>span:not([class]){width:1px!important;zoom:3;transform:scale(3);font-size:50px}';
  await mount(page, { width: 390, factor: 2, consumerCss }, [{ ...all[0], x: '8%', y: '8%' }, { ...all[1], x: '92%', y: '8%' }, { ...long, x: '92%', y: '92%' }]);
  const results = await checkPins(page, 'consumer selectors, 390px, text x2');
  for (const [index, m] of results.entries()) {
    const card = page.locator('#frame .ce-pin-card').nth(index);
    const ring = await card.evaluate((el) => { const c = el.getBoundingClientRect(), f = el.closest('.ce-tagged-media').getBoundingClientRect(); return Math.min(c.left - f.left, f.right - c.right, c.top - f.top, f.bottom - c.bottom); });
    if (m.scrolls || ring < 11) expect(ring, `card ${index} keeps its own 10px ring inside the photo`).toBeGreaterThanOrEqual(9.5);
  }
});

test('recipe source: the pin text spacing is written from the ProductStack tokens only', () => {
  const recipe = readFileSync('recipes/recipes.css', 'utf8');
  expect(recipe).toContain('.ce-pin-text { display: grid; gap: var(--ce-size-product-gap-identity);');
  expect(recipe).toContain(`.ce-pin-text :is(${next}) { margin-top: calc(var(--ce-size-product-gap-note) - var(--ce-size-product-gap-identity)); }`);
  expect(recipe).not.toMatch(/\.ce-pin-text[^{]*\{[^}]*margin-top: *\d/);
});
