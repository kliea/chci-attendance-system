<template>
  <input
    :id="id"
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :autocomplete="autocomplete"
    :minlength="minlength"
    :class="[inputBaseClass, inputVariantClass]"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  id: String,
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
  autocomplete: String,
  minlength: [String, Number],
  variant: { type: String, default: 'light' }, // light (dark text) | dark (light text)
})

defineEmits(['update:modelValue'])

const inputBaseClass = 'w-full border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans focus:border-anito-blue-mid focus:outline-none transition-colors duration-150'
const inputVariantClass = computed(() =>
  props.variant === 'dark'
    ? 'text-anito-white placeholder-anito-gray'
    : 'text-anito-black placeholder-anito-gray'
)
</script>
