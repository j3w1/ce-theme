import { readFileSync, readdirSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// CR-02: the StateFrame documentation kit on a synthetic state sheet (tests/fixtures/state-frame-sheet.html), loaded as a
// board loads the design-system bundle: project/tokens.css (with the supplied Inter files), components/bundle.css, then
// doc-kit/state-frame.css. Pages are served from a stand-in origin, so no server is started. Text is enlarged the way a
// reader's text-size setting does it: every font size, px sizes included, and the root size grow by the factor.
const ORIGIN = 'http://state-frame.test';
const CANON = 'Demostración — datos y operaciones simulados';
const EXEMPT = 'Exempt from the demonstration cue (no simulated data):';
const MARKER = 28; // size.marker
const WIDTHS = [390, 768, 1440];
const FACTORS = [1, 1.5, 2];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
const publish = JSON.parse(readFileSync('exports/design-system/publish.json', 'utf8'));
const sheet = readFileSync('tests/fixtures/state-frame-sheet.html', 'utf8');
const TYPES = { css: 'text/css', woff2: 'font/woff2', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml' };

async function serve(page, pages) {
  await page.context().route(`${ORIGIN}/**`, (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname.slice(1));
    const type = TYPES[path.split('.').pop()];
    if (path in pages) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: pages[path] });
    if (publish.files[path]) return route.fulfill({ contentType: type, body: readFileSync(publish.files[path]) });
    if (/^project\/[\w/.-]+\.css$/.test(path)) return route.fulfill({ contentType: type, body: readFileSync(`exports/design-system/${path}`) });
    return route.fulfill({ status: 404, body: '' });
  });
}

async function ready(page) {
  const faces = await page.evaluate(async () => {
    await Promise.all(['400 1em Inter', '700 1em Inter'].map((font) => document.fonts.load(font)));
    await document.fonts.ready;
    // Loaded and decoded, so a screenshot never catches an image half drawn.
    await Promise.all([...document.images].map((img) => img.decode().catch(() => null)));
    return [...document.fonts].filter((face) => face.family.replaceAll('"', '') === 'Inter' && ['400', '700'].includes(face.weight)).map((face) => face.status);
  });
  expect(faces.length).toBeGreaterThanOrEqual(2);
  expect(faces.every((status) => status === 'loaded')).toBe(true);
}

// Every element's font size and the root size grow by the factor; px spacing stays. Proves the growth on every element that
// holds text, among them the px-sized cart price (.ce-cart-line .ce-price is 28px in the recipes).
async function enlarge(page, factor) {
  const sizes = await page.evaluate((k) => {
    const all = [document.body, ...document.body.querySelectorAll('*')];
    const texts = all.filter((el) => [...el.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim()));
    const read = (els) => els.map((el) => parseFloat(getComputedStyle(el).fontSize));
    const before = read(texts);
    const own = read(all);
    all.forEach((el, i) => { el.style.fontSize = `${own[i] * k}px`; });
    document.documentElement.style.fontSize = `${parseFloat(getComputedStyle(document.documentElement).fontSize) * k}px`;
    const price = document.querySelector('.ce-cart-line .ce-price');
    return { before, after: read(texts), price: parseFloat(getComputedStyle(price).fontSize) };
  }, factor);
  expect(sizes.before.length).toBeGreaterThan(40);
  sizes.after.forEach((size, i) => expect(Math.abs(size - sizes.before[i] * factor), `text size ${i} grows x${factor}`).toBeLessThan(0.05));
  expect(sizes.price).toBeCloseTo(28 * factor, 1);
}

async function open(page, width, factor = 1) {
  await page.setViewportSize({ width, height: 900 });
  await serve(page, { 'sheet.html': sheet });
  await page.goto(`${ORIGIN}/sheet.html`);
  await ready(page);
  if (factor !== 1) await enlarge(page, factor);
}

