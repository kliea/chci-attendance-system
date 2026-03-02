<template>
  <div class="max-w-4xl">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1
          class="font-display font-light text-xl tracking-wide text-anito-black"
        >
          Rectify Attendance
        </h1>
        <p
          class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed"
        >
          Request corrections for your attendance records.
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

    <!-- DTR Rectification Request Modal (Step 1: form → Step 2: list + submit) -->
    <div
      v-if="showRectifyModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="closeRectifyModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto border border-anito-gray-light overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div class="px-6 py-4 border-b border-anito-gray-light bg-white shrink-0">
          <div class="flex items-center justify-between">
            <h2
              class="font-display font-light text-lg tracking-wide text-anito-black"
            >
              DTR Rectification Request
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
          <div class="flex gap-2 mt-3">
            <span
              :class="[
                'text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded font-sans font-medium',
                modalStep === 1
                  ? 'bg-anito-black text-white'
                  : 'bg-anito-gray-light text-anito-gray',
              ]"
            >
              Step 1 — Add request
            </span>
            <button
              type="button"
              :class="[
                'text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded font-sans font-medium transition-colors',
                modalStep === 2
                  ? 'bg-anito-black text-white'
                  : rectifications.length
                    ? 'bg-anito-gray-light text-anito-black hover:bg-anito-gray-light/80'
                    : 'bg-anito-gray-light/50 text-anito-gray cursor-default',
              ]"
              :disabled="rectifications.length === 0"
              @click="goToStep2"
            >
              Step 2 — Review & submit ({{ rectifications.length }})
            </button>
          </div>
        </div>

        <!-- Step 1: Rectification form -->
        <form
          v-show="modalStep === 1"
          class="p-6 space-y-4 shrink-0"
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
              class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium"
              @click="closeRectifyModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium"
            >
              Add to list
            </button>
            <button
              v-if="rectifications.length > 0"
              type="button"
              class="border border-anito-blue-mid text-anito-blue-mid text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-light transition-colors duration-150 font-sans font-medium"
              @click="modalStep = 2"
            >
              Review & submit ({{ rectifications.length }})
            </button>
          </div>
        </form>

        <!-- Step 2: List of requests + Submit all -->
        <div
          v-show="modalStep === 2"
          class="p-6 flex flex-col min-h-0 flex-1 overflow-hidden"
        >
          <p class="text-anito-gray text-sm font-sans font-light mb-4">
            Review your rectification requests below, then submit all.
          </p>
          <ul
            class="space-y-2 overflow-y-auto flex-1 min-h-0 border border-anito-gray-light rounded px-3 py-2"
          >
            <li
              v-for="rect in rectifications"
              :key="rect.id"
              class="flex items-start justify-between gap-3 py-2 border-b border-anito-gray-light last:border-0 last:pb-0"
            >
              <div class="min-w-0 text-sm font-sans text-anito-black">
                <span class="font-medium">{{ formatDate(rect.date) }}</span>
                — {{ rect.nature === "time_in" ? "Missed Logged-In" : "Missed Logged-Out" }}
                · {{ rect.rectifiedTime }}
                <p class="text-anito-gray text-xs mt-0.5 truncate" :title="rect.reason">
                  {{ rect.reason }}
                </p>
              </div>
              <button
                type="button"
                class="shrink-0 text-anito-gray hover:text-red-600 transition-colors p-1"
                aria-label="Remove"
                @click="removeRectification(rectifications.indexOf(rect))"
              >
                ✕
              </button>
            </li>
          </ul>
          <div class="flex gap-2 pt-4 border-t border-anito-gray-light mt-4 shrink-0">
            <button
              type="button"
              class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium"
              @click="modalStep = 1"
            >
              Back — Add more
            </button>
            <button
              type="button"
              class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium disabled:opacity-50"
              :disabled="submitting"
              @click="submitAllRequests"
            >
              {{ submitting ? "Submitting…" : `Submit all (${rectifications.length})` }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Previous Requests -->
    <section class="rounded border border-anito-gray-light overflow-hidden">
      <h2
        class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium px-4 py-3 border-b border-anito-gray-light bg-white"
      >
        Your Previous Requests
      </h2>
      <div v-if="loading" class="p-8">
        <LoadingBar />
      </div>
      <div v-else-if="error" class="p-4 text-red-600 text-sm">{{ error }}</div>
      <div v-else-if="!userRequests.length" class="p-8">
        <EmptyState
          title="No previous requests"
          subtitle="No previous requests found."
        />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-anito-black">
            <tr>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Date
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Reason
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in userRequests"
              :key="request.id"
              class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150"
            >
              <td class="px-4 py-3 text-sm font-sans text-anito-black">
                {{ formatDate(request.date) }}
              </td>
              <td
                class="px-4 py-3 text-sm font-sans text-anito-black max-w-xs truncate"
                :title="request.reason"
              >
                {{ request.reason }}
              </td>
              <td class="px-4 py-3">
                <span
                  :class="getStatusClass(request.status)"
                  class="text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded font-sans font-medium"
                >
                  {{ request.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRectificationsStore } from "@/stores/rectifications.js";
import { useAuthStore } from "@/stores/auth.js";
import { useFormatters } from "@/composables/useFormatters.js";
import LoadingBar from "@/components/ui/LoadingBar.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

const rectificationsStore = useRectificationsStore();
const authStore = useAuthStore();
const { formatDate, getStatusClass } = useFormatters();

const showRectifyModal = ref(false);
const modalStep = ref(1); // 1 = form, 2 = review list + submit
const rectifications = ref([]); // list of { date, nature, reason, rectifiedTime }

const form = reactive({
  date: "",
  nature: "time_in",
  reason: "",
  rectifiedTime: "",
});

const userRequests = ref([]);
const loading = ref(false);
const error = ref("");

const submitting = ref(false);
const submitError = ref("");
const submitSuccess = ref("");

function openRectifyModal() {
  modalStep.value = 1;
  rectifications.value = [];
  resetForm();
  submitError.value = "";
  submitSuccess.value = "";
  showRectifyModal.value = true;
}

function closeRectifyModal() {
  showRectifyModal.value = false;
  modalStep.value = 1;
  rectifications.value = [];
  resetForm();
}

function addRectification() {
  if (!form.date || !form.reason?.trim() || !form.rectifiedTime) return;
  rectifications.value.push({
    id: `local-${Date.now()}-${rectifications.value.length}`,
    date: form.date,
    nature: form.nature,
    reason: form.reason.trim(),
    rectifiedTime: form.rectifiedTime,
  });
  form.reason = "";
  form.rectifiedTime = "";
}

function removeRectification(index) {
  rectifications.value.splice(index, 1);
}

function goToStep2() {
  if (rectifications.value.length) modalStep.value = 2;
}

onMounted(async () => {
  await fetchUserRequests();
});

async function fetchUserRequests() {
  if (!authStore.profile?.id) return;

  loading.value = true;
  error.value = "";

  try {
    userRequests.value = await rectificationsStore.fetchUserRequests(
      authStore.profile.id,
    );
  } catch (err) {
    error.value = "Failed to fetch your requests";
  } finally {
    loading.value = false;
  }
}

async function submitAllRequests() {
  if (rectifications.value.length === 0) return;
  submitting.value = true;
  submitError.value = "";
  submitSuccess.value = "";

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

  try {
    const results = await Promise.all(promises);
    const failed = results.filter((r) => !r.ok);
    if (failed.length === 0) {
      submitSuccess.value =
        `Successfully submitted ${rectifications.value.length} rectification request(s).`;
      closeRectifyModal();
      await fetchUserRequests();
      setTimeout(() => {
        submitSuccess.value = "";
      }, 5000);
    } else {
      submitError.value =
        failed.length === results.length
          ? failed[0].error || "Failed to submit requests"
          : `${failed.length} of ${results.length} request(s) failed.`;
    }
  } catch (err) {
    submitError.value = err?.message || "Failed to submit requests";
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  form.date = "";
  form.nature = "time_in";
  form.reason = "";
  form.rectifiedTime = "";
  rectificationsStore.clearSubmitStatus();
}

</script>
