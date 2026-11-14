import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The built consumer (tests/consumer/app after `vite build`), served as static files. Every style and font here comes from
// the installed @casaelida/vue package. Only the log's test dimensions are supplied by the consumer.
const fonts = JSON.parse(readFileSync(new URL('../../fonts/manifest.json', import.meta.url), 'utf8'));

test('the installed components render with the packaged recipes and the packaged Inter files load', async ({ page }) => {
  const woff2 = [];
  page.on('response', (response) => { if (new URL(response.url()).pathname.endsWith('.woff2')) woff2.push(response); });
  await page.goto('/');
  await expect(page.locator('.ce-message-list')).toBeVisible();
  const styles = (selector, properties) => page.locator(selector).first().evaluate((element, names) =>
    Object.fromEntries(names.map((name) => [name, getComputedStyle(element)[name]])), properties);

  // A declaration from the packaged CSS applies to each component, not only its class name.
  await expect(page.locator('.ce-button').first()).toHaveCSS('background-color', 'rgb(218, 46, 58)');
  await expect(page.locator('.ce-button').first()).toHaveCSS('min-height', '48px');
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

const logOf = (page) => page.getByRole('log');
const bottom = (page) => logOf(page).evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight <= 2);
const fieldOf = (page) => page.getByRole('textbox');
const eventsOf = (page) => page.getByRole('list', { name: 'Eventos' });
const ring = (locator) => locator.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: parseFloat(getComputedStyle(el).outlineWidth) }));
async function open(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(logOf(page)).toBeVisible();
  // FontFaceSet.ready can wait for the document load event in WebKit. Load the faces directly:
  // the delayed-image case must measure its reserved box before allowing that image to finish.
  await page.evaluate(() => Promise.all(['400', '600', '700', '800'].map((weight) => document.fonts.load(`${weight} 16px Inter`))));
}

