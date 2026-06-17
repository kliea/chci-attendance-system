<template>
    <div class="max-w-6xl mx-auto bg-[#ffffff] font-sans antialiased rounded-lg min-h-screen p-8">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
      <div>
        <p class="text-gray-500 text-sm font-sans font-light mt-1.5 leading-relaxed">Per-employee summary and daily logs. Filter by month, view or print DTR.</p>
      </div>
    </header>

    <Card class="no-print bg-[#ffffff] font-sans">
      <CardHeaderFlex>
        <div>
          <Label for-id="my-month-filter" class="text-gray-700 font-sans">Month</Label>
          <Input
            id="my-month-filter"
            v-model="selectedMonth"
            type="month"
            class="h-10 font-sans focus:border-[#003777] focus:ring-[#003777]"
            @change="applyMonth"
          />
        </div>
        <div class="flex items-end gap-2">
          <Button
            variant="secondary"
            class="h-10 bg-[#003777] text-white hover:bg-[#003777]/90 font-sans"
            :disabled="attendance.loading"
            @click="applyMonth"
          >
            {{ attendance.loading ? 'Loading…' : 'Apply' }}
          </Button>
          <Button
            variant="outline"
            class="h-10 text-[10px] tracking-[0.15em] uppercase font-sans font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
            :disabled="attendance.loading"
            @click="toggleAllTimeTotals"
          >
            {{ showAllTimeTotals ? 'Show month only' : 'Show all-time total' }}
          </Button>
        </div>
      </CardHeaderFlex>

      <div v-if="attendance.error" class="p-4 text-[#550000] bg-red-50 text-sm font-sans">{{ attendance.error }}</div>
      <DataTable
        v-else
        :columns="summaryColumns"
        :data="employeeRows"
        :empty="!attendance.loading && !employeeRows.length"
        empty-text="No data for this month. Select a month and apply, or import attendance."
        :row-class="() => 'cursor-pointer hover:bg-gray-50 font-sans'"
        :row-click="openDetail"
      >
        <template #row="{ row }">
          <td class="px-4 py-3 text-sm font-sans text-gray-900">{{ row.full_name }}</td>
          <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ row.bio_id || '—' }}</td>
          <td class="px-4 py-3 text-sm font-sans text-gray-900">{{ row.program || '—' }}</td>
          <td class="px-4 py-3 font-mono text-sm text-[#003777] font-semibold">{{ row.hours }}</td>
          <td class="px-4 py-3 text-sm font-sans text-gray-900">{{ row.daysPresent }}</td>
          <td class="px-4 py-3" @click.stop>
            <button
              type="button"
              class="text-[#550000] text-[10px] tracking-[0.15em] uppercase font-sans font-medium hover:text-[#550000]/80 transition-colors"
              @click="openDetail(row)"
            >
              View logs
            </button>
          </td>
        </template>
      </DataTable>
    </Card>

    <div class="no-print">
      <Dialog v-model="showDetailModal" max-width="max-w-3xl">
        <template #header>
          <h2 class="font-sans font-light text-lg tracking-wide text-gray-900">
            {{ showAllTimeTotals ? 'Monthly summary' : 'Daily logs' }} — {{ selectedEmployee?.full_name }} ({{ selectedEmployee?.bio_id }})
          </h2>
        </template>
        <template #actions>
          <template v-if="!showAllTimeTotals">
            <Button
              variant="secondary"
              size="sm"
              class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-sans"
              :disabled="appendix24TemplateLoading"
              @click="downloadAppendix24FillerTemplate"
            >
              {{ appendix24TemplateLoading ? 'Generating…' : 'Download filler template' }}
            </Button>
            <PrintDailyLogsButton
              size="sm"
              class="bg-[#003777] text-white hover:bg-[#003777]/90 font-sans"
              :employee-name="selectedEmployee?.full_name ?? ''"
              :month-label="formatMonthLabel(selectedMonth)"
              :selected-month="selectedMonth"
              :logs="detailLogs"
              :day-rows="detailDayRows"
            />
          </template>
        </template>
        <div class="p-4 bg-[#ffffff] font-sans">
          <AttendanceDayTable
            v-if="!showAllTimeTotals"
            :day-rows="detailDayRows"
            empty-text="No daily logs for this month."
          />
          <div v-else class="space-y-3">
            <table class="w-full text-sm text-left border border-gray-200 rounded bg-[#ffffff] font-sans">
              <thead class="bg-[#003777]">
                <tr>
                  <th class="px-3 py-2 text-white text-[9px] tracking-[0.25em] uppercase font-sans font-medium text-left">
                    Month
                  </th>
                  <th class="px-3 py-2 text-white text-[9px] tracking-[0.25em] uppercase font-sans font-medium text-left">
                    Hours rendered
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="row in detailMonthlyRows"
                  :key="row.ym"
                  class="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td class="px-3 py-2 text-gray-900">
                    {{ row.label }}
                  </td>
                  <td class="px-3 py-2 font-mono text-xs text-[#550000] font-semibold">
                    {{ row.hours }}
                  </td>
                </tr>
                <tr v-if="!detailMonthlyRows.length">
                  <td
                    colspan="2"
                    class="px-3 py-2 text-gray-400 text-sm font-sans font-light"
                  >
                    No logs for this employee.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>
    </div>

    <div id="dtr-print-area" class="hidden print:block p-6 bg-white font-sans">
      <div v-if="printPayload" class="print-content">
        <h2 class="font-sans text-lg font-light mb-2 text-gray-900">Employee DTR</h2>
        <p class="text-sm text-gray-500 mb-4 font-sans">{{ printPayload.title }}</p>
        <table v-if="printPayload.type === 'summary'" class="w-full text-sm text-left border border-gray-300 bg-white font-sans">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-3 py-2 text-left font-medium text-gray-800 font-sans">Name</th>
              <th class="px-3 py-2 text-left font-medium text-gray-800 font-sans">Bio ID</th>
              <th class="px-3 py-2 text-left font-medium text-gray-800 font-sans">Program</th>
              <th class="px-3 py-2 text-left font-medium text-[#003777] font-sans">Hours</th>
              <th class="px-3 py-2 text-left font-medium text-gray-800 font-sans">Days</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in printPayload.rows" :key="r.id" class="border-t border-gray-200">
              <td class="px-3 py-2 text-gray-900 font-sans">{{ r.full_name }}</td>
              <td class="px-3 py-2 text-gray-600 font-mono">{{ r.bio_id || '—' }}</td>
              <td class="px-3 py-2 text-gray-600 font-sans">{{ r.program || '—' }}</td>
              <td class="px-3 py-2 font-mono text-[#003777] font-semibold">{{ r.hours }}</td>
              <td class="px-3 py-2 text-gray-900 font-sans">{{ r.daysPresent }}</td>
            </tr>
          </tbody>
        </table>
        <AttendanceDayTable
          v-else-if="printPayload.type === 'daily'"
          :day-rows="printPayload.dayRows"
          empty-text="No daily logs for this month."
          :print-mode="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.js'
