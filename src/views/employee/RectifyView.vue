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
        <div
          class="px-6 py-4 border-b border-anito-gray-light bg-white shrink-0"
        >
          <div class="flex items-center justify-between">
            <h2
              class="font-display font-light text-lg tracking-wide text-anito-black"
            >
              {{
                editingRequest
                  ? "Edit DTR Rectification Request"
                  : "DTR Rectification Request Form"
              }}
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
          <!-- When editing, show single "Editing request" state; when adding, show Step 1 / Step 2 -->
          <div v-if="editingRequest" class="flex gap-2 mt-3">
            <span
              class="text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded font-sans font-medium bg-anito-black text-white"
            >
              Editing request
            </span>
          </div>
          <div v-else class="flex gap-2 mt-3">
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
          @submit.prevent="
            editingRequest ? submitEditRequest() : addRectification()
          "
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
              {{ editingRequest ? "Update Request" : "Add to list" }}
            </button>
            <button
              v-if="!editingRequest && rectifications.length > 0"
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
                —
                {{
                  rect.nature === "time_in"
                    ? "Missed Logged-In"
                    : "Missed Logged-Out"
                }}
                · {{ rect.rectifiedTime }}
                <p
                  class="text-anito-gray text-xs mt-0.5 truncate"
                  :title="rect.reason"
                >
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
          <div
            class="flex gap-2 pt-4 border-t border-anito-gray-light mt-4 shrink-0"
          >
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
              {{
                submitting
                  ? "Submitting…"
                  : `Submit all (${rectifications.length})`
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Previous Requests -->
    <section class="rounded border border-anito-gray-light overflow-hidden">
      <div
        class="flex flex-col gap-2 px-4 py-3 border-b border-anito-gray-light bg-white"
      >
        <h2
          class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium"
        >
          Your Previous Requests
        </h2>
        <div class="flex flex-wrap gap-2 text-xs font-sans">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px]"
            :class="
              statusFilter === 'all'
                ? 'bg-anito-black text-white border-anito-black'
                : 'border-anito-gray-light text-anito-black hover:border-anito-black'
            "
            @click="statusFilter = 'all'"
          >
            All
            <span class="text-[10px] px-1 rounded-full bg-anito-gray-light">
              {{ userRequests.length }}
            </span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px]"
            :class="
              statusFilter === 'pending'
                ? 'bg-anito-black text-white border-anito-black'
                : 'border-anito-gray-light text-anito-black hover:border-anito-black'
            "
            @click="statusFilter = 'pending'"
          >
            Pending
            <span class="text-[10px] px-1 rounded-full bg-anito-gray-light">
              {{ pendingCount }}
            </span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px]"
            :class="
              statusFilter === 'approved'
                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500'
                : 'border-anito-gray-light text-anito-black hover:border-emerald-500'
            "
            @click="statusFilter = 'approved'"
          >
            Approved
            <span class="text-[10px] px-1 rounded-full bg-emerald-100 text-emerald-700">
              {{ approvedCount }}
            </span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px]"
            :class="
              statusFilter === 'rejected'
                ? 'bg-red-500/10 text-red-700 border-red-500'
                : 'border-anito-gray-light text-anito-black hover:border-red-500'
            "
            @click="statusFilter = 'rejected'"
          >
            Rejected
            <span class="text-[10px] px-1 rounded-full bg-red-100 text-red-700">
              {{ rejectedCount }}
            </span>
          </button>
        </div>
      </div>
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
                v-if="statusFilter === 'pending'"
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Nature of rectification
              </th>
              <th
                v-if="statusFilter === 'pending'"
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Specified rectified time
              </th>
              <th
                v-if="statusFilter === 'all'"
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Status
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-center"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in filteredUserRequests"
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
              <td
                v-if="statusFilter === 'pending'"
                class="px-4 py-3 text-sm font-sans text-anito-black"
              >
                {{
                  request.requested_in
                    ? "Missed Logged-In"
                    : "Missed Logged-Out"
                }}
              </td>
              <td
                v-if="statusFilter === 'pending'"
                class="px-4 py-3 text-sm font-sans text-anito-black"
              >
                {{ request.requested_in || request.requested_out || "—" }}
              </td>
              <td v-if="statusFilter === 'all'" class="px-4 py-3">
                <span
                  :class="getStatusClass(request.status)"
                  class="text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded font-sans font-medium"
                >
                  {{ request.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2 justify-center">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-anito-black hover:bg-anito-gray-light rounded transition-all duration-150 disabled:text-anito-gray disabled:cursor-not-allowed"
                    @click="editRequest(request)"
                    :disabled="request.status !== 'pending'"
                  >
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-anito-black hover:bg-anito-gray-light rounded transition-all duration-150 disabled:text-anito-gray disabled:cursor-not-allowed"
                    @click="openDeleteModal(request)"
                    :disabled="request.status !== 'pending'"
                  >
                    <svg
                      class="w-3 h-3"
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
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="closeDeleteModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto border border-anito-gray-light overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-anito-gray-light bg-white">
          <div class="flex items-center justify-between">
            <h2
              class="font-display font-light text-lg tracking-wide text-anito-black"
            >
              Confirm Delete
            </h2>
            <button
              type="button"
              class="text-anito-gray hover:text-anito-black transition-colors"
              aria-label="Close"
              @click="closeDeleteModal"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="p-6">
          <p class="text-sm font-sans text-anito-black mb-4">
            Are you sure you want to delete this rectification request?
          </p>
          <p class="text-xs font-sans text-anito-gray mb-6">
            This action cannot be undone.
          </p>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium"
              @click="closeDeleteModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-gray transition-colors duration-150 font-sans font-medium"
              :disabled="deleting"
              @click="confirmDelete"
            >
              {{ deleting ? "Deleting…" : "Delete" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
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
const statusFilter = ref("all");

const pendingCount = computed(
  () => userRequests.value.filter((r) => r.status === "pending").length,
);
const approvedCount = computed(
  () => userRequests.value.filter((r) => r.status === "approved").length,
);
const rejectedCount = computed(
  () => userRequests.value.filter((r) => r.status === "rejected").length,
);

const filteredUserRequests = computed(() => {
  if (statusFilter.value === "all") return userRequests.value;
  return userRequests.value.filter((r) => r.status === statusFilter.value);
});
const loading = ref(false);
const error = ref("");

const submitting = ref(false);
const submitError = ref("");
const submitSuccess = ref("");
const editingRequest = ref(null);
const showDeleteModal = ref(false);
const deletingRequest = ref(null);
const deleting = ref(false);

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
  editingRequest.value = null;
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

function resetForm() {
  form.date = "";
  form.nature = "time_in";
  form.reason = "";
  form.rectifiedTime = "";
  rectificationsStore.clearSubmitStatus();
}

async function submitEditRequest() {
  if (!editingRequest.value) return;

  submitting.value = true;
  submitError.value = "";
  submitSuccess.value = "";

  const requestedIn = form.nature === "time_in" ? form.rectifiedTime : null;
  const requestedOut = form.nature === "time_out" ? form.rectifiedTime : null;

  const requestData = {
    userId: authStore.profile?.id,
    attendanceId: null,
    date: form.date,
    reason: form.reason.trim(),
    requestedIn: requestedIn || null,
    requestedOut: requestedOut || null,
  };

  // Debug logging
  console.log("Editing request object:", editingRequest.value);
  console.log("Request ID being passed:", editingRequest.value.id);

  const result = await rectificationsStore.updateRequest(
    editingRequest.value.id,
    requestData,
  );

  if (result.ok) {
    submitSuccess.value =
      "Your rectification request has been updated successfully.";
    closeRectifyModal();
    await fetchUserRequests();
    setTimeout(() => {
      submitSuccess.value = "";
    }, 5000);
  } else {
    submitError.value = result.error || "Failed to update request";
  }

  submitting.value = false;
}

async function submitAllRequests() {
  // Handle edit case - direct submission of single edited request
  if (editingRequest.value) {
    submitting.value = true;
    submitError.value = "";
    submitSuccess.value = "";

    const requestedIn = form.nature === "time_in" ? form.rectifiedTime : null;
    const requestedOut = form.nature === "time_out" ? form.rectifiedTime : null;

    const requestData = {
      userId: authStore.profile?.id,
      attendanceId: null,
      date: form.date,
      reason: form.reason.trim(),
      requestedIn: requestedIn || null,
      requestedOut: requestedOut || null,
    };

    const result = await rectificationsStore.updateRequest(
      editingRequest.value.id,
      requestData,
    );

    if (result.ok) {
      submitSuccess.value =
        "Your rectification request has been updated successfully.";
      closeRectifyModal();
      await fetchUserRequests();
      setTimeout(() => {
        submitSuccess.value = "";
      }, 5000);
    } else {
      submitError.value = result.error || "Failed to update request";
    }

    submitting.value = false;
    return;
  }

  // Handle create case - multiple rectifications
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

  const results = await Promise.all(promises);

  // Check if all were successful
  const allSuccessful = results.every((result) => result.ok);

  if (allSuccessful) {
    submitSuccess.value = `Successfully submitted ${rectifications.value.length} rectification request(s).`;
    closeRectifyModal();
    await fetchUserRequests();
    setTimeout(() => {
      submitSuccess.value = "";
    }, 5000);
  } else {
    const failedCount = results.filter((result) => !result.ok).length;
    submitError.value = `Failed to submit ${failedCount} request(s). Please try again.`;
  }

  submitting.value = false;
}

function editRequest(request) {
  if (request.status !== "pending") return;

  // Debug logging
  console.log("Edit request called with:", request);

  editingRequest.value = request;
  form.date = request.date;
  form.reason = request.reason;
  form.nature = request.requested_in ? "time_in" : "time_out";
  form.rectifiedTime = request.requested_in || request.requested_out || "";

  // For editing, skip the multi-step flow and go directly to single submit mode
  modalStep.value = 1;
  rectifications.value = []; // Clear any existing rectifications
  showRectifyModal.value = true;
}

function openDeleteModal(request) {
  if (request.status !== "pending") return;

  deletingRequest.value = request;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  deletingRequest.value = null;
}

async function confirmDelete() {
  if (!deletingRequest.value) return;

  deleting.value = true;

  try {
    const result = await rectificationsStore.deleteRequest(
      deletingRequest.value.id,
    );
    if (result.ok) {
      submitSuccess.value = "Request deleted successfully.";
      closeDeleteModal();
      await fetchUserRequests();
      setTimeout(() => {
        submitSuccess.value = "";
      }, 3000);
    } else {
      submitError.value = result.error || "Failed to delete request";
    }
  } catch (error) {
    submitError.value = "An error occurred while deleting the request.";
  } finally {
    deleting.value = false;
  }
}
</script>
