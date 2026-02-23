// src/composables/useZkParser.js
// Parses ZKTeco .dat export files (user data & attendance logs)
// ZKTeco exports plain text, tab or space delimited fixed-width lines

/**
 * ZKTeco User .dat line format:
 *   PIN  Name            Password  Card        Role
 *   1    John Doe        0         0000000000  0
 *
 * ZKTeco Attendance .dat line format:
 *   PIN  Date        Time      Verify  InOut  Work  Reserved
 *   1    2024-01-15  08:02:11  1       0      0     0
 */

export function useZkParser() {

  // ─── Classify which type of .dat file was uploaded ───────────────
  function classifyFile(lines) {
    const sample = lines.find(l => l.trim().length > 0) || ''
    const parts = sample.trim().split(/\s+/)

    // Attendance lines have a date-like token (YYYY-MM-DD)
    const hasDate = parts.some(p => /^\d{4}-\d{2}-\d{2}$/.test(p))
    return hasDate ? 'attendance' : 'user'
  }

  // ─── Parse User .dat ──────────────────────────────────────────────
  function parseUsers(lines) {
    const results = []
    const errors  = []

    lines.forEach((raw, i) => {
      const line = raw.trim()
      if (!line) return

      const parts = line.split(/\s+/)
      if (parts.length < 2) {
        errors.push({ line: i + 1, raw, reason: 'Too few columns' })
        return
      }

      const [pin, ...nameParts] = parts
      // Name can be multi-word; last fields are password, card, role (numeric)
      // Walk back from end to strip trailing numeric fields
      const trailingNums = []
      const nameTokens = [...nameParts]
      while (nameTokens.length > 1 && /^\d+$/.test(nameTokens[nameTokens.length - 1])) {
        trailingNums.unshift(nameTokens.pop())
      }

      const fullName = nameTokens.join(' ').trim()
      if (!fullName) {
        errors.push({ line: i + 1, raw, reason: 'Could not extract name' })
        return
      }

      // Split name into fname / minit / lname best-effort
      const nameSplit = fullName.split(' ')
      const fname = nameSplit[0] || ''
      const lname = nameSplit.length > 1 ? nameSplit[nameSplit.length - 1] : ''
      const minit = nameSplit.length > 2 ? nameSplit[1][0] : null

      results.push({
        bio_id:    pin,
        fname,
        minit:     minit ? minit.toUpperCase() : null,
        lname,
        full_name: fullName,
        _raw:      raw,
      })
    })

    return { results, errors }
  }

  // ─── Parse Attendance .dat ────────────────────────────────────────
  function parseAttendance(lines) {
    const results = []
    const errors  = []

    lines.forEach((raw, i) => {
      const line = raw.trim()
      if (!line) return

      const parts = line.split(/\s+/)
      // Minimum: PIN DATE TIME
      if (parts.length < 3) {
        errors.push({ line: i + 1, raw, reason: 'Too few columns' })
        return
      }

      const [pin, date, time, , inOutRaw] = parts

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push({ line: i + 1, raw, reason: `Invalid date format: ${date}` })
        return
      }
      if (!/^\d{2}:\d{2}:\d{2}$/.test(time)) {
        errors.push({ line: i + 1, raw, reason: `Invalid time format: ${time}` })
        return
      }

      // ZKTeco InOut field: 0 = Check In, 1 = Check Out, 4 = OT In, 5 = OT Out
      const inOut = parseInt(inOutRaw ?? '0', 10)
      const timestamp = `${date}T${time}`

      results.push({
        bio_id:    pin,
        date,
        timestamp,
        in_out:    inOut,     // 0=in, 1=out, 4=ot_in, 5=ot_out
        _raw:      raw,
      })
    })

    return { results, errors }
  }

  // ─── Main entry: read File object, return parsed payload ─────────
  async function parseFile(file) {
    if (!file || !file.name.endsWith('.dat')) {
      throw new Error('Please upload a valid .dat file.')
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File exceeds 10MB limit. Please split the file and re-upload.')
    }

    const text  = await file.text()
    const lines = text.split(/\r?\n/)
    const type  = classifyFile(lines)

    if (type === 'user') {
      const { results, errors } = parseUsers(lines)
      return { type: 'user', results, errors, total: lines.filter(l => l.trim()).length }
    } else {
      const { results, errors } = parseAttendance(lines)
      return { type: 'attendance', results, errors, total: lines.filter(l => l.trim()).length }
    }
  }

  return { parseFile }
}
