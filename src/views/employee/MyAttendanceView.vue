<template>
  <div class="max-w-4xl">
    <header class="mb-6">
      <h1 class="font-display font-light text-xl tracking-wide text-anito-black">My attendance</h1>
      <p class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed">Your attendance log. Use filters to narrow by date.</p>
    </header>

    <Card>
      <CardHeaderFlex>
        <div>
          <Label for-id="my-date-from">From</Label>
          <Input id="my-date-from" v-model="dateFrom" type="date" />
        </div>
        <div>
          <Label for-id="my-date-to">To</Label>
          <Input id="my-date-to" v-model="dateTo" type="date" />
        </div>
        <Button variant="secondary" :disabled="attendance.loading" @click="applyFilters">
          {{ attendance.loading ? 'Loading…' : 'Apply' }}
        </Button>
      </CardHeaderFlex>

      <div v-if="attendance.error" class="p-4 text-red-600 text-sm">{{ attendance.error }}</div>
      <DataTable
        v-else
        :columns="tableColumns"
        :data="attendance.listWithName"
        :empty="!attendance.loading && !attendance.list.length"
        empty-text="No records for this period."
      >
        <template #row="{ row }">
          <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ formatDate(row.date) }}</td>
          <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(row.time_in) }}</td>
          <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(row.time_out) }}</td>
          <td class="px-4 py-3">
            <Badge :status="row.status" />
          </td>
        </template>
      </DataTable>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.js'
import { formatDate, formatTime } from '@/composables/useFormatters.js'
import { Card, CardHeaderFlex, DataTable, Badge, Input, Label, Button } from '@/components/ui'

const attendance = useAttendanceStore()
const dateFrom = ref('')
const dateTo = ref('')

const tableColumns = [
  { key: 'date', label: 'Date' },
  { key: 'time_in', label: 'Time in' },
  { key: 'time_out', label: 'Time out' },
  { key: 'status', label: 'Status' },
]

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
</script>
