import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The /mensajeria/ example: the real @casaelida/vue components on fictional, in-memory fixtures.
// Browser tests verify this web page only. They do not verify native Android or iOS notifications, camera access or calls.
const ROUTE = '/mensajeria/';
const NOTICE = 'Simulación: ningún mensaje sale de esta página.';

async function openDemo(page, width = 1280, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto(ROUTE);
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
  return {
    demo: page.locator('.messaging-demo'),
    rows: page.locator('.ce-conversation'),
    row: (name) => page.locator('.ce-conversation').filter({ hasText: name }),
    log: page.locator('.messaging-demo [role="log"]'),
    messages: page.locator('.messaging-demo [role="log"] .ce-message'),
    field: page.locator('.ce-composer-field'),
    send: page.locator('.ce-composer-send'),
    modeNote: page.locator('.ce-composer-mode-option--note > span'),
    modeReply: page.locator('.ce-composer-mode-option:not(.ce-composer-mode-option--note) > span'),
    events: page.locator('.messaging-demo-events'),
  };
}
const fits = (page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const atBottom = (log) => log.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight <= 2);
const ring = (locator) => locator.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: parseFloat(getComputedStyle(el).outlineWidth) }));
const ringOfNext = (locator) => locator.evaluate((el) => ({ style: getComputedStyle(el.nextElementSibling).outlineStyle, width: parseFloat(getComputedStyle(el.nextElementSibling).outlineWidth) }));
// Page chrome outside the example (the section chips) scrolls by itself; the content of this page must still fit.
const contentFits = (page) => page.evaluate(() => document.querySelector('main').scrollWidth <= innerWidth);

test('shows the simulation notice, the fixtures and no real channel', async ({ page }) => {
  const { demo, rows } = await openDemo(page);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(demo.locator('.messaging-demo-notice')).toHaveText(NOTICE);
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(0)).toHaveAttribute('aria-current', 'true');
  await expect(demo.locator('img')).toHaveCount(0);
});

test('selecting a conversation opens its history, clears its unread count and moves the selection', async ({ page }) => {
  const { rows, row, log } = await openDemo(page);
  await expect(row('Jorge Mamani')).toContainText('2 sin leer');
  await expect(row('Equipo Tienda')).toContainText('1 sin leer');
  await row('Jorge Mamani').click();
  await expect(row('Jorge Mamani')).toHaveAttribute('aria-current', 'true');
  await expect(row('Rosa Quispe')).not.toHaveAttribute('aria-current', 'true');
  await expect(rows.and(page.locator('[aria-current="true"]'))).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 2, name: 'Jorge Mamani' })).toBeVisible();
  await expect(log).toHaveAttribute('aria-label', 'Mensajes con Jorge Mamani');
  await expect(log).toContainText('Quedo atento, gracias.');
  await expect(row('Jorge Mamani')).not.toContainText('sin leer');
  await expect(row('Equipo Tienda')).toContainText('1 sin leer');
});

test('sends a simulated reply: Ctrl+Enter or the button, explicit wording, draft cleared, focus kept', async ({ page }) => {
  const { messages, field, send, row, events } = await openDemo(page);
  const before = await messages.count();
  await field.fill('Buenos días, Rosa. El horario es de 9:00 a 13:00.');
  await expect(send).toHaveText('Enviar a Rosa');
  await page.keyboard.press('Control+Enter');
  await expect(messages).toHaveCount(before + 1);
  const last = messages.last();
  await expect(last).toHaveClass(/ce-message--outgoing/);
  await expect(last).toContainText('Buenos días, Rosa. El horario es de 9:00 a 13:00.');
  await expect(last.locator('.ce-message-status')).toHaveText('Enviado · simulado');
  await expect(last.locator('time')).toHaveText('10:46');
  await expect(field).toHaveValue('');
  await expect(field).toBeFocused();
  await expect(row('Rosa Quispe')).toContainText('Tú: Buenos días, Rosa. El horario es de 9:00 a 13:00.');
  await expect(events).toContainText('submitReply');
  await expect(events).toContainText('simulado');
  // The send button works too, and the clock moves on.
  await field.fill('Segundo mensaje');
  await send.click();
  await expect(messages).toHaveCount(before + 2);
  await expect(messages.last().locator('time')).toHaveText('10:47');
  await expect(field).toBeFocused();
});

test('Enter adds a line, and a blank or whitespace-only draft cannot be submitted', async ({ page }) => {
  const { messages, field, send } = await openDemo(page);
  const before = await messages.count();
  await expect(send).toBeDisabled();
  await field.fill('   ');
  await expect(send).toBeDisabled();
  await page.keyboard.press('Control+Enter');
  await field.fill('Primera línea');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Segunda línea');
  await expect(field).toHaveValue('Primera línea\nSegunda línea');
  await expect(messages).toHaveCount(before);
  await page.keyboard.press('Control+Enter');
  await expect(messages).toHaveCount(before + 1);
  await expect(messages.last().locator('.ce-message-text')).toHaveText('Tú: Primera línea\nSegunda línea');
});

test('an internal note is its own mode: labelled, informational, never an outgoing message', async ({ page }) => {
  const { demo, messages, field, send, modeNote, modeReply, row, events } = await openDemo(page);
  await expect(page.getByRole('radio', { name: 'Responder al cliente' })).toBeChecked();
  await modeNote.click();
  await expect(page.getByRole('radio', { name: 'Nota interna' })).toBeChecked();
  await expect(demo.locator('.ce-composer')).toHaveClass(/ce-composer--note/);
  await expect(demo.locator('.ce-composer-notice')).toHaveText('Nota interna · No la ve el cliente');
  await expect(send).toHaveText('Guardar nota');
  const sendBackground = await send.evaluate((el) => getComputedStyle(el).backgroundColor);
  await modeReply.click();
  await expect(send).toHaveText('Enviar a Rosa');
  const replyBackground = await send.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(sendBackground).not.toBe(replyBackground);
  await modeNote.click();
  const outgoing = await demo.locator('.ce-message--outgoing').count();
  const before = await messages.count();
  await field.fill('Pedir el DNI solo si compra al por mayor.');
  await page.keyboard.press('Control+Enter');
  await expect(messages).toHaveCount(before + 1);
  const note = messages.last();
  await expect(note).toHaveClass(/ce-message--note/);
  await expect(note).not.toHaveClass(/ce-message--outgoing/);
  await expect(note.locator('.ce-message-note-label')).toHaveText('Nota interna · No la ve el cliente');
  await expect(note.locator('.ce-message-meta')).toContainText('simulada');
  await expect(demo.locator('.ce-message--outgoing')).toHaveCount(outgoing);
  await expect(row('Rosa Quispe')).toContainText('Nota interna: Pedir el DNI solo si compra al por mayor.');
  await expect(events).toContainText('saveNote');
  await expect(events).not.toContainText('submitReply');
});

