/**
 * Shared date/time formatters for attendance views.
 */
export function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

/** Format date for raw display (YYYY-MM-DD). */
export function formatDateRaw(d) {
  if (!d) return '—'
  return typeof d === 'string' ? d.slice(0, 10) : d
}

export function formatDateTime(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString()
}

export function getStatusClass(status) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

export function getRequesterName(requester) {
  if (!requester) return 'Unknown'
  return requester.full_name?.trim() || requester.bio_id || 'Unknown'
}

export function useFormatters() {
  return { formatDate, formatDateTime, getStatusClass, getRequesterName }
}

export function formatTime(t) {
  if (t == null || t === '') return '—'
  const s = typeof t === 'string' ? t : String(t)
  return s.length >= 8 ? s.slice(0, 8) : s
}

/** Format time as 12h with AM/PM (e.g. "8:11AM", "12:04PM") for AM/PM reflection tables. */
export function formatTimeAmPm(t) {
  if (t == null || t === '') return null
  const s = typeof t === 'string' ? t : String(t)
  const [h, min] = s.split(':').map(Number)
  if (h == null || isNaN(h)) return null
  const hour12 = h % 12 || 12
  const ampm = (h ?? 0) < 12 ? 'AM' : 'PM'
  const m = (min != null && !isNaN(min)) ? String(min).padStart(2, '0') : '00'
  return `${hour12}:${m}${ampm}`
}
