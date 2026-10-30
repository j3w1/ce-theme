import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
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

// Conversation identity: the application mounts one list per conversation and keys it. The list never guesses a change
// from its messages, because ids can repeat across conversations and older messages can be added above.
describe('CEMessageList conversation identity', () => {
  const day = (suffix: string): CEMessage => ({ id: 'today', kind: 'system', text: `Hoy ${suffix}` });
  const conversation = (name: string): CEMessage[] => [day(name), { id: `${name}-1`, kind: 'incoming', text: `Hola ${name}` }, { id: `${name}-2`, kind: 'outgoing', text: `Respuesta ${name}`, status: 'sent' }];

  it('keeps a reader in history when older messages are added above', async () => {
    const wrapper = mountList();
    const log = geometry(wrapper, 100);
    await wrapper.setProps({ messages: [{ id: 'older', kind: 'incoming', text: 'Un mensaje anterior' }, ...base] });
    await nextTick();
    expect(log.top()).toBe(100);
  });

  it('keeps a reader who is at the bottom at the bottom when older messages are added above', async () => {
    const wrapper = mountList();
    const log = geometry(wrapper, 800);
    await wrapper.setProps({ messages: [{ id: 'older', kind: 'incoming', text: 'Un mensaje anterior' }, ...base] });
    await nextTick();
    expect(log.top()).toBe(1000);
  });

  it('does not treat a new first message in the same conversation as a conversation change', async () => {
    const wrapper = mountList();
    const log = geometry(wrapper, 100);
    await wrapper.setProps({ messages: [{ id: 'new-first', kind: 'system', text: 'Ayer' }, ...base.slice(1)] });
    await nextTick();
    expect(log.top()).toBe(100);
  });

  it('does not guess that another array is another conversation: the application keys the list', async () => {
    const wrapper = mountList(conversation('rosa'));
    const log = geometry(wrapper, 100);
    await wrapper.setProps({ messages: conversation('jorge') });
    await nextTick();
    expect(log.top()).toBe(100);
  });

  // Scroll geometry for lists that are created during the test: 1000 px of messages in a 200 px window.
  const scrollPositions = new WeakMap<Element, number>();
  const stubGeometry = () => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => 1000 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 200 });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', { configurable: true, get() { return scrollPositions.get(this as Element) ?? 0; }, set(value: number) { scrollPositions.set(this as Element, value); } });
  };
  const restoreGeometry = () => { for (const name of ['scrollHeight', 'clientHeight', 'scrollTop']) delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name]; };

  it('opens a keyed conversation at the newest message, even when both conversations start with the same separator id', async () => {
    stubGeometry();
    try {
      const current = ref('rosa');
      const Host = defineComponent({ setup: () => () => h(CEMessageList, { key: current.value, messages: conversation(current.value), label: `Mensajes con ${current.value}` }) });
      const wrapper = mount(Host, { attachTo: document.body });
      const first = wrapper.get('[role="log"]').element;
      expect(scrollPositions.get(first)).toBe(1000);
      // The reader scrolls up in the first conversation, then the application switches to another one with the same first id.
      scrollPositions.set(first, 100);
      current.value = 'jorge';
      await nextTick();
      const second = wrapper.get('[role="log"]').element;
      expect(second).not.toBe(first);
      expect(wrapper.get('[role="log"]').attributes('aria-label')).toBe('Mensajes con jorge');
      expect(scrollPositions.get(second)).toBe(1000);
      // Going back to the first conversation also opens at its newest message rather than where it was left.
      current.value = 'rosa';
      await nextTick();
      expect(scrollPositions.get(wrapper.get('[role="log"]').element)).toBe(1000);
    } finally { restoreGeometry(); }
  });

  it('still follows the reader’s own message inside a keyed conversation', async () => {
    stubGeometry();
    try {
      const messages = ref<CEMessage[]>(conversation('rosa'));
      const Host = defineComponent({ setup: () => () => h(CEMessageList, { key: 'rosa', messages: messages.value, label: 'Mensajes' }) });
      const wrapper = mount(Host, { attachTo: document.body });
      const log = wrapper.get('[role="log"]').element;
      scrollPositions.set(log, 100);
      messages.value = [...messages.value, { id: 'mine', kind: 'outgoing', text: 'Otro mensaje', status: 'sent' }];
      await nextTick();
      await nextTick();
      expect(scrollPositions.get(log)).toBe(1000);
    } finally { restoreGeometry(); }
  });
});
