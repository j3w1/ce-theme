import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes=['/','/fundamentos/','/componentes/','/patrones/','/aplicaciones/','/compartir/','/descargas/','/tienda/','/tienda/categoria/','/tienda/producto/','/tienda/escena/','/tienda/carrito/','/tienda/cuenta/','/sistemas/','/sistemas/etiquetas/'];
for (const route of routes) {
  test(`${route}: renders without errors, missing images, broken local links or accessibility violations`,async({page,request})=>{
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
    await page.evaluate(()=>Promise.all([...document.images].map(image=>{image.loading='eager';return image.decode().catch(()=>{});})));
    expect(await page.locator('img').evaluateAll(images=>images.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src))).toEqual([]);
    expect(errors).toEqual([]);
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.map(({id,nodes})=>({id,elements:nodes.map(n=>n.target)}))).toEqual([]);
    const links=await page.locator('a[href^="/"]').evaluateAll(links=>[...new Set(links.map(link=>link.getAttribute('href').split('#')[0]))]);
    for (const href of links) expect((await request.get(href)).status(),href).toBe(200);
  });
}
for (const width of [390,768,1440]) {
  test(`responsive product hierarchy at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:1000});
    await page.goto('/patrones/');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const columns=await page.locator('.ce-product-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width<640?2:width<1024?3:4);
    await expect(page.locator('.ce-code').filter({hasText:'7730744292227'})).toHaveText('7730744292227');
    const style=await page.locator('.ce-price--offer .ce-price-amount').first().evaluate(el=>({bg:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
    expect(style).toEqual({bg:'rgb(249, 235, 16)',color:'rgb(17, 17, 17)'});
    const gaps=await page.locator('.ce-product-info').evaluateAll(items=>items.flatMap((info)=>{const specs=info.querySelector('.ce-product-specs'),price=info.querySelector('.ce-price-block');return specs&&price?[price.getBoundingClientRect().top-specs.getBoundingClientRect().bottom]:[];}));
    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) expect(Math.abs(gap-12)).toBeLessThan(1.5);
  });
}
for (const route of routes) {
  test(`${route}: no unstyled browser-native control (native controls policy)`,async({page})=>{
    await page.goto(route);
    const offenders=await page.evaluate(()=>{
      const out=[];
      const visible=(el)=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return s.visibility!=='hidden'&&s.display!=='none'&&(r.width>1&&r.height>1);};
      for (const el of document.querySelectorAll('input:not([type=hidden]),select,textarea,button,meter,progress')) {
        const type=el.type||el.localName;
        const checkLike=['checkbox','radio'].includes(type);
        const own=[...el.classList].some((c)=>c.startsWith('ce-'));
        const labelled=el.closest('label[class*="ce-"]')!==null;
        // Fields carry their own ce- class; checks, radios, switches and uploads sit in a ce- label; buttons may sit in a ce- component; the search field, the quantity stepper and table row checkboxes are styled by `ce-search`, `ce-quantity` and `ce-data-table`.
        const ok=el.localName==='button'?own||el.closest('[class*="ce-"]:not(.ce-scope)')!==null:own||(checkLike||type==='file')&&labelled||type==='search'&&el.closest('.ce-search')!==null||type==='number'&&el.closest('.ce-quantity')!==null||type==='checkbox'&&el.closest('.ce-data-table')!==null;
        if (!ok) out.push(`${el.localName}[${type}] has no ce-theme class`);
        if (!visible(el)&&!(checkLike||type==='file')) continue;
        const s=getComputedStyle(el);
        if (!s.fontFamily.includes('Inter')&&!checkLike&&!['range','color','meter','progress'].includes(type)) out.push(`${el.localName}[${type}] is not set in Inter`);
        if (el.localName==='select'&&!el.multiple&&s.appearance==='auto') out.push('select keeps the browser appearance');
        if (['text','email','search','tel','url','password','number','date','time'].includes(type)&&s.appearance==='auto'&&s.borderTopWidth==='2px'&&s.borderTopStyle==='inset') out.push(`${type} input keeps the browser border`);
      }
      return out;
    });
    expect(offenders).toEqual([]);
  });
}
test('native control families render with ce-theme states',async({page})=>{
  await page.goto('/componentes/');
  const area=page.locator('#nat-text');
  await expect(area).toHaveCSS('font-family',/Inter/);
  await area.focus();
  expect(await area.evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(await page.locator('#nat-select').evaluate(el=>getComputedStyle(el).appearance)).toMatch(/none|base-select/);
  expect(await page.locator('#nat-range').evaluate(el=>getComputedStyle(el).appearance)).toBe('none');
  const radio=page.locator('input[name=nat-delivery]').first();
  expect(await radio.evaluate(el=>getComputedStyle(el).appearance)).toBe('none');
  await expect(radio).toBeChecked();
  await page.keyboard.press('Tab');
});
test('mobile navigation supports keyboard focus and Escape recovery',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByText('Saltar al contenido')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const menu=page.locator('.menu-toggle');
  await expect(menu).toHaveAccessibleName('Abrir navegación');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Tab');
  await expect(page.locator('#mobile-navigation a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(page.locator('#mobile-navigation')).toBeHidden();
});
test('interactive category and color choices expose their selected state',async({page})=>{
  await page.goto('/componentes/');
  const category=page.getByRole('group',{name:'Ejemplo de selección de categoría'});
  await category.getByRole('button',{name:'Cocina',exact:true}).click();
  await expect(category.getByRole('button',{name:'Cocina',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(category.getByRole('button',{name:'Todos',exact:true})).toHaveAttribute('aria-pressed','false');
  const colors=page.getByRole('group',{name:'Ejemplo de selección de color'});
  await colors.getByRole('button',{name:'Negro',exact:true}).click();
  await expect(colors.getByRole('button',{name:'Negro',exact:true})).toHaveAttribute('aria-pressed','true');
});
test('application format changes retain code, price and readable proportions',async({page})=>{
  await page.goto('/aplicaciones/');
  for(const [name,ratio] of [['Historia · 9:16',9/16],['Pantalla · 16:9',16/9],['Cuadrado · 1:1',1]]) {
    const control=page.getByRole('button',{name,exact:true});await control.click();
    await expect(control).toHaveAttribute('aria-pressed','true');
    const bounds=await page.locator('#application-art').boundingBox();
    expect(bounds.width/bounds.height).toBeCloseTo(ratio,2);
    await expect(page.locator('#application-art .ce-code')).toHaveText('CE25034101');
    await expect(page.locator('#application-art .ce-price > .ce-sr-only')).toHaveText('Precio actual: 4.5 soles');
  }
});
test('copyable recipe HTML reaches the clipboard and confirms completion',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/componentes/');
  await page.locator('.recipe-source summary').first().click();
  await page.getByRole('button',{name:'Copiar HTML'}).first().click();
  await expect(page.locator('#copy-status')).toHaveText('Copiado al portapapeles');
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('class="ce-button"');
});
test('long identifiers, larger text and failed product images do not break card layout',async({page})=>{
  await page.setViewportSize({width:390,height:1000});
  await page.goto('/patrones/');
  await page.evaluate(()=>{
    document.documentElement.style.fontSize='200%';
    const code=document.querySelector('.ce-code');code.textContent='CE2606144100123';
    document.querySelector('#productos .ce-product-description').textContent='Nombre de producto muy largo con detalles de presentación y capacidad adicional';
    document.querySelector('#productos .ce-product-media img').src='/intentionally-missing.png';
  });
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const card=page.locator('#productos .ce-product').first();
  await expect(card.locator('img')).toHaveAttribute('alt','Taza de Vidrio Resistente al Calor MENE');
  const box=await card.boundingBox();expect(box.height).toBeGreaterThan(200);
});
test('reduced motion removes control transitions',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/componentes/');
  expect(await page.locator('.ce-button').first().evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
});
test('tagged photography links every marker to a product with the same letter',async({page})=>{
  await page.goto('/patrones/');
  const markers=page.locator('#etiquetas .ce-tagged-media .ce-hotspot');
  await expect(markers).toHaveCount(3);
  for (const marker of await markers.all()) {
    const target=(await marker.getAttribute('href')).slice(1);
    const letter=(await marker.locator('[aria-hidden="true"]').textContent()).trim();
    expect(letter).toMatch(/^[A-Z]$/);
    await expect(marker).toHaveAccessibleName(new RegExp(`^Producto ${letter}: `));
    expect(await marker.evaluate(el=>[getComputedStyle(el).backgroundColor,getComputedStyle(el).color,getComputedStyle(el).borderTopWidth])).toEqual(['rgb(17, 17, 17)','rgb(255, 255, 255)','0px']);
    await expect(page.locator(`#${target} .ce-tag-item-title .ce-hotspot`)).toHaveText(letter);
    await expect(page.locator(`#${target} .ce-price > .ce-sr-only`)).toHaveText(/^Precio actual: /);
  }
  await markers.first().click();
  await expect(page).toHaveURL(/#etiqueta-mene$/);
});

