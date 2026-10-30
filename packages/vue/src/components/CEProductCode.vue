<script setup lang="ts">
import { computed } from 'vue';
import { codeSegments } from '../../../../recipes/product.mjs';

/**
 * Renders the `ce-code` badge for a product code exactly as supplied. On screen the four-digit number of a
 * Casa Elida code is underlined (`ce-code-number`, through `recipes/product.mjs`); any other code is shown whole.
 */
export interface CEProductCodeProps {
  /** The code as a string, never a number: `"CE26061441"`, `"7730744292227"`. */
  code: string;
  /** `md` follows the surrounding text; `sm` and `lg` use the recipe sizes. */
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<CEProductCodeProps>(), { size: 'md' });
const segments = computed(() => codeSegments(props.code));
const classes = computed(() => ['ce-code', props.size !== 'md' && `ce-code--${props.size}`]);
</script>

<template>
  <span :class="classes"><template v-for="segment in segments" :key="segment.part"><span v-if="segment.part === 'number'" class="ce-code-number">{{ segment.text }}</span><template v-else>{{ segment.text }}</template></template></span>
</template>
