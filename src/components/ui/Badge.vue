<template>
  <span :class="badgeClass">{{ displayText }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
  fallback: {
    type: String,
    default: '—',
  },
})

const variantMap = {
  present: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#e8f4ec] text-[#276749]',
  late: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#fef3e2] text-[#9a5f1a]',
  absent: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#fdecea] text-[#b91c1c]',
  holiday: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#f3f4f6] text-anito-gray',
}

const defaultClass = 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-anito-blue-light text-anito-blue-deep'

const badgeClass = computed(() => variantMap[props.status] ?? defaultClass)
const displayText = computed(() => props.status || props.fallback)
</script>
