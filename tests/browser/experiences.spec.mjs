import { test, expect } from '@playwright/test';

const storePages = ['/tienda/', '/tienda/categoria/', '/tienda/producto/', '/tienda/escena/', '/tienda/carrito/', '/tienda/cuenta/', '/sistemas/', '/compartir/'];
const fits = (page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

for (const width of [390, 768, 1440]) {
  test(`storefront and internal pages fit ${width}px without horizontal scrolling`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of storePages) {
      await page.goto(route);
      expect(await fits(page), route).toBe(true);
    }
  });
}

test('listing grid follows the retail column rhythm with the filter sidebar', async ({ page }) => {
  for (const [width, columns, sidebar] of [[390, 2, false], [800, 3, false], [1100, 3, true], [1440, 4, true]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tienda/categoria/');
    const grid = page.locator('[data-store-view="tacna"] .ce-product-grid');
    expect(await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length), `${width}px`).toBe(columns);
    await expect(page.locator('.ce-listing-aside')).toBeVisible({ visible: sidebar });
  }
});

test('changing store swaps every price and availability line, and never shows S/0', async ({ page }) => {
  await page.goto('/tienda/categoria/');
  const visibleText = () => page.locator('main').evaluate((el) => el.innerText);
  expect(await visibleText()).toContain('Disponible en Tacna');
  await page.getByRole('button', { name: /Tu tienda/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Elige tu tienda' });
  await dialog.getByLabel('Arequipa').check();
  await dialog.getByRole('button', { name: 'Usar esta tienda' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: /Tu tienda/ })).toContainText('Arequipa');
  const text = await visibleText();
  expect(text).not.toContain('Tacna');
  expect(text).toContain('Precio no disponible en Arequipa.');
  expect(text).not.toMatch(/S\/\s*0(?![.\d])/);
  await expect(page.getByRole('button', { name: /Tu tienda/ })).toBeFocused();

  // Cancelling keeps the current store.
  await page.getByRole('button', { name: /Tu tienda/ }).click();
  await dialog.getByLabel('Tacna').check();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Tu tienda/ })).toContainText('Arequipa');

  await page.goto('/tienda/producto/?tienda=ninguna');
  await expect(page.locator('.ce-buy-box').getByText('Elige tu tienda para ver precio y disponibilidad.')).toBeVisible();
  expect(await page.locator('.ce-buy-box .ce-price').evaluateAll((items) => items.filter((el) => el.offsetParent !== null).length)).toBe(0);
});

test('filter drawer and mobile menu are modal, close with Escape and return focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tienda/categoria/');
  const opener = page.getByRole('button', { name: /^Filtros/ });
  await opener.click();
  await expect(page.getByRole('dialog', { name: 'Filtrar y ordenar' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  const menu = page.getByRole('button', { name: 'Abrir menú' });
  await menu.click();
  const drawer = page.getByRole('dialog', { name: 'Menú' });
  await expect(drawer.getByRole('link', { name: 'Productos' })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
});

test('product cards keep identity order, readable controls and named actions', async ({ page }) => {
  await page.goto('/tienda/categoria/');
  const card = page.locator('[data-store-view="tacna"] .ce-product').first();
  await expect(card.locator('.ce-product-name')).toHaveText('MENE');
  await expect(card.locator('.ce-product-description')).toHaveText('Taza de Vidrio Resistente al Calor');
  const add = card.getByRole('button', { name: 'Añadir MENE, Taza de Vidrio Resistente al Calor al carrito' });
  await expect(add).toHaveCSS('opacity', '0');
  await card.hover();
  await expect(add).toHaveCSS('opacity', '1');
  const favourite = card.getByRole('button', { name: /favoritos/ });
  await favourite.click();
  await expect(favourite).toHaveAttribute('aria-pressed', 'true');
  const sizes = await page.locator('[data-store-view="tacna"] :is(.ce-icon-button, .ce-chip, .ce-check)').evaluateAll((items) => items.map((el) => Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height)));
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(24);
});

test('rail buttons scroll the rail and disable at the ends', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('/tienda/');
  const rail = page.locator('#novedades-lista-tacna');
  const next = page.getByRole('button', { name: 'Siguiente: Novedades' }).first();
  const prev = page.getByRole('button', { name: 'Anterior: Novedades' }).first();
  await expect(prev).toBeDisabled();
  await next.click();
  await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await expect(prev).toBeEnabled();
});

