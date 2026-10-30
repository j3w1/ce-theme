import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CEProductCode from '../src/components/CEProductCode.vue';

describe('CEProductCode', () => {
  it('shows a Casa Elida code exactly, underlining only the four-digit number', () => {
    const wrapper = mount(CEProductCode, { props: { code: 'CE26061441' } });
    expect(wrapper.classes()).toEqual(['ce-code']);
    expect(wrapper.text()).toBe('CE26061441');
    expect(wrapper.html()).toBe('<span class="ce-code">CE2606<span class="ce-code-number">1441</span></span>');
  });

  it('keeps the variant ending whole', () => {
    const wrapper = mount(CEProductCode, { props: { code: 'CE26031111R12R' } });
    expect(wrapper.text()).toBe('CE26031111R12R');
    expect(wrapper.get('.ce-code-number').text()).toBe('1111');
  });

  it('shows any other code whole, with leading zeros intact', () => {
    const wrapper = mount(CEProductCode, { props: { code: '0077307442922' } });
    expect(wrapper.text()).toBe('0077307442922');
    expect(wrapper.find('.ce-code-number').exists()).toBe(false);
  });

  it('applies the recipe sizes', () => {
    expect(mount(CEProductCode, { props: { code: 'CE26061441', size: 'sm' } }).classes()).toEqual(['ce-code', 'ce-code--sm']);
    expect(mount(CEProductCode, { props: { code: 'CE26061441', size: 'lg' } }).classes()).toEqual(['ce-code', 'ce-code--lg']);
  });

  it('refuses numbers and empty codes', () => {
    expect(() => mount(CEProductCode, { props: { code: 26061441 as unknown as string } })).toThrow(TypeError);
    expect(() => mount(CEProductCode, { props: { code: '' } })).toThrow(TypeError);
  });
});
