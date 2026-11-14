import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Actual generated foundation and shipped Inter 3.015: no font substitute, zoom, body-only resize or proposal CSS.
const css = readFileSync('exports/tokens.css', 'utf8') + readFileSync('exports/recipes.css', 'utf8');
const fonts = [['Regular', 400], ['SemiBold', 600], ['Bold', 700], ['ExtraBold', 800]].map(([file, weight]) =>
  `@font-face{font-family:Inter;font-weight:${weight};src:url(data:font/woff2;base64,${readFileSync(`fonts/inter/Inter-${file}.woff2`).toString('base64')}) format('woff2')}`).join('');
const preview = readFileSync('design-system/components/Cart/preview.html', 'utf8');
// Exercise the very lines shipped in the preview, not a second invented cart skeleton.
const lines = [...preview.matchAll(/<li class="ce-cart-line"[\s\S]*?<\/div><\/li>/g)].map(([html]) => html).join('');

async function mount(page, width = 390, factor = 1, baseURL) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto('./');
  await page.setContent(`<!doctype html><html lang="es"><head><title>Carrito — aceptación</title><style>${fonts}${css}body{margin:0}main{padding:16px}</style></head><body><main class="ce-scope"><h1>Carrito</h1><a id="before" href="#antes">Antes de los productos</a><ul class="ce-cart-lines">${lines.replaceAll('../../media/', new URL('assets/', baseURL).pathname)}</ul><p id="nota-min">La cantidad mínima suministrada es 1.</p></main></body></html>`);
  await page.evaluate(async () => {
    await Promise.all([400, 600, 700, 800].map((weight) => document.fonts.load(`${weight} 16px Inter`)));
    await document.fonts.ready;
  });
  return page.evaluate((factor) => {
    const nodes = [...document.querySelectorAll('main, main *')];
    const before = nodes.map((el) => parseFloat(getComputedStyle(el).fontSize));
    // Freeze each computed size before changing any ancestor: every px/rem/em/inherited descendant grows exactly once.
    nodes.forEach((el, i) => el.style.setProperty('font-size', `${before[i] * factor}px`, 'important'));
    return nodes.filter((el) => !el.closest('svg')).map((el) => ({
      tag: el.tagName, class: el.className, ratio: parseFloat(getComputedStyle(el).fontSize) / before[nodes.indexOf(el)],
      font: getComputedStyle(el).fontFamily,
    }));
  }, factor);
}

