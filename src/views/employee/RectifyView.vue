<template>
  <div class="max-w-4xl">
    <h1 class="font-display font-light text-xl tracking-wide text-anito-black mb-4">Rectify</h1>
    <p class="text-anito-gray text-sm font-sans font-light leading-relaxed mb-8">Raise a rectification request. Form will appear when wired to the store.</p>
    <EmptyState icon="✏️" title="Rectification form" subtitle="Form will appear here when wired to the store." />
  </div>
</template>

<script setup>
import { EmptyState } from '@/components/ui'
</script>
