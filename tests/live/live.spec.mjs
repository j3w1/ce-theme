import { test, expect } from '@playwright/test';
import { ROUTES } from './routes.mjs';

// What only the published site can show (issue #9 R6). playwright.live.config.mjs runs these beside foundation.spec.mjs's
// route checks and the messaging spec's conversation selection, against CE_SITE_URL.
const commit = process.env.CE_EXPECT_COMMIT;
const version = process.env.CE_EXPECT_VERSION;

for (const route of ROUTES) {
  test(`${route}: served with HTTP 200, showing the deployed commit and package version, with the self-hosted fonts loaded`, async ({ page, baseURL }) => {
    const fonts = [];
    page.on('response', (response) => { if (/\.woff2$/.test(new URL(response.url()).pathname)) fonts.push(response); });
    const response = await page.goto(route);
    expect(response.status()).toBe(200);
    const info = page.locator('.build-info');
    await expect(info).toHaveCount(1);
    await expect(info).toContainText(`@casaelida/vue ${version}`);
    await expect(info).toContainText(`commit ${commit.slice(0, 7)}`);
    await expect(info.getByRole('link')).toHaveAttribute('href', `https://github.com/j3w1/ce-theme/commit/${commit}`);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => [...document.fonts].some((face) => face.family.replace(/["']/g, '') === 'Inter' && face.status === 'loaded'))).toBe(true);
    expect(fonts.length).toBeGreaterThan(0);
    for (const font of fonts) {
      expect(font.url().startsWith(new URL('_astro/', baseURL).href), 'the fonts come from this site').toBe(true);
      expect(font.status()).toBe(200);
    }
  });
}

test('a download from /descargas/ is served with its contents', async ({ page, request }) => {
  await page.goto('descargas/');
  const href = await page.locator('a[download][href$="/downloads/tokens.css"]').getAttribute('href');
  const response = await request.get(new URL(href, page.url()).href);
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('--ce-');
});
