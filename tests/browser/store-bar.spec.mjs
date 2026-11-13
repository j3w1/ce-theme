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

// The storefront bar is one element; its lead and action label are per-store views, so the action keeps focus across changes.
const storeBar = (page) => page.locator('main .ce-store-note:visible').filter({ has: page.locator(':scope > .ce-link') });
const lead = (page) => storeBar(page).locator(':scope > span:visible');
// The visible amounts in the cart: each line's price and the summary total.
const cartAmounts = (page) => page.locator('main').evaluate((main) => ({
  lines: [...main.querySelectorAll('.ce-cart-line .ce-price')].filter((el) => el.offsetParent !== null).map((el) => el.querySelector('.ce-sr-only').textContent),
  total: [...main.querySelectorAll('.ce-summary-total dd')].filter((el) => el.offsetParent !== null).map((el) => el.textContent),
}));
const TACNA = { lines: ['Precio actual: 13 soles', 'Precio actual: 8.5 soles'], total: ['S/21.50'] };
const AREQUIPA = { lines: ['Precio actual: 13.8 soles', 'Precio actual: 8.5 soles'], total: ['S/22.30'] };

for (const [route, words] of [['/tienda/carrito/', 'Importes en'], ['/tienda/categoria/', 'Precios y disponibilidad de']]) {
  test(`${route}: the StoreBar action is reachable by keyboard, shows the focus ring and opens the same dialog as the utility-bar button`, async ({ page }) => {
    await page.goto(route);
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

    // Confirming a store from the StoreBar changes the same store as the utility-bar button, and focus returns to the action.
    await action.click();
    await dialog.getByLabel('Arequipa').check();
    await dialog.getByRole('button', { name: 'Usar esta tienda' }).click();
    await expect(dialog).toBeHidden();
    await expect(utility).toContainText('Arequipa');
    await expect(lead(page)).toHaveText(`${words} Arequipa`);
    await expect(action).toBeFocused();
    // In the cart, the bar names the store whose amounts are shown: Arequipa's supplied amounts replace Tacna's.
    if (route === '/tienda/carrito/') expect(await cartAmounts(page)).toEqual(AREQUIPA);
  });
}

for (const route of ['/tienda/carrito/', '/tienda/categoria/']) {
  test(`${route} without a store: «Tienda: sin elegir» with «Elegir tienda», and no amount on the page`, async ({ page }) => {
    await page.goto(`${route}?tienda=ninguna`);
    await expect(storeBar(page)).toHaveCount(1);
    await expect(lead(page)).toHaveText('Tienda: sin elegir');
    const action = storeBar(page).getByRole('button', { name: 'Elegir tienda' });
    await expect(action).toBeVisible();
    expect(await page.locator('main .ce-price').evaluateAll((items) => items.filter((el) => el.offsetParent !== null).length)).toBe(0);
    expect(await page.locator('main').innerText()).not.toMatch(/S\/\s*\d/);
    await action.click();
    const dialog = page.getByRole('dialog', { name: 'Elige tu tienda' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Tacna').check();
    await dialog.getByRole('button', { name: 'Usar esta tienda' }).click();
    await expect(lead(page)).toHaveText(route === '/tienda/carrito/' ? 'Importes en Tacna' : 'Precios y disponibilidad de Tacna');
    await expect(storeBar(page).getByRole('button', { name: 'Cambiar tienda' })).toBeFocused();
    if (route === '/tienda/carrito/') expect(await cartAmounts(page)).toEqual(TACNA);
  });
}

for (const width of WIDTHS) {
  test(`storefront StoreBar fits at ${width}px and with larger text, with a 44px action`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/tienda/carrito/', '/tienda/carrito/?tienda=ninguna', '/tienda/categoria/', '/tienda/categoria/?tienda=ninguna']) {
      for (const scale of SCALES) {
        await page.goto(route);
        await page.addStyleTag({ content: `html{font-size:${scale}}` });
        const bar = storeBar(page);
        await expect(bar, `${route} ${scale}`).toHaveCount(1);
        expect(await spill(bar), `${route} ${scale}`).toEqual([]);
        expect(await bar.locator(':scope > .ce-link').evaluate((el) => el.getBoundingClientRect().height), `${route} ${scale}`).toBeGreaterThanOrEqual(44);
      }
    }
  });
}
