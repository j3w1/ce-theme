import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// StoreBar (CR-05): the in-page store line, a ce-store-note whose action is a ce-link. The states are measured in the
// StoreContext design-system card itself, rendered with the supplied Inter files and the generated tokens and recipes and no
// other CSS beyond the root text size of each case; the card is served from a stand-in origin so that recipes/fonts.css finds
// the Inter files at ../fonts/inter/. The storefront examples are measured on the site.
const ORIGIN = 'http://store-bar.test';
const css = readFileSync('recipes/fonts.css', 'utf8') + readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');
const card = readFileSync('exports/design-system/project/components/StoreContext/preview.html', 'utf8');
const WIDTHS = [390, 768, 1440];
const SCALES = ['100%', '150%', '200%'];

async function mountCard(page, width, scale) {
  await page.setViewportSize({ width, height: 900 });
  const html = card.replace('<meta charset="utf-8">', `<meta charset="utf-8"><style>${css}</style><style>html { font-size: ${scale}; }</style>`);
  await page.route(`${ORIGIN}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === '/recipes/card.html') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    const font = pathname.match(/^\/fonts\/inter\/(Inter-[A-Za-z]+\.woff2)$/);
    if (font) return route.fulfill({ contentType: 'font/woff2', body: readFileSync(`fonts/inter/${font[1]}`) });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.goto(`${ORIGIN}/recipes/card.html`);
  // Measure only once the faces the bar draws with (regular text, bold label and link) have loaded.
  const loaded = await page.evaluate(async () => {
    await Promise.all(['400 1em Inter', '700 1em Inter'].map((font) => document.fonts.load(font)));
    await document.fonts.ready;
    return [...document.fonts].filter((face) => face.family.replaceAll('"', '') === 'Inter' && ['400', '700'].includes(face.weight)).map((face) => face.status);
  });
  expect(loaded).toEqual(['loaded', 'loaded']);
}

// Every visible child of each bar stays inside it, and the bar stays inside the viewport.
const spill = (bars) => bars.evaluateAll((items) => items.flatMap((bar, index) => {
  const box = bar.getBoundingClientRect();
  const out = [...bar.querySelectorAll('*')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1);
  }).map((el) => `${index}:${el.tagName.toLowerCase()}`);
  return box.right > innerWidth + 1 ? [...out, `${index}:outside the viewport`] : out;
}));

for (const width of WIDTHS) {
  for (const scale of SCALES) {
    test(`StoreBar states at ${width}px, text ${scale}: a 44px action, no overflow, a long label wraps, the pill never overlaps the label`, async ({ page }) => {
      await mountCard(page, width, scale);
      const bars = page.locator('section[aria-label="Barra de tienda"] .ce-store-note');
      await expect(bars).toHaveCount(6);
      // The text really grows with the root size: the bar, its action and the pill are rem-based (14px, 14px and 12px at 100%).
      const factor = parseFloat(scale) / 100;
      const sizes = await bars.evaluateAll((items) => items.map((bar) => [bar, bar.querySelector(':scope > .ce-link, .ce-pill')].map((el) => getComputedStyle(el).fontSize)));
      expect(sizes).toEqual([0, 1, 2, 3, 4, 5].map((index) => [`${14 * factor}px`, `${([3, 5].includes(index) ? 12 : 14) * factor}px`]));
      // The action reaches the public target (--ce-size-target-public, 44px); without the rule it is one 1.2 line high.
      const heights = await bars.locator(':scope > .ce-link').evaluateAll((items) => items.map((el) => el.getBoundingClientRect().height));
      expect(heights).toHaveLength(4);
      for (const height of heights) expect(height).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await spill(bars)).toEqual([]);

      // The lead and the supplied store label wrap inside their own span instead of overflowing.
      const long = bars.filter({ hasText: 'nombre de tienda muy largo' });
      await expect(long).toHaveCount(2);
      for (const bar of await long.all()) {
        const lines = await bar.locator(':scope > span').first().evaluate((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
        expect(lines).toBeGreaterThan(1.5);
      }

      // Pending: the word «Actualizando» replaces the action, the bar is busy and a status, and the pill never covers the label.
      const pending = bars.filter({ has: page.locator('.ce-pill') });
      await expect(pending).toHaveCount(2);
      for (const bar of await pending.all()) {
        await expect(bar).toHaveAttribute('aria-busy', 'true');
        await expect(bar).toHaveAttribute('role', 'status');
        await expect(bar.locator('.ce-pill')).toHaveText('Actualizando');
        await expect(bar.locator('button, a')).toHaveCount(0);
        const overlap = await bar.evaluate((el) => {
          const a = el.querySelector(':scope > span:not(.ce-pill)').getBoundingClientRect();
          const b = el.querySelector('.ce-pill').getBoundingClientRect();
          return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        });
        expect(overlap).toBe(0);
      }
    });
  }
}

test('StoreBar states carry the documented wording and no amount', async ({ page }) => {
  await mountCard(page, 1440, '100%');
  const section = page.locator('section[aria-label="Barra de tienda"]');
  const bars = section.locator('.ce-store-note');
  expect(await bars.locator(':scope > span:first-child').allTextContents()).toEqual([
    'Importes en Tacna',
    'Precios y disponibilidad de Tacna',
    'Tienda: sin elegir',
    'Importes en Arequipa',
    'Precios y disponibilidad de Arequipa, tienda de ejemplo con un nombre de tienda muy largo',
    'Importes en Arequipa, tienda de ejemplo con un nombre de tienda muy largo',
  ]);
  expect(await bars.locator('.ce-link').allTextContents()).toEqual(['Cambiar tienda', 'Cambiar tienda', 'Elegir tienda', 'Cambiar tienda']);
  // No StoreBar state in the card carries an amount; the storefront tests below check the amounts beside the bar.
  await expect(section.locator('.ce-price')).toHaveCount(0);
  expect(await section.innerText()).not.toMatch(/S\/\s*\d/);
  // No bar but the pending ones is busy or a live region.
  await expect(section.locator('[aria-busy], [role="status"]')).toHaveCount(2);
  const results = await new AxeBuilder({ page }).include('section[aria-label="Barra de tienda"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((n) => n.target) }))).toEqual([]);
});

// The storefront bar is one element (site/components/StoreBar.astro); its lead and action label are per-store views, so the
// action keeps focus across changes. Every storefront page whose prices or availability depend on the store shows it.
const PAGES = [
  ['/tienda/carrito/', 'Importes en'],
  ['/tienda/categoria/', 'Precios y disponibilidad de'],
  ['/tienda/producto/', 'Precios y disponibilidad de'],
  ['/tienda/escena/', 'Precios y disponibilidad de'],
  ['/tienda/', 'Precios y disponibilidad de'],
];
const storeBar = (page) => page.locator('main .ce-store-note:visible').filter({ has: page.locator(':scope > .ce-link') });
const lead = (page) => storeBar(page).locator(':scope > span:visible');
// Store-supplied amounts that are shown: rendered prices, and plain-text amounts such as a cart total. The home page's
// price-band links («Hasta S/5», `ce-price-points`) name a price range, not a store's price; they are counted apart (`bands`)
// so the test states exactly what it leaves out.
const visibleAmounts = (page) => page.locator('main').evaluate((main) => {
  const store = (el) => !el.closest('.ce-price-points');
  const shown = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const prices = [...main.querySelectorAll('.ce-price')].filter((el) => el.offsetParent !== null);
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  let text = false;
  for (let node = walker.nextNode(); node && !text; node = walker.nextNode()) text = store(node.parentElement) && shown(node.parentElement) && /S\/\s*\d/.test(node.textContent);
  return { prices: prices.filter(store).length, text, bands: prices.length - prices.filter(store).length };
});
// The visible amounts in the cart: each line's price, the subtotal and the total.
const cartAmounts = (page) => page.locator('main').evaluate((main) => {
  const shown = (selector) => [...main.querySelectorAll(selector)].filter((el) => el.offsetParent !== null);
  return {
    lines: shown('.ce-cart-line .ce-price').map((el) => el.querySelector('.ce-sr-only').textContent),
    summary: shown('.ce-summary dd').map((el) => el.textContent),
  };
});
const TACNA = { lines: ['Precio actual: 13 soles', 'Precio actual: 8.5 soles'], summary: ['S/21.50', 'Sin costo', 'S/21.50'] };
const AREQUIPA = { lines: ['Precio actual: 13.8 soles', 'Precio actual: 8.5 soles'], summary: ['S/22.30', 'Sin costo', 'S/22.30'] };

// The preview serves the site under Astro's base (playwright.config.mjs), so a page is opened by its base-relative path.
const onSite = (route) => route.slice(1);

for (const [route, words] of PAGES) {
  test(`${route}: the StoreBar action is reachable by keyboard, shows the focus ring and opens the same dialog as the utility-bar button`, async ({ page }) => {
    await page.goto(onSite(route));
    await expect(storeBar(page)).toHaveCount(1);
    await expect(lead(page)).toHaveText(`${words} Tacna`);
    if (route === '/tienda/carrito/') expect(await cartAmounts(page)).toEqual(TACNA);
    const action = storeBar(page).getByRole('button', { name: 'Cambiar tienda' });
    const utility = page.getByRole('button', { name: /Tu tienda/ });
    expect(await action.getAttribute('data-ce-open')).toBe(await utility.getAttribute('data-ce-open'));

    // In the tab order: leaving and returning by keyboard lands on it with the global 2px focus ring.
    await action.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(action).not.toBeFocused();
    await page.keyboard.press('Tab');
    await expect(action).toBeFocused();
    expect(await action.evaluate((el) => { const s = getComputedStyle(el); return [s.outlineStyle, s.outlineWidth, s.outlineOffset]; })).toEqual(['solid', '2px', '3px']);

    // Enter opens the store dialog; Escape keeps the current store and returns focus to the action.
    const dialog = page.getByRole('dialog', { name: 'Elige tu tienda' });
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    expect(await dialog.getAttribute('id')).toBe(await utility.getAttribute('data-ce-open'));
    await dialog.getByLabel('Arequipa').check();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(action).toBeFocused();
    await expect(lead(page)).toHaveText(`${words} Tacna`);

    // Confirming a store from the StoreBar changes the same store as the utility-bar button, focus returns to the action,
    // and nothing on the page still names the previous store.
    await action.click();
    await dialog.getByLabel('Arequipa').check();
    await dialog.getByRole('button', { name: 'Usar esta tienda' }).click();
    await expect(dialog).toBeHidden();
    await expect(utility).toContainText('Arequipa');
    await expect(lead(page)).toHaveText(`${words} Arequipa`);
    await expect(action).toBeFocused();
    expect(await page.locator('main').innerText()).not.toContain('Tacna');
    // In the cart, the bar names the store whose amounts are shown: Arequipa's supplied amounts replace Tacna's.
    if (route === '/tienda/carrito/') expect(await cartAmounts(page)).toEqual(AREQUIPA);
  });

  test(`${route} without a store: «Tienda: sin elegir» with «Elegir tienda», and no store-supplied amount on the page`, async ({ page }) => {
    await page.goto(onSite(`${route}?tienda=ninguna`));
    await expect(storeBar(page)).toHaveCount(1);
    await expect(lead(page)).toHaveText('Tienda: sin elegir');
    const action = storeBar(page).getByRole('button', { name: 'Elegir tienda' });
    await expect(action).toBeVisible();
    expect(await visibleAmounts(page)).toEqual({ prices: 0, text: false, bands: route === '/tienda/' ? 3 : 0 });
    if (route === '/tienda/carrito/') {
      // The no-store messages take the place of each line amount and of the summary.
      await expect(page.locator('.ce-cart-line-body > .ce-store-note:visible')).toHaveText(['Elige tu tienda para ver el precio.', 'Elige tu tienda para ver el precio.']);
      await expect(page.locator('.ce-order-summary .ce-price-pending')).toBeVisible();
    }
    await action.click();
    const dialog = page.getByRole('dialog', { name: 'Elige tu tienda' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Tacna').check();
    await dialog.getByRole('button', { name: 'Usar esta tienda' }).click();
    await expect(lead(page)).toHaveText(`${words} Tacna`);
    await expect(storeBar(page).getByRole('button', { name: 'Cambiar tienda' })).toBeFocused();
    if (route === '/tienda/carrito/') expect(await cartAmounts(page)).toEqual(TACNA);
  });
}

test('/tienda/carrito/ opened for Arequipa shows Arequipa\'s supplied amounts with its bar', async ({ page }) => {
  await page.goto(onSite('/tienda/carrito/?tienda=arequipa'));
  await expect(lead(page)).toHaveText('Importes en Arequipa');
  expect(await cartAmounts(page)).toEqual(AREQUIPA);
});

for (const width of WIDTHS) {
  test(`storefront StoreBar fits at ${width}px with text enlarged to 150% and 200%, with a 44px action`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [route] of PAGES) {
      for (const query of ['', '?tienda=ninguna']) {
        for (const scale of SCALES) {
          const at = `${route}${query} ${scale}`;
          await page.goto(onSite(`${route}${query}`));
          await page.addStyleTag({ content: `html{font-size:${scale}}` });
          const bar = storeBar(page);
          await expect(bar, at).toHaveCount(1);
          // The bar's text really grows with the root size (0.875rem: 14px at 100%).
          expect(await bar.evaluate((el) => [el, el.querySelector(':scope > .ce-link')].map((item) => getComputedStyle(item).fontSize)), at).toEqual(Array(2).fill(`${14 * parseFloat(scale) / 100}px`));
          expect(await spill(bar), at).toEqual([]);
          expect(await bar.locator(':scope > .ce-link').evaluate((el) => el.getBoundingClientRect().height), at).toBeGreaterThanOrEqual(44);
          // The cart's no-store messages stay inside the viewport too.
          const outside = await page.locator('.ce-cart-line-body > .ce-store-note:visible, .ce-order-summary .ce-price-pending:visible').evaluateAll((items) => items.filter((el) => el.getBoundingClientRect().right > innerWidth + 1).length);
          expect(outside, at).toBe(0);
        }
      }
    }
  });
}