for (const width of [390, 768, 1440]) for (const factor of [1, 1.5, 2]) {
  test(`CR04/08: all optional and supplied states at ${width}px, computed text ×${factor}`, async ({ page, baseURL }, testInfo) => {
    const scaled = await mount(page, width, factor, baseURL);
    for (const node of scaled) {
      expect(node.ratio, `${node.tag}.${node.class} actually scales`).toBeCloseTo(factor, 4);
      expect(node.font).toContain('Inter');
    }
    const report = await page.locator('.ce-cart-line').evaluateAll((items) => items.map((line) => {
      const rect = (el) => { const r = el.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height }; };
      const body = line.querySelector('.ce-cart-line-body');
      const children = [...body.children].filter((el) => !el.hidden);
      // Measure the actual identity text boxes, so padding/min-height on the heading/link cannot fake the gaps.
      const edge = (el, first) => el.matches('.ce-product-heading')
        ? rect(first ? el.querySelector('.ce-product-name') : el.querySelector('.ce-product-description') ?? el.querySelector('.ce-product-name'))
        : rect(el);
      const gaps = children.slice(1).map((el, i) => ({ from:children[i].className, to:el.className, gap:edge(el, true).top - edge(children[i], false).bottom }));
      const name = line.querySelector('.ce-product-name'), description = line.querySelector('.ce-product-description');
      if (description) gaps.push({ from:'NAME', to:'Description', gap:rect(description).top - rect(name).bottom });
      const code = line.querySelector('.ce-code');
      return {
        id:line.dataset.line, line:rect(line), body:rect(body), image:rect(line.querySelector('img')), gaps,
        padding:parseFloat(getComputedStyle(line).paddingTop), priceSize:line.querySelector('.ce-price') && parseFloat(getComputedStyle(line.querySelector('.ce-price')).fontSize),
        code:code && { ...rect(code), white:getComputedStyle(code).whiteSpace, scroll:code.scrollWidth, client:code.clientWidth },
        spills:[...line.querySelectorAll('*')].filter((el) => !el.matches('.ce-sr-only, svg, svg *') && !el.hidden && !el.closest('[hidden]')).flatMap((el) => {
          const r=rect(el);
          return r.width && (r.left < rect(line).left - 0.6 || r.right > rect(line).right + 0.6 || r.top < rect(line).top - 0.6 || r.bottom > rect(line).bottom + 0.6 || (el.matches('.ce-product-name, .ce-product-description, .ce-product-specs') && el.scrollWidth > el.clientWidth + 1)) ? [el.className || el.tagName] : [];
        }),
        targets:[...line.querySelectorAll('a, button, input')].map((el) => {
          const box=rect(el), hit=el.matches('a') ? parseFloat(getComputedStyle(el,'::after').height) : box.height;
          return { class:el.className || el.tagName, ...box, hitHeight:Math.max(box.height,hit) };
        }),
      };
    }));
    expect(report.length).toBeGreaterThanOrEqual(13);
    for (const row of report) {
      expect(row.spills, row.id).toEqual([]);
      expect(row.body.left >= row.image.right + 15.5 || row.body.top >= row.image.bottom + 15.5, `${row.id}: image/body do not overlap`).toBe(true);
      if ((width >= 768 && row.id !== 'long-code') || (width === 390 && factor === 1 && ['ordinary','second'].includes(row.id))) {
        expect(row.body.left, `${row.id}: keep the ordinary side-by-side composition when it fits`).toBeGreaterThanOrEqual(row.image.right + 15.5);
      }
      expect(row.image.width).toBe(width < 640 ? 88 : 128);
      expect(row.image.height).toBe(row.image.width);
      expect(row.padding).toBe(24);
      if (row.priceSize) expect(row.priceSize).toBe(28 * factor);
      if (row.code) {
        expect(row.code.white).toBe('nowrap');
        expect(row.code.right, `${row.id}: code gets real room`).toBeLessThanOrEqual(row.body.right + 0.6);
        expect(row.code.scroll).toBeLessThanOrEqual(row.code.client);
      }
      for (const { from, to, gap } of row.gaps) {
        const expected = from === 'ce-code' ? 8 : to === 'ce-product-specs' || to === 'Description' ? 2 : /ce-price-block|ce-store-note|ce-price-pending/.test(to) ? 12 : to === 'ce-stock' ? 8 : to === 'ce-cart-line-actions' ? 12 : 8;
        expect(gap, `${row.id}: ${from} → ${to}`).toBeCloseTo(expected, 1);
      }
      for (const target of row.targets) {
        expect(target.width, `${row.id}: ${target.class} width`).toBeGreaterThanOrEqual(44);
        expect(target.hitHeight, `${row.id}: ${target.class} hit height`).toBeGreaterThanOrEqual(44);
      }
    }
    // Hit-test the whole expanded product target (including top/bottom outside a short identity), and the midpoints of rounded control edges.
    for (const target of await page.locator('.ce-cart-line :is(a,button,input)').all()) {
      await target.evaluate((el) => el.scrollIntoView({ block:'center', inline:'nearest' }));
      const hits=await target.evaluate((el) => {
        const r=el.getBoundingClientRect(), height=el.matches('a') ? Math.max(r.height,parseFloat(getComputedStyle(el,'::after').height)) : r.height;
        const top=(r.top+r.bottom-height)/2;
        const points=el.matches('a')
          ? [r.left+1,r.right-1].flatMap((x) => [top+1,top+height-1].map((y) => [x,y]))
          : [[(r.left+r.right)/2,r.top+1],[(r.left+r.right)/2,r.bottom-1],[r.left+1,(r.top+r.bottom)/2],[r.right-1,(r.top+r.bottom)/2]];
        return points.map(([x,y]) => { const hit=document.elementFromPoint(x,y); return { x,y,correct:hit === el || el.contains(hit) }; });
      });
      for (const hit of hits) expect(hit.correct, `target hit ${JSON.stringify(hit)}`).toBe(true);
    }
    console.log('Cart measured acceptance', JSON.stringify({ width,factor,lines:report.length,examples:report.filter((row) => ['ordinary','name-only','long-code'].includes(row.id)) }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('a a, a button, a input, button a, button button, button input').count()).toBe(0);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(axe.violations.map(({ id, nodes }) => ({ id, targets:nodes.map((n) => n.target) }))).toEqual([]);
    await testInfo.attach(`cart-${width}-text-${factor}.json`, { body:JSON.stringify({ scaled, report }, null, 2), contentType:'application/json' });
  });
}