test('staff conversations have no note mode', async ({ page }) => {
  const { row, demo, send, field } = await openDemo(page);
  await row('Equipo Tienda').click();
  await expect(demo.locator('.ce-composer-mode')).toHaveCount(0);
  await expect(send).toHaveText('Enviar');
  await field.fill('Listo, gracias.');
  await page.keyboard.press('Control+Enter');
  await expect(demo.locator('.ce-message--outgoing').last()).toContainText('Listo, gracias.');
});

test('each mode keeps its own draft and the other one is never shown or sent', async ({ page }) => {
  const { demo, messages, field, row, modeNote, modeReply, events } = await openDemo(page);
  const before = await messages.count();
  await field.fill('borrador-de-respuesta');
  await expect(row('Rosa Quispe')).toContainText('Borrador: respuesta sin enviar');
  await modeNote.click();
  await expect(field).toHaveValue('');
  await expect(demo.locator('.ce-composer-mode-option').first()).toContainText('borrador');
  await field.fill('nota-secreta-interna');
  // In reply mode the note text appears nowhere in the page, not in the list either.
  await modeReply.click();
  await expect(field).toHaveValue('borrador-de-respuesta');
  await expect(demo).not.toContainText('nota-secreta-interna');
  expect(await page.content()).not.toContain('nota-secreta-interna');
  await modeNote.click();
  await expect(field).toHaveValue('nota-secreta-interna');
  await expect(demo).not.toContainText('borrador-de-respuesta');
  // Nothing was sent or saved by switching.
  await expect(messages).toHaveCount(before);
  await expect(events).not.toContainText('submitReply');
  await expect(events).not.toContainText('saveNote');
  // Changing conversation returns to reply mode and keeps every draft.
  await row('Jorge Mamani').click();
  await expect(page.getByRole('radio', { name: 'Responder al cliente' })).toBeChecked();
  await expect(demo.locator('.ce-composer')).not.toHaveClass(/ce-composer--note/);
  await expect(field).toHaveValue('');
  await row('Rosa Quispe').click();
  await expect(field).toHaveValue('borrador-de-respuesta');
  await modeNote.click();
  await expect(field).toHaveValue('nota-secreta-interna');
});

