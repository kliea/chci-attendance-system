<template>
  <div class="space-y-6">
    <div class="bg-white rounded border border-gray-100 p-6 shadow-sm">
      <h1 class="text-2xl font-sans font-semibold text-gray-900 mb-2">
        Attendance Settings
      </h1>
      <p class="text-sm text-gray-500 mb-6 font-medium">
        Configure work schedules and grace periods for attendance calculations.
      </p>

      <div v-if="settingsStore.loading" class="p-8 flex justify-center items-center">
        <LoadingBar />
      </div>

      <div v-else>
        <div class="bg-blue-50/50 border border-blue-100 rounded p-4 mb-6">
          <div class="flex items-center gap-2">
            <svg
              class="w-5 h-5 text-[#003777]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <div class="text-sm font-sans font-medium text-[#003777]">
                Current Late Threshold
              </div>
              <div class="text-lg font-sans font-semibold text-gray-900">
                Employees are marked late after {{ settingsStore.lateThresholdDisplay || 'Not Configured' }}
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label
              for="work-start-time"
              class="block text-[10px] tracking-[0.25em] uppercase text-gray-500 font-sans font-medium mb-2"
            >
              Standard Start Time *
            </label>
            <input
              id="work-start-time"
              v-model="form.workStartTime"
              type="time"
              required
              class="border border-gray-200 rounded bg-transparent px-4 py-3 text-sm font-sans text-gray-900 placeholder-gray-400 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] focus:outline-none w-full max-w-xs transition-colors font-medium"
            />
          </div>

          <div>
            <label
              for="work-end-time"
              class="block text-[10px] tracking-[0.25em] uppercase text-gray-500 font-sans font-medium mb-2"
            >
              Standard End Time *
            </label>
            <input
              id="work-end-time"
              v-model="form.workEndTime"
              type="time"
              required
              class="border border-gray-200 rounded bg-transparent px-4 py-3 text-sm font-sans text-gray-900 placeholder-gray-400 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] focus:outline-none w-full max-w-xs transition-colors font-medium"
            />
          </div>

          <div>
            <label
              for="grace-period"
              class="block text-[10px] tracking-[0.25em] uppercase text-gray-500 font-sans font-medium mb-2"
            >
              Grace Period (minutes) *
            </label>
            <input
              id="grace-period"
              v-model.number="form.gracePeriodMinutes"
              type="number"
              min="0"
              max="60"
              required
              class="border border-gray-200 rounded bg-transparent px-4 py-3 text-sm font-sans text-gray-900 placeholder-gray-400 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] focus:outline-none w-full max-w-xs transition-colors font-medium"
            />
            <p class="text-xs text-gray-500 mt-2 font-medium">
              Minutes after start time before employee is marked late
            </p>
          </div>

          <div class="flex gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              class="border border-gray-200 text-gray-700 text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-gray-50 transition-colors duration-150 font-sans font-medium disabled:opacity-50"
              @click="resetForm"
              :disabled="submitting"
            >
              Reset
            </button>
            <button
              type="submit"
              class="bg-[#003777] text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-[#002555] transition-colors duration-150 font-sans font-medium disabled:opacity-50 shadow-sm"
              :disabled="submitting"
            >
              {{ submitting ? "Saving…" : "Save Settings" }}
            </button>
          </div>
        </form>

        <div
          v-if="submitSuccess"
          class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded text-sm font-sans font-medium mt-4"
        >
          {{ submitSuccess }}
        </div>
        <div
          v-if="submitError"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-sans font-medium mt-4"
        >
          {{ submitError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useSettingsStore } from "@/stores/settings.js";
import LoadingBar from "@/components/ui/LoadingBar.vue";

const settingsStore = useSettingsStore();

const form = reactive({
  workStartTime: "08:00",
  workEndTime: "17:00",
  gracePeriodMinutes: 15,
});

const submitting = ref(false);
const submitSuccess = ref(null);
const submitError = ref(null);

// Safe mapping function to extract data out of store keys cleanly
function syncStoreToForm() {
  form.workStartTime = settingsStore.workStartTime || "08:00";
  form.workEndTime = settingsStore.workEndTime || "17:00";
  // Fallback to 0 if gracePeriodMinutes is falsy but numerical
  form.gracePeriodMinutes = settingsStore.gracePeriodMinutes !== undefined ? settingsStore.gracePeriodMinutes : 15;
}

// Watch computed/direct store properties instead of structural objects to avoid deep reference runtime failures
watch(
  [
    () => settingsStore.workStartTime,
    () => settingsStore.workEndTime,
    () => settingsStore.gracePeriodMinutes
  ],
  () => {
    syncStoreToForm();
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    if (typeof settingsStore.fetchSettings === "function") {
      await settingsStore.fetchSettings();
      syncStoreToForm();
    }
  } catch (err) {
    console.error("Failed to load initial settings:", err);
  }
});

function resetForm() {
  syncStoreToForm();
  clearMessages();
}

function clearMessages() {
  submitSuccess.value = null;
  submitError.value = null;
}

async function handleSubmit() {
  if (submitting.value) return;
  
  submitting.value = true;
  clearMessages();

  try {
    // Check if store has a single comprehensive backend save action (Cleaner engineering pattern)
    if (typeof settingsStore.updateAllSettings === "function") {
      const result = await settingsStore.updateAllSettings({
        workStartTime: form.workStartTime,
        workEndTime: form.workEndTime,
        gracePeriodMinutes: form.gracePeriodMinutes,
      });
      
      if (result?.ok) {
        submitSuccess.value = "Settings updated successfully";
      } else {
        throw new Error(result?.error || "Unknown server validation error");
      }
    } else {
      // Fallback: Handle multi-endpoint endpoints safely 
      const results = await Promise.all([
        settingsStore.updateWorkStartTime?.(form.workStartTime),
        settingsStore.updateWorkEndTime?.(form.workEndTime),
        settingsStore.updateGracePeriod?.(form.gracePeriodMinutes),
      ]);

      const allSuccessful = results.every((res) => res && res.ok);

      if (allSuccessful) {
        submitSuccess.value = "Settings updated successfully";
        if (typeof settingsStore.fetchSettings === "function") {
          await settingsStore.fetchSettings();
        }
      } else {
        const failedResult = results.find((res) => !res || !res.ok);
        submitError.value = `Failed to update settings: ${failedResult?.error || 'Server error configuration value rejected.'}`;
      }
    }
  } catch (err) {
    console.error("Error saving settings:", err);
    submitError.value = err.message || "Failed to save settings. Please try again.";
  } finally {
    submitting.value = false;
  }
}
</script>