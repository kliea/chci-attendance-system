<template>
    <div class="max-w-6xl mx-auto bg-[#ffffff] font-sans antialiased rounded-lg min-h-screen p-8">
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-gray-600 text-sm mt-2 leading-relaxed">
          Submit overtime work requests for approval.
        </p>
      </div>
      <button
        type="button"
        class="bg-[#003777] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#002555] transition-colors duration-200 shadow-sm"
        @click="openOvertimeModal"
      >
        Request Overtime
      </button>
    </div>

    <div v-if="submitSuccess" class="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
      {{ submitSuccess }}
    </div>
    <div v-if="submitError" class="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
      {{ submitError }}
    </div>

    <div
      v-if="showOvertimeModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      @click.self="closeOvertimeModal"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-8 py-6 border-b border-gray-200 bg-white shrink-0">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ editingRequest ? "Edit Overtime Request" : "Overtime Request Form" }}
              </h2>
              <p class="text-sm text-gray-600 mt-1">
                {{ editingRequest ? "Update your overtime request" : "Submit your overtime work request" }}
              </p>
            </div>
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
              @click="closeOvertimeModal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form
          class="p-8 space-y-6 overflow-y-auto flex-1"
          @submit.prevent="editingRequest ? submitEditRequest() : submitOvertimeRequest()"
        >
          <div>
            <label for="overtime-date" class="block text-sm font-medium text-gray-900 mb-2">
              Overtime Date <span class="text-red-500">*</span>
            </label>
            <input
              id="overtime-date"
              v-model="form.date"
              type="date"
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="start-time" class="block text-sm font-medium text-gray-900 mb-2">
                Start Time <span class="text-red-500">*</span>
              </label>
              <input
                id="start-time"
                v-model="form.startTime"
                type="time"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors"
              />
            </div>
            <div>
              <label for="end-time" class="block text-sm font-medium text-gray-900 mb-2">
                End Time <span class="text-red-500">*</span>
              </label>
              <input
                id="end-time"
                v-model="form.endTime"
                type="time"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors"
              />
            </div>
          </div>

          <div>
            <label for="overtime-type" class="block text-sm font-medium text-gray-900 mb-2">
              Overtime Type <span class="text-red-500">*</span>
            </label>
            <select
              id="overtime-type"
              v-model="form.type"
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors"
            >
              <option value="">Select type</option>
              <option value="regular">Regular Overtime</option>
              <option value="weekend">Weekend Work</option>
              <option value="holiday">Holiday Work</option>
            </select>
          </div>

          <div>
            <label for="overtime-reason" class="block text-sm font-medium text-gray-900 mb-2">
              Reason for Overtime <span class="text-red-500">*</span>
            </label>
            <textarea
              id="overtime-reason"
              v-model="form.reason"
              rows="3"
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors resize-none"
              placeholder="Describe the work that requires overtime..."
            />
          </div>

          <div class="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              class="px-6 py-2.5 border border-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              @click="closeOvertimeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 bg-[#003777] text-white text-sm font-medium rounded-lg hover:bg-[#002555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="submitting"
            >
              {{ submitting ? "Submitting…" : editingRequest ? "Update Request" : "Submit Request" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <section class="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div class="px-8 py-6 border-b border-gray-200 bg-gray-50">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Your Overtime Requests</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in [
              { value: 'all', label: 'All', count: userRequests.length },
              { value: 'pending', label: 'Pending', count: pendingCount },
              { value: 'approved', label: 'Approved', count: approvedCount },
              { value: 'rejected', label: 'Rejected', count: rejectedCount },
            ]"
            :key="filter.value"
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            :class="
              statusFilter === filter.value
                ? filter.value === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : filter.value === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-[#003777] text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
            "
            @click="statusFilter = filter.value"
          >
            {{ filter.label }}
            <span
              class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold"
              :class="statusFilter === filter.value ? 'bg-white/30' : 'bg-gray-200 text-gray-700'"
            >
              {{ filter.count }}
            </span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block">
          <div class="w-8 h-8 border-4 border-gray-200 border-t-[#003777] rounded-full animate-spin"></div>
        </div>
      </div>

      <div v-else-if="error" class="p-8">
        <div class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {{ error }}
        </div>
      </div>

      <div v-else-if="!userRequests.length" class="p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-gray-900 font-medium text-sm mt-4">No overtime requests</h3>
        <p class="text-gray-600 text-sm mt-1">You haven't submitted any overtime requests yet.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[#003777]">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Date</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Time</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Type</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Reason</th>
              <th v-if="statusFilter === 'all'" class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Status</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="request in filteredUserRequests"
              :key="request.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ formatDate(request.date) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ request.startTime || request.start_time }} - {{ request.endTime || request.end_time }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <span class="capitalize">{{ request.type ? request.type.replace("_", " ") : "" }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" :title="request.reason">
                {{ request.reason }}
              </td>
              <td v-if="statusFilter === 'all'" class="px-6 py-4">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                  :class="
                    request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                  "
                >
                  {{ request.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 justify-center">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="editRequest(request)"
                    :disabled="request.status !== 'pending'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 hover:text-red-900 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="openDeleteModal(request)"
                    :disabled="request.status !== 'pending'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      @click.self="closeDeleteModal"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div class="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Confirm Delete</h2>
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
            @click="closeDeleteModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-8">
          <p class="text-sm text-gray-900 mb-2">
            Are you sure you want to delete this overtime request?
          </p>
          <p class="text-xs text-gray-600 mb-8">
            This action cannot be undone.
          </p>
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              @click="closeDeleteModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

const authStore = useAuthStore();
const overtimeStore = useOvertimeStore();
const { formatDate } = useFormatters();

const showOvertimeModal = ref(false);
const showDeleteModal = ref(false);
const editingRequest = ref(null);
const deletingRequest = ref(null);
const deleting = ref(false);

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

const pendingCount = computed(
  () => userRequests.value.filter((r) => r.status === "pending").length
);
const approvedCount = computed(
  () => userRequests.value.filter((r) => r.status === "approved").length
);
const rejectedCount = computed(
  () => userRequests.value.filter((r) => r.status === "rejected").length
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

  if (result && result.ok) {
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

  if (result && result.ok) {
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
  form.startTime = request.startTime || request.start_time;
  form.endTime = request.endTime || request.end_time;
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

    if (result && result.ok) {
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
  
  const data = await overtimeStore.fetchUserRequests(authStore.profile.id);
  // Ensure array structure even if store returns void/undefined
  userRequests.value = Array.isArray(data) ? data : []; 
}
</script>