test('the mode change is announced and the radios work with the arrow keys', async ({ page }) => {
  const { demo, field } = await openDemo(page);
  const status = demo.locator('.ce-composer [role="status"]');
  await expect(status).toHaveText('');
  await page.getByRole('radio', { name: 'Responder al cliente' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Nota interna' })).toBeChecked();
  await expect(status).toHaveText('Escribiendo una nota interna. No la ve el cliente.');
  await expect(field).toHaveAccessibleName('Nota interna para el equipo');
  await expect(field).toHaveAccessibleDescription(/Nota interna · No la ve el cliente/);
  await page.keyboard.press('ArrowLeft');
  await expect(status).toHaveText('Escribiendo una respuesta al cliente.');
  await expect(field).toHaveAccessibleName('Mensaje para Rosa Quispe');
});

test('keyboard order, activation and visible focus', async ({ page }) => {
  const { rows, row, log, field, demo } = await openDemo(page);
  await rows.first().focus();
  await page.keyboard.press('Tab');
  await expect(rows.nth(1)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(rows.nth(2)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(rows.nth(3)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(log).toBeFocused();
  expect(await ring(log)).toEqual({ style: 'solid', width: 2 });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('radio', { name: 'Responder al cliente' })).toBeFocused();
  expect(await ringOfNext(page.getByRole('radio', { name: 'Responder al cliente' }))).toEqual({ style: 'solid', width: 2 });
  await page.keyboard.press('Tab');
  await expect(field).toBeFocused();
  expect(await ring(field)).toEqual({ style: 'solid', width: 2 });
  await page.keyboard.type('x');
  await page.keyboard.press('Tab');
  await expect(page.locator('.ce-composer-send')).toBeFocused();
  expect(await ring(page.locator('.ce-composer-send'))).toEqual({ style: 'solid', width: 2 });
  await page.keyboard.press('Tab');
  await expect(demo.getByRole('button', { name: 'Simular mensaje entrante' })).toBeFocused();
  // Enter and Space activate a conversation without moving focus off the row.
  await row('Jorge Mamani').focus();
  await page.keyboard.press('Enter');
  await expect(row('Jorge Mamani')).toHaveAttribute('aria-current', 'true');
  await expect(row('Jorge Mamani')).toBeFocused();
  await row('Equipo Tienda').focus();
  await page.keyboard.press('Space');
  await expect(row('Equipo Tienda')).toHaveAttribute('aria-current', 'true');
  expect(await ring(row('Equipo Tienda'))).toEqual({ style: 'solid', width: 2 });
});

for (const width of [320, 390]) {
  test(`at ${width}px the list and the thread are separate views, with focus handled`, async ({ page }) => {
    const { demo, rows, row, field } = await openDemo(page, width, 800);
    expect(await fits(page)).toBe(true);
    await expect(rows.first()).toBeVisible();
    await expect(field).toBeHidden();
    await row('Jorge Mamani').click();
    await expect(field).toBeVisible();
    await expect(rows.first()).toBeHidden();
    await expect(page.getByRole('heading', { level: 2, name: 'Jorge Mamani' })).toBeFocused();
    expect(await fits(page)).toBe(true);
    await demo.getByRole('button', { name: 'Volver a conversaciones' }).click();
    await expect(rows.first()).toBeVisible();
    await expect(field).toBeHidden();
    await expect(row('Jorge Mamani')).toBeFocused();
    // Opening the conversation that is already selected still opens its thread.
    await row('Jorge Mamani').click();
    await expect(field).toBeVisible();
    expect(await fits(page)).toBe(true);
  });
}

for (const width of [768, 1440]) {
  test(`at ${width}px the list and the thread sit side by side`, async ({ page }) => {
    const { demo, rows, field, log } = await openDemo(page, width, 900);
    expect(await fits(page)).toBe(true);
    await expect(rows.first()).toBeVisible();
    await expect(field).toBeVisible();
    await expect(demo.getByRole('button', { name: 'Volver a conversaciones' })).toBeHidden();
    const list = await rows.first().boundingBox();
    const thread = await log.boundingBox();
    expect(list.x + list.width).toBeLessThanOrEqual(thread.x + 1);
    expect(thread.width).toBeGreaterThan(360);
  });
}

for (const [width, scale] of [[320, '100%'], [390, '100%'], [768, '200%'], [320, '200%'], [1440, '200%']]) {
  test(`long text and identifiers wrap safely at ${width}px with ${scale} text`, async ({ page }) => {
    const { row, log, field, send, rows } = await openDemo(page, width, 900);
    if (scale !== '100%') await page.addStyleTag({ content: `html{font-size:${scale}}` });
    // A very long name in the list and the header: shortened in the list, wrapped in the header.
    await rows.first().evaluate((el) => { el.querySelector('.ce-conversation-name').textContent = 'María Fernanda Quispe Huamán de los Ángeles · Mayorista de la sede de Tacna'; });
    await row('Jorge Mamani').click();
    await page.getByRole('heading', { level: 2, name: 'Jorge Mamani' }).evaluate((el) => { el.textContent = 'María Fernanda Quispe Huamán de los Ángeles · Mayorista de la sede de Tacna'; });
    expect(await contentFits(page)).toBe(true);
    // The message with a 90-character unbroken URL and a long identifier stays inside the log.
    const long = page.locator('.ce-message--incoming').filter({ hasText: 'EJEMPLO-0000000123456789' });
    await long.scrollIntoViewIfNeeded();
    const box = await long.boundingBox();
    const area = await log.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(area.x - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(area.x + area.width + 1);
    await field.scrollIntoViewIfNeeded();
    const viewport = page.viewportSize();
    for (const target of [field, send]) {
      const rect = await target.boundingBox();
      expect(rect.x).toBeGreaterThanOrEqual(-1);
      expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width + 1);
    }
    expect(await contentFits(page)).toBe(true);
  });
}

test('the list shortens long names with an ellipsis instead of overflowing', async ({ page }) => {
  const { rows } = await openDemo(page, 1440, 900);
  const name = rows.first().locator('.ce-conversation-name');
  await name.evaluate((el) => { el.textContent = 'María Fernanda Quispe Huamán de los Ángeles · Mayorista de la sede de Tacna'; });
  const result = await name.evaluate((el) => ({ ellipsis: getComputedStyle(el).textOverflow, clipped: el.scrollWidth > el.clientWidth, row: el.closest('.ce-conversation').getBoundingClientRect().right, own: el.getBoundingClientRect().right }));
  expect(result.ellipsis).toBe('ellipsis');
  expect(result.clipped).toBe(true);
  expect(result.own).toBeLessThanOrEqual(result.row);
});

test('a new message never moves a reader who is looking at earlier history', async ({ page }) => {
  const { demo, log, field, messages } = await openDemo(page, 1280, 900);
  expect(await atBottom(log)).toBe(true);
  expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  // Reading history: an incoming message arrives and the position does not change.
  await log.evaluate((el) => { el.scrollTop = 0; });
  await expect.poll(() => log.evaluate((el) => el.scrollTop)).toBe(0);
  const count = await messages.count();
  await demo.getByRole('button', { name: 'Simular mensaje entrante' }).click();
  await expect(messages).toHaveCount(count + 1);
  expect(await log.evaluate((el) => el.scrollTop)).toBe(0);
  // The reader's own message always brings them to the newest one.
  await field.fill('Mi respuesta');
  await page.keyboard.press('Control+Enter');
  await expect(messages).toHaveCount(count + 2);
  await expect.poll(() => atBottom(log)).toBe(true);
  // A reader who is following the latest messages keeps following.
  await demo.getByRole('button', { name: 'Simular mensaje entrante' }).click();
  await expect(messages).toHaveCount(count + 3);
  await expect.poll(() => atBottom(log)).toBe(true);
});

test('opening a thread on a narrow screen starts at the newest message', async ({ page }) => {
  const { row, log } = await openDemo(page, 390, 800);
  await row('Rosa Quispe').click();
  await expect(log).toBeVisible();
  await expect.poll(() => atBottom(log)).toBe(true);
  await expect(log).toContainText('Le confirmo en unos minutos.');
});

test('message statuses are words and say they are simulated; nothing claims acceptance or completion', async ({ page }) => {
  const { demo, row, field } = await openDemo(page);
  const wording = /^(Enviado|Entregado|Leído|No entregado) · simulado$|^simulada$/;
  const seen = new Set();
  for (const name of ['Rosa Quispe', 'Jorge Mamani', 'Equipo Tienda']) {
    await row(name).click();
    for (const text of await demo.locator('.ce-message-status').allTextContents()) { expect(text).toMatch(wording); seen.add(text); }
  }
  for (const state of ['Enviado · simulado', 'Entregado · simulado', 'Leído · simulado', 'No entregado · simulado']) expect(seen).toContain(state);
  await expect(demo.locator('.ce-message-status--failed')).toHaveCount(0); // Equipo Tienda has none
  await row('Jorge Mamani').click();
  await expect(demo.locator('.ce-message-status--failed')).toHaveText('No entregado · simulado');
  await row('Rosa Quispe').click();
  await field.fill('Mensaje nuevo');
  await page.keyboard.press('Control+Enter');
  await expect(demo.locator('.ce-message-status').last()).toHaveText('Enviado · simulado');
  const text = await demo.innerText();
  expect(text).not.toMatch(/Aceptad|Completad|Entregado a|conectad/i);
});

test('the example makes no real-channel, stock, sales or catalogue claims', async ({ page }) => {
  const { demo, events } = await openDemo(page);
  const text = `${await demo.innerText()}\n${await events.innerText()}`;
  expect(text).toContain(NOTICE);
  expect(text).not.toMatch(/whatsapp|instagram|messenger|telegram|sms|facebook/i);
  expect(text).not.toMatch(/stock|existencias|disponible|verificad|conciliad|vendid|ventas/i);
  expect(text).not.toMatch(/S\/\s?\d|\bCE\d{8,}\b/);
  await expect(demo.locator('img')).toHaveCount(0);
});

test('touch targets are at least 44 px on a phone, in both views and both modes', async ({ page }) => {
  const { demo, row, modeNote } = await openDemo(page, 390, 844);
  const small = () => demo.evaluate((root) => [...root.querySelectorAll('button, [role="log"], textarea, label.ce-composer-mode-option > span')]
    .filter((el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'; })
    .map((el) => ({ el: `${el.localName}.${el.className}`, w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) }))
    .filter(({ w, h, el }) => !el.startsWith('div.ce-message-list') && (w < 44 || h < 44)));
  expect(await small()).toEqual([]);
  await row('Rosa Quispe').click();
  expect(await small()).toEqual([]);
  await modeNote.click();
  expect(await small()).toEqual([]);
});

for (const [width, height] of [[320, 700], [390, 844], [768, 1024], [1440, 900]]) {
  test(`has no accessibility violations at ${width}px, in the list, reply and note views`, async ({ page }) => {
    const { demo, row, field, modeNote } = await openDemo(page, width, height);
    const scan = async (label) => {
      const results = await new AxeBuilder({ page }).include('.messaging-demo').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((node) => node.target) })), label).toEqual([]);
    };
    const pick = async (name) => {
      const back = demo.getByRole('button', { name: 'Volver a conversaciones' });
      if (await back.isVisible()) await back.click();
      await row(name).click();
    };
    await scan('initial');
    await pick('Rosa Quispe');
    await scan('reply mode');
    await field.fill('Un borrador');
    await modeNote.click();
    await field.fill('Una nota');
    await scan('note mode with a draft');
    await page.keyboard.press('Control+Enter');
    await scan('with a saved note');
    await pick('Jorge Mamani');
    await scan('failed status and long content');
    await pick('Equipo Tienda');
    await scan('staff conversation');
    if (width < 768) { await demo.getByRole('button', { name: 'Volver a conversaciones' }).click(); await scan('narrow list'); }
  });
}

test('the example uses no network, messaging transport or browser storage while it is used', async ({ page }) => {
  await page.addInitScript(() => {
    window.__calls = [];
    const record = (name) => window.__calls.push(name);
    const fetchOriginal = window.fetch;
    window.fetch = (...args) => { record('fetch'); return fetchOriginal(...args); };
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (...args) { record('xhr'); return open.apply(this, args); };
    for (const name of ['WebSocket', 'EventSource', 'RTCPeerConnection']) {
      const Original = window[name];
      if (Original) window[name] = function (...args) { record(name); return new Original(...args); };
    }
    navigator.sendBeacon = () => { record('sendBeacon'); return false; };
  });
  const { demo, row, field, modeNote, modeReply } = await openDemo(page);
  await page.waitForLoadState('networkidle');
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await row('Jorge Mamani').click();
  await row('Rosa Quispe').click();
  await field.fill('Respuesta de prueba');
  await page.keyboard.press('Control+Enter');
  await modeNote.click();
  await field.fill('Nota de prueba');
  await page.keyboard.press('Control+Enter');
  await modeReply.click();
  await demo.getByRole('button', { name: 'Simular mensaje entrante' }).click();
  await demo.getByRole('button', { name: 'Simular mensaje en otra conversación' }).click();
  await expect(demo.locator('.ce-message--note').last()).toContainText('Nota de prueba');
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => window.__calls)).toEqual([]);
  expect(await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie, databases: indexedDB.databases ? (await indexedDB.databases()).length : 0 }))).toEqual({ local: 0, session: 0, cookies: '', databases: 0 });
});

