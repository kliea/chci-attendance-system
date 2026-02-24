<template>
  <div class="max-w-4xl">
    <h1 class="font-display font-light text-xl tracking-wide text-anito-black mb-4">Holidays</h1>
    <p class="text-anito-gray text-sm font-sans font-light leading-relaxed mb-8">Holiday calendar. Data will appear when wired to the store.</p>
    <EmptyState icon="📅" title="No holidays" subtitle="Holiday entries will appear here when configured." />
  </div>
</template>

<script setup>
import { EmptyState } from '@/components/ui'
</script>
