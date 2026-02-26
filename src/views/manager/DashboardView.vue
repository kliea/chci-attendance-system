<template>
  <div class="px-8 py-10">
    <h2 class="font-display font-light text-xl tracking-wide text-anito-black mb-8">Today's overview</h2>

    <div class="grid grid-cols-3 gap-4 mb-6">
      <StatCard label="On time" :value="stats.onTime" highlight />
      <StatCard label="Late" :value="stats.late" />
      <StatCard label="Absent" :value="stats.absent" />
    </div>

    <Card>
      <CardHeaderFlex>
        <div>
          <Label for-id="dashboard-date">Date</Label>
          <Input
            id="dashboard-date"
            v-model="selectedDate"
            type="date"
            @change="loadDay"
          />
        </div>
        <Button variant="secondary" :disabled="attendance.loading" @click="loadDay">
          {{ attendance.loading ? 'Loading…' : 'Apply' }}
        </Button>
      </CardHeaderFlex>

      <CardHeader>Daily attendance</CardHeader>
      <div v-if="attendance.error" class="p-4 text-red-600 text-sm">{{ attendance.error }}</div>
      <DataTable
        v-else
        :columns="tableColumns"
        :data="paginatedList"
        :empty="!attendance.loading && !staff.loading && !fullDayList.length"
        empty-text="No staff. Add staff first, or select a date and apply."
      >
        <template #row="{ row }">
          <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ row.full_name }}</td>
          <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ formatDate(row.date) }}</td>
          <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(row.time_in) }}</td>
          <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(row.time_out) }}</td>
          <td class="px-4 py-3">
            <span
              :class="
                getTimeInStatus(row) === 'Absent'
                  ? 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#fdecea] text-[#b91c1c]'
                  : getTimeInStatus(row) === 'Late'
                    ? 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#fef3e2] text-[#9a5f1a]'
                    : 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#e8f4ec] text-[#276749]'
              "
            >
              {{ getTimeInStatus(row) }}
            </span>
          </td>
        </template>
      </DataTable>
      <div v-if="sortedList.length > pageSize" class="p-4 border-t border-anito-gray-light bg-white flex items-center justify-between">
        <p class="text-anito-gray text-sm font-sans font-light">
          Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, sortedList.length) }} of {{ sortedList.length }}
        </p>
        <div class="flex gap-2">
          <Button variant="secondary" size="sm" :disabled="currentPage <= 1" @click="currentPage--">
            Previous
          </Button>
          <Button variant="secondary" size="sm" :disabled="currentPage >= totalPages" @click="currentPage++">
            Next
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.js'
import { useStaffStore } from '@/stores/staff.js'
import { formatDate, formatTime } from '@/composables/useFormatters.js'
import {
  Button,
  Card,
  CardHeader,
  CardHeaderFlex,
  DataTable,
  Input,
  Label,
  StatCard,
} from '@/components/ui'

const attendance = useAttendanceStore()
const staff = useStaffStore()
const selectedDate = ref('')
const currentPage = ref(1)
const pageSize = 5

const LATE_THRESHOLD = '08:30' // time_in beyond this is considered late

/** Returns true if time string (e.g. "08:45:00" or "09:00") is after 08:30. */
function isLate(timeIn) {
  if (timeIn == null || timeIn === '') return false
  const s = typeof timeIn === 'string' ? timeIn : String(timeIn)
  const parts = s.trim().split(/[:.]/)
  if (parts.length < 2) return false
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10) || 0
  if (Number.isNaN(h) || Number.isNaN(m)) return false
  return h > 8 || (h === 8 && m > 30)
}

function getTimeInStatus(row) {
  if (row.displayStatus) return row.displayStatus
  if (row.time_in == null || row.time_in === '') return '—'
  return isLate(row.time_in) ? 'Late' : 'On time'
}

const tableColumns = [
  { key: 'full_name', label: 'Name' },
  { key: 'date', label: 'Date' },
  { key: 'time_in', label: 'Time in' },
  { key: 'time_out', label: 'Time out' },
  { key: 'time_in_status', label: 'Status' },
]

/** Sort by date desc, then time_in desc (most recent first). Rows without time_in go last. */
function timeToMinutes(t) {
  if (t == null || t === '') return -1
  const s = typeof t === 'string' ? t : String(t)
  const parts = s.trim().split(/[:.]/)
  if (parts.length < 2) return -1
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10) || 0
  if (Number.isNaN(h) || Number.isNaN(m)) return -1
  return h * 60 + m
}

const STATUS_ORDER = { Absent: 0, Late: 1, 'On time': 2 }

/** Full day list: every staff member, with attendance if any. Each row has displayStatus: 'Absent' | 'Late' | 'On time'. */
const fullDayList = computed(() => {
  const date = selectedDate.value
  if (!date) return []
  const byStaffId = new Map()
  ;(attendance.listWithName || []).forEach((row) => byStaffId.set(row.staff_id, row))
  const rows = staff.list.map((s) => {
    const log = byStaffId.get(s.id)
    if (log) {
      const displayStatus = isLate(log.time_in) ? 'Late' : 'On time'
      return { ...log, full_name: log.full_name ?? s.full_name, displayStatus }
    }
    return {
      staff_id: s.id,
      full_name: s.full_name,
      date,
      time_in: null,
      time_out: null,
      displayStatus: 'Absent',
    }
  })
  return rows.sort((a, b) => {
    const oa = STATUS_ORDER[a.displayStatus] ?? 3
    const ob = STATUS_ORDER[b.displayStatus] ?? 3
    if (oa !== ob) return oa - ob
    if (a.displayStatus === 'Absent') return (a.full_name || '').localeCompare(b.full_name || '')
    return timeToMinutes(b.time_in) - timeToMinutes(a.time_in)
  })
})

const sortedList = computed(() => fullDayList.value)

const stats = computed(() => {
  const list = fullDayList.value
  const onTime = list.filter((r) => r.displayStatus === 'On time').length
  const late = list.filter((r) => r.displayStatus === 'Late').length
  const absent = list.filter((r) => r.displayStatus === 'Absent').length
  return { onTime, late, absent }
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedList.value.length / pageSize))
)

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedList.value.slice(start, start + pageSize)
})

function setDefaultDate() {
  const now = new Date()
  selectedDate.value = now.toISOString().slice(0, 10)
}

function loadDay() {
  const d = selectedDate.value
  if (!d) return
  currentPage.value = 1
  attendance.fetchAttendance({ dateFrom: d, dateTo: d })
}

onMounted(async () => {
  setDefaultDate()
  await staff.fetchStaff()
  loadDay()
})
</script>