test('the page says what is simulated and does not claim to test native features', async ({ page }) => {
  await openDemo(page);
  const main = await page.locator('main').innerText();
  expect(main).toContain('Está simulado');
  expect(main).toContain('No existe en este ejemplo');
  expect(main).toMatch(/no prueban cámara, llamadas ni notificaciones nativas/);
});

// Responsive transitions. The layout switches between the list and thread side by side (wide) and one at a time (narrow).
// Resizing, or changing the text size, must never hide the control the reader is using and drop focus to the page.
const focusedTag = (page) => page.evaluate(() => document.activeElement?.tagName);
const WIDE = { width: 1280, height: 900 };
const NARROW = { width: 390, height: 844 };

test('resizing from 1280px to 390px while composing keeps the conversation visible and focus in the composer', async ({ page }) => {
  const { demo, rows, field } = await openDemo(page, WIDE.width, WIDE.height);
  await field.click();
  await page.keyboard.type('Escribiendo cuando la pantalla se angosta');
  await page.setViewportSize(NARROW);
  await expect(field).toBeVisible();
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('Escribiendo cuando la pantalla se angosta');
  await expect(rows.first()).toBeHidden();
  await expect(demo).toHaveAttribute('data-view', 'thread');
  expect(await fits(page)).toBe(true);
  // Typing continues exactly where it was, and the next Tab does not jump to an unrelated control.
  await page.keyboard.type(' y sigo');
  await expect(field).toHaveValue('Escribiendo cuando la pantalla se angosta y sigo');
  await page.setViewportSize(WIDE);
  await expect(field).toBeFocused();
  await expect(rows.first()).toBeVisible();
  await expect(field).toHaveValue('Escribiendo cuando la pantalla se angosta y sigo');
});

test('resizing to 390px while on a conversation row keeps the list visible and the row focused', async ({ page }) => {
  const { demo, rows, row, field } = await openDemo(page, WIDE.width, WIDE.height);
  // Moving through the list without opening anything.
  await row('Jorge Mamani').focus();
  await page.setViewportSize(NARROW);
  await expect(row('Jorge Mamani')).toBeVisible();
  await expect(row('Jorge Mamani')).toBeFocused();
  await expect(field).toBeHidden();
  await expect(demo).toHaveAttribute('data-view', 'list');
  await page.keyboard.press('Tab');
  await expect(row('Equipo Tienda')).toBeFocused();
  // After opening a conversation on the wide layout the focus stays on its row; narrowing keeps the list usable.
  await page.setViewportSize(WIDE);
  await row('Jorge Mamani').click();
  await expect(row('Jorge Mamani')).toBeFocused();
  await page.setViewportSize(NARROW);
  await expect(rows.first()).toBeVisible();
  await expect(row('Jorge Mamani')).toBeFocused();
  await expect(row('Jorge Mamani')).toHaveAttribute('aria-current', 'true');
  expect(await focusedTag(page)).toBe('BUTTON');
});

