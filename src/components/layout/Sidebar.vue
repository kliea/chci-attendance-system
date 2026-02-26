<template>
  <aside class="w-52 shrink-0 bg-anito-black flex flex-col">
    <div class="p-4 border-b border-[#1e2228]">
      <span
        class="font-display font-light text-2xl tracking-[0.22em] uppercase text-white"
      >
        CHCI<span
          class="inline-block w-1.5 h-1.5 rounded-full bg-anito-blue-mid mb-0.5 ml-0.5 align-middle"
        ></span>
      </span>
      <p
        class="text-[9px] tracking-[0.3em] uppercase text-anito-gray mt-1 font-sans font-light"
      >
        OJT Attendance System
      </p>
    </div>
    <nav class="flex-1 p-3 space-y-0.5">
      <template v-if="auth.isManager">
        <router-link
          v-for="item in managerNav"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="nav-link-active"
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
          active-class="nav-link-active"
        >
          {{ item.label }}
        </router-link>

        <!-- Rectify Submenu -->
        <div
          class="relative"
          @mouseenter="openRectifySubmenu"
          @mouseleave="closeRectifySubmenu"
        >
          <button
            @click="toggleRectifySubmenu"
            class="nav-link w-full text-left flex items-center justify-between"
            :class="{ 'nav-link-active': isRectifyActive }"
          >
            <span>Rectify</span>
          </button>
          <div
            v-if="rectifySubmenuOpen"
            class="ml-2 mt-1 space-y-0.5"
            @mouseenter="keepRectifySubmenuOpen"
            @mouseleave="closeRectifySubmenu"
          >
            <router-link
              to="/rectify/request"
              class="nav-link nav-link-submenu"
              active-class="nav-link-submenu-active"
            >
              Request
            </router-link>
            <router-link
              to="/rectify/status"
              class="nav-link nav-link-submenu"
              active-class="nav-link-submenu-active"
            >
              Status
            </router-link>
          </div>
        </div>
      </template>
    </nav>
    <div class="border-t border-[#1e2228] p-3 mt-auto">
      <span class="text-[11px] text-anito-gray font-sans font-light">{{
        auth.fullName
      }}</span>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

const auth = useAuthStore();
const route = useRoute();

const rectifySubmenuOpen = ref(false);
let hoverTimeout = null;

const managerNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Employee DTR' },
  { to: '/import', label: 'Import' },
  { to: '/rectifications', label: 'Rectifications' },
]

const employeeNav = [{ to: "/my-attendance", label: "My Attendance" }];

const isRectifyActive = computed(() => {
  return route.path.startsWith("/rectify");
});

// Auto-open submenu when on rectify routes
watch(
  isRectifyActive,
  (isActive) => {
    if (isActive) {
      rectifySubmenuOpen.value = true;
    }
  },
  { immediate: true },
);

function toggleRectifySubmenu() {
  rectifySubmenuOpen.value = !rectifySubmenuOpen.value;
}

function openRectifySubmenu() {
  clearTimeout(hoverTimeout);
  rectifySubmenuOpen.value = true;
}

function closeRectifySubmenu() {
  hoverTimeout = setTimeout(() => {
    if (!isRectifyActive.value) {
      rectifySubmenuOpen.value = false;
    }
  }, 300); // 300ms delay before closing
}

function keepRectifySubmenuOpen() {
  clearTimeout(hoverTimeout);
}
</script>

<style scoped>
.nav-link {
  @apply block text-[10px] tracking-[0.18em] uppercase font-sans font-medium px-3 py-2 rounded text-[#4a5568] hover:text-white hover:bg-[#131820] transition-colors duration-150;
}
.nav-link-active {
  @apply bg-[#131820] text-white;
  position: relative;
  padding-left: 1.25rem;
}
.nav-link-active::before {
  content: "";
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0.25rem;
  height: 0.25rem;
  border-radius: 9999px;
  background-color: #2b5baa;
}
.nav-link-submenu {
  @apply text-[9px] tracking-[0.16em] px-3 py-1.5 rounded text-[#4a5568] hover:text-white hover:bg-[#131820] transition-colors duration-150;
}
.nav-link-submenu-active {
  @apply bg-[#131820] text-white;
  position: relative;
  padding-left: 1.5rem;
}
.nav-link-submenu-active::before {
  content: "";
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0.1875rem;
  height: 0.1875rem;
  border-radius: 9999px;
  background-color: #2b5baa;
}
</style>
