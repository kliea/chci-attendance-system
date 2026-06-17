<template>
    <div class="max-w-6xl mx-auto bg-[#ffffff] font-sans antialiased rounded-lg min-h-screen p-8">
    <header class="mb-6">
      <p
        class="text-gray-500 text-sm font-sans font-medium mt-1 leading-relaxed"
      >
        Review and approve employee overtime requests.
      </p>
    </header>

    <div
      v-if="submitSuccess"
      class="mb-4 p-3 rounded bg-green-50 text-green-800 text-sm font-sans font-medium"
    >
      {{ submitSuccess }}
    </div>
    <div
      v-if="submitError"
      class="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm font-sans font-medium"
    >
      {{ submitError }}
    </div>

    <section
      class="rounded border border-gray-100 overflow-hidden mb-6 shadow-sm"
    >
      <div
        class="flex flex-col gap-2 px-4 py-3 border-b border-gray-100 bg-white"
      >
        <div class="flex flex-wrap gap-2 text-xs font-sans font-medium">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-medium"
            :class="
              statusFilter === 'all'
                ? 'bg-[#003777] text-white border-[#003777]'
                : 'border-gray-200 text-gray-700 hover:text-[#003777] hover:bg-blue-50'
            "
            @click="statusFilter = 'all'"
          >
            All
            <span 
              class="text-[10px] px-1 rounded-full font-medium"
              :class="statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'"
            >
              {{ allCount }}
            </span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-medium"
            :class="
              statusFilter === 'pending'
                ? 'bg-[#003777] text-white border-[#003777]'
                : 'border-gray-200 text-gray-700 hover:text-[#003777] hover:bg-blue-50'
            "
            @click="statusFilter = 'pending'"
          >
            Pending
            <span 
              class="text-[10px] px-1 rounded-full font-medium"
              :class="statusFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'"
            >
              {{ pendingCount }}
            </span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-medium"
            :class="
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-gray-200 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
            "
            @click="statusFilter = 'approved'"
          >
            Approved
            <span
              class="text-[10px] px-1 rounded-full font-medium"
              :class="statusFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'"
            >
              {{ approvedCount }}
            </span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-medium"
            :class="
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white border-red-600'
                : 'border-gray-200 text-gray-700 hover:text-red-600 hover:bg-red-50'
            "
            @click="statusFilter = 'rejected'"
          >
            Rejected
            <span 
              class="text-[10px] px-1 rounded-full font-medium"
              :class="statusFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-700'"
            >
              {{ rejectedCount }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <section class="rounded border border-gray-100 overflow-hidden shadow-sm bg-white">
      <div v-if="loading" class="p-8">
        <LoadingBar />
      </div>
      <div v-else-if="error" class="p-4 text-red-600 text-sm font-sans font-medium">{{ error }}</div>
      <div v-else-if="!filteredRequests.length" class="p-8">
        <EmptyState
          :title="`No ${statusFilter === 'all' ? '' : statusFilter} overtime requests`"
          subtitle="No overtime requests found matching the current filter."
        />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-[#003777]">
            <tr>
              <th
                class="text-white text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Employee
              </th>
              <th
                class="text-white text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Date
              </th>
              <th
                class="text-white text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Time
              </th>
              <th
                class="text-white text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Type
              </th>
              <th
                class="text-white text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Reason
              </th>
              <th
                class="text-white text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Status
              </th>
              <th
                class="text-white text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-center"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in filteredRequests"
              :key="request.id"
              class="bg-white hover:bg-blue-50/40 border-b border-gray-100 transition-colors duration-150"
            >
              <td class="px-4 py-3 text-sm font-sans text-gray-700">
                <div>
                  <div class="font-semibold text-gray-900">
                    {{ request.requester?.full_name || "Unknown" }}
                  </div>
                  <div class="text-xs text-gray-500 font-medium">
                    ID: {{ request.requester?.bio_id || "N/A" }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm font-sans text-gray-700 font-medium">
                {{ formatDate(request.date) }}
              </td>
              <td class="px-4 py-3 text-sm font-sans text-gray-700 font-medium">
                {{ request.start_time }} - {{ request.end_time }}
              </td>
              <td class="px-4 py-3 text-sm font-sans text-gray-700 font-medium">
                <span class="capitalize">{{
                  request.type.replace("_", " ")
                }}</span>
              </td>
              <td
                class="px-4 py-3 text-sm font-sans text-gray-600 max-w-xs truncate font-medium"
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
              <td class="px-4 py-3">
                <div class="flex items-center gap-2 justify-center">
                  <button
                    v-if="request.status === 'pending'"
                    type="button"
                    class="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-emerald-700 hover:bg-emerald-50 rounded transition-all duration-150"
                    @click="openApproveModal(request)"
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
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Approve
                  </button>
                  <button
                    v-if="request.status === 'pending'"
                    type="button"
                    class="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50 rounded transition-all duration-150"
                    @click="openRejectModal(request)"
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
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                    Reject
                  </button>
                  <div
                    v-if="request.status !== 'pending'"
                    class="text-xs text-gray-500 font-medium"
                  >
                    <div v-if="request.approver">
                      {{
                        request.status === "approved"
                          ? "Approved by"
                          : "Rejected by"
                      }}:<br />
                      <span class="text-gray-900 font-semibold">{{ request.approver.full_name }}</span>
                    </div>
                    <div v-if="request.approved_at" class="text-gray-400 text-[11px] mt-0.5">
                      {{ formatDate(request.approved_at) }}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div
      v-if="showApproveModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      @click.self="closeApproveModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto border border-gray-100 overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-gray-100 bg-white">
          <div class="flex items-center justify-between">
            <h2
              class="font-sans font-semibold text-lg tracking-wide text-gray-900"
            >
              Approve Overtime Request
            </h2>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
              @click="closeApproveModal"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <p class="text-sm font-sans text-gray-700 mb-2 font-medium">
              <strong class="font-medium text-gray-500">Employee:</strong>
              <span class="text-gray-900 font-semibold">{{ selectedRequest?.requester?.full_name }}</span>
            </p>
            <p class="text-sm font-sans text-gray-700 mb-2 font-medium">
              <strong class="font-medium text-gray-500">Date:</strong> 
              <span class="text-gray-900">{{ formatDate(selectedRequest?.date) }}</span>
            </p>
            <p class="text-sm font-sans text-gray-700 mb-2 font-medium">
              <strong class="font-medium text-gray-500">Time:</strong> 
              <span class="text-gray-900">{{ selectedRequest?.start_time }} - {{ selectedRequest?.end_time }}</span>
            </p>
            <p class="text-sm font-sans text-gray-700 mb-2 font-medium">
              <strong class="font-medium text-gray-500">Type:</strong>
              <span class="capitalize text-gray-900">{{ selectedRequest?.type?.replace("_", " ") }}</span>
            </p>
            <p class="text-sm font-sans text-gray-700 font-medium">
              <strong class="font-medium text-gray-500">Reason:</strong> 
              <span class="text-gray-900">{{ selectedRequest?.reason }}</span>
            </p>
          </div>
          <p class="text-xs font-sans text-gray-400 mb-6 font-medium">
            Are you sure you want to approve this overtime request?
          </p>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              class="border border-gray-200 text-gray-700 text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-gray-900 transition-colors duration-150 font-sans font-medium"
              @click="closeApproveModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="bg-[#003777] text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-[#002555] transition-colors duration-150 font-sans font-medium"
              :disabled="submitting"
              @click="confirmApprove"
            >
              {{ submitting ? "Approving…" : "Approve" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showRejectModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      @click.self="closeRejectModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto border border-gray-100 overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-gray-100 bg-white">
          <div class="flex items-center justify-between">
            <h2
              class="font-sans font-semibold text-lg tracking-wide text-gray-900"
            >
              Reject Overtime Request
            </h2>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
              @click="closeRejectModal"
            >
              ✕
            </button>
          </div>
        </div>
        <form @submit.prevent="confirmReject" class="p-6">
          <div class="mb-4">
            <p class="text-sm font-sans text-gray-700 mb-2 font-medium">
              <strong class="font-medium text-gray-500">Employee:</strong>
              <span class="text-gray-900 font-semibold">{{ selectedRequest?.requester?.full_name }}</span>
            </p>
            <p class="text-sm font-sans text-gray-700 mb-2 font-medium">
              <strong class="font-medium text-gray-500">Date:</strong> 
              <span class="text-gray-900">{{ formatDate(selectedRequest?.date) }}</span>
            </p>
            <p class="text-sm font-sans text-gray-700 mb-2 font-medium">
              <strong class="font-medium text-gray-500">Time:</strong> 
              <span class="text-gray-900">{{ selectedRequest?.start_time }} - {{ selectedRequest?.end_time }}</span>
            </p>
            <p class="text-sm font-sans text-gray-700 mb-2 font-medium">
              <strong class="font-medium text-gray-500">Type:</strong>
              <span class="capitalize text-gray-900">{{ selectedRequest?.type?.replace("_", " ") }}</span>
            </p>
            <p class="text-sm font-sans text-gray-700 mb-4 font-medium">
              <strong class="font-medium text-gray-500">Reason:</strong> 
              <span class="text-gray-900">{{ selectedRequest?.reason }}</span>
            </p>

            <label
              for="rejection-reason"
              class="block text-[10px] tracking-[0.25em] uppercase text-gray-500 font-sans font-medium mb-2"
            >
              Rejection Reason *
            </label>
            <textarea
              id="rejection-reason"
              v-model="rejectionReason"
              rows="3"
              required
              class="border border-gray-200 rounded p-3 text-sm font-sans font-medium text-gray-900 placeholder-gray-400 focus:border-[#003777] focus:outline-none w-full transition-colors resize-none"
              placeholder="Provide a reason for rejection..."
            />
          </div>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              class="border border-gray-200 text-gray-700 text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-gray-900 transition-colors duration-150 font-sans font-medium"
              @click="closeRejectModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-red-600 text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-red-700 transition-colors duration-150 font-sans font-medium"
              :disabled="submitting"
            >
              {{ submitting ? "Rejecting…" : "Reject" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOvertimeStore } from "@/stores/overtime.js";
import { useAuthStore } from "@/stores/auth.js";
import { useFormatters } from "@/composables/useFormatters.js";
import LoadingBar from "@/components/ui/LoadingBar.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

const overtimeStore = useOvertimeStore();
const authStore = useAuthStore();
const { formatDate, getStatusClass } = useFormatters();

const statusFilter = ref("pending");
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const selectedRequest = ref(null);
const rejectionReason = ref("");

const loading = computed(() => overtimeStore.loading);
const error = computed(() => overtimeStore.error);
const submitting = computed(() => overtimeStore.submitting);
const submitError = computed(() => overtimeStore.submitError);
const submitSuccess = computed(() => overtimeStore.submitSuccess);

const allCount = computed(() => overtimeStore.requests.length);
const pendingCount = computed(() => overtimeStore.pendingRequests.length);
const approvedCount = computed(() => overtimeStore.approvedRequests.length);
const rejectedCount = computed(() => overtimeStore.rejectedRequests.length);

const filteredRequests = computed(() => {
  if (statusFilter.value === "all") return overtimeStore.requests;
  return overtimeStore.requests.filter((r) => r.status === statusFilter.value);
});

function openApproveModal(request) {
  selectedRequest.value = request;
  showApproveModal.value = true;
  overtimeStore.clearSubmitStatus();
}

function closeApproveModal() {
  showApproveModal.value = false;
  selectedRequest.value = null;
}

function openRejectModal(request) {
  selectedRequest.value = request;
  showRejectModal.value = true;
  rejectionReason.value = "";
  overtimeStore.clearSubmitStatus();
}

function closeRejectModal() {
  showRejectModal.value = false;
  selectedRequest.value = null;
  rejectionReason.value = "";
}

async function confirmApprove() {
  if (!selectedRequest.value) return;

  const result = await overtimeStore.approveRequest(
    selectedRequest.value.id,
    authStore.profile?.id,
  );

  if (result.ok) {
    closeApproveModal();
    await overtimeStore.fetchRequests();
    setTimeout(() => {
      overtimeStore.clearSubmitStatus();
    }, 5000);
  }
}

async function confirmReject() {
  if (!selectedRequest.value || !rejectionReason.value?.trim()) return;

  const result = await overtimeStore.rejectRequest(
    selectedRequest.value.id,
    authStore.profile?.id,
    rejectionReason.value.trim(),
  );

  if (result.ok) {
    closeRejectModal();
    await overtimeStore.fetchRequests();
    setTimeout(() => {
      overtimeStore.clearSubmitStatus();
    }, 5000);
  }
}

onMounted(async () => {
  await overtimeStore.fetchRequests();
});
</script>