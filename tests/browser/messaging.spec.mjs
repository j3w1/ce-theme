import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Compact public-component composition smoke. Application parity lives in CE Meta App;
// keyboard, drafts, focus, attachments/context and scroll contracts run in the standalone/consumer harnesses.
const ROUTE = 'mensajeria/';
async function openDemo(page) {
  await page.goto(ROUTE);
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
  return page.getByRole('region', { name: 'Composición de mensajería' });
}

test('selecting a conversation opens its history and moves the selection', async ({ page }) => {
  const demo = await openDemo(page);
  const rows = demo.locator('.ce-conversation');
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toHaveAttribute('aria-current', 'true');
  await rows.nth(1).click();
  await expect(rows.nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(rows.first()).not.toHaveAttribute('aria-current', 'true');
  await expect(demo.getByRole('heading', { name: 'Equipo de ejemplo' })).toBeVisible();
  await expect(demo.getByRole('log')).toContainText('Esta conversación muestra un mensaje de equipo.');
  await expect(demo.getByRole('radio')).toHaveCount(0);
});

for (const width of [320, 390, 768, 1440]) {
  test(`the compact composition works at ${width}px with simulated replies, notes and an attachment request`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const demo = await openDemo(page);
    await expect(demo.getByRole('note')).toHaveText('Demostración — datos y operaciones simulados');
    await expect(demo).toContainText('Simulación: ningún mensaje sale de esta página.');
    await expect(page.getByRole('main')).toContainText('La aplicación completa vive en CE Meta App.');
    const field = demo.getByRole('textbox');
    await field.fill('Respuesta de prueba');
    await demo.getByRole('button', { name: 'Enviar', exact: true }).click();
    await expect(field).toHaveValue('');
    await expect(field).toBeFocused();
    await expect(demo.getByRole('log').getByRole('article').last()).toContainText('Enviado · simulado');
    await demo.locator('.ce-composer-mode-option--note > span').click();
    await field.fill('Nota de ejemplo');
    await field.press('Control+Enter');
    await expect(demo.getByRole('log').getByRole('article').last()).toContainText('No la ve el cliente');
    await demo.getByRole('button', { name: /Abrir foto/ }).click();
    await expect(demo.getByRole('status').filter({ hasText: /Solicitud de apertura/ })).toHaveText(/no hay visor/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).include('.messaging-demo').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
  });
}
