<template>
    <div class="max-w-6xl mx-auto bg-[#ffffff] font-sans antialiased rounded-lg min-h-screen p-8">
    <!-- Header -->
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-gray-600 text-sm mt-2 leading-relaxed">
          Request corrections for your attendance records.
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

    <!-- Request Modal -->
    <div
      v-if="showRectifyModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      @click.self="closeRectifyModal"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-gray-200 bg-white shrink-0">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ editingRequest ? "Edit Rectification Request" : "DTR Rectification Request" }}
              </h2>
              <p class="text-sm text-gray-600 mt-1">{{ editingRequest ? "Update your request" : "Submit corrections for your attendance" }}</p>
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

          <!-- Step Indicator (only when not editing) -->
          <div v-if="!editingRequest" class="flex gap-2">
            <span
              class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
              :class="modalStep === 1 ? 'bg-[#003777] text-white' : 'bg-gray-100 text-gray-700'"
            >
              Step 1 — Add request
            </span>
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
              :class="[
                modalStep === 2
                  ? 'bg-[#003777] text-white'
                  : rectifications.length
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              ]"
              :disabled="rectifications.length === 0"
              @click="goToStep2"
            >
              Step 2 — Review ({{ rectifications.length }})
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="overflow-y-auto flex-1">
          <!-- Step 1: Form -->
          <form
            v-show="modalStep === 1"
            class="p-8 space-y-6"
            @submit.prevent="editingRequest ? submitEditRequest() : addRectification()"
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
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors"
              />
            </div>

            <!-- Nature Field -->
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
                    class="w-4 h-4 border-gray-300 text-[#003777]"
                  />
                  <span class="text-sm text-gray-900">Missed Logged-In</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="form.nature"
                    type="radio"
                    value="time_out"
                    class="w-4 h-4 border-gray-300 text-[#003777]"
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
                {{ editingRequest ? "Update Request" : "Add to list" }}
              </button>
              <button
                v-if="!editingRequest && rectifications.length > 0"
                type="button"
                class="px-6 py-2.5 border border-[#003777] text-[#003777] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                @click="modalStep = 2"
              >
                Review ({{ rectifications.length }})
              </button>
            </div>
          </form>

          <!-- Step 2: Review List -->
          <div v-show="modalStep === 2" class="p-8 flex flex-col min-h-0">
            <p class="text-gray-600 text-sm mb-6">
              Review your rectification requests below, then submit all.
            </p>
            
            <div class="space-y-2 overflow-y-auto flex-1 border border-gray-200 rounded-lg p-4 mb-6">
              <div
                v-for="(rect, index) in rectifications"
                :key="rect.id"
                class="flex items-start justify-between gap-3 py-3 px-3 border-b border-gray-200 last:border-0 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-medium text-sm text-gray-900">{{ formatDate(rect.date) }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="rect.nature === 'time_in' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
                    >
                      {{ rect.nature === "time_in" ? "Time In" : "Time Out" }}
                    </span>
                    <span class="text-xs text-gray-600">{{ rect.rectifiedTime }}</span>
                  </div>
                  <p class="text-xs text-gray-600 truncate" :title="rect.reason">{{ rect.reason }}</p>
                </div>
                <button
                  type="button"
                  class="shrink-0 text-gray-400 hover:text-red-600 transition-colors p-1"
                  aria-label="Remove"
                  @click="removeRectification(index)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                class="px-6 py-2.5 border border-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                @click="modalStep = 1"
              >
                Back — Add more
              </button>
              <button
                type="button"
                class="px-6 py-2.5 bg-[#003777] text-white text-sm font-medium rounded-lg hover:bg-[#002555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                :disabled="submitting"
                @click="submitAllRequests"
              >
                <svg v-if="!submitting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416" />
                </svg>
                {{ submitting ? "Submitting…" : `Submit all (${rectifications.length})` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Previous Requests Section -->
    <section class="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <!-- Section Header with Filters -->
      <div class="px-8 py-6 border-b border-gray-200 bg-gray-50">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Your Previous Requests</h2>
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
              :class="
                statusFilter === filter.value
                  ? 'bg-white/30'
                  : 'bg-gray-200 text-gray-700'
              "
            >
              {{ filter.count }}
            </span>
          </button>
        </div>
      </div>

      <!-- Loading / Error / Empty States -->
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
        <h3 class="text-gray-900 font-medium text-sm mt-4">No previous requests</h3>
        <p class="text-gray-600 text-sm mt-1">No previous requests found.</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[#003777]">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Date</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Reason</th>
              <th v-if="statusFilter === 'pending'" class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Type</th>
              <th v-if="statusFilter === 'pending'" class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Time</th>
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
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" :title="request.reason">
                {{ request.reason }}
              </td>
              <td v-if="statusFilter === 'pending'" class="px-6 py-4 text-sm text-gray-900">
                {{ request.requested_in ? "Missed Logged-In" : "Missed Logged-Out" }}
              </td>
              <td v-if="statusFilter === 'pending'" class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ request.requested_in || request.requested_out || "—" }}
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

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      @click.self="closeDeleteModal"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
        <!-- Modal Header -->
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

        <!-- Modal Body -->
        <div class="p-8">
          <p class="text-sm text-gray-900 mb-2">
            Are you sure you want to delete this rectification request?
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
import { useRectificationsStore } from "@/stores/rectifications.js";
import { useAuthStore } from "@/stores/auth.js";
import { useFormatters } from "@/composables/useFormatters.js";

const rectificationsStore = useRectificationsStore();
const authStore = useAuthStore();
const { formatDate } = useFormatters();

const showRectifyModal = ref(false);
const modalStep = ref(1);
const rectifications = ref([]);

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

  const result = await rectificationsStore.updateRequest(
    editingRequest.value.id,
    requestData,
  );

  if (result.ok) {
    submitSuccess.value = "Your rectification request has been updated successfully.";
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
      submitSuccess.value = "Your rectification request has been updated successfully.";
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

  editingRequest.value = request;
  form.date = request.date;
  form.reason = request.reason;
  form.nature = request.requested_in ? "time_in" : "time_out";
  form.rectifiedTime = request.requested_in || request.requested_out || "";

  modalStep.value = 1;
  rectifications.value = [];
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