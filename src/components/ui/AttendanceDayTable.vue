<template>
  <div class="overflow-x-auto" :class="{ 'print-table': printMode }">
    <table class="w-full text-sm text-left" :class="printMode ? 'border border-gray-300' : ''">
      <thead :class="printMode ? 'bg-gray-100' : 'bg-anito-black'">
        <tr :class="printMode ? 'text-gray-800' : 'text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium'">
          <th class="px-4 py-3 text-left w-16">Day</th>
          <th class="px-4 py-3 text-left">Weekday</th>
          <th class="px-4 py-3 text-left">Time in</th>
          <th class="px-4 py-3 text-left">Time out</th>
          <th class="px-4 py-3 text-left">Hours rendered</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in dayRows"
          :key="row.dateStr"
          class="border-b border-gray-200"
          :class="row.hasLog ? 'bg-white' : (printMode ? 'bg-gray-50' : 'bg-anito-gray-light/30')"
        >
          <td class="px-4 py-3 font-sans text-anito-black">{{ row.day }}</td>
          <td class="px-4 py-3 font-sans text-anito-black">{{ row.weekday }}</td>
          <td :class="cellClass(row.timeIn)">{{ row.timeIn ?? '—' }}</td>
          <td :class="cellClass(row.timeOut)">{{ row.timeOut ?? '—' }}</td>
          <td :class="cellClass(row.hoursRendered)">{{ row.hoursRendered ?? '—' }}</td>
        </tr>
        <tr v-if="!dayRows.length">
          <td colspan="5" class="px-4 py-8 text-center text-anito-gray text-sm font-sans font-light">
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
  const base = 'px-4 py-3 font-mono text-xs'
  const hasValue = value != null && value !== ''
  if (hasValue) return `${base} text-anito-black`
  return `${base} text-anito-gray bg-anito-gray-light/50`
}
</script>
