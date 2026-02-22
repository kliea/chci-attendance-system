<template>
  <div>
    <p class="text-muted text-sm">Filterable attendance log. Data will appear when wired to the store.</p>
    <p v-if="auth.profile" class="text-muted text-xs mt-2">Signed in as {{ auth.profile.full_name }} ({{ auth.profile.role }})</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.js'
const auth = useAuthStore()
</script>
