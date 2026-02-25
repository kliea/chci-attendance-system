<template>
  <div class="max-w-4xl">
    <header class="mb-6">
      <h1 class="font-display font-light text-xl tracking-wide text-anito-black">My attendance</h1>
      <p class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed">Your attendance log by day. Filter by month.</p>
    </header>

    <Card>
      <CardHeaderFlex class="flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-end gap-3">
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
        </div>
        <div class="flex flex-wrap items-center gap-3 self-center">
          <span class="text-sm font-sans text-anito-black">
            Total rendered hours this month: <span class="font-mono font-medium">{{ totalHoursFormatted }}</span>
          </span>
          <PrintDailyLogsButton
            size="sm"
            :employee-name="employeeName"
            :month-label="monthLabel"
            :selected-month="selectedMonth"
            :logs="attendance.list"
            :day-rows="dayRows"
          />
        </div>
      </CardHeaderFlex>

      <div v-if="attendance.error" class="p-4 text-red-600 text-sm">{{ attendance.error }}</div>
      <div v-else-if="attendance.loading" class="p-4 text-anito-gray text-sm">Loading…</div>
      <AttendanceDayTable
        v-else
        :day-rows="dayRows"
        empty-text="No records for this month."
      />
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.js'
import { useAuthStore } from '@/stores/auth.js'
import { buildDayRows, totalHoursRenderedInMonth, formatHours } from '@/composables/useAttendanceDayRows.js'
import { Card, CardHeaderFlex, Input, Label, Button, AttendanceDayTable, PrintDailyLogsButton } from '@/components/ui'

const attendance = useAttendanceStore()
const auth = useAuthStore()

const employeeName = computed(() => auth.fullName || auth.profile?.full_name || '')
const monthLabel = computed(() => {
  const ym = selectedMonth.value
  if (!ym || ym.length < 7) return ''
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

function currentYearMonth() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
const selectedMonth = ref(currentYearMonth())

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

const dayRows = computed(() =>
  buildDayRows(selectedMonth.value, attendance.list)
)

const totalHoursFormatted = computed(() =>
  formatHours(totalHoursRenderedInMonth(selectedMonth.value, attendance.list)) ?? '—'
)

onMounted(() => {
  setDefaultMonth()
  applyMonth()
})

function setDefaultMonth() {
  selectedMonth.value = currentYearMonth()
}

// Fetches current user's rows from attendance_logs for the selected month (profile.bio_id → staff_id).
function applyMonth() {
  const { dateFrom, dateTo } = monthRange.value
  if (!dateFrom || !dateTo) return
  attendance.fetchAttendance({
    forCurrentUserOnly: true,
    dateFrom,
    dateTo,
  })
}
</script>
