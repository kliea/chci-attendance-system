<!-- TODO: wire to router -->
<template>
  <div class="max-w-4xl">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1
          class="font-display font-light text-xl tracking-wide text-anito-black"
        >
          Rectify Attendance Request
        </h1>
        <p
          class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed"
        >
          Submit corrections for your attendance records.
        </p>
      </div>
      <button
        type="button"
        class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium"
        @click="openRectifyModal"
      >
        Request Rectification
      </button>
    </header>

    <!-- Success/error messages (outside modal) -->
    <div
      v-if="submitSuccess"
      class="mb-4 p-3 rounded bg-green-50 text-green-800 text-sm font-sans"
    >
      {{ submitSuccess }}
    </div>
    <div
      v-if="submitError"
      class="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm font-sans"
    >
      {{ submitError }}
    </div>

    <!-- DTR Rectification Request Modal -->
    <div
      v-if="showRectifyModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="closeRectifyModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto border border-anito-gray-light overflow-hidden"
      >
        <div class="px-5 py-3 border-b border-anito-gray-light bg-white">
          <div class="flex items-center justify-between">
            <h2
              class="font-display font-light text-base tracking-wide text-anito-black"
            >
              DTR Rectification Request Form
            </h2>
            <button
              type="button"
              class="text-anito-gray hover:text-anito-black transition-colors text-sm"
              aria-label="Close"
              @click="closeRectifyModal"
            >
              ✕
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex gap-3 mt-3">
            <button
              type="button"
              :class="[
                'text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded font-sans font-medium transition-colors duration-150',
                activeTab === 'request'
                  ? 'bg-anito-black text-white'
                  : 'border border-anito-gray-light text-anito-black hover:border-anito-black',
              ]"
              @click="activeTab = 'request'"
            >
              Request
            </button>
            <button
              type="button"
              :class="[
                'text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded font-sans font-medium transition-colors duration-150',
                activeTab === 'review'
                  ? 'bg-anito-black text-white'
                  : 'border border-anito-gray-light text-anito-black hover:border-anito-black',
              ]"
              @click="activeTab = 'review'"
              :disabled="rectifications.length === 0"
            >
              Review ({{ rectifications.length }})
            </button>
          </div>
        </div>
        <!-- Request Tab -->
        <form
          v-if="activeTab === 'request'"
          class="p-6 space-y-4"
          @submit.prevent="addRectification"
        >
          <div>
            <label
              for="rectify-date"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
            >
              Specified date/s *
            </label>
            <input
              id="rectify-date"
              v-model="form.date"
              type="date"
              required
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
            />
          </div>

          <div>
            <span
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
            >
              Nature of rectification *
            </span>
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.nature"
                  type="radio"
                  value="time_in"
                  class="text-anito-blue-mid focus:ring-anito-blue-mid"
                />
                <span class="text-sm font-sans text-anito-black"
                  >Missed Logged-In</span
                >
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.nature"
                  type="radio"
                  value="time_out"
                  class="text-anito-blue-mid focus:ring-anito-blue-mid"
                />
                <span class="text-sm font-sans text-anito-black"
                  >Missed Logged-Out</span
                >
              </label>
            </div>
          </div>

          <div>
            <label
              for="rectify-reason"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
            >
              Reason/s *
            </label>
            <textarea
              id="rectify-reason"
              v-model="form.reason"
              rows="3"
              required
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors resize-none"
              placeholder="State the reason for this rectification..."
            />
          </div>

          <div>
            <label
              for="rectify-time"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
            >
              Specify rectified time *
            </label>
            <input
              id="rectify-time"
              v-model="form.rectifiedTime"
              type="time"
              required
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
            />
          </div>

          <div class="flex gap-2 pt-2 border-t border-anito-gray-light pt-4">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-6 py-3 border border-anito-gray-light text-anito-black text-[11px] tracking-[0.2em] uppercase font-medium rounded hover:border-anito-black hover:bg-anito-gray-light/50 transition-all duration-150 shadow-sm"
              @click="closeRectifyModal"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-2 bg-anito-blue-mid text-white text-[11px] tracking-[0.2em] uppercase font-medium px-6 py-3 rounded hover:bg-anito-blue-deep transition-all duration-150 shadow-sm"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Add Rectification
            </button>
          </div>
        </form>

        <!-- Review Tab -->
        <div v-else-if="activeTab === 'review'" class="p-4">
          <EmptyState
            v-if="rectifications.length === 0"
            title="No rectifications added yet"
            subtitle="Add your first rectification to get started"
          />

          <div v-else class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-display font-light text-anito-black">
                Review Rectifications
              </h3>
              <div
                class="flex items-center gap-1.5 px-2 py-1 bg-anito-blue-mid/10 rounded-full"
              >
                <svg
                  class="w-3.5 h-3.5 text-anito-blue-mid"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span class="text-xs font-medium text-anito-blue-mid"
                  >{{ rectifications.length }}
                  {{ rectifications.length === 1 ? "item" : "items" }}</span
                >
              </div>
            </div>

            <!-- Review Table -->
            <div
              class="border border-anito-blue-mid/20 rounded-lg overflow-hidden shadow-sm"
            >
              <table class="w-full">
                <thead
                  class="bg-anito-blue-mid/5 border-b border-anito-blue-mid/10"
                >
                  <tr>
                    <th
                      class="text-left px-4 py-2.5 text-[10px] font-display font-light text-anito-black uppercase tracking-[0.15em]"
                    >
                      Date
                    </th>
                    <th
                      class="text-left px-4 py-2.5 text-[10px] font-display font-light text-anito-black uppercase tracking-[0.15em]"
                    >
                      Type
                    </th>
                    <th
                      class="text-left px-4 py-2.5 text-[10px] font-display font-light text-anito-black uppercase tracking-[0.15em]"
                    >
                      Time
                    </th>
                    <th
                      class="text-left px-4 py-2.5 text-[10px] font-display font-light text-anito-black uppercase tracking-[0.15em]"
                    >
                      Reason
                    </th>
                    <th
                      class="text-center px-4 py-2.5 text-[10px] font-display font-light text-anito-black uppercase tracking-[0.15em]"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-anito-blue-mid/10">
                  <tr
                    v-for="rect in rectifications"
                    :key="rect.id"
                    class="bg-white hover:bg-anito-blue-mid/5 transition-colors duration-150"
                  >
                    <td
                      class="px-4 py-2.5 text-xs font-medium text-anito-black"
                    >
                      {{ formatDate(rect.date) }}
                    </td>
                    <td class="px-4 py-2.5">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                        :class="
                          rect.nature === 'time_in'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        "
                      >
                        <svg
                          class="w-2.5 h-2.5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            v-if="rect.nature === 'time_in'"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          ></path>
                          <path
                            v-else
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 7l4 4m0 0l-4 4m4-4H7"
                          ></path>
                        </svg>
                        {{ rect.nature === "time_in" ? "Time In" : "Time Out" }}
                      </span>
                    </td>
                    <td
                      class="px-4 py-2.5 text-xs font-medium text-anito-black"
                    >
                      {{ rect.rectifiedTime }}
                    </td>
                    <td
                      class="px-4 py-2.5 text-xs text-anito-gray max-w-xs"
                      :title="rect.reason"
                    >
                      <div class="truncate font-medium">{{ rect.reason }}</div>
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-150"
                        @click="removeRectification(rectifications.indexOf(rect))"
                      >
                        <svg
                          class="w-2.5 h-2.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                        Remove
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2 pt-1">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-4 py-2 border border-anito-gray-light text-anito-black text-[10px] tracking-[0.15em] uppercase font-medium rounded-lg hover:border-anito-black hover:bg-anito-gray-light/50 transition-all duration-150 shadow-sm"
                @click="activeTab = 'request'"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Add Another
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-anito-black text-white text-[10px] tracking-[0.15em] uppercase font-medium rounded-lg hover:bg-anito-blue-deep transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="submitting"
                @click="submitAllRequests"
              >
                <svg
                  v-if="!submitting"
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="w-3.5 h-3.5 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke-width="2"
                    stroke-dasharray="31.416"
                    stroke-dashoffset="31.416"
                    class="animate-spin"
                    style="transform-origin: center"
                  ></circle>
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
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRectificationsStore } from "@/stores/rectifications.js";
import { useAuthStore } from "@/stores/auth.js";
import { useFormatters } from "@/composables/useFormatters.js";
import EmptyState from "@/components/ui/EmptyState.vue";

const rectificationsStore = useRectificationsStore();
const authStore = useAuthStore();
const { formatDate } = useFormatters();

const showRectifyModal = ref(false);
const activeTab = ref("request"); // 'request' | 'review'
const rectifications = ref([]); // Array to store multiple rectifications

const form = reactive({
  date: "",
  nature: "time_in", // 'time_in' | 'time_out' (FR1 / FR2)
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
  // Validate form
  if (!form.date || !form.reason || !form.rectifiedTime) {
    return;
  }

  // Add to rectifications array
  rectifications.value.push({
    id: `local-${Date.now()}-${rectifications.value.length}`,
    date: form.date,
    nature: form.nature,
    reason: form.reason.trim(),
    rectifiedTime: form.rectifiedTime,
  });

  // Reset form and switch to review tab
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
    // Submit all rectifications
    const promises = rectifications.value.map((rect) => {
      const requestedIn = rect.nature === "time_in" ? rect.rectifiedTime : null;
      const requestedOut =
        rect.nature === "time_out" ? rect.rectifiedTime : null;

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

    // Check if all were successful
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
