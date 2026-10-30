<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue';
import CEButton from './CEButton.vue';

/** `reply` writes to the customer (or, in a staff chat, to the people in it); `note` is an internal note that the customer never sees. */
export type CEComposerMode = 'reply' | 'note';

/**
 * Renders the `ce-composer` recipe: a labelled text area, an optional Responder / Nota interna switch and a send action.
 * The drafts live in the application (`v-model:reply`, `v-model:note`), so each mode keeps its own text and switching
 * modes never sends, rewrites or shows the other draft. Enter adds a line; Ctrl or ⌘ + Enter submits.
 * The component emits one typed event per mode and sends nothing itself.
 */
export interface CEMessageComposerProps {
  /** Accessible name of the text area in reply mode, for example "Mensaje para Rosa Quispe". The field has no visible label, like a chat box. */
  label: string;
  /** Accessible name of the text area in note mode. */
  noteLabel?: string;
  /** Short recipient name for the reply action: "Enviar a Rosa". Without it the action reads "Enviar". */
  recipient?: string;
  /** Shows the Responder / Nota interna switch. Leave it off for ordinary staff conversations. */
  allowNotes?: boolean;
  placeholder?: string;
  /** Pass the conversation id. When it changes the mode returns to reply; the drafts are the application's and are kept. */
  conversationId?: string;
  disabled?: boolean;
  /** Visible explanation shown while disabled. */
  disabledReason?: string;
}

const props = withDefaults(defineProps<CEMessageComposerProps>(), {
  noteLabel: 'Nota interna para el equipo', recipient: undefined, allowNotes: false, placeholder: 'Escribe un mensaje',
  conversationId: undefined, disabled: false, disabledReason: undefined,
});
const mode = defineModel<CEComposerMode>('mode', { default: 'reply' });
const reply = defineModel<string>('reply', { default: '' });
const note = defineModel<string>('note', { default: '' });
const emit = defineEmits<{ submitReply: [text: string]; saveNote: [text: string] }>();

const id = useId();
const fieldId = `${id}-field`;
const noticeId = `${id}-notice`;
const hintId = `${id}-hint`;
const reasonId = `${id}-reason`;
const field = ref<HTMLTextAreaElement | null>(null);

// Without the switch the composer is always in reply mode, whatever the model says.
const active = computed<CEComposerMode>(() => (props.allowNotes ? mode.value : 'reply'));
const draft = computed({
  get: () => (active.value === 'note' ? note.value : reply.value),
  set: (value: string) => { if (active.value === 'note') note.value = value; else reply.value = value; },
});
const canSubmit = computed(() => !props.disabled && draft.value.trim().length > 0);
const sendLabel = computed(() => (active.value === 'note' ? 'Guardar nota' : props.recipient ? `Enviar a ${props.recipient}` : 'Enviar'));
const fieldLabel = computed(() => (active.value === 'note' ? props.noteLabel : props.label));
const fieldPlaceholder = computed(() => (active.value === 'note' ? 'Escribe una nota para el equipo' : props.placeholder));
const hint = computed(() => `Enter agrega una línea. Ctrl o ⌘ + Enter para ${active.value === 'note' ? 'guardar la nota' : 'enviar'}.`);
const describedBy = computed(() => [active.value === 'note' ? noticeId : undefined, hintId, props.disabled && props.disabledReason ? reasonId : undefined].filter(Boolean).join(' '));
const otherDraft = (target: CEComposerMode) => active.value !== target && (target === 'note' ? note.value : reply.value).trim().length > 0;

// Spoken whenever the mode changes, because the colour change alone is not available to everyone.
const announcement = ref('');
watch(active, (value) => { announcement.value = value === 'note' ? 'Escribiendo una nota interna. No la ve el cliente.' : 'Escribiendo una respuesta al cliente.'; });
watch(() => props.conversationId, () => { mode.value = 'reply'; });

function submit() {
  const text = draft.value.trim();
  if (props.disabled || text === '') return;
  if (active.value === 'note') emit('saveNote', text);
  else emit('submitReply', text);
  // The application clears the draft in its handler, which disables the button; focus goes back to the field either way.
  void nextTick(() => field.value?.focus());
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) { event.preventDefault(); submit(); }
}
defineExpose({ focus: () => field.value?.focus() });
</script>

<template>
  <form :class="['ce-composer', active === 'note' && 'ce-composer--note']" @submit.prevent="submit">
    <fieldset v-if="allowNotes" class="ce-composer-mode" :disabled="disabled">
      <legend class="ce-sr-only">Tipo de mensaje</legend>
      <label class="ce-composer-mode-option">
        <input v-model="mode" class="ce-sr-only" type="radio" :name="`${id}-mode`" value="reply">
        <span>Responder al cliente<span v-if="otherDraft('reply')" class="ce-composer-mode-draft"> · borrador</span></span>
      </label>
      <label class="ce-composer-mode-option ce-composer-mode-option--note">
        <input v-model="mode" class="ce-sr-only" type="radio" :name="`${id}-mode`" value="note">
        <span>Nota interna<span v-if="otherDraft('note')" class="ce-composer-mode-draft"> · borrador</span></span>
      </label>
    </fieldset>
    <p v-if="active === 'note'" :id="noticeId" class="ce-composer-notice">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="11" width="14" height="9" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Nota interna · No la ve el cliente
    </p>
    <div class="ce-composer-row">
      <label class="ce-sr-only" :for="fieldId">{{ fieldLabel }}</label>
      <textarea
        :id="fieldId" ref="field" v-model="draft" class="ce-textarea ce-composer-field" rows="1" :placeholder="fieldPlaceholder"
        :disabled="disabled" :aria-describedby="describedBy" @keydown="onKeydown"
      />
      <CEButton class="ce-composer-send" type="submit" :disabled="!canSubmit">{{ sendLabel }}</CEButton>
    </div>
    <p :id="hintId" class="ce-field-note">{{ hint }}</p>
    <p v-if="disabled && disabledReason" :id="reasonId" class="ce-field-note">{{ disabledReason }}</p>
    <p class="ce-sr-only" role="status">{{ announcement }}</p>
  </form>
</template>
