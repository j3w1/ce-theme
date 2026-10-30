<script setup lang="ts">
// The /mensajeria/ example: the real @casaelida/vue components on fictional, in-memory fixtures. Nothing here reads or
// writes storage, calls a service or sends a message; "sending" only appends a message to this page's own memory.
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { CEButton, CEConversationList, CEMessageComposer, CEMessageList, CEWorkStatus } from '@casaelida/vue';
import type { CEComposerMode, CEConversationItem, CEMessage } from '@casaelida/vue';
import { FIRST_FREE_MINUTE, SIMULATED_INCOMING, SIMULATION_NOTICE, UNAVAILABLE_REASON, WAREHOUSE, WORK_ACTIONS, createThreads, workStatusOf } from '../data/messaging';
import type { DemoRequestState, DemoThread, DemoWorkAction } from '../data/messaging';

// Component events are recorded under their own names. A warehouse action is not a component event: the application's own
// buttons in the CEWorkStatus slot raise it, so it is recorded as the application's simulated action.
interface EmittedEvent { id: number; name: 'submitReply' | 'saveNote' | 'openAttachment' | 'warehouseAction'; conversation: string; text: string; note?: string }

const threads = reactive<DemoThread[]>(createThreads());
const selectedId = ref(threads[0]!.id);
const view = ref<'list' | 'thread'>('list');
const mode = ref<CEComposerMode>('reply');
const events = ref<EmittedEvent[]>([]);
const attachmentAnnouncement = ref('');
const root = ref<HTMLElement | null>(null);
const heading = ref<HTMLElement | null>(null);
const backButton = ref<HTMLElement | null>(null);
const listPane = ref<HTMLElement | null>(null);
const threadPane = ref<HTMLElement | null>(null);

let minute = FIRST_FREE_MINUTE;
let serial = 0;
const stamp = () => { const now = minute++; return `${String(Math.floor(now / 60)).padStart(2, '0')}:${String(now % 60).padStart(2, '0')}`; };
const nextId = () => `sim${++serial}`;
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();
const initials = (name: string) => name.split(/\s+/).filter((word) => /\p{L}/u.test(word)).slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('');

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
const selectedRow = () => root.value?.querySelector<HTMLElement>('.ce-conversation[aria-current="true"]') ?? null;
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
  void nextTick(() => selectedRow()?.focus());
}

// A layout change must not hide the control the reader is using. The control last focused is remembered; when the layout
// changes (the window is resized or the text size changes the container query) and that control is no longer shown, the pane
// it belongs to stays visible and focus returns to it. The Back button, which only exists while the thread replaces the list,
// hands focus to the selected row when it goes away.
let lastFocus: HTMLElement | null = null;
let wasNarrow = false;
let observer: ResizeObserver | undefined;
const shown = (element: HTMLElement) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
function onFocusIn(event: FocusEvent) { lastFocus = event.target as HTMLElement; }
function onFocusOut(event: FocusEvent) {
  // The reader clicked or tabbed away: forget the control. A control that was hidden by the layout is not forgotten.
  if (shown(event.target as HTMLElement) && !root.value?.contains(event.relatedTarget as Node | null)) lastFocus = null;
}
async function keepFocusVisible() {
  const target = lastFocus;
  if (!target || !target.isConnected || shown(target)) return;
  if (target === backButton.value) {
    view.value = 'list';
    await nextTick();
    selectedRow()?.focus();
    return;
  }
  view.value = threadPane.value?.contains(target) ? 'thread' : 'list';
  await nextTick();
  target.focus();
}
function onLayoutChange() {
  const isNarrow = narrow();
  if (isNarrow === wasNarrow) return;
  wasNarrow = isNarrow;
  void keepFocusVisible();
}
onMounted(() => {
  wasNarrow = narrow();
  if (typeof ResizeObserver === 'undefined') return;
  observer = new ResizeObserver(onLayoutChange);
  for (const element of [root.value, listPane.value, threadPane.value]) if (element) observer.observe(element);
});
onBeforeUnmount(() => observer?.disconnect());

