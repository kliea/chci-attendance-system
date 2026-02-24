<template>
  <div class="min-h-screen bg-anito-black flex items-center justify-center p-6">
    <div class="w-full max-w-sm">
      <h1 class="font-display font-light text-2xl tracking-wide text-white mb-8 text-center">
        ANITO<span class="inline-block w-1.5 h-1.5 rounded-full bg-anito-blue-mid mb-0.5 ml-0.5 align-middle"></span>
      </h1>
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <Label for-id="staffSelect">I am in the staff roster</Label>
          <select
            id="staffSelect"
            v-model="selectedStaffId"
            class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-white focus:border-anito-blue-mid focus:outline-none w-full transition-colors duration-150"
          >
            <option value="">— Not in the list —</option>
            <option v-for="s in unregisteredStaff" :key="s.id" :value="s.id">
              {{ s.full_name }} ({{ s.bio_id }})
            </option>
          </select>
          <p v-if="staffLoading" class="text-anito-gray text-xs font-sans font-light mt-1">Loading…</p>
          <p v-else-if="unregisteredStaff.length === 0" class="text-anito-gray text-xs font-sans font-light mt-1">No unregistered staff. Add yourself via Employees → Add from list first, or register without linking.</p>
          <p v-else-if="selectedStaff" class="text-anito-gray text-xs font-sans font-light mt-1">Selecting links your account to your attendance record.</p>
        </div>
        <div>
          <Label for-id="fullName">Full name</Label>
          <Input
            id="fullName"
            v-model="fullName"
            type="text"
            required
            autocomplete="name"
            placeholder="Jane Doe"
            variant="dark"
          />
        </div>
        <div>
          <Label for-id="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            variant="dark"
          />
        </div>
        <div>
          <Label for-id="password">Password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="new-password"
            minlength="6"
            placeholder="••••••••"
            variant="dark"
          />
          <p class="text-anito-gray text-xs font-sans font-light mt-1">At least 6 characters</p>
        </div>
        <p v-if="auth.error" class="text-red-500 text-sm">{{ auth.error }}</p>
        <Button type="submit" variant="primaryInverted" size="lg" :disabled="loading">
          {{ loading ? 'Creating account…' : 'Create account' }}
        </Button>
      </form>
      <p class="text-center text-sm text-anito-gray font-sans font-light mt-4">
        Already have an account?
        <router-link to="/login" class="text-anito-blue-mid hover:underline transition-colors">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { supabase } from '@/lib/supabase.js'
import { Button, Input, Label } from '@/components/ui'

const router = useRouter()
const auth = useAuthStore()

const unregisteredStaff = ref([])
const staffLoading = ref(false)
const selectedStaffId = ref('')
const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

const selectedStaff = computed(() =>
  selectedStaffId.value
    ? unregisteredStaff.value.find((s) => s.id === selectedStaffId.value)
    : null
)

watch(selectedStaff, (s) => {
  if (s) fullName.value = s.full_name
})

async function fetchUnregisteredStaff() {
  staffLoading.value = true
  const { data, error } = await supabase.rpc('get_unregistered_staff')
  staffLoading.value = false
  if (!error) unregisteredStaff.value = data ?? []
}

onMounted(async () => {
  auth.clearError()
  await fetchUnregisteredStaff()
})

async function handleSubmit() {
  loading.value = true
  const bioId = selectedStaff.value?.bio_id ?? null
  const name = fullName.value.trim() || (selectedStaff.value?.full_name ?? '')
  const { ok } = await auth.signUp(email.value, password.value, { fullName: name, bioId })
  loading.value = false
  if (ok) {
    const redirect = auth.isManager ? '/dashboard' : '/my-attendance'
    router.push(redirect)
  }
}
</script>
