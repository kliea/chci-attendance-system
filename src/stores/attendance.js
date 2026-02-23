/**
 * Attendance logs (manager: all; employee: own via profile.bio_id = staff.bio_id). Reads from attendance_logs + staff.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase.js'

export const useAttendanceStore = defineStore('attendance', () => {
  const list = ref([])
  const loading = ref(false)
  const error = ref(null)

  const listWithName = computed(() =>
    list.value.map((row) => ({
      ...row,
      full_name: row.staff?.full_name ?? '—',
    }))
  )

  /**
   * Fetch attendance. Manager: optional dateFrom, dateTo, staffId, status. Employee: own only (via profile.bio_id → staff).
   */
  async function fetchAttendance(opts = {}) {
    loading.value = true
    error.value = null

    let query = supabase
      .from('attendance_logs')
      .select('id, date, time_in, time_out, status, source, staff_id, staff(full_name, bio_id)')
      .order('date', { ascending: false })

    if (opts.forCurrentUserOnly) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        const { data: profile } = await supabase.from('profiles').select('bio_id').eq('id', user.id).maybeSingle()
        if (profile?.bio_id) {
          const { data: staffRow } = await supabase.from('staff').select('id').eq('bio_id', profile.bio_id).maybeSingle()
          if (staffRow?.id) query = query.eq('staff_id', staffRow.id)
        }
      }
    } else if (opts.staffId) {
      query = query.eq('staff_id', opts.staffId)
    }

    if (opts.dateFrom) query = query.gte('date', opts.dateFrom)
    if (opts.dateTo) query = query.lte('date', opts.dateTo)
    if (opts.status) query = query.eq('status', opts.status)

    const { data, err } = await query

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
    listWithName,
    loading,
    error,
    fetchAttendance,
  }
})
