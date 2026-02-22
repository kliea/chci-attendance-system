<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-6">
    <div class="w-full max-w-sm">
      <h1 class="font-display text-ink text-2xl font-medium mb-8 text-center">Klinth</h1>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-muted mb-1">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-3 py-2 bg-panel border border-border rounded text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-muted mb-1">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-3 py-2 bg-panel border border-border rounded text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            placeholder="••••••••"
          />
        </div>
        <p v-if="auth.error" class="text-danger text-sm">{{ auth.error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 bg-accent text-surface font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50"
        >
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
      <p class="text-center text-muted text-sm mt-4">
        No account?
        <router-link to="/register" class="text-accent hover:underline">Create one</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

onMounted(() => auth.clearError())

async function handleSubmit() {
  loading.value = true
  const { ok } = await auth.signIn(email.value, password.value)
  loading.value = false
  if (ok) {
    const redirect = route.query.redirect ?? (auth.isManager ? '/dashboard' : '/my-attendance')
    router.push(redirect)
  }
}
</script>
