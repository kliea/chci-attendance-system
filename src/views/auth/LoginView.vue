<template>
  <div class="min-h-screen bg-anito-black flex">
    <div class="hidden md:flex w-[60%] flex-col items-center justify-center p-12">
      <p class="text-[10px] tracking-[0.3em] uppercase text-anito-blue-mid font-sans font-medium">CHCI</p>
      <h1 class="font-display font-light text-[72px] tracking-wide text-white mt-2">
        ANITO<span class="inline-block w-3 h-3 rounded-full bg-anito-blue-mid mb-1 ml-1 align-middle"></span>
      </h1>
      <div class="w-8 h-0.5 bg-anito-blue-mid my-4"></div>
      <p class="text-[10px] tracking-[0.3em] uppercase text-anito-gray font-sans font-light">OJT Attendance Monitoring</p>
    </div>
    <div class="flex-1 md:w-[40%] bg-anito-white flex flex-col items-center justify-center p-8">
      <div class="w-full max-w-sm space-y-6">
        <h2 class="font-display font-light text-2xl tracking-wide text-anito-black md:hidden text-center">ANITO</h2>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div>
            <Label for-id="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label for-id="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <p v-if="auth.error" class="text-red-600 text-sm">{{ auth.error }}</p>
          <Button type="submit" variant="primary" size="lg" :disabled="loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </Button>
        </form>
        <p class="text-center text-sm text-anito-gray font-sans font-light">
          No account?
          <router-link to="/register" class="text-anito-blue-mid hover:underline transition-colors">Create one</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { Button, Input, Label } from '@/components/ui'

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
