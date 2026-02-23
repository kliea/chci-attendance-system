<template>
  <div class="max-w-4xl">
    <header class="mb-6">
      <h1 class="font-display font-light text-xl tracking-wide text-anito-black">My attendance</h1>
      <p class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed">Your attendance log. Use filters to narrow by date.</p>
    </header>

    <section class="rounded border border-anito-gray-light overflow-hidden">
      <div class="p-4 border-b border-anito-gray-light bg-white flex flex-wrap items-end gap-3">
        <div>
          <label for="my-date-from" class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-1">From</label>
          <input
            id="my-date-from"
            v-model="dateFrom"
            type="date"
            class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none transition-colors w-full"
          />
        </div>
        <div>
          <label for="my-date-to" class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-1">To</label>
          <input
            id="my-date-to"
            v-model="dateTo"
            type="date"
            class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none transition-colors w-full"
          />
        </div>
        <button
          type="button"
          class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase font-sans font-medium px-4 py-2 rounded hover:border-anito-blue-mid hover:text-anito-blue-mid transition-colors duration-150 disabled:opacity-50"
          :disabled="attendance.loading"
          @click="applyFilters"
        >
          {{ attendance.loading ? 'Loading…' : 'Apply' }}
        </button>
      </div>

      <div v-if="attendance.error" class="p-4 text-red-600 text-sm">{{ attendance.error }}</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
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
              v-for="row in attendance.listWithName"
              :key="row.id"
              class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150"
            >
              <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ formatDate(row.date) }}</td>
              <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(row.time_in) }}</td>
              <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ formatTime(row.time_out) }}</td>
              <td class="px-4 py-3">
                <span :class="statusBadgeClass(row.status)">{{ row.status || '—' }}</span>
              </td>
            </tr>
            <tr v-if="!attendance.loading && !attendance.list.length">
              <td colspan="4" class="px-4 py-8 text-center text-anito-gray text-sm font-sans font-light">No records for this period.</td>
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

function statusBadgeClass(status) {
  const m = {
    present: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#e8f4ec] text-[#276749]',
    late: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#fef3e2] text-[#9a5f1a]',
    absent: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#fdecea] text-[#b91c1c]',
    holiday: 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#f3f4f6] text-anito-gray',
  }
  return m[status] ?? 'text-[9px] tracking-[0.1em] uppercase font-sans font-medium px-2.5 py-0.5 rounded-full bg-anito-blue-light text-anito-blue-deep'
}
</script>
