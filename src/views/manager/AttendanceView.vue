<template>
  <div class="max-w-5xl">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
      <div>
        <h1 class="font-display font-light text-xl tracking-wide text-anito-black">Employee DTR</h1>
        <p class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed">Per-employee summary and daily logs. Filter by month, view or print DTR.</p>
      </div>
    </header>

    <Card class="no-print">
      <CardHeaderFlex>
        <div>
            <Label for-id="my-month-filter">Month</Label>
            <Input
              id="my-month-filter"
              v-model="selectedMonth"
              type="month"
              class="h-10"
              @change="applyMonth"
            />
          </div>
          <Button
            variant="secondary"
            class="h-10"
            :disabled="attendance.loading"
            @click="applyMonth"
          >
            {{ attendance.loading ? 'Loading…' : 'Apply' }}
          </Button>
      </CardHeaderFlex>

      <div v-if="attendance.error" class="p-4 text-red-600 text-sm">{{ attendance.error }}</div>
      <DataTable
        v-else
        :columns="summaryColumns"
        :data="employeeRows"
        :empty="!attendance.loading && !employeeRows.length"
        empty-text="No data for this month. Select a month and apply, or import attendance."
        :row-class="() => 'cursor-pointer'"
        :row-click="openDetail"
      >
        <template #row="{ row }">
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
        </template>
      </DataTable>
    </Card>

    <div class="no-print">
      <Dialog v-model="showDetailModal" max-width="max-w-3xl">
      <template #header>
        <h2 class="font-display font-light text-lg tracking-wide text-anito-black">
          Daily logs — {{ selectedEmployee?.full_name }} ({{ selectedEmployee?.bio_id }})
        </h2>
      </template>
      <template #actions>
        <Button
          variant="secondary"
          size="sm"
          :disabled="appendix24TemplateLoading"
          @click="downloadAppendix24FillerTemplate"
        >
          {{ appendix24TemplateLoading ? 'Generating…' : 'Download filler template' }}
        </Button>
        <PrintDailyLogsButton
          size="sm"
          :employee-name="selectedEmployee?.full_name ?? ''"
          :month-label="formatMonthLabel(selectedMonth)"
          :selected-month="selectedMonth"
          :logs="detailLogs"
          :day-rows="detailDayRows"
        />
      </template>
      <div class="p-4">
        <AttendanceDayTable
          :day-rows="detailDayRows"
          empty-text="No daily logs for this month."
        />
      </div>
    </Dialog>
    </div>

    <div id="dtr-print-area" class="hidden print:block p-6">
      <div v-if="printPayload" class="print-content">
        <h2 class="font-display text-lg font-light mb-2">Employee DTR</h2>
        <p class="text-sm text-anito-gray mb-4">{{ printPayload.title }}</p>
        <table v-if="printPayload.type === 'summary'" class="w-full text-sm text-left border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-3 py-2 text-left font-medium">Name</th>
              <th class="px-3 py-2 text-left font-medium">Bio ID</th>
              <th class="px-3 py-2 text-left font-medium">Program</th>
              <th class="px-3 py-2 text-left font-medium">Hours</th>
              <th class="px-3 py-2 text-left font-medium">Days</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in printPayload.rows" :key="r.id" class="border-t border-gray-200">
              <td class="px-3 py-2">{{ r.full_name }}</td>
              <td class="px-3 py-2">{{ r.bio_id || '—' }}</td>
              <td class="px-3 py-2">{{ r.program || '—' }}</td>
              <td class="px-3 py-2">{{ r.hours }}</td>
              <td class="px-3 py-2">{{ r.daysPresent }}</td>
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
import { buildDayRows, totalHoursRenderedInMonth } from '@/composables/useAttendanceDayRows.js'
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
const selectedEmployee = ref(null)
const showDetailModal = computed({
  get: () => !!selectedEmployee.value,
  set: (v) => { if (!v) selectedEmployee.value = null },
})
const printPayload = ref(null)
const appendix24TemplateLoading = ref(false)

const summaryColumns = [
  { key: 'full_name', label: 'Name' },
  { key: 'bio_id', label: 'Bio ID' },
  { key: 'program', label: 'Program' },
  { key: 'hours', label: 'Hours rendered' },
  { key: 'daysPresent', label: 'Days present' },
  { key: 'actions', label: 'Actions', class: 'w-24' },
]

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
    const hours = totalHoursRenderedInMonth(selectedMonth.value, logs)
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
    console.error('Filler template PDF failed:', err)
  } finally {
    appendix24TemplateLoading.value = false
  }
}

function printCurrent() {
  if (selectedEmployee.value) {
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
    padding: 0.5in;
    max-width: 100%;
  }
}
</style>
