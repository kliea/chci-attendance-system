<template>
  <div class="max-w-5xl">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
      <div>
        <h1 class="font-display font-light text-xl tracking-wide text-anito-black">Employee DTR</h1>
        <p class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed">Per-employee summary and daily logs. Filter by month, view or print DTR.</p>
      </div>
      <div class="flex items-center gap-2 no-print">
        <button
          type="button"
          class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase font-sans font-medium px-4 py-2 rounded hover:border-anito-blue-mid hover:text-anito-blue-mid transition-colors duration-150"
          :disabled="!canPrint"
          @click="printCurrent"
        >
          Print DTR
        </button>
      </div>
    </header>

    <section class="rounded border border-anito-gray-light overflow-hidden no-print">
      <div class="p-4 border-b border-anito-gray-light bg-white space-y-3">
        <div class="flex flex-wrap items-end gap-3">
          <div>
            <label for="month-filter" class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-1">Month</label>
            <input
              id="month-filter"
              v-model="selectedMonth"
              type="month"
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none transition-colors"
              @change="applyMonth"
            />
          </div>
          <button
            type="button"
            class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase font-sans font-medium px-4 py-2 rounded hover:border-anito-blue-mid hover:text-anito-blue-mid transition-colors duration-150 disabled:opacity-50"
            :disabled="attendance.loading"
            @click="applyMonth"
          >
            {{ attendance.loading ? 'Loading…' : 'Apply' }}
          </button>
        </div>
      </div>

      <div v-if="attendance.error" class="p-4 text-red-600 text-sm">{{ attendance.error }}</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left dtr-table">
          <thead class="bg-anito-black">
            <tr>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Name</th>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Bio ID</th>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Program</th>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Hours rendered</th>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Days present</th>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in employeeRows"
              :key="row.id"
              class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150 cursor-pointer"
              @click="openDetail(row)"
            >
              <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ row.full_name }}</td>
              <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ row.bio_id || '—' }}</td>
              <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ row.program || '—' }}</td>
              <td class="px-4 py-3 font-mono text-sm text-anito-gray">{{ row.hours }}</td>
              <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ row.daysPresent }}</td>
              <td class="px-4 py-3" @click.stop>
                <button
                  type="button"
                  class="text-anito-blue-mid text-[10px] tracking-[0.15em] uppercase font-sans font-medium hover:text-anito-blue-deep transition-colors"
                  @click="openDetail(row)"
                >
                  View logs
                </button>
              </td>
            </tr>
            <tr v-if="!attendance.loading && !employeeRows.length">
              <td colspan="6" class="px-4 py-8 text-center text-anito-gray text-sm font-sans font-light">No data for this month. Select a month and apply, or import attendance.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Detail modal: daily logs for selected employee -->
    <div
      v-if="selectedEmployee"
      class="fixed inset-0 z-20 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm no-print"
      @click.self="selectedEmployee = null"
    >
      <div class="bg-anito-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div class="p-4 border-b border-anito-gray-light flex items-center justify-between">
          <h2 class="font-display font-light text-lg tracking-wide text-anito-black">
            Daily logs — {{ selectedEmployee.full_name }} ({{ selectedEmployee.bio_id }})
          </h2>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase font-sans font-medium px-3 py-1.5 rounded hover:border-anito-blue-mid hover:text-anito-blue-mid transition-colors"
              @click="printDailyLogs"
            >
              Print daily logs
            </button>
            <button type="button" class="text-anito-gray hover:text-anito-black transition-colors" aria-label="Close" @click="selectedEmployee = null">✕</button>
          </div>
        </div>
        <div class="overflow-x-auto flex-1 p-4">
          <table class="w-full text-sm text-left dtr-detail-table">
            <thead class="bg-anito-black">
              <tr>
                <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Date</th>
                <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Time in</th>
                <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Time out</th>
                <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="log in detailLogs"
                :key="log.id"
                class="bg-white border-b border-anito-gray-light"
              >
                <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ formatDate(log.date) }}</td>
                <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(log.time_in) }}</td>
                <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(log.time_out) }}</td>
                <td class="px-4 py-3">
                  <span :class="statusBadgeClass(log.status)">{{ log.status || '—' }}</span>
                </td>
              </tr>
              <tr v-if="!detailLogs.length">
                <td colspan="4" class="px-4 py-8 text-center text-anito-gray text-sm">No daily logs for this month.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Print-only area: filled before window.print() -->
    <div id="dtr-print-area" class="hidden print:block p-6">
      <div v-if="printPayload" class="print-content">
        <h2 class="font-display text-lg font-light mb-2">Employee DTR</h2>
        <p class="text-sm text-anito-gray mb-4">{{ printPayload.title }}</p>
        <table class="w-full text-sm text-left border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-3 py-2 text-left font-medium">Name</th>
              <th class="px-3 py-2 text-left font-medium">Bio ID</th>
              <th class="px-3 py-2 text-left font-medium">Program</th>
              <th class="px-3 py-2 text-left font-medium">Hours</th>
              <th class="px-3 py-2 text-left font-medium">Days</th>
            </tr>
          </thead>
          <tbody v-if="printPayload.type === 'summary'">
            <tr v-for="r in printPayload.rows" :key="r.id" class="border-t border-gray-200">
              <td class="px-3 py-2">{{ r.full_name }}</td>
              <td class="px-3 py-2">{{ r.bio_id || '—' }}</td>
              <td class="px-3 py-2">{{ r.program || '—' }}</td>
              <td class="px-3 py-2">{{ r.hours }}</td>
              <td class="px-3 py-2">{{ r.daysPresent }}</td>
            </tr>
          </tbody>
        </table>
        <table v-if="printPayload.type === 'daily'" class="w-full text-sm mt-4 border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-3 py-2 text-left font-medium">Date</th>
              <th class="px-3 py-2 text-left font-medium">Time in</th>
              <th class="px-3 py-2 text-left font-medium">Time out</th>
              <th class="px-3 py-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in printPayload.logs" :key="log.id" class="border-t border-gray-200">
              <td class="px-3 py-2">{{ formatDate(log.date) }}</td>
              <td class="px-3 py-2">{{ formatTime(log.time_in) }}</td>
              <td class="px-3 py-2">{{ formatTime(log.time_out) }}</td>
              <td class="px-3 py-2">{{ log.status || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.js'
import { useStaffStore } from '@/stores/staff.js'
import { useEmployeesStore } from '@/stores/employees.js'
import { groupLogsByStaff } from '@/composables/useHoursRendered.js'

const attendance = useAttendanceStore()
const staff = useStaffStore()
const employees = useEmployeesStore()

const selectedMonth = ref('')
const selectedEmployee = ref(null)
const printPayload = ref(null)

const monthRange = computed(() => {
  if (!selectedMonth.value || selectedMonth.value.length < 7) return { dateFrom: null, dateTo: null }
  const [y, m] = selectedMonth.value.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const last = new Date(y, m, 0)
  return {
    dateFrom: first.toISOString().slice(0, 10),
    dateTo: last.toISOString().slice(0, 10),
  }
})

const profileByBioId = computed(() => {
  const map = {}
  for (const p of employees.list) {
    if (p.bio_id) map[p.bio_id] = p
  }
  return map
})

const staffSummary = computed(() => groupLogsByStaff(attendance.list))

const employeeRows = computed(() => {
  return staff.list.map((s) => {
    const sum = staffSummary.value[s.id] || { hours: 0, daysPresent: 0 }
    return {
      ...s,
      program: profileByBioId.value[s.bio_id]?.program ?? '—',
      hours: sum.hours,
      daysPresent: sum.daysPresent,
    }
  })
})

const detailLogs = computed(() => {
  if (!selectedEmployee.value) return []
  return attendance.list
    .filter((row) => row.staff_id === selectedEmployee.value.id)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
})

const canPrint = computed(() => {
  if (selectedEmployee.value) return true
  return employeeRows.value.length > 0
})

function setDefaultMonth() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  selectedMonth.value = `${y}-${m}`
}

function applyMonth() {
  const { dateFrom, dateTo } = monthRange.value
  if (!dateFrom || !dateTo) return
  attendance.fetchAttendance({ dateFrom, dateTo })
}

function openDetail(row) {
  selectedEmployee.value = row
}

function printDailyLogs() {
  if (!selectedEmployee.value) return
  printPayload.value = {
    type: 'daily',
    title: `Daily logs — ${selectedEmployee.value.full_name} (${selectedEmployee.value.bio_id}) — ${monthRange.value.dateFrom} to ${monthRange.value.dateTo}`,
    logs: detailLogs.value,
  }
  setTimeout(() => {
    window.print()
  }, 100)
}

function printCurrent() {
  if (selectedEmployee.value) {
    printDailyLogs()
    return
  }
  printPayload.value = {
    type: 'summary',
    title: `Employee DTR — ${monthRange.value.dateFrom} to ${monthRange.value.dateTo}`,
    rows: employeeRows.value,
  }
  setTimeout(() => {
    window.print()
  }, 100)
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

function statusBadgeClass(status) {
  const m = {
    present: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#e8f4ec] text-[#276749]',
    late: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#fef3e2] text-[#9a5f1a]',
    absent: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#fdecea] text-[#b91c1c]',
    holiday: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#f3f4f6] text-anito-gray',
  }
  return m[status] ?? 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-anito-blue-light text-anito-blue-deep'
}

onMounted(async () => {
  await Promise.all([staff.fetchStaff(), employees.fetchEmployees()])
  setDefaultMonth()
  applyMonth()
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  #dtr-print-area {
    display: block !important;
  }
}
</style>
