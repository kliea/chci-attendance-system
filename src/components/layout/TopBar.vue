<template>
  <header class="h-14 shrink-0 border-b border-anito-gray-light bg-anito-white flex items-center justify-between px-6">
    <h2 class="font-display font-light text-2xl tracking-wide text-anito-black">
      {{ pageTitle }}
    </h2>
    <div class="flex items-center gap-4">
      <span class="font-display italic text-sm text-anito-gray">{{ currentDate }}</span>
      <span class="text-anito-gray text-sm font-sans font-light">{{ auth.fullName }}</span>
      <button
        type="button"
        class="text-anito-gray hover:text-anito-black text-[10px] tracking-[0.2em] uppercase font-sans font-medium transition-colors duration-150"
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

const currentDate = computed(() => new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }))

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
  return titles[name] ?? 'ANITO'
})

async function handleLogout() {
  await auth.signOut()
  router.push({ name: 'login' })
}
</script>
