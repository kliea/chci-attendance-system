<template>
  <div class="overflow-hidden">
    <div class="px-4 py-3 border-b border-anito-gray-light bg-white flex items-center justify-between flex-wrap gap-2">
      <p class="text-anito-black text-sm font-sans font-medium">
        {{ type === 'user' ? 'User roster' : 'Attendance log' }} — {{ records.length }} record(s) parsed
        <span v-if="skipped > 0" class="text-anito-gray font-normal">({{ skipped }} line(s) skipped)</span>
        <span
          v-if="type === 'user'"
          class="text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded font-sans font-medium bg-anito-blue-light text-anito-blue-deep ml-2"
        >User file</span>
        <span
          v-else
          class="text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded font-sans font-medium bg-[#e8f4ec] text-[#276749] ml-2"
        >Attendance file</span>
      </p>
      <button
        v-if="skippedReasons.length > 0"
        type="button"
        class="text-anito-gray hover:text-anito-black text-xs underline transition-colors duration-150"
        @click="showSkipped = !showSkipped"
      >
        {{ showSkipped ? 'Hide' : 'Show' }} skipped reasons
      </button>
    </div>

    <div v-if="showSkipped && skippedReasons.length > 0" class="px-4 py-2 border-b border-anito-gray-light max-h-32 overflow-y-auto">
      <ul class="text-anito-gray text-xs list-disc list-inside space-y-0.5 font-sans font-light">
        <li v-for="(r, i) in skippedReasons.slice(0, 50)" :key="i">{{ r }}</li>
        <li v-if="skippedReasons.length > 50">… and {{ skippedReasons.length - 50 }} more</li>
      </ul>
    </div>

    <div class="overflow-x-auto max-h-[320px] overflow-y-auto rounded border border-anito-gray-light">
      <table class="w-full text-sm text-left">
        <thead class="sticky top-0 bg-anito-black">
          <tr>
            <th v-for="col in columns" :key="col.key" class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in displayRecords"
            :key="idx"
            class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150"
          >
            <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-sm font-sans text-anito-black">
              {{ row[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="records.length > 100" class="px-4 py-2 text-anito-gray text-xs font-sans font-light border-t border-anito-gray-light">
      Showing first 100 of {{ records.length }} records.
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  type: { type: String, required: true }, // 'user' | 'attendance'
  records: { type: Array, default: () => [] },
  skipped: { type: Number, default: 0 },
  skippedReasons: { type: Array, default: () => [] },
})

const showSkipped = ref(false)

const columns = computed(() => {
  if (props.type === 'user') {
    return [
      { key: 'bio_id', label: 'PIN' },
      { key: 'fname', label: 'First' },
      { key: 'minit', label: 'M.I.' },
      { key: 'lname', label: 'Last' },
    ]
  }
  return [
    { key: 'bio_id', label: 'PIN' },
    { key: 'date', label: 'Date' },
    { key: 'timestamp', label: 'Time' },
    { key: 'in_out', label: 'In/Out' },
  ]
})

const displayRecords = computed(() => props.records.slice(0, 100))
</script>
