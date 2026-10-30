import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { CEAttachmentGroup, CEMessageList, CEWorkStatus } from '../../packages/vue/dist/index.js';

// The messaging components rendered on their own, outside the /mensajeria/ example: the real built components, the generated
// tokens and recipes, and Chromium. Nothing here adds application CSS beyond the width of the parent.
const css = readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');
const render = (component, props) => renderToString(createSSRApp({ render: () => h(component, props) }));
const photo = (n) => ({ id: `foto-${n}`, label: `Anaquel ${n}`, src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='150'/%3E`, alt: `Estante ${n}` });
const STEPS = ['Solicitado', 'Aceptado', 'Preparando', 'Resuelto'].map((label, index) => ({ id: `s${index}`, label, state: index === 0 ? 'done' : index === 1 ? 'current' : 'pending' }));

async function mount(page, parentStyle, html, { rootSize = '', width = 390 } = {}) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<style>${css}body{margin:0}${rootSize}</style><div class="ce-scope"><div id="host" style="${parentStyle}">${html}</div></div>`);
}
const columns = (page, selector) => page.evaluate((query) => new Set([...document.querySelectorAll(query)].map((el) => Math.round(el.getBoundingClientRect().left))).size, selector);
const overflows = (page) => page.evaluate(() => {
  const host = document.querySelector('#host').getBoundingClientRect();
  return [...document.querySelectorAll('#host *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < host.left - 1 || r.right > host.right + 1); }).length;
});

// F1: the message list must not gain a requirement for a definite width. A text-only list inside an auto-sized parent keeps the
// width its text asks for, as it did before attachments and contextual content existed.
test('a text-only message list in an auto-sized parent keeps its intrinsic width', async ({ page }) => {
  const html = await render(CEMessageList, { messages: [{ id: '1', kind: 'incoming', text: 'Buenos días. Necesitamos reponer el anaquel.' }], label: 'Mensajes' });
  const measure = () => page.evaluate(() => {
    const list = document.querySelector('.ce-message-list');
    return { parent: document.querySelector('#host').clientWidth, list: list.clientWidth, scroll: list.scrollWidth, text: document.querySelector('.ce-message-text').getBoundingClientRect().width, type: getComputedStyle(list).containerType };
  });
  await mount(page, 'display:inline-flex;max-width:100%', html);
  const shrink = await measure();
  expect(shrink.type).toBe('normal');
  // The text is longer than a 390px screen leaves room for, so the list takes the whole width and the text wraps inside it.
  expect(shrink.list).toBe(390);
  expect(shrink.scroll).toBeLessThanOrEqual(shrink.list);
  expect(shrink.text).toBeGreaterThan(200);
  // The same list in a parent that is exactly as wide as its content: shrink-to-fit gives it the same width as max-content.
  await mount(page, 'width:max-content;max-width:100%', html);
  expect(await measure()).toMatchObject({ list: 390, text: shrink.text });
  await mount(page, 'display:inline-flex;max-width:100%', html, { width: 1280 });
  const wide = await measure();
  expect(wide.list).toBeGreaterThan(300);
  expect(wide.list).toBeLessThan(700);
  expect(wide.text).toBeGreaterThan(250);
});

// F2: each component draws its own query container, so the narrow layout follows its own width without an ancestor's CSS.
test.describe('standalone attachment group and work status', () => {
  const both = async () => (await render(CEAttachmentGroup, { items: [1, 2, 3].map(photo), label: '3 fotos' })) + (await render(CEWorkStatus, { title: 'Pedido de reposición', steps: STEPS, status: 'Aceptado', summary: 'Marco · Almacén se encargó · 10:31' }));

  test('a 300px block gets two columns of photos and two columns of steps', async ({ page }) => {
    await mount(page, 'width:300px', await both());
    expect(await columns(page, '.ce-attachment')).toBe(2);
    expect(await columns(page, '.ce-work-step')).toBe(2);
    expect(await overflows(page)).toBe(0);
  });

  test('a wide block keeps three columns of photos and one row of steps', async ({ page }) => {
    await mount(page, 'width:600px', await both(), { width: 800 });
    expect(await columns(page, '.ce-attachment')).toBe(3);
    expect(await columns(page, '.ce-work-step')).toBe(4);
  });

  test('enlarged text (200%) in a 640px block makes the container narrow in rem and reflows without overflow', async ({ page }) => {
    await mount(page, 'width:640px', await both(), { width: 800, rootSize: 'html{font-size:200%}' });
    expect(await columns(page, '.ce-attachment')).toBe(2);
    expect(await columns(page, '.ce-work-step')).toBe(2);
    expect(await overflows(page)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    // The step labels wrap instead of being cut.
    expect(await page.evaluate(() => [...document.querySelectorAll('.ce-work-step')].every((el) => el.scrollWidth <= el.clientWidth + 1))).toBe(true);
  });

  test('a block-level parent without any width of its own follows the viewport', async ({ page }) => {
    await mount(page, '', await both(), { width: 320 });
    expect(await columns(page, '.ce-attachment')).toBe(2);
    expect(await columns(page, '.ce-work-step')).toBe(2);
  });

  test('inside a message list the same container is the bubble-sized group, not the list', async ({ page }) => {
    const html = await render(CEMessageList, { messages: [{ id: '1', kind: 'incoming', text: 'Mira.', attachments: [1, 2, 3].map(photo) }], label: 'Mensajes' });
    await mount(page, 'width:300px', html);
    expect(await columns(page, '.ce-attachment')).toBe(2);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.ce-message-list')).containerType)).toBe('normal');
  });
});