import { useStaffStore } from '@/stores/staff.js'
import { useEmployeesStore } from '@/stores/employees.js'
import { groupLogsByStaff } from '@/composables/useHoursRendered.js'
import { buildDayRows, totalHoursRenderedInMonth, totalHoursRenderedAllTime } from '@/composables/useAttendanceDayRows.js'
import { formatDate } from '@/composables/useFormatters.js'
import { getAppendix24TemplateBlob } from '@/composables/useFillAppendix24Pdf.js'
import {
  Button,
  Card,
  CardHeaderFlex,
  DataTable,
  Dialog,
  Input,
  Label,
  AttendanceDayTable,
  PrintDailyLogsButton,
} from '@/components/ui'

const attendance = useAttendanceStore()
const staff = useStaffStore()
const employees = useEmployeesStore()

const selectedMonth = ref('')
const showAllTimeTotals = ref(false)
const selectedEmployee = ref(null)
const showDetailModal = computed({
  get: () => !!selectedEmployee.value,
  set: (v) => { if (!v) selectedEmployee.value = null },
})
const printPayload = ref(null)
const appendix24TemplateLoading = ref(false)

const summaryColumns = computed(() => [
  { key: 'full_name', label: 'Name' },
  { key: 'bio_id', label: 'Bio ID' },
  { key: 'program', label: 'Program' },
  {
    key: 'hours',
    label: showAllTimeTotals.value ? 'Hours rendered (all time)' : 'Hours rendered (month)',
  },
  { key: 'daysPresent', label: 'Days present' },
  { key: 'actions', label: 'Actions', class: 'w-24' },
])

const monthRange = computed(() => {
  if (!selectedMonth.value || selectedMonth.value.length < 7) return { dateFrom: null, dateTo: null }
  const [y, m] = selectedMonth.value.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const last = new Date(y, m, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    dateFrom: `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`,
    dateTo: `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`,
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
    const sum = staffSummary.value[s.id] || { hours: 0, daysPresent: 0, logs: [] }
    const logs = sum.logs || []
    const hours = showAllTimeTotals.value
      ? totalHoursRenderedAllTime(logs)
      : totalHoursRenderedInMonth(selectedMonth.value, logs)
    return {
      ...s,
      program: profileByBioId.value[s.bio_id]?.program ?? '—',
      hours,
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

const detailDayRows = computed(() =>
  buildDayRows(selectedMonth.value, detailLogs.value)
)

const detailMonthlyRows = computed(() => {
  if (!selectedEmployee.value) return []
  const byMonth = {}
  for (const log of detailLogs.value) {
    const d =
      (typeof log.date === 'string' ? log.date : log.date?.slice?.(0, 10)) ??
      ''
    if (!d) continue
    const ym = d.slice(0, 7)
    if (!byMonth[ym]) byMonth[ym] = []
    byMonth[ym].push(log)
  }
  const rows = Object.entries(byMonth).map(([ym, logs]) => ({
    ym,
    label: formatMonthLabel(ym),
    hours: totalHoursRenderedInMonth(ym, logs),
  }))
  rows.sort((a, b) => (a.ym < b.ym ? -1 : 1))
  return rows
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
  showAllTimeTotals.value = false
  attendance.fetchAttendance({ dateFrom, dateTo })
}

function toggleAllTimeTotals() {
  if (showAllTimeTotals.value) {
    showAllTimeTotals.value = false
    applyMonth()
  } else {
    showAllTimeTotals.value = true
    attendance.fetchAttendance({})
  }
}

function openDetail(row) {
  selectedEmployee.value = row
}

function formatMonthLabel(ym) {
  if (!ym || ym.length < 7) return ''
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

async function downloadAppendix24FillerTemplate() {
  appendix24TemplateLoading.value = true
  try {
    const { blobUrl } = await getAppendix24TemplateBlob()
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = 'DTR_Appendix24_filler_template.pdf'
    a.click()
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('Filler template PDF failed:', err)
    }
  } finally {
    appendix24TemplateLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([staff.fetchStaff(), employees.fetchEmployees()])
  setDefaultMonth()
  applyMonth()
})
</script>

<style scoped>
:deep(th) {
  background-color: #003777 !important;
  color: #ffffff !important;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
}

:deep(td) {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
}

@media print {
  .no-print {
    display: none !important;
  }
  #dtr-print-area {
    display: block !important;
    padding: 0.5in;
    max-width: 100%;
  }
}
</style>