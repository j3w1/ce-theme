import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CEConversationList from '../src/components/CEConversationList.vue';
import type { CEConversationItem } from '../src/index';

const conversations: CEConversationItem[] = [
  { id: 'a', name: 'Rosa Quispe', preview: 'Gracias, quedo atenta.', time: '10:42', kind: 'customer' },
  { id: 'b', name: 'Jorge Mamani', preview: 'Hola, buenas tardes.', time: '10:15', unread: 2, kind: 'customer', meta: 'Conversación de ejemplo' },
  { id: 'c', name: 'Equipo Tienda', preview: 'Yo cubro desde las 2.', time: 'Ayer', kind: 'team', draft: true },
];

describe('CEConversationList', () => {
  it('is a labelled navigation landmark with one native button per conversation', () => {
    const wrapper = mount(CEConversationList, { props: { conversations, label: 'Conversaciones' } });
    expect(wrapper.element.tagName).toBe('NAV');
    expect(wrapper.attributes('aria-label')).toBe('Conversaciones');
    expect(wrapper.get('ul').classes()).toEqual(['ce-conversation-list']);
    const buttons = wrapper.findAll('button.ce-conversation');
    expect(buttons).toHaveLength(3);
    for (const button of buttons) expect(button.attributes('type')).toBe('button');
    expect(buttons[0]?.get('.ce-conversation-name').text()).toBe('Rosa Quispe');
  });

  it('keeps the order it is given and never filters or sorts', () => {
    const wrapper = mount(CEConversationList, { props: { conversations: [...conversations].reverse(), label: 'Conversaciones' } });
    expect(wrapper.findAll('.ce-conversation-name').map((name) => name.text())).toEqual(['Equipo Tienda', 'Jorge Mamani', 'Rosa Quispe']);
  });

  it('marks only the selected conversation with aria-current', () => {
    const wrapper = mount(CEConversationList, { props: { conversations, label: 'Conversaciones', modelValue: 'b' } });
    expect(wrapper.findAll('[aria-current="true"]')).toHaveLength(1);
    expect(wrapper.findAll('button')[1]?.attributes('aria-current')).toBe('true');
    expect(wrapper.findAll('button')[0]?.attributes('aria-current')).toBeUndefined();
  });

  it('emits the chosen id through v-model and updates the selection', async () => {
    const wrapper = mount(CEConversationList, { props: { conversations, label: 'Conversaciones', modelValue: 'a', 'onUpdate:modelValue': (value: string | undefined) => wrapper.setProps({ modelValue: value }) } });
    await wrapper.findAll('button')[2]?.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([['c']]);
    expect(wrapper.findAll('button')[2]?.attributes('aria-current')).toBe('true');
    expect(wrapper.findAll('button')[0]?.attributes('aria-current')).toBeUndefined();
  });

  it('emits select on every activation, even for the conversation that is already selected', async () => {
    const wrapper = mount(CEConversationList, { props: { conversations, label: 'Conversaciones', modelValue: 'a' } });
    await wrapper.findAll('button')[0]?.trigger('click');
    await wrapper.findAll('button')[0]?.trigger('click');
    await wrapper.findAll('button')[1]?.trigger('click');
    expect(wrapper.emitted('select')).toEqual([['a'], ['a'], ['b']]);
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']]);
  });

  it('speaks the unread count and shows nothing for zero', () => {
    const wrapper = mount(CEConversationList, { props: { conversations: [...conversations, { id: 'd', name: 'Sin leer cero', preview: '—', time: '09:00', unread: 0 }], label: 'Conversaciones' } });
    const badges = wrapper.findAll('.ce-conversation-unread');
    expect(badges).toHaveLength(1);
    expect(badges[0]?.get('[aria-hidden="true"]').text()).toBe('2');
    expect(badges[0]?.get('.ce-sr-only').text()).toBe('2 sin leer');
  });

  it('shows the draft marker, the kind as a word and the host meta text', () => {
    const wrapper = mount(CEConversationList, { props: { conversations, label: 'Conversaciones' } });
    const [rosa, jorge, equipo] = wrapper.findAll('.ce-conversation');
    expect(equipo?.get('.ce-conversation-draft').text()).toBe('Borrador:');
    expect(rosa?.find('.ce-conversation-draft').exists()).toBe(false);
    expect(rosa?.get('.ce-conversation-meta').text()).toBe('Cliente');
    expect(jorge?.get('.ce-conversation-meta').text()).toBe('Cliente · Conversación de ejemplo');
    expect(equipo?.get('.ce-conversation-meta').text()).toBe('Equipo');
    expect(equipo?.get('.ce-avatar').classes()).toContain('ce-avatar--team');
    expect(rosa?.get('.ce-avatar').classes()).not.toContain('ce-avatar--team');
  });

  it('draws decorative initials from the name and falls back for a number', () => {
    const wrapper = mount(CEConversationList, { props: { conversations: [{ id: 'x', name: 'María Fernanda Quispe Huamán', preview: '', time: '' }, { id: 'y', name: '+51 999', preview: '', time: '' }], label: 'Conversaciones' } });
    const avatars = wrapper.findAll('.ce-avatar');
    expect(avatars.map((avatar) => avatar.text())).toEqual(['MF', '#']);
    for (const avatar of avatars) expect(avatar.attributes('aria-hidden')).toBe('true');
  });

  it('keeps long names and previews complete in the document; shortening is styling', () => {
    const name = 'María Fernanda Quispe Huamán de los Ángeles · Mayorista de la sede de Tacna';
    const wrapper = mount(CEConversationList, { props: { conversations: [{ id: 'x', name, preview: 'https://ejemplo.invalido/' + 'a'.repeat(200), time: '10:00' }], label: 'Conversaciones' } });
    expect(wrapper.get('.ce-conversation-name').text()).toBe(name);
    expect(wrapper.get('.ce-conversation-preview').text()).toHaveLength('https://ejemplo.invalido/'.length + 200);
  });

  it('says so when there are no conversations', () => {
    const wrapper = mount(CEConversationList, { props: { conversations: [], label: 'Conversaciones' } });
    expect(wrapper.find('ul').exists()).toBe(false);
    expect(wrapper.get('.ce-conversation-empty').text()).toBe('No hay conversaciones.');
    expect(mount(CEConversationList, { props: { conversations: [], label: 'x', emptyText: 'Nada por aquí.' } }).text()).toBe('Nada por aquí.');
  });
});
