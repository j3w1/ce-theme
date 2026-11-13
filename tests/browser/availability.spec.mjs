import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// CR-06 acceptance checks 1, 2 and 4 for the availability line (StockLine, `ce-stock`): the generated tokens and recipes
// only, in a real browser. The words are the wording contract of docs/names.md#stockline; the store labels are long
// on purpose so the statements wrap in a product-grid cell.
const css = readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');
const STATEMENTS = [
  ['available', 'Disponible en Arequipa, tienda de ejemplo del centro'],
  ['limited', 'Pocas unidades en Arequipa, tienda de ejemplo del centro'],
  ['unavailable', 'Agotado en Arequipa, tienda de ejemplo del centro'],
  ['unknown', 'Disponibilidad por confirmar en Arequipa, tienda de ejemplo del centro'],
  ['pending', 'Consultando disponibilidad…'],
  [undefined, 'Disponibilidad por confirmar en Tacna'],
];
const card = ([state, text]) => `<article class="ce-product"><div class="ce-product-info"><p class="ce-store-note">Precio no disponible en Arequipa.</p><ul class="ce-stock" aria-label="Disponibilidad"${state === 'pending' ? ' aria-busy="true"' : ''}><li${state ? ` data-state="${state}"` : ''}>${text}</li></ul></div></article>`;

async function mount(page, { width = 390, text = 100, extra = '' } = {}) {
  await page.setViewportSize({ width, height: 2400 });
  await page.setContent(`<style>${css}body{margin:0;background:#fff}html{font-size:${text}%}${extra}</style><main class="ce-scope" style="padding:16px"><div class="ce-product-grid">${STATEMENTS.map(card).join('')}</div></main>`);
}

/** Box of every statement, of its text lines and of its cell, in page coordinates. */
const statements = (page) => page.evaluate(() => [...document.querySelectorAll('.ce-stock > li')].map((li) => {
  const box = li.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(li);
  const lines = [...range.getClientRects()].filter((rect) => rect.width > 0).sort((a, b) => a.top - b.top);
  const tops = [...new Set(lines.map((rect) => Math.round(rect.top)))];
  const cell = li.closest('.ce-product-info').getBoundingClientRect();
  return {
    state: li.dataset.state ?? 'none', text: li.textContent, left: box.left, top: box.top, right: box.right, bottom: box.bottom,
    scrollWidth: li.scrollWidth, clientWidth: li.clientWidth, cellLeft: cell.left, cellRight: cell.right,
    lines: tops.length, first: { top: lines[0].top, bottom: lines[0].bottom }, second: tops[1] ?? null,
  };
}));

/** The dot of each statement, read from the pixels of a screenshot: the 12px column before its words. */
async function dots(page, boxes) {
  const png = (await page.screenshot()).toString('base64');
  return page.evaluate(async ({ png, boxes }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    return boxes.map((box) => {
      const x0 = Math.floor(box.left), y0 = Math.floor(box.top), w = 12, h = Math.ceil(box.bottom - box.top) + 2;
      const { data } = context.getImageData(x0, y0, w, h);
      const ink = (x, y) => { const i = (y * w + x) * 4; return Math.min(data[i], data[i + 1], data[i + 2]) < 230; };
      let top = null, bottom = null, left = null, right = null;
      for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) if (ink(x, y)) { top ??= y; bottom = y; left = left === null ? x : Math.min(left, x); right = Math.max(right ?? x, x); }
      if (top === null) return null;
      const cx = Math.round((left + right) / 2), cy = Math.round((top + bottom) / 2);
      const at = (x, y) => { const i = (y * w + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
      return { top: y0 + top, bottom: y0 + bottom + 1, height: bottom - top + 1, width: right - left + 1, filledCentre: ink(cx, cy), centre: at(cx, cy) };
    });
  }, { png, boxes });
}

for (const width of [390, 768, 1440]) {
  for (const text of [100, 150, 200]) {
    test(`acceptance 1: the five states at ${width}px with text at ${text}% wrap, keep the dot on the first line and never overflow`, async ({ page }) => {
      await mount(page, { width, text });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight)).toBe(true);
      const boxes = await statements(page);
      const found = await dots(page, boxes);
      expect(boxes).toHaveLength(STATEMENTS.length);
      for (const [index, box] of boxes.entries()) {
        const dot = found[index];
        expect(box.right, `${box.state} stays inside its cell`).toBeLessThanOrEqual(box.cellRight + 0.5);
        expect(box.left).toBeGreaterThanOrEqual(box.cellLeft - 0.5);
        expect(box.scrollWidth, `${box.state} has no hidden overflow`).toBeLessThanOrEqual(box.clientWidth);
        expect(dot, `${box.state} draws a dot`).not.toBeNull();
        expect(Math.abs(dot.height - 10), `${box.state} dot height ${dot.height}`).toBeLessThanOrEqual(1);
        const centre = (dot.top + dot.bottom) / 2;
        expect(centre, `${box.state} dot centre sits on the first line`).toBeGreaterThanOrEqual(box.first.top);
        expect(centre).toBeLessThanOrEqual(box.first.bottom);
        if (box.second !== null) expect(dot.bottom, `${box.state} dot stays above the second line`).toBeLessThanOrEqual(box.second + 1);
      }
      // The long statements really wrap where the cell is narrow, so the first-line check above covers a wrapped line.
      if (width === 390 && text >= 150) expect(boxes.filter((box) => box.lines > 1).length).toBeGreaterThanOrEqual(4);
    });
  }
}

