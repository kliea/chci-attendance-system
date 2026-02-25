/**
 * Shared date/time formatters for attendance views.
 */
export function formatDate(d) {
  if (!d) return '—'
  return typeof d === 'string' ? d.slice(0, 10) : d
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
