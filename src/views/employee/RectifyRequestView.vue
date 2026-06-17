<template>
  <div class="max-w-4xl">
    <!-- Header -->
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-gray-900">
          Rectify Attendance Request
        </h1>
        <p class="text-gray-600 text-sm mt-2 leading-relaxed">
          Submit corrections for your attendance records.
        </p>
      </div>
      <button
        type="button"
        class="bg-[#003777] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#002555] transition-colors duration-200 shadow-sm"
        @click="openRectifyModal"
      >
        Request Rectification
      </button>
    </div>

    <!-- Alert Messages -->
    <div v-if="submitSuccess" class="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
      {{ submitSuccess }}
    </div>
    <div v-if="submitError" class="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
      {{ submitError }}
    </div>

    <!-- Modal -->
    <div
      v-if="showRectifyModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      @click.self="closeRectifyModal"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-gray-200 bg-white flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">
              DTR Rectification Request
            </h2>
            <p class="text-sm text-gray-600 mt-1">Submit corrections for your attendance</p>
          </div>
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
            @click="closeRectifyModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="px-8 pt-6 border-b border-gray-200 flex gap-2">
          <button
            type="button"
            class="px-4 py-3 text-sm font-medium transition-colors duration-200"
            :class="[
              activeTab === 'request'
                ? 'border-b-2 border-[#003777] text-[#003777]'
                : 'text-gray-600 hover:text-gray-900'
            ]"
            @click="activeTab = 'request'"
          >
            Request
          </button>
          <button
            type="button"
            class="px-4 py-3 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
            :class="[
              activeTab === 'review'
                ? 'border-b-2 border-[#003777] text-[#003777]'
                : 'text-gray-600 hover:text-gray-900'
            ]"
            @click="activeTab = 'review'"
            :disabled="rectifications.length === 0"
          >
            Review
            <span v-if="rectifications.length > 0" class="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-[#003777] rounded-full">
              {{ rectifications.length }}
            </span>
          </button>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto max-h-[60vh]">
          <!-- Request Tab -->
          <form
            v-if="activeTab === 'request'"
            class="p-8 space-y-6"
            @submit.prevent="addRectification"
          >
            <!-- Date Field -->
            <div>
              <label for="rectify-date" class="block text-sm font-medium text-gray-900 mb-2">
                Specified date <span class="text-red-500">*</span>
              </label>
              <input
                id="rectify-date"
                v-model="form.date"
                type="date"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors"
              />
            </div>

            <!-- Nature of Rectification -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-3">
                Nature of rectification <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-6">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="form.nature"
                    type="radio"
                    value="time_in"
                    class="w-4 h-4 border-gray-300 text-[#003777] focus:ring-[#003777]"
                  />
                  <span class="text-sm text-gray-900">Missed Logged-In</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="form.nature"
                    type="radio"
                    value="time_out"
                    class="w-4 h-4 border-gray-300 text-[#003777] focus:ring-[#003777]"
                  />
                  <span class="text-sm text-gray-900">Missed Logged-Out</span>
                </label>
              </div>
            </div>

            <!-- Reason Field -->
            <div>
              <label for="rectify-reason" class="block text-sm font-medium text-gray-900 mb-2">
                Reason <span class="text-red-500">*</span>
              </label>
              <textarea
                id="rectify-reason"
                v-model="form.reason"
                rows="3"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors resize-none"
                placeholder="State the reason for this rectification..."
              />
            </div>

            <!-- Time Field -->
            <div>
              <label for="rectify-time" class="block text-sm font-medium text-gray-900 mb-2">
                Specify rectified time <span class="text-red-500">*</span>
              </label>
              <input
                id="rectify-time"
                v-model="form.rectifiedTime"
                type="time"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                class="px-6 py-2.5 border border-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                @click="closeRectifyModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2.5 bg-[#003777] text-white text-sm font-medium rounded-lg hover:bg-[#002555] transition-colors"
              >
                Add Rectification
              </button>
            </div>
          </form>

          <!-- Review Tab -->
          <div v-else class="p-8">
            <div v-if="rectifications.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-gray-900 font-medium text-sm mt-4">No rectifications added yet</h3>
              <p class="text-gray-600 text-sm mt-1">Add your first rectification to get started</p>
            </div>

            <div v-else class="space-y-6">
              <!-- Review Header -->
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">
                  Review Rectifications
                </h3>
                <div class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <span class="text-xs font-medium text-[#003777]">
                    {{ rectifications.length }}
                    {{ rectifications.length === 1 ? "item" : "items" }}
                  </span>
                </div>
              </div>

              <!-- Review Table -->
              <div class="border border-gray-200 rounded-lg overflow-hidden">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Type</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Time</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Reason</th>
                      <th class="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="(rect, index) in rectifications" :key="rect.id" class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 text-sm font-medium text-gray-900">
                        {{ formatDate(rect.date) }}
                      </td>
                      <td class="px-6 py-4">
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="
                            rect.nature === 'time_in'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          "
                        >
                          {{ rect.nature === "time_in" ? "Time In" : "Time Out" }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm font-medium text-gray-900">
                        {{ rect.rectifiedTime }}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <div class="truncate" :title="rect.reason">{{ rect.reason }}</div>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <button
                          type="button"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          @click="removeRectification(index)"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  class="px-6 py-2.5 border border-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  @click="activeTab = 'request'"
                >
                  Add Another
                </button>
                <button
                  type="button"
                  class="px-6 py-2.5 bg-[#003777] text-white text-sm font-medium rounded-lg hover:bg-[#002555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  :disabled="submitting"
                  @click="submitAllRequests"
                >
                  <svg
                    v-if="!submitting"
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg
                    v-else
                    class="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416" />
                  </svg>
                  {{
                    submitting
                      ? "Submitting…"
                      : `Submit All (${rectifications.length})`
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRectificationsStore } from "@/stores/rectifications.js";
import { useAuthStore } from "@/stores/auth.js";
import { useFormatters } from "@/composables/useFormatters.js";

const rectificationsStore = useRectificationsStore();
const authStore = useAuthStore();
const { formatDate } = useFormatters();

const showRectifyModal = ref(false);
const activeTab = ref("request");
const rectifications = ref([]);

const form = reactive({
  date: "",
  nature: "time_in",
  reason: "",
  rectifiedTime: "",
});

const submitting = ref(false);
const submitError = ref("");
const submitSuccess = ref("");

function openRectifyModal() {
  resetForm();
  submitError.value = "";
  submitSuccess.value = "";
  activeTab.value = "request";
  rectifications.value = [];
  showRectifyModal.value = true;
}

function closeRectifyModal() {
  showRectifyModal.value = false;
  resetForm();
  rectifications.value = [];
  activeTab.value = "request";
}

function addRectification() {
  if (!form.date || !form.reason || !form.rectifiedTime) {
    return;
  }

  rectifications.value.push({
    id: `local-${Date.now()}-${rectifications.value.length}`,
    date: form.date,
    nature: form.nature,
    reason: form.reason.trim(),
    rectifiedTime: form.rectifiedTime,
  });

  resetForm();
  activeTab.value = "review";
}

function removeRectification(index) {
  rectifications.value.splice(index, 1);
}

async function submitAllRequests() {
  if (rectifications.value.length === 0) return;

  submitting.value = true;
  submitError.value = "";
  submitSuccess.value = "";

  try {
    const promises = rectifications.value.map((rect) => {
      const requestedIn = rect.nature === "time_in" ? rect.rectifiedTime : null;
      const requestedOut = rect.nature === "time_out" ? rect.rectifiedTime : null;

      return rectificationsStore.createRequest({
        userId: authStore.profile?.id,
        attendanceId: null,
        date: rect.date,
        reason: rect.reason,
        requestedIn: requestedIn || null,
        requestedOut: requestedOut || null,
      });
    });

    const results = await Promise.all(promises);
    const allSuccessful = results.every((result) => result.ok);

    if (allSuccessful) {
      submitSuccess.value = `Successfully submitted ${rectifications.value.length} rectification request(s).`;
      closeRectifyModal();
      setTimeout(() => {
        submitSuccess.value = "";
      }, 5000);
    } else {
      const failedCount = results.filter((result) => !result.ok).length;
      submitError.value = `Failed to submit ${failedCount} request(s). Please try again.`;
    }
  } catch (error) {
    submitError.value = "An error occurred while submitting requests.";
  }

  submitting.value = false;
}

function resetForm() {
  form.date = "";
  form.nature = "time_in";
  form.reason = "";
  form.rectifiedTime = "";
  rectificationsStore.clearSubmitStatus();
}
</script>