<template>
  <aside class="w-56 shrink-0 bg-panel border-r border-border flex flex-col">
    <div class="p-4 border-b border-border">
      <h1 class="font-display font-medium text-ink text-lg tracking-tight">Klinth</h1>
    </div>
    <nav class="flex-1 p-3 space-y-0.5">
      <template v-if="auth.isManager">
        <router-link
          v-for="item in managerNav"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="bg-panel text-accent border-l-2 border-accent"
        >
          {{ item.label }}
        </router-link>
      </template>
      <template v-else>
        <router-link
          v-for="item in employeeNav"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="bg-panel text-accent border-l-2 border-accent"
        >
          {{ item.label }}
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const auth = useAuthStore()

const managerNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/import', label: 'Import' },
  { to: '/rectifications', label: 'Rectifications' },
  { to: '/holidays', label: 'Holidays' },
]

const employeeNav = [
  { to: '/my-attendance', label: 'My Attendance' },
  { to: '/rectify', label: 'Rectify' },
]
</script>

<style scoped>
.nav-link {
  @apply block px-3 py-2 rounded text-muted text-sm font-medium border-l-2 border-transparent hover:text-ink hover:bg-panel transition-colors;
}
</style>
