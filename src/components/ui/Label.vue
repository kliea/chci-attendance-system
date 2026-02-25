<template>
  <label :for="forId" class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-1">
    <slot />
  </label>
</template>

<script setup>
defineProps({
  forId: String,
})
</script>