for (const width of [390,768,1440]) for (const factor of [1,1.5,2]) test(`keyboard at ${width}px text ×${factor} follows native order, skips disabled controls, and shows every focus ring`, async ({ page, baseURL }) => {
  await mount(page,width,factor,baseURL);
  const first = page.locator('[data-line="ordinary"]');
  const sequence = [first.locator('a'), first.getByRole('button', { name:'Reducir cantidad de MENE' }), first.getByRole('spinbutton'), first.getByRole('button', { name:'Aumentar cantidad de MENE' }), first.getByRole('button', { name:'Quitar MENE del carrito', exact:true })];
  await page.locator('#before').focus();
  for (const item of sequence) {
    await page.keyboard.press('Tab');
    await expect(item).toBeFocused();
    const style = await item.evaluate((el) => { const s=getComputedStyle(el); return [s.outlineStyle, s.outlineWidth, s.outlineOffset]; });
    expect(style).toEqual(['solid','2px','3px']);
  }
  for (const item of sequence.slice(0, -1).reverse()) {
    await page.keyboard.press('Shift+Tab');
    await expect(item).toBeFocused();
  }
  const pending = page.locator('[data-line="pending"]');
  await pending.locator('a').focus();
  await page.keyboard.press('Tab');
  await expect(pending.getByRole('spinbutton')).toBeFocused();
  const unavailable = page.locator('[data-line="unavailable"]');
  await unavailable.locator('a').focus();
  await page.keyboard.press('Tab');
  await expect(unavailable.getByRole('button', { name:'Quitar MENE del carrito', exact:true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(unavailable.locator('a')).toBeFocused();
});

test('product link target never steals quantity/remove clicks at any text factor', async ({ page, baseURL }) => {
  for (const factor of [1, 1.5, 2]) {
    await mount(page, 390, factor, baseURL);
    const first=page.locator('[data-line="ordinary"]');
    await first.evaluate((line) => {
      window.cartHits=[];
      line.querySelectorAll('a,button,input').forEach((el) => el.addEventListener('click', (event) => { event.preventDefault(); window.cartHits.push(el.tagName === 'A' ? 'product' : el.getAttribute('aria-label') || el.tagName); }));
    });
    for (const control of await first.locator('button,input').all()) await control.click();
    expect(await page.evaluate(() => window.cartHits)).toEqual(['Reducir cantidad de MENE','INPUT','Aumentar cantidad de MENE','BUTTON']);
    await first.locator('a').click();
    expect(await page.evaluate(() => window.cartHits.at(-1))).toBe('product');
  }
});

test('preview and reference cart adopt the anatomy and CR06 supplied-state contract', async ({ page }) => {
  await page.goto('tienda/carrito/');
  const cart=page.locator('.ce-cart-lines');
  await expect(cart).toHaveAccessibleName('Productos en tu carrito');
  await expect(cart.locator('.ce-cart-line-actions .ce-price')).toHaveCount(0);
  for (const line of await cart.locator('.ce-cart-line').all()) {
    await expect(line.locator('img')).toHaveAttribute('alt','');
    await expect(line.locator('.ce-cart-line-body > .ce-code')).toHaveCount(1);
    await expect(line.getByRole('button', { name:/^Quitar .+ del carrito$/ })).toHaveCount(1);
    await expect(line.getByRole('list', { name:'Disponibilidad', exact:true })).toHaveCount(1);
  }
  expect(preview).toContain('data-cart-case="empty"');
  for (const id of ['pending','acknowledged','failed','unavailable','switch','blocked','expired','offline','removed']) expect(preview).toContain(`data-cart-case="${id}"`);
});

for (const width of [390, 768, 1440]) test(`complete current Cart preview at ${width}px is accessible and fits`, async ({ page, baseURL }) => {
  await page.setViewportSize({ width, height:1000 });
  await page.goto('./');
  await page.setContent(preview.replace('<meta charset="utf-8">', `<meta charset="utf-8"><style>${fonts}${css}</style>`).replaceAll('../../media/', new URL('assets/', baseURL).pathname));
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result=await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.map(({id,nodes}) => ({id,targets:nodes.map((n) => n.target)}))).toEqual([]);
  for (const id of ['empty','removed']) await expect(page.locator(`[data-cart-case="${id}"]`)).toBeVisible();
});

test('cart changes leave a consumer page and controls outside the cart unchanged', async ({ page }) => {
  await page.goto('./');
  await page.setContent('<style>body{margin:13px;font:19px serif}#outside{padding:7px;color:rgb(10,20,30)}</style><p id="outside">Consumer content</p><div class="ce-quantity"><input aria-label="Other quantity" value="2"></div>');
  const read=() => page.locator('#outside, .ce-quantity input').evaluateAll((items) => items.map((el) => { const s=getComputedStyle(el); return [s.fontSize,s.fontFamily,s.padding,s.color,s.minHeight,s.width]; }));
  await page.addStyleTag({ content:css.replace(/^\s*\.ce-cart[^\n]*\n/gm, '') });
  const before=await read();
  await page.addStyleTag({ content:css });
  expect(await read()).toEqual(before);
  expect(before[0]).toEqual(['19px','serif','7px','rgb(10, 20, 30)','0px',before[0][5]]);
});

test('static cart HTML shows one store quote before JavaScript and without JavaScript', async ({ browser, baseURL }) => {
  const context=await browser.newContext({ javaScriptEnabled:false, baseURL });
  const page=await context.newPage();
  try {
    await page.goto('tienda/carrito/');
    await expect(page.locator('.ce-cart-line .ce-price:visible')).toHaveCount(2);
    await expect(page.locator('.ce-cart-line .ce-stock:visible')).toHaveCount(2);
    await expect(page.locator('.ce-summary:visible')).toHaveCount(1);
    await expect(page.locator('.ce-order-summary .ce-button:visible')).toHaveCount(1);
    for (const node of await page.locator('.ce-cart [data-store-view="arequipa"], .ce-cart [data-store-view="ninguna"]').all()) await expect(node).toBeHidden();
    expect(await page.locator('.ce-summary:visible dd').allTextContents()).toEqual(['S/21.50','Sin costo','S/21.50']);
  } finally { await context.close(); }
});

test('cart quotes and scenario labels follow only the supplied selected store', async ({ page }) => {
  await page.goto('tienda/carrito/?tienda=arequipa');
  expect(await page.locator('.ce-cart-line .ce-price-value:visible').allTextContents()).toEqual(['13.8','8.5']);
  expect(await page.locator('.ce-summary:visible dd').allTextContents()).toEqual(['S/22.30','Sin costo','S/22.30']);
  await expect(page.getByText('Escenario: MENE tiene pocas unidades confirmadas en Arequipa.')).toBeVisible();
  await expect(page.getByText('Escenario: TALEN tiene pocas unidades confirmadas en Tacna.')).toBeHidden();
  await page.goto('tienda/carrito/?tienda=ninguna');
  await expect(page.locator('.ce-cart-line .ce-price:visible, .ce-cart-line .ce-stock:visible, .ce-summary:visible, .ce-order-summary .ce-button:visible')).toHaveCount(0);
  await expect(page.locator('.ce-cart-line-body > .ce-store-note:visible')).toHaveCount(2);
  await expect(page.locator('.ce-cart-line')).toHaveCount(2);
});

test('preview disabled controls reference their supplied reason; the supplied unit-basis example has quantity one', async ({ page, baseURL }) => {
  await mount(page,390,1,baseURL);
  for (const id of ['unavailable','blocked']) {
    const line=page.locator(`[data-line="${id}"]`);
    for (const control of await line.locator(':disabled').all()) {
      await expect(control).toHaveAttribute('aria-describedby',`reason-${id}`);
      await expect(control).toHaveAccessibleDescription(/El servicio no permite modificar la cantidad de MENE/);
    }
  }
  const basis=page.locator('[data-line="basis"]');
  await expect(basis.getByRole('spinbutton')).toHaveValue('1');
  await expect(basis.locator('.ce-price > .ce-sr-only')).toHaveText('Importe de la línea: 6.5 soles cada uno');
});
