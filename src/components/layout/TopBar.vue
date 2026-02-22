<template>
  <header class="h-14 shrink-0 border-b border-border bg-panel flex items-center justify-between px-6">
    <h2 class="font-display text-ink text-sm font-medium">
      {{ pageTitle }}
    </h2>
    <div class="flex items-center gap-4">
      <span class="text-muted text-sm">{{ auth.fullName }}</span>
      <button
        type="button"
        class="text-muted hover:text-ink text-sm transition-colors"
        @click="handleLogout"
      >
        Log out
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const pageTitle = computed(() => {
  const name = route.name
  const titles = {
    dashboard: 'Dashboard',
    employees: 'Employees',
    attendance: 'Attendance',
    import: 'Import',
    rectifications: 'Rectifications',
    holidays: 'Holidays',
    'my-attendance': 'My Attendance',
    rectify: 'Rectify',
  }
  return titles[name] ?? 'Klinth'
})

async function handleLogout() {
  await auth.signOut()
  router.push({ name: 'login' })
}
</script>
