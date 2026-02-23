/**
 * Staff roster (no auth). Used for attendance by Bio ID. Add via "Add from list" (Bio ID + Name).
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase.js'

export const useStaffStore = defineStore('staff', () => {
  const list = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchStaff() {
    loading.value = true
    error.value = null
    const { data, err } = await supabase
      .from('staff')
      .select('id, bio_id, full_name, created_at')
      .order('full_name')
    if (err) {
      error.value = err.message
      list.value = []
    } else {
      list.value = data ?? []
    }
    loading.value = false
  }

  /**
   * Insert staff rows from parsed list [{ bioId, fullName }, ...]. No auth.
   */
  async function addFromList(rows) {
    const toInsert = rows
      .filter((r) => (r.bioId || '').trim())
      .map((r) => ({
        bio_id: String(r.bioId).trim(),
        full_name: (r.fullName || '').trim() || `Employee ${r.bioId}`,
      }))
    if (!toInsert.length) return { ok: false, error: 'No valid rows (need Bio ID).' }
    const { error: err } = await supabase.from('staff').upsert(toInsert, { onConflict: 'bio_id', ignoreDuplicates: false })
    if (err) return { ok: false, error: err.message }
    await fetchStaff()
    return { ok: true }
  }

  return {
    list,
    loading,
    error,
    fetchStaff,
    addFromList,
  }
})
