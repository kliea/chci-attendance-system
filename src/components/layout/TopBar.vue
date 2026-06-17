<template>
  <header class="sticky top-0 z-10 h-16 shrink-0 border-b border-gray-100 bg-white flex items-center justify-between px-8 shadow-sm">
    <h2 class="text-3xl font-bold tracking-tight text-[#003777]">
      {{ pageTitle }}
    </h2>
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-4 border-l border-gray-200 pl-6">
        <div class="text-right">
          <p class="text-xs uppercase tracking-wide text-gray-500 font-medium">{{ currentDate }}</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ auth.fullName }}</p>
        </div>
        <button 
          @click="handleLogout"
          class="ml-2 px-4 py-2 text-sm font-medium text-[#003777] hover:bg-blue-50 hover:border-blue-300 rounded-lg transition-all duration-200 border border-blue-200"
        >
          Log out
        </button>
      </div>
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

const currentDate = computed(() => new Date().toLocaleDateString('en-PH', { 
  weekday: 'short', 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
}))

const pageTitle = computed(() => {
  const name = route.name
  const titles = {
    dashboard: 'Dashboard',
    employees: 'Employees',
    attendance: 'Employee DTR',
    import: 'Import',
    rectifications: 'Rectifications',
    holidays: 'Holidays',
    'my-attendance': 'My Attendance',
    rectify: 'Rectify',
  }
  return titles[name] ?? 'Attendance System'
})

async function handleLogout() {
  await auth.signOut()
  router.push({ name: 'login' })
}
</script>

<style scoped>
/* Button hover state with smooth transition */
button:active {
  transform: scale(0.98);
}
</style>