test('standalone keyboard selection, native tab order and visible focus use the packaged controls', async ({ page }) => {
  await open(page);
  const rows = page.getByRole('navigation', { name: 'Conversaciones' }).getByRole('button');
  await rows.first().focus();
  await page.keyboard.press('Tab');
  await expect(rows.nth(1)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(rows.nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(rows.first()).not.toHaveAttribute('aria-current', 'true');
  await expect(logOf(page)).toHaveAttribute('aria-label', 'Mensajes dos');
  await expect(rows.nth(1)).toBeFocused();
  expect(await ring(rows.nth(1))).toEqual({ style: 'solid', width: 2 });
  await rows.first().focus();
  await page.keyboard.press('Space');
  await expect(rows.first()).toHaveAttribute('aria-current', 'true');
  await expect(rows.nth(1)).not.toHaveAttribute('aria-current', 'true');
  await expect(logOf(page)).toHaveAttribute('aria-label', 'Mensajes uno');
  await expect(rows.first()).toBeFocused();
  await rows.nth(1).focus();
  await page.keyboard.press('Space');
  await expect(rows.nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(rows.first()).not.toHaveAttribute('aria-current', 'true');
  await expect(logOf(page)).toHaveAttribute('aria-label', 'Mensajes dos');
  await page.keyboard.press('Tab');
  await expect(logOf(page)).toBeFocused();
  expect(await ring(logOf(page))).toEqual({ style: 'solid', width: 2 });
  // The attachment button is inside the log, before the composer radios.
  await page.keyboard.press('Tab');
  const photo = page.getByRole('button', { name: /Abrir foto/ });
  await expect(photo).toBeFocused();
  expect(await ring(photo)).toEqual({ style: 'solid', width: 2 });
  await page.keyboard.press('Tab');
  const reply = page.getByRole('radio', { name: 'Responder al cliente' });
  await expect(reply).toBeFocused();
  expect(await reply.evaluate((el) => getComputedStyle(el.nextElementSibling).outlineWidth)).toBe('2px');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Nota interna' })).toBeChecked();
  await expect(page.locator('.ce-composer [role="status"]')).toHaveText('Escribiendo una nota interna. No la ve el cliente.');
  await expect(fieldOf(page)).toHaveAccessibleDescription(/No la ve el cliente/);
  await page.keyboard.press('ArrowLeft');
  await expect(reply).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(fieldOf(page)).toBeFocused();
  expect(await ring(fieldOf(page))).toEqual({ style: 'solid', width: 2 });
  await fieldOf(page).fill('Prueba');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Enviar a Prueba' })).toBeFocused();
  expect(await ring(page.getByRole('button', { name: 'Enviar a Prueba' }))).toEqual({ style: 'solid', width: 2 });
});

test('standalone reply and note drafts stay separate, emit distinct intents and return focus after submission', async ({ page }) => {
  await open(page);
  const field = fieldOf(page);
  const reply = page.getByRole('radio', { name: /Responder al cliente/ });
  const background = () => page.locator('.ce-composer').evaluate((el) => getComputedStyle(el).backgroundColor);
  const replyBackground = await background();
  await expect(page.getByRole('button', { name: 'Enviar a Prueba' })).toBeDisabled();
  await field.fill('   ');
  await field.press('Control+Enter');
  await expect(eventsOf(page).getByRole('listitem')).toHaveCount(0);
  await field.fill('Respuesta privada');
  await field.press('Enter');
  await field.press('End');
  await field.press('x');
  await expect(field).toHaveValue('Respuesta privada\nx');
  await page.locator('.ce-composer-mode-option--note > span').click();
  expect(await background()).not.toBe(replyBackground);
  await expect(field).toHaveValue('');
  await field.fill('Nota separada');
  await page.locator('.ce-composer-mode-option:not(.ce-composer-mode-option--note) > span').click();
  await expect(field).toHaveValue('Respuesta privada\nx');
  expect(await page.content()).not.toContain('Nota separada');
  await page.locator('.ce-composer-mode-option--note > span').click();
  expect(await page.content()).not.toContain('Respuesta privada');
  await page.getByRole('button', { name: /Conversación dos/ }).click();
  await expect(reply).toBeChecked();
  await expect(field).toHaveValue('');
  await page.getByRole('button', { name: /Conversación uno/ }).click();
  await expect(field).toHaveValue('Respuesta privada\nx');
  await field.press('Control+Enter');
  await expect(eventsOf(page)).toHaveText('submitReply: Respuesta privada\nx');
  await expect(field).toHaveValue('');
  await expect(field).toBeFocused();
  await page.locator('.ce-composer-mode-option--note > span').click();
  await expect(field).toHaveValue('Nota separada');
  await page.getByRole('button', { name: 'Guardar nota' }).click();
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('');
  await expect(eventsOf(page).getByRole('listitem')).toHaveText(['submitReply: Respuesta privada\nx', 'saveNote: Nota separada']);
  const last = logOf(page).getByRole('article').last();
  await expect(last).toContainText('Nota interna · No la ve el cliente');
  await expect(last).toContainText('simulada');
  await expect(last).not.toContainText('Enviado');
  await page.locator('.ce-composer-mode-option:not(.ce-composer-mode-option--note) > span').click();
  await field.fill('Atajo de comando');
  await field.press('Meta+Enter');
  await expect(eventsOf(page).getByRole('listitem').last()).toHaveText('submitReply: Atajo de comando');
  await expect(field).toBeFocused();
});

test('standalone keyed logs, new messages and changing context preserve history or follow the newest message', async ({ page }) => {
  await open(page);
  const log = logOf(page);
  expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight + 100)).toBe(true);
  await expect.poll(() => bottom(page)).toBe(true);
  await log.evaluate((el) => { el.scrollTop = 0; });
  await page.getByRole('button', { name: 'Agregar recibido' }).click();
  await expect(log.getByRole('article').last()).toHaveText(/Nuevo mensaje recibido/);
  expect(await log.evaluate((el) => el.scrollTop)).toBe(0);
  await page.getByRole('button', { name: 'Cambiar contexto' }).click();
  await expect(log.locator('.ce-work-status-summary')).toContainText('Resumen de prueba.');
  expect(await log.evaluate((el) => el.scrollTop)).toBe(0);
  await page.getByRole('button', { name: 'Anteponer anterior' }).click();
  await expect(log.getByRole('article').first()).toHaveText(/Mensaje anterior/);
  expect(await bottom(page)).toBe(false);
  await fieldOf(page).fill('Mensaje propio');
  await fieldOf(page).press('Control+Enter');
  await expect.poll(() => bottom(page)).toBe(true);
  await page.getByRole('button', { name: 'Agregar recibido' }).click();
  await expect.poll(() => bottom(page)).toBe(true);
  const summary = log.locator('.ce-work-status-summary');
  const tall = await summary.evaluate((el) => el.getBoundingClientRect().height);
  await page.getByRole('button', { name: 'Cambiar contexto' }).click();
  await expect(summary).toHaveText('Resumen breve.');
  expect(await summary.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(tall);
  await expect.poll(() => bottom(page)).toBe(true);
  await page.getByRole('button', { name: 'Cambiar contexto' }).click();
  await expect.poll(() => bottom(page)).toBe(true);
  await log.evaluate((el) => { el.scrollTop = 0; });
  await page.getByRole('button', { name: /Conversación dos/ }).click();
  await expect(log).toHaveAttribute('aria-label', 'Mensajes dos');
  await expect.poll(() => bottom(page)).toBe(true);
  await page.getByRole('button', { name: /Conversación uno/ }).click();
  await expect(log).toHaveAttribute('aria-label', 'Mensajes uno');
  await expect.poll(() => bottom(page)).toBe(true);
});

test('standalone supplied work states use ordered words, one announcement and no empty action wrapper', async ({ page }) => {
  await open(page);
  const work = page.getByRole('region', { name: 'Contexto de prueba' });
  // section is labelled but has aria-live=off; only its inner status announces updates.
  await expect(work).toHaveAttribute('aria-live', 'off');
  await expect(work.getByRole('list', { name: 'Progreso' }).getByRole('listitem')).toHaveText(['Primero (hecho)', 'Segundo (actual)']);
  await expect(work.locator('[aria-current="step"]')).toHaveCount(1);
  await expect(work.getByRole('status')).toHaveText('');
  await expect(work.locator('.ce-work-status-actions')).toHaveCount(0);
  await page.getByRole('button', { name: 'Cambiar estado suministrado' }).click();
  await expect(work.getByRole('status')).toHaveText('Contexto de prueba: Detenido');
  await expect(work.getByRole('listitem').last()).toHaveText('Segundo (se detuvo)');
  expect(await work.getByRole('listitem').last().evaluate((el) => getComputedStyle(el, '::before').backgroundImage)).toContain('repeating-linear-gradient');
  await page.locator('.ce-composer-mode-option--note > span').click();
  await fieldOf(page).fill('Nota que se conserva');
  await page.getByRole('button', { name: 'Cambiar permiso de notas' }).click();
  await expect(page.getByRole('radio')).toHaveCount(0);
  await expect(fieldOf(page)).toHaveAccessibleName('Respuesta');
  await expect(fieldOf(page)).toHaveValue('');
  await page.getByRole('button', { name: 'Cambiar permiso de notas' }).click();
  await expect(fieldOf(page)).toHaveValue('Nota que se conserva');
});

for (const [width, scale] of [[320, 1], [390, 1], [768, 2], [320, 2], [1440, 2]]) {
  test(`standalone components fit at ${width}px with text ×${scale}, accessible targets and no axe violations`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    await page.addStyleTag({ content: `html{font-size:${scale * 100}%}` });
    await fieldOf(page).fill('Borrador de prueba');
    await page.locator('.ce-composer-mode-option--note > span').click();
    await fieldOf(page).fill('Nota de prueba');
    const overflow = await page.locator('main *').evaluateAll((items) => items.filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1); }).map((el) => `${el.localName}.${el.className}`));
    expect(overflow).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const name = page.locator('.ce-conversation-name').first();
    expect(await name.evaluate((el) => ({ clipped: el.scrollWidth > el.clientWidth, overflow: getComputedStyle(el).textOverflow }))).toEqual({ clipped: true, overflow: 'ellipsis' });
    expect(await page.locator('button, textarea, .ce-composer-mode-option > span').evaluateAll((items) => items.every((el) => { const r = el.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }))).toBe(true);
    expect(await logOf(page).evaluate((log) => [...log.querySelectorAll('.ce-message')].every((el) => { const r = el.getBoundingClientRect(), p = log.getBoundingClientRect(); return r.left >= p.left - 1 && r.right <= p.right + 1; }))).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
  });
}

