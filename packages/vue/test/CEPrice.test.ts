import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CEPrice from '../src/components/CEPrice.vue';

const spoken = (wrapper: ReturnType<typeof mount>) => wrapper.get('.ce-price > .ce-sr-only').text();

describe('CEPrice', () => {
  it('formats decimal strings through the shared formatter: S/ on the baseline by default', () => {
    const wrapper = mount(CEPrice, { props: { amount: '6.50' } });
    expect(wrapper.classes()).toEqual(['ce-price-block']);
    expect(wrapper.get('.ce-price').classes()).toEqual(['ce-price']);
    expect(wrapper.get('.ce-price-value').text()).toBe('6.5');
    expect(wrapper.get('.ce-price-currency').text()).toBe('S/');
    expect(wrapper.get('.ce-price-amount').attributes('aria-hidden')).toBe('true');
    expect(spoken(wrapper)).toBe('Precio actual: 6.5 soles');
    expect(mount(CEPrice, { props: { amount: '20.00' } }).get('.ce-price-value').text()).toBe('20');
  });

  it('shows a supplied previous price and discount as an offer, without calculating anything', () => {
    const wrapper = mount(CEPrice, { props: { amount: '6.00', previousAmount: '7.50', discountLabel: '20%' } });
    expect(wrapper.get('.ce-price').classes()).toContain('ce-price--offer');
    expect(wrapper.get('.ce-price-history').text()).toBe('Antes S/7.5Descuento: −20%');
    expect(wrapper.get('del').text()).toBe('S/7.5');
    expect(wrapper.get('.ce-discount').text()).toBe('Descuento: −20%');
  });

  it('applies the sale and inverse variants and the joined and raised currency styles', () => {
    expect(mount(CEPrice, { props: { amount: '11', previousAmount: '16', variant: 'sale' } }).get('.ce-price').classes()).toEqual(['ce-price', 'ce-price--sale']);
    expect(mount(CEPrice, { props: { amount: '4.5', variant: 'inverse' } }).get('.ce-price').classes()).toEqual(['ce-price', 'ce-price--inverse']);
    expect(mount(CEPrice, { props: { amount: '8.5', currencyStyle: 'joined' } }).get('.ce-price').classes()).toEqual(['ce-price', 'ce-price--joined']);
    expect(mount(CEPrice, { props: { amount: '8.5', currencyStyle: 'raised' } }).get('.ce-price').classes()).toEqual(['ce-price', 'ce-price--raised']);
  });

  it('prints the unit basis with its short form, outside the amount', () => {
    const wrapper = mount(CEPrice, { props: { amount: '5.50', unitLabel: 'cada uno' } });
    expect(wrapper.get('.ce-price-unit-long').text()).toBe('cada uno');
    expect(wrapper.get('.ce-price-unit-short').text()).toBe('c/u');
    expect(wrapper.get('.ce-price-amount').find('.ce-price-unit').exists()).toBe(false);
    expect(spoken(wrapper)).toBe('Precio actual: 5.5 soles, cada uno');
  });

  it('prints the presentation basis after a slash', () => {
    const wrapper = mount(CEPrice, { props: { amount: '48', presentationLabel: 'pack de 12' } });
    expect(wrapper.get('.ce-price-presentation').text()).toBe('/pack de 12');
    expect(spoken(wrapper)).toBe('Precio actual: 48 soles por pack de 12');
  });

  it('refuses numbers, invalid amounts and a previous price that is not higher', () => {
    expect(() => mount(CEPrice, { props: { amount: 6.5 as unknown as string } })).toThrow(TypeError);
    expect(() => mount(CEPrice, { props: { amount: '6.505' } })).toThrow(TypeError);
    expect(() => mount(CEPrice, { props: { amount: '8', previousAmount: '7' } })).toThrow(RangeError);
  });
});
