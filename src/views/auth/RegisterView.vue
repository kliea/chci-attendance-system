<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-6">
    <div class="w-full max-w-sm">
      <h1 class="font-display text-ink text-2xl font-medium mb-8 text-center">Klinth</h1>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="fullName" class="block text-sm font-medium text-muted mb-1">Full name</label>
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            required
            autocomplete="name"
            class="w-full px-3 py-2 bg-panel border border-border rounded text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            placeholder="Jane Doe"
          />
        </div>
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
            autocomplete="new-password"
            minlength="6"
            class="w-full px-3 py-2 bg-panel border border-border rounded text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            placeholder="••••••••"
          />
          <p class="text-muted text-xs mt-1">At least 6 characters</p>
        </div>
        <p v-if="auth.error" class="text-danger text-sm">{{ auth.error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 bg-accent text-surface font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50"
        >
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>
      </form>
      <p class="text-center text-muted text-sm mt-4">
        Already have an account?
        <router-link to="/login" class="text-accent hover:underline">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

onMounted(() => auth.clearError())

async function handleSubmit() {
  loading.value = true
  const { ok } = await auth.signUp(email.value, password.value, { fullName: fullName.value.trim() })
  loading.value = false
  if (ok) {
    const redirect = auth.isManager ? '/dashboard' : '/my-attendance'
    router.push(redirect)
  }
}
</script>
