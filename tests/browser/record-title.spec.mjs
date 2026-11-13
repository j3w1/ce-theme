import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// CR-10: a record title with product identity follows the ProductStack. Measured in a harness that loads only the generated
// tokens and recipes, with no application CSS: the vertical distance from the bottom of one line's box to the top of the next.
// data-m names a measured line and carries no style.
const css = readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');

async function mount(page, html, { width = 1100, rootSize = '', style = '' } = {}) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html lang="es"><head><title>Ficha</title><style>${css}body{margin:0}${rootSize}${style}</style></head><body><main class="ce-scope">${html}</main></body></html>`);
}

// For each [title, from, to]: the distance from the bottom of `from` to the top of `to`, rounded to 1/100 px.
const distances = (page, pairs) => page.evaluate((list) => list.map(([title, from, to]) => {
  const box = (name) => document.querySelector(`[data-title="${title}"] [data-m="${name}"]`).getBoundingClientRect();
  return Math.round((box(to).top - box(from).bottom) * 100) / 100;
}), pairs);
const expectDistances = async (page, expected) => {
  const measured = await distances(page, expected.map(([title, from, to]) => [title, from, to]));
  expect(expected.map(([title, from, to], i) => `${title}: ${from} → ${to} ${measured[i]}px`)).toEqual(expected.map(([title, from, to, px]) => `${title}: ${from} → ${to} ${px}px`));
};
// Every box inside the measured titles, so a layout can be compared with and without the identity rules.
const layout = (page) => page.evaluate(() => [...document.querySelectorAll('[data-title], [data-title] *')].map((el) => { const r = el.getBoundingClientRect(); return [el.localName, ...[r.top, r.left, r.width, r.height].map((n) => Math.round(n * 100) / 100)].join(' '); }));
// Deletes the identity rules (the selectors that start with `.ce-record-title >`) from the page's stylesheet; returns how many.
const removeIdentityRules = (page) => page.evaluate(() => {
  const sheet = document.styleSheets[0];
  let removed = 0;
  for (let i = sheet.cssRules.length - 1; i >= 0; i -= 1) if (sheet.cssRules[i].selectorText?.startsWith('.ce-record-title >')) { sheet.deleteRule(i); removed += 1; }
  return removed;
});

const CODE = '<span class="ce-code" style="justify-self:start" data-m="code">CE2606<span class="ce-code-number">1441</span></span>';
const ROW = '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--ce-space-8)" data-m="row"><span class="ce-code">CE2606<span class="ce-code-number">1441</span></span><span class="ce-pill ce-pill--success">Publicado</span></div>';
const META = '<div class="ce-record-meta" data-m="meta"><span>Familia: tazas</span><span>Última edición: equipo de catálogo</span></div>';
const SPECS = '<p class="ce-product-specs" data-m="specs">vidrio borosilicato, 250ml</p>';
const EYEBROW = '<p class="ce-eyebrow" data-m="eyebrow">Publicación</p>';
const BREADCRUMBS = '<nav class="ce-breadcrumbs" aria-label="Ruta" data-m="breadcrumbs"><ol><li><a href="#catalogo">Catálogo</a></li><li><span aria-current="page">Categorías</span></li></ol></nav>';
const identity = (tag, { name = 'MENE', description = 'Taza de Vidrio Resistente al Calor' } = {}) => `<${tag} class="ce-product-heading" data-m="heading"><span class="ce-product-name" data-m="name">${name}</span><span class="ce-product-description" data-m="description">${description}</span></${tag}>`;
const title = (name, inner, style = '') => `<div class="ce-record-title" data-title="${name}"${style ? ` style="${style}"` : ''}>${inner}</div>`;

test('a title with product identity: code to heading 8px, NAME to Description 2px, heading to specs 2px, specs to meta 4px', async ({ page }) => {
  await mount(page, [
    title('identity', CODE + identity('h1') + SPECS + META),
    title('code row', ROW + identity('h2') + META),
    title('eyebrow', EYEBROW + CODE + identity('h2') + SPECS + META),
  ].join(''));
  await expectDistances(page, [
    ['identity', 'code', 'heading', 8], ['identity', 'name', 'description', 2], ['identity', 'heading', 'specs', 2], ['identity', 'specs', 'meta', 4],
    ['code row', 'row', 'heading', 8], ['code row', 'name', 'description', 2], ['code row', 'heading', 'meta', 4],
    ['eyebrow', 'eyebrow', 'code', 4], ['eyebrow', 'code', 'heading', 8], ['eyebrow', 'name', 'description', 2], ['eyebrow', 'heading', 'specs', 2], ['eyebrow', 'specs', 'meta', 4],
  ]);
});

test('a title with a code and a meta line but no specs: heading to meta 4px', async ({ page }) => {
  await mount(page, title('no specs', CODE + identity('h1') + META));
  await expectDistances(page, [['no specs', 'code', 'heading', 8], ['no specs', 'name', 'description', 2], ['no specs', 'heading', 'meta', 4]]);
});

test('titles without product identity keep every distance at 4px, with the heading margin reset still in force', async ({ page }) => {
  const PLAIN = (id) => `<h2 data-m="heading" id="${id}">Categorías de cocina</h2>`;
  await mount(page, [
    title('plain', PLAIN('a') + META),
    title('eyebrow', EYEBROW + PLAIN('b') + META),
    title('breadcrumbs', BREADCRUMBS + PLAIN('c') + META),
    title('code and run-in heading', `${CODE}<h1 data-m="heading">MENE · Taza de Vidrio Resistente al Calor</h1>${META}`),
  ].join(''));
  const expected = [
    ['plain', 'heading', 'meta', 4],
    ['eyebrow', 'eyebrow', 'heading', 4], ['eyebrow', 'heading', 'meta', 4],
    ['breadcrumbs', 'breadcrumbs', 'heading', 4], ['breadcrumbs', 'heading', 'meta', 4],
    ['code and run-in heading', 'code', 'heading', 4], ['code and run-in heading', 'heading', 'meta', 4],
  ];
  await expectDistances(page, expected);
  // `.ce-record-title :is(h1, h2) { margin: 0 }` still sets every heading margin, and no identity rule reaches these titles:
  // without the identity rules the layout is the same, box for box.
  expect(await page.locator('[data-title] :is(h1, h2)').evaluateAll((headings) => headings.map((h) => getComputedStyle(h).margin))).toEqual(['0px', '0px', '0px', '0px']);
  expect(await page.evaluate(() => [...document.styleSheets[0].cssRules].filter((rule) => rule.selectorText === '.ce-record-title :is(h1, h2)').map((rule) => rule.style.margin))).toEqual(['0px']);
  const before = await layout(page);
  expect(await removeIdentityRules(page)).toBe(3);
  expect(await layout(page)).toEqual(before);
  await expectDistances(page, expected);
});

test('a nested identity is unchanged by the recipe; normalised to direct children it measures as a product title', async ({ page }) => {
  // The frozen nested shapes: the code and a span.ce-product-heading inside the heading, which draws its own 6px grid.
  const nested = (tag) => `<${tag} style="display:grid;gap:6px" data-m="outer">${CODE}<span class="ce-product-heading" data-m="heading"><span class="ce-product-name" data-m="name">MENE</span><span class="ce-product-description" data-m="description">Taza de Vidrio Resistente al Calor</span></span></${tag}>`;
  await mount(page, [
    title('nested h2', EYEBROW + nested('h2') + META),
    title('nested h3', nested('h3') + META, 'gap:6px'),
  ].join(''));
  const expected = [
    ['nested h2', 'eyebrow', 'outer', 4], ['nested h2', 'code', 'heading', 6], ['nested h2', 'name', 'description', 2], ['nested h2', 'outer', 'meta', 4],
    ['nested h3', 'code', 'heading', 6], ['nested h3', 'name', 'description', 2],
  ];
  await expectDistances(page, expected);
  const before = await layout(page);
  expect(await removeIdentityRules(page)).toBe(3);
  expect(await layout(page)).toEqual(before);

  // The same titles normalised: each keeps its heading level, the heading gets ce-product-heading, the code becomes its
  // preceding sibling and the inline grids and gaps are removed.
  await mount(page, [
    title('normalised h2', EYEBROW + CODE + identity('h2') + META),
    title('normalised h3', CODE + identity('h3') + SPECS + META),
  ].join(''));
  await expectDistances(page, [
    ['normalised h2', 'eyebrow', 'code', 4], ['normalised h2', 'code', 'heading', 8], ['normalised h2', 'name', 'description', 2], ['normalised h2', 'heading', 'meta', 4],
    ['normalised h3', 'code', 'heading', 8], ['normalised h3', 'name', 'description', 2], ['normalised h3', 'heading', 'specs', 2], ['normalised h3', 'specs', 'meta', 4],
  ]);
});

// A long NAME and Description in a record header: they wrap inside the title column, the code stays on one line, nothing
// overflows the page, and the ProductStack distances hold.
for (const width of [390, 768, 1440]) {
  for (const [label, rootSize] of [['100%', ''], ['150%', 'html{font-size:150%}'], ['200%', 'html{font-size:200%}']]) {
    test(`long identity at ${width}px, text ${label}: wraps in the title, the code stays on one line`, async ({ page }) => {
      const long = identity('h1', { name: 'BALTEL STORM', description: 'Organizador de Cocina Extensible con Dos Niveles, Bandeja Antideslizante y Ganchos Laterales para Utensilios de Uso Diario' });
      await mount(page, `<div class="ce-record-header" style="padding:var(--ce-space-16)"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'/%3E" alt="" width="64" height="64">${title('long', CODE + long + SPECS + META, '--ce-product-text:var(--ce-font-size-title)')}<span class="ce-pill ce-pill--success">Publicado</span></div>`, { width, rootSize });
      const result = await page.evaluate(() => {
        const q = (name) => document.querySelector(`[data-m="${name}"]`);
        const lines = (el) => { const range = document.createRange(); range.selectNodeContents(el); return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size; };
        const title = document.querySelector('.ce-record-title');
        const column = title.getBoundingClientRect();
        // The title's one grid track: the column the header gives it, or the code's width when the code alone is wider.
        const track = parseFloat(getComputedStyle(title).gridTemplateColumns);
        const outside = (el) => { const r = el.getBoundingClientRect(); return r.left < column.left - 0.5 || r.right > column.left + track + 0.5 || el.scrollWidth > el.clientWidth + 1; };
        return {
          pageFits: document.documentElement.scrollWidth <= innerWidth,
          column: column.width, track, code: q('code').getBoundingClientRect().width,
          codeLines: lines(q('code')), codeWrap: getComputedStyle(q('code')).whiteSpace,
          nameLines: lines(q('name')), descriptionLines: lines(q('description')),
          outside: ['code', 'heading', 'name', 'description', 'specs', 'meta'].filter((name) => outside(q(name))),
        };
      });
      expect(result.pageFits).toBe(true);
      expect(result.codeWrap).toBe('nowrap');
      expect(result.codeLines).toBe(1);
      expect(result.outside).toEqual([]);
      expect(result.descriptionLines).toBeGreaterThan(1);
      // The two-word NAME needs a second line where the title column is narrower than it.
      if (width === 390 && rootSize) expect(result.nameLines).toBeGreaterThan(1);
      if (result.code <= result.column + 0.5) expect(Math.abs(result.track - result.column)).toBeLessThan(0.5);
      // At 390px and 200% text the record header (image, title, status pill) leaves the title less room than the one-line code
      // needs, so the code sets the title's width and the identity wraps to it. The header grid is outside CR-10 (section 7).
      else test.info().annotations.push({ type: 'record header', description: `the header leaves the title ${Math.round(result.column)}px; the one-line code needs ${Math.round(result.code)}px` });
      await expectDistances(page, [['long', 'code', 'heading', 8], ['long', 'name', 'description', 2], ['long', 'heading', 'specs', 2], ['long', 'specs', 'meta', 4]]);
    });
  }
}

