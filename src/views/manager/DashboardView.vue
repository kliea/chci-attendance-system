<template>
  <div class="px-8 py-10">
    <h2 class="font-display font-light text-xl tracking-wide text-anito-black mb-8">Today's overview</h2>
    <div class="grid grid-cols-4 gap-4 mb-8">
      <StatCard label="Present" :value="stats.present" highlight />
      <StatCard label="Late" :value="stats.late" />
      <StatCard label="Absent" :value="stats.absent" />
      <StatCard label="On Leave" :value="stats.holiday" />
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
        :empty="!attendance.loading && !attendance.list.length"
        empty-text="No records for this day."
      >
        <template #row="{ row }">
          <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ row.full_name }}</td>
          <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ formatDate(row.date) }}</td>
          <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(row.time_in) }}</td>
          <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(row.time_out) }}</td>
          <td class="px-4 py-3">
            <Badge :status="row.status" />
          </td>
        </template>
      </DataTable>
      <div v-if="attendance.list.length > pageSize" class="p-4 border-t border-anito-gray-light bg-white flex items-center justify-between">
        <p class="text-anito-gray text-sm font-sans font-light">
          Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, attendance.list.length) }} of {{ attendance.list.length }}
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
import { formatDate, formatTime } from '@/composables/useFormatters.js'
import {
  Button,
  Card,
  CardHeader,
  CardHeaderFlex,
  DataTable,
  Badge,
  Input,
  Label,
  StatCard,
} from '@/components/ui'

const attendance = useAttendanceStore()
const selectedDate = ref('')
const currentPage = ref(1)
const pageSize = 10

const tableColumns = [
  { key: 'full_name', label: 'Name' },
  { key: 'date', label: 'Date' },
  { key: 'time_in', label: 'Time in' },
  { key: 'time_out', label: 'Time out' },
  { key: 'status', label: 'Status' },
]

const stats = computed(() => {
  const list = attendance.list
  return {
    present: list.filter((r) => r.status === 'present').length,
    late: list.filter((r) => r.status === 'late').length,
    absent: list.filter((r) => r.status === 'absent').length,
    holiday: list.filter((r) => r.status === 'holiday').length,
  }
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(attendance.list.length / pageSize))
)

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return attendance.listWithName.slice(start, start + pageSize)
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

onMounted(() => {
  setDefaultDate()
  loadDay()
})
</script>