test('widening from 390px while the Back button is focused moves focus to the selected conversation row', async ({ page }) => {
  const { demo, rows, row } = await openDemo(page, NARROW.width, NARROW.height);
  const back = demo.getByRole('button', { name: 'Volver a conversaciones' });
  await row('Jorge Mamani').click();
  await expect(page.getByRole('heading', { level: 2, name: 'Jorge Mamani' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(back).toBeFocused();
  await page.setViewportSize(WIDE);
  await expect(back).toBeHidden();
  await expect(row('Jorge Mamani')).toBeFocused();
  await expect(rows.first()).toBeVisible();
  await expect(demo.getByRole('log')).toBeVisible();
  // Keyboard navigation continues from the row, not from the top of the page or an unrelated control.
  await page.keyboard.press('Tab');
  await expect(row('Equipo Tienda')).toBeFocused();
  expect(await focusedTag(page)).not.toBe('BODY');
});

test('the layout is read from the real layout: enlarged text moves a composing reader to the thread view', async ({ page }) => {
  const { demo, rows, field } = await openDemo(page, WIDE.width, WIDE.height);
  await field.click();
  await page.keyboard.type('Texto más grande');
  // The viewport does not change; the text size does, and the example no longer fits two panes.
  await page.addStyleTag({ content: 'html{font-size:200%}' });
  await expect(rows.first()).toBeHidden();
  await expect(field).toBeVisible();
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('Texto más grande');
  await expect(demo).toHaveAttribute('data-view', 'thread');
});

test('a reader who has not focused anything is not moved by a resize', async ({ page }) => {
  const { demo, rows, field } = await openDemo(page, WIDE.width, WIDE.height);
  await page.setViewportSize(NARROW);
  await expect(rows.first()).toBeVisible();
  await expect(field).toBeHidden();
  await expect(demo).toHaveAttribute('data-view', 'list');
  expect(await focusedTag(page)).toBe('BODY');
  await page.setViewportSize(WIDE);
  await expect(field).toBeVisible();
  expect(await focusedTag(page)).toBe('BODY');
});

test('opening another conversation always starts at its newest message, though every conversation starts with the same separator id', async ({ page }) => {
  // A short window makes both conversations taller than their log, so "starts at the newest message" is a real position.
  const { row, log } = await openDemo(page, 1280, 560);
  const scrollable = () => log.evaluate((el) => el.scrollHeight > el.clientHeight + 40);
  expect(await scrollable(), 'Rosa must be scrollable for this test to mean anything').toBe(true);
  expect(await atBottom(log)).toBe(true);
  // The reader goes back in Rosa's history, then opens Jorge, whose thread is also taller than its log.
  await log.evaluate((el) => { el.scrollTop = 0; });
  await expect.poll(() => log.evaluate((el) => el.scrollTop)).toBe(0);
  await row('Jorge Mamani').click();
  await expect(log).toHaveAttribute('aria-label', 'Mensajes con Jorge Mamani');
  expect(await scrollable(), 'Jorge must be scrollable for this test to mean anything').toBe(true);
  await expect.poll(() => atBottom(log)).toBe(true);
  // Back to Rosa from a Jorge position in history: again the newest message, not the place Jorge was left.
  await log.evaluate((el) => { el.scrollTop = 0; });
  await expect.poll(() => log.evaluate((el) => el.scrollTop)).toBe(0);
  await row('Rosa Quispe').click();
  await expect(log).toHaveAttribute('aria-label', 'Mensajes con Rosa Quispe');
  await expect.poll(() => atBottom(log)).toBe(true);
  expect(await log.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});

// ---- Reposición · Tacna (Step 4B): attachments, work status, simulated warehouse actions -------------------------------------
// The photograph is a fictional SVG illustration, the request states are illustrative, and every action is simulated.
const REPOSICION = 'Reposición · Tacna';
// The container query measures the content box of the message list, in rem.
const contentRem = (log) => log.evaluate((el) => { const style = getComputedStyle(el); return (el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)) / parseFloat(getComputedStyle(document.documentElement).fontSize); });

async function openReposicion(page, width = 1280, height = 900) {
  const ctx = await openDemo(page, width, height);
  const back = ctx.demo.getByRole('button', { name: 'Volver a conversaciones' });
  if (await back.isVisible()) await back.click();
  await ctx.row(REPOSICION).click();
  await expect(ctx.log).toHaveAttribute('aria-label', `Mensajes con ${REPOSICION}`);
  const work = ctx.log.locator('.ce-work-status');
  return {
    ...ctx,
    work,
    now: work.locator('.ce-work-status-now'),
    summary: work.locator('.ce-work-status-summary'),
    steps: work.locator('.ce-work-step'),
    announcement: work.locator('[role="status"]'),
    photo: ctx.log.getByRole('button', { name: /Abrir foto 1 de 1: Anaquel 3/ }),
    action: (name) => work.getByRole('button', { name }),
    stepWords: () => work.locator('.ce-work-step').evaluateAll((items) => items.map((item) => `${item.querySelector('.ce-work-step-label').firstChild.textContent}: ${item.querySelector('.ce-sr-only').textContent.trim()}`)),
  };
}

test('Reposición · Tacna shows the photo, the message, its delivery status and the request, each in its own place', async ({ page }) => {
  const { row, log, messages, work, now, summary, photo, demo } = await openReposicion(page);
  await expect(row(REPOSICION)).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('heading', { level: 2, name: REPOSICION })).toBeVisible();
  await expect(demo.locator('.messaging-demo-title p')).toHaveText('Tienda Tacna y Almacén · conversación de ejemplo');
  await expect(row(REPOSICION)).toContainText('Equipo');
  await expect(messages.filter({ hasText: '¿Algo más para reponer hoy?' })).toContainText('Marco · Almacén');
  const bubble = messages.filter({ hasText: 'Se acabaron los frascos de 1 L en el anaquel 3.' });
  await expect(bubble).toHaveClass(/ce-message--outgoing/);
  // Order inside the bubble: photo, text, delivery meta, then the request.
  const parts = await bubble.evaluate((el) => [...el.children].map((child) => child.className.split(' ')[0]));
  expect(parts).toEqual(['ce-attachments', 'ce-message-text', 'ce-message-meta', 'ce-message-context']);
  // Delivery status is a word in the meta line; the progress of the request is a different block, never mixed.
  await expect(bubble.locator('.ce-message-meta')).toHaveText('10:24Leído · simulado');
  await expect(bubble.locator('.ce-message-meta')).not.toContainText(/Solicitado|Aceptado|Preparando|Resuelto/);
  await expect(work.locator('.ce-work-status-title')).toHaveText('Pedido de reposición');
  await expect(now).toHaveText('Solicitado');
  await expect(summary).toHaveText('Nadie se ha encargado todavía.');
  await expect(work).not.toContainText(/Leído|Entregado|Enviado/);
  await expect(photo).toBeVisible();
  await expect(photo.locator('.ce-attachment-caption')).toHaveText('Anaquel 3');
  const image = photo.locator('img');
  await expect(image).toHaveAttribute('alt', 'Anaquel con un espacio vacío frente a la etiqueta «Frasco de vidrio 1 L»');
  expect(await image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(log.locator('img')).toHaveCount(1);
  await expect(photo).toHaveAccessibleName('Abrir foto 1 de 1: Anaquel 3. Anaquel con un espacio vacío frente a la etiqueta «Frasco de vidrio 1 L»');
  await expect(bubble.getByRole('list', { name: '1 foto' })).toBeVisible();
});

test('the request steps are an ordered list that says every state in words, and the current step is marked', async ({ page }) => {
  const { work, steps, stepWords, now } = await openReposicion(page);
  await expect(work.getByRole('heading', { level: 3, name: 'Pedido de reposición' })).toBeVisible();
  await expect(work).toHaveAccessibleName('Pedido de reposición');
  await expect(work.getByRole('list', { name: 'Progreso' })).toBeVisible();
  expect(await work.locator('ol').evaluate((el) => el.tagName)).toBe('OL');
  expect(await stepWords()).toEqual(['Solicitado: (actual)', 'Aceptado: (pendiente)', 'Preparando: (pendiente)', 'Resuelto: (pendiente)']);
  await expect(steps.nth(0)).toHaveAttribute('aria-current', 'step');
  await expect(work.locator('[aria-current="step"]')).toHaveCount(1);
  await expect(now).toHaveText('Solicitado');
});

test('simulated warehouse actions advance the request Solicitado → Aceptado → Preparando → Resuelto, and each one is recorded', async ({ page }) => {
  const { work, now, summary, steps, stepWords, action, events, demo, announcement, log } = await openReposicion(page);
  const group = work.getByRole('group', { name: 'Acciones simuladas del almacén' });
  await expect(group).toBeVisible();
  await expect(group.getByRole('button')).toHaveText(['Me encargo']);
  await expect(announcement).toHaveText('');
  const delivery = demo.locator('.ce-message-status').filter({ hasText: 'Leído · simulado' });

  await action('Me encargo').click();
  await expect(now).toHaveText('Aceptado');
  await expect(summary).toHaveText('Marco · Almacén se encargó · 10:46');
  expect(await stepWords()).toEqual(['Solicitado: (hecho)', 'Aceptado: (actual)', 'Preparando: (pendiente)', 'Resuelto: (pendiente)']);
  await expect(steps.nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(group.getByRole('button')).toHaveText(['Empezar a preparar']);
  await expect(announcement).toHaveText('Pedido de reposición: Aceptado');
  await expect(events).toContainText('warehouseAction');
  await expect(events).toContainText('Me encargo · Solicitado → Aceptado');

  await action('Empezar a preparar').click();
  await expect(now).toHaveText('Preparando');
  await expect(summary).toHaveText('Marco · Almacén · desde 10:47');
  expect(await stepWords()).toEqual(['Solicitado: (hecho)', 'Aceptado: (hecho)', 'Preparando: (actual)', 'Resuelto: (pendiente)']);
  await expect(group.getByRole('button')).toHaveText(['Marcar resuelto', 'No se puede atender']);
  await expect(announcement).toHaveText('Pedido de reposición: Preparando');
  await expect(events).toContainText('Empezar a preparar · Aceptado → Preparando');

  await action('Marcar resuelto').click();
  await expect(now).toHaveText('Resuelto');
  await expect(summary).toHaveText('Resuelto por Marco · 10:48 · lo informó una persona');
  expect(await stepWords()).toEqual(['Solicitado: (hecho)', 'Aceptado: (hecho)', 'Preparando: (hecho)', 'Resuelto: (actual)']);
  await expect(announcement).toHaveText('Pedido de reposición: Resuelto');
  await expect(events).toContainText('Marcar resuelto · Preparando → Resuelto');
  // The end of the flow: no actions and no empty wrapper, and delivery status was never touched.
  await expect(work.locator('.ce-work-status-actions')).toHaveCount(0);
  await expect(work.getByRole('button')).toHaveCount(0);
  await expect(delivery).toHaveCount(1);
  await expect(log.locator('.ce-message-meta').filter({ hasText: /Solicitado|Aceptado|Preparando|Resuelto/ })).toHaveCount(0);
});

test('the alternative outcome: "No se puede atender" stops the request, says so apart from colour, and explains in the chat', async ({ page }) => {
  const { work, now, summary, stepWords, action, events, steps, log, messages } = await openReposicion(page);
  await action('Me encargo').click();
  await action('Empezar a preparar').click();
  await action('No se puede atender').click();
  await expect(now).toHaveText('No se puede atender');
  await expect(summary).toHaveText('Marco · Almacén · el motivo está escrito en el chat');
  expect(await stepWords()).toEqual(['Solicitado: (hecho)', 'Aceptado: (hecho)', 'Preparando: (hecho)', 'No se puede atender: (se detuvo)']);
  await expect(work.locator('[aria-current="step"]')).toHaveCount(0);
  await expect(events).toContainText('No se puede atender · Preparando → No se puede atender');
  await expect(work.getByRole('button')).toHaveCount(0);
  // The reason is written in the chat, as the summary says, and the log follows because the reader is at the bottom.
  await expect(messages.last()).toContainText('No puedo atender este pedido hoy.');
  await expect(messages.last()).toContainText('Marco · Almacén');
  await expect.poll(() => atBottom(log)).toBe(true);
  // Stopped is a different shape (hatched bar, bold text), not only a different colour.
  const stopped = steps.nth(3);
  const style = await stopped.evaluate((el) => ({ weight: getComputedStyle(el).fontWeight, image: getComputedStyle(el, '::before').backgroundImage, height: getComputedStyle(el, '::before').height }));
  expect(Number(style.weight)).toBeGreaterThanOrEqual(700);
  expect(style.image).toContain('repeating-linear-gradient');
  const pending = await (await openReposicionStep(page)).evaluate((el) => getComputedStyle(el, '::before').backgroundImage);
  expect(pending).not.toBe(style.image);
});
const openReposicionStep = async (page) => page.locator('.ce-work-step').first();

test('keyboard users keep their place: activating an action moves focus to the next action, or to the log at the end', async ({ page }) => {
  const { work, action, log } = await openReposicion(page);
  await action('Me encargo').focus();
  await page.keyboard.press('Enter');
  await expect(action('Empezar a preparar')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(action('Marcar resuelto')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(work.getByRole('button')).toHaveCount(0);
  await expect(log).toBeFocused();
  expect(await ring(log)).toEqual({ style: 'solid', width: 2 });
});

test('opening the photo records a visible simulated event and says there is no viewer', async ({ page }) => {
  const { photo, events, demo, row } = await openReposicion(page);
  await expect(events).toContainText('Aún no hay eventos');
  await photo.click();
  await expect(events).toContainText('openAttachment');
  await expect(events).toContainText(REPOSICION);
  await expect(events).toContainText('Anaquel 3 · foto 1 de 1 · mensaje de las 10:24');
  await expect(events).toContainText('simulado');
  await expect(events).toContainText('No hay visor en esta demostración');
  await expect(events.locator('li')).toHaveCount(1);
  // The record is announced politely, nothing opens, the photo keeps focus and the page stays where it is.
  expect(await events.locator('[aria-live="polite"]').count()).toBe(1);
  await expect(page.locator('dialog, [role="dialog"]')).toHaveCount(0);
  await expect(photo).toBeFocused();
  expect(new URL(page.url()).pathname).toBe('/mensajeria/');
  await photo.click();
  await expect(events.locator('li')).toHaveCount(2);
  // The conversation list says nothing new either.
  await expect(row(REPOSICION)).toContainText('Tú: Se acabaron los frascos de 1 L en el anaquel 3.');
  await expect(demo.locator('.ce-message-status').filter({ hasText: 'Leído · simulado' })).toHaveCount(1);
});

test('each conversation keeps its own drafts and its own request state when you switch', async ({ page }) => {
  const { demo, row, field, work, now, action, summary, modeNote } = await openReposicion(page);
  await field.fill('borrador-para-almacen');
  await action('Me encargo').click();
  await action('Empezar a preparar').click();
  await expect(now).toHaveText('Preparando');
  await expect(row(REPOSICION)).toContainText('Borrador: respuesta sin enviar');
  // Another conversation has its own draft, its own note mode and no request at all.
  await row('Rosa Quispe').click();
  await expect(field).toHaveValue('');
  await expect(demo.locator('.ce-work-status')).toHaveCount(0);
  await field.fill('borrador-para-rosa');
  await modeNote.click();
  await field.fill('nota-para-rosa');
  await row(REPOSICION).click();
  await expect(field).toHaveValue('borrador-para-almacen');
  await expect(now).toHaveText('Preparando');
  await expect(summary).toHaveText('Marco · Almacén · desde 10:47');
  await expect(work.getByRole('button')).toHaveText(['Marcar resuelto', 'No se puede atender']);
  await expect(demo.locator('.ce-composer-mode')).toHaveCount(0);
  await row('Rosa Quispe').click();
  await expect(page.getByRole('radio', { name: 'Responder al cliente' })).toBeChecked();
  await expect(field).toHaveValue('borrador-para-rosa');
  await modeNote.click();
  await expect(field).toHaveValue('nota-para-rosa');
  // A reply in Reposición never lands in the other conversation, and the request never moves because of a message.
  await row(REPOSICION).click();
  await field.fill('Gracias, Marco.');
  await page.keyboard.press('Control+Enter');
  await expect(demo.locator('.ce-message--outgoing').last()).toContainText('Gracias, Marco.');
  await expect(now).toHaveText('Preparando');
});

test('the thread opens at the newest message, with the photo message above it intact', async ({ page }) => {
  const { log, work, row, photo } = await openReposicion(page, 1280, 900);
  expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  await expect.poll(() => atBottom(log)).toBe(true);
  await expect(work).toBeInViewport();
  // The photo is above the fold of the thread; scrolling up reveals it. Opening another thread and coming back starts at the bottom again.
  await log.evaluate((el) => { el.scrollTop = 0; });
  await expect(photo).toBeInViewport();
  await row('Rosa Quispe').click();
  await row(REPOSICION).click();
  await expect.poll(() => atBottom(log)).toBe(true);
});

test('a reader in history is not moved when the request advances; a reader at the bottom stays at the newest message', async ({ page }) => {
  const { log, now, action, work, messages } = await openReposicion(page, 1280, 700);
  expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight + 40)).toBe(true);
  // Reading history: the request advances without the reader touching the thread (events do not scroll the page).
  await log.evaluate((el) => { el.scrollTop = 0; });
  await expect.poll(() => log.evaluate((el) => el.scrollTop)).toBe(0);
  await action('Me encargo').dispatchEvent('click');
  await expect(now).toHaveText('Aceptado');
  await action('Empezar a preparar').dispatchEvent('click');
  await expect(now).toHaveText('Preparando');
  await action('No se puede atender').dispatchEvent('click');
  await expect(now).toHaveText('No se puede atender');
  await expect(messages.last()).toContainText('No puedo atender este pedido hoy.');
  expect(await log.evaluate((el) => el.scrollTop)).toBe(0);
  // A reader who follows the newest message stays there while the block changes height: the actions disappear and a message arrives.
  await log.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await expect.poll(() => atBottom(log)).toBe(true);
  expect(await work.getByRole('button').count()).toBe(0);
});

test('a reader at the bottom stays at the newest message while the request block grows and shrinks', async ({ page }) => {
  const { log, now, action, work } = await openReposicion(page, 390, 700);
  await expect.poll(() => atBottom(log)).toBe(true);
  const heights = [];
  const record = async () => heights.push(await work.evaluate((el) => el.getBoundingClientRect().height));
  await record();
  await action('Me encargo').click();
  await expect(now).toHaveText('Aceptado');
  await expect.poll(() => atBottom(log)).toBe(true);
  await record();
  await action('Empezar a preparar').click();
  await expect(now).toHaveText('Preparando');
  await expect.poll(() => atBottom(log)).toBe(true);
  await record();
  await action('Marcar resuelto').click();
  await expect(now).toHaveText('Resuelto');
  await expect.poll(() => atBottom(log)).toBe(true);
  await record();
  // The block really did change height (two buttons wrap on a phone, none at the end), so the test means something.
  expect(new Set(heights.map(Math.round)).size).toBeGreaterThan(1);
});

test('a late image never shifts the thread: the tile box is reserved before the image arrives', async ({ page }) => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await page.route('**/references/shelf-gap-fictional.svg', async (route) => { await gate; await route.continue(); });
  const { log, photo, now } = await openReposicion(page, 390, 800);
  const tile = photo.locator('xpath=ancestor::li[1]');
  const measure = () => tile.evaluate((el) => { const r = el.getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top), scrollHeight: el.closest('[role="log"]').scrollHeight }; });
  await expect(tile).toBeVisible();
  const before = await measure();
  expect(await photo.locator('img').evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(false);
  expect(Math.abs(before.width / before.height - 4 / 3)).toBeLessThan(0.02);
  release();
  await expect.poll(() => photo.locator('img').evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  const after = await measure();
  expect(after).toEqual(before);
  await expect(now).toHaveText('Solicitado');
  await expect.poll(() => atBottom(log)).toBe(true);
});

for (const width of [320, 390, 768, 1440]) {
  test(`Reposición · Tacna fits at ${width}px: nothing overflows, the tile keeps its 4:3 box and the steps stay inside the bubble`, async ({ page }) => {
    const { log, work, photo, steps, action, demo } = await openReposicion(page, width, 900);
    expect(await fits(page)).toBe(true);
    expect(await contentFits(page)).toBe(true);
    await log.evaluate((el) => { el.scrollTop = 0; });
    const tile = photo.locator('xpath=ancestor::li[1]');
    const box = await tile.boundingBox();
    expect(Math.abs(box.width / box.height - 4 / 3)).toBeLessThan(0.02);
    const bubble = log.locator('.ce-message--outgoing').filter({ hasText: 'Se acabaron los frascos' });
    const bubbleBox = await bubble.boundingBox();
    // One photo fills the width of the bubble.
    expect(box.width).toBeGreaterThan(bubbleBox.width - 30);
    const logBox = await log.boundingBox();
    expect(bubbleBox.x).toBeGreaterThanOrEqual(logBox.x - 1);
    expect(bubbleBox.x + bubbleBox.width).toBeLessThanOrEqual(logBox.x + logBox.width + 1);
    await work.scrollIntoViewIfNeeded();
    const inside = await work.evaluate((el) => { const parent = el.closest('.ce-message').getBoundingClientRect(); return [...el.querySelectorAll('.ce-work-step, .ce-work-status-actions, .ce-button')].every((item) => { const r = item.getBoundingClientRect(); return r.left >= parent.left - 1 && r.right <= parent.right + 1; }); });
    expect(inside).toBe(true);
    // Four steps sit in one row when the message list is wide and in two columns in a narrow one (a container query).
    const columns = await steps.evaluateAll((items) => new Set(items.map((item) => Math.round(item.getBoundingClientRect().left))).size);
    const logWidth = await contentRem(log);
    expect(columns).toBe(logWidth <= 21 ? 2 : 4);
    await action('Me encargo').click();
    expect(await contentFits(page)).toBe(true);
    await expect(demo.locator('.messaging-demo-warehouse')).toBeVisible();
  });
}

test('enlarged text moves the steps to two columns and wraps the labels instead of overflowing', async ({ page }) => {
  const { log, steps, work, field } = await openReposicion(page, 1280, 900);
  // A reader who is composing stays in the thread view when the text grows (see the layout tests above).
  await field.click();
  await page.addStyleTag({ content: 'html{font-size:200%}' });
  await expect(work).toBeVisible();
  expect(await contentFits(page)).toBe(true);
  const columns = await steps.evaluateAll((items) => new Set(items.map((item) => Math.round(item.getBoundingClientRect().left))).size);
  const logWidth = await contentRem(log);
  expect(columns).toBe(logWidth <= 21 ? 2 : 4);
  expect(await work.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
});

// The demo has one photo; the group's other layouts are checked on the real recipe by adding tiles to the same bubble.
test('the attachment group lays out 1, 2, 3, 4 and 5 items as designed, and in two columns in a narrow container', async ({ page }) => {
  const cases = async (width) => {
    const { log, photo } = await openReposicion(page, width, 900);
    return photo.locator('xpath=ancestor::ul[1]').evaluate((ul, count) => {
      const li = ul.querySelector('li');
      const result = {};
      for (const n of [1, 2, 3, 4, 5]) {
        ul.className = `ce-attachments${[1, 2, 4].includes(n) ? ` ce-attachments--${n}` : ''}`;
        while (ul.children.length < n) ul.append(li.cloneNode(true));
        while (ul.children.length > n) ul.lastElementChild.remove();
        const lefts = new Set([...ul.children].map((item) => Math.round(item.getBoundingClientRect().left)));
        const first = ul.children[0].getBoundingClientRect();
        result[n] = { columns: lefts.size, ratio: Math.round((first.width / first.height) * 100) / 100, full: Math.round(first.width) >= Math.round(ul.getBoundingClientRect().width) - 2 };
      }
      return result;
    }, 0);
  };
  const wide = await cases(1440);
  expect(wide[1]).toMatchObject({ columns: 1, ratio: 1.33, full: true });
  expect(wide[2].columns).toBe(2);
  expect(wide[3].columns).toBe(3);
  expect(wide[4].columns).toBe(2);
  expect(wide[5].columns).toBe(3);
  expect(wide[3].ratio).toBeCloseTo(0.67, 1);
  const narrow = await cases(320);
  expect(narrow[1].columns).toBe(1);
  for (const n of [2, 3, 4, 5]) expect(narrow[n].columns, `${n} items in a narrow container`).toBe(2);
});

test('photographic evidence is uncropped by default: the image is contained inside its tile', async ({ page }) => {
  const { photo } = await openReposicion(page);
  const fit = await photo.locator('img').evaluate((img) => getComputedStyle(img).objectFit);
  expect(fit).toBe('contain');
});

test('touch targets in Reposición are at least 44 px on a phone, in every state', async ({ page }) => {
  const { demo, action, work } = await openReposicion(page, 390, 844);
  const small = () => demo.evaluate((root) => [...root.querySelectorAll('.messaging-demo-thread button, .messaging-demo-thread textarea, .messaging-demo-thread label.ce-composer-mode-option > span')]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
    .map((el) => ({ el: `${el.localName}.${el.className}`, w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) }))
    .filter(({ w, h }) => w < 44 || h < 44));
  expect(await small()).toEqual([]);
  await action('Me encargo').click();
  await action('Empezar a preparar').click();
  await expect(work.getByRole('button')).toHaveCount(2);
  expect(await small()).toEqual([]);
});

for (const [width, height] of [[320, 700], [390, 844], [768, 1024], [1440, 900]]) {
  test(`Reposición · Tacna has no accessibility violations at ${width}px, in every request state`, async ({ page }) => {
    const { action, photo, work, log } = await openReposicion(page, width, height);
    const scan = async (label) => {
      const results = await new AxeBuilder({ page }).include('.messaging-demo').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((node) => node.target) })), label).toEqual([]);
    };
    await scan('requested');
    await photo.click();
    await scan('after opening the photo (event recorded)');
    await action('Me encargo').click();
    await scan('accepted');
    await action('Empezar a preparar').click();
    await scan('preparing, two actions');
    await action('Marcar resuelto').click();
    await expect(work.getByRole('button')).toHaveCount(0);
    await scan('resolved');
    await expect(log).toBeFocused();
  });

  test(`Reposición · Tacna has no accessibility violations at ${width}px when the request cannot be attended`, async ({ page }) => {
    const { action } = await openReposicion(page, width, height);
    await action('Me encargo').click();
    await action('Empezar a preparar').click();
    await action('No se puede atender').click();
    const results = await new AxeBuilder({ page }).include('.messaging-demo').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((node) => node.target) }))).toEqual([]);
  });
}

