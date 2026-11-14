<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { CEConversationList, CEMessageComposer, CEMessageList, CEWorkStatus } from '@casaelida/vue';
import type { CEComposerMode, CEWorkStep } from '@casaelida/vue';
import { createExamples } from '../data/messaging-example.mjs';

const props = defineProps<{ base: string }>();
const examples = reactive(createExamples(props.base));
const selected = ref(examples[0]!.id);
const current = computed(() => examples.find((item) => item.id === selected.value) ?? examples[0]!);
const conversations = examples.map(({ id, name, kind }) => ({ id, name, kind, preview: 'Datos simulados', time: '10:30' }));
const mode = ref<CEComposerMode>('reply');
const attachmentNotice = ref('');
const steps: CEWorkStep[] = [{ id: 'inicio', label: 'Inicio', state: 'done' }, { id: 'ejemplo', label: 'Revisión', state: 'current' }];
let serial = 0;

function append(kind: 'reply' | 'note', text: string) {
  current.value.messages.push({ id: `ejemplo-${++serial}`, kind: kind === 'reply' ? 'outgoing' : 'note', text, own: true, simulated: true, ...(kind === 'reply' ? { status: 'sent' as const } : {}) });
  current.value[kind] = '';
}
</script>

<template>
  <section class="messaging-demo" aria-label="Composición de mensajería">
    <p class="ce-demo-cue" role="note">Demostración — datos y operaciones simulados</p>
    <p>Simulación: ningún mensaje sale de esta página.</p>
    <div class="messaging-example-grid">
      <CEConversationList v-model="selected" :conversations="conversations" label="Conversaciones" />
      <div class="messaging-example-thread">
        <h2>{{ current.name }}</h2>
        <CEMessageList :key="current.id" class="messaging-example-log" :messages="current.messages" :label="`Mensajes con ${current.name}`" @open-attachment="attachmentNotice = 'Solicitud de apertura recibida. La foto es una ilustración inventada; no hay visor en este ejemplo.'">
          <template #context="{ message }">
            <CEWorkStatus v-if="message.id === 'ilustracion'" title="Contexto ilustrativo" :steps="steps" status="En curso" summary="Estado de ejemplo, independiente de la entrega del mensaje." />
          </template>
        </CEMessageList>
        <CEMessageComposer v-model:mode="mode" v-model:reply="current.reply" v-model:note="current.note" :conversation-id="current.id" :label="`Mensaje para ${current.name}`" :allow-notes="current.kind === 'customer'" @submit-reply="text => append('reply', text)" @save-note="text => append('note', text)" />
      </div>
    </div>
    <p role="status">{{ attachmentNotice }}</p>
  </section>
</template>