test('acceptance 2: unknown and no data-state draw the same neutral dot; unavailable is the only ring', async ({ page }) => {
  await mount(page);
  const styles = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--ce-color-border-control)';
    document.querySelector('.ce-scope').append(probe);
    const neutral = getComputedStyle(probe).color;
    probe.remove();
    const dots = Object.fromEntries([...document.querySelectorAll('.ce-stock > li')].map((li) => {
      const style = getComputedStyle(li, '::before');
      return [li.dataset.state ?? 'none', { background: style.backgroundColor, shadow: style.boxShadow, width: style.width, height: style.height, radius: style.borderRadius }];
    }));
    return { neutral, dots };
  });
  const { neutral, dots: computed } = styles;
  expect(computed.unknown).toEqual(computed.none);
  expect(computed.pending).toEqual(computed.none);
  expect(computed.none.background).toBe(neutral);
  expect(computed.none.shadow).toBe('none');
  for (const state of ['available', 'limited']) {
    expect(computed[state].shadow, state).toBe('none');
    expect(computed[state].background, state).not.toBe(neutral);
  }
  expect(computed.available.background).not.toBe(computed.limited.background);
  expect(computed.unavailable.background).toBe('rgba(0, 0, 0, 0)');
  expect(computed.unavailable.shadow).not.toBe('none');
  for (const dot of Object.values(computed)) expect([dot.width, dot.height]).toEqual(['10px', '10px']);
  // And on screen: the unknown dot and the dot of an item with no state look the same (same size and the same colour at
  // the centre, within anti-aliasing at a different position on the page); only unavailable is hollow.
  const boxes = await statements(page);
  const found = Object.fromEntries((await dots(page, boxes)).map((dot, index) => [boxes[index].state, dot]));
  for (const state of ['unknown', 'pending']) {
    expect(Math.abs(found[state].width - found.none.width), `${state} dot width`).toBeLessThanOrEqual(1);
    expect(Math.abs(found[state].height - found.none.height), `${state} dot height`).toBeLessThanOrEqual(1);
    for (const [channel, value] of found[state].centre.entries()) expect(Math.abs(value - found.none.centre[channel]), `${state} dot colour`).toBeLessThanOrEqual(8);
  }
  for (const state of ['available', 'limited']) expect(Math.max(...found[state].centre.map((value, channel) => Math.abs(value - found.none.centre[channel]))), `${state} dot differs from neutral`).toBeGreaterThan(24);
  for (const [state, dot] of Object.entries(found)) expect(dot.filledCentre, state).toBe(state !== 'unavailable');
});

const luminance = ([r, g, b]) => {
  const channel = (value) => { const c = value / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const rgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
const grey = ([r, g, b]) => { const v = 0.2126 * r + 0.7152 * g + 0.0722 * b; return [v, v, v]; };
const lead = (text) => text.replace(/ en .*$/, '');

async function words(page) {
  return page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'Canvas';
    document.body.append(probe);
    const canvas = getComputedStyle(probe).color;
    probe.remove();
    return { canvas, items: [...document.querySelectorAll('.ce-stock > li[data-state]')].map((li) => {
      const box = li.getBoundingClientRect();
      return { state: li.dataset.state, text: li.innerText.trim(), color: getComputedStyle(li).color, visible: box.width > 0 && box.height > 0 && getComputedStyle(li).visibility === 'visible' };
    }) };
  });
}

test('acceptance 4: with forced colours the states stay distinguishable by their words', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await mount(page);
  test.skip(!(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)), 'This browser does not emulate forced colours.');
  const { canvas, items } = await words(page);
  expect(items.map((item) => item.state)).toEqual(['available', 'limited', 'unavailable', 'unknown', 'pending']);
  expect(new Set(items.map((item) => lead(item.text))).size).toBe(5);
  for (const item of items) {
    expect(item.visible, item.state).toBe(true);
    expect(contrast(rgb(item.color), rgb(canvas)), `${item.state} words against Canvas`).toBeGreaterThanOrEqual(4.5);
  }
});

test('acceptance 4: in greyscale the states stay distinguishable by their words', async ({ page }) => {
  await mount(page, { extra: 'html{filter:grayscale(1)}' });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).filter)).toBe('grayscale(1)');
  const { items } = await words(page);
  expect(new Set(items.map((item) => lead(item.text))).size).toBe(5);
  // State is never carried by the colour of the words: every statement has the same text colour, readable in grey.
  expect(new Set(items.map((item) => item.color)).size).toBe(1);
  for (const item of items) {
    expect(item.visible, item.state).toBe(true);
    expect(contrast(grey(rgb(item.color)), [255, 255, 255]), `${item.state} words in grey`).toBeGreaterThanOrEqual(4.5);
  }
});

for (const route of ['tienda/', 'tienda/categoria/', 'tienda/producto/', 'tienda/escena/']) {
  test(`${route}: every availability list is named Disponibilidad`, async ({ page }) => {
    await page.goto(route);
    const lists = page.locator('ul.ce-stock');
    expect(await lists.count()).toBeGreaterThan(0);
    expect(await page.locator('ul.ce-stock:not([aria-label="Disponibilidad"])').count()).toBe(0);
    const shown = await page.locator('ul.ce-stock:visible').count();
    expect(shown).toBeGreaterThan(0);
    await expect(page.getByRole('list', { name: 'Disponibilidad', exact: true })).toHaveCount(shown);
    expect(await page.locator('ul.ce-stock[role="status"]').count()).toBe(0);
  });
}