test('Reposición uses no network, storage, dialog or viewer once its image has loaded', async ({ page }) => {
  const { photo, action, demo, now } = await openReposicion(page);
  await page.waitForLoadState('networkidle');
  expect(await photo.locator('img').evaluate((img) => img.complete)).toBe(true);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('dialog', (dialog) => { throw new Error(`unexpected dialog ${dialog.message()}`); });
  await photo.click();
  await action('Me encargo').click();
  await action('Empezar a preparar').click();
  await action('Marcar resuelto').click();
  await expect(now).toHaveText('Resuelto');
  expect(requests).toEqual([]);
  expect(await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie, databases: indexedDB.databases ? (await indexedDB.databases()).length : 0 }))).toEqual({ local: 0, session: 0, cookies: '', databases: 0 });
  const text = await demo.innerText();
  expect(text).not.toMatch(/whatsapp|instagram|messenger|telegram|sms|facebook/i);
  expect(text).not.toMatch(/stock|existencias|disponible|verificad|conciliad|vendid|ventas/i);
  expect(text).not.toMatch(/S\/\s?\d|\bCE\d{8,}\b/);
});

test('the page says the photo is an illustration, the states are illustrative and no viewer exists', async ({ page }) => {
  await openDemo(page);
  const main = await page.locator('main').innerText();
  expect(main).toContain('ilustración inventada');
  expect(main).toContain('estados ilustrativos, no reglas de CE Systems');
  expect(main).toContain('no hay visor');
  expect(main).toContain('leído no es aceptado');
  await expect(page.locator('main img')).toHaveCount(0);
});

test('every conversation starts at its newest message after the new thread was added', async ({ page }) => {
  const { row, log } = await openDemo(page, 1280, 560);
  for (const name of [REPOSICION, 'Rosa Quispe', 'Jorge Mamani', REPOSICION]) {
    await row(name).click();
    await expect(log).toHaveAttribute('aria-label', `Mensajes con ${name}`);
    await expect.poll(() => atBottom(log)).toBe(true);
  }
});