test('the RecordEditor sample draws the identity heading and follows the ProductStack', async ({ page }) => {
  const preview = readFileSync('exports/design-system/project/components/RecordEditor/preview.html', 'utf8');
  const own = preview.match(/<style>([\s\S]*?)<\/style>/)[1];
  const body = preview.match(/<body>([\s\S]*?)<\/body>/)[1].replace(/src="\.\.\/\.\.\/media\/[^"]+"/g, `src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'/%3E"`);
  await mount(page, body, { width: 1100, style: own });
  const sample = page.locator('.ce-record-title');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(sample.locator(':scope > h1.ce-product-heading > .ce-product-name')).toHaveText('MENE');
  await expect(sample.locator(':scope > h1.ce-product-heading > .ce-product-description')).toHaveText('Taza de Vidrio Resistente al Calor');
  await expect(sample.locator(':scope > .ce-code')).toHaveText('CE26061441');
  const measured = await sample.evaluate((el) => {
    const box = (q) => el.querySelector(q).getBoundingClientRect();
    const d = (a, b) => Math.round((box(b).top - box(a).bottom) * 100) / 100;
    return [d(':scope > .ce-code', ':scope > h1'), d('.ce-product-name', '.ce-product-description'), d(':scope > h1', ':scope > .ce-product-specs'), d(':scope > .ce-product-specs', ':scope > .ce-record-meta')];
  });
  expect(measured).toEqual([8, 2, 2, 4]);
  // The design-system card keeps the whole sample inside its declared height.
  const declared = Number(preview.match(/@dsCard[^>]*height=(\d+)/)[1]);
  expect(await page.evaluate(() => document.body.getBoundingClientRect().height)).toBeLessThanOrEqual(declared);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((n) => n.target) }))).toEqual([]);
});
