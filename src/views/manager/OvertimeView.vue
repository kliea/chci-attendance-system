<template>
  <div class="max-w-6xl">
    <header class="mb-6">
      <h1
        class="font-display font-light text-xl tracking-wide text-anito-black"
      >
        Overtime Requests
      </h1>
      <p
        class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed"
      >
        Review and approve employee overtime requests.
      </p>
    </header>

    <!-- Success/error messages -->
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

    <!-- Filter tabs -->
    <section
      class="rounded border border-anito-gray-light overflow-hidden mb-6"
    >
      <div
        class="flex flex-col gap-2 px-4 py-3 border-b border-anito-gray-light bg-white"
      >
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
              {{ allCount }}
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
    </section>

    <!-- Overtime requests table -->
    <section class="rounded border border-anito-gray-light overflow-hidden">
      <div v-if="loading" class="p-8">
        <LoadingBar />
      </div>
      <div v-else-if="error" class="p-4 text-red-600 text-sm">{{ error }}</div>
      <div v-else-if="!filteredRequests.length" class="p-8">
        <EmptyState
          :title="`No ${statusFilter === 'all' ? '' : statusFilter} overtime requests`"
          subtitle="No overtime requests found matching the current filter."
        />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-anito-black">
            <tr>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Employee
              </th>
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
              v-for="request in filteredRequests"
              :key="request.id"
              class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150"
            >
              <td class="px-4 py-3 text-sm font-sans text-anito-black">
                <div>
                  <div class="font-medium">
                    {{ request.requester?.full_name || "Unknown" }}
                  </div>
                  <div class="text-xs text-anito-gray">
                    ID: {{ request.requester?.bio_id || "N/A" }}
                  </div>
                </div>
              </td>
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
                    class="text-xs text-anito-gray"
                  >
                    <div v-if="request.approver">
                      {{
                        request.status === "approved"
                          ? "Approved by"
                          : "Rejected by"
                      }}:<br />
                      {{ request.approver.full_name }}
                    </div>
                    <div v-if="request.approved_at">
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

    <!-- Approve Modal -->
    <div
      v-if="showApproveModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="closeApproveModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto border border-anito-gray-light overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-anito-gray-light bg-white">
          <div class="flex items-center justify-between">
            <h2
              class="font-display font-light text-lg tracking-wide text-anito-black"
            >
              Approve Overtime Request
            </h2>
            <button
              type="button"
              class="text-anito-gray hover:text-anito-black transition-colors"
              aria-label="Close"
              @click="closeApproveModal"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <p class="text-sm font-sans text-anito-black mb-2">
              <strong>Employee:</strong>
              {{ selectedRequest?.requester?.full_name }}
            </p>
            <p class="text-sm font-sans text-anito-black mb-2">
              <strong>Date:</strong> {{ formatDate(selectedRequest?.date) }}
            </p>
            <p class="text-sm font-sans text-anito-black mb-2">
              <strong>Time:</strong> {{ selectedRequest?.start_time }} -
              {{ selectedRequest?.end_time }}
            </p>
            <p class="text-sm font-sans text-anito-black mb-2">
              <strong>Type:</strong>
              <span class="capitalize">{{
                selectedRequest?.type?.replace("_", " ")
              }}</span>
            </p>
            <p class="text-sm font-sans text-anito-black">
              <strong>Reason:</strong> {{ selectedRequest?.reason }}
            </p>
          </div>
          <p class="text-xs font-sans text-anito-gray mb-6">
            Are you sure you want to approve this overtime request?
          </p>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium"
              @click="closeApproveModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="bg-emerald-600 text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-emerald-700 transition-colors duration-150 font-sans font-medium"
              :disabled="submitting"
              @click="confirmApprove"
            >
              {{ submitting ? "Approving…" : "Approve" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="closeRejectModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto border border-anito-gray-light overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-anito-gray-light bg-white">
          <div class="flex items-center justify-between">
            <h2
              class="font-display font-light text-lg tracking-wide text-anito-black"
            >
              Reject Overtime Request
            </h2>
            <button
              type="button"
              class="text-anito-gray hover:text-anito-black transition-colors"
              aria-label="Close"
              @click="closeRejectModal"
            >
              ✕
            </button>
          </div>
        </div>
        <form @submit.prevent="confirmReject" class="p-6">
          <div class="mb-4">
            <p class="text-sm font-sans text-anito-black mb-2">
              <strong>Employee:</strong>
              {{ selectedRequest?.requester?.full_name }}
            </p>
            <p class="text-sm font-sans text-anito-black mb-2">
              <strong>Date:</strong> {{ formatDate(selectedRequest?.date) }}
            </p>
            <p class="text-sm font-sans text-anito-black mb-2">
              <strong>Time:</strong> {{ selectedRequest?.start_time }} -
              {{ selectedRequest?.end_time }}
            </p>
            <p class="text-sm font-sans text-anito-black mb-2">
              <strong>Type:</strong>
              <span class="capitalize">{{
                selectedRequest?.type?.replace("_", " ")
              }}</span>
            </p>
            <p class="text-sm font-sans text-anito-black mb-4">
              <strong>Reason:</strong> {{ selectedRequest?.reason }}
            </p>

            <label
              for="rejection-reason"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
            >
              Rejection Reason *
            </label>
            <textarea
              id="rejection-reason"
              v-model="rejectionReason"
              rows="3"
              required
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors resize-none"
              placeholder="Provide a reason for rejection..."
            />
          </div>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium"
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
