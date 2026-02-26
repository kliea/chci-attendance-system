/**
 * Employees (profiles) for manager: list registered employees.
 * Staff who need login register at /register (self-registration with staff dropdown).
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase.js'

export const useEmployeesStore = defineStore('employees', () => {
  const list = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchEmployees() {
    loading.value = true
    error.value = null
    const { data, err } = await supabase
      .from('profiles')
      .select('id, full_name, bio_id, email, program, role, created_at')
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
   * Update a profile row by id (profiles.id = auth.users.id). Payload: { full_name?, bio_id?, email?, program?, role? }.
   */
  async function updateProfile(id, payload) {
    if (!id) return { ok: false, error: 'Missing profile id.' }
    const allowed = ['full_name', 'bio_id', 'email', 'program', 'role']
    const updates = {}
    for (const key of allowed) {
      if (payload[key] !== undefined) {
        const v = payload[key]
        updates[key] = v === null || v === '' ? null : (key === 'role' ? v : String(v).trim())
      }
    }
    if (Object.keys(updates).length === 0) return { ok: false, error: 'Nothing to update.' }
    if (updates.role && !['admin', 'manager', 'supervisor', 'employee'].includes(updates.role)) {
      return { ok: false, error: 'Invalid role.' }
    }
    if (updates.program !== undefined && updates.program != null && !['CS', 'IS', 'IT'].includes(updates.program)) {
      return { ok: false, error: 'Invalid program.' }
    }
    const { error: err } = await supabase.from('profiles').update(updates).eq('id', id)
    if (err) {
      const code = String(err.code || '')
      const msg = (err.message || '').toLowerCase()
      const isFk = code === '23503' || msg.includes('profiles_bio_id_fkey') || msg.includes('foreign key constraint')
      const isUnique = code === '23505' || msg.includes('unique constraint') && msg.includes('bio_id')
      if (isUnique) {
        return { ok: false, error: 'This Bio ID is already linked to another employee. Pick a different one or leave it blank to unlink.' }
      }
      if (isFk) {
        return { ok: false, error: 'This Bio ID is not in the staff roster. Add it in Staff roster first, then set it here.' }
      }
      return { ok: false, error: err.message }
    }
    await fetchEmployees()
    return { ok: true }
  }

  /**
   * Delete a profile (and the auth user). Calls Edge Function delete-user which uses auth.admin.deleteUser.
   * Profile row is removed by auth.users ON DELETE CASCADE.
   */
  async function deleteProfile(id) {
    if (!id) return { ok: false, error: 'Missing profile id.' }
    const { data, error: err } = await supabase.functions.invoke('delete-user', {
      body: { user_id: id },
    })
    if (err) return { ok: false, error: err.message || 'Failed to delete user.' }
    if (data?.error) return { ok: false, error: data.error }
    await fetchEmployees()
    return { ok: true }
  }

  return {
    list,
    loading,
    error,
    fetchEmployees,
    updateProfile,
    deleteProfile,
  }
})
