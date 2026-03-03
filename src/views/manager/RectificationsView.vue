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
          class="bg-green-600 text-white text-xs font-medium px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200 font-sans flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="processing === 'bulk'"
          @click="openBulkConfirm('approve')"
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
          class="bg-red-600 text-white text-xs font-medium px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200 font-sans flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="processing === 'bulk'"
          @click="openBulkConfirm('reject')"
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
        Pending Requests ({{ pendingCount }}) — oldest first
      </h2>
      <div v-if="loading" class="p-8">
        <LoadingBar />
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
          v-for="request in paginatedPendingRequests"
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
                  @click="openDetailModal(request)"
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
                <button
                  type="button"
                  class="text-anito-blue-mid text-xs font-sans font-medium hover:underline"
                  @click.stop="openDetailModal(request)"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="pendingRequests.length > pageSize"
          class="p-4 border-t border-anito-gray-light bg-white flex flex-wrap items-center justify-between gap-3"
        >
          <p class="text-anito-gray text-sm font-sans font-light">
            Showing {{ (pendingPage - 1) * pageSize + 1 }}–{{ Math.min(pendingPage * pageSize, pendingRequests.length) }} of {{ pendingRequests.length }}
          </p>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 text-sm font-sans text-anito-gray">
              Per page
              <select
                :value="pageSize"
                class="border border-anito-gray-light rounded px-2 py-1.5 text-anito-black text-sm focus:border-anito-blue-mid focus:outline-none"
                @change="onPendingPageSizeChange($event)"
              >
                <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
            <div class="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                :disabled="pendingPage <= 1"
                @click="pendingPage--"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                :disabled="pendingPage >= totalPendingPages"
                @click="pendingPage++"
              >
                Next
              </Button>
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
        All Requests ({{ allRequests.length }}) — oldest first
      </h2>
      <div v-if="loading" class="p-8">
        <LoadingBar />
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
              v-for="request in paginatedAllRequests"
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
                  type="button"
                  class="text-anito-blue-mid text-xs font-sans font-medium hover:underline"
                  @click="openDetailModal(request)"
                >
                  {{ request.status === 'pending' ? 'Review' : 'View' }}
                </button>
                <span
                  v-if="request.status !== 'pending'"
                  class="text-anito-gray text-xs font-sans font-light ml-2"
                >
                  {{ formatDateTime(request.reviewed_at) }}
                </span>
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
        <div
          v-if="allRequests.length > pageSize"
          class="p-4 border-t border-anito-gray-light bg-white flex flex-wrap items-center justify-between gap-3"
        >
          <p class="text-anito-gray text-sm font-sans font-light">
            Showing {{ (allRequestsPage - 1) * pageSize + 1 }}–{{ Math.min(allRequestsPage * pageSize, allRequests.length) }} of {{ allRequests.length }}
          </p>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 text-sm font-sans text-anito-gray">
              Per page
              <select
                :value="pageSize"
                class="border border-anito-gray-light rounded px-2 py-1.5 text-anito-black text-sm focus:border-anito-blue-mid focus:outline-none"
                @change="onAllPageSizeChange($event)"
              >
                <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
            <div class="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                :disabled="allRequestsPage <= 1"
                @click="allRequestsPage--"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                :disabled="allRequestsPage >= totalAllRequestsPages"
                @click="allRequestsPage++"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Request detail modal -->
    <div
      v-if="detailModalRequest"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="closeDetailModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto border border-anito-gray-light overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-anito-gray-light flex items-center justify-between">
          <h2 class="font-display font-light text-lg tracking-wide text-anito-black">
            Rectification request
          </h2>
          <button
            type="button"
            class="text-anito-gray hover:text-anito-black transition-colors"
            aria-label="Close"
            @click="closeDetailModal"
          >
            ✕
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <p class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-1">Employee</p>
            <p class="text-sm font-sans text-anito-black">{{ getRequesterName(detailModalRequest.requester) }}</p>
          </div>
          <div>
            <p class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-1">Date</p>
            <p class="text-sm font-sans text-anito-black">{{ formatDate(detailModalRequest.date) }}</p>
          </div>
          <div>
            <p class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-1">Reason</p>
            <p class="text-sm font-sans text-anito-black">{{ detailModalRequest.reason }}</p>
          </div>
          <div
            v-if="detailModalRequest.requested_in || detailModalRequest.requested_out"
            class="flex flex-wrap gap-6"
          >
            <div v-if="detailModalRequest.requested_in">
              <p class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-1">Requested time in</p>
              <p class="text-sm font-sans text-anito-black">{{ detailModalRequest.requested_in }}</p>
            </div>
            <div v-if="detailModalRequest.requested_out">
              <p class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-1">Requested time out</p>
              <p class="text-sm font-sans text-anito-black">{{ detailModalRequest.requested_out }}</p>
            </div>
          </div>
          <div class="text-xs text-anito-gray">
            Requested {{ formatDateTime(detailModalRequest.created_at) }}
          </div>
          <div v-if="detailModalRequest.status !== 'pending'" class="flex gap-2 text-xs text-anito-gray">
            <span
              :class="getStatusClass(detailModalRequest.status)"
              class="text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded font-sans font-medium"
            >
              {{ detailModalRequest.status }}
            </span>
            <span v-if="detailModalRequest.reviewed_at">
              Reviewed {{ formatDateTime(detailModalRequest.reviewed_at) }}
              <span v-if="detailModalRequest.reviewer"> by {{ detailModalRequest.reviewer.full_name }}</span>
            </span>
          </div>
        </div>
        <div
          v-if="detailModalRequest.status === 'pending'"
          class="px-6 py-4 border-t border-anito-gray-light flex gap-2 justify-end"
        >
          <button
            type="button"
            class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black font-sans font-medium"
            @click="closeDetailModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="bg-red-600 text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-red-700 font-sans font-medium disabled:opacity-50"
            :disabled="processing === detailModalRequest.id || processing === 'bulk'"
            @click="openRejectModal(detailModalRequest); closeDetailModal()"
          >
            Reject
          </button>
          <button
            type="button"
            class="bg-green-600 text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-green-700 font-sans font-medium disabled:opacity-50"
            :disabled="processing === detailModalRequest.id || processing === 'bulk'"
            @click="handleApproveFromModal"
          >
            {{ processing === detailModalRequest.id ? '…' : 'Approve' }}
          </button>
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

    <!-- Bulk action confirmation -->
    <Dialog v-model="showBulkConfirm" max-width="max-w-md">
      <template #header>
        <h2 class="font-display font-light text-xl tracking-wide text-anito-black">
          Confirm Bulk Action
        </h2>
      </template>
      <p class="text-anito-gray font-sans font-light mb-6">
        You are about to {{ bulkConfirmAction === 'approve' ? 'approve' : 'reject' }} {{ selectedRequests.length }} request(s). This cannot be undone.
      </p>
      <div class="flex gap-2 justify-end">
        <Button variant="secondary" @click="showBulkConfirm = false">Cancel</Button>
        <Button variant="primary" @click="confirmBulkAction">
          Confirm
        </Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRectificationsStore } from "@/stores/rectifications.js";
