import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CEButton from '../src/components/CEButton.vue';

describe('CEButton', () => {
  it('renders a primary button that never submits by accident', () => {
    const wrapper = mount(CEButton, { slots: { default: 'Ver productos' } });
    const button = wrapper.get('button');
    expect(button.classes()).toEqual(['ce-button']);
    expect(button.attributes('type')).toBe('button');
    expect(button.text()).toBe('Ver productos');
  });

  it('maps the secondary and ink variants to recipe modifiers', () => {
    expect(mount(CEButton, { props: { variant: 'secondary' } }).classes()).toEqual(['ce-button', 'ce-button--secondary']);
    expect(mount(CEButton, { props: { variant: 'ink' } }).classes()).toEqual(['ce-button', 'ce-button--ink']);
  });

  it('renders a link when given an href', () => {
    const wrapper = mount(CEButton, { props: { href: '/tienda/' }, slots: { default: 'Ir a la tienda' } });
    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('href')).toBe('/tienda/');
    expect(wrapper.classes()).toContain('ce-button');
  });

  it('turns a disabled link into a disabled button, so it cannot navigate', () => {
    const wrapper = mount(CEButton, { props: { href: '/tienda/', disabled: true } });
    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.attributes('disabled')).toBeDefined();
  });

  it('marks a running action as busy and disabled', () => {
    const button = mount(CEButton, { props: { loading: true, type: 'submit' } }).get('button');
    expect(button.attributes('aria-busy')).toBe('true');
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.attributes('type')).toBe('submit');
  });

  it('emits native clicks when enabled and none when disabled', async () => {
    const enabled = mount(CEButton);
    await enabled.trigger('click');
    expect(enabled.emitted('click')).toHaveLength(1);
    const disabled = mount(CEButton, { props: { disabled: true }, attachTo: document.body });
    (disabled.element as HTMLButtonElement).click();
    expect(disabled.emitted('click')).toBeUndefined();
    disabled.unmount();
  });
});
