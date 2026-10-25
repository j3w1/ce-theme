import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAmount, amountInCents, preparePrice } from '../recipes/price.mjs';

test('compact prices preserve meaningful decimals, including hundredths', () => {
  for (const [input, expected] of [['550','550'],['16.00','16'],['20.50','20.5'],['0.05','0.05'],['0.00','0'],['8.01','8.01'],['12345678901234567890.50','12345678901234567890.5']]) assert.equal(formatAmount(input),expected);
});
test('inputs reject floats, extra precision and coercion-friendly strings', () => {
  for (const value of [8.5,null,undefined,'',' 8.5','8.5 ','8e2','-8','8.555','08.5','NaN','Infinity','<script>']) assert.throws(()=>formatAmount(value));
});
test('price comparisons remain exact beyond floating point integer limits', () => {
  assert.equal(amountInCents('12345678901234567890.05'),1234567890123456789005n);
  assert.equal(preparePrice({amount:'9007199254740992.01',previousAmount:'9007199254740992.02'}).previous,'9007199254740992.02');
});
test('regular, offer, inverse and unit price views', () => {
  assert.equal(preparePrice({amount:'8.50'}).variant,'regular');
  assert.equal(preparePrice({amount:'14.5',previousAmount:'16.5'}).variant,'offer');
  assert.equal(preparePrice({amount:'8.5',variant:'inverse'}).variant,'inverse');
  assert.equal(preparePrice({amount:'5.50',unitLabel:'cada uno'}).unitLabel,'cada uno');
  assert.equal(preparePrice({amount:'8',variant:'offer'}).variant,'offer');
});
test('invalid offer labels, previous amounts, and units are rejected', () => {
  for (const previousAmount of ['8.50','8.49']) assert.throws(()=>preparePrice({amount:'8.50',previousAmount}));
  for (const discountLabel of ['0%','-12.5%','--12.5%','101%','12','12.123%',12]) assert.throws(()=>preparePrice({amount:'8',previousAmount:'10',discountLabel}));
  assert.throws(()=>preparePrice({amount:'8',discountLabel:'20%'}));
  assert.throws(()=>preparePrice({amount:'8',variant:'unknown'}));
  assert.throws(()=>preparePrice({amount:'8',unitLabel:''}));
  assert.equal(preparePrice({amount:'1.99',packLabel:'pack de 50'}).packLabel,'pack de 50');
  assert.throws(()=>preparePrice({amount:'1.99',packLabel:'/pack de 50'}));
  assert.throws(()=>preparePrice({amount:'1.99',packLabel:''}));
  assert.throws(()=>preparePrice({amount:'1.99',packLabel:'pack de 50',unitLabel:'cada uno'}));
});
test('commercial percentage remains a supplied label, never calculated by the view', () => {
  const view = preparePrice({amount:'550',previousAmount:'1040',discountLabel:'47.12%'});
  assert.equal(view.discountLabel,'47.12%');
  assert.equal(view.current,'550');
});