import { useAuthStore } from "@/stores/auth.js";
import { useFormatters } from "@/composables/useFormatters.js";
import LoadingBar from "@/components/ui/LoadingBar.vue";
import { Button, Dialog } from "@/components/ui";

const rectificationsStore = useRectificationsStore();
const authStore = useAuthStore();
const { formatDate, formatDateTime, getStatusClass, getRequesterName } = useFormatters();

const activeTab = ref("pending");
const processing = ref(null);
const showRejectModal = ref(false);
const selectedRequest = ref(null);
const rejectSubmitting = ref(false);
const rejectError = ref("");
const detailModalRequest = ref(null);
const selectedRequests = ref([]);
const showBulkConfirm = ref(false);
const bulkConfirmAction = ref('approve');

const pageSizeOptions = [5, 10, 50, 100];
const pageSize = ref(10);
const allRequestsPage = ref(1);
const pendingPage = ref(1);

const loading = computed(() => rectificationsStore.loading);
const error = computed(() => rectificationsStore.error);
const allRequests = computed(() => rectificationsStore.requests);
const pendingRequests = computed(() => rectificationsStore.pendingRequests);
const pendingCount = computed(() => pendingRequests.value.length);
const totalPendingPages = computed(() =>
  Math.max(1, Math.ceil(pendingRequests.value.length / pageSize.value)),
);
const paginatedPendingRequests = computed(() => {
  const list = pendingRequests.value;
  const size = pageSize.value;
  const from = (pendingPage.value - 1) * size;
  return list.slice(from, from + size);
});
const totalAllRequestsPages = computed(() =>
  Math.max(1, Math.ceil(allRequests.value.length / pageSize.value)),
);
const paginatedAllRequests = computed(() => {
  const list = allRequests.value;
  const size = pageSize.value;
  const from = (allRequestsPage.value - 1) * size;
  return list.slice(from, from + size);
});
const allSelected = computed(() => {
  return (
    pendingRequests.value.length > 0 &&
    selectedRequests.value.length === pendingRequests.value.length
  );
});

onMounted(async () => {
  await rectificationsStore.fetchRequests();
});

watch(activeTab, (tab) => {
  if (tab === "all") allRequestsPage.value = 1;
  if (tab === "pending") pendingPage.value = 1;
});

function onPendingPageSizeChange(ev) {
  pageSize.value = Number(ev.target.value);
  pendingPage.value = 1;
}

function onAllPageSizeChange(ev) {
  pageSize.value = Number(ev.target.value);
  allRequestsPage.value = 1;
}

function openDetailModal(request) {
  detailModalRequest.value = request;
}

function closeDetailModal() {
  detailModalRequest.value = null;
}

async function handleApproveFromModal() {
  if (!detailModalRequest.value) return;
  await approveRequest(detailModalRequest.value);
  closeDetailModal();
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

function openBulkConfirm(action) {
  if (selectedRequests.value.length === 0) return;
  bulkConfirmAction.value = action;
  showBulkConfirm.value = true;
}

async function confirmBulkAction() {
  const action = bulkConfirmAction.value;
  showBulkConfirm.value = false;
  if (selectedRequests.value.length === 0) return;

  processing.value = "bulk";
  const status = action === "approve" ? "approved" : "rejected";
  const promises = selectedRequests.value.map((requestId) =>
    rectificationsStore.updateRequestStatus(
      requestId,
      status,
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
    if (import.meta.env.DEV) {
      console.error("Failed to approve request:", result.error);
    }
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

</script>
