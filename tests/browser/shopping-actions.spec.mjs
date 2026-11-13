import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// CR-07, the shopping-action rule: browse-first cards, the optional QuickAdd on the active desktop card, nothing added from a card on
// touch or narrow screens, and one primary «Añadir al carrito» on the product page. Each test names the acceptance check it covers
// (docs/change-requests/CR-07-shopping-action-rule.md, section 6). Screen-reader and real-phone checks (6) are not run here.
//
// Recipe-level cases are rendered with the supplied Inter files, the generated tokens and the generated recipes only. The page is
// served from a stand-in origin so that recipes/fonts.css finds the font files at ../fonts/inter/, as in tests/browser/demo-cue.spec.mjs.
const ORIGIN = 'http://shopping-actions.test';
const css = readFileSync('recipes/fonts.css', 'utf8') + readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');
const ICON = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 7h14"/></svg>';
const LISTING = '/tienda/categoria/';
const PRODUCT = /\/tienda\/producto\/$/;
const firstCard = (page) => page.locator('[data-store-view="tacna"] .ce-product').first();
const QUICK = '.ce-product-row > .ce-icon-button--action';

async function open(page, body, { width = 1440, root = '100%', extra = '', dir = 'ltr' } = {}) {
  const html = `<!doctype html><html lang="es" dir="${dir}"><head><meta charset="utf-8"><title>CR-07</title><style>${css}</style><style>html { font-size: ${root}; } body { margin: 0; padding: 24px; } ${extra}</style></head><body><main><button type="button" id="antes">Antes</button><div class="ce-scope">${body}</div></main></body></html>`;
  await page.setViewportSize({ width, height: 900 });
  await page.unroute(`${ORIGIN}/**`);
  await page.route(`${ORIGIN}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === '/recipes/card.html') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    const font = pathname.match(/^\/fonts\/inter\/(Inter-[A-Za-z]+\.woff2)$/);
    if (font) return route.fulfill({ contentType: 'font/woff2', body: readFileSync(`fonts/inter/${font[1]}`) });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.goto(`${ORIGIN}/recipes/card.html`);
  const faces = await page.evaluate(async () => {
    for (const weight of [400, 600, 700, 800]) await document.fonts.load(`${weight} 1em Inter`);
    await document.fonts.ready;
    return [...document.fonts].filter((face) => face.family.replaceAll('"', '') === 'Inter').map((face) => `${face.weight} ${face.status}`).sort();
  });
  expect(faces).toEqual(['400 loaded', '600 loaded', '700 loaded', '800 loaded']);
}

// A card in the recipe's own markup. Description and specs are optional, as the ProductCard guideline documents; `note` replaces the
// price with a store note; `legacy` adds the deprecated full-width button of the earlier rule; `extras` adds a variant thumbnail link,
// «Comparar» and a list's own task button, the other controls a card may hold.
const priceHtml = (amount) => `<div class="ce-price-block"><span class="ce-price"><span class="ce-sr-only">Precio actual: ${amount} soles</span><span class="ce-price-amount"><span class="ce-price-currency" aria-hidden="true">S/</span><span class="ce-price-value" aria-hidden="true">${amount}</span></span></span></div>`;
const card = ({ name = 'MENE', description = 'Taza de Vidrio', specs = 'vidrio borosilicato, 250ml', amount = '12.5', note = false, quickAdd = true, legacy = false, extras = false, width = 300, style = '', empty = false } = {}) => `<article class="ce-product" style="width:${width}px;${style}">
  ${extras ? '<label class="ce-check ce-product-select"><input type="checkbox" />Comparar</label>' : ''}
  <div class="ce-product-media">${extras ? `<button class="ce-icon-button ce-icon-button--small" type="button" id="marca" aria-label="Marcar ${name}">${ICON}</button>` : ''}<a href="#producto" tabindex="-1" aria-hidden="true"><span class="ce-media-missing">Foto no disponible</span></a></div>
  <div class="ce-product-info">
    <div class="ce-product-row"><h3 class="ce-product-heading"><a class="ce-product-link" href="#producto"><span class="ce-product-name">${name}</span>${description ? `<span class="ce-product-description">${description}</span>` : empty ? '<span class="ce-product-description"></span>' : ''}</a></h3>${quickAdd ? `<button class="ce-icon-button ce-icon-button--action ce-icon-button--small" type="button" aria-label="Añadir ${name} al carrito">${ICON}</button>` : ''}</div>
    ${specs ? `<p class="ce-product-specs">${specs}</p>` : empty ? '<p class="ce-product-specs"></p>' : ''}
    ${note ? '<p class="ce-store-note">Precio no disponible en Arequipa.</p>' : priceHtml(amount)}
    <ul class="ce-stock"><li data-state="available">Disponible en Tacna</li></ul>
    ${extras ? '<div class="ce-variant-more"><span>Más opciones</span><ul class="ce-variant-thumbs"><li><a href="#variante" aria-current="true"><span class="ce-media-missing">NOME</span></a></li></ul></div><button class="ce-link" type="button" id="tarea">Quitar de favoritos</button>' : ''}
    ${legacy ? '<button class="ce-button ce-button--secondary ce-product-add" type="button">Añadir al carrito</button>' : ''}
  </div>
</article>`;
// A click or tap where a person would put it: on the visible point, whatever element is drawn on top there. Playwright's own
// locator.click() refuses an element that another one covers, and the product link's ::after covers the card on purpose.
async function pointAt(page, locator, { tap = false, x, y } = {}) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  const point = [x?.(box) ?? box.x + box.width / 2, y?.(box) ?? box.y + box.height / 2];
  if (tap) await page.touchscreen.tap(...point); else await page.mouse.click(...point);
}
// Which control each click reached. Link activation is counted where it happens, so nothing depends on when the URL changes.
const trackClicks = (page) => page.evaluate(() => {
  window.clicks = [];
  const name = (el) => (el.matches('.ce-product-link') ? 'product' : el.matches('.ce-product-media > a[aria-hidden="true"]') ? 'photo' : el.matches('.ce-variant-thumbs a') ? 'variant' : el.type === 'checkbox' ? 'compare' : el.id);
  for (const el of document.querySelectorAll('.ce-product :is(a, button, input, select, textarea, summary)')) el.addEventListener('click', () => window.clicks.push(name(el)));
});
const takeClicks = (page) => page.evaluate(() => window.clicks.splice(0));
// Every button in a card that a person can see: rendered, not transparent.
const visibleButtons = (locator) => locator.evaluate((root) => [...root.querySelectorAll('button')].filter((el) => {
  const box = el.getBoundingClientRect();
  return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== 'hidden' && Number(getComputedStyle(el).opacity) > 0;
}).map((el) => el.getAttribute('aria-label') ?? el.textContent.trim()));

test('acceptance 1: at 1440 a resting card shows no purchase control, and the active card only the quick-add', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LISTING);
  const product = firstCard(page);
  await page.mouse.move(0, 0);
  // The reveal is an opacity transition: wait for the resting state before reading what is visible.
  await expect(product.locator(QUICK)).toHaveCSS('opacity', '0');
  expect(await visibleButtons(product)).toEqual([]);
  await expect(product.locator('.ce-product-media button, .ce-product-add')).toHaveCount(0);
  await expect(product.getByRole('button', { name: /favoritos/ })).toHaveCount(0);
  await product.hover();
  await expect(product.locator(QUICK)).toHaveCSS('opacity', '1');
  expect(await visibleButtons(product)).toEqual(['Añadir MENE, Taza de Vidrio Resistente al Calor al carrito']);
  // Keyboard focus inside the card shows the same, and nothing else.
  await page.mouse.move(0, 0);
  await product.locator('.ce-product-link').focus();
  await expect(product.locator(QUICK)).toHaveCSS('opacity', '1');
  expect(await visibleButtons(product)).toEqual(['Añadir MENE, Taza de Vidrio Resistente al Calor al carrito']);
  // Every card on the page: no favourite in the media box and no full-width add button.
  await expect(page.locator('.ce-product-media button')).toHaveCount(0);
  await expect(page.locator('.ce-product-add')).toHaveCount(0);
});

// Whole-card navigation: every ordinary part of the card opens the product page, measured on the reference listing.
const CARD_PARTS = { photo: '.ce-product-media', identity: '.ce-product-description', specs: '.ce-product-specs', price: '.ce-price-block', availability: '.ce-stock' };
for (const [part, selector] of Object.entries(CARD_PARTS)) {
  test(`acceptance 1: at 390 nothing is added from a card, and a click on its ${part} opens the product page`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(LISTING);
    const product = firstCard(page);
    await expect(product.locator(QUICK)).toBeHidden();
    expect(await visibleButtons(product)).toEqual([]);
    await expect(page.locator('.ce-product-media button, .ce-product-add')).toHaveCount(0);
    await pointAt(page, product.locator(selector));
    await expect(page).toHaveURL(PRODUCT);
  });
}
test('acceptance 1: at 390 the empty space of a card opens the product page, and «Comparar» stays its own control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(LISTING);
  const product = firstCard(page);
  const compare = product.getByRole('checkbox', { name: 'Comparar' });
  await compare.click();
  await expect(compare).toBeChecked();
  await expect(page).toHaveURL(/\/tienda\/categoria\/$/);
  // The empty space at the inline end of the card, level with the short specs line.
  const card = await product.boundingBox();
  await pointAt(page, product.locator('.ce-product-specs'), { x: () => card.x + card.width - 4 });
  await expect(page).toHaveURL(PRODUCT);
});

test('acceptance 1: on touch and narrow screens the card is one link, and its other controls stay separate in their own order', async ({ page }) => {
  await open(page, card({ extras: true, quickAdd: true }), { width: 390 });
  await trackClicks(page);
  await expect(page.locator(QUICK)).toBeHidden();
  // Keyboard order is the document order: «Comparar», the control in the photo box, the product link, the variant link, the task.
  await page.locator('#antes').focus();
  const order = [];
  for (let step = 0; step < 5; step += 1) { await page.keyboard.press('Tab'); order.push(await page.evaluate(() => document.activeElement.closest('label')?.textContent.trim() ?? document.activeElement.getAttribute('aria-label') ?? document.activeElement.textContent.trim())); }
  expect(order).toEqual(['Comparar', 'Marcar MENE', 'MENETaza de Vidrio', 'NOME', 'Quitar de favoritos']);
  // Each separate control takes its own click, at the point a person would press it, and the product link takes none of them.
  await pointAt(page, page.locator('.ce-product-select input'));
  await expect(page.getByRole('checkbox', { name: 'Comparar' })).toBeChecked();
  expect(await takeClicks(page)).toEqual(['compare']);
  // A control placed before the photo's own link in the photo box stays on top of it.
  await pointAt(page, page.locator('#marca'));
  expect(await takeClicks(page)).toEqual(['marca']);
  await pointAt(page, page.locator('#tarea'));
  expect(await takeClicks(page)).toEqual(['tarea']);
  await expect(page).toHaveURL(/card\.html$/);
  await pointAt(page, page.locator('.ce-variant-thumbs a'));
  expect(await takeClicks(page)).toEqual(['variant']);
  await expect(page).toHaveURL(/#variante$/);
  // Every ordinary part of the card is the product link.
  for (const selector of ['.ce-product-specs', '.ce-price-block', '.ce-stock', '.ce-product-media .ce-media-missing']) {
    await page.evaluate(() => { history.replaceState(null, '', location.pathname); });
    await pointAt(page, page.locator(selector));
    expect(await takeClicks(page), selector).toEqual(['product']);
    await expect(page, selector).toHaveURL(/#producto$/);
  }
  // On a hover-capable desktop the card keeps its separate photo and identity links and its quick-add.
  await open(page, card({ extras: true }), { width: 1440 });
  await trackClicks(page);
  await pointAt(page, page.locator('.ce-product-specs'));
  expect(await takeClicks(page)).toEqual([]);
  await expect(page).toHaveURL(/card\.html$/);
});

// Every native control type the whole-card link keeps separate (a[href], button, input with its label, select, textarea, summary),
// in one card: each takes its own pointer or touch press and keeps its place in the keyboard order. The photo box holds a button and
// a link of its own before the photo's link; the recipe sizes every direct photo-box link like the photo, so this fixture gives its
// own link a control's size and corner inline. Custom role="button" elements
// and controls inside an ancestor with its own stacking context are outside what the recipe keeps separate (see the guideline).
const controlsCard = `<article class="ce-product" style="width:300px">
  <label class="ce-check ce-product-select"><input type="checkbox" />Comparar</label>
  <div class="ce-product-media"><button class="ce-icon-button ce-icon-button--small" type="button" id="marca" aria-label="Marcar MENE">${ICON}</button><a class="ce-icon-button ce-icon-button--small" href="#detalle" id="detalle-enlace" aria-label="Ver el detalle de MENE" style="width:40px;height:40px;left:0;right:auto">${ICON}</a><a href="#producto" tabindex="-1" aria-hidden="true"><span class="ce-media-missing">Foto no disponible</span></a></div>
  <div class="ce-product-info">
    <div class="ce-product-row"><h3 class="ce-product-heading"><a class="ce-product-link" href="#producto"><span class="ce-product-name">MENE</span><span class="ce-product-description">Taza de Vidrio</span></a></h3></div>
    <p class="ce-product-specs">vidrio borosilicato, 250ml</p>
    ${priceHtml('12.5')}
    <div class="ce-variant-more"><span>Más opciones</span><ul class="ce-variant-thumbs"><li><a href="#variante"><span class="ce-media-missing">NOME</span></a></li></ul></div>
    <select class="ce-select" id="cantidad" aria-label="Cantidad"><option>1</option><option>2</option></select>
    <textarea class="ce-textarea" id="nota" aria-label="Nota" rows="2"></textarea>
    <details class="ce-disclosure"><summary id="detalles">Detalles</summary><p>Vidrio borosilicato.</p></details>
    <button class="ce-link" type="button" id="tarea">Quitar de favoritos</button>
  </div>
</article>`;
async function checkControls(page, tap) {
  await trackClicks(page);
  // Keyboard: the document order, with the photo's own link out of it.
  await page.locator('#antes').focus();
  const order = [];
  for (let step = 0; step < 9; step += 1) { await page.keyboard.press('Tab'); order.push(await page.evaluate(() => { const el = document.activeElement; return el.matches('.ce-product-link') ? 'product' : el.matches('.ce-variant-thumbs a') ? 'variant' : el.type === 'checkbox' ? 'compare' : el.id; })); }
  expect(order).toEqual(['compare', 'marca', 'detalle-enlace', 'product', 'variant', 'cantidad', 'nota', 'detalles', 'tarea']);
  await page.locator('#antes').focus();
  // Pointer or touch: each control takes its own press, the product link takes none of them.
  await pointAt(page, page.locator('.ce-product-select'), { tap });
  expect(await takeClicks(page)).toEqual(['compare']);
  await expect(page.getByRole('checkbox', { name: 'Comparar' })).toBeChecked();
  await pointAt(page, page.locator('#marca'), { tap });
  expect(await takeClicks(page)).toEqual(['marca']);
  // The select opens its own picker (the select recipe uses the customizable base-select where supported); Escape closes it and
  // leaves the select focused.
  await pointAt(page, page.locator('#cantidad'), { tap });
  expect(await takeClicks(page)).toEqual(['cantidad']);
  await page.keyboard.press('Escape');
  await expect(page.locator('#cantidad')).toBeFocused();
  await pointAt(page, page.locator('#nota'), { tap });
  expect(await takeClicks(page)).toEqual(['nota']);
  await expect(page.locator('#nota')).toBeFocused();
  await pointAt(page, page.locator('#detalles'), { tap });
  expect(await takeClicks(page)).toEqual(['detalles']);
  await expect(page.locator('details')).toHaveAttribute('open', '');
  await pointAt(page, page.locator('#tarea'), { tap });
  expect(await takeClicks(page)).toEqual(['tarea']);
  await expect(page).toHaveURL(/card\.html$/);
  // The photo box's own link opens its own destination, not the product.
  await pointAt(page, page.locator('#detalle-enlace'), { tap });
  expect(await takeClicks(page)).toEqual(['detalle-enlace']);
  await expect(page).toHaveURL(/#detalle$/);
  await pointAt(page, page.locator('.ce-variant-thumbs a'), { tap });
  expect(await takeClicks(page)).toEqual(['variant']);
  await expect(page).toHaveURL(/#variante$/);
  await pointAt(page, page.locator('.ce-product-specs'), { tap });
  expect(await takeClicks(page)).toEqual(['product']);
  await expect(page).toHaveURL(/#producto$/);
}
// Keyboard activation of each control under the cover. The select is checked for pointer press and focus only: how its value changes
// from the keyboard differs between the customizable picker and the native one.
async function checkKeyboard(page) {
  await trackClicks(page);
  const press = async (selector, key) => { await page.locator(selector).focus(); await page.keyboard.press(key); };
  await press('.ce-product-select input', 'Space');
  await expect(page.getByRole('checkbox', { name: 'Comparar' })).toBeChecked();
  expect(await takeClicks(page)).toEqual(['compare']);
  await press('#marca', 'Enter');
  await press('#marca', 'Space');
  expect(await takeClicks(page)).toEqual(['marca', 'marca']);
  await page.locator('#nota').focus();
  await page.keyboard.type('Sin tapa');
  await expect(page.locator('#nota')).toHaveValue('Sin tapa');
  await press('#detalles', 'Enter');
  await expect(page.locator('details')).toHaveAttribute('open', '');
  expect(await takeClicks(page)).toEqual(['detalles']);
  await press('#tarea', 'Space');
  expect(await takeClicks(page)).toEqual(['tarea']);
  await expect(page).toHaveURL(/card\.html$/);
  for (const [selector, name, destination] of [['#detalle-enlace', 'detalle-enlace', /#detalle$/], ['.ce-product-link', 'product', /#producto$/], ['.ce-variant-thumbs a', 'variant', /#variante$/]]) {
    await press(selector, 'Enter');
    expect(await takeClicks(page), selector).toEqual([name]);
    await expect(page, selector).toHaveURL(destination);
  }
}
test('acceptance 1: at 390 every native control type in a card keeps its own pointer target and keyboard place', async ({ page }) => {
  await open(page, controlsCard, { width: 390 });
  await checkControls(page, false);
  await open(page, controlsCard, { width: 390 });
  await checkKeyboard(page);
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, viewport: { width: 1440, height: 900 } });
  test('acceptance 1: at 1440 under (hover: none) no add of any kind is shown, and a tap on the specs opens the product page', async ({ page }) => {
    await page.goto(LISTING);
    test.skip(!(await page.evaluate(() => matchMedia('(hover: none)').matches)), 'This browser does not emulate (hover: none) for a touch context.');
    const product = firstCard(page);
    await expect(product.locator(QUICK)).toBeHidden();
    await product.locator('.ce-product-link').focus();
    expect(await visibleButtons(product)).toEqual([]);
    await pointAt(page, product.locator('.ce-product-specs'), { tap: true });
    await expect(page).toHaveURL(PRODUCT);
  });
  test('acceptance 1: under (hover: none) a tap on the price opens the product page; a variant or photo-box control tap stays its own', async ({ page }) => {
    await open(page, card({ extras: true }));
    test.skip(!(await page.evaluate(() => matchMedia('(hover: none)').matches)), 'This browser does not emulate (hover: none) for a touch context.');
    await trackClicks(page);
    await expect(page.locator(QUICK)).toBeHidden();
    await pointAt(page, page.locator('#marca'), { tap: true });
    expect(await takeClicks(page)).toEqual(['marca']);
    await pointAt(page, page.locator('.ce-variant-thumbs a'), { tap: true });
    expect(await takeClicks(page)).toEqual(['variant']);
    await expect(page).toHaveURL(/#variante$/);
    await pointAt(page, page.locator('.ce-price-block'), { tap: true });
    expect(await takeClicks(page)).toEqual(['product']);
    await expect(page).toHaveURL(/#producto$/);
  });
  test('acceptance 1: under (hover: none) every native control type in a card keeps its own tap target and keyboard place', async ({ page }) => {
    await open(page, controlsCard);
    test.skip(!(await page.evaluate(() => matchMedia('(hover: none)').matches)), 'This browser does not emulate (hover: none) for a touch context.');
    await checkControls(page, true);
  });
  test('acceptance 2b: under (hover: none) a leftover ce-product-add stays hidden', async ({ page }) => {
    await open(page, card({ legacy: true }));
    test.skip(!(await page.evaluate(() => matchMedia('(hover: none)').matches)), 'This browser does not emulate (hover: none) for a touch context.');
    await expect(page.locator('.ce-product-add')).toBeHidden();
    await expect(page.locator(QUICK)).toBeHidden();
  });
});

// The geometry matrix for acceptance 2. Shapes: the identity shapes the guideline documents (Description and specs optional), a store
// note in place of a price, wide decimal-string prices, long and unbreakable text, and a card holding other controls.
const SHAPES = {
  'one-line Description': {},
  'two-line Description': { description: 'Taza de Vidrio Resistente al Calor con Tapa Hermética y Asa' },
  'no specs': { specs: null },
  'no specs, wide price': { specs: null, amount: '1250.90' },
  'no Description': { description: null },
  'no Description, wide price': { description: null, amount: '1250.90' },
  'NAME only': { description: null, specs: null },
  'NAME only, wide price': { description: null, specs: null, amount: '1250.90' },
  'NAME only, store note': { description: null, specs: null, note: true },
  // Empty Description and specs elements are not content: the card is a NAME-only card.
  'NAME only, empty elements': { description: null, specs: null, empty: true },
  'NAME only, empty elements, wide price': { description: null, specs: null, empty: true, amount: '1250.90' },
  'store note': { note: true },
  'wide price': { amount: '1250.90' },
  'long text': { name: 'BALTEL STORM', description: 'Juego de Frascos de Vidrio Herméticos con Tapa de Bambú y Cucharita Medidora', specs: 'vidrio borosilicato, bambú natural, silicona alimentaria, 3 piezas de 250ml, 500ml y 750ml', amount: '1250.90' },
  'unbreakable specs': { specs: 'vidrioborosilicatoresistentealcalorde250mlconbordereforzado' },
  'other controls': { extras: true },
};
const WIDTHS = [300, 200, 150];
// A NAME with no Description and no specs leaves no room for the 44px action above the price 12px below it (measured: in a 150px
// card the digits of S/12.5 run 1.9px under the action), so the recipe does not show the optional quick-add in that shape.
const NO_ROOM = (shape) => shape.startsWith('NAME only');
// How the text is sized. Root text scales the rem-based text only: the card price is set in px (44px), so a separate case enlarges
// every text, the price included, by setting the card price to the same factor in this harness. Explicit px product text sizes are
// measured as given; nothing below is claimed for a size that is not listed here.
const MODES = [
  { label: 'default text', root: '100%', identity: 1, rem: 1, price: 1 },
  { label: 'root text 150% (the px card price stays 44px)', root: '150%', identity: 1.5, rem: 1.5, price: 1 },
  { label: 'root text 200% (the px card price stays 44px)', root: '200%', identity: 2, rem: 2, price: 1 },
  { label: 'every text x1.5 (root 150%, card price 66px)', root: '150%', identity: 1.5, rem: 1.5, price: 1.5, extra: '.ce-scope .ce-product .ce-price { font-size: 66px; }' },
  { label: 'every text x2 (root 200%, card price 88px)', root: '200%', identity: 2, rem: 2, price: 2, extra: '.ce-scope .ce-product .ce-price { font-size: 88px; }' },
  { label: 'product text 24px', root: '100%', productText: '24px', identity: 1.5, rem: 1, price: 1 },
  { label: 'product text 14px', root: '100%', productText: '14px', identity: 0.875, rem: 1, price: 1 },
  { label: 'product text 12px', root: '100%', productText: '12px', identity: 0.75, rem: 1, price: 1 },
];

// One card's geometry: the action's box and hit points; the ink of every line of text and the box of every other target that lies
// under the action; the ProductStack offsets; and the computed font sizes. Ink is measured from the font's own glyph bounds (canvas
// measureText on the element's computed font), so the empty space a line box or a font's content area keeps above and below the
// letters is not counted as text under the action.
const geometry = (root) => {
  (root.querySelector('.ce-icon-button--action') ?? root).scrollIntoView({ block: 'center' });
  const rect = (el) => el && el.getBoundingClientRect();
  const top = rect(root).top;
  const button = root.querySelector('.ce-icon-button--action');
  const b = button && button.getClientRects().length ? rect(button) : null;
  const overlap = (r) => b && Math.min(r.right, b.right) - Math.max(r.left, b.left) > 0.5 && Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top) > 0.5;
  const context = document.createElement('canvas').getContext('2d');
  const ink = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent.trim();
    if (!text || node.parentElement.closest('.ce-sr-only, .ce-icon-button--action')) continue;
    const style = getComputedStyle(node.parentElement);
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const m = context.measureText(text);
    const range = document.createRange(); range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      const glyphs = { left: r.left, right: r.right, top: r.top + m.fontBoundingBoxAscent - m.actualBoundingBoxAscent, bottom: r.top + m.fontBoundingBoxAscent + m.actualBoundingBoxDescent };
      if (overlap(glyphs)) ink.push(`${text.slice(0, 16)}: ${(Math.min(glyphs.bottom, b.bottom) - Math.max(glyphs.top, b.top)).toFixed(1)} × ${(Math.min(r.right, b.right) - Math.max(r.left, b.left)).toFixed(1)}px`);
    }
  }
  const targets = [...root.querySelectorAll('a, button, input, label, select, textarea')].filter((el) => el !== button && el.getClientRects().length && overlap(rect(el))).map((el) => el.className || el.tagName);
  const cx = b ? b.left + b.width / 2 : 0, cy = b ? b.top + b.height / 2 : 0;
  // Where the action would sit, at the row's top inline-end corner: what a pointer there reaches, and whether it can take focus.
  const rowBox = rect(root.querySelector('.ce-product-row'));
  const corner = document.elementFromPoint(getComputedStyle(root).direction === 'rtl' ? rowBox.left + 22 : rowBox.right - 22, rowBox.top + 22);
  let focusable = false;
  if (button) { button.focus({ preventScroll: true }); focusable = document.activeElement === button; button.blur(); }
  const hits = b ? [[0, 0], [-20, 0], [20, 0], [0, -20], [0, 20], [-14, -14], [14, 14]].map(([dx, dy]) => button.contains(document.elementFromPoint(cx + dx, cy + dy))) : [];
  const box = (selector) => { const el = root.querySelector(selector); const r = rect(el); return r && { top: r.top - top, bottom: r.bottom - top, height: r.height, font: parseFloat(getComputedStyle(el).fontSize) }; };
  const info = rect(root.querySelector('.ce-product-info'));
  const link = rect(root.querySelector('.ce-product-link'));
  const rtl = getComputedStyle(root).direction === 'rtl';
  return {
    button: b && [b.width, b.height], hits, ink, targets, focusable, cornerIsAction: Boolean(button && button.contains(corner)),
    reserved: [...root.querySelectorAll('.ce-product-info > *')].map((el) => parseFloat(getComputedStyle(el).paddingInlineEnd)).filter((value) => value > 0),
    // The action sits at the inline end of the card; the link's focus ring (2px at a 3px offset) ends before the action.
    end: b && Math.abs(rtl ? b.left - info.left : info.right - b.right),
    ringGap: b && (rtl ? link.left - 5 - b.right : b.left - (link.right + 5)),
    row: box('.ce-product-row'), heading: box('.ce-product-heading'), name: box('.ce-product-name'), description: box('.ce-product-description'),
    specs: box('.ce-product-specs'), price: box('.ce-price-block') ?? box('.ce-store-note'), priceFont: box('.ce-price')?.font, note: box('.ce-store-note')?.font, stock: box('.ce-stock')?.font,
  };
};

for (const dir of ['ltr', 'rtl']) {
  for (const mode of MODES) {
    test(`acceptance 2 (${dir}, ${mode.label}): the 44 × 44 quick action leaves the ProductStack and the price in place, over no text or target`, async ({ page }) => {
      const style = mode.productText ? `--ce-product-text:${mode.productText};` : '';
      const cells = Object.entries(SHAPES).flatMap(([shape, fields]) => WIDTHS.flatMap((width) => [true, false].map((quickAdd) => `<div data-shape="${shape}" data-width="${width}" data-quick="${quickAdd}">${card({ ...fields, width, quickAdd, style })}</div>`)));
      await open(page, `<div class="matrix" style="display:flex;flex-wrap:wrap;align-items:flex-start;gap:24px">${cells.join('')}</div>`, { root: mode.root, extra: mode.extra ?? '', dir });
      const results = await page.locator('.matrix > div').evaluateAll((items, source) => {
        const measure = new Function(`return (${source})`)();
        return items.map((cell) => ({ shape: cell.dataset.shape, width: cell.dataset.width, quick: cell.dataset.quick === 'true', ...measure(cell.querySelector('.ce-product')) }));
      }, geometry.toString());
      // The text really is the size the case names: NAME 15px, Description 16px and specs 14px at 1, the rem text 14px, the price 44px.
      const sample = results.find((item) => !item.quick && item.shape === 'one-line Description' && item.width === '300');
      expect([sample.name.font, sample.description.font, sample.specs.font], 'identity sizes').toEqual([15, 16, 14].map((size) => size * mode.identity));
      expect([sample.stock, results.find((item) => item.shape === 'store note').note], 'rem text sizes').toEqual([14 * mode.rem, 14 * mode.rem]);
      expect(sample.priceFont, 'card price size').toBe(44 * mode.price);
      for (const result of results.filter((item) => item.quick && NO_ROOM(item.shape))) {
        const label = `${result.shape}, ${result.width}px card`;
        const bare = results.find((item) => !item.quick && item.shape === result.shape && item.width === result.width);
        // The optional quick-add is not shown: no box, no focus, nothing under a pointer, no reserved space, and the card is the
        // same as the card without it.
        expect.soft(result.button, `${label}: action shown`).toBeNull();
        expect.soft(result.focusable, `${label}: action focusable`).toBe(false);
        expect.soft(result.cornerIsAction, `${label}: action under a pointer`).toBe(false);
        expect.soft(result.reserved, `${label}: reserved space`).toEqual([]);
        expect.soft(Math.abs(result.price.top - bare.price.top), `${label}: price position`).toBeLessThan(0.5);
        expect.soft(Math.abs(result.price.top - (result.specs ?? result.heading).bottom - 12), `${label}: to price or store note`).toBeLessThan(0.5);
      }
      for (const result of results.filter((item) => item.quick && !NO_ROOM(item.shape))) {
        const label = `${result.shape}, ${result.width}px card`;
        const bare = results.find((item) => !item.quick && item.shape === result.shape && item.width === result.width);
        expect.soft(result.focusable, `${label}: action focusable`).toBe(true);
        expect.soft(result.button, `${label}: action box`).toEqual([44, 44]);
        expect.soft(result.hits, `${label}: hit points`).toEqual(result.hits.map(() => true));
        expect.soft(result.end, `${label}: action at the inline end`).toBeLessThan(0.5);
        expect.soft(result.ringGap, `${label}: product link ring clear of the action`).toBeGreaterThanOrEqual(6.5);
        expect.soft(result.ink, `${label}: text ink under the action`).toEqual([]);
        expect.soft(result.targets, `${label}: targets under the action`).toEqual([]);
        // The action adds no height: the row is the heading, and the ProductStack offsets are the tokens.
        expect.soft(Math.abs(result.row.height - result.heading.height), `${label}: row height`).toBeLessThan(0.5);
        if (result.description) expect.soft(Math.abs(result.description.top - result.name.bottom - 2), `${label}: NAME to Description`).toBeLessThan(0.5);
        if (result.specs) expect.soft(Math.abs(result.specs.top - (result.description ?? result.name).bottom - 2), `${label}: identity to specs`).toBeLessThan(0.5);
        expect.soft(Math.abs(result.price.top - (result.specs ?? result.heading).bottom - 12), `${label}: to price or store note`).toBeLessThan(0.5);
        // With the same text layout, the price sits exactly where it sits without the action.
        const sameText = ['heading', 'specs'].every((key) => Math.abs((result[key]?.height ?? 0) - (bare[key]?.height ?? 0)) < 0.5);
        if (sameText) expect.soft(Math.abs(result.price.top - bare.price.top), `${label}: price displacement`).toBeLessThan(0.5);
      }
      // Hidden or shown, the action takes the same space: hovering the card moves nothing.
      const product = page.locator('[data-shape="one-line Description"][data-width="300"][data-quick="true"] .ce-product');
      const priceTop = () => product.evaluate((el) => el.querySelector('.ce-price-block').getBoundingClientRect().top - el.getBoundingClientRect().top);
      const resting = await priceTop();
      await product.hover();
      await expect(product.locator(QUICK)).toHaveCSS('opacity', '1');
      expect(Math.abs((await priceTop()) - resting)).toBeLessThan(0.5);
      // The matrix holds the case the action would otherwise stretch: at default text a NAME with a one-line Description is under 44px.
      if (mode.label === 'default text') expect(sample.heading.height).toBeLessThan(44);
    });
  }
}

test('acceptance 2: on the reference listing every quick action is 44 × 44 and hover moves nothing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LISTING);
  const sizes = await page.locator(`[data-store-view="tacna"] ${QUICK}`).evaluateAll((items) => items.map((el) => [el.getBoundingClientRect().width, el.getBoundingClientRect().height]));
  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) expect(size).toEqual([44, 44]);
  const gaps = await page.locator('[data-store-view="tacna"] .ce-product-info:has(.ce-icon-button--action)').evaluateAll((items) => items.map((info) => info.querySelector('.ce-product-specs').getBoundingClientRect().top - info.querySelector('.ce-product-description').getBoundingClientRect().bottom));
  for (const gap of gaps) expect(Math.abs(gap - 2)).toBeLessThan(0.5);
  const product = firstCard(page);
  const priceTop = () => product.evaluate((el) => el.querySelector('.ce-price-block').getBoundingClientRect().top - el.getBoundingClientRect().top);
  await page.mouse.move(0, 0);
  const resting = await priceTop();
  await product.hover();
  await expect(product.locator(QUICK)).toHaveCSS('opacity', '1');
  expect(Math.abs((await priceTop()) - resting)).toBeLessThan(0.5);
});

test('acceptance 2b: a leftover ce-product-add renders no visible add at 1440 and at 390', async ({ page }) => {
  for (const width of [1440, 390]) {
    await open(page, card({ legacy: true }), { width });
    await expect(page.locator('.ce-product-add')).toBeHidden();
    expect(await page.locator('.ce-product-add').evaluate((el) => getComputedStyle(el).display)).toBe('none');
    await page.locator('.ce-product').hover();
    await expect(page.locator('.ce-product-add')).toBeHidden();
  }
});

test('acceptance 2c: under reduced motion the hovered or focused quick action has no transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, card());
  const quick = page.locator(QUICK);
  const transition = () => quick.evaluate((el) => ({ property: getComputedStyle(el).transitionProperty, duration: getComputedStyle(el).transitionDuration }));
  await page.locator('.ce-product').hover();
  expect(await transition()).toEqual({ property: 'none', duration: '0s' });
  await page.mouse.move(0, 0);
  await quick.focus();
  expect(await transition()).toEqual({ property: 'none', duration: '0s' });
  // Without the preference the reveal keeps its quick opacity transition.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect((await transition()).property).toBe('opacity');
});

test('acceptance 3: Tab reaches the product link, then the quick action with its focus ring; Enter and Space activate it', async ({ page }) => {
  await open(page, card());
  await page.evaluate(() => { window.activations = 0; document.querySelector('.ce-icon-button--action').addEventListener('click', () => { window.activations += 1; }); });
  await page.locator('#antes').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.ce-product-link')).toBeFocused();
  await page.keyboard.press('Tab');
  const quick = page.locator(QUICK);
  await expect(quick).toBeFocused();
  await expect(quick).toHaveCSS('opacity', '1');
  const ring = await quick.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth, offset: getComputedStyle(el).outlineOffset }));
  expect(ring).toEqual({ style: 'solid', width: '2px', offset: '3px' });
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  expect(await page.evaluate(() => window.activations)).toBe(2);
  // The same order on the reference listing: the product link, then its quick action.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LISTING);
  const product = firstCard(page);
  await product.locator('.ce-product-link').focus();
  await page.keyboard.press('Tab');
  await expect(product.locator(QUICK)).toBeFocused();
  await expect(product.locator(QUICK)).toHaveCSS('opacity', '1');
});

for (const width of [1440, 390]) {
  test(`acceptance 4: at ${width} the product page has one primary add to cart and one product-named favourite`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tienda/producto/');
    const box = page.locator('.ce-buy-box');
    const primary = await box.locator('.ce-button:not(.ce-button--secondary):not(.ce-button--ink)').evaluateAll((items) => items.filter((el) => el.getClientRects().length > 0).map((el) => el.textContent.trim()));
    expect(primary).toEqual(['Añadir al carrito']);
    await expect(page.getByRole('button', { name: 'Añadir al carrito', exact: true })).toHaveCount(1);
    expect((await box.getByRole('button', { name: 'Añadir al carrito', exact: true }).boundingBox()).height).toBeGreaterThanOrEqual(56);
    const favourite = box.getByRole('button', { name: /favoritos/ });
    await expect(favourite).toHaveCount(1);
    await expect(favourite).toHaveAccessibleName(/^Guardar [A-Z]+, .+ en favoritos$/);
    await expect(favourite).toHaveAttribute('aria-pressed', 'false');
    await favourite.click();
    await expect(favourite).toHaveAttribute('aria-pressed', 'true');
    // CE Theme ships no sticky buy bar; a consumer's bar would replace the inline action, never sit beside it.
    await expect(page.locator('[class*="sticky-buy"], [class*="buy-bar"]')).toHaveCount(0);
  });
}
