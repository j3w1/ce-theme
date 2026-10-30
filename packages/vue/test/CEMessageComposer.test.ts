import { afterEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, reactive } from 'vue';
import CEMessageComposer from '../src/components/CEMessageComposer.vue';
import type { CEComposerMode, CEMessageComposerProps } from '../src/index';

afterEach(() => { document.body.innerHTML = ''; });

// The application owns the drafts, the mode and what happens on submit. This host does the same, in memory.
function host(props: Partial<CEMessageComposerProps> = {}, initial: { mode?: CEComposerMode; reply?: string; note?: string } = {}) {
  const state = reactive({ mode: 'reply' as CEComposerMode, reply: '', note: '', conversationId: 'rosa', ...initial });
  const replies: string[] = [];
  const notes: string[] = [];
  const Host = defineComponent({
    setup: () => () => h(CEMessageComposer, {
      label: 'Mensaje para Rosa Quispe', recipient: 'Rosa', allowNotes: true, ...props, conversationId: state.conversationId,
      mode: state.mode, 'onUpdate:mode': (value: CEComposerMode) => { state.mode = value; },
      reply: state.reply, 'onUpdate:reply': (value: string) => { state.reply = value; },
      note: state.note, 'onUpdate:note': (value: string) => { state.note = value; },
      onSubmitReply: (text: string) => { replies.push(text); state.reply = ''; },
      onSaveNote: (text: string) => { notes.push(text); state.note = ''; },
    }),
  });
  const wrapper = mount(Host, { attachTo: document.body });
  const field = () => wrapper.get('textarea');
  const send = () => wrapper.get('button[type="submit"]');
  const choose = (mode: CEComposerMode) => wrapper.get(`input[value="${mode}"]`).setValue();
  const press = (init: KeyboardEventInit) => field().trigger('keydown', init);
  return { wrapper, state, replies, notes, field, send, choose, press };
}

