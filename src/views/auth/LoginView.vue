<template>
  <div class="min-h-screen bg-anito-black flex">
    <div
      class="hidden md:flex w-[60%] flex-col items-center justify-center p-12"
    >
      <p
        class="text-[10px] tracking-[0.3em] uppercase text-anito-blue-mid font-sans font-medium"
      >
        CHCI
      </p>
      <h1
        class="font-display font-light text-[72px] tracking-wide text-white mt-2"
      >
        ANITO<span
          class="inline-block w-3 h-3 rounded-full bg-anito-blue-mid mb-1 ml-1 align-middle"
        ></span>
      </h1>
      <div class="w-8 h-0.5 bg-anito-blue-mid my-4"></div>
      <p
        class="text-[10px] tracking-[0.3em] uppercase text-anito-gray font-sans font-light"
      >
        OJT Attendance Monitoring
      </p>
    </div>
    <div
      class="flex-1 md:w-[40%] bg-anito-white flex flex-col items-center justify-center p-8"
    >
      <div class="w-full max-w-sm space-y-6">
        <h2
          class="font-display font-light text-2xl tracking-wide text-anito-black md:hidden text-center"
        >
          ANITO
        </h2>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label
              for="email"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
              >Email</label
            >
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors duration-150"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              for="password"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
              >Password</label
            >
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors duration-150"
              placeholder="••••••••"
            />
          </div>
          <p v-if="auth.error" class="text-red-600 text-sm">{{ auth.error }}</p>
          <button
            type="submit"
            :disabled="loading"
            class="bg-anito-black text-white text-[11px] tracking-[0.2em] uppercase font-sans font-medium py-3 px-8 rounded hover:bg-anito-blue-deep transition-colors duration-150 w-full disabled:opacity-50"
          >
            {{ loading ? "Signing in…" : "Sign in" }}
          </button>
        </form>
        <p class="text-center text-sm text-anito-gray font-sans font-light">
          No account?
          <router-link
            to="/register"
            class="text-anito-blue-mid hover:underline transition-colors"
            >Create one</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

onMounted(() => auth.clearError());

async function handleSubmit() {
  if (loading.value) return; // Prevent multiple submissions

  loading.value = true;

  try {
    const { ok } = await auth.signIn(email.value, password.value);

    if (ok) {
      const redirect =
        route.query.redirect ??
        (auth.isManager ? "/dashboard" : "/my-attendance");
      router.push(redirect);
    }
  } catch (err) {
    console.error("Login submit error:", err);
  } finally {
    loading.value = false;
  }
}
</script>
