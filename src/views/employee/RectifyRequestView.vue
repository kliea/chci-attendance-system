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
        class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto border border-anito-gray-light overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-anito-gray-light bg-white">
          <div class="flex items-center justify-between">
            <h2
              class="font-display font-light text-lg tracking-wide text-anito-black"
            >
              DTR Rectification Request Form
            </h2>
            <button
              type="button"
              class="text-anito-gray hover:text-anito-black transition-colors"
              aria-label="Close"
              @click="closeRectifyModal"
            >
              ✕
            </button>
          </div>
        </div>
        <form class="p-6 space-y-4" @submit.prevent="submitRequest">
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
                  >FR1: Missed Logged-In</span
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
                  >FR2: Missed Logged-Out</span
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
              class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium"
              @click="closeRectifyModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium disabled:opacity-50"
              :disabled="submitting"
            >
              {{ submitting ? "Submitting…" : "Submit Request" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRectificationsStore } from "@/stores/rectifications.js";
import { useAuthStore } from "@/stores/auth.js";

const rectificationsStore = useRectificationsStore();
const authStore = useAuthStore();

const showRectifyModal = ref(false);

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
  showRectifyModal.value = true;
}

function closeRectifyModal() {
  showRectifyModal.value = false;
  resetForm();
}

async function submitRequest() {
  submitting.value = true;
  submitError.value = "";
  submitSuccess.value = "";

  const requestedIn = form.nature === "time_in" ? form.rectifiedTime : null;
  const requestedOut = form.nature === "time_out" ? form.rectifiedTime : null;

  const result = await rectificationsStore.createRequest({
    userId: authStore.profile?.id,
    attendanceId: null,
    date: form.date,
    reason: form.reason.trim(),
    requestedIn: requestedIn || null,
    requestedOut: requestedOut || null,
  });

  if (result.ok) {
    submitSuccess.value =
      "Your rectification request has been submitted successfully.";
    closeRectifyModal();
    setTimeout(() => {
      submitSuccess.value = "";
    }, 5000);
  } else {
    submitError.value = result.error || "Failed to submit request";
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
