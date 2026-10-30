<script setup lang="ts">
import { computed } from 'vue';

/** Renders the `ce-button` recipe. One primary action per view; secondary and ink for the others. */
export interface CEButtonProps {
  /** `primary` (action red), `secondary` (white with a control border) or `ink` (black). */
  variant?: 'primary' | 'secondary' | 'ink';
  /** Native button type. Defaults to `button` so a button never submits a form by accident. */
  type?: 'button' | 'submit' | 'reset';
  /** Renders a link styled as a button. A disabled or loading link renders as a disabled button instead. */
  href?: string;
  disabled?: boolean;
  /** Marks a running action: `aria-busy="true"` and disabled until it finishes. */
  loading?: boolean;
}

const props = withDefaults(defineProps<CEButtonProps>(), { variant: 'primary', type: 'button', href: undefined, disabled: false, loading: false });

const classes = computed(() => ['ce-button', props.variant !== 'primary' && `ce-button--${props.variant}`]);
const isLink = computed(() => Boolean(props.href) && !props.disabled && !props.loading);
</script>

<template>
  <a v-if="isLink" :class="classes" :href="href"><slot /></a>
  <button v-else :class="classes" :type="type" :disabled="disabled || loading" :aria-busy="loading ? 'true' : undefined"><slot /></button>
</template>
