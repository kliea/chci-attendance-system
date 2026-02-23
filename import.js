// src/stores/import.js
// Handles upsert of parsed ZKTeco .dat records into Supabase
// Processes in batches of 50 to avoid request size limits

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const BATCH_SIZE = 50

export const useImportStore = defineStore('import', () => {

  const isLoading   = ref(false)
  const progress    = ref(0)          // 0–100
  const successCount = ref(0)
  const errorCount   = ref(0)
  const errorLog     = ref([])

  function $reset() {
    isLoading.value    = false
    progress.value     = 0
    successCount.value = 0
    errorCount.value   = 0
    errorLog.value     = []
  }

  // ─── Chunk array into batches ───────────────────────────────────
  function chunk(arr, size) {
    const chunks = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }

  // ─── Import Users ───────────────────────────────────────────────
  // Maps bio_id → users.bio_id. If bio_id already exists, updates name fields.
  async function importUsers(parsedUsers) {
    $reset()
    isLoading.value = true

    const batches = chunk(parsedUsers, BATCH_SIZE)

    for (let b = 0; b < batches.length; b++) {
      const batch = batches[b]

      const rows = batch.map(u => ({
        bio_id:     u.bio_id,
        fname:      u.fname,
        minit:      u.minit,
        lname:      u.lname,
        username:   u.bio_id,             // fallback username = bio_id
        email:      `${u.bio_id}@klinth.local`, // placeholder, update later
        userrole_id: 3,                   // default: employee
      }))

      const { error } = await supabase
        .from('users')
        .upsert(rows, { onConflict: 'bio_id', ignoreDuplicates: false })

      if (error) {
        errorCount.value += batch.length
        errorLog.value.push({ batch: b + 1, error: error.message })
      } else {
        successCount.value += batch.length
      }

      progress.value = Math.round(((b + 1) / batches.length) * 100)
    }

    isLoading.value = false
    return { success: successCount.value, errors: errorCount.value, log: errorLog.value }
  }

  // ─── Import Attendance ──────────────────────────────────────────
  // 1. Fetch all users with a bio_id to build a bio_id → user_id map
  // 2. Group records by bio_id + date
  // 3. Assign time_in / time_out / overtime_in / overtime_out per InOut code
  // 4. Upsert with onConflict(user_id, date)
  async function importAttendance(parsedLogs) {
    $reset()
    isLoading.value = true

    // Step 1 — build bio_id → uuid map
    const { data: userRows, error: userErr } = await supabase
      .from('users')
      .select('id, bio_id')
      .not('bio_id', 'is', null)

    if (userErr) {
      errorLog.value.push({ batch: 0, error: userErr.message })
      isLoading.value = false
      return { success: 0, errors: parsedLogs.length, log: errorLog.value }
    }

    const bioMap = {}
    userRows.forEach(u => { bioMap[u.bio_id] = u.id })

    // Step 2 — group by bio_id + date
    const grouped = {}
    parsedLogs.forEach(log => {
      const key = `${log.bio_id}__${log.date}`
      if (!grouped[key]) grouped[key] = { bio_id: log.bio_id, date: log.date, entries: [] }
      grouped[key].entries.push(log)
    })

    // Step 3 — build attendance rows
    const rows = []
    const unmapped = []

    Object.values(grouped).forEach(group => {
      const userId = bioMap[group.bio_id]
      if (!userId) {
        unmapped.push(group.bio_id)
        return
      }

      const row = {
        user_id:      userId,
        date:         group.date,
        status:       'present',
      }

      group.entries.forEach(e => {
        switch (e.in_out) {
          case 0: row.time_in      = e.timestamp; break
          case 1: row.time_out     = e.timestamp; break
          case 4: row.overtime_in  = e.timestamp; break
          case 5: row.overtime_out = e.timestamp; break
        }
      })

      // Determine status
      if (row.time_in) {
        const inTime = new Date(row.time_in)
        const hours  = inTime.getHours()
        const mins   = inTime.getMinutes()
        // Flag late if clock-in after 08:10
        if (hours > 8 || (hours === 8 && mins > 10)) row.status = 'late'
      }

      rows.push(row)
    })

    if (unmapped.length > 0) {
      errorLog.value.push({
        batch: 0,
        error: `${unmapped.length} bio_id(s) not found in users table: ${[...new Set(unmapped)].join(', ')}`
      })
    }

    // Step 4 — upsert in batches
    const batches = chunk(rows, BATCH_SIZE)

    for (let b = 0; b < batches.length; b++) {
      const { error } = await supabase
        .from('attendance')
        .upsert(batches[b], { onConflict: 'user_id,date', ignoreDuplicates: false })

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
    isLoading, progress, successCount, errorCount, errorLog,
    importUsers, importAttendance, $reset,
  }
})
