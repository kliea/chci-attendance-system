<template>
  <div class="relative overflow-hidden min-h-screen bg-anito-black flex items-center justify-center p-6">
    <!-- CHCI decorative background -->
    <div class="absolute inset-0 -z-10 pointer-events-none">
      <div class="chci-accent-left" />
      <div class="chci-accent-right" />
      <div class="chci-grid" />
    </div>
    <div class="w-full max-w-sm">
      <h1
        class="hero-title font-light text-2xl tracking-wide text-white mb-8 text-center"
      >
        CHCI<span
          class="inline-block w-1.5 h-1.5 rounded-full bg-anito-blue-mid mb-0.5 ml-0.5 align-middle"
        ></span>
      </h1>
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <Label for-id="staffSelect">I am in the staff roster</Label>
          <select
            id="staffSelect"
            v-model="selectedStaffId"
            class="border border-anito-gray-light rounded bg-black px-4 py-3 text-sm font-sans text-anito-white focus:border-anito-blue-mid focus:outline-none w-full transition-colors duration-150"
          >
            <option value="">— Not in the list —</option>
            <option v-for="s in unregisteredStaff" :key="s.id" :value="s.id">
              {{ s.full_name }} ({{ s.bio_id }})
            </option>
          </select>
          <p
            v-if="staffLoading"
            class="text-anito-gray text-xs font-sans font-light mt-1"
          >
            Loading…
          </p>
          <p
            v-else-if="unregisteredStaff.length === 0"
            class="text-anito-gray text-xs font-sans font-light mt-1"
          >
            No unregistered staff. Add yourself via Employees → Add from list
            first, or register without linking.
          </p>
          <p
            v-else-if="selectedStaff"
            class="text-anito-gray text-xs font-sans font-light mt-1"
          >
            Selecting links your account to your attendance record.
          </p>
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
          <p class="text-anito-gray text-xs font-sans font-light mt-1">
            At least 6 characters
          </p>
        </div>
        <p v-if="auth.error" class="text-red-500 text-sm">{{ auth.error }}</p>
        <Button
          type="submit"
          variant="primaryInverted"
          size="lg"
          :disabled="loading"
        >
          {{ loading ? "Creating account…" : "Create account" }}
        </Button>
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

    <!-- Email Confirmation Modal -->
    <Dialog v-model="showEmailModal" max-width="max-w-md">
      <div class="text-center">
        <div
          class="w-16 h-16 bg-anito-blue-mid/10 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8 text-anito-blue-mid"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            ></path>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-anito-black mb-2">
          Check your email
        </h2>
        <p class="text-anito-gray mb-6">
          Please check your Gmail for a confirmation link to complete your
          registration.
        </p>
        <Button
          @click="handleModalClose"
          variant="primary"
          size="lg"
          class="w-full"
        >
          Got it
        </Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { supabase } from "@/lib/supabase.js";
import { Button, Input, Label, Dialog } from "@/components/ui";

const router = useRouter();
const auth = useAuthStore();

const unregisteredStaff = ref([]);
const staffLoading = ref(false);
const selectedStaffId = ref("");
const fullName = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const showEmailModal = ref(false);

const selectedStaff = computed(() =>
  selectedStaffId.value
    ? unregisteredStaff.value.find((s) => s.id === selectedStaffId.value)
    : null,
);

watch(selectedStaff, (s) => {
  if (s) fullName.value = s.full_name;
});

async function fetchUnregisteredStaff() {
  staffLoading.value = true;
  const { data, error } = await supabase.rpc("get_unregistered_staff");
  staffLoading.value = false;
  if (!error) unregisteredStaff.value = data ?? [];
}

onMounted(async () => {
  auth.clearError();
  await fetchUnregisteredStaff();
});

async function handleSubmit() {
  loading.value = true;
  const bioId = selectedStaff.value?.bio_id ?? null;
  const name = fullName.value.trim() || (selectedStaff.value?.full_name ?? "");
  const { ok } = await auth.signUp(email.value, password.value, {
    fullName: name,
    bioId,
  });
  loading.value = false;
  if (ok) {
    showEmailModal.value = true;
  }
}

function handleModalClose() {
  showEmailModal.value = false;
  router.push("/login");
}
</script>