function measure() {
  const box = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; };
  const lines = (el) => { const range = document.createRange(); range.selectNodeContents(el); return [...range.getClientRects()].map((r) => ({ l: r.left, r: r.right })); };
  return [...document.querySelectorAll('.ce-state-frame')].map((frame) => {
    const label = frame.querySelector(':scope > .ce-state-frame-label');
    const column = label.querySelector(':scope > div');
    const title = column.querySelector('.ce-state-frame-title');
    const mark = label.querySelector(':scope > .ce-state-frame-mark');
    const style = getComputedStyle(mark);
    // The ink of the marker's characters, from the font's own metrics, placed on the rendered text run.
    const context = document.createElement('canvas').getContext('2d');
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = context.measureText(mark.textContent);
    const range = document.createRange();
    range.selectNodeContents(mark);
    const run = range.getBoundingClientRect();
    const baseline = run.top + metrics.fontBoundingBoxAscent;
    const ink = { l: run.left - metrics.actualBoundingBoxLeft, r: run.left + metrics.actualBoundingBoxRight, t: baseline - metrics.actualBoundingBoxAscent, b: baseline + metrics.actualBoundingBoxDescent };
    // The width the title would need on one line, from a copy that may not wrap.
    const probe = title.cloneNode(true);
    probe.removeAttribute('id');
    probe.style.cssText += ';position:absolute;visibility:hidden;white-space:nowrap;width:max-content;max-width:none';
    column.append(probe);
    const oneLine = probe.getBoundingClientRect().width;
    probe.remove();
    const padding = parseFloat(getComputedStyle(label).paddingRight);
    return {
      title: title.textContent.replace(/\s+/g, ' ').trim(), frame: box(frame), label: box(label), column: box(column), mark: box(mark), ink,
      markText: mark.textContent, markFont: parseFloat(style.fontSize), run: run.width, markPad: parseFloat(style.paddingLeft) + parseFloat(style.paddingRight), padding, oneLine,
      titleHeight: title.getBoundingClientRect().height, titleLine: parseFloat(getComputedStyle(title).lineHeight),
      words: [...lines(title), ...lines(column.querySelector('.ce-state-frame-note'))],
      overflow: { frame: frame.scrollWidth - frame.clientWidth, label: label.scrollWidth - label.clientWidth, column: column.scrollWidth - column.clientWidth },
    };
  });
}

