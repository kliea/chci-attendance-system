<template>
  <div class="overflow-hidden">
    <div class="px-4 py-3 border-b border-border bg-surface/30 flex items-center justify-between flex-wrap gap-2">
      <p class="text-ink text-sm font-medium">
        {{ type === 'user' ? 'User roster' : 'Attendance log' }} — {{ records.length }} record(s) parsed
        <span v-if="skipped > 0" class="text-muted font-normal">({{ skipped }} line(s) skipped)</span>
      </p>
      <button
        v-if="skippedReasons.length > 0"
        type="button"
        class="text-muted hover:text-ink text-xs underline"
        @click="showSkipped = !showSkipped"
      >
        {{ showSkipped ? 'Hide' : 'Show' }} skipped reasons
      </button>
    </div>

    <div v-if="showSkipped && skippedReasons.length > 0" class="px-4 py-2 border-b border-border bg-surface/20 max-h-32 overflow-y-auto">
      <ul class="text-muted text-xs list-disc list-inside space-y-0.5">
        <li v-for="(r, i) in skippedReasons.slice(0, 50)" :key="i">{{ r }}</li>
        <li v-if="skippedReasons.length > 50">… and {{ skippedReasons.length - 50 }} more</li>
      </ul>
    </div>

    <div class="overflow-x-auto max-h-[320px] overflow-y-auto">
      <table class="w-full text-sm text-left">
        <thead class="sticky top-0 bg-panel border-b border-border">
          <tr>
            <th v-for="col in columns" :key="col.key" class="px-4 py-2 font-medium text-muted text-xs uppercase tracking-wider">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in displayRecords"
            :key="idx"
            class="border-b border-border hover:bg-surface/30"
          >
            <td v-for="col in columns" :key="col.key" class="px-4 py-2 text-ink">
              {{ row[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="records.length > 100" class="px-4 py-2 text-muted text-xs border-t border-border">
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
