// Playwright grants clipboard permissions only in Chromium, which reads the copy back from the system clipboard. WebKit
// records what the page hands to navigator.clipboard.writeText instead, so both browsers check exactly what is copied.
export async function clipboard({ page, context, browserName }) {
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    return () => page.evaluate(() => navigator.clipboard.readText());
  }
  await page.addInitScript(() => { navigator.clipboard.writeText = async (text) => { window.__ceCopied = text; }; });
  return () => page.evaluate(() => window.__ceCopied);
}
