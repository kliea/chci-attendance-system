<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200">
    <table class="w-full text-sm text-left" :class="printMode ? 'border border-gray-300' : ''">
      <thead :class="printMode ? 'bg-gray-100' : 'bg-[#003777]'">
        <tr :class="printMode ? 'text-gray-800' : 'text-xs tracking-wide uppercase text-white font-medium'">
          <th class="px-6 py-4 text-left font-semibold">Day</th>
          <th class="px-6 py-4 text-left font-semibold">Weekday</th>
          <th class="px-6 py-4 text-left font-semibold">Time in</th>
          <th class="px-6 py-4 text-left font-semibold">Time out</th>
          <th class="px-6 py-4 text-left font-semibold">Hours rendered</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in dayRows"
          :key="row.dateStr"
          class="border-b border-gray-200 transition-colors duration-150"
          :class="[
            row.hasLog ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
          ]"
        >
          <td class="px-6 py-4 font-medium text-gray-900">{{ row.day }}</td>
          <td class="px-6 py-4 text-gray-700">{{ row.weekday }}</td>
          <td :class="cellClass(row.timeIn)">{{ row.timeIn ?? '—' }}</td>
          <td :class="cellClass(row.timeOut)">{{ row.timeOut ?? '—' }}</td>
          <td :class="cellClass(row.hoursRendered)">{{ row.hoursRendered ?? '—' }}</td>
        </tr>
        <tr v-if="!dayRows.length">
          <td colspan="5" class="px-6 py-8 text-center text-gray-500 text-sm font-light">
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  dayRows: { type: Array, default: () => [] },
  emptyText: { type: String, default: 'No records for this month.' },
  printMode: { type: Boolean, default: false },
})

function cellClass(value) {
  const base = 'px-6 py-4 font-mono text-sm'
  const hasValue = value != null && value !== ''
  if (hasValue) return `${base} text-gray-900 font-medium`
  return `${base} text-gray-400`
}
</script>

<style scoped>
/* Smooth hover effect on rows */
tbody tr:last-child {
  border-bottom: none;
}

/* Print styles */
@media print {
  .rounded-lg {
    border-radius: 0;
  }
}
</style>