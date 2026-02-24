<template>
  <div class="px-4 py-16 text-center">
    <div v-if="icon" class="text-anito-gray-light w-10 h-10 mx-auto mb-4">{{ icon }}</div>
    <p class="font-display font-light text-xl text-anito-black">{{ title }}</p>
    <p v-if="subtitle" class="text-sm text-anito-gray font-sans font-light mt-1">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>
