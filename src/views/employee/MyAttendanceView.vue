<template>
  <div class="p-6 max-w-4xl">
    <header class="mb-6">
      <h1 class="font-display text-ink text-xl font-semibold tracking-tight">My attendance</h1>
      <p class="text-muted text-sm mt-1">Your attendance log. Use filters to narrow by date.</p>
    </header>

    <section class="bg-panel border border-border rounded-lg overflow-hidden">
      <div class="p-4 border-b border-border bg-surface/30 flex flex-wrap items-end gap-3">
        <div>
          <label for="my-date-from" class="block text-xs font-medium text-muted mb-1">From</label>
          <input
            id="my-date-from"
            v-model="dateFrom"
            type="date"
            class="px-3 py-1.5 bg-surface border border-border rounded text-ink text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label for="my-date-to" class="block text-xs font-medium text-muted mb-1">To</label>
          <input
            id="my-date-to"
            v-model="dateTo"
            type="date"
            class="px-3 py-1.5 bg-surface border border-border rounded text-ink text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          type="button"
          class="px-4 py-1.5 bg-accent text-surface text-sm font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent"
          :disabled="attendance.loading"
          @click="applyFilters"
        >
          {{ attendance.loading ? 'Loading…' : 'Apply' }}
        </button>
      </div>

      <div v-if="attendance.error" class="p-4 text-danger text-sm">{{ attendance.error }}</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-surface/50 border-b border-border">
            <tr>
              <th class="px-4 py-2 font-medium text-muted text-xs uppercase tracking-wider">Date</th>
              <th class="px-4 py-2 font-medium text-muted text-xs uppercase tracking-wider">Time in</th>
              <th class="px-4 py-2 font-medium text-muted text-xs uppercase tracking-wider">Time out</th>
              <th class="px-4 py-2 font-medium text-muted text-xs uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in attendance.listWithName"
              :key="row.id"
              class="border-b border-border hover:bg-surface/30"
            >
              <td class="px-4 py-2 text-ink">{{ formatDate(row.date) }}</td>
              <td class="px-4 py-2 text-muted">{{ formatTime(row.time_in) }}</td>
              <td class="px-4 py-2 text-muted">{{ formatTime(row.time_out) }}</td>
              <td class="px-4 py-2">
                <span :class="statusClass(row.status)">{{ row.status || '—' }}</span>
              </td>
            </tr>
            <tr v-if="!attendance.loading && !attendance.list.length">
              <td colspan="4" class="px-4 py-8 text-center text-muted text-sm">No records for this period.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.js'

const attendance = useAttendanceStore()
const dateFrom = ref('')
const dateTo = ref('')

onMounted(() => {
  setDefaultDates()
  applyFilters()
})

function setDefaultDates() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  dateFrom.value = first.toISOString().slice(0, 10)
  dateTo.value = now.toISOString().slice(0, 10)
}

function applyFilters() {
  attendance.fetchAttendance({
    forCurrentUserOnly: true,
    dateFrom: dateFrom.value || undefined,
    dateTo: dateTo.value || undefined,
  })
}

function formatDate(d) {
  if (!d) return '—'
  return typeof d === 'string' ? d.slice(0, 10) : d
}

function formatTime(t) {
  if (t == null || t === '') return '—'
  const s = typeof t === 'string' ? t : String(t)
  return s.length >= 8 ? s.slice(0, 8) : s
}

function statusClass(status) {
  const m = {
    present: 'text-ink',
    late: 'text-amber-600',
    absent: 'text-danger',
    holiday: 'text-muted',
  }
  return m[status] ?? 'text-muted'
}
</script>
