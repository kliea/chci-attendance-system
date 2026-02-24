<template>
  <component
    :is="tag"
    :type="tag === 'button' ? (type || 'button') : undefined"
    :disabled="disabled"
    :class="buttonClass"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary | secondary | ghost | outline
  },
  size: {
    type: String,
    default: 'default', // default | sm | lg
  },
  disabled: Boolean,
  type: String,
  tag: {
    type: String,
    default: 'button',
  },
  block: Boolean,
})

const baseClass = 'text-[10px] tracking-[0.2em] uppercase font-sans font-medium rounded transition-colors duration-150 disabled:opacity-50'

const variantClasses = {
  primary: 'bg-anito-black text-white hover:bg-anito-blue-deep px-4 py-2.5',
  primaryInverted: 'bg-white text-anito-black hover:bg-anito-blue-light px-4 py-2.5',
  secondary: 'border border-anito-gray-light text-anito-black hover:border-anito-blue-mid hover:text-anito-blue-mid px-4 py-2',
  outline: 'border border-anito-gray-light text-anito-black hover:border-anito-black px-4 py-2',
  ghost: 'text-anito-gray hover:text-anito-black px-4 py-2',
}

const sizeClasses = {
  default: '',
  sm: 'px-3 py-1.5 text-[9px]',
  lg: 'px-6 py-3 text-[11px] w-full',
}

const buttonClass = computed(() => {
  const v = variantClasses[props.variant] ?? variantClasses.primary
  const s = sizeClasses[props.size] ?? ''
  const block = props.block ? 'w-full' : ''
  return [baseClass, v, s, block].filter(Boolean).join(' ')
})
</script>
