<template>
  <div class="p-6 max-w-5xl">
    <header class="mb-6">
      <h1 class="font-display text-ink text-xl font-semibold tracking-tight">Attendance</h1>
      <p class="text-muted text-sm mt-1">View and filter attendance logs. Data from biometric import or manual entry.</p>
    </header>

    <section class="bg-panel border border-border rounded-lg overflow-hidden">
      <div class="p-4 border-b border-border bg-surface/30 space-y-3">
        <div class="flex flex-wrap items-end gap-3">
          <div>
            <label for="date-from" class="block text-xs font-medium text-muted mb-1">From</label>
            <input
              id="date-from"
              v-model="filters.dateFrom"
              type="date"
              class="px-3 py-1.5 bg-surface border border-border rounded text-ink text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label for="date-to" class="block text-xs font-medium text-muted mb-1">To</label>
            <input
              id="date-to"
              v-model="filters.dateTo"
              type="date"
              class="px-3 py-1.5 bg-surface border border-border rounded text-ink text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label for="filter-staff" class="block text-xs font-medium text-muted mb-1">Staff</label>
            <select
              id="filter-staff"
              v-model="filters.staffId"
              class="px-3 py-1.5 bg-surface border border-border rounded text-ink text-sm focus:outline-none focus:ring-1 focus:ring-accent min-w-[160px]"
            >
              <option value="">All</option>
              <option v-for="s in staffOptions" :key="s.id" :value="s.id">{{ s.full_name }} ({{ s.bio_id }})</option>
            </select>
          </div>
          <div>
            <label for="filter-status" class="block text-xs font-medium text-muted mb-1">Status</label>
            <select
              id="filter-status"
              v-model="filters.status"
              class="px-3 py-1.5 bg-surface border border-border rounded text-ink text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="holiday">Holiday</option>
            </select>
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
      </div>

      <div v-if="attendance.error" class="p-4 text-danger text-sm">{{ attendance.error }}</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-surface/50 border-b border-border">
            <tr>
              <th class="px-4 py-2 font-medium text-muted text-xs uppercase tracking-wider">Name</th>
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
              <td class="px-4 py-2 text-ink">{{ row.full_name }}</td>
              <td class="px-4 py-2 text-muted">{{ formatDate(row.date) }}</td>
              <td class="px-4 py-2 text-muted">{{ formatTime(row.time_in) }}</td>
              <td class="px-4 py-2 text-muted">{{ formatTime(row.time_out) }}</td>
              <td class="px-4 py-2">
                <span :class="statusClass(row.status)">{{ row.status || '—' }}</span>
              </td>
            </tr>
            <tr v-if="!attendance.loading && !attendance.list.length">
              <td colspan="5" class="px-4 py-8 text-center text-muted text-sm">No records. Try different filters or import attendance data.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.js'
import { useStaffStore } from '@/stores/staff.js'

const attendance = useAttendanceStore()
const staff = useStaffStore()

const filters = reactive({
  dateFrom: '',
  dateTo: '',
  staffId: '',
  status: '',
})

const staffOptions = ref([])

onMounted(async () => {
  await staff.fetchStaff()
  staffOptions.value = staff.list
  setDefaultDates()
  applyFilters()
})

function setDefaultDates() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  filters.dateFrom = first.toISOString().slice(0, 10)
  filters.dateTo = now.toISOString().slice(0, 10)
}

function applyFilters() {
  attendance.fetchAttendance({
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    staffId: filters.staffId || undefined,
    status: filters.status || undefined,
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
