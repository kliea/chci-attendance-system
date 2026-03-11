<template>
  <div class="max-w-4xl">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1
          class="font-display font-light text-xl tracking-wide text-anito-black"
        >
          Request Overtime
        </h1>
        <p
          class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed"
        >
          Submit overtime work requests for approval.
        </p>
      </div>
      <button
        type="button"
        class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium"
        @click="openOvertimeModal"
      >
        Request Overtime
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

    <!-- Overtime Request Modal -->
    <div
      v-if="showOvertimeModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="closeOvertimeModal"
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
                  ? "Edit Overtime Request"
                  : "Overtime Request Form"
              }}
            </h2>
            <button
              type="button"
              class="text-anito-gray hover:text-anito-black transition-colors"
              aria-label="Close"
              @click="closeOvertimeModal"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Overtime form -->
        <form
          class="p-6 space-y-4 shrink-0 overflow-y-auto"
          @submit.prevent="
            editingRequest ? submitEditRequest() : submitOvertimeRequest()
          "
        >
          <div>
            <label
              for="overtime-date"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
            >
              Overtime Date *
            </label>
            <input
              id="overtime-date"
              v-model="form.date"
              type="date"
              required
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="start-time"
                class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
              >
                Start Time *
              </label>
              <input
                id="start-time"
                v-model="form.startTime"
                type="time"
                required
                class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              />
            </div>
            <div>
              <label
                for="end-time"
                class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
              >
                End Time *
              </label>
              <input
                id="end-time"
                v-model="form.endTime"
                type="time"
                required
                class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              for="overtime-reason"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
            >
              Reason for Overtime *
            </label>
            <textarea
              id="overtime-reason"
              v-model="form.reason"
              rows="3"
              required
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors resize-none"
              placeholder="Describe the work that requires overtime..."
            />
          </div>

          <div>
            <label
              for="overtime-type"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
            >
              Overtime Type *
            </label>
            <select
              id="overtime-type"
              v-model="form.type"
              required
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
            >
              <option value="">Select type</option>
              <option value="regular">Regular Overtime</option>
              <option value="weekend">Weekend Work</option>
              <option value="holiday">Holiday Work</option>
            </select>
          </div>

          <div class="flex gap-2 pt-2 border-t border-anito-gray-light pt-4">
            <button
              type="button"
              class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium"
              @click="closeOvertimeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium"
              :disabled="submitting"
            >
              {{
                submitting
                  ? "Submitting…"
                  : editingRequest
                    ? "Update Request"
                    : "Submit Request"
              }}
            </button>
          </div>
        </form>
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
          Your Overtime Requests
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
            <span
              class="text-[10px] px-1 rounded-full bg-emerald-100 text-emerald-700"
            >
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
          title="No overtime requests"
          subtitle="You haven't submitted any overtime requests yet."
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
                Time
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Type
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Reason
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
              <td class="px-4 py-3 text-sm font-sans text-anito-black">
                {{ request.start_time }} - {{ request.end_time }}
              </td>
              <td class="px-4 py-3 text-sm font-sans text-anito-black">
                <span class="capitalize">{{
                  request.type.replace("_", " ")
                }}</span>
              </td>
              <td
                class="px-4 py-3 text-sm font-sans text-anito-black max-w-xs truncate"
                :title="request.reason"
              >
                {{ request.reason }}
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
            Are you sure you want to delete this overtime request?
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
import { useAuthStore } from "@/stores/auth.js";
import { useOvertimeStore } from "@/stores/overtime.js";
import { useFormatters } from "@/composables/useFormatters.js";
import LoadingBar from "@/components/ui/LoadingBar.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

const authStore = useAuthStore();
const overtimeStore = useOvertimeStore();
const { formatDate, getStatusClass } = useFormatters();

const showOvertimeModal = ref(false);
const showDeleteModal = ref(false);
const editingRequest = ref(null);
const deletingRequest = ref(null);

const form = reactive({
  date: "",
  startTime: "",
  endTime: "",
  reason: "",
  type: "",
});

const userRequests = ref([]);
const statusFilter = ref("all");
const loading = computed(() => overtimeStore.loading);
const error = computed(() => overtimeStore.error);
const submitting = computed(() => overtimeStore.submitting);
const submitError = computed(() => overtimeStore.submitError);
const submitSuccess = computed(() => overtimeStore.submitSuccess);
const deleting = ref(false);

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

function openOvertimeModal() {
  showOvertimeModal.value = true;
  overtimeStore.clearSubmitStatus();
  resetForm();
}

function closeOvertimeModal() {
  showOvertimeModal.value = false;
  editingRequest.value = null;
  resetForm();
}

function resetForm() {
  form.date = "";
  form.startTime = "";
  form.endTime = "";
  form.reason = "";
  form.type = "";
}

async function submitOvertimeRequest() {
  if (
    !form.date ||
    !form.startTime ||
    !form.endTime ||
    !form.reason?.trim() ||
    !form.type
  ) {
    return;
  }

  const result = await overtimeStore.createRequest({
    userId: authStore.profile?.id,
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    reason: form.reason.trim(),
    type: form.type,
  });

  if (result.ok) {
    closeOvertimeModal();
    await fetchUserRequests();
    setTimeout(() => {
      overtimeStore.clearSubmitStatus();
    }, 5000);
  }
}

async function submitEditRequest() {
  if (!editingRequest.value) return;

  const result = await overtimeStore.updateRequest(editingRequest.value.id, {
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    reason: form.reason.trim(),
    type: form.type,
  });

  if (result.ok) {
    closeOvertimeModal();
    await fetchUserRequests();
    setTimeout(() => {
      overtimeStore.clearSubmitStatus();
    }, 5000);
  }
}

function editRequest(request) {
  if (request.status !== "pending") return;

  editingRequest.value = request;
  form.date = request.date;
  form.startTime = request.start_time;
  form.endTime = request.end_time;
  form.reason = request.reason;
  form.type = request.type;

  showOvertimeModal.value = true;
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
    const result = await overtimeStore.deleteRequest(deletingRequest.value.id);

    if (result.ok) {
      closeDeleteModal();
      await fetchUserRequests();
      setTimeout(() => {
        overtimeStore.clearSubmitStatus();
      }, 3000);
    }
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  await fetchUserRequests();
});

async function fetchUserRequests() {
  if (!authStore.profile?.id) return;

  userRequests.value = await overtimeStore.fetchUserRequests(
    authStore.profile.id,
  );
}
</script>
