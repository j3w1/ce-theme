import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import CEMessageList from '../src/components/CEMessageList.vue';
import type { CEMessage } from '../src/index';

const base: CEMessage[] = [
  { id: '1', kind: 'system', text: 'Hoy' },
  { id: '2', kind: 'incoming', text: 'Buenos días.', time: '10:38' },
  { id: '3', kind: 'note', author: 'Paola', text: 'Cliente de ejemplo.', time: '10:40', simulated: true },
  { id: '4', kind: 'outgoing', text: 'Buenos días, Rosa.', time: '10:41', status: 'read', simulated: true },
];
const mountList = (messages: CEMessage[] = base) => mount(CEMessageList, { props: { messages, label: 'Mensajes con Rosa Quispe' }, attachTo: document.body });

describe('CEMessageList', () => {
  it('is a labelled, focusable log', () => {
    const wrapper = mountList();
    expect(wrapper.attributes('role')).toBe('log');
    expect(wrapper.attributes('aria-label')).toBe('Mensajes con Rosa Quispe');
    expect(wrapper.attributes('tabindex')).toBe('0');
    expect(wrapper.classes()).toEqual(['ce-message-list']);
  });

  it('draws each kind with its own class, and a note is never an outgoing message', () => {
    const wrapper = mountList();
    expect(wrapper.findAll('.ce-message--system')).toHaveLength(1);
    expect(wrapper.findAll('.ce-message--incoming')).toHaveLength(1);
    expect(wrapper.findAll('.ce-message--outgoing')).toHaveLength(1);
    const note = wrapper.get('.ce-message--note');
    expect(note.classes()).not.toContain('ce-message--outgoing');
    expect(note.classes()).not.toContain('ce-message--incoming');
    expect(wrapper.get('.ce-message--outgoing').text()).not.toContain('No la ve el cliente');
  });

  it('labels every note "No la ve el cliente" and marks a simulated one', () => {
    const wrapper = mountList();
    const note = wrapper.get('.ce-message--note');
    expect(note.get('.ce-message-note-label').text()).toBe('Nota interna · No la ve el cliente');
    expect(note.get('svg').attributes('aria-hidden')).toBe('true');
    expect(note.get('.ce-message-author').text()).toBe('Paola');
    expect(note.get('.ce-message-meta').text()).toBe('10:40simulada');
    expect(note.find('.ce-message-status--failed').exists()).toBe(false);
  });

  it('writes the four delivery states as words, with a simulated label', () => {
    const states: [CEMessage['status'], string][] = [['sent', 'Enviado'], ['delivered', 'Entregado'], ['read', 'Leído'], ['failed', 'No entregado']];
    const wrapper = mountList(states.map(([status], index) => ({ id: String(index), kind: 'outgoing' as const, text: `m${index}`, status, simulated: true })));
    expect(wrapper.findAll('.ce-message-status').map((status) => status.text())).toEqual(states.map(([, label]) => `${label} · simulado`));
    expect(wrapper.findAll('.ce-message-status--failed')).toHaveLength(1);
    expect(wrapper.get('.ce-message-status--failed').text()).toBe('No entregado · simulado');
  });

  it('does not label a real message as simulated, and shows a status only on outgoing messages', () => {
    const wrapper = mountList([
      { id: 'a', kind: 'outgoing', text: 'Hola', status: 'delivered' },
      { id: 'b', kind: 'incoming', text: 'Hola', status: 'read' },
    ]);
    expect(wrapper.findAll('.ce-message-status').map((status) => status.text())).toEqual(['Entregado']);
  });

  it('never uses acceptance or completion wording', () => {
    const wrapper = mountList();
    expect(wrapper.text()).not.toMatch(/Aceptad|Completad/);
  });

  it('speaks who wrote a message without relying on alignment or colour', () => {
    const wrapper = mountList();
    expect(wrapper.get('.ce-message--outgoing .ce-sr-only').text()).toBe('Tú:');
    expect(wrapper.get('.ce-message--incoming .ce-sr-only').text()).toBe('Mensaje recibido:');
    const named = mountList([{ id: 'n', kind: 'incoming', author: 'Jorge', text: 'Hola' }]);
    expect(named.get('.ce-message-author').text()).toBe('Jorge');
    expect(named.find('.ce-sr-only').exists()).toBe(false);
  });

  it('keeps line breaks and long unbroken text intact', () => {
    const url = 'https://ejemplo.invalido/' + 'x'.repeat(300);
    const wrapper = mountList([{ id: 'a', kind: 'incoming', text: `Primera línea\nSegunda ${url}` }]);
    expect(wrapper.get('.ce-message-text').text()).toBe(`Mensaje recibido: Primera línea\nSegunda ${url}`);
  });

  it('uses a time element and says when there are no messages', () => {
    const wrapper = mount(CEMessageList, { props: { messages: [{ id: 'a', kind: 'incoming', text: 'Hola', time: '10:38', datetime: '2026-10-30T10:38' }], label: 'Mensajes' } });
    expect(wrapper.get('time').attributes('datetime')).toBe('2026-10-30T10:38');
    const empty = mount(CEMessageList, { props: { messages: [], label: 'Mensajes' } });
    expect(empty.get('.ce-message-list-empty').text()).toBe('Aún no hay mensajes.');
  });
});

