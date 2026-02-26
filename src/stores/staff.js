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

  /**
   * Update a staff row by id. Payload: { full_name?, bio_id? }.
   */
  async function updateStaff(id, payload) {
    if (!id) return { ok: false, error: 'Missing staff id.' }
    const updates = {}
    if (payload.full_name != null) updates.full_name = String(payload.full_name).trim() || undefined
    if (payload.bio_id != null) updates.bio_id = String(payload.bio_id).trim() || undefined
    if (Object.keys(updates).length === 0) return { ok: false, error: 'Nothing to update.' }
    const { error: err } = await supabase.from('staff').update(updates).eq('id', id)
    if (err) return { ok: false, error: err.message }
    await fetchStaff()
    return { ok: true }
  }

  /**
   * Delete a staff row. Fails if a profile is linked (bio_id FK). Attendance logs cascade-delete.
   */
  async function deleteStaff(id) {
    if (!id) return { ok: false, error: 'Missing staff id.' }
    const { error: err } = await supabase.from('staff').delete().eq('id', id)
    if (err) {
      if (err.code === '23503') {
        return { ok: false, error: 'Cannot delete: a registered employee is linked to this staff (Bio ID). Unlink the profile first.' }
      }
      return { ok: false, error: err.message }
    }
    await fetchStaff()
    return { ok: true }
  }

  return {
    list,
    loading,
    error,
    fetchStaff,
    addFromList,
    updateStaff,
    deleteStaff,
  }
})
