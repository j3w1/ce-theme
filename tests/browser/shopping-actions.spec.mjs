import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// CR-07, the shopping-action rule: browse-first cards, the optional QuickAdd on the active desktop card, nothing added from a card on
// touch or narrow screens, and one primary «Añadir al carrito» on the product page. Each test names the acceptance check it covers
// (docs/change-requests/CR-07-shopping-action-rule.md, section 6). Screen-reader and real-phone checks (6) are not run here.

const css = readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');
const ICON = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 7h14"/></svg>';
const LISTING = '/tienda/categoria/';
const firstCard = (page) => page.locator('[data-store-view="tacna"] .ce-product').first();
const QUICK = '.ce-product-row > .ce-icon-button--action';

// A card in the recipe's own markup, outside the reference site. `legacy` adds the deprecated full-width button of the earlier rule.
const card = ({ description = 'Taza de Vidrio', quickAdd = true, legacy = false } = {}) => `<article class="ce-product" style="width:300px">
  <div class="ce-product-media"><a href="#producto" tabindex="-1" aria-hidden="true"><span class="ce-media-missing">Foto no disponible</span></a></div>
  <div class="ce-product-info">
    <div class="ce-product-row"><h3 class="ce-product-heading"><a class="ce-product-link" href="#producto"><span class="ce-product-name">MENE</span><span class="ce-product-description">${description}</span></a></h3>${quickAdd ? `<button class="ce-icon-button ce-icon-button--action ce-icon-button--small" type="button" aria-label="Añadir MENE, ${description} al carrito">${ICON}</button>` : ''}</div>
    <p class="ce-product-specs">vidrio borosilicato, 250ml</p>
    <div class="ce-price-block"><span class="ce-price"><span class="ce-sr-only">Precio actual: 6.5 soles</span><span class="ce-price-amount"><span class="ce-price-currency" aria-hidden="true">S/</span><span class="ce-price-value" aria-hidden="true">6.5</span></span></span></div>
    ${legacy ? '<button class="ce-button ce-button--secondary ce-product-add" type="button">Añadir al carrito</button>' : ''}
  </div>
</article>`;
async function mount(page, html, width = 1440) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<style>${css}body{margin:0;padding:24px}</style><button type="button" id="antes">Antes</button><div class="ce-scope">${html}</div>`);
}
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
  expect(await visibleButtons(product)).toEqual([]);
  await expect(product.locator('.ce-product-media button, .ce-product-add')).toHaveCount(0);
  await expect(product.getByRole('button', { name: /favoritos/ })).toHaveCount(0);
  await product.hover();
  await expect(product.locator(QUICK)).toHaveCSS('opacity', '1');
  expect(await visibleButtons(product)).toEqual(['Añadir MENE, Taza de Vidrio Resistente al Calor al carrito']);
  // Keyboard focus inside the card shows the same, and nothing else.
  await page.mouse.move(0, 0);
  await product.locator('.ce-product-link').focus();
  expect(await visibleButtons(product)).toEqual(['Añadir MENE, Taza de Vidrio Resistente al Calor al carrito']);
  // Every card on the page: no favourite in the media box and no full-width add button.
  await expect(page.locator('.ce-product-media button')).toHaveCount(0);
  await expect(page.locator('.ce-product-add')).toHaveCount(0);
});

test('acceptance 1: at 390 nothing is added from a card, and the card opens the product page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(LISTING);
  const product = firstCard(page);
  await expect(product.locator(QUICK)).toBeHidden();
  await product.locator('.ce-product-media').hover();
  expect(await visibleButtons(product)).toEqual([]);
  await expect(page.locator('.ce-product-media button, .ce-product-add')).toHaveCount(0);
  // The photo and the identity are the same product link; the photo's copy stays out of the tab order and the accessibility tree.
  await expect(product.locator('.ce-product-media > a')).toHaveAttribute('href', '/tienda/producto/');
  await expect(product.locator('.ce-product-media > a')).toHaveAttribute('tabindex', '-1');
  await expect(product.locator('.ce-product-link')).toHaveAttribute('href', '/tienda/producto/');
  await product.locator('.ce-product-media img').click();
  await expect(page).toHaveURL(/\/tienda\/producto\/$/);
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, viewport: { width: 1440, height: 900 } });
  test('acceptance 1: at 1440 under (hover: none) no add of any kind is shown on a card', async ({ page }) => {
    await page.goto(LISTING);
    test.skip(!(await page.evaluate(() => matchMedia('(hover: none)').matches)), 'This browser does not emulate (hover: none) for a touch context.');
    const product = firstCard(page);
    await expect(product.locator(QUICK)).toBeHidden();
    await product.locator('.ce-product-link').focus();
    expect(await visibleButtons(product)).toEqual([]);
    await product.locator('.ce-product-link').tap();
    await expect(page).toHaveURL(/\/tienda\/producto\/$/);
  });
  test('acceptance 2b: under (hover: none) a leftover ce-product-add stays hidden', async ({ page }) => {
    await mount(page, card({ legacy: true }));
    test.skip(!(await page.evaluate(() => matchMedia('(hover: none)').matches)), 'This browser does not emulate (hover: none) for a touch context.');
    await expect(page.locator('.ce-product-add')).toBeHidden();
    await expect(page.locator(QUICK)).toBeHidden();
  });
});

// The identity shapes the ProductCard guideline documents (Description and specs are optional), long text, and a store note in place of
// a price. A one-line Description gives the shortest NAME-and-Description heading (about 39px), shorter than the 44px action.
const SHAPES = {
  'one-line Description': {},
  'two-line Description': { description: 'Taza de Vidrio Resistente al Calor con Tapa Hermética y Asa' },
  'no specs': { specs: null },
  'no Description': { description: null },
  'NAME only': { description: null, specs: null },
  'NAME only, store note': { description: null, specs: null, price: false },
  'store note': { price: false },
  'long text': { name: 'BALTEL STORM', description: 'Juego de Frascos de Vidrio Herméticos con Tapa de Bambú y Cucharita Medidora', specs: 'vidrio borosilicato, bambú natural, silicona alimentaria, 3 piezas de 250ml, 500ml y 750ml' },
  'unbreakable specs': { specs: 'vidrioborosilicatoresistentealcalorde250mlconbordereforzado' },
};
const shapeCard = ({ name = 'MENE', description = 'Taza de Vidrio', specs = 'vidrio borosilicato, 250ml', price = true } = {}, { width, quickAdd }) => `<article class="ce-product" style="width:${width}px">
  <div class="ce-product-info">
    <div class="ce-product-row"><h3 class="ce-product-heading"><a class="ce-product-link" href="#producto"><span class="ce-product-name">${name}</span>${description ? `<span class="ce-product-description">${description}</span>` : ''}</a></h3>${quickAdd ? `<button class="ce-icon-button ce-icon-button--action ce-icon-button--small" type="button" aria-label="Añadir ${name} al carrito">${ICON}</button>` : ''}</div>
    ${specs ? `<p class="ce-product-specs">${specs}</p>` : ''}
    ${price ? '<div class="ce-price-block"><span class="ce-price"><span class="ce-sr-only">Precio actual: 12.5 soles</span><span class="ce-price-amount"><span class="ce-price-currency" aria-hidden="true">S/</span><span class="ce-price-value" aria-hidden="true">12.5</span></span></span></div>' : '<p class="ce-store-note">Precio no disponible en Arequipa.</p>'}
    <ul class="ce-stock"><li data-state="available">Disponible en Tacna</li></ul>
  </div>
