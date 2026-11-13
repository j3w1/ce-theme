<script setup lang="ts">
import { ref } from 'vue';
import { CEButton, CEConversationList, CEMessageComposer, CEMessageList, CEPrice } from '@casaelida/vue';
import type { CEComposerMode, CEConversationItem, CEMessage } from '@casaelida/vue';

// Fictional data. The app only proves that the installed package renders with its own styles and fonts.
const conversations: CEConversationItem[] = [
  { id: 'tacna', name: 'Reposición · Tacna', preview: 'Falta el anaquel 4.', time: '10:30', unread: 2, kind: 'team' },
  { id: 'cliente', name: 'Cliente de prueba', preview: '¿Tienen la taza en stock?', time: '09:12', kind: 'customer' },
];
const messages: CEMessage[] = [
  { id: 'm1', kind: 'incoming', author: 'Marco', text: 'Buenos días. Necesitamos reponer el anaquel.', time: '10:30' },
  { id: 'm2', kind: 'outgoing', text: 'Lo revisamos ahora.', time: '10:31', status: 'read', simulated: true, own: true },
];
const selected = ref('tacna');
const mode = ref<CEComposerMode>('reply');
const reply = ref('');
const note = ref('');
</script>

<template>
  <main class="ce-scope">
    <h1>Consumidor de @casaelida/vue</h1>
    <CEButton id="boton">Guardar</CEButton>
    <p id="precio"><CEPrice amount="6.00" previous-amount="7.50" discount-label="20%" /></p>
    <CEConversationList v-model="selected" :conversations="conversations" label="Conversaciones" />
    <CEMessageList :key="selected" :messages="messages" label="Mensajes" />
    <CEMessageComposer v-model:mode="mode" v-model:reply="reply" v-model:note="note" label="Respuesta" recipient="Marco" allow-notes />
  </main>
</template>
