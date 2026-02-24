<template>
  <div class="min-h-screen bg-anito-black flex items-center justify-center p-6">
    <div class="w-full max-w-sm">
      <h1
        class="font-display font-light text-2xl tracking-wide text-white mb-8 text-center"
      >
        ANITO<span
          class="inline-block w-1.5 h-1.5 rounded-full bg-anito-blue-mid mb-0.5 ml-0.5 align-middle"
        ></span>
      </h1>
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label
            for="fullName"
            class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
            >Full name</label
          >
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            required
            autocomplete="name"
            class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-white placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors duration-150"
            placeholder="Jane Doe"
          />
        </div>
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
            class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-white placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors duration-150"
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
            autocomplete="new-password"
            minlength="6"
            class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-white placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors duration-150"
            placeholder="••••••••"
          />
          <p class="text-anito-gray text-xs font-sans font-light mt-1">
            At least 6 characters
          </p>
        </div>
        <p v-if="auth.error" class="text-red-500 text-sm">{{ auth.error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="bg-white text-anito-black text-[11px] tracking-[0.2em] uppercase font-sans font-medium py-3 px-8 rounded hover:bg-anito-blue-light transition-colors duration-150 w-full disabled:opacity-50"
        >
          {{ loading ? "Creating account…" : "Create account" }}
        </button>
      </form>
      <p class="text-center text-sm text-anito-gray font-sans font-light mt-4">
        Already have an account?
        <router-link
          to="/login"
          class="text-anito-blue-mid hover:underline transition-colors"
          >Sign in</router-link
        >
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

const router = useRouter();
const auth = useAuthStore();

const fullName = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);

onMounted(() => auth.clearError());

async function handleSubmit() {
  if (loading.value) return; // Prevent multiple submissions

  loading.value = true;

  try {
    const { ok } = await auth.signUp(email.value, password.value, {
      fullName: fullName.value.trim(),
    });

    if (ok) {
      const redirect = auth.isManager ? "/dashboard" : "/my-attendance";
      router.push(redirect);
    }
  } catch (err) {
    console.error("Submit error:", err);
  } finally {
    loading.value = false;
  }
}
</script>
