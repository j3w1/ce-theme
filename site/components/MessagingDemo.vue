<script setup lang="ts">
// The /mensajeria/ example: the real @casaelida/vue components on fictional, in-memory fixtures. Nothing here reads or
// writes storage, calls a service or sends a message; "sending" only appends a message to this page's own memory.
import { computed, nextTick, reactive, ref } from 'vue';
import { CEButton, CEConversationList, CEMessageComposer, CEMessageList } from '@casaelida/vue';
import type { CEComposerMode, CEConversationItem, CEMessage } from '@casaelida/vue';
import { FIRST_FREE_MINUTE, SIMULATED_INCOMING, SIMULATION_NOTICE, createThreads } from '../data/messaging';
import type { DemoThread } from '../data/messaging';

interface EmittedEvent { id: number; name: 'submitReply' | 'saveNote'; conversation: string; text: string }

const threads = reactive<DemoThread[]>(createThreads());
const selectedId = ref(threads[0]!.id);
const view = ref<'list' | 'thread'>('list');
const mode = ref<CEComposerMode>('reply');
const events = ref<EmittedEvent[]>([]);
const root = ref<HTMLElement | null>(null);
const heading = ref<HTMLElement | null>(null);
const backButton = ref<HTMLElement | null>(null);

let minute = FIRST_FREE_MINUTE;
let serial = 0;
const stamp = () => { const now = minute++; return `${String(Math.floor(now / 60)).padStart(2, '0')}:${String(now % 60).padStart(2, '0')}`; };
const nextId = () => `sim${++serial}`;
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();
const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('');

const current = computed(() => threads.find((thread) => thread.id === selectedId.value) ?? threads[0]!);
const isCustomer = computed(() => current.value.kind === 'customer');

function previewOf(thread: DemoThread) {
  // The list never quotes a draft, in either mode: it only says that one exists ("Borrador: ...").
  const reply = flat(thread.drafts.reply) !== '';
  const note = flat(thread.drafts.note) !== '';
  if (reply && note) return 'respuesta sin enviar y nota sin guardar';
  if (reply) return 'respuesta sin enviar';
  if (note) return 'nota interna sin guardar';
  const last = [...thread.messages].reverse().find((message) => message.kind !== 'system');
  if (!last) return 'Sin mensajes';
  return (last.kind === 'outgoing' ? 'Tú: ' : last.kind === 'note' ? 'Nota interna: ' : '') + flat(last.text);
}
const items = computed<CEConversationItem[]>(() => threads.map((thread) => ({
  id: thread.id, name: thread.name, kind: thread.kind, unread: thread.unread, meta: 'ejemplo',
  time: [...thread.messages].reverse().find((message) => message.kind !== 'system')?.time ?? '',
  preview: previewOf(thread), draft: thread.drafts.reply.trim() !== '' || thread.drafts.note.trim() !== '',
})));

// The back button is shown exactly when the thread replaces the list, so it is the single source of that decision.
const narrow = () => backButton.value !== null && getComputedStyle(backButton.value).display !== 'none';
function open(id: string) {
  selectedId.value = id;
  const thread = threads.find((item) => item.id === id);
  if (thread) thread.unread = 0;
  view.value = 'thread';
  // On a narrow screen the thread replaces the list, so focus moves to its heading. On a wide screen focus stays on the row.
  if (narrow()) void nextTick(() => heading.value?.focus());
}
function back() {
  view.value = 'list';
  void nextTick(() => root.value?.querySelector<HTMLElement>('.ce-conversation[aria-current="true"]')?.focus());
}

function record(name: EmittedEvent['name'], text: string) {
  events.value = [{ id: ++serial, name, conversation: current.value.name, text }, ...events.value].slice(0, 5);
}
function onSubmitReply(text: string) {
  const message: CEMessage = { id: nextId(), kind: 'outgoing', text, time: stamp(), status: 'sent', simulated: true };
  current.value.messages.push(message);
  current.value.drafts.reply = '';
  record('submitReply', text);
}
function onSaveNote(text: string) {
  current.value.messages.push({ id: nextId(), kind: 'note', author: 'Tú', own: true, text, time: stamp(), simulated: true });
  current.value.drafts.note = '';
  record('saveNote', text);
}

let incomingIndex = 0;
const incomingFor = (thread: DemoThread): CEMessage => ({
  id: nextId(), kind: 'incoming', text: SIMULATED_INCOMING[incomingIndex++ % SIMULATED_INCOMING.length]!, time: stamp(),
  author: thread.kind === 'team' ? 'Marco' : undefined,
});
function simulateIncoming() { current.value.messages.push(incomingFor(current.value)); }
function simulateOther() {
  const other = threads.find((thread) => thread.id !== selectedId.value);
  if (!other) return;
  other.messages.push(incomingFor(other));
  other.unread += 1;
}
</script>

<template>
  <section ref="root" class="messaging-demo" :data-view="view" aria-label="Ejemplo de mensajería con datos ficticios">
    <p class="messaging-demo-notice" role="note">{{ SIMULATION_NOTICE }}</p>
    <div class="messaging-demo-panes">
      <div class="messaging-demo-list">
        <CEConversationList :model-value="selectedId" :conversations="items" label="Conversaciones" @select="open" />
      </div>
      <div class="messaging-demo-thread">
        <header class="messaging-demo-header">
          <button ref="backButton" type="button" class="ce-icon-button messaging-demo-back" aria-label="Volver a conversaciones" @click="back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
          </button>
          <span :class="['ce-avatar', current.kind === 'team' && 'ce-avatar--team']" aria-hidden="true">{{ initials(current.name) }}</span>
          <div class="messaging-demo-title">
            <h2 ref="heading" tabindex="-1">{{ current.name }}</h2>
            <p>{{ isCustomer ? 'Cliente' : 'Equipo' }} · conversación de ejemplo</p>
          </div>
        </header>
        <CEMessageList :key="current.id" :messages="current.messages" :label="`Mensajes con ${current.name}`" />
        <CEMessageComposer
          v-model:mode="mode" v-model:reply="current.drafts.reply" v-model:note="current.drafts.note"
          :conversation-id="current.id" :label="`Mensaje para ${current.name}`" :recipient="current.recipient" :allow-notes="isCustomer"
          @submit-reply="onSubmitReply" @save-note="onSaveNote"
        />
      </div>
    </div>
    <div class="messaging-demo-tools" role="group" aria-label="Controles de la simulación">
      <CEButton variant="secondary" @click="simulateIncoming">Simular mensaje entrante</CEButton>
      <CEButton variant="secondary" @click="simulateOther">Simular mensaje en otra conversación</CEButton>
    </div>
  </section>
  <section class="messaging-demo-events" aria-labelledby="messaging-events">
    <h2 id="messaging-events">Eventos emitidos (simulados)</h2>
    <p>Los componentes solo emiten eventos. Esta página los recibe y actualiza su propia memoria; ningún evento sale de ella.</p>
    <ol v-if="events.length">
      <li v-for="event in events" :key="event.id"><code>{{ event.name }}</code> · {{ event.conversation }} · «{{ event.text }}» · simulado</li>
    </ol>
    <p v-else class="messaging-demo-events-empty">Aún no hay eventos. Escribe y envía, o guarda una nota.</p>
  </section>
</template>
