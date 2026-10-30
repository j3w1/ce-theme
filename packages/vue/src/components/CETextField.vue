<script setup lang="ts">
import { computed, useId } from 'vue';

/** Renders the `ce-field` recipe: a visible label, a native input, an optional note and an error that says how to continue. */
export interface CETextFieldProps {
  /** Visible label. Required: placeholders never replace labels. */
  label: string;
  /** Input id. Pass one when several Vue apps render on the same page (for example Astro islands), so ids stay unique. */
  id?: string;
  type?: 'text' | 'email' | 'search' | 'tel' | 'url' | 'password';
  name?: string;
  /** Short help below the input, linked with `aria-describedby`. */
  note?: string;
  /** Error message. Sets `aria-invalid="true"` and is linked with `aria-describedby`. */
  error?: string;
  /** Fixed text before the input, such as `S/` (`ce-input-group` with `ce-input-affix`). */
  prefix?: string;
  placeholder?: string;
  autocomplete?: string;
  inputmode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'none';
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CETextFieldProps>(), {
  id: undefined, type: 'text', name: undefined, note: undefined, error: undefined, prefix: undefined,
  placeholder: undefined, autocomplete: undefined, inputmode: undefined, required: false, disabled: false, readonly: false,
});
const model = defineModel<string>({ default: '' });

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const noteId = computed(() => (props.note ? `${inputId.value}-note` : undefined));
const errorId = computed(() => (props.error ? `${inputId.value}-error` : undefined));
const describedBy = computed(() => [noteId.value, errorId.value].filter(Boolean).join(' ') || undefined);
</script>

<template>
  <div class="ce-field">
    <label :for="inputId">{{ label }}</label>
    <div v-if="prefix" class="ce-input-group">
      <span class="ce-input-affix">{{ prefix }}</span>
      <input
        v-bind="$attrs" :id="inputId" v-model="model" class="ce-input" :type="type" :name="name" :placeholder="placeholder"
        :autocomplete="autocomplete" :inputmode="inputmode" :required="required" :disabled="disabled" :readonly="readonly"
        :aria-invalid="error ? 'true' : undefined" :aria-describedby="describedBy"
      >
    </div>
    <input
      v-else v-bind="$attrs" :id="inputId" v-model="model" class="ce-input" :type="type" :name="name" :placeholder="placeholder"
      :autocomplete="autocomplete" :inputmode="inputmode" :required="required" :disabled="disabled" :readonly="readonly"
      :aria-invalid="error ? 'true' : undefined" :aria-describedby="describedBy"
    >
    <span v-if="note" :id="noteId" class="ce-field-note">{{ note }}</span>
    <span v-if="error" :id="errorId" class="ce-field-error">{{ error }}</span>
  </div>
</template>