// The sheet's own markers (A to E, 1, 2, 10) and, on the same frames, wider valid one- and two-character markers.
const WIDE = ['W', 'M', 'WW', 'MW', '88', 'H', 'A1', '20', 'MM'];
for (const width of WIDTHS) {
  for (const factor of FACTORS) {
    for (const marks of [null, WIDE]) {
    test(`StateFrame at ${width}px, text x${factor}${marks ? ', wide markers' : ''}: no overflow, the label wraps, the marker keeps size.marker and holds its characters`, async ({ page }) => {
      await open(page, width, 1);
      if (marks) await page.evaluate((texts) => document.querySelectorAll('.ce-state-frame-mark').forEach((mark, i) => { mark.textContent = texts[i]; }), marks);
      if (factor !== 1) await enlarge(page, factor);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'no sideways page scroll').toBeLessThanOrEqual(0);
      const frames = await page.evaluate(measure);
      expect(frames).toHaveLength(9);
      for (const m of frames) {
        const at = `${m.title} at ${width}px x${factor}`;
        expect(m.frame.l, `${at}: frame inside the page`).toBeGreaterThanOrEqual(-0.5);
        expect(m.frame.r, `${at}: frame inside the page`).toBeLessThanOrEqual(width + 0.5);
        for (const [part, extra] of Object.entries(m.overflow)) expect(extra, `${at}: nothing overflows the ${part}`).toBeLessThanOrEqual(0);
        expect(m.column.r, `${at}: the label text stays inside the strip`).toBeLessThanOrEqual(m.label.r - m.padding + 0.5);
        for (const word of m.words) {
          expect(word.l, `${at}: label line`).toBeGreaterThanOrEqual(m.column.l - 0.5);
          expect(word.r, `${at}: label line`).toBeLessThanOrEqual(m.column.r + 0.5);
        }
        // The label wraps when its words do not fit on one line.
        if (m.oneLine > m.column.w + 0.5) expect(m.titleHeight, `${at}: the title wraps`).toBeGreaterThan(m.titleLine * 1.5);
        // The marker is size.marker tall at every text size. It is size.marker wide unless its characters and inline padding
        // need more, and then it widens into a pill instead of letting them out: no exact square is assumed.
        expect(m.mark.h, `${at}: marker height`).toBeCloseTo(MARKER, 1);
        expect(m.mark.w, `${at}: marker width for "${m.markText}"`).toBeCloseTo(Math.max(MARKER, m.run + m.markPad), 1);
        // The sheet's own markers all fit the 28px circle at 100% text.
        if (factor === 1 && !marks) expect(m.mark.w, `${at}: marker "${m.markText}" is a circle`).toBeCloseTo(MARKER, 1);
        expect(m.markFont, `${at}: marker text`).toBeCloseTo(14 * factor, 1);
        expect(m.ink.l, `${at}: marker ink left`).toBeGreaterThanOrEqual(m.mark.l - 0.5);
        expect(m.ink.r, `${at}: marker ink right`).toBeLessThanOrEqual(m.mark.r + 0.5);
        expect(m.ink.t, `${at}: marker ink top`).toBeGreaterThanOrEqual(m.mark.t - 0.5);
        expect(m.ink.b, `${at}: marker ink bottom`).toBeLessThanOrEqual(m.mark.b + 0.5);
        if (factor === 1 && m.mark.w < MARKER + 0.05) {
          // At 100% text a marker as wide as it is tall is a circle; every corner of the ink box lies inside it.
          const cx = (m.mark.l + m.mark.r) / 2;
          const cy = (m.mark.t + m.mark.b) / 2;
          for (const [x, y] of [[m.ink.l, m.ink.t], [m.ink.r, m.ink.t], [m.ink.l, m.ink.b], [m.ink.r, m.ink.b]]) {
            expect(Math.hypot(x - cx, y - cy), `${at}: marker ink inside the circle`).toBeLessThanOrEqual(MARKER / 2 + 0.25);
          }
        }
      }
      // Below the bundle's 640px breakpoint the frame drops its side borders and the body padding is 16px, else 24px.
      const chrome = await page.evaluate(() => [...document.querySelectorAll('.ce-state-frame')].map((frame) => {
        const style = getComputedStyle(frame);
        return { band: frame.matches('.ce-state-frame--band'), left: style.borderLeftWidth, top: style.borderTopWidth, rule: getComputedStyle(frame.querySelector('.ce-state-frame-label')).borderTopWidth, pad: getComputedStyle(frame.querySelector('.ce-state-frame-body')).paddingLeft };
      }));
      for (const frame of chrome) {
        expect(frame.pad).toBe(width < 640 ? '16px' : '24px');
        expect(frame.left).toBe(frame.band || width < 640 ? '0px' : '1px');
        expect(frame.top).toBe(frame.band ? '0px' : '1px');
        expect(frame.rule).toBe(frame.band ? '4px' : '0px');
      }
    });
    }
  }
}