</article>`;
// Geometry of one card: the action's box and hit points, every line of text and every other target, and the ProductStack offsets.
const geometry = (root) => {
  (root.querySelector('.ce-icon-button--action') ?? root).scrollIntoView({ block: 'center' });
  const rect = (el) => el && el.getBoundingClientRect();
  const top = rect(root).top;
  const button = root.querySelector('.ce-icon-button--action');
  const b = rect(button);
  const meets = (r) => b && r.width > 0 && r.height > 0 && Math.min(r.right, b.right) - Math.max(r.left, b.left) > 0.5 && Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top) > 0.5;
  const glyphs = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent.trim() || node.parentElement.closest('.ce-sr-only, .ce-icon-button--action')) continue;
    const range = document.createRange(); range.selectNodeContents(node);
    for (const r of range.getClientRects()) glyphs.push({ text: node.textContent.trim().slice(0, 24), r });
  }
  const targets = [...root.querySelectorAll('a, button, input, select, textarea')].filter((el) => el !== button);
  const cx = b ? b.left + b.width / 2 : 0, cy = b ? b.top + b.height / 2 : 0;
  const hits = b ? [[0, 0], [-20, 0], [20, 0], [0, -20], [0, 20], [-14, -14], [14, 14]].map(([dx, dy]) => button.contains(document.elementFromPoint(cx + dx, cy + dy))) : [];
  const box = (selector) => { const r = rect(root.querySelector(selector)); return r && { top: r.top - top, bottom: r.bottom - top, height: r.height }; };
  return {
    button: b && [b.width, b.height], hits,
    covered: glyphs.filter(({ r }) => meets(r)).map(({ text }) => text),
    coveredTargets: targets.filter((el) => meets(rect(el))).map((el) => el.className || el.tagName),
    row: box('.ce-product-row'), heading: box('.ce-product-heading'), name: box('.ce-product-name'), description: box('.ce-product-description'),
    specs: box('.ce-product-specs'), price: box('.ce-price-block') ?? box('.ce-store-note'),
  };
};

for (const scale of ['100%', '150%', '200%']) {
  test(`acceptance 2: at text ${scale} the 44 x 44 quick action leaves the ProductStack and the price in place, over no text or target`, async ({ page }) => {
    const widths = [300, 200, 150];
    const cells = Object.entries(SHAPES).flatMap(([shape, fields]) => widths.flatMap((width) => [true, false].map((quickAdd) => `<div data-shape="${shape}" data-width="${width}" data-quick="${quickAdd}">${shapeCard(fields, { width, quickAdd })}</div>`)));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.setContent(`<style>${css}html{font-size:${scale}}body{margin:0;padding:24px}.matrix{display:flex;flex-wrap:wrap;align-items:flex-start;gap:24px}</style><div class="ce-scope"><div class="matrix">${cells.join('')}</div></div>`);
    await page.evaluate(() => document.fonts.ready);
    const results = await page.locator('.matrix > div').evaluateAll((items, source) => {
      const measure = new Function(`return (${source})`)();
      return items.map((cell) => ({ shape: cell.dataset.shape, width: cell.dataset.width, quick: cell.dataset.quick === 'true', ...measure(cell.querySelector('.ce-product')) }));
    }, geometry.toString());
    for (const result of results.filter((item) => item.quick)) {
      const label = `${result.shape}, ${result.width}px card`;
      const bare = results.find((item) => !item.quick && item.shape === result.shape && item.width === result.width);
      expect(result.button, label).toEqual([44, 44]);
      expect(result.hits, `${label}: hit points`).toEqual(result.hits.map(() => true));
      expect(result.covered, `${label}: text under the action`).toEqual([]);
      expect(result.coveredTargets, `${label}: targets under the action`).toEqual([]);
      // The action adds no height: the row is the heading, and the ProductStack offsets are the tokens.
      expect(Math.abs(result.row.height - result.heading.height), `${label}: row height`).toBeLessThan(0.5);
      if (result.description) expect(Math.abs(result.description.top - result.name.bottom - 2), `${label}: NAME to Description`).toBeLessThan(0.5);
      const identityBottom = (result.description ?? result.name).bottom;
      if (result.specs) expect(Math.abs(result.specs.top - identityBottom - 2), `${label}: identity to specs`).toBeLessThan(0.5);
      expect(Math.abs(result.price.top - (result.specs ?? result.heading).bottom - 12), `${label}: specs to price`).toBeLessThan(0.5);
      // With the same text layout the price sits exactly where it sits without the action.
      const sameText = ['heading', 'specs'].every((key) => Math.abs((result[key]?.height ?? 0) - (bare[key]?.height ?? 0)) < 0.5);
      if (sameText) expect(Math.abs(result.price.top - bare.price.top), `${label}: price displacement`).toBeLessThan(0.5);
    }
    // The matrix holds the case the action would otherwise stretch: at 100% a NAME with a one-line Description is under 44px tall.
    if (scale === '100%') expect(results.find((item) => item.quick && item.shape === 'one-line Description' && item.width === '300').heading.height).toBeLessThan(44);
  });
}

test('acceptance 2: on the reference listing every quick action is 44 x 44 and hover moves nothing', async ({ page }) => {
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
    await mount(page, card({ legacy: true }), width);
    await expect(page.locator('.ce-product-add')).toBeHidden();
    expect(await page.locator('.ce-product-add').evaluate((el) => getComputedStyle(el).display)).toBe('none');
    await page.locator('.ce-product').hover();
    await expect(page.locator('.ce-product-add')).toBeHidden();
  }
});

test('acceptance 2c: under reduced motion the hovered or focused quick action has no transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mount(page, card());
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
  await mount(page, card());
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
