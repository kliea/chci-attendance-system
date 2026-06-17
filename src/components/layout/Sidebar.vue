<template>
  <aside class="w-64 h-screen sticky top-0 shrink-0 bg-white flex flex-col border-r border-gray-100 shadow-sm">
    <!-- Header -->
    <div class="px-6 py-8 border-b border-gray-100">
      <div class="flex items-center justify-center mb-4">
        <img src="@/components/img/logo.png" alt="CHCI Logo" class="h-30 w-35">
      </div>
      <p class="text-xs tracking-wide uppercase text-gray-500 mt-3 font-medium letter-spacing-[0.05em] text-center">
        Attendance System
      </p>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <template v-if="auth.isManager">
        <router-link to="/dashboard" class="nav-link" active-class="nav-link-active">Dashboard</router-link>
        <router-link to="/employees" class="nav-link" active-class="nav-link-active">Employees</router-link>
        <router-link to="/attendance" class="nav-link" active-class="nav-link-active">Employee DTR</router-link>
        <router-link to="/import" class="nav-link" active-class="nav-link-active">Import</router-link>
        <router-link to="/rectifications" class="nav-link" active-class="nav-link-active">Rectifications</router-link>
        <router-link to="/overtime" class="nav-link" active-class="nav-link-active">Overtime</router-link>
        <router-link to="/settings" class="nav-link" active-class="nav-link-active">Settings</router-link>
      </template>
      <template v-else>
        <router-link to="/my-attendance" class="nav-link" active-class="nav-link-active">My Attendance</router-link>
        <router-link to="/rectify" class="nav-link" active-class="nav-link-active">Rectify</router-link>
        <router-link to="/my-overtime" class="nav-link" active-class="nav-link-active">Overtime</router-link>
      </template>
    </nav>

    <!-- User Footer -->
    <div class="border-t border-gray-100 px-6 py-6 mt-auto bg-gray-50">
      <p class="text-xs text-gray-600 font-medium uppercase tracking-wide">Logged in as</p>
      <p class="text-sm font-semibold text-gray-900 mt-2">{{ auth.fullName }}</p>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth.js";

const auth = useAuthStore();
</script>

<style scoped>
/* Navigation Link Base Styles */
.nav-link {
  @apply relative flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 ease-out rounded-lg;
  position: relative;
}

.nav-link:hover {
  @apply text-[#003777] bg-blue-50;
}

/* Active State */
.nav-link-active {
  @apply text-white bg-[#003777] shadow-md;
}

.nav-link-active:hover {
  @apply bg-[#002555];
}

/* Indicator Dot */
.nav-indicator {
  @apply inline-block w-2 h-2 rounded-full bg-current transition-all duration-200;
  opacity: 0;
}

.nav-link-active .nav-indicator {
  @apply w-2 h-2 bg-white;
  opacity: 1;
}

/* Scrollbar styling for navigation */
nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