// The fragment inside a frame renders exactly as it does on its own. Each fragment is copied into a page of its own that
// loads only tokens.css and the bundle (no kit), into a plain block as wide as the frame body's content box at the same place
// on the page and with the same text sizes; its pixels and the boxes of every element in it must match the framed copy.
const alone = ({ fragment, x, y, width, sizes }) => `<!doctype html>
<html lang="es" style="${sizes.html}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="project/tokens.css"><link rel="stylesheet" href="project/components/bundle.css">
<style>body { margin: 0; background: var(--ce-color-surface-canvas); } .alone { display: flow-root; }</style></head>
<body style="${sizes.body}"><div class="ce-scope" style="${sizes.scope}"><div style="height: ${y}px"></div><div class="alone" style="margin-left: ${x}px; width: ${width}px">${fragment}</div><div style="height: 100vh"></div></div></body></html>`;
const boxesOf = (fragment) => {
  const origin = fragment.getBoundingClientRect();
  return {
    at: { x: origin.left + scrollX, y: origin.top + scrollY, width: origin.width, height: origin.height },
    boxes: [fragment, ...fragment.querySelectorAll('*')].map((el) => { const r = el.getBoundingClientRect(); return [r.left - origin.left, r.top - origin.top, r.width, r.height]; }),
  };
};
for (const width of WIDTHS) {
  for (const factor of FACTORS) {
    test(`StateFrame at ${width}px, text x${factor}: every fragment is pixel- and box-identical to the same fragment on its own`, async ({ page }) => {
      await open(page, width, factor);
      const count = await page.locator('.ce-state-frame').count();
      const solo = await page.context().newPage();
      await solo.setViewportSize({ width, height: 900 });
      for (let index = 0; index < count; index += 1) {
        const framed = await page.evaluate(([i, measure]) => {
          const body = document.querySelectorAll('.ce-state-frame-body')[i];
          const kids = [...body.children];
          const fragment = kids.at(-1);
          const outer = body.getBoundingClientRect();
          const style = getComputedStyle(body);
          const left = outer.left + parseFloat(style.paddingLeft);
          const right = outer.right - parseFloat(style.paddingRight);
          const own = (0, eval)(`(${measure})`)(fragment);
          return {
            ...own, kids: kids.map((kid) => kid.className), title: body.parentElement.querySelector('.ce-state-frame-title').textContent.trim(),
            html: fragment.outerHTML, x: left + scrollX, width: right - left, y: own.at.y - parseFloat(getComputedStyle(fragment).marginTop),
            inside: own.at.x >= left + scrollX - 0.5 && own.at.x + own.at.width <= right + scrollX + 0.5, overflow: body.scrollWidth - body.clientWidth,
            frameOverflow: body.parentElement.scrollWidth - body.parentElement.clientWidth,
            // The scrollport: the body's padding box, in page coordinates.
            port: { x: outer.left + body.clientLeft + scrollX, y: outer.top + body.clientTop + scrollY, width: body.clientWidth, height: body.clientHeight },
            focusable: [body.getAttribute('tabindex'), body.getAttribute('role'), body.getAttribute('aria-labelledby') === body.parentElement.querySelector('.ce-state-frame-title').id],
            sizes: { html: document.documentElement.getAttribute('style') ?? '', body: document.body.getAttribute('style') ?? '', scope: document.querySelector('.ce-scope').getAttribute('style') ?? '' },
          };
        }, [index, boxesOf.toString()]);
        const at = `${framed.title} at ${width}px x${factor}`;
        expect(framed.kids.length, `${at}: the body holds the cue, then one fragment`).toBeLessThanOrEqual(2);
        if (framed.kids.length === 2) expect(framed.kids[0]).toBe('ce-demo-cue');
        expect(framed.kids.at(-1)).not.toBe('ce-demo-cue');
        expect(framed.frameOverflow, `${at}: nothing leaves the frame`).toBeLessThanOrEqual(0);
        const scrolls = framed.overflow > 0;
        if (scrolls) {
          // A fragment wider than its body keeps its size and scrolls inside it; the body is focusable and named.
          expect(framed.focusable, `${at}: a scrolling body is a focusable group named by the title`).toEqual(['0', 'group', true]);
        } else {
          expect(framed.inside, `${at}: the fragment stays inside the body`).toBe(true);
        }
        const clip = framed.at;
        // What the frame shows: the fragment inside the scrollport, at the start and, when it scrolls, at the end.
        const windows = [];
        for (const left of scrolls ? [0, framed.overflow] : [0]) {
          const shown = await page.evaluate(([i, x]) => { const body = document.querySelectorAll('.ce-state-frame-body')[i]; body.scrollLeft = x; return body.scrollLeft; }, [index, left]);
          expect(shown, `${at}: scrolled to ${left}`).toBe(left);
          // A body that does not scroll shows the fragment's own box. A scrolling body shows its whole scrollport across the
          // fragment's height: padding and content scroll together, so position p in the port is x + left + p on its own.
          const y0 = Math.max(clip.y, framed.port.y);
          const y1 = Math.min(clip.y + clip.height, framed.port.y + framed.port.height);
          const view = scrolls ? { x: framed.port.x, y: y0, width: framed.port.width, height: y1 - y0 } : clip;
          windows.push({ left, view, shot: await page.screenshot({ fullPage: true, clip: view, animations: 'disabled', caret: 'hide' }) });
        }
        await page.evaluate((i) => { document.querySelectorAll('.ce-state-frame-body')[i].scrollLeft = 0; }, index);
        await solo.route(`${ORIGIN}/alone-${index}.html`, (route) => route.fulfill({ contentType: 'text/html; charset=utf-8', body: alone({ fragment: framed.html, x: framed.x, y: framed.y, width: framed.width, sizes: framed.sizes }) }));
        await solo.goto(`${ORIGIN}/alone-${index}.html`);
        await ready(solo);
        const own = await solo.evaluate((measure) => (0, eval)(`(${measure})`)(document.querySelector('.alone').firstElementChild), boxesOf.toString());
        for (const key of ['x', 'y', 'width', 'height']) expect(Math.abs(own.at[key] - clip[key]), `${at}: fragment ${key} ${own.at[key]} on its own, ${clip[key]} in the frame`).toBeLessThan(0.02);
        expect(own.boxes.length).toBe(framed.boxes.length);
        own.boxes.forEach((box, i) => box.forEach((value, j) => expect(Math.abs(value - framed.boxes[i][j]), `${at}: element ${i} box ${j}`).toBeLessThan(0.02)));
        for (const { left, view, shot } of windows) {
          const onItsOwn = await solo.screenshot({ fullPage: true, clip: { ...view, x: view.x + left }, animations: 'disabled', caret: 'hide' });
          expect(onItsOwn.equals(shot), `${at}: the fragment draws the same pixels on its own${left ? `, scrolled ${left}px` : ''}`).toBe(true);
        }
      }
      await solo.close();
    });
  }
}

