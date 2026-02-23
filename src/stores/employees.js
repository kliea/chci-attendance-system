/**
 * Employees (profiles) for manager: list, register single user, bulk create.
 * New users get role 'employee' and optional bio_id (for ZKTeco attendance import).
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase.js'

const EMPLOYEE_ROLE = 'employee'

function randomPassword(length = 12) {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

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
   * Create one auth user + profile (role employee). Uses signUp; pass full_name, bio_id, program in metadata.
   * Email required by Auth; password required (use generated if not provided).
   * @returns { Promise<{ ok: boolean, userId?: string, email: string, password?: string, error?: string }> }
   */
  async function createEmployee({ fullName, bioId, email, password: rawPassword, program: programVal }) {
    const emailVal = (email || '').trim() || (bioId ? `${String(bioId).trim()}@klinth.local` : '')
    const password = (rawPassword || '').trim() || randomPassword()
    const program = (programVal || '').trim() || null
    const validProgram = program && ['CS', 'IS', 'IT'].includes(program) ? program : null

    if (!emailVal) {
      return { ok: false, error: 'Email or Bio ID is required.' }
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' }
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: emailVal,
      password,
      options: {
        data: {
          full_name: (fullName || '').trim() || emailVal.split('@')[0],
          bio_id: (bioId || '').trim() || null,
          program: validProgram,
        },
      },
    })

    if (signUpError) {
      return { ok: false, error: signUpError.message, email: emailVal }
    }
    if (!data?.user) {
      return { ok: false, error: 'Sign up failed', email: emailVal }
    }

    const userId = data.user.id
    const updates = {}
    if ((bioId || '').trim()) updates.bio_id = (bioId || '').trim()
    if (validProgram) updates.program = validProgram
    if (Object.keys(updates).length) {
      await supabase.from('profiles').update(updates).eq('id', userId)
    }
    await supabase.from('profiles').update({ email: emailVal }).eq('id', userId)

    return {
      ok: true,
      userId,
      email: emailVal,
      password: rawPassword ? undefined : password,
    }
  }

  async function bulkCreate(rows) {
    const results = []
    for (const row of rows) {
      const result = await createEmployee(row)
      results.push({ ...row, result })
    }
    return results
  }

  return {
    list,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    bulkCreate,
  }
})
