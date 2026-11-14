<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { CEButton, CEConversationList, CEMessageComposer, CEMessageList, CEPrice, CEWorkStatus } from '@casaelida/vue';
import type { CEComposerMode, CEConversationItem, CEMessage, CEWorkStep } from '@casaelida/vue';

// Fictional data. The app only proves that the installed package renders with its own styles and fonts.
const conversations: CEConversationItem[] = [
  { id: 'uno', name: `Conversación uno · ${'Nombre largo '.repeat(8)}`, preview: 'Primer ejemplo.', time: '10:30', unread: 2, kind: 'customer' },
  { id: 'dos', name: 'Conversación dos', preview: 'Segundo ejemplo.', time: '09:12', kind: 'team' },
];
// Only controlled inputs for public contracts, independent of the showcase and any application workflow.
const fixture = () => ({ reply: '', note: '', messages: [
  { id: 'day-1', kind: 'system', text: 'Hoy' },
  ...Array.from({ length: 16 }, (_, i) => ({ id: `m${i}`, kind: 'incoming', text: `Mensaje de prueba ${i}. ${'Texto largo de ejemplo. '.repeat(4)} ${i === 0 ? 'A'.repeat(100) : ''}`, time: '10:30' })),
  { id: 'context', kind: 'outgoing', text: 'Mensaje con contexto.', time: '10:31', status: 'read', simulated: true,
    attachments: [{ id: 'foto', label: 'Ilustración', src: '/photo.svg', alt: 'Rectángulo de prueba' }] },
] as CEMessage[] });
const threads = reactive({ uno: fixture(), dos: fixture() });
const selected = ref<'uno' | 'dos'>('uno');
const current = computed(() => threads[selected.value]);
const mode = ref<CEComposerMode>('reply');
const events = ref<string[]>([]);
const expanded = ref(false);
const notes = ref(true);
const stopped = ref(false);
const steps = computed<CEWorkStep[]>(() => [{ id: 'a', label: 'Primero', state: 'done' }, { id: 'b', label: 'Segundo', state: stopped.value ? 'stopped' : 'current' }]);
let serial = 0;
function submit(kind: 'reply' | 'note', text: string) {
  events.value.push(`${kind === 'reply' ? 'submitReply' : 'saveNote'}: ${text}`);
  current.value.messages.push({ id: `new-${++serial}`, kind: kind === 'reply' ? 'outgoing' : 'note', text, own: true, status: 'sent', simulated: true });
  current.value[kind] = '';
}
function append() { current.value.messages.push({ id: `new-${++serial}`, kind: 'incoming', text: 'Nuevo mensaje recibido.' }); }
function prepend() { current.value.messages.unshift({ id: `old-${++serial}`, kind: 'incoming', text: 'Mensaje anterior.' }); }
</script>

<template>
  <main class="ce-scope">
    <h1>Prueba del paquete</h1>
    <CEButton id="boton">Guardar</CEButton>
    <p id="precio"><CEPrice amount="6.00" previous-amount="7.50" discount-label="20%" /></p>
    <CEConversationList :model-value="selected" :conversations="conversations" label="Conversaciones" @select="id => { if (id === 'uno' || id === 'dos') selected = id; }" />
    <CEMessageList :key="selected" :messages="current.messages" :label="`Mensajes ${selected}`" style="height:20rem;max-width:40rem" @open-attachment="(message, attachment, index) => events.push(`openAttachment: ${message}/${attachment}/${index}`)">
      <template #context="{ message }">
        <CEWorkStatus v-if="message.id === 'context'" title="Contexto de prueba" :steps="steps" :status="stopped ? 'Detenido' : 'Segundo'" :summary="expanded ? 'Resumen de prueba. '.repeat(40) : 'Resumen breve.'" />
      </template>
    </CEMessageList>
    <CEMessageComposer v-model:mode="mode" v-model:reply="current.reply" v-model:note="current.note" :conversation-id="selected" label="Respuesta" recipient="Prueba" :allow-notes="notes" @submit-reply="text => submit('reply', text)" @save-note="text => submit('note', text)" />
    <CEButton @click="append">Agregar recibido</CEButton>
    <CEButton @click="prepend">Anteponer anterior</CEButton>
    <CEButton @click="expanded = !expanded">Cambiar contexto</CEButton>
    <CEButton @click="notes = !notes">Cambiar permiso de notas</CEButton>
    <CEButton @click="stopped = !stopped">Cambiar estado suministrado</CEButton>
    <ol aria-label="Eventos"><li v-for="(event, index) in events" :key="index">{{ event }}</li></ol>
  </main>
</template>