test('standalone attachment load reserves its box, opening emits ids once, and context stays after delivery', async ({ page }) => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await page.route('**/photo.svg', async (route) => { await gate; await route.continue(); });
  try {
    await open(page);
    const log = logOf(page);
    const photo = log.getByRole('button', { name: /Abrir foto/ });
    const image = photo.getByRole('img');
    const tile = photo.locator('..');
    const measure = () => tile.evaluate((el) => { const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), el.closest('[role="log"]').scrollHeight]; });
    const before = await measure();
    expect(before[0] / before[1]).toBeCloseTo(4 / 3, 1);
    expect(await image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(false);
    release();
    await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await measure()).toEqual(before);
    expect(await image.evaluate((img) => getComputedStyle(img).objectFit)).toBe('contain');
    await expect.poll(() => bottom(page)).toBe(true);
    await photo.focus();
    await page.keyboard.press('Enter');
    await expect(photo).toBeFocused();
    await expect(eventsOf(page).getByRole('listitem')).toHaveText(['openAttachment: context/foto/0']);
    const message = photo.locator('xpath=ancestor::article');
    await expect(message.locator('.ce-message-status')).toHaveText('Leído · simulado');
    await expect(message.locator('.ce-work-status')).toContainText('Segundo');
    expect(await message.evaluate((el) => el.querySelector('.ce-message-meta').compareDocumentPosition(el.querySelector('.ce-message-context')) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
    await expect(log.locator('.ce-message-context')).toHaveCount(1);
  } finally { release(); }
});
