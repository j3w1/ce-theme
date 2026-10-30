import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Component } from 'vue';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CEButton, CEPrice, CEProductCode, CETextField } from '../src/index';

// Components render recipes; they never invent styling. Every ce- class they emit must exist in the generated recipes.
// Vitest runs from the package directory; the generated recipes live at the repository root.
const recipes = readFileSync(resolve(process.cwd(), '../../exports/recipes.css'), 'utf8');
const defined = new Set(recipes.match(/\.ce-[a-z0-9-]+/g)?.map((selector) => selector.slice(1)));

const cases: [string, Component, Record<string, unknown>][] = [
  ['button', CEButton, {}],
  ['secondary button', CEButton, { variant: 'secondary' }],
  ['ink link', CEButton, { variant: 'ink', href: '/' }],
  ['field with note and error', CETextField, { label: 'Correo', id: 'c', note: 'Nota', error: 'Error' }],
  ['field with prefix', CETextField, { label: 'Precio', id: 'p', prefix: 'S/' }],
  ['price', CEPrice, { amount: '8.5' }],
  ['offer with discount', CEPrice, { amount: '6', previousAmount: '7.5', discountLabel: '20%' }],
  ['sale, raised', CEPrice, { amount: '11', previousAmount: '16', variant: 'sale', currencyStyle: 'raised' }],
  ['inverse, joined, unit', CEPrice, { amount: '4.5', variant: 'inverse', currencyStyle: 'joined', unitLabel: 'cada uno' }],
  ['presentation', CEPrice, { amount: '48', presentationLabel: 'pack de 12' }],
  ['code', CEProductCode, { code: 'CE26061441', size: 'sm' }],
  ['large code', CEProductCode, { code: 'CE26061441', size: 'lg' }],
];

describe('recipe contract', () => {
  it('reads the generated recipes', () => expect(defined.size).toBeGreaterThan(100));
  it.each(cases)('%s emits only recipe classes', (_, component, props) => {
    const wrapper = mount(component, { props });
    const emitted = [wrapper.element, ...wrapper.element.querySelectorAll('*')].flatMap((element) => [...element.classList]);
    expect(emitted.filter((name) => !defined.has(name))).toEqual([]);
    expect(emitted.every((name) => name.startsWith('ce-'))).toBe(true);
  });
});
