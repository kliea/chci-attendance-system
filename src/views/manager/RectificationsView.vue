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
          class="p-6 bg-white hover:bg-anito-blue-light transition-colors duration-150"
        >
          <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div class="flex-1 min-w-[200px]">
              <h3 class="font-sans font-medium text-anito-black text-base mb-1">
                {{ request.rectification_title }}
              </h3>
              <div class="flex flex-wrap gap-4 text-sm text-anito-gray mb-2">
                <span>{{ getUserName(request.users) }}</span>
                <span>{{ formatDate(request.date) }}</span>
                <span
                  class="text-[10px] tracking-[0.2em] uppercase px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-sans font-medium"
                >
                  {{ formatType(request.rectification_type) }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="bg-green-600 text-white text-[10px] tracking-[0.2em] uppercase px-4 py-2 rounded hover:bg-green-700 transition-colors duration-150 font-sans font-medium disabled:opacity-50"
                :disabled="processing === request.id"
                @click="approveRequest(request)"
              >
                {{ processing === request.id ? "Processing…" : "Approve" }}
              </button>
              <button
                type="button"
                class="bg-red-600 text-white text-[10px] tracking-[0.2em] uppercase px-4 py-2 rounded hover:bg-red-700 transition-colors duration-150 font-sans font-medium disabled:opacity-50"
                :disabled="processing === request.id"
                @click="openRejectModal(request)"
              >
                {{ processing === request.id ? "Processing…" : "Reject" }}
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-anito-gray text-sm font-sans font-light">
              {{ request.description }}
            </p>

            <div
              v-if="request.time_in || request.time_out"
              class="flex flex-wrap gap-4 text-sm"
            >
              <div v-if="request.time_in" class="flex items-center gap-2">
                <span class="text-anito-gray font-sans font-light"
                  >Corrected Time In:</span
                >
                <span class="text-anito-black font-sans font-medium">{{
                  request.time_in
                }}</span>
              </div>
              <div v-if="request.time_out" class="flex items-center gap-2">
                <span class="text-anito-gray font-sans font-light"
                  >Corrected Time Out:</span
                >
                <span class="text-anito-black font-sans font-medium">{{
                  request.time_out
                }}</span>
              </div>
            </div>

            <div class="text-xs text-anito-gray font-sans font-light">
              Requested: {{ formatDateTime(request.created_at) }}
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
                Title
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Type
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
                {{ getUserName(request.users) }}
              </td>
              <td class="px-4 py-3 text-sm font-sans text-anito-black">
                {{ formatDate(request.date) }}
              </td>
              <td class="px-4 py-3 text-sm font-sans text-anito-black">
                {{ request.rectification_title }}
              </td>
              <td class="px-4 py-3 text-sm font-sans text-anito-gray">
                {{ formatType(request.rectification_type) }}
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
                {{
                  request.reviewers
                    ? `${request.reviewers.fname} ${request.reviewers.lname}`
                    : "—"
                }}
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
              getUserName(selectedRequest.users)
            }}</strong>
            for
            <strong class="text-anito-black">{{
              formatDate(selectedRequest.date)
            }}</strong>
          </p>
          <p class="text-anito-black text-sm font-sans font-medium">
            {{ selectedRequest.rectification_title }}
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="rejectRequest">
          <div>
            <label
              for="rejectNotes"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
              >Reason for rejection (optional)</label
            >
            <textarea
              id="rejectNotes"
              v-model="rejectNotes"
              rows="3"
              class="w-full px-4 py-3 border border-anito-gray-light rounded bg-transparent text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none transition-colors resize-none"
              placeholder="Provide a reason for rejecting this request..."
            />
          </div>

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
const rejectNotes = ref("");
const rejectSubmitting = ref(false);
const rejectError = ref("");

const loading = computed(() => rectificationsStore.loading);
const error = computed(() => rectificationsStore.error);
const allRequests = computed(() => rectificationsStore.requests);
const pendingRequests = computed(() => rectificationsStore.pendingRequests);
const pendingCount = computed(() => pendingRequests.value.length);

onMounted(async () => {
  await rectificationsStore.fetchRequests();
});

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
  rejectNotes.value = "";
  rejectError.value = "";
  showRejectModal.value = true;
}

function closeRejectModal() {
  showRejectModal.value = false;
  selectedRequest.value = null;
  rejectNotes.value = "";
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
    rejectNotes.value.trim() || null,
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

function getUserName(user) {
  if (!user) return "Unknown";
  return (
    `${user.fname || ""} ${user.lname || ""}`.trim() || user.bio_id || "Unknown"
  );
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString();
}

function formatType(type) {
  const types = {
    time_in: "Time In",
    time_out: "Time Out",
    both: "Both",
    missing: "Missing",
    other: "Other",
  };
  return types[type] || type;
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