// jsdom has no layout, so the scroll geometry is stubbed: a 1000 px log shown through a 200 px window.
function geometry(wrapper: ReturnType<typeof mountList>, scrollTop: number) {
  const element = wrapper.element as HTMLElement;
  Object.defineProperty(element, 'scrollHeight', { configurable: true, get: () => 1000 });
  Object.defineProperty(element, 'clientHeight', { configurable: true, get: () => 200 });
  let top = scrollTop;
  Object.defineProperty(element, 'scrollTop', { configurable: true, get: () => top, set: (value: number) => { top = value; } });
  return { top: () => top };
}

describe('CEMessageList scrolling', () => {
  it('leaves a reader who is looking at earlier history where they are', async () => {
    const wrapper = mountList();
    const log = geometry(wrapper, 100);
    await wrapper.setProps({ messages: [...base, { id: '5', kind: 'incoming', text: 'Nuevo' }] });
    await nextTick();
    expect(log.top()).toBe(100);
  });

  it('follows a new message when the reader is already at the bottom', async () => {
    const wrapper = mountList();
    const log = geometry(wrapper, 800);
    await wrapper.setProps({ messages: [...base, { id: '5', kind: 'incoming', text: 'Nuevo' }] });
    await nextTick();
    expect(log.top()).toBe(1000);
  });

  it('moves to the newest message after the reader’s own message, even from history', async () => {
    const wrapper = mountList();
    const log = geometry(wrapper, 100);
    await wrapper.setProps({ messages: [...base, { id: '5', kind: 'outgoing', text: 'Mi respuesta', status: 'sent' }] });
    await nextTick();
    expect(log.top()).toBe(1000);
    await wrapper.setProps({ messages: [...base, { id: '5', kind: 'outgoing', text: 'Mi respuesta' }, { id: '6', kind: 'note', own: true, text: 'Mi nota' }] });
    await nextTick();
    expect(log.top()).toBe(1000);
  });

  it('does not treat someone else’s note as the reader’s own message', async () => {
    const wrapper = mountList();
    const log = geometry(wrapper, 100);
    await wrapper.setProps({ messages: [...base, { id: '5', kind: 'note', author: 'Paola', text: 'Nota ajena' }] });
    await nextTick();
    expect(log.top()).toBe(100);
  });

  it('starts at the newest message when the conversation changes', async () => {
    const wrapper = mountList();
    const log = geometry(wrapper, 100);
    await wrapper.setProps({ messages: [{ id: 'z1', kind: 'incoming', text: 'Otra conversación' }, { id: 'z2', kind: 'incoming', text: 'Más' }] });
    await nextTick();
    expect(log.top()).toBe(1000);
  });
});

describe('CEMessageList keeps a following reader at the bottom when its size changes', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('scrolls to the newest message when a log mounted while hidden becomes visible, but not for a reader in history', async () => {
    const callbacks: (() => void)[] = [];
    vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { callbacks.push(callback); } observe() {} disconnect() {} });
    const wrapper = mountList();
    const log = geometry(wrapper, 0);
    expect(callbacks).toHaveLength(1);
    callbacks[0]!();
    expect(log.top()).toBe(1000);
    // The reader scrolls up into history: a later resize must leave them where they are.
    wrapper.element.dispatchEvent(new Event('scroll'));
    (wrapper.element as HTMLElement).scrollTop = 100;
    wrapper.element.dispatchEvent(new Event('scroll'));
    callbacks[0]!();
    expect(log.top()).toBe(100);
  });

  it('stops observing when it is removed', () => {
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect = disconnect; });
    mountList().unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});

