import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// StoreBar (CR-05): the in-page store line, a ce-store-note whose action is a ce-link. The states are measured in the
// StoreContext design-system card itself, rendered with the generated tokens and recipes and no other CSS (the card's
// fonts are not loaded, so text uses the fallback family); the storefront examples are measured on the site.
const css = readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');
const card = readFileSync('design-system/components/StoreContext/preview.html', 'utf8');
const WIDTHS = [390, 768, 1440];
const SCALES = ['100%', '150%', '200%'];

async function mountCard(page, width, scale) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(card.replace('</head>', `<style>${css}html{font-size:${scale}}</style></head>`));
}

// Every child of each bar stays inside it, and the bar stays inside the viewport.
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
    test(`StoreBar states at ${width}px, text ${scale}: no overflow, a long label wraps, the pill never overlaps the label`, async ({ page }) => {
      await mountCard(page, width, scale);
      const bars = page.locator('section[aria-label="Barra de tienda"] .ce-store-note');
      await expect(bars).toHaveCount(6);
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
  // The bar names the store only: no state, including no store and pending, sits beside an amount.
  await expect(section.locator('.ce-price')).toHaveCount(0);
  expect(await section.innerText()).not.toMatch(/S\/\s*\d/);
  // No bar but the pending ones is busy or a live region.
  await expect(section.locator('[aria-busy], [role="status"]')).toHaveCount(2);
  const results = await new AxeBuilder({ page }).include('section[aria-label="Barra de tienda"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((n) => n.target) }))).toEqual([]);
});

const storeBar = (page) => page.locator('main .ce-store-note:visible').filter({ has: page.locator(':scope > .ce-link') });

for (const [route, lead] of [['/tienda/carrito/', 'Importes en'], ['/tienda/categoria/', 'Precios y disponibilidad de']]) {
  test(`${route}: the StoreBar action is reachable by keyboard, shows the focus ring and opens the same dialog as the utility-bar button`, async ({ page }) => {
    await page.goto(route);
    const bar = storeBar(page);
    await expect(bar).toHaveCount(1);
    await expect(bar.locator(':scope > span')).toHaveText(`${lead} Tacna`);
    const action = bar.getByRole('button', { name: 'Cambiar tienda' });
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
    await expect(storeBar(page).locator(':scope > span')).toHaveText(`${lead} Tacna`);

    // Confirming a store from the StoreBar changes the same store as the utility-bar button.
    await action.click();
    await dialog.getByLabel('Arequipa').check();
    await dialog.getByRole('button', { name: 'Usar esta tienda' }).click();
    await expect(dialog).toBeHidden();
    await expect(utility).toContainText('Arequipa');
    await expect(storeBar(page).locator(':scope > span')).toHaveText(`${lead} Arequipa`);
  });
}

test('/tienda/categoria/ without a store: «Tienda: sin elegir» with «Elegir tienda», and no amount on the page', async ({ page }) => {
  await page.goto('/tienda/categoria/?tienda=ninguna');
  const bar = storeBar(page);
  await expect(bar).toHaveCount(1);
  await expect(bar.locator(':scope > span')).toHaveText('Tienda: sin elegir');
  const action = bar.getByRole('button', { name: 'Elegir tienda' });
  await expect(action).toBeVisible();
  expect(await page.locator('main .ce-price').evaluateAll((items) => items.filter((el) => el.offsetParent !== null).length)).toBe(0);
  await action.click();
  const dialog = page.getByRole('dialog', { name: 'Elige tu tienda' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Tacna').check();
  await dialog.getByRole('button', { name: 'Usar esta tienda' }).click();
  await expect(storeBar(page).locator(':scope > span')).toHaveText('Precios y disponibilidad de Tacna');
});

for (const width of WIDTHS) {
  test(`storefront StoreBar fits at ${width}px and with larger text`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/tienda/carrito/', '/tienda/categoria/', '/tienda/categoria/?tienda=ninguna']) {
      for (const scale of SCALES) {
        await page.goto(route);
        await page.addStyleTag({ content: `html{font-size:${scale}}` });
        const bar = storeBar(page);
        await expect(bar, `${route} ${scale}`).toHaveCount(1);
        expect(await spill(bar), `${route} ${scale}`).toEqual([]);
      }
    }
  });
}
