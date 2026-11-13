import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// CR-01 acceptance on the AppShell design-system card, rendered with the shipped foundation files only: the generated card,
// fonts.css, tokens.css and recipes.css, and the media its manifest lists. Nothing here adds CSS to the card.
const read = (path) => readFileSync(path, 'utf8');
const BASE = '/__appshell-card/';
const media = JSON.parse(read('exports/design-system/publish.json')).files;
const css = read('exports/fonts.css').replaceAll('../fonts/inter/', `${BASE}fonts/inter/`) + read('exports/tokens.css') + read('exports/recipes.css');
// The design system loads the bundle before a card's own styles, so the card's overrides (such as `.ce-app { min-height: 0 }`) apply.
const card = read('exports/design-system/project/components/AppShell/preview.html').replace('<head>', `<head><style>${css}</style>`);
const LABELS = ['Resumen', 'Productos', 'Categorías', 'Medios', 'Etiquetado', 'Precios por tienda', 'Promociones', 'Disponibilidad', 'Contenido', 'Publicaciones', 'Pedidos', 'Preparación', 'Clientes', 'Atención', 'Tiendas y etiquetas', 'Informes', 'Acceso y auditoría'];

async function openCard(page, width = 1280) {
  await page.route(`**${BASE}**`, (route) => {
    const path = new URL(route.request().url()).pathname.slice(BASE.length);
    if (path === 'components/AppShell/preview.html') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: card });
    if (path.startsWith('fonts/inter/')) return route.fulfill({ contentType: 'font/woff2', body: readFileSync(path) });
    const source = media[`project/${path}`];
    return source ? route.fulfill({ body: readFileSync(source) }) : route.fulfill({ status: 404, body: '' });
  });
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE}components/AppShell/preview.html`);
  await page.evaluate(async () => { await document.fonts.ready; });
}
const links = (page) => page.locator('.ce-module-nav a');
const setDensity = (page, density) => page.locator('.ce-app').evaluate((app, value) => (value ? app.setAttribute('data-ce-density', value) : app.removeAttribute('data-ce-density')), density);
const ring = (locator) => locator.evaluate((el) => {
  const probe = document.createElement('span');
  probe.style.color = 'var(--ce-color-focus)';
  el.append(probe);
  const focus = getComputedStyle(probe).color;
  probe.remove();
  const style = getComputedStyle(el);
  return { focusVisible: el.matches(':focus-visible'), style: style.outlineStyle, width: style.outlineWidth, offset: style.outlineOffset, colorIsFocus: style.outlineColor === focus };
});

test('AppShell card: seven groups, seventeen labelled links, one current page, decorative icons', async ({ page }) => {
  await openCard(page);
  const nav = page.getByRole('navigation', { name: 'Módulos' });
  await expect(nav.locator('h2')).toHaveText(['Resumen', 'Catálogo', 'Comercio', 'Sitio web', 'Operaciones', 'Análisis', 'Administración']);
  await expect(links(page)).toHaveText(LABELS);
  await expect(nav.locator('a[aria-current]')).toHaveCount(1);
  await expect(nav.locator('a[aria-current="page"]')).toHaveText('Productos');
  expect(await links(page).evaluateAll((all) => all.every((a) => a.firstElementChild?.tagName === 'svg' && a.firstElementChild.getAttribute('aria-hidden') === 'true'))).toBe(true);
});

// Acceptance 1: the link height is max(--ce-size-target-public, --ce-control) under no density, compact and touch; the brand link is equal.
for (const [density, expected] of [[null, 44], ['compact', 44], ['touch', 56]]) {
  test(`module and brand links are ${expected}px with ${density ? `${density} density` : 'no density'}`, async ({ page }) => {
    await openCard(page);
    await setDensity(page, density);
    const heights = await links(page).evaluateAll((all) => all.map((a) => a.getBoundingClientRect().height));
    expect(heights).toHaveLength(LABELS.length);
    for (const height of heights) expect(height).toBe(expected);
    const brand = page.locator('.ce-app-brand');
    expect(await brand.evaluate((el) => el.getBoundingClientRect().height)).toBe(expected);
    expect(await brand.evaluate((el) => getComputedStyle(el).minHeight)).toBe(`${expected}px`);
  });
}

// Acceptance 2: only aria-current="page" draws the current style; "false" draws an ordinary link.
test('aria-current="false" does not draw the current style; "page" does', async ({ page }) => {
  await openCard(page);
  await page.mouse.move(1279, 899);
  const looks = await page.locator('.ce-module-nav').evaluate((nav) => {
    const [, current, falsy, plain] = nav.querySelectorAll('a');
    falsy.setAttribute('aria-current', 'false');
    const look = (el) => { const s = getComputedStyle(el); return { weight: s.fontWeight, shadow: s.boxShadow, background: s.backgroundColor }; };
    return { current: look(current), falsy: look(falsy), plain: look(plain) };
  });
  expect(looks.falsy).toEqual(looks.plain);
  expect(looks.current.weight).toBe('700');
  expect(looks.current.shadow).toMatch(/inset/);
  expect(looks.plain.shadow).toBe('none');
  expect(looks.current.background).not.toBe(looks.plain.background);
});

// Acceptance 3: axe on the card; a keyboard walk through the seventeen links; the focus ring on the current link and on a hovered link.
test('AppShell card passes axe and walks all seventeen links by keyboard with a visible focus ring', async ({ page }) => {
  await openCard(page);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((n) => n.target) }))).toEqual([]);
  await links(page).nth(5).hover();
  await page.locator('#sede').focus();
  const walked = [];
  for (let i = 0; i < LABELS.length; i += 1) {
    await page.keyboard.press('Tab');
    walked.push(await page.evaluate(() => document.activeElement.textContent));
    // The current link (Productos) and the hovered link (Precios por tienda) draw the same ring as any focused link.
    if (i === 1 || i === 5) {
      const link = links(page).nth(i);
      await expect(link).toBeFocused();
      expect(await ring(link)).toEqual({ focusVisible: true, style: 'solid', width: '2px', offset: '-2px', colorIsFocus: true });
      if (i === 1) await expect(link).toHaveAttribute('aria-current', 'page');
      if (i === 5) expect(await link.evaluate((el) => el.matches(':hover'))).toBe(true);
    }
  }
  expect(walked).toEqual(LABELS);
});

// Acceptance 4: the column at 1024px, the scrolling row at 1023px, and the current link stays reachable in the row.
test('the module nav is the 240px column at 1024px and a scrolling row at 1023px', async ({ page }) => {
  await openCard(page, 1024);
  const layout = () => page.locator('.ce-module-nav').evaluate((nav) => ({ display: getComputedStyle(nav).display, width: nav.getBoundingClientRect().width, overflowX: getComputedStyle(nav).overflowX, headings: getComputedStyle(nav.querySelector('h2')).display }));
  expect(await layout()).toEqual({ display: 'grid', width: 240, overflowX: 'visible', headings: 'block' });
  await page.setViewportSize({ width: 1023, height: 900 });
  expect(await layout()).toEqual({ display: 'flex', width: 1023, overflowX: 'auto', headings: 'none' });
  // The last module as the current page: it starts outside the row and is reached by keyboard; scrolling it into view on load stays the application's.
  await page.locator('.ce-module-nav').evaluate((nav) => {
    const all = nav.querySelectorAll('a');
    all[1].removeAttribute('aria-current');
    all[all.length - 1].setAttribute('aria-current', 'page');
  });
  const current = page.locator('.ce-module-nav a[aria-current="page"]');
  const visible = () => current.evaluate((el) => {
    const nav = el.closest('.ce-module-nav').getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const vertical = box.top >= nav.top - 0.5 && box.bottom <= nav.bottom + 0.5;
    if (box.left >= nav.left - 0.5 && box.right <= nav.right + 0.5 && vertical) return 'whole';
    return box.left < nav.right && box.right > nav.left && vertical ? 'part' : 'none';
  });
  expect(await page.locator('.ce-module-nav').evaluate((nav) => nav.scrollWidth > nav.clientWidth)).toBe(true);
  expect(await visible()).toBe('none');
  await page.locator('#sede').focus();
  for (let i = 0; i < LABELS.length; i += 1) await page.keyboard.press('Tab');
  await expect(current).toBeFocused();
  await expect(current).toHaveText('Acceso y auditoría');
  // The browser scrolls the row to the focused link; how far is the browser's own choice, so the link need only be in view.
  expect(await visible()).not.toBe('none');
  // What an application does to bring the current link fully into view; nothing in the recipe prevents it.
  await current.evaluate((el) => el.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
  expect(await visible()).toBe('whole');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

// Acceptance 5: text at x1.5 and x2 in the 240px column; labels wrap inside it and nothing overflows or is clipped.
for (const scale of ['150%', '200%']) {
  test(`text at ${scale} stays inside the 240px module column`, async ({ page }) => {
    await openCard(page);
    const result = await page.evaluate((size) => {
      document.documentElement.style.fontSize = size;
      const nav = document.querySelector('.ce-module-nav');
      const box = nav.getBoundingClientRect();
      const items = [...nav.querySelectorAll('h2, a')];
      return {
        width: box.width,
        navScrolls: nav.scrollWidth > nav.clientWidth,
        outside: items.filter((el) => el.getBoundingClientRect().right > box.right + 0.5).map((el) => el.textContent),
        clipped: items.filter((el) => el.scrollWidth > el.clientWidth + 0.5 || el.scrollHeight > el.clientHeight + 0.5).map((el) => el.textContent),
        wrapped: ['Tiendas y etiquetas', 'Acceso y auditoría'].map((label) => {
          const link = [...nav.querySelectorAll('a')].find((a) => a.textContent === label);
          return link.getBoundingClientRect().height > parseFloat(getComputedStyle(link).lineHeight) * 1.5;
        }),
      };
    }, scale);
    expect(result).toEqual({ width: 240, navScrolls: false, outside: [], clipped: [], wrapped: [true, true] });
  });
}

// Acceptance 6, the screen-reader walk of the nav and of the hidden group headings at narrow widths, is not run here: to schedule.
