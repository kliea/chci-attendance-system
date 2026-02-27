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
        class="text-[10px] tracking-[0.25em] uppercase text-anito-gray mt-1 font-heading font-light"
      >
        Attendance Monitoring System
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

const managerNav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/employees", label: "Employees" },
  { to: "/attendance", label: "Employee DTR" },
  { to: "/import", label: "Import" },
  { to: "/rectifications", label: "Rectifications" },
];

const employeeNav = [
  { to: "/my-attendance", label: "My Attendance" },
  { to: "/rectify", label: "Rectify" },
];
</script>

<style scoped>
/* tailwindcss @apply */
/* stylelint-disable at-rule-no-unknown */
/* eslint-disable-next-line at-rule-no-unknown */
.nav-link {
  @apply block text-xs tracking-[0.12em] uppercase font-sans font-medium px-3 py-2 rounded text-[#6b7280] hover:text-white hover:bg-[#131820] transition-colors duration-150;
}
/* eslint-disable-next-line at-rule-no-unknown */
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
  background-color: #3a7cc3;
}
</style>
