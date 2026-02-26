<template>
  <div class="max-w-6xl">
    <header class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1
          class="font-display font-light text-xl tracking-wide text-anito-black"
        >
          Rectifications
        </h1>
        <p
          class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed"
        >
          Review and approve employee rectification requests.
        </p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          type="button"
          :class="[
            'text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded font-sans font-medium transition-colors duration-150',
            activeTab === 'pending'
              ? 'bg-anito-black text-white'
              : 'border border-anito-gray-light text-anito-black hover:border-anito-black',
          ]"
          @click="activeTab = 'pending'"
        >
          Pending ({{ pendingCount }})
        </button>
        <button
          type="button"
          :class="[
            'text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded font-sans font-medium transition-colors duration-150',
            activeTab === 'all'
              ? 'bg-anito-black text-white'
              : 'border border-anito-gray-light text-anito-black hover:border-anito-black',
          ]"
          @click="activeTab = 'all'"
        >
          All Requests
        </button>
      </div>
    </header>

    <!-- Bulk Actions Header -->
    <div
      v-if="activeTab === 'pending' && pendingRequests.length > 0"
      class="flex items-center justify-between mb-4 p-3 bg-anito-gray-light/30 rounded-lg"
    >
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="allSelected"
            @change="toggleSelectAll"
            class="w-4 h-4 rounded-full border-2 border-anito-gray text-anito-blue-mid focus:ring-2 focus:ring-anito-blue-mid focus:ring-offset-2"
          />
          <span class="text-sm font-sans text-anito-black">Select All</span>
        </label>
        <span
          v-if="selectedRequests.length > 0"
          class="text-sm font-sans text-anito-gray"
        >
          {{ selectedRequests.length }} selected
        </span>
      </div>
      <div v-if="selectedRequests.length > 0" class="flex gap-2">
        <button
          type="button"
          class="bg-green-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-sans flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="processing === 'bulk'"
          @click="bulkApprove"
        >
          <svg
            v-if="processing !== 'bulk'"
            class="w-4 h-4"
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
          <svg
            v-else
            class="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 12v8m0-8l6 6m-6-6v8m0-8l6 6M12 12v8m0-8l6 6m-6-6v8m0-8l6 6m-6-6v8"
            ></path>
          </svg>
          {{
            processing === "bulk"
              ? "Processing…"
              : `Approve Selected (${selectedRequests.length})`
          }}
        </button>
        <button
          type="button"
          class="bg-red-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-sans flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="processing === 'bulk'"
          @click="bulkReject"
        >
          <svg
            v-if="processing !== 'bulk'"
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
          <svg
            v-else
            class="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 12v8m0-8l6 6m-6-6v8m0-8l6 6M12 12v8m0-8l6 6m-6-6v8m0-8l6 6m-6-6v8"
            ></path>
          </svg>
          {{
            processing === "bulk"
              ? "Processing…"
              : `Reject Selected (${selectedRequests.length})`
          }}
        </button>
      </div>
    </div>

    <!-- Pending Requests -->
    <section
      v-if="activeTab === 'pending'"
      class="rounded border border-anito-gray-light overflow-hidden mb-8"
    >
      <h2
        class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium px-4 py-3 border-b border-anito-gray-light bg-white"
      >
        Pending Requests ({{ pendingCount }})
      </h2>
      <div v-if="loading" class="p-8 space-y-2">
        <div
          class="h-0.5 w-full bg-anito-gray-light rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-anito-blue-mid animate-pulse rounded-full transition-all duration-300"
            style="width: 60%"
          ></div>
        </div>
      </div>
      <div v-else-if="error" class="p-4 text-red-600 text-sm">{{ error }}</div>
      <div
        v-else-if="!pendingRequests.length"
        class="p-8 text-center text-anito-gray text-sm font-sans font-light"
      >
        No pending rectification requests.
      </div>
      <div v-else class="divide-y divide-anito-gray-light">
        <div
          v-for="request in pendingRequests"
          :key="request.id"
          class="bg-white hover:shadow-md transition-all duration-200 border-b border-anito-gray-light last:border-b-0"
        >
          <!-- Compact View -->
          <div class="p-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 flex-1">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="selectedRequests.includes(request.id)"
                    @change="toggleRequestSelection(request.id)"
                    class="w-3 h-3 rounded-full border-2 border-anito-gray text-anito-blue-mid focus:ring-2 focus:ring-anito-blue-mid focus:ring-offset-2"
                  />
                </label>
                <div
                  class="cursor-pointer flex-1 flex items-center gap-3"
                  @click="toggleRequestDetails(request.id)"
                >
                  <span
                    class="text-xs font-medium px-1.5 py-0.5 rounded-full w-20 text-center"
                    :class="
                      request.requested_in
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    "
                  >
                    {{ request.requested_in ? "Time In" : "Time Out" }}
                  </span>
                  <div>
                    <h3
                      class="font-sans font-medium text-anito-black text-xs line-clamp-1"
                    >
                      {{ request.reason }}
                    </h3>
                    <div
                      class="flex items-center gap-3 text-xs text-anito-gray mt-1"
                    >
                      <span>{{ getRequesterName(request.requester) }}</span>
                      <span>{{ formatDate(request.date) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-green-700 transition-colors duration-200 font-sans disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  :disabled="processing === request.id || processing === 'bulk'"
                  @click.stop="approveRequest(request)"
                >
                  <svg
                    v-if="processing !== request.id"
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
                  <svg
                    v-else
                    class="w-3 h-3"
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
                  {{ processing === request.id ? "…" : "Approve" }}
                </button>
                <button
                  type="button"
                  class="bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-red-700 transition-colors duration-200 font-sans disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  :disabled="processing === request.id || processing === 'bulk'"
                  @click.stop="openRejectModal(request)"
                >
                  <svg
                    v-if="processing !== request.id"
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
                  <svg
                    v-else
                    class="w-3 h-3"
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
                  {{ processing === request.id ? "…" : "Reject" }}
                </button>
                <svg
                  class="w-3 h-3 text-anito-gray transition-transform duration-200"
                  :class="{
                    'rotate-180': expandedRequests.includes(request.id),
                  }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Expanded Details -->
          <div
            v-if="expandedRequests.includes(request.id)"
            class="px-4 pb-4 border-t border-anito-gray-light"
          >
            <div class="pt-4 space-y-3">
              <div class="bg-anito-gray-light/30 rounded-lg p-4 space-y-3">
                <div class="flex items-start gap-2">
                  <svg
                    class="w-4 h-4 text-anito-gray mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-anito-black mb-1">
                      Reason
                    </p>
                    <p class="text-anito-gray text-sm font-sans">
                      {{ request.reason }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="request.requested_in || request.requested_out"
                  class="flex flex-wrap gap-6"
                >
                  <div
                    v-if="request.requested_in"
                    class="flex items-start gap-2"
                  >
                    <div>
                      <p class="text-xs font-medium text-anito-black">
                        Requested Time In
                      </p>
                      <p class="text-sm font-sans text-anito-gray">
                        {{ request.requested_in }}
                      </p>
                    </div>
                  </div>
                  <div
                    v-if="request.requested_out"
                    class="flex items-start gap-2"
                  >
                    <div>
                      <p class="text-xs font-medium text-anito-black">
                        Requested Time Out
                      </p>
                      <p class="text-sm font-sans text-anito-gray">
                        {{ request.requested_out }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 text-xs text-anito-gray">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Requested {{ formatDateTime(request.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- All Requests -->
    <section
      v-if="activeTab === 'all'"
      class="rounded border border-anito-gray-light overflow-hidden"
    >
      <h2
        class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium px-4 py-3 border-b border-anito-gray-light bg-white"
      >
        All Requests ({{ allRequests.length }})
      </h2>
      <div v-if="loading" class="p-8 space-y-2">
        <div
          class="h-0.5 w-full bg-anito-gray-light rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-anito-blue-mid animate-pulse rounded-full transition-all duration-300"
            style="width: 60%"
          ></div>
        </div>
      </div>
      <div v-else-if="error" class="p-4 text-red-600 text-sm">{{ error }}</div>
      <div
        v-else-if="!allRequests.length"
        class="p-8 text-center text-anito-gray text-sm font-sans font-light"
      >
        No rectification requests found.
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
                Reason
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Status
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Reviewed By
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in allRequests"
              :key="request.id"
              class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150"
            >
              <td class="px-4 py-3 text-sm font-sans text-anito-black">
                {{ getRequesterName(request.requester) }}
              </td>
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
              <td class="px-4 py-3 text-sm font-sans text-anito-gray">
                {{ request.reviewer?.full_name ?? "—" }}
              </td>
              <td class="px-4 py-3">
                <button
                  v-if="request.status === 'pending'"
                  type="button"
                  class="text-anito-blue-mid text-xs font-sans font-medium hover:underline"
                  @click="viewRequestDetails(request)"
                >
                  Review
                </button>
                <span
                  v-else
                  class="text-anito-gray text-xs font-sans font-light"
                >
                  {{ formatDateTime(request.reviewed_at) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Reject Modal -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="closeRejectModal"
    >
      <div
        class="bg-anito-white rounded-lg shadow-xl max-w-md w-full mx-auto mt-24 p-8"
      >
        <div class="mb-6 flex items-center justify-between">
          <h2
            class="font-display font-light text-2xl tracking-wide text-anito-black mb-1"
          >
            Reject Request
          </h2>
          <button
            type="button"
            class="text-anito-gray hover:text-anito-black transition-colors duration-150"
            aria-label="Close"
            @click="closeRejectModal"
          >
            ✕
          </button>
        </div>

        <div v-if="selectedRequest" class="mb-4">
          <p class="text-anito-gray text-sm font-sans font-light mb-2">
            Request from
            <strong class="text-anito-black">{{
              getRequesterName(selectedRequest.requester)
            }}</strong>
            for
            <strong class="text-anito-black">{{
              formatDate(selectedRequest.date)
            }}</strong>
          </p>
          <p class="text-anito-black text-sm font-sans font-medium">
            {{ selectedRequest.reason }}
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="rejectRequest">
          <div v-if="rejectError" class="text-red-600 text-sm">
            {{ rejectError }}
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium"
              @click="closeRejectModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-red-600 text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-red-700 transition-colors duration-150 font-sans font-medium disabled:opacity-50"
              :disabled="rejectSubmitting"
            >
              {{ rejectSubmitting ? "Rejecting…" : "Reject Request" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRectificationsStore } from "@/stores/rectifications.js";
import { useAuthStore } from "@/stores/auth.js";

const rectificationsStore = useRectificationsStore();
const authStore = useAuthStore();

const activeTab = ref("pending");
const processing = ref(null);
const showRejectModal = ref(false);
const selectedRequest = ref(null);
const rejectSubmitting = ref(false);
const rejectError = ref("");
const expandedRequests = ref([]);
const selectedRequests = ref([]);

const loading = computed(() => rectificationsStore.loading);
const error = computed(() => rectificationsStore.error);
const allRequests = computed(() => rectificationsStore.requests);
const pendingRequests = computed(() => rectificationsStore.pendingRequests);
const pendingCount = computed(() => pendingRequests.value.length);
const allSelected = computed(() => {
  return (
    pendingRequests.value.length > 0 &&
    selectedRequests.value.length === pendingRequests.value.length
  );
});

onMounted(async () => {
  await rectificationsStore.fetchRequests();
});

function toggleRequestDetails(requestId) {
  const index = expandedRequests.value.indexOf(requestId);
  if (index > -1) {
    expandedRequests.value.splice(index, 1);
  } else {
    expandedRequests.value.push(requestId);
  }
}

function toggleRequestSelection(requestId) {
  const index = selectedRequests.value.indexOf(requestId);
  if (index > -1) {
    selectedRequests.value.splice(index, 1);
  } else {
    selectedRequests.value.push(requestId);
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedRequests.value = [];
  } else {
    selectedRequests.value = pendingRequests.value.map((req) => req.id);
  }
}

async function bulkApprove() {
  if (selectedRequests.value.length === 0) return;

  processing.value = "bulk";
  const promises = selectedRequests.value.map((requestId) =>
    rectificationsStore.updateRequestStatus(
      requestId,
      "approved",
      authStore.profile?.id,
    ),
  );

  await Promise.all(promises);
  selectedRequests.value = [];
  processing.value = null;
}

async function bulkReject() {
  if (selectedRequests.value.length === 0) return;

  processing.value = "bulk";
  const promises = selectedRequests.value.map((requestId) =>
    rectificationsStore.updateRequestStatus(
      requestId,
      "rejected",
      authStore.profile?.id,
    ),
  );

  await Promise.all(promises);
  selectedRequests.value = [];
  processing.value = null;
}

async function approveRequest(request) {
  processing.value = request.id;
  const result = await rectificationsStore.updateRequestStatus(
    request.id,
    "approved",
    authStore.profile?.id,
  );
  if (!result.ok) {
    console.error("Failed to approve request:", result.error);
  }
  processing.value = null;
}

function openRejectModal(request) {
  selectedRequest.value = request;
  rejectError.value = "";
  showRejectModal.value = true;
}

function closeRejectModal() {
  showRejectModal.value = false;
  selectedRequest.value = null;
  rejectError.value = "";
}

async function rejectRequest() {
  if (!selectedRequest.value) return;

  rejectSubmitting.value = true;
  rejectError.value = "";

  const result = await rectificationsStore.updateRequestStatus(
    selectedRequest.value.id,
    "rejected",
    authStore.profile?.id,
  );

  if (!result.ok) {
    rejectError.value = result.error || "Failed to reject request";
  } else {
    closeRejectModal();
  }

  rejectSubmitting.value = false;
}

function viewRequestDetails(request) {
  // Could open a detailed view modal, for now just switch to pending tab
  activeTab.value = "pending";
}

function getRequesterName(requester) {
  if (!requester) return "Unknown";
  return requester.full_name?.trim() || requester.bio_id || "Unknown";
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString();
}

function getStatusClass(status) {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
}
</script>
