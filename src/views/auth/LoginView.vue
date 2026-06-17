<template>
  <div class="min-h-screen flex bg-white">
    <div class="hidden md:flex relative md:w-1/2 lg:w-1/2 flex-col items-center justify-center p-12 overflow-hidden bg-gradient-to-br">
      <div class="absolute inset-0 -z-10 opacity-20">
        <div class="absolute top-20 right-20 w-80 h-80 bg-white rounded-full mix-blend-screen filter blur-3xl"></div>
        <div class="absolute bottom-20 left-20 w-80 h-80 bg-white rounded-full mix-blend-screen filter blur-3xl"></div>
      </div>
      <div class="text-center max-w-md relative z-10">
        <div class="mb-10">
          <img src="@/components/img/logo.png" alt="CHCI Logo" class="max-w-xs w-full h-auto mx-auto" />
        </div>
        <p class="text-xl text-[#003777] uppercase font-bold mb-8 letter-spacing-[0.05em]">
          Attendance Monitoring System
        </p>
      </div>
    </div>

    <div class="flex-1 md:w-1/2 lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 bg-gray-50">
      <div class="w-full max-w-sm">
        <div class="md:hidden text-center mb-12">
          <img src="@/components/img/logo.png" alt="CHCI Logo" class="max-w-[140px] w-full h-auto mx-auto mb-4" />
        </div>

        <div class="mb-10">
          <h2 class="text-3xl font-semibold text-gray-900">Welcome back</h2>
          <p class="text-gray-600 text-sm mt-1 font-light">Sign in to your account to continue</p>
        </div>

        <!-- Form -->
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-900 mb-2">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors bg-white"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-900 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors bg-white"
            />
          </div>
          <div v-if="auth.error" class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {{ auth.error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 bg-[#003777] text-white text-sm font-medium rounded-lg hover:bg-[#002555] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416" />
            </svg>
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-600 mt-8">
          No account?
          <router-link
            to="/register"
            class="text-[#003777] font-medium hover:text-[#002555] transition-colors"
          >
            Create one
          </router-link>
        </p>

        <!-- Footer Text -->
        <p class="text-center text-xs text-gray-500 leading-relaxed">
          By signing in, you agree to our
          <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors font-medium">Terms of Service</a>
          and
          <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors font-medium">Privacy Policy</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

onMounted(() => auth.clearError());

async function handleSubmit() {
  if (loading.value) return;

  loading.value = true;

  try {
    const { ok } = await auth.signIn(email.value, password.value);

    if (ok) {
      const redirect = route.query.redirect;
      if (redirect) {
        router.push({ path: redirect });
      } else if (auth.isManager) {
        router.push({ name: "dashboard" });
      } else {
        router.push({ name: "my-attendance" });
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Login submit error:", err);
    }
  } finally {
    loading.value = false;
  }
}
</script>