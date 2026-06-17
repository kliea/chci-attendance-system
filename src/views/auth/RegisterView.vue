<template>
  <div class="min-h-screen flex bg-white">
    <div class="hidden md:flex relative md:w-1/2 lg:w-1/2 flex-col items-center justify-center p-12 overflow-hidden bg-gradient-to-br">
      <div class="absolute inset-0 -z-10 opacity-20">
        <div class="absolute top-20 right-20 w-80 h-80 bg-white rounded-full mix-blend-screen filter blur-3xl"></div>
        <div class="absolute bottom-20 left-20 w-80 h-80 bg-white rounded-full mix-blend-screen filter blur-3xl"></div>
      </div>

      <!-- Content -->
      <div class="text-center max-w-md relative z-10">
        <!-- Logo -->
        <div class="mb-10">
          <img src="@/components/img/logo.png" alt="CHCI Logo" class="max-w-xs w-full h-auto mx-auto" />
        </div>

        <!-- Divider -->
        <div class="w-16 h-1 bg-white/30 mx-auto mb-8 rounded"></div>
        <p class="text-xl text-[#003777] uppercase font-bold mb-8 letter-spacing-[0.05em]">
          Attendance Monitoring System
        </p>
      </div>
    </div>

    <div class="flex-1 md:w-1/2 lg:w-1/2 flex flex-col items-center justify-center p-2 bg-gray-50 overflow-y-auto">
      <div class="w-full max-w-sm py-8">
        <div class="md:hidden text-center mb-5">
        </div>

        <!-- Form Header -->
        <div class="mb-2">
          <h2 class="text-3xl font-semibold text-[#003777]">Create account</h2>
          <p class="text-gray-600 text-sm font-light">Sign up to get started</p>
        </div>

        <!-- Form -->
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="staffSelect" class="block text-sm font-medium text-gray-900 mb-2 mt-5">
              I am in the staff roster
            </label>
            <select
              id="staffSelect"
              v-model="selectedStaffId"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors bg-white"
            >
              <option value="">— Not in the list —</option>
              <option v-for="s in unregisteredStaff" :key="s.id" :value="s.id">
                {{ s.full_name }} ({{ s.bio_id }})
              </option>
            </select>
            <p v-if="staffLoading" class="text-gray-500 text-xs mt-2 font-light">
              Loading staff list…
            </p>
            <p v-else-if="unregisteredStaff.length === 0" class="text-gray-500 text-xs mt-2 font-light">
              No unregistered staff available. You can register without linking to a staff record.
            </p>
            <p v-else-if="selectedStaff" class="text-gray-600 text-xs mt-2 font-light">
              Selecting this will link your account to your attendance record.
            </p>
          </div>

          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-900">
              Full name <span class="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              v-model="fullName"
              type="text"
              required
              autocomplete="name"
              placeholder="Jane Doe"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors bg-white"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-900">
              Email address <span class="text-red-500">*</span>
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
            <label for="password" class="block text-sm font-medium text-gray-900">
              Password <span class="text-red-500">*</span>
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="new-password"
              minlength="6"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors bg-white"
            />
            <p class="text-gray-500 text-xs mt-2 font-light">
              At least 6 characters
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="auth.error" class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {{ auth.error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 bg-[#003777] text-white text-sm font-medium rounded-lg hover:bg-[#002555] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416" />
            </svg>
            {{ loading ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <!-- Sign In Link -->
        <p class="text-center text-sm text-gray-600 mt-3">
          Already have an account?
          <router-link
            to="/login"
            class="text-[#003777] font-medium hover:text-[#002555] transition-colors"
          >
            Sign in
          </router-link>
        </p>

        <!-- Footer Text -->
        <p class="text-center text-xs text-gray-500 mt-1 leading-relaxed">
          By creating an account, you agree to our
          <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors font-medium">Terms of Service</a>
          and
          <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors font-medium">Privacy Policy</a>
        </p>
      </div>
    </div>

    <!-- Email Confirmation Modal -->
    <div
      v-if="showEmailModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      @click.self="handleModalClose"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-gray-200 text-center">
          <h2 class="text-lg font-semibold text-gray-900">Check your email</h2>
        </div>

        <!-- Modal Content -->
        <div class="p-8 text-center">
          <!-- Icon -->
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <!-- Message -->
          <p class="text-gray-600 mb-8 leading-relaxed">
            Please check your email for a confirmation link to complete your registration.
          </p>

          <!-- Button -->
          <button
            @click="handleModalClose"
            class="w-full py-2.5 px-4 bg-[#003777] text-white text-sm font-medium rounded-lg hover:bg-[#002555] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useStaffStore } from "@/stores/staff.js";

const router = useRouter();
const auth = useAuthStore();
const staffStore = useStaffStore();

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
  try {
    const data = await staffStore.fetchUnregisteredStaff();
    unregisteredStaff.value = data;
  } catch {
    unregisteredStaff.value = [];
  } finally {
    staffLoading.value = false;
  }
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
  router.push({ name: "login" });
}
</script>