for (const width of [390, 1440]) {
  for (const factor of [1, 2]) {
    test(`StateFrame sheet at ${width}px, text x${factor}: no accessibility violations; frames named by their titles in heading order`, async ({ page }) => {
      await open(page, width, factor);
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((n) => n.target) }))).toEqual([]);
      const best = await new AxeBuilder({ page }).withRules(['heading-order', 'page-has-heading-one', 'landmark-unique', 'region']).analyze();
      expect(best.violations.filter(({ id }) => id !== 'region').map(({ id }) => id)).toEqual([]);
      const structure = await page.evaluate(() => ({
        headings: [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1])),
        frames: [...document.querySelectorAll('.ce-state-frame')].map((frame) => {
          const title = frame.querySelector('.ce-state-frame-title');
          const group = frame.parentElement.closest('section');
          return {
            named: frame.getAttribute('aria-labelledby') === title.id, level: Number(title.tagName[1]),
            groupLevel: group ? Number(group.querySelector(':scope > h2, :scope > h3')?.tagName[1]) : null,
            hidden: frame.querySelector('.ce-state-frame-mark').getAttribute('aria-hidden'),
            lang: frame.querySelector('.ce-state-frame-label > div').lang,
            badges: [...title.querySelectorAll('.ce-badge')].map((badge) => [badge.lang, badge.textContent]),
            inner: [...frame.querySelectorAll('.ce-state-frame-body :is(h1, h2, h3, h4, h5, h6)')].map((h) => Number(h.tagName[1])),
          };
        }),
      }));
      // One h1 first, then no skipped level anywhere on the sheet.
      expect(structure.headings[0]).toBe(1);
      expect(structure.headings.filter((level) => level === 1)).toHaveLength(1);
      structure.headings.forEach((level, i) => { if (i) expect(level, `heading ${i}`).toBeLessThanOrEqual(structure.headings[i - 1] + 1); });
      for (const frame of structure.frames) {
        expect(frame.named).toBe(true);
        expect(frame.level).toBe(frame.groupLevel ? frame.groupLevel + 1 : 2);
        expect(frame.hidden).toBe('true');
        expect(frame.lang).toBe('en');
        for (const [lang, word] of frame.badges) expect([lang, word]).toEqual(['es', 'Escenario']);
        for (const level of frame.inner) expect(level, 'fragment headings sit below the frame title').toBeGreaterThan(frame.level);
      }
      // The accessibility tree: each frame is a region named by its title (the badge read as a word); the marker is not read.
      const tree = await page.locator('.ce-scope').ariaSnapshot();
      for (const name of ['Store selected', 'Store change pending Escenario', 'Unknown route', 'Locked fields Escenario', 'Listing at full width Escenario', 'Codes that stay on one line', 'Label band over a page section', 'Long NAME, Description and code inside a group', 'No store chosen Escenario']) {
        expect(tree).toContain(`- region "${name}"`);
      }
      expect(tree).toContain('- group "Codes that stay on one line"');
      for (const mark of ['A', 'B', 'C', 'D', '10', 'F', 'E', '1', '2']) expect(tree).not.toMatch(new RegExp(`^\\s*- text: ${mark}$`, 'm'));
    });
  }
}

