/**
 * Compute total hours rendered from attendance logs (time_in, time_out).
 * Each log contributes (time_out - time_in) in hours; invalid entries are skipped.
 */

export function computeHoursRendered(logs) {
  if (!Array.isArray(logs)) return 0
  let totalMinutes = 0
  for (const log of logs) {
    const inVal = log.time_in
    const outVal = log.time_out
    if (inVal == null || outVal == null) continue
    const inMinutes = timeToMinutes(inVal)
    const outMinutes = timeToMinutes(outVal)
    if (inMinutes == null || outMinutes == null) continue
    let diff = outMinutes - inMinutes
    if (diff < 0) diff += 24 * 60
    totalMinutes += diff
  }
  return Math.round((totalMinutes / 60) * 100) / 100
}

function timeToMinutes(t) {
  if (t == null) return null
  const s = typeof t === 'string' ? t.trim() : String(t).trim()
  const match = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)?$/i)
  if (!match) return null

  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const sec = match[3] != null ? parseInt(match[3], 10) : 0
  const meridiem = match[4]?.toUpperCase()

  if (Number.isNaN(h) || Number.isNaN(m) || Number.isNaN(sec)) return null
  if (meridiem === 'AM') {
    if (h === 12) h = 0
  } else if (meridiem === 'PM') {
    if (h < 12) h += 12
  }

  return h * 60 + m + sec / 60
}

/**
 * Group logs by staff_id and return { [staffId]: { hours, daysPresent, logs } }.
 */
export function groupLogsByStaff(logs) {
  const byStaff = {}
  for (const row of logs || []) {
    const id = row.staff_id
    if (!id) continue
    if (!byStaff[id]) {
      byStaff[id] = { logs: [], hours: 0, daysPresent: 0 }
    }
    byStaff[id].logs.push(row)
    byStaff[id].daysPresent += 1
  }
  for (const id of Object.keys(byStaff)) {
    byStaff[id].hours = computeHoursRendered(byStaff[id].logs)
  }
  return byStaff
}
