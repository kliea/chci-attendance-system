<template>
  <Button
    variant="secondary"
    :size="size"
    :disabled="disabled || loading"
    @click="handlePrint"
  >
    {{ loading ? 'Generating…' : (label || 'Print daily logs') }}
  </Button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { fillAndGetAppendix24Blob } from '@/composables/useFillAppendix24Pdf.js'
import { totalHoursRenderedInMonth } from '@/composables/useAttendanceDayRows.js'
import { Button } from '@/components/ui'

const props = defineProps({
  /** Employee full name for the DTR header and filename */
  employeeName: { type: String, default: '' },
  /** Month label for display (e.g. "February 2026") */
  monthLabel: { type: String, default: '' },
  /** Selected month "YYYY-MM" */
  selectedMonth: { type: String, default: '' },
  /** Raw attendance logs for the employee (date, time_in, time_out) */
  logs: { type: Array, default: () => [] },
  /** Day rows from buildDayRows(selectedMonth, logs) */
  dayRows: { type: Array, default: () => [] },
  /** Button size: default | sm | lg */
  size: { type: String, default: 'default' },
  /** Override button label */
  label: { type: String, default: '' },
})

const loading = ref(false)

const disabled = computed(() => {
  return !props.employeeName || !props.selectedMonth || props.selectedMonth.length < 7
})

function formatMonthForFilename(ym) {
  return (ym || 'month').replace(/^(\d{4})-(\d{2}).*/, '$1-$2')
}

async function handlePrint() {
  if (disabled.value) return
  loading.value = true
  try {
    const { blobUrl } = await fillAndGetAppendix24Blob({
      employeeName: props.employeeName,
      monthLabel: props.monthLabel,
      selectedMonth: props.selectedMonth,
      logs: props.logs,
      totalHoursMonth: totalHoursRenderedInMonth(props.selectedMonth, props.logs),
      dayRows: props.dayRows,
    })
    const name = (props.employeeName || 'DTR').replace(/\s+/g, '_')
    const month = formatMonthForFilename(props.selectedMonth)
    const filename = `DTR_Appendix24_${name}_${month}.pdf`
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('Print daily logs (PDF) failed:', err)
    }
  } finally {
    loading.value = false
  }
}
</script>