describe('CEMessageComposer: reply mode', () => {
  it('starts in reply mode with a named text area and a recipient-specific action', () => {
    const { wrapper, field, send } = host();
    expect(wrapper.element.tagName).toBe('FORM');
    expect(wrapper.classes()).toEqual(['ce-composer']);
    expect(field().classes()).toEqual(['ce-textarea', 'ce-composer-field']);
    expect(wrapper.get(`label[for="${field().attributes('id')}"]`).text()).toBe('Mensaje para Rosa Quispe');
    expect(send().text()).toBe('Enviar a Rosa');
    expect(send().classes()).toContain('ce-button');
    expect(wrapper.find('.ce-composer-notice').exists()).toBe(false);
    expect((wrapper.get('input[value="reply"]').element as HTMLInputElement).checked).toBe(true);
  });

  it('reads "Enviar" when there is no recipient', () => {
    expect(host({ recipient: undefined }).send().text()).toBe('Enviar');
  });

  it('cannot submit a blank or whitespace-only draft', async () => {
    const { field, send, press, replies } = host();
    expect(send().attributes('disabled')).toBeDefined();
    await field().setValue('   \n  ');
    expect(send().attributes('disabled')).toBeDefined();
    await press({ key: 'Enter', ctrlKey: true });
    await send().trigger('submit');
    expect(replies).toEqual([]);
    await field().setValue('Hola');
    expect(send().attributes('disabled')).toBeUndefined();
  });

  it('submits with Ctrl+Enter or ⌘+Enter, trimmed, once, through the typed reply event', async () => {
    const { field, press, replies, notes, state } = host();
    await field().setValue('  Buenos días, Rosa.  ');
    await press({ key: 'Enter', ctrlKey: true });
    expect(replies).toEqual(['Buenos días, Rosa.']);
    expect(state.reply).toBe('');
    await field().setValue('Segundo');
    await press({ key: 'Enter', metaKey: true });
    expect(replies).toEqual(['Buenos días, Rosa.', 'Segundo']);
    expect(notes).toEqual([]);
  });

  it('submits with the send button', async () => {
    const { field, send, replies } = host();
    await field().setValue('Hola');
    await send().trigger('submit');
    expect(replies).toEqual(['Hola']);
  });

  it('lets Enter insert a newline: it neither submits nor is cancelled', async () => {
    const { field, press, replies } = host();
    await field().setValue('Línea uno');
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    field().element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    await press({ key: 'Enter' });
    await press({ key: 'Enter', shiftKey: true });
    expect(replies).toEqual([]);
  });

  it('ignores Ctrl+Enter while an input method is composing', async () => {
    const { field, press, replies } = host();
    await field().setValue('Hola');
    await press({ key: 'Enter', ctrlKey: true, isComposing: true });
    expect(replies).toEqual([]);
  });

  it('returns focus to the text area after submitting, even though the button is then disabled', async () => {
    const { wrapper, field, send, state } = host();
    await field().setValue('Hola');
    (send().element as HTMLButtonElement).focus();
    await send().trigger('submit');
    await flushPromises();
    expect(state.reply).toBe('');
    expect(document.activeElement).toBe(field().element);
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('explains the keys in a description linked to the text area', () => {
    const { wrapper, field } = host();
    const hint = wrapper.get(`#${field().attributes('aria-describedby')!.split(' ')[0]}`);
    expect(hint.text()).toBe('Enter agrega una línea. Ctrl o ⌘ + Enter para enviar.');
  });
});

describe('CEMessageComposer: internal notes', () => {
  it('shows no switch and ignores the note mode in an ordinary staff conversation', async () => {
    const { wrapper, field, press, replies, notes } = host({ allowNotes: false, recipient: undefined }, { mode: 'note' });
    expect(wrapper.find('fieldset').exists()).toBe(false);
    expect(wrapper.classes()).toEqual(['ce-composer']);
    await field().setValue('Mensaje al equipo');
    await press({ key: 'Enter', ctrlKey: true });
    expect(replies).toEqual(['Mensaje al equipo']);
    expect(notes).toEqual([]);
  });

  it('offers Responder al cliente and Nota interna as a labelled native radio group, reply first', () => {
    const { wrapper } = host();
    expect(wrapper.get('fieldset legend').text()).toBe('Tipo de mensaje');
    const options = wrapper.findAll('.ce-composer-mode-option');
    expect(options.map((option) => option.text())).toEqual(['Responder al cliente', 'Nota interna']);
    expect(wrapper.findAll('input[type="radio"]').map((radio) => radio.attributes('value'))).toEqual(['reply', 'note']);
    expect(new Set(wrapper.findAll('input[type="radio"]').map((radio) => radio.attributes('name'))).size).toBe(1);
  });

  it('changes the whole composer, says "No la ve el cliente" and offers "Guardar nota", not the red send action', async () => {
    const { wrapper, choose, send, field } = host();
    await choose('note');
    expect(wrapper.classes()).toContain('ce-composer--note');
    expect(wrapper.get('.ce-composer-notice').text()).toBe('Nota interna · No la ve el cliente');
    expect(send().text()).toBe('Guardar nota');
    expect(send().text()).not.toContain('Enviar');
    expect(wrapper.get(`label[for="${field().attributes('id')}"]`).text()).toBe('Nota interna para el equipo');
    expect(field().attributes('placeholder')).toBe('Escribe una nota para el equipo');
    expect(field().attributes('aria-describedby')).toContain(wrapper.get('.ce-composer-notice').attributes('id'));
    expect(wrapper.get('.ce-field-note').text()).toContain('guardar la nota');
  });

  it('saves a note through its own event and never through the reply event', async () => {
    const { field, press, send, replies, notes } = host({}, { mode: 'note' });
    await field().setValue('Cliente frecuente.');
    await press({ key: 'Enter', ctrlKey: true });
    expect(notes).toEqual(['Cliente frecuente.']);
    await field().setValue('Otra nota');
    await send().trigger('submit');
    expect(notes).toEqual(['Cliente frecuente.', 'Otra nota']);
    expect(replies).toEqual([]);
  });

  it('keeps one draft per mode and never shows the other one', async () => {
    const { wrapper, field, choose, state, replies, notes } = host();
    await field().setValue('borrador-de-respuesta');
    await choose('note');
    expect((field().element as HTMLTextAreaElement).value).toBe('');
    await field().setValue('texto-de-nota-interna');
    expect(state.reply).toBe('borrador-de-respuesta');
    expect(state.note).toBe('texto-de-nota-interna');
    // In note mode the reply draft is nowhere in the document, and the other way round.
    expect(wrapper.text()).not.toContain('borrador-de-respuesta');
    expect(wrapper.html()).not.toContain('borrador-de-respuesta');
    await choose('reply');
    expect((field().element as HTMLTextAreaElement).value).toBe('borrador-de-respuesta');
    expect(wrapper.text()).not.toContain('texto-de-nota-interna');
    expect(wrapper.html()).not.toContain('texto-de-nota-interna');
    expect(replies).toEqual([]);
    expect(notes).toEqual([]);
  });

  it('never sends, saves or rewrites anything when the mode changes', async () => {
    const { wrapper, field, choose, state, replies, notes } = host();
    await field().setValue('  Texto con espacios  ');
    for (const mode of ['note', 'reply', 'note', 'reply'] as const) await choose(mode);
    expect(state.reply).toBe('  Texto con espacios  ');
    expect(state.note).toBe('');
    expect(replies).toEqual([]);
    expect(notes).toEqual([]);
    expect(wrapper.emitted('submitReply')).toBeUndefined();
  });

  it('shows a draft marker on the mode that is not being edited', async () => {
    const { wrapper, field, choose } = host();
    expect(wrapper.findAll('.ce-composer-mode-draft')).toHaveLength(0);
    await field().setValue('algo');
    await choose('note');
    const markers = wrapper.findAll('.ce-composer-mode-draft');
    expect(markers).toHaveLength(1);
    expect(wrapper.findAll('.ce-composer-mode-option')[0]?.text()).toBe('Responder al cliente · borrador');
    await field().setValue('nota');
    await choose('reply');
    expect(wrapper.findAll('.ce-composer-mode-option')[1]?.text()).toBe('Nota interna · borrador');
  });

  it('announces the mode change to screen readers', async () => {
    const { wrapper, choose } = host();
    expect(wrapper.get('[role="status"]').text()).toBe('');
    await choose('note');
    expect(wrapper.get('[role="status"]').text()).toBe('Escribiendo una nota interna. No la ve el cliente.');
    await choose('reply');
    expect(wrapper.get('[role="status"]').text()).toBe('Escribiendo una respuesta al cliente.');
  });

  it('returns to reply mode when the conversation changes, keeping every draft', async () => {
    const { wrapper, state, field, choose } = host();
    await field().setValue('respuesta guardada');
    await choose('note');
    await field().setValue('nota guardada');
    state.conversationId = 'jorge';
    await flushPromises();
    expect(state.mode).toBe('reply');
    expect(wrapper.classes()).not.toContain('ce-composer--note');
    expect(state.reply).toBe('respuesta guardada');
    expect(state.note).toBe('nota guardada');
  });

  it('radios can be reached and changed from the keyboard, as native radios are', () => {
    const { wrapper } = host();
    for (const radio of wrapper.findAll('input[type="radio"]')) {
      expect(radio.classes()).toContain('ce-sr-only');
      expect(radio.attributes('tabindex')).toBeUndefined();
    }
  });
});

describe('CEMessageComposer: restricted', () => {
  it('disables every control, says why and submits nothing', async () => {
    const { wrapper, field, send, press, replies } = host({ disabled: true, disabledReason: 'Esta conversación es de solo lectura.' }, { reply: 'Hola' });
    expect(field().attributes('disabled')).toBeDefined();
    expect(send().attributes('disabled')).toBeDefined();
    expect(wrapper.get('fieldset').attributes('disabled')).toBeDefined();
    const reason = wrapper.findAll('.ce-field-note').find((note) => note.text() === 'Esta conversación es de solo lectura.');
    expect(reason).toBeDefined();
    expect(field().attributes('aria-describedby')).toContain(reason!.attributes('id'));
    await press({ key: 'Enter', ctrlKey: true });
    expect(replies).toEqual([]);
  });
});