test('product codes never wrap and have barely rounded corners',async({page})=>{
  for (const path of ['/sistemas/','/patrones/']) {
    await page.goto(path);
    const codes=await page.locator('.ce-code').evaluateAll(els=>els.map(el=>({lines:Math.round(el.getBoundingClientRect().height/parseFloat(getComputedStyle(el).lineHeight||'1')),white:getComputedStyle(el).whiteSpace,radius:parseFloat(getComputedStyle(el).borderTopLeftRadius),font:parseFloat(getComputedStyle(el).fontSize),h:el.getBoundingClientRect().height})));
    expect(codes.length).toBeGreaterThan(0);
    for (const code of codes) { expect(code.white).toBe('nowrap'); expect(code.radius).toBeLessThanOrEqual(3); expect(code.h).toBeLessThan(code.font*2); }
  }
});
test('feature tags stay inside their frame and never overlap each other or a marker',async({page})=>{
  await page.goto('/patrones/');
  const frame=page.locator('#etiquetas .ce-tagged-media');
  const rects=await frame.evaluate(el=>{const r=(n)=>{const b=n.getBoundingClientRect();return {l:b.left,r:b.right,t:b.top,b:b.bottom};};return {frame:r(el),tags:[...el.querySelectorAll('.ce-feature-tag')].map(r),markers:[...el.querySelectorAll('.ce-hotspot')].map(r)};});
  const hit=(a,b)=>a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t;
  expect(rects.tags.length).toBeGreaterThan(1);
  rects.tags.forEach((tag,i)=>{
    expect(tag.l).toBeGreaterThanOrEqual(rects.frame.l-1); expect(tag.r).toBeLessThanOrEqual(rects.frame.r+1);
    expect(tag.t).toBeGreaterThanOrEqual(rects.frame.t-1); expect(tag.b).toBeLessThanOrEqual(rects.frame.b+1);
    rects.markers.forEach((m)=>expect(hit(tag,m)).toBe(false));
    rects.tags.slice(i+1).forEach((other)=>expect(hit(tag,other)).toBe(false));
  });
});
test('Novedad is green and promotion tiles keep the neutral surface; S/ sits on the baseline by default',async({page})=>{
  await page.goto('/tienda/');
  const tiles=await page.locator('.ce-mosaic .ce-tile').evaluateAll(els=>els.map(el=>getComputedStyle(el).backgroundColor));
  for (const bg of tiles) expect(bg).not.toBe('rgb(249, 235, 16)');
  expect(await page.locator('.ce-mosaic .ce-badge--novedad').first().evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(54, 133, 0)');
  expect(await page.locator('.ce-price-currency').first().evaluate(el=>getComputedStyle(el).alignSelf)).toBe('auto');
});

test('touch and narrow screens show a full-width Añadir al carrito button instead of the hover icon',async({page})=>{
  await page.setViewportSize({width:390,height:900});
  await page.goto('/tienda/categoria/');
  const card=page.locator('[data-store-view="tacna"] .ce-product').first();
  const big=card.locator('.ce-product-add');
  await expect(big).toBeVisible(); await expect(big).toHaveText('Añadir al carrito');
  await expect(card.locator('.ce-product-row > .ce-icon-button--action')).toBeHidden();
  const [b,c]=await Promise.all([big.boundingBox(),card.locator('.ce-product-info').boundingBox()]);
  expect(Math.abs(b.width-c.width)).toBeLessThan(2);
});
test('promo and sale boxes surround only the price, never the basis label',async({page})=>{
  await page.goto('/patrones/');
  const geometry=await page.locator('.ce-price--offer:has(.ce-price-presentation), .ce-price--sale:has(.ce-price-presentation)').first().evaluate(el=>{const a=el.querySelector('.ce-price-amount').getBoundingClientRect(),b=el.querySelector('.ce-price-presentation').getBoundingClientRect();return {amountRight:a.right,basisLeft:b.left,bg:getComputedStyle(el).backgroundColor};});
  expect(geometry.bg).toBe('rgba(0, 0, 0, 0)'); expect(geometry.basisLeft).toBeGreaterThanOrEqual(geometry.amountRight);
});
