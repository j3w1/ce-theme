import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// The @casaelida/vue reference on /componentes/ and the build line every page shows. The complete contract (names, types,
// defaults, models, events and slots) is checked by the independent review against the sources, not here.
const inventory = JSON.parse(readFileSync('packages/vue/test/public-api.test.ts', 'utf8').match(/expect\(names\)\.toEqual\((\[[^\]]*\])\)/)[1].replaceAll("'", '"'));
const version = (path) => JSON.parse(readFileSync(path, 'utf8')).version;

test('every component of the public-API inventory has its section in the /componentes/ reference', async ({ page }) => {
  expect(inventory).toHaveLength(9);
  await page.goto('componentes/');
  for (const name of inventory) {
    const section = page.locator(`section#${name.toLowerCase()}`);
    await expect(section.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
    for (const part of ['Propiedades', 'v-model', 'Eventos', 'Ranuras', 'Ejemplo']) await expect(section.getByRole('heading', { level: 4, name: part, exact: true })).toHaveCount(1);
  }
});

for (const width of [320, 390, 768, 1440]) {
  test(`the /componentes/ reference fits ${width}px without horizontal scrolling`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('componentes/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const overflowing = await page.locator('.vue-reference').evaluate((reference) => [...reference.querySelectorAll('pre, dl, dd, code, p')].filter((element) => element.scrollWidth > element.clientWidth + 1).map((element) => element.textContent.slice(0, 40)));
    expect(overflowing).toEqual([]);
  });
}

test('the reference index works by keyboard and lands on the component section', async ({ page }) => {
  await page.goto('componentes/');
  const links = page.getByRole('navigation', { name: 'Componentes Vue' }).getByRole('link');
  await expect(links).toHaveCount(inventory.length);
  await links.first().focus();
  for (let step = 1; step < inventory.length; step += 1) await page.keyboard.press('Tab');
  await expect(links.last()).toBeFocused();
  const name = await links.last().textContent();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`));
  await expect(page.locator(`section#${name.toLowerCase()}`).getByRole('heading', { level: 3, name, exact: true })).toBeInViewport();
});

test('every layout and the print sheet show the source commit and the package versions; printed labels do not', async ({ page }) => {
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const expected = `Base ${version('package.json')} · @casaelida/vue ${version('packages/vue/package.json')} · commit ${commit.slice(0, 7)}`;
  for (const route of ['./', 'componentes/', 'tienda/', 'sistemas/', 'sistemas/etiquetas/']) {
    await page.goto(route);
    const info = page.locator('.build-info');
    await expect(info, route).toHaveCount(1);
    await expect(info, route).toHaveText(expected);
    await expect(info.getByRole('link'), route).toHaveAttribute('href', `https://github.com/j3w1/ce-theme/commit/${commit}`);
  }
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.build-info')).toBeHidden();
});
