<template>
  <label :for="forId" class="block text-xs tracking-[0.15em] uppercase text-anito-gray font-sans font-medium mb-1.5">
    <slot />
  </label>
</template>

<script setup>
defineProps({
  forId: String,
})
</script>
