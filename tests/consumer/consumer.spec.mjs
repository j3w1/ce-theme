import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// The built consumer (tests/consumer/app after `vite build`), served as static files. Every style and font here comes from
// the installed @casaelida/vue package: the app has no CSS of its own.
const fonts = JSON.parse(readFileSync(new URL('../../fonts/manifest.json', import.meta.url), 'utf8'));

test('the installed components render with the packaged recipes and the packaged Inter files load', async ({ page }) => {
  const woff2 = [];
  page.on('response', (response) => { if (new URL(response.url()).pathname.endsWith('.woff2')) woff2.push(response); });
  await page.goto('/');
  await expect(page.locator('.ce-message-list')).toBeVisible();
  const styles = (selector, properties) => page.locator(selector).first().evaluate((element, names) =>
    Object.fromEntries(names.map((name) => [name, getComputedStyle(element)[name]])), properties);

  // A declaration from the packaged CSS applies to each component, not only its class name.
  expect(await styles('.ce-button', ['backgroundColor', 'minHeight'])).toEqual({ backgroundColor: 'rgb(218, 46, 58)', minHeight: '48px' });
  expect(await styles('.ce-price', ['fontWeight', 'whiteSpace'])).toEqual({ fontWeight: '800', whiteSpace: 'nowrap' });
  expect(await styles('.ce-conversation', ['display', 'minHeight'])).toEqual({ display: 'grid', minHeight: '64px' });
  expect(await styles('.ce-message-list', ['display', 'flexDirection', 'overflowY'])).toEqual({ display: 'flex', flexDirection: 'column', overflowY: 'auto' });
  expect(await styles('.ce-composer', ['display', 'borderTopStyle'])).toEqual({ display: 'grid', borderTopStyle: 'solid' });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ce-color-action-primary-bg'))).toBe('#da2e3a');

  // Inter: the faces the packaged CSS declares are loaded, and each served WOFF2 is a packaged file, byte for byte.
  await page.evaluate(() => Promise.all(['400', '600', '700', '800'].map((weight) => document.fonts.load(`${weight} 16px Inter`))));
  const loaded = await page.evaluate(() => [...document.fonts].filter((face) => face.family.replaceAll('"', '') === 'Inter' && face.status === 'loaded').map((face) => ({ normal: '400', bold: '700' })[face.weight] ?? face.weight));
  expect(loaded.sort()).toEqual(['400', '600', '700', '800']);
  const served = await Promise.all(woff2.map(async (response) => ({ status: response.status(), sha256: createHash('sha256').update(await response.body()).digest('hex') })));
  expect(served.map((file) => file.status)).toEqual([200, 200, 200, 200]);
  expect(served.map((file) => file.sha256).sort()).toEqual(fonts.map((font) => font.sha256).sort());
});
