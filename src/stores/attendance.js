/**
 * Attendance log records from table attendance_logs (+ staff join).
 * Manager: all rows; employee: own only via profile.bio_id → staff.bio_id.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase.js'

export const useAttendanceStore = defineStore('attendance', () => {
  const list = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalCount = ref(0)
  const page = ref(1)
  const pageSize = ref(10)

  const listWithName = computed(() =>
    list.value.map((row) => ({
      ...row,
      full_name: row.staff?.full_name ?? '—',
    }))
  )

  const totalPages = computed(() =>
    pageSize.value > 0 ? Math.max(1, Math.ceil(totalCount.value / pageSize.value)) : 1
  )

  /**
   * Fetch rows from attendance_logs. Manager: optional dateFrom, dateTo, staffId, page, pageSize. Employee: own only (profile.bio_id → staff_id).
   */
  async function fetchAttendance(opts = {}) {
    loading.value = true
    error.value = null

    const usePagination = opts.page != null && opts.pageSize != null && !opts.forCurrentUserOnly
    const requestPage = usePagination ? opts.page : 1
    const requestPageSize = usePagination ? opts.pageSize : 1000

    const selectClause = opts.forCurrentUserOnly
      ? 'id, date, time_in, time_out, source, staff_id'
      : 'id, date, time_in, time_out, source, staff_id, staff(full_name, bio_id)'

    let query = supabase
      .from('attendance_logs')
      .select(selectClause, { count: usePagination ? 'exact' : undefined })
      .order('date', { ascending: false })

    if (opts.forCurrentUserOnly) {
      const directBioId = typeof opts.bioId === 'string' ? opts.bioId.trim() : ''
      if (directBioId) {
        const { data: staffRow, error: staffError } = await supabase.from('staff').select('id').eq('bio_id', directBioId).maybeSingle()
        if (staffError) throw staffError
        if (staffRow?.id) query = query.eq('staff_id', staffRow.id)
      } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        const { data: profile, error: profileError } = await supabase.from('profiles').select('bio_id').eq('id', user.id).maybeSingle()
        if (profileError) throw profileError
        if (profile?.bio_id) {
          const { data: staffRow, error: staffError } = await supabase.from('staff').select('id').eq('bio_id', profile.bio_id).maybeSingle()
          if (staffError) throw staffError
          if (staffRow?.id) query = query.eq('staff_id', staffRow.id)
          // Employees need RLS "Users can select own staff row" on staff so this lookup and the attendance_logs→staff join succeed.
        }
      }
      }
    } else if (opts.staffId) {
      query = query.eq('staff_id', opts.staffId)
    }

    if (opts.dateFrom) query = query.gte('date', opts.dateFrom)
    if (opts.dateTo) query = query.lte('date', opts.dateTo)

    if (usePagination) {
      const from = (requestPage - 1) * requestPageSize
      const to = from + requestPageSize - 1
      query = query.range(from, to)
    }

    const { data, error: reqError, count } = await query

    if (reqError) {
      error.value = reqError.message
      list.value = []
      if (usePagination) totalCount.value = 0
    } else {
      list.value = data ?? []
      if (usePagination) {
        totalCount.value = count ?? list.value.length
        page.value = requestPage
        pageSize.value = requestPageSize
      }
    }
    loading.value = false
  }

  return {
    list,
    listWithName,
    loading,
    error,
    totalCount,
    totalPages,
    page,
    pageSize,
    fetchAttendance,
  }
})