// A fragment wider than its body (codes that stay on one line) scrolls inside the body: nothing leaves the frame or the page,
// and keyboard, wheel and touch users reach all of it. The body is reached with Tab, shows the focus ring inside its edge,
// scrolls with the arrow keys, lets Tab continue into the fragment's own link at the far end (whose ring stays visible) and out.
for (const [width, factor] of [[390, 1], [390, 2], [768, 2]]) {
  test(`StateFrame at ${width}px, text x${factor}: a wide fragment scrolls inside its body and stays reachable by keyboard and wheel`, async ({ page }) => {
    await open(page, width, factor);
    const body = page.locator('.ce-state-frame-body[role="group"]');
    await expect(body).toHaveCount(1);
    const state = () => body.evaluate((el) => ({ left: el.scrollLeft, max: el.scrollWidth - el.clientWidth, frame: el.parentElement.scrollWidth - el.parentElement.clientWidth, page: document.documentElement.scrollWidth - innerWidth }));
    const start = await state();
    expect(start.max, 'the table is wider than the body').toBeGreaterThan(0);
    expect(start.frame, 'nothing leaves the frame').toBeLessThanOrEqual(0);
    expect(start.page, 'nothing leaves the page').toBeLessThanOrEqual(0);
    // Tab from the focusable before it reaches the body, which shows the 2px focus ring inside its edge.
    await page.locator('.ce-table-wrap').focus();
    await page.keyboard.press('Tab');
    expect(await body.evaluate((el) => document.activeElement === el)).toBe(true);
    const ring = await body.evaluate((el) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--ce-color-focus)';
      el.append(probe);
      const focus = getComputedStyle(probe).color;
      probe.remove();
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { style: s.outlineStyle, width: s.outlineWidth, offset: s.outlineOffset, color: s.outlineColor === focus, left: r.left, right: r.right };
    });
    expect(ring).toMatchObject({ style: 'solid', width: '2px', offset: '-2px', color: true });
    expect(ring.left).toBeGreaterThanOrEqual(-0.5);
    expect(ring.right).toBeLessThanOrEqual(width + 0.5);
    // The arrow keys scroll it to the end, where the last cell is fully inside the scrollport.
    for (let press = 0; press < 80; press += 1) {
      const now = await state();
      if (now.left >= now.max - 0.5) break;
      await page.keyboard.press('ArrowRight');
    }
    await expect.poll(async () => (await state()).left, { message: 'ArrowRight reaches the end' }).toBeGreaterThanOrEqual(start.max - 0.5);
    const port = () => body.evaluate((el) => { const r = el.getBoundingClientRect(); return { l: r.left + el.clientLeft, r: r.left + el.clientLeft + el.clientWidth }; });
    const lastCell = await body.locator('tbody td:last-child').evaluate((el) => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right }; });
    expect(lastCell.r).toBeLessThanOrEqual((await port()).r + 0.5);
    // Tab continues into the link at the far end; its focus ring (outline and offset) stays inside the scrollport.
    await page.keyboard.press('Tab');
    const link = body.locator('a.ce-link');
    expect(await link.evaluate((el) => document.activeElement === el)).toBe(true);
    const linkRing = await link.evaluate((el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); const out = parseFloat(s.outlineWidth) + parseFloat(s.outlineOffset); return { l: r.left - out, r: r.right + out, style: s.outlineStyle }; });
    expect(linkRing.style).toBe('solid');
    const end = await port();
    expect(linkRing.l).toBeGreaterThanOrEqual(end.l - 0.5);
    expect(linkRing.r).toBeLessThanOrEqual(end.r + 0.5);
    // Tab leaves the body; Shift+Tab comes back to the link, then to the body; the arrow keys return to the start.
    await page.keyboard.press('Tab');
    expect(await body.evaluate((el) => el.contains(document.activeElement))).toBe(false);
    await page.keyboard.press('Shift+Tab');
    expect(await link.evaluate((el) => document.activeElement === el)).toBe(true);
    await page.keyboard.press('Shift+Tab');
    expect(await body.evaluate((el) => document.activeElement === el)).toBe(true);
    for (let press = 0; press < 80 && (await state()).left > 0.5; press += 1) await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => (await state()).left, { message: 'ArrowLeft returns to the start' }).toBeLessThanOrEqual(0.5);
    // A horizontal wheel scrolls it.
    const box = await body.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(160, 0);
    await expect.poll(async () => (await state()).left, { message: 'the wheel scrolls the body' }).toBeGreaterThan(0);
    await body.evaluate((el) => { el.scrollLeft = 0; });
    const after = await state();
    expect(after.frame).toBeLessThanOrEqual(0);
    expect(after.page).toBeLessThanOrEqual(0);
  });
}

