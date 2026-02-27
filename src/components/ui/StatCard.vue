<template>
  <div class="bg-white border border-anito-gray-light rounded-lg p-5 flex flex-col gap-2" :class="cardBorderClass">
    <p class="text-xs tracking-[0.15em] uppercase font-heading font-medium" :class="labelClass">{{ label }}</p>
    <p class="hero-title font-light text-5xl" :class="valueClass">{{ value }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  highlight: Boolean,  // primary / on-time stat
  warn: Boolean,       // late
  danger: Boolean,     // absent
})

const cardBorderClass = computed(() => {
  if (props.highlight) return 'border-l-4 border-l-anito-blue-deep'
  if (props.warn)      return 'border-l-4 border-l-warn'
  if (props.danger)    return 'border-l-4 border-l-danger'
  return ''
})

const labelClass = computed(() => {
  if (props.highlight) return 'text-anito-blue-deep'
  if (props.warn)      return 'text-warn'
  if (props.danger)    return 'text-danger'
  return 'text-anito-gray'
})

const valueClass = computed(() => {
  if (props.highlight) return 'text-anito-blue-deep'
  if (props.warn)      return 'text-warn'
  if (props.danger)    return 'text-danger'
  return 'text-anito-black'
})
</script>
