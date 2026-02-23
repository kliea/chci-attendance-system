// Handles upsert of parsed ZKTeco attendance .dat into Supabase.
// Attendance is keyed by staff only. All employees are assumed seeded; unknown PINs are skipped and reported.

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase.js'

const BATCH_SIZE = 50

export const useImportStore = defineStore('import', () => {
  const isLoading = ref(false)
  const progress = ref(0) // 0–100
  const successCount = ref(0)
  const errorCount = ref(0)
  const errorLog = ref([])

  function $reset() {
    isLoading.value = false
    progress.value = 0
    successCount.value = 0
    errorCount.value = 0
    errorLog.value = []
  }

  function chunk(arr, size) {
    const chunks = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }

  function toTimeOnly(timestampStr) {
    if (!timestampStr) return undefined
    const t = typeof timestampStr === 'string' ? timestampStr : String(timestampStr)
    const match = t.match(/(\d{2}:\d{2}:\d{2})/)
    return match ? match[1] : undefined
  }

  async function importAttendance(parsedLogs) {
    $reset()
    isLoading.value = true

    const { data: staffRows, error: staffErr } = await supabase
      .from('staff')
      .select('id, bio_id')

    if (staffErr) {
      errorLog.value.push({ batch: 0, error: staffErr.message })
      isLoading.value = false
      return { success: 0, errors: parsedLogs.length, log: errorLog.value }
    }

    const bioToStaffId = {}
    ;(staffRows || []).forEach((s) => { bioToStaffId[s.bio_id] = s.id })

    const grouped = {}
    parsedLogs.forEach((log) => {
      const key = `${log.bio_id}__${log.date}`
      if (!grouped[key]) grouped[key] = { bio_id: log.bio_id, date: log.date, entries: [] }
      grouped[key].entries.push(log)
    })

    const rows = []
    const unmapped = []
    Object.values(grouped).forEach((group) => {
      const staffId = bioToStaffId[group.bio_id]
      if (!staffId) {
        unmapped.push(group.bio_id)
        return
      }

      const row = {
        staff_id: staffId,
        date: group.date,
        status: 'present',
        source: 'biometric',
      }

      group.entries.forEach((e) => {
        switch (e.in_out) {
          case 0: row.time_in = toTimeOnly(e.timestamp); break
          case 1: row.time_out = toTimeOnly(e.timestamp); break
          case 4: row.overtime_in = toTimeOnly(e.timestamp); break
          case 5: row.overtime_out = toTimeOnly(e.timestamp); break
        }
      })

      if (row.time_in) {
        const [h, m] = (row.time_in || '').split(':').map(Number)
        if (h > 8 || (h === 8 && m > 10)) row.status = 'late'
      }

      rows.push(row)
    })

    if (unmapped.length > 0) {
      errorLog.value.push({
        batch: 0,
        error: `${unmapped.length} bio_id(s) not found in staff: ${[...new Set(unmapped)].join(', ')}. Seed staff first (e.g. supabase-seed-employees.sql or Employees → Add from list).`,
      })
    }

    const batches = chunk(rows, BATCH_SIZE)

    for (let b = 0; b < batches.length; b++) {
      const batch = batches[b].map(({ overtime_in, overtime_out, ...rest }) => rest)
      const { error } = await supabase
        .from('attendance_logs')
        .upsert(batch, { onConflict: 'staff_id,date', ignoreDuplicates: false })

      if (error) {
        errorCount.value += batches[b].length
        errorLog.value.push({ batch: b + 1, error: error.message })
      } else {
        successCount.value += batches[b].length
      }
      progress.value = Math.round(((b + 1) / batches.length) * 100)
    }

    isLoading.value = false
    return { success: successCount.value, errors: errorCount.value, log: errorLog.value }
  }

  return {
    isLoading,
    progress,
    successCount,
    errorCount,
    errorLog,
    importAttendance,
    $reset,
  }
})
