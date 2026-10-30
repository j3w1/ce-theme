<script setup lang="ts">
import { computed, ref, useId, useSlots, watch } from 'vue';
import { SlotWrapper } from '../internal/slot';

/** `done` and `pending` are before and after the current step; `stopped` marks a step where the work ended without finishing. */
export type CEWorkStepState = 'done' | 'current' | 'pending' | 'stopped';

export interface CEWorkStep {
  id: string;
  /** Visible step name, supplied by the application ("Solicitado", "Preparando"). */
  label: string;
  state: CEWorkStepState;
}

/**
 * Renders the `ce-work-status` recipe: an application-provided title, ordered steps with their state written in words,
 * the current state as text, an optional summary of who and when, and an `actions` slot for the application's own buttons.
 * It does not know what the steps mean and never changes state: transitions, inventory rules, permissions and persistence
 * stay in the application. Delivery of a message is a different thing and is shown elsewhere, never here.
 */
export interface CEWorkStatusProps {
  /** Name of the work, for example "Pedido de reposición". */
  title: string;
  /** Ordered steps. Exactly one is normally `current` (or `stopped`). */
  steps: CEWorkStep[];
  /** The current state as text ("Aceptado"). The application decides it; it is announced politely when it changes. */
  status: string;
  /** Who and when, as text ("Marco · Almacén se encargó · 10:31"). */
  summary?: string;
  /** Heading level of the title, so it fits the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

const props = withDefaults(defineProps<CEWorkStatusProps>(), { summary: undefined, headingLevel: 3 });
defineSlots<{ actions?(): unknown }>();
const slots = useSlots();

const STATE_WORDS: Record<CEWorkStepState, string> = { done: 'hecho', current: 'actual', pending: 'pendiente', stopped: 'se detuvo' };
const headingId = `ce-work-status-${useId()}`;
const heading = computed(() => `h${props.headingLevel}`);

// The root is `aria-live="off"`: inside a message log (itself a live region) the visible text is not announced a second time
// by the log, and the status region below speaks a change once. A change of the current state is announced politely, once. Nothing is announced when the component first appears.
const announcement = ref('');
watch(() => props.status, (status) => { announcement.value = `${props.title}: ${status}`; });
</script>

<template>
  <section class="ce-work-status" :aria-labelledby="headingId" aria-live="off">
    <header class="ce-work-status-head">
      <component :is="heading" :id="headingId" class="ce-work-status-title">{{ title }}</component>
      <span class="ce-work-status-now">{{ status }}</span>
    </header>
    <ol class="ce-work-steps" aria-label="Progreso">
      <li v-for="step in steps" :key="step.id" :class="['ce-work-step', `ce-work-step--${step.state}`]" :aria-current="step.state === 'current' ? 'step' : undefined">
        <span class="ce-work-step-label">{{ step.label }}<span class="ce-sr-only"> ({{ STATE_WORDS[step.state] }})</span></span>
      </li>
    </ol>
    <p v-if="summary" class="ce-work-status-summary">{{ summary }}</p>
    <SlotWrapper :render="slots.actions" wrapper-class="ce-work-status-actions" />
    <p class="ce-sr-only" role="status" aria-live="polite">{{ announcement }}</p>
  </section>
</template>