test('scene markers are black letters without periods, can be hidden, and the list keeps every product', async ({ page }) => {
  await page.goto('/tienda/escena/');
  const markers = page.locator('#escena-cocina .ce-hotspot');
  await expect(markers).toHaveCount(3);
  expect(await markers.locator('[aria-hidden="true"]').allTextContents()).toEqual(['A', 'B', 'C']);
  const toggle = page.getByRole('button', { name: 'Mostrar etiquetas' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(markers.first()).toBeHidden();
  await expect(page.locator('.ce-tag-item')).toHaveCount(3);
});

test('share previews never carry prices and keep their text inside the 1200 × 630 canvas', async ({ page }) => {
  for (const route of ['/compartir/', '/sistemas/']) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.querySelectorAll('[hidden]').forEach((el) => el.removeAttribute('hidden')));
    const cards = page.locator('.ce-share-card');
    expect(await cards.count()).toBeGreaterThan(0);
    expect(await page.locator('.ce-share-card .ce-price, .ce-share-card .ce-price-block').count()).toBe(0);
    expect(await cards.evaluateAll((items) => items.filter((card) => /S\/\s*\d/.test(card.textContent)).length)).toBe(0);
    const problems = await cards.evaluateAll((items) => items.flatMap((card) => {
      const box = card.getBoundingClientRect();
      return [...card.querySelectorAll('.ce-share-card-text > *')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1;
      }).map((el) => el.className);
    }));
    expect(problems, route).toEqual([]);
    // The centred square crop (x 285–915) shows the product only: no text is sliced at its edges,
    // and no word is split mid-word in the narrow text band.
    const crop = await cards.evaluateAll((items) => items.filter((card) => !card.matches('.ce-share-card--text, .ce-share-card--brand')).flatMap((card) => {
      const box = card.getBoundingClientRect();
      const scale = box.width / 1200;
      return [...card.querySelectorAll('.ce-share-card-text, .ce-share-card-logo')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > box.left + 285 * scale && r.left < box.left + 915 * scale;
      }).map((el) => el.className);
    }));
    expect(crop, route).toEqual([]);
    const split = await page.locator('.ce-share-card-text p').evaluateAll((items) => items.filter((el) => {
      el.style.overflowWrap = 'normal';
      const over = el.scrollWidth > el.clientWidth + 1;
      el.style.overflowWrap = '';
      return over;
    }).map((el) => el.textContent));
    expect(split, route).toEqual([]);
  }
});

test('gondola labels are 80 × 40 mm and nothing spills outside them', async ({ page }) => {
  await page.goto('/sistemas/etiquetas/');
  const labels = page.locator('.ce-label');
  await expect(labels).toHaveCount(14);
  const report = await labels.evaluateAll((items) => items.map((label) => {
    const box = label.getBoundingClientRect();
    const spill = [...label.querySelectorAll('*')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.left < box.left - 0.5 || r.right > box.right + 0.5 || r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5);
    }).map((el) => el.className);
    return { width: Math.round(box.width * 25.4 / 96 * 10) / 10, height: Math.round(box.height * 25.4 / 96 * 10) / 10, spill };
  }));
  for (const item of report) expect(item).toEqual({ width: 80, height: 40, spill: [] });
  await page.emulateMedia({ media: 'print' });
  expect(await page.locator('.ce-code-number').count()).toBe(0);
  expect(await labels.nth(2).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
});

test('internal tools: tabs work by keyboard, codes copy exactly and dense tables keep targets', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/sistemas/');
  const first = page.getByRole('tab', { name: 'Productos' });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Ficha' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Ficha' })).toBeVisible();
  await page.getByRole('button', { name: 'Copiar código' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('CE26061441');
  await page.getByRole('tab', { name: 'Productos' }).click();
  const code = page.locator('#productos .ce-data-table .ce-code').first();
  await expect(code).toHaveText('CE26061441');
  await expect(code.locator('.ce-code-number')).toHaveText('1441');
  const rowHeight = await page.locator('#productos .ce-data-table tbody tr').first().evaluate((el) => el.getBoundingClientRect().height);
  expect(rowHeight).toBeGreaterThanOrEqual(40);
});

test('focus stays visible on dark and light retail surfaces', async ({ page }) => {
  await page.goto('/tienda/');
  for (const locator of [page.getByRole('button', { name: /Tu tienda/ }), page.locator('.ce-tile').first(), page.locator('.ce-category-link').first()]) {
    await locator.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const style = await locator.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(style).toBe('solid');
  }
});
