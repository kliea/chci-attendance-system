<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded border border-anito-gray-light p-6">
      <h1 class="text-2xl font-sans font-bold text-anito-black mb-2">
        Attendance Settings
      </h1>
      <p class="text-sm text-anito-gray mb-6">
        Configure work schedules and grace periods for attendance calculations.
      </p>

      <!-- Current Threshold Display -->
      <div class="bg-anito-blue-light/10 border border-anito-blue-mid/30 rounded p-4 mb-6">
        <div class="flex items-center gap-2">
          <svg
            class="w-5 h-5 text-anito-blue-mid"
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
            <div class="text-sm font-sans font-medium text-anito-blue-mid">
              Current Late Threshold
            </div>
            <div class="text-lg font-sans font-bold text-anito-black">
              Employees are marked late after {{ settingsStore.lateThresholdDisplay }}
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Work Start Time -->
        <div>
          <label
            for="work-start-time"
            class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
          >
            Standard Start Time *
          </label>
          <input
            id="work-start-time"
            v-model="form.workStartTime"
            type="time"
            required
            class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full max-w-xs transition-colors"
          />
        </div>

        <!-- Work End Time -->
        <div>
          <label
            for="work-end-time"
            class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
          >
            Standard End Time *
          </label>
          <input
            id="work-end-time"
            v-model="form.workEndTime"
            type="time"
            required
            class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full max-w-xs transition-colors"
          />
        </div>

        <!-- Grace Period -->
        <div>
          <label
            for="grace-period"
            class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
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
            class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full max-w-xs transition-colors"
          />
          <p class="text-xs text-anito-gray mt-2">
            Minutes after start time before employee is marked late
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 pt-4 border-t border-anito-gray-light">
          <button
            type="button"
            class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium"
            @click="resetForm"
            :disabled="submitting"
          >
            Reset
          </button>
          <button
            type="submit"
            class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium"
            :disabled="submitting"
          >
            {{ submitting ? "Saving…" : "Save Settings" }}
          </button>
        </div>
      </form>

      <!-- Success/Error Messages -->
      <div
        v-if="submitSuccess"
        class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded text-sm font-sans mt-4"
      >
        {{ submitSuccess }}
      </div>
      <div
        v-if="submitError"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-sans mt-4"
      >
        {{ submitError }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="settingsStore.loading" class="bg-white rounded border border-anito-gray-light p-8">
      <LoadingBar />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useSettingsStore } from "@/stores/settings.js";
import LoadingBar from "@/components/ui/LoadingBar.vue";

const settingsStore = useSettingsStore();

const form = reactive({
  workStartTime: settingsStore.workStartTime,
  workEndTime: settingsStore.workEndTime,
  gracePeriodMinutes: settingsStore.gracePeriodMinutes,
});

const submitting = ref(false);
const submitSuccess = ref(null);
const submitError = ref(null);

// Watch for settings changes and update form
watch(
  () => settingsStore.settings,
  (newSettings) => {
    form.workStartTime = newSettings.work_start_time || "08:00";
    form.workEndTime = newSettings.work_end_time || "17:00";
    form.gracePeriodMinutes = newSettings.grace_period_minutes || 30;
  },
  { immediate: true }
);

function resetForm() {
  form.workStartTime = settingsStore.workStartTime;
  form.workEndTime = settingsStore.workEndTime;
  form.gracePeriodMinutes = settingsStore.gracePeriodMinutes;
  clearMessages();
}

function clearMessages() {
  submitSuccess.value = null;
  submitError.value = null;
}

async function handleSubmit() {
  submitting.value = true;
  clearMessages();

  try {
    // Update all settings
    const results = await Promise.all([
      settingsStore.updateWorkStartTime(form.workStartTime),
      settingsStore.updateWorkEndTime(form.workEndTime),
      settingsStore.updateGracePeriod(form.gracePeriodMinutes),
    ]);

    // Check if all updates were successful
    const allSuccessful = results.every((result) => result.ok);
    
    if (allSuccessful) {
      submitSuccess.value = "Settings updated successfully";
      // Refresh settings to ensure cache is updated
      await settingsStore.fetchSettings();
    } else {
      const failedResult = results.find((result) => !result.ok);
      submitError.value = `Failed to update settings: ${failedResult.error}`;
    }
  } catch (err) {
    console.error("Error saving settings:", err);
    submitError.value = "Failed to save settings. Please try again.";
  } finally {
    submitting.value = false;
  }
}
</script>
