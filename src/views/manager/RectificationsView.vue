<template>
  <div class="max-w-4xl">
    <h1 class="font-display font-light text-xl tracking-wide text-anito-black mb-4">Rectifications</h1>
    <p class="text-anito-gray text-sm font-sans font-light leading-relaxed mb-8">Review and approve rectification requests. Data will appear when wired to the store.</p>
    <EmptyState icon="📋" title="No rectifications" subtitle="Rectification requests will appear here when available." />
  </div>
</template>

<script setup>
import { EmptyState } from '@/components/ui'
</script>