// A touch pan scrolls a wide body, on a touch screen at phone width. The finger is driven by raw touch events through the
// Chromium DevTools Protocol, which reach native scrolling as a real touch does; WebKit offers no touch input to a test, so this
// one runs in Chromium only.
test('StateFrame at 390px on a touch screen: a touch pan scrolls a wide body and nothing leaves the frame or the page', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'touch input is driven through the Chromium DevTools Protocol only');
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 900 } });
  const page = await context.newPage();
  await open(page, 390, 1);
  const body = page.locator('.ce-state-frame-body[role="group"]');
  await body.scrollIntoViewIfNeeded();
  const box = await body.boundingBox();
  const state = () => body.evaluate((el) => ({ left: el.scrollLeft, max: el.scrollWidth - el.clientWidth, frame: el.parentElement.scrollWidth - el.parentElement.clientWidth, page: document.documentElement.scrollWidth - innerWidth }));
  expect((await state()).max).toBeGreaterThan(0);
  const cdp = await context.newCDPSession(page);
  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + Math.min(box.height / 2, 60));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 10; step += 1) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - step * 12, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => (await state()).left, { message: 'a touch pan scrolls the body' }).toBeGreaterThan(0);
  const after = await state();
  expect(after.frame).toBeLessThanOrEqual(0);
  expect(after.page).toBeLessThanOrEqual(0);
  await context.close();
});

