<script setup lang="ts">
import { computed } from 'vue';

/** One attachment that was already sent. The application supplies the image; this component never uploads, stores or verifies anything. */
export interface CEAttachment {
  /** Stable identifier, a string. It is returned in the `open` event. */
  id: string;
  /** Short visible caption, for example "Anaquel 3". */
  label: string;
  /** Image address supplied by the application. */
  src: string;
  /** Accessible description of what the image shows. */
  alt: string;
}
/** `contain` shows the whole image uncropped (the default, right for photographic evidence); `cover` fills the tile. */
export type CEAttachmentFit = 'contain' | 'cover';

/**
 * Renders the `ce-attachments` recipe: a list of already-sent images, each a native button that only asks the application
 * to open it. There is no upload, capture, zoom or viewer here. Each tile reserves its box with `aspect-ratio`, so images
 * loading never shift the layout (and never move a scrolling message list). The wrapper is the group's own query container,
 * so the columns follow the group's width wherever it is used; give it a block-level or definite width (it has no intrinsic one).
 */
export interface CEAttachmentGroupProps {
  items: CEAttachment[];
  /** Accessible name of the group, for example "1 foto". */
  label: string;
  fit?: CEAttachmentFit;
}

const props = withDefaults(defineProps<CEAttachmentGroupProps>(), { fit: 'contain' });
const emit = defineEmits<{ open: [index: number, id: string] }>();

// One item fills the width and two or four make two columns; any other count makes three (two in a narrow container).
const classes = computed(() => ['ce-attachments', [1, 2, 4].includes(props.items.length) && `ce-attachments--${props.items.length}`, props.fit === 'cover' && 'ce-attachments--cover']);
// The name says the action, the position, the caption and the description once; the image inside a button is not read again.
const nameOf = (item: CEAttachment, index: number) => `Abrir foto ${index + 1} de ${props.items.length}: ${item.label}. ${item.alt}`;
</script>

<template>
  <div v-if="items.length > 0" class="ce-attachment-group">
    <ul :class="classes" :aria-label="label">
      <li v-for="(item, index) in items" :key="item.id" class="ce-attachment">
        <button type="button" class="ce-attachment-open" :aria-label="nameOf(item, index)" @click="emit('open', index, item.id)">
          <img class="ce-attachment-image" :src="item.src" :alt="item.alt" />
          <span class="ce-attachment-caption">{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
