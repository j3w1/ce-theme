import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// CR-03: the DemoCue design-system card rendered in a real browser with the supplied Inter files and the generated tokens and
// recipes, as the design system's viewer loads them. Nothing here adds CSS beyond the root text size of each case. The card is
// served from a stand-in origin so that recipes/fonts.css finds the Inter files at ../fonts/inter/.
const CUE = 'Demostración — datos y operaciones simulados';
const ORIGIN = 'http://demo-cue.test';
const css = readFileSync('recipes/fonts.css', 'utf8') + readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');
const card = readFileSync('exports/design-system/project/components/DemoCue/preview.html', 'utf8');

async function open(page, { width, text = 1, scope = true }) {
  await page.setViewportSize({ width, height: 900 });
  let html = card.replace('<meta charset="utf-8">', `<meta charset="utf-8"><style>${css}</style><style>html { font-size: ${text * 100}%; }</style>`);
  if (!scope) html = html.replace('class="ce-scope stage"', 'class="stage"');
  await page.route(`${ORIGIN}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === '/recipes/card.html') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    const font = pathname.match(/^\/fonts\/inter\/(Inter-[A-Za-z]+\.woff2)$/);
    if (font) return route.fulfill({ contentType: 'font/woff2', body: readFileSync(`fonts/inter/${font[1]}`) });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.goto(`${ORIGIN}/recipes/card.html`);
  // Measure only once the bold Inter face that draws the cue has loaded.
  const loaded = await page.evaluate(async () => {
    await document.fonts.load('700 1em Inter');
    await document.fonts.ready;
    return [...document.fonts].filter((face) => face.family.replaceAll('"', '') === 'Inter' && face.weight === '700').map((face) => face.status);
  });
  expect(loaded).toEqual(['loaded']);
}

const measure = (page) => page.evaluate(() => {
  const cue = document.querySelector('.ce-demo-cue');
  const main = document.querySelector('main');
  const header = document.querySelector('.ce-page-header');
  const box = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; };
  const style = getComputedStyle(cue);
  const line = parseFloat(style.lineHeight);
  const inner = cue.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  // The width the words would need on one line, from a copy that may not wrap.
  const probe = cue.cloneNode(true);
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;width:max-content;max-width:none';
  main.append(probe);
  const oneLine = probe.getBoundingClientRect().width;
  probe.remove();
  const range = document.createRange();
  range.selectNodeContents(cue);
  return {
    cue: box(cue), main: box(main), header: box(header), lines: Math.round(inner / line), oneLine,
    words: [...range.getClientRects()].map((r) => ({ l: r.left, r: r.right, t: r.top, b: r.bottom })),
    inside: cue.scrollWidth - cue.clientWidth, page: document.documentElement.scrollWidth - innerWidth,
    font: parseFloat(style.fontSize), line, weight: style.fontWeight, border: [style.borderTopWidth, style.borderTopStyle, style.borderTopColor],
    background: style.backgroundColor,
  };
});

for (const width of [390, 768, 1440]) {
  for (const text of [1, 1.5, 2]) {
    test(`DemoCue at ${width}px and text ×${text} wraps inside its container and never overlaps the page header`, async ({ page }) => {
      await open(page, { width, text });
      const m = await measure(page);
      expect(m.font).toBeCloseTo(14 * text, 1);
      expect(m.line).toBeCloseTo(14 * text * 1.2, 1);
      expect(m.weight).toBe('700');
      expect(m.border).toEqual(['2px', 'solid', 'rgb(17, 17, 17)']);
      expect(m.background).toBe('rgba(0, 0, 0, 0)');
      // Never overflows: inside the main region, nothing scrolls inside it and the page does not scroll sideways.
      expect(m.cue.l).toBeGreaterThanOrEqual(m.main.l - 0.5);
      expect(m.cue.r).toBeLessThanOrEqual(m.main.r + 0.5);
      expect(m.inside).toBeLessThanOrEqual(0);
      expect(m.page).toBeLessThanOrEqual(0);
      for (const word of m.words) {
        expect(word.l).toBeGreaterThanOrEqual(m.cue.l);
        expect(word.r).toBeLessThanOrEqual(m.cue.r + 0.5);
      }
      // Wraps: as wide as its words when they fit, otherwise the width of the container and more than one line.
      if (m.oneLine <= m.main.w + 0.5) {
        expect(m.lines).toBe(1);
        expect(Math.abs(m.cue.w - m.oneLine)).toBeLessThan(1);
      } else {
        expect(m.lines).toBeGreaterThan(1);
        expect(m.cue.w).toBeLessThanOrEqual(m.main.w + 0.5);
      }
      if (width === 390) expect(m.lines).toBeGreaterThan(1);
      if (width === 1440 && text === 1) expect(m.cue.w).toBeLessThan(m.main.w / 2);
      // Never overlaps the page header that follows it.
      expect(m.cue.b).toBeLessThanOrEqual(m.header.t + 0.5);
    });
  }
}

for (const scope of [true, false]) {
  test(`DemoCue with consumer words holding a word longer than the container stays inside it${scope ? '' : ', outside .ce-scope'}`, async ({ page }) => {
    await open(page, { width: 390, text: 2, scope });
    // The consumer owns the words; a long unbroken one (an identifier, a link) must still wrap instead of overflowing.
    await page.locator('.ce-demo-cue').evaluate((cue) => { cue.textContent = `Demostración: ${'simulado'.repeat(8)}`; });
    const m = await measure(page);
    expect(m.lines).toBeGreaterThan(2);
    expect(m.cue.r).toBeLessThanOrEqual(m.main.r + 0.5);
    expect(m.inside).toBeLessThanOrEqual(0);
    expect(m.page).toBeLessThanOrEqual(0);
    for (const word of m.words) expect(word.r).toBeLessThanOrEqual(m.cue.r + 0.5);
  });
}

for (const width of [390, 1440]) {
  test(`DemoCue card at ${width}px: no accessibility violations, and the cue is the first thing in the main content`, async ({ page }) => {
    await open(page, { width });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((n) => n.target) }))).toEqual([]);
    const note = page.getByRole('note');
    await expect(note).toHaveCount(1);
    await expect(note).toHaveText(CUE);
    const snapshot = (await page.getByRole('main').ariaSnapshot()).split('\n').map((line) => line.trim());
    expect(snapshot[0]).toBe('- main:');
    expect(snapshot[1]).toBe(`- note: ${CUE}`);
    expect(snapshot.findIndex((line) => line.startsWith('- heading "Productos" [level=1]'))).toBeGreaterThan(1);
  });
}