function record(name: EmittedEvent['name'], text: string, note?: string) {
  events.value = [{ id: ++serial, name, conversation: current.value.name, text, note }, ...events.value].slice(0, 5);
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

// Opening a photograph only records the event: this demonstration has no viewer, and no modal is drawn.
function onOpenAttachment(messageId: string, attachmentId: string, index: number) {
  const message = current.value.messages.find((item) => item.id === messageId);
  const attachment = message?.attachments?.[index];
  const total = message?.attachments?.length ?? 0;
  record('openAttachment', `${attachment?.label ?? attachmentId} · foto ${index + 1} de ${total} · mensaje de las ${message?.time ?? ''}`, 'No hay visor en esta demostración: solo se registra el evento.');
  // Cleared first so that opening the same photo again is announced again.
  attachmentAnnouncement.value = '';
  void nextTick(() => { attachmentAnnouncement.value = `Se abrió la foto ${index + 1} de ${total}: ${attachment?.label ?? attachmentId}. Simulado: no hay visor en esta demostración.`; });
}

// Simulated warehouse actions. The page, not CEWorkStatus, owns the transition; each conversation keeps its own requests.
function advance(messageId: string, action: DemoWorkAction, event: Event) {
  const request = current.value.requests[messageId];
  if (!request || !WORK_ACTIONS[request.state].some((offered) => offered.to === action.to)) return;
  // The button that was used is replaced by the next action (or by none), so a keyboard reader would lose their place.
  const hadFocus = event.currentTarget === document.activeElement;
  const time = stamp();
  const to: DemoRequestState = action.to;
  const before = workStatusOf(request).status;
  request.state = to;
  if (to === 'accepted') request.acceptedAt = time;
  if (to === 'preparing') request.preparingAt = time;
  if (to === 'resolved') request.closedAt = time;
  if (to === 'unavailable') current.value.messages.push({ id: nextId(), kind: 'incoming', author: WAREHOUSE, text: UNAVAILABLE_REASON, time: stamp() });
  record('warehouseAction', `${action.label} · ${before} → ${workStatusOf(request).status}`);
  if (hadFocus) void nextTick(() => (root.value?.querySelector<HTMLElement>('.messaging-demo-warehouse button') ?? root.value?.querySelector<HTMLElement>('[role="log"]'))?.focus({ preventScroll: true }));
}

let incomingIndex = 0;
const incomingFor = (thread: DemoThread): CEMessage => ({
  id: nextId(), kind: 'incoming', text: SIMULATED_INCOMING[incomingIndex++ % SIMULATED_INCOMING.length]!, time: stamp(),
  author: thread.kind === 'team' ? (thread.author ?? 'Marco') : undefined,
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
  <section ref="root" class="messaging-demo" :data-view="view" aria-label="Ejemplo de mensajería con datos ficticios" @focusin="onFocusIn" @focusout="onFocusOut">
    <p class="messaging-demo-notice" role="note">{{ SIMULATION_NOTICE }}</p>
    <div class="messaging-demo-panes">
      <div ref="listPane" class="messaging-demo-list">
        <CEConversationList :model-value="selectedId" :conversations="items" label="Conversaciones" @select="open" />
      </div>
      <div ref="threadPane" class="messaging-demo-thread">
        <header class="messaging-demo-header">
          <button ref="backButton" type="button" class="ce-icon-button messaging-demo-back" aria-label="Volver a conversaciones" @click="back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
          </button>
          <span :class="['ce-avatar', current.kind === 'team' && 'ce-avatar--team']" aria-hidden="true">{{ initials(current.name) }}</span>
          <div class="messaging-demo-title">
            <h2 ref="heading" tabindex="-1">{{ current.name }}</h2>
            <p>{{ current.description ?? (isCustomer ? 'Cliente' : 'Equipo') }} · conversación de ejemplo</p>
          </div>
        </header>
        <CEMessageList :key="current.id" :messages="current.messages" :label="`Mensajes con ${current.name}`" @open-attachment="onOpenAttachment">
          <template #context="{ message }">
            <CEWorkStatus v-if="current.requests[message.id]" title="Pedido de reposición" v-bind="workStatusOf(current.requests[message.id]!)">
              <template v-if="WORK_ACTIONS[current.requests[message.id]!.state].length" #actions>
                <div class="messaging-demo-warehouse" role="group" :aria-labelledby="`warehouse-${message.id}`">
                  <p :id="`warehouse-${message.id}`" class="messaging-demo-warehouse-label">Acciones simuladas del almacén</p>
                  <CEButton v-for="action in WORK_ACTIONS[current.requests[message.id]!.state]" :key="action.to" variant="secondary" @click="advance(message.id, action, $event)">{{ action.label }}</CEButton>
                </div>
              </template>
            </CEWorkStatus>
          </template>
        </CEMessageList>
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
    <p>Los componentes solo emiten eventos. Esta página los recibe y actualiza su propia memoria; ningún evento sale de ella. Las acciones del almacén son botones de esta página, no de los componentes.</p>
    <!-- The history is visible and not live: replies are already announced by the message log and request progress by CEWorkStatus. -->
    <div>
      <ol v-if="events.length">
        <li v-for="event in events" :key="event.id"><code>{{ event.name }}</code> · {{ event.conversation }} · «{{ event.text }}» · simulado<template v-if="event.note"> · {{ event.note }}</template></li>
      </ol>
      <p v-else class="messaging-demo-events-empty">Aún no hay eventos. Escribe y envía, guarda una nota, o abre la foto de Reposición · Tacna.</p>
    </div>
    <!-- Opening a photo has no other visible result next to the focused button, so this small region says it once. -->
    <p class="ce-sr-only" role="status" aria-live="polite" data-testid="attachment-announcement">{{ attachmentAnnouncement }}</p>
  </section>
</template>
