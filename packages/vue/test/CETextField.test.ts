import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CETextField from '../src/components/CETextField.vue';

describe('CETextField', () => {
  it('links the visible label to the input', () => {
    const wrapper = mount(CETextField, { props: { label: 'Correo electrónico', id: 'correo', type: 'email' } });
    expect(wrapper.classes()).toEqual(['ce-field']);
    expect(wrapper.get('label').attributes('for')).toBe('correo');
    const input = wrapper.get('input');
    expect(input.attributes('id')).toBe('correo');
    expect(input.attributes('type')).toBe('email');
    expect(input.classes()).toEqual(['ce-input']);
    expect(input.attributes('aria-describedby')).toBeUndefined();
  });

  it('generates an id when none is given', () => {
    const wrapper = mount(CETextField, { props: { label: 'Nombre' } });
    const id = wrapper.get('input').attributes('id');
    expect(id).toBeTruthy();
    expect(wrapper.get('label').attributes('for')).toBe(id);
  });

  it('supports v-model', async () => {
    const wrapper = mount(CETextField, { props: { label: 'Buscar', modelValue: 'taza', 'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }) } });
    const input = wrapper.get('input');
    expect((input.element as HTMLInputElement).value).toBe('taza');
    await input.setValue('frasco');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['frasco']);
    expect(wrapper.props('modelValue')).toBe('frasco');
  });

  it('describes the input with its note and error and marks it invalid', () => {
    const wrapper = mount(CETextField, { props: { label: 'Correo electrónico', id: 'correo', note: 'Te escribimos solo por tu pedido.', error: 'Escribe un correo completo, por ejemplo: nombre@ejemplo.com.' } });
    const input = wrapper.get('input');
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(input.attributes('aria-describedby')).toBe('correo-note correo-error');
    expect(wrapper.get('#correo-note').classes()).toEqual(['ce-field-note']);
    expect(wrapper.get('#correo-error').text()).toBe('Escribe un correo completo, por ejemplo: nombre@ejemplo.com.');
  });

  it('wraps the input in an input group when it has a prefix', () => {
    const wrapper = mount(CETextField, { props: { label: 'Precio de venta', id: 'precio', prefix: 'S/', inputmode: 'decimal' } });
    const group = wrapper.get('.ce-input-group');
    expect(group.get('.ce-input-affix').text()).toBe('S/');
    expect(group.get('input').attributes('inputmode')).toBe('decimal');
    expect(wrapper.findAll('input')).toHaveLength(1);
  });

  it('passes native attributes and states to the input, not the wrapper', () => {
    const wrapper = mount(CETextField, { props: { label: 'Código', id: 'codigo', readonly: true, required: true, disabled: true }, attrs: { maxlength: '14', pattern: '[A-Z0-9]+' } });
    const input = wrapper.get('input');
    expect(input.attributes('maxlength')).toBe('14');
    expect(input.attributes('pattern')).toBe('[A-Z0-9]+');
    expect(input.attributes('readonly')).toBeDefined();
    expect(input.attributes('required')).toBeDefined();
    expect(input.attributes('disabled')).toBeDefined();
    expect(wrapper.attributes('maxlength')).toBeUndefined();
  });
});
