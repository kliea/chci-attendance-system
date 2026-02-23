<template>
  <div class="px-8 py-10">
    <h2 class="font-display font-light text-xl tracking-wide text-anito-black mb-8">Today's overview</h2>
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-anito-gray-light rounded p-5">
        <p class="text-[9px] tracking-[0.3em] uppercase text-anito-gray font-sans font-medium mb-3">Present</p>
        <p class="font-display font-light text-5xl text-anito-blue-deep">{{ stats.present }}</p>
      </div>
      <div class="bg-white border border-anito-gray-light rounded p-5">
        <p class="text-[9px] tracking-[0.3em] uppercase text-anito-gray font-sans font-medium mb-3">Late</p>
        <p class="font-display font-light text-5xl text-anito-black">{{ stats.late }}</p>
      </div>
      <div class="bg-white border border-anito-gray-light rounded p-5">
        <p class="text-[9px] tracking-[0.3em] uppercase text-anito-gray font-sans font-medium mb-3">Absent</p>
        <p class="font-display font-light text-5xl text-anito-black">{{ stats.absent }}</p>
      </div>
      <div class="bg-white border border-anito-gray-light rounded p-5">
        <p class="text-[9px] tracking-[0.3em] uppercase text-anito-gray font-sans font-medium mb-3">On Leave</p>
        <p class="font-display font-light text-5xl text-anito-black">{{ stats.holiday }}</p>
      </div>
    </div>

    <section class="rounded border border-anito-gray-light overflow-hidden">
      <div class="p-4 border-b border-anito-gray-light bg-white flex flex-wrap items-end gap-3">
        <div>
          <label for="dashboard-date" class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-1">Date</label>
          <input
            id="dashboard-date"
            v-model="selectedDate"
            type="date"
            class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none transition-colors w-full"
            @change="loadDay"
          />
        </div>
        <button
          type="button"
          class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase font-sans font-medium px-4 py-2 rounded hover:border-anito-blue-mid hover:text-anito-blue-mid transition-colors duration-150 disabled:opacity-50"
          :disabled="attendance.loading"
          @click="loadDay"
        >
          {{ attendance.loading ? 'Loading…' : 'Apply' }}
        </button>
      </div>

      <h3 class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium px-4 py-3 border-b border-anito-gray-light bg-white">Daily attendance</h3>
      <div v-if="attendance.error" class="p-4 text-red-600 text-sm">{{ attendance.error }}</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-anito-black">
            <tr>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Name</th>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Date</th>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Time in</th>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Time out</th>
              <th class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in paginatedList"
              :key="row.id"
              class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150"
            >
              <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ row.full_name }}</td>
              <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ formatDate(row.date) }}</td>
              <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(row.time_in) }}</td>
              <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(row.time_out) }}</td>
              <td class="px-4 py-3">
                <span :class="statusBadgeClass(row.status)">{{ row.status || '—' }}</span>
              </td>
            </tr>
            <tr v-if="!attendance.loading && !attendance.list.length">
              <td colspan="5" class="px-4 py-8 text-center text-anito-gray text-sm font-sans font-light">No records for this day.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="attendance.list.length > pageSize" class="p-4 border-t border-anito-gray-light bg-white flex items-center justify-between">
        <p class="text-anito-gray text-sm font-sans font-light">
          Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, attendance.list.length) }} of {{ attendance.list.length }}
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase font-sans font-medium px-3 py-1.5 rounded hover:border-anito-blue-mid disabled:opacity-50"
            :disabled="currentPage <= 1"
            @click="currentPage--"
          >
            Previous
          </button>
          <button
            type="button"
            class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase font-sans font-medium px-3 py-1.5 rounded hover:border-anito-blue-mid disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.js'

const attendance = useAttendanceStore()
const selectedDate = ref('')
const currentPage = ref(1)
const pageSize = 10

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

onMounted(() => {
  setDefaultDate()
  loadDay()
})
</script>
