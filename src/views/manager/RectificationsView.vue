<template>
    <div class="max-w-6xl mx-auto bg-[#ffffff] font-sans antialiased rounded-lg min-h-screen p-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <p class="text-gray-600 text-sm mt-2 leading-relaxed">
          Review and approve employee rectification requests.
        </p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          type="button"
          class="px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
          :class="
            activeTab === 'pending'
              ? 'bg-[#003777] text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          "
          @click="activeTab = 'pending'"
        >
          Pending ({{ pendingCount }})
        </button>
        <button
          type="button"
          class="px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
          :class="
            activeTab === 'all'
              ? 'bg-[#003777] text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          "
          @click="activeTab = 'all'"
        >
          All Requests
        </button>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div
      v-if="activeTab === 'pending' && pendingRequests.length > 0"
      class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between"
    >
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            :checked="allSelected"
            @change="toggleSelectAll"
            class="w-4 h-4 border border-gray-300 rounded text-[#003777]"
          />
          <span class="text-sm font-medium text-gray-900">Select All</span>
        </label>
        <span v-if="selectedRequests.length > 0" class="text-sm text-gray-600">
          {{ selectedRequests.length }} selected
        </span>
      </div>
      <div v-if="selectedRequests.length > 0" class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="processing === 'bulk'"
          @click="openBulkConfirm('approve')"
        >
          <svg v-if="processing !== 'bulk'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416" />
          </svg>
          Approve ({{ selectedRequests.length }})
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="processing === 'bulk'"
          @click="openBulkConfirm('reject')"
        >
          <svg v-if="processing !== 'bulk'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416" />
          </svg>
          Reject ({{ selectedRequests.length }})
        </button>
      </div>
    </div>

    <!-- Pending Requests Section -->
    <section v-if="activeTab === 'pending'" class="rounded-lg border border-gray-200 bg-white overflow-hidden mb-8">
      <div class="px-8 py-6 border-b border-gray-200 bg-gray-50">
        <h2 class="text-lg font-semibold text-gray-900">
          Pending Requests ({{ pendingCount }})
        </h2>
        <p class="text-sm text-gray-600 mt-1">Oldest requests first</p>
      </div>

      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block">
          <div class="w-8 h-8 border-4 border-gray-200 border-t-[#003777] rounded-full animate-spin"></div>
        </div>
      </div>
      <div v-else-if="error" class="p-6">
        <div class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {{ error }}
        </div>
      </div>
      <div v-else-if="!pendingRequests.length" class="p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-gray-900 font-medium text-sm mt-4">No pending requests</h3>
        <p class="text-gray-600 text-sm mt-1">All rectification requests have been reviewed.</p>
      </div>
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="request in paginatedPendingRequests"
          :key="request.id"
          class="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <input
              type="checkbox"
              :checked="selectedRequests.includes(request.id)"
              @change="toggleRequestSelection(request.id)"
              class="w-4 h-4 border border-gray-300 rounded text-[#003777] cursor-pointer"
            />
            <div
              class="flex-1 cursor-pointer min-w-0"
              @click="openDetailModal(request)"
            >
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  :class="
                    request.requested_in
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  "
                >
                  {{ request.requested_in ? "Time In" : "Time Out" }}
                </span>
                <p class="text-sm font-medium text-gray-900 line-clamp-1">
                  {{ request.reason }}
                </p>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-600">
                <span>{{ getRequesterName(request.requester) }}</span>
                <span>{{ formatDate(request.date) }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="processing === request.id || processing === 'bulk'"
              @click.stop="approveRequest(request)"
            >
              <svg v-if="processing !== request.id" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416" />
              </svg>
              {{ processing === request.id ? "…" : "Approve" }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="processing === request.id || processing === 'bulk'"
              @click.stop="openRejectModal(request)"
            >
              <svg v-if="processing !== request.id" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg v-else class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416" />
              </svg>
              {{ processing === request.id ? "…" : "Reject" }}
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-medium text-[#003777] hover:text-[#002555] transition-colors"
              @click.stop="openDetailModal(request)"
            >
              View
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pendingRequests.length > pageSize" class="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <p class="text-sm text-gray-600">
            Showing {{ (pendingPage - 1) * pageSize + 1 }}–{{ Math.min(pendingPage * pageSize, pendingRequests.length) }} of {{ pendingRequests.length }}
          </p>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-gray-600">
              Per page
              <select
                :value="pageSize"
                class="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors"
                @change="onPendingPageSizeChange($event)"
              >
                <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="pendingPage <= 1"
                @click="pendingPage--"
              >
                Previous
              </button>
              <button
                type="button"
                class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="pendingPage >= totalPendingPages"
                @click="pendingPage++"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- All Requests Section -->
    <section v-if="activeTab === 'all'" class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-8 py-6 border-b border-gray-200 bg-gray-50">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          All Requests ({{ allRequests.length }})
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in [
              { value: 'all', label: 'All', count: allRequests.length },
              { value: 'pending', label: 'Pending', count: pendingCount },
              { value: 'approved', label: 'Approved', count: approvedCount },
              { value: 'rejected', label: 'Rejected', count: rejectedCount },
            ]"
            :key="filter.value"
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            :class="
              allStatusFilter === filter.value
                ? filter.value === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : filter.value === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-[#003777] text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
            "
            @click="allStatusFilter = filter.value"
          >
            {{ filter.label }}
            <span
              class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold"
              :class="
                allStatusFilter === filter.value
                  ? 'bg-white/30'
                  : 'bg-gray-200 text-gray-700'
              "
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
      <div v-else-if="error" class="p-6">
        <div class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {{ error }}
        </div>
      </div>
      <div v-else-if="!allRequests.length" class="p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-gray-900 font-medium text-sm mt-4">No requests found</h3>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[#003777]">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Employee</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Date</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Reason</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Status</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wide">Reviewed By</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="request in paginatedAllRequests"
              :key="request.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ getRequesterName(request.requester) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(request.date) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" :title="request.reason">
                {{ request.reason }}
              </td>
              <td class="px-6 py-4">
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
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ request.reviewer?.full_name ?? "—" }}
              </td>
              <td class="px-6 py-4 text-center">
                <button
                  type="button"
                  class="text-[#003777] text-xs font-medium hover:text-[#002555] transition-colors"
                  @click="openDetailModal(request)"
                >
                  {{ request.status === 'pending' ? 'Review' : 'View' }}
                </button>
                <span v-if="request.reviewed_at" class="text-gray-500 text-xs ml-2">
                  {{ formatDateTime(request.reviewed_at) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="allRequests.length > pageSize" class="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <p class="text-sm text-gray-600">
            Showing {{ (allRequestsPage - 1) * pageSize + 1 }}–{{ Math.min(allRequestsPage * pageSize, allRequests.length) }} of {{ allRequests.length }}
          </p>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-gray-600">
              Per page
              <select
                :value="pageSize"
                class="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:border-[#003777] focus:ring-1 focus:ring-[#003777] transition-colors"
                @change="onAllPageSizeChange($event)"
              >
                <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="allRequestsPage <= 1"
                @click="allRequestsPage--"
              >
                Previous
              </button>
              <button
                type="button"
                class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="allRequestsPage >= totalAllRequestsPages"
                @click="allRequestsPage++"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Detail Modal -->
    <div
      v-if="detailModalRequest"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      @click.self="closeDetailModal"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-lg w-full overflow-hidden">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Rectification Request</h2>
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
            @click="closeDetailModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-8 space-y-6">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-600 font-medium mb-2">Employee</p>
            <p class="text-sm font-medium text-gray-900">{{ getRequesterName(detailModalRequest.requester) }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-600 font-medium mb-2">Date</p>
            <p class="text-sm text-gray-900">{{ formatDate(detailModalRequest.date) }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-600 font-medium mb-2">Reason</p>
            <p class="text-sm text-gray-900">{{ detailModalRequest.reason }}</p>
          </div>
          <div v-if="detailModalRequest.requested_in || detailModalRequest.requested_out" class="flex flex-wrap gap-6">
            <div v-if="detailModalRequest.requested_in">
              <p class="text-xs uppercase tracking-wide text-gray-600 font-medium mb-2">Requested Time In</p>
              <p class="text-sm font-medium text-gray-900">{{ detailModalRequest.requested_in }}</p>
            </div>
            <div v-if="detailModalRequest.requested_out">
              <p class="text-xs uppercase tracking-wide text-gray-600 font-medium mb-2">Requested Time Out</p>
              <p class="text-sm font-medium text-gray-900">{{ detailModalRequest.requested_out }}</p>
            </div>
          </div>
          <div class="text-xs text-gray-600">
            Requested {{ formatDateTime(detailModalRequest.created_at) }}
          </div>
          <div v-if="detailModalRequest.status !== 'pending'" class="flex items-center gap-2 text-xs">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full font-semibold"
              :class="
                detailModalRequest.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              "
            >
              {{ detailModalRequest.status }}
            </span>
            <span v-if="detailModalRequest.reviewed_at" class="text-gray-600">
              Reviewed {{ formatDateTime(detailModalRequest.reviewed_at) }}
              <span v-if="detailModalRequest.reviewer"> by {{ detailModalRequest.reviewer.full_name }}</span>
            </span>
          </div>
        </div>

        <!-- Modal Actions -->
        <div v-if="detailModalRequest.status === 'pending'" class="px-8 py-6 border-t border-gray-200 flex gap-3 justify-end">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            @click="closeDetailModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="processing === detailModalRequest.id || processing === 'bulk'"
            @click="openRejectModal(detailModalRequest); closeDetailModal()"
          >
            Reject
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="processing === detailModalRequest.id || processing === 'bulk'"
            @click="handleApproveFromModal"
          >
            {{ processing === detailModalRequest.id ? "Approving…" : "Approve" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      @click.self="closeRejectModal"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Reject Request</h2>
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
            @click="closeRejectModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-8">
          <div v-if="selectedRequest" class="mb-6">
            <p class="text-sm text-gray-600 mb-2">
              Request from
              <strong class="text-gray-900">{{ getRequesterName(selectedRequest.requester) }}</strong>
              for
              <strong class="text-gray-900">{{ formatDate(selectedRequest.date) }}</strong>
            </p>
            <p class="text-sm font-medium text-gray-900">{{ selectedRequest.reason }}</p>
          </div>

          <form class="space-y-4" @submit.prevent="rejectRequest">
            <div v-if="rejectError" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {{ rejectError }}
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                @click="closeRejectModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="rejectSubmitting"
              >
                {{ rejectSubmitting ? "Rejecting…" : "Reject Request" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Bulk Confirmation Modal -->
    <div
      v-if="showBulkConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      @click.self="showBulkConfirm = false"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Confirm Bulk Action</h2>
        </div>

        <!-- Modal Content -->
        <div class="p-8">
          <p class="text-sm text-gray-600 mb-6">
            You are about to <strong>{{ bulkConfirmAction === 'approve' ? 'approve' : 'reject' }}</strong> {{ selectedRequests.length }} request(s). This action cannot be undone.
          </p>

          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              @click="showBulkConfirm = false"
            >
              Cancel
            </button>
            <button
              type="button"
              :class="[
                'flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                bulkConfirmAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              ]"
              :disabled="processing === 'bulk'"
              @click="confirmBulkAction"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRectificationsStore } from "@/stores/rectifications.js";
import { useAuthStore } from "@/stores/auth.js";
import { useFormatters } from "@/composables/useFormatters.js";

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
const bulkConfirmAction = ref("approve");

const pageSizeOptions = [5, 10, 50, 100];
const pageSize = ref(10);
const allRequestsPage = ref(1);
const pendingPage = ref(1);

const loading = computed(() => rectificationsStore.loading);
const error = computed(() => rectificationsStore.error);
const allRequests = computed(() => rectificationsStore.requests);
const pendingRequests = computed(() => rectificationsStore.pendingRequests);
const approvedRequests = computed(() => rectificationsStore.approvedRequests);
const rejectedRequests = computed(() => rectificationsStore.rejectedRequests);
const pendingCount = computed(() => pendingRequests.value.length);
const approvedCount = computed(() => approvedRequests.value.length);
const rejectedCount = computed(() => rejectedRequests.value.length);

const allStatusFilter = ref("all");
const filteredAllRequests = computed(() => {
  if (allStatusFilter.value === "all") return allRequests.value;
  return allRequests.value.filter((r) => r.status === allStatusFilter.value);
});

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
  Math.max(1, Math.ceil(filteredAllRequests.value.length / pageSize.value)),
);
const paginatedAllRequests = computed(() => {
  const list = filteredAllRequests.value;
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
  await rectificationsStore.updateRequestStatus(
    request.id,
    "approved",
    authStore.profile?.id,
  );
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