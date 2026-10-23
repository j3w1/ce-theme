import test from 'node:test';
import assert from 'node:assert/strict';
import { formatName, formatDescription, formatSpec, productView, codeSegments } from '../recipes/product.mjs';
import { campaignColors, contrastRatio } from '../recipes/campaign.mjs';

test('NAME is the uppercase catalogue name', () => {
  assert.equal(formatName('baltel storm'), 'BALTEL STORM');
  assert.equal(formatName('  WILUL '), 'WILUL');
  assert.equal(formatName(''), undefined);
  assert.equal(formatName(undefined), undefined);
});

test('Description uses Title Case with Spanish connectors in lowercase', () => {
  assert.equal(formatDescription('frasco con cucharita'), 'Frasco con Cucharita');
  assert.equal(formatDescription('Taza de vidrio resistente al calor'), 'Taza de Vidrio Resistente al Calor');
  assert.equal(formatDescription('FRASCO CON CUCHARITA'), 'Frasco con Cucharita');
  assert.equal(formatDescription('Frasco con cucharita 250ml'), 'Frasco con Cucharita 250ml');
  assert.equal(formatDescription('Cartera de cuero PU'), 'Cartera de Cuero PU');
  assert.equal(formatDescription('de madera'), 'De Madera');
});

test('specifications are lowercase but keep abbreviations, designations and preserved values', () => {
  assert.equal(formatSpec('Vidrio Borosilicato, 250ml'), 'vidrio borosilicato, 250ml');
  assert.equal(formatSpec('Cuero PU'), 'cuero PU');
  assert.equal(formatSpec('Vidrio/Bambú'), 'vidrio/bambú');
  assert.equal(formatSpec('PVC'), 'PVC');
  assert.equal(formatSpec('Hecho en Perú', { preserve: ['Perú'] }), 'hecho en Perú');
  assert.equal(formatSpec('14*65CM'), '14*65cm');
  assert.equal(formatSpec('1L'), '1L');
  assert.equal(formatSpec('Talla M'), 'talla M');
});

test('the product view never invents fields and keeps codes exact', () => {
  const view = productView({ code: 'CE26061477', name: 'frasco', description: 'frasco con cucharita', specs: ['Vidrio/Bambú', '', '10x6.5cm'] });
  assert.deepEqual(view.specs, ['vidrio/bambú', '10x6.5cm']);
  assert.equal(view.code, 'CE26061477');
  assert.equal(view.image, undefined);
  assert.equal(view.accessibleName, 'FRASCO, Frasco con Cucharita');
  assert.deepEqual(productView({ description: 'x', specs: ['a', 'b', 'c'] }, { maxSpecs: 2 }).specs, ['a', 'b']);
  assert.throws(() => productView({ name: 'A', code: 26061477 }), /strings/);
  assert.throws(() => productView({ specs: ['a'] }), /NAME or a Description/);
});

test('campaign colours must keep text legible', () => {
  assert.ok(contrastRatio('#111111', '#f9eb10') > 15);
  assert.equal(campaignColors({ background: '#da2e3a', text: '#ffffff' }).ok, true);
  assert.equal(campaignColors({ background: '#e6303d', text: '#ffffff' }).ok, false);
  assert.equal(campaignColors({ background: '#e6303d', text: '#ffffff', largeText: true }).ok, true);
  assert.equal(campaignColors({ background: '#2a5c3f', text: '#ffffff' }).style['--ce-campaign-surface'], '#2a5c3f');
  assert.throws(() => campaignColors({ background: 'red', text: '#ffffff' }), /hex/);
});

test('code segments only aid reading and always join back to the exact code', () => {
  for (const code of ['CE26103102ALS300', 'CE26061477', '7730744292227', 'CE26031111R/12R', '0000123456789']) {
    assert.equal(codeSegments(code).map((s) => s.text).join(''), code);
  }
  assert.deepEqual(codeSegments('CE26103102ALS300').map((s) => s.part), ['period', 'number', 'ending']);
  assert.deepEqual(codeSegments('CE26061477').map((s) => s.text), ['CE2606', '1477']);
  assert.deepEqual(codeSegments('7730744292227').map((s) => s.part), ['whole']);
  assert.throws(() => codeSegments(26061477), /strings/);
});