test('StateFrame sheet: every frame with simulated data carries its own cue first in its body; only the named frame is exempt', async ({ page }) => {
  await open(page, 1440);
  const frames = await page.evaluate((exemptSentence) => {
    const sentence = [...document.querySelectorAll('p')].find((p) => p.textContent.trim() === exemptSentence);
    const exempt = [...sentence.nextElementSibling.querySelectorAll('li')].map((li) => li.textContent.trim());
    return {
      exempt,
      sheetCue: [...document.querySelectorAll('.ce-demo-cue')].filter((cue) => !cue.closest('.ce-state-frame')).length,
      frames: [...document.querySelectorAll('.ce-state-frame')].map((frame) => {
        const body = frame.querySelector(':scope > .ce-state-frame-body');
        const first = body.firstElementChild;
        return {
          title: frame.querySelector('.ce-state-frame-title').firstChild.textContent.trim(),
          cue: first.matches('.ce-demo-cue') ? { role: first.getAttribute('role'), text: first.textContent, box: first.getBoundingClientRect().width <= body.getBoundingClientRect().width } : null,
          cues: body.querySelectorAll('.ce-demo-cue').length,
        };
      }),
    };
  }, EXEMPT);
  expect(frames.sheetCue, 'the optional sheet-level cue').toBe(1);
  expect(frames.exempt).toEqual(['Unknown route']);
  for (const frame of frames.frames) {
    if (frames.exempt.includes(frame.title)) {
      expect(frame.cue, `${frame.title} is exempt`).toBeNull();
      expect(frame.cues).toBe(0);
    } else {
      expect(frame.cue, `${frame.title} carries its own cue`).toEqual({ role: 'note', text: CANON, box: true });
      expect(frame.cues).toBe(1);
    }
  }
  const notes = page.getByRole('note');
  await expect(notes).toHaveCount(9);
  for (const text of await notes.allTextContents()) expect(text).toBe(CANON);
});

// Loading the kit after the bundle changes nothing the bundle draws: on every design-system component card, every element and
// pseudo-element keeps every computed style and its box with and without the kit. (Pixels are compared on the fragments
// above; a card's large photos scaled into small boxes are resampled at a quality Chromium picks by timing, so card
// screenshots are not stable enough to compare, while computed styles and boxes are.)
const cards = readdirSync('exports/design-system/project/components/', { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
// One hash per element of its box and of every computed property of the element, ::before and ::after.
function fingerprint() {
  const hash = (text) => { let h = 2166136261; for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619); return h >>> 0; };
  const style = (el, pseudo) => { const s = getComputedStyle(el, pseudo); return [...s].map((property) => `${property}:${s.getPropertyValue(property)}`).join(';'); };
  return [...document.body.querySelectorAll('*')].map((el) => { const r = el.getBoundingClientRect(); return hash(`${el.tagName}|${r.left},${r.top},${r.width},${r.height}|${style(el)}|${style(el, '::before')}|${style(el, '::after')}`); });
}
test('the kit, loaded after the bundle, changes no computed style or box on any design-system component card', async ({ page }) => {
  test.setTimeout(180_000);
  expect(cards.length).toBeGreaterThan(40);
  await page.setViewportSize({ width: 1200, height: 800 });
  const pages = {};
  for (const name of cards) {
    const html = readFileSync(`exports/design-system/project/components/${name}/preview.html`, 'utf8');
    const head = '<link rel="stylesheet" href="../../tokens.css"><link rel="stylesheet" href="../bundle.css">';
    // Some cards animate forever (the CE Radio states); both renders stop every animation the same way.
    const still = '<style>*, *::before, *::after { animation: none !important; transition: none !important; }</style>';
    pages[`project/components/${name}/bundle.html`] = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">${head}`).replace('</head>', `${still}</head>`);
    pages[`project/components/${name}/kit.html`] = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">${head}<link rel="stylesheet" href="../../doc-kit/state-frame.css">`).replace('</head>', `${still}</head>`);
  }
  await serve(page, pages);
  for (const name of cards) {
    const seen = [];
    for (const variant of ['bundle', 'kit']) {
      await page.goto(`${ORIGIN}/project/components/${name}/${variant}.html`);
      await ready(page);
      expect(await page.evaluate(() => [...document.styleSheets].filter((sheet) => sheet.href?.endsWith('state-frame.css')).length)).toBe(variant === 'kit' ? 1 : 0);
      seen.push({ styles: await page.evaluate(fingerprint) });
    }
    expect(seen[1].styles.length, `${name}: elements`).toBe(seen[0].styles.length);
    const changed = seen[1].styles.map((value, i) => (value === seen[0].styles[i] ? null : i)).filter((i) => i !== null);
    expect(changed, `${name}: elements whose style or box the kit changes`).toEqual([]);
  }
});
