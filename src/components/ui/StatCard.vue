<template>
  <div class="bg-white border border-anito-gray-light rounded p-5">
    <p class="text-[9px] tracking-[0.3em] uppercase text-anito-gray font-sans font-medium mb-3">{{ label }}</p>
    <p class="font-display font-light text-5xl" :class="valueClass">{{ value }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  highlight: Boolean, // use blue for primary stat
})

const valueClass = computed(() => (props.highlight ? 'text-anito-blue-deep' : 'text-anito-black'))
</script>
