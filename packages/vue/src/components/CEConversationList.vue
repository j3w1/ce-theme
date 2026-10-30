<script setup lang="ts">
/** Who a conversation is with. It is shown as a word next to the preview; no colour carries meaning. */
export type CEConversationKind = 'team' | 'customer' | 'assistant';

export interface CEConversationItem {
  id: string;
  /** Person, group or customer name. Long names are shortened with an ellipsis; the thread shows them in full. */
  name: string;
  /** Plain text of the latest message, or of the draft when `draft` is set. Prefix it yourself ("Tú: ", "Nota interna: "). */
  preview: string;
  /** Display time, already formatted by the application ("10:42", "Ayer"). */
  time: string;
  /** Number of unread messages. Zero or undefined shows no badge. */
  unread?: number;
  kind?: CEConversationKind;
  /** Extra plain text after the kind, composed by the application. */
  meta?: string;
  /** Shows "Borrador:" before the preview. */
  draft?: boolean;
}

/** Renders the `ce-conversation-list` recipe: one native button per conversation inside a labelled navigation landmark. */
export interface CEConversationListProps {
  conversations: CEConversationItem[];
  /** Accessible name of the list, for example "Conversaciones". */
  label: string;
  /** Text shown when there are no conversations. */
  emptyText?: string;
}

withDefaults(defineProps<CEConversationListProps>(), { emptyText: 'No hay conversaciones.' });
/** The selected conversation id. The component never filters, sorts or decides what a role may see. */
const selected = defineModel<string | undefined>({ default: undefined });
/** Fires on every activation, including the row that is already selected, so a narrow layout can open the thread of the current conversation. */
const emit = defineEmits<{ select: [id: string] }>();

const KIND_LABELS: Record<CEConversationKind, string> = { team: 'Equipo', customer: 'Cliente', assistant: 'Asistente' };
const initials = (name: string) => name.split(/\s+/).filter((word) => /^\p{L}/u.test(word)).slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('') || '#';
const detail = (item: CEConversationItem) => [item.kind ? KIND_LABELS[item.kind] : undefined, item.meta].filter(Boolean).join(' · ');
const choose = (id: string) => { selected.value = id; emit('select', id); };
</script>

<template>
  <nav :aria-label="label">
    <p v-if="conversations.length === 0" class="ce-conversation-empty">{{ emptyText }}</p>
    <ul v-else class="ce-conversation-list">
      <li v-for="item in conversations" :key="item.id">
        <button type="button" class="ce-conversation" :aria-current="selected === item.id ? 'true' : undefined" @click="choose(item.id)">
          <span :class="['ce-avatar', item.kind === 'team' && 'ce-avatar--team']" aria-hidden="true">{{ initials(item.name) }}</span>
          <span class="ce-conversation-name">{{ item.name }}</span>
          <span class="ce-conversation-time">{{ item.time }}</span>
          <span class="ce-conversation-preview"><span v-if="item.draft" class="ce-conversation-draft">Borrador: </span>{{ item.preview }}</span>
          <span v-if="item.unread" class="ce-conversation-unread"><span aria-hidden="true">{{ item.unread }}</span><span class="ce-sr-only">{{ item.unread }} sin leer</span></span>
          <span v-if="detail(item)" class="ce-conversation-meta">{{ detail(item) }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
