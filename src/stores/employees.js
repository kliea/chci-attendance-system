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

  return {
    list,
    loading,
    error,
    fetchEmployees,
  }
})
