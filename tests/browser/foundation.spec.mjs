import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes=['/','/fundamentos/','/componentes/','/patrones/','/aplicaciones/','/descargas/'];
for (const route of routes) {
  test(`${route}: renders without errors, missing images, broken local links or accessibility violations`,async({page,request})=>{
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))));
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
    await expect(page.locator('.ce-code').filter({hasText:'0000123456789'})).toHaveText('0000123456789');
    const style=await page.locator('.ce-price--offer').first().evaluate(el=>({bg:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
    expect(style).toEqual({bg:'rgb(249, 235, 16)',color:'rgb(17, 17, 17)'});
    const priceBottoms=await page.locator('.ce-product-info .ce-price-block').evaluateAll(items=>items.map(item=>item.getBoundingClientRect().bottom));
    const firstRow=priceBottoms.slice(0,columns);
    expect(Math.max(...firstRow)-Math.min(...firstRow)).toBeLessThan(2);
  });
}
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
  await expect(page.getByRole('status')).toHaveText('Copiado al portapapeles');
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('class="ce-button"');
});
test('long identifiers, larger text and failed product images do not break card layout',async({page})=>{
  await page.setViewportSize({width:390,height:1000});
  await page.goto('/patrones/');
  await page.evaluate(()=>{
    document.documentElement.style.fontSize='200%';
    const code=document.querySelector('.ce-code');code.textContent='000000000000000000000000000000000000000000000000000000000000000';
    document.querySelector('.ce-product-name').textContent='Nombre de producto muy largo con detalles de presentación y capacidad adicional';
    document.querySelector('.ce-product-media img').src='/intentionally-missing.png';
  });
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const card=page.locator('.ce-product').first();
  await expect(card.locator('img')).toHaveAttribute('alt','Taza de vidrio resistente al calor');
  const box=await card.boundingBox();expect(box.height).toBeGreaterThan(200);
});
test('reduced motion removes control transitions',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/componentes/');
  expect(await page.locator('.ce-button').first().evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
});
