<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useSlots, watch } from 'vue';
import { SlotWrapper } from '../internal/slot';
import CEAttachmentGroup from './CEAttachmentGroup.vue';
import type { CEAttachment } from './CEAttachmentGroup.vue';

/** `incoming` and `outgoing` are customer-facing text; `note` is an internal note and is never drawn as outgoing; `system` is a centred notice such as a day separator. */
export type CEMessageKind = 'incoming' | 'outgoing' | 'note' | 'system';
/** Message delivery only. Acceptance or completion of operational work is a different thing and is not shown here. */
export type CEMessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface CEMessage {
  id: string;
  kind: CEMessageKind;
  text: string;
  /** Display time, already formatted by the application. */
  time?: string;
  /** Machine-readable time for the `time` element. */
  datetime?: string;
  /** Sender name shown above incoming messages and notes. */
  author?: string;
  /** Delivery state of an outgoing message, written as a word: Enviado, Entregado, Leído or No entregado. */
  status?: CEMessageStatus;
  /** Marks a fixture or simulated message. The status then reads "Enviado · simulado". */
  simulated?: boolean;
  /** Written by the person using this view. Outgoing messages always are; set it on your own notes. */
  own?: boolean;
  /** Images already sent with this message, drawn above the text. Opening one emits `openAttachment`; nothing here uploads or views them. */
  attachments?: CEAttachment[];
}

/**
 * Renders the `ce-message-list` recipe as a labelled, focusable `role="log"`. Message bubbles are an internal part of this component.
 *
 * **Mount one list per conversation and key it by the conversation id** (`<CEMessageList :key="conversation.id" ... />`).
 * The list never infers a conversation change from its messages: message ids may repeat across conversations (every one can
 * start with the same day separator) and older messages may be prepended to the same conversation. A keyed mount opens at the
 * newest message; updating `messages` within one conversation never moves a reader who is looking at earlier history.
 *
 * Application-specific content for one message (for example a `CEWorkStatus`) goes in the `context` slot, which receives
 * `{ message }` and is drawn inside the bubble after the time and delivery status. A message the slot draws nothing for gets
 * no wrapper. Delivery status and the progress of any work are different things and stay in different places.
 */
export interface CEMessageListProps {
  messages: CEMessage[];
  /** Accessible name of the log, for example "Mensajes con Rosa Quispe". */
  label: string;
  /** Text shown when there are no messages. */
  emptyText?: string;
}

const props = withDefaults(defineProps<CEMessageListProps>(), { emptyText: 'Aún no hay mensajes.' });
const emit = defineEmits<{ openAttachment: [messageId: string, attachmentId: string, index: number] }>();
defineSlots<{ context?(props: { message: CEMessage }): unknown }>();
const slots = useSlots();

const STATUS_LABELS: Record<CEMessageStatus, string> = { sent: 'Enviado', delivered: 'Entregado', read: 'Leído', failed: 'No entregado' };
const attachmentsLabel = (message: CEMessage) => { const count = message.attachments?.length ?? 0; return `${count} ${count === 1 ? 'foto' : 'fotos'}`; };
const statusText = (message: CEMessage) => (message.kind === 'outgoing' && message.status ? STATUS_LABELS[message.status] + (message.simulated ? ' · simulado' : '') : '');
const noteText = (message: CEMessage) => (message.kind === 'note' && message.simulated ? 'simulada' : '');

// Scrolling: a new list opens at the newest message (a keyed mount per conversation, see above). After that, follow a new
// message only when the reader is already at the bottom or the message is their own. Never move a reader who is looking at
// earlier history, including when older messages are added above.
const NEAR_BOTTOM = 48;
const log = ref<HTMLElement | null>(null);
const atBottom = () => !log.value || log.value.scrollHeight - log.value.scrollTop - log.value.clientHeight <= NEAR_BOTTOM;
const scrollToLatest = () => { if (log.value) log.value.scrollTop = log.value.scrollHeight; };

// A reader at the bottom stays there when the log changes size or becomes visible: the composer grows, the window
// resizes, a narrow layout reveals a thread that was mounted while hidden (a hidden log has no height to scroll), or the
// contextual content or an attachment of a message changes height. A reader in history is never moved.
let following = true;
let observer: ResizeObserver | undefined;
const observed = new Set<Element>();
const onScroll = () => { following = atBottom(); };
// The log keeps its own size when a message inside it grows, so every message is observed as well.
function observeMessages() {
  if (!observer || !log.value) return;
  const present = new Set(log.value.querySelectorAll('.ce-message'));
  for (const element of observed) if (!present.has(element)) { observer.unobserve(element); observed.delete(element); }
  for (const element of present) if (!observed.has(element)) { observer.observe(element); observed.add(element); }
}
onMounted(() => {
  scrollToLatest();
  if (typeof ResizeObserver !== 'undefined' && log.value) {
    observer = new ResizeObserver(() => { if (following) scrollToLatest(); });
    observer.observe(log.value);
    observeMessages();
  }
});
onUpdated(observeMessages);
onBeforeUnmount(() => { observer?.disconnect(); observed.clear(); });
watch(
  () => [props.messages.length, props.messages.at(-1)?.id] as const,
  ([length, last], [previousLength, previousLast]) => {
    const newest = props.messages.at(-1);
    const appended = length > previousLength && last !== previousLast;
    const own = appended && newest !== undefined && (newest.own ?? newest.kind === 'outgoing');
    // The "pre" flush runs before the DOM changes, so the position is measured before the new message is added.
    if (atBottom() || own) void nextTick(scrollToLatest);
  },
  { flush: 'pre' },
);
</script>

<template>
  <div ref="log" class="ce-message-list" role="log" tabindex="0" :aria-label="label" @scroll.passive="onScroll">
    <p v-if="messages.length === 0" class="ce-message-list-empty">{{ emptyText }}</p>
    <template v-for="message in messages" :key="message.id">
      <p v-if="message.kind === 'system'" class="ce-message ce-message--system">{{ message.text }}</p>
      <article v-else :class="['ce-message', `ce-message--${message.kind}`]">
        <p v-if="message.kind === 'note'" class="ce-message-note-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="11" width="14" height="9" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Nota interna · No la ve el cliente
        </p>
        <p v-if="message.author && message.kind !== 'outgoing'" class="ce-message-author">{{ message.author }}</p>
        <CEAttachmentGroup v-if="message.attachments?.length" :items="message.attachments" :label="attachmentsLabel(message)" @open="(index, id) => emit('openAttachment', message.id, id, index)" />
        <p class="ce-message-text"><span v-if="message.kind === 'outgoing'" class="ce-sr-only">Tú: </span><span v-else-if="message.kind === 'incoming' && !message.author" class="ce-sr-only">Mensaje recibido: </span>{{ message.text }}</p>
        <p v-if="message.time || statusText(message) || noteText(message)" class="ce-message-meta">
          <time v-if="message.time" class="ce-message-time" :datetime="message.datetime">{{ message.time }}</time>
          <span v-if="statusText(message)" :class="['ce-message-status', message.status === 'failed' && 'ce-message-status--failed']">{{ statusText(message) }}</span>
          <span v-if="noteText(message)" class="ce-message-status">{{ noteText(message) }}</span>
        </p>
        <SlotWrapper :render="slots.context" :params="{ message }" wrapper-class="ce-message-context" />
      </article>
    </template>
  </div>
</template>
