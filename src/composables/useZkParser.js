/**
 * Parses ZKTeco .dat files (user roster or attendance log).
 * User file: PIN, Name, Password, Card, Role (fixed-width / whitespace-separated).
 * Attendance file: PIN, Date(YYYY-MM-DD), Time(HH:MM:SS), Verify, In/Out.
 */

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}:\d{2}$/

/**
 * Classify file from first non-empty line: if a token matches YYYY-MM-DD → attendance, else user.
 * @param {string} text - Full file text
 * @returns {'user'|'attendance'}
 */
export function classifyDatFile(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    const tokens = line.split(/\s+/)
    for (const t of tokens) {
      if (DATE_RE.test(t)) return 'attendance'
    }
  }
  return 'user'
}

/**
 * Parse user .dat: PIN, Name (fname minit lname), trailing Password/Card/Role ignored.
 * @param {string} text
 * @returns {{ records: Array<{bio_id: string, fname: string, minit: string, lname: string}>, skipped: number, skippedReasons: string[] }}
 */
export function parseUserDat(text) {
  const records = []
  const skippedReasons = []
  let skipped = 0

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const tokens = line.split(/\s+/).filter(Boolean)
    if (tokens.length < 2) {
      skipped++
      skippedReasons.push(`Line ${i + 1}: not enough tokens`)
      continue
    }

    const pin = tokens[0]
    if (!/^\d+$/.test(pin)) {
      skipped++
      skippedReasons.push(`Line ${i + 1}: invalid PIN "${pin}"`)
      continue
    }

    // Name tokens: everything after PIN until we hit trailing numeric-looking fields (password, card, role)
    const nameTokens = []
    let j = 1
    while (j < tokens.length) {
      const t = tokens[j]
      if (/^\d+$/.test(t) && nameTokens.length > 0) break
      nameTokens.push(t)
      j++
    }

    const fullName = nameTokens.join(' ').trim()
    if (!fullName) {
      skipped++
      skippedReasons.push(`Line ${i + 1}: empty name for PIN ${pin}`)
      continue
    }

    const parts = fullName.split(/\s+/)
    const fname = parts[0] ?? ''
    const minit = parts.length > 2 ? (parts[1] ?? '') : ''
    const lname = parts.length > 2 ? parts.slice(2).join(' ') : (parts[1] ?? '')

    records.push({
      bio_id: String(pin),
      fname,
      minit,
      lname,
    })
  }

  return { records, skipped, skippedReasons }
}

/**
 * Parse attendance .dat: PIN, Date(YYYY-MM-DD), Time(HH:MM:SS), Verify, In/Out[, ...].
 * Handles tab/space-separated lines; extra columns after In/Out are ignored (e.g. ZKTeco attlog format).
 * @param {string} text
 * @returns {{ records: Array<{bio_id: string, date: string, timestamp: string, in_out: number}>, skipped: number, skippedReasons: string[] }}
 */
export function parseAttendanceDat(text) {
  const records = []
  const skippedReasons = []
  let skipped = 0

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const tokens = line.split(/\s+/).filter(Boolean)
    if (tokens.length < 5) {
      skipped++
      skippedReasons.push(`Line ${i + 1}: need at least PIN, Date, Time, Verify, In/Out`)
      continue
    }

    const pin = tokens[0]
    const dateStr = tokens[1]
    const timeStr = tokens[2]
    const inOutStr = tokens[4]
    if (!/^\d+$/.test(pin)) {
      skipped++
      skippedReasons.push(`Line ${i + 1}: invalid PIN "${pin}"`)
      continue
    }
    if (!DATE_RE.test(dateStr)) {
      skipped++
      skippedReasons.push(`Line ${i + 1}: invalid date "${dateStr}"`)
      continue
    }
    if (!TIME_RE.test(timeStr)) {
      skipped++
      skippedReasons.push(`Line ${i + 1}: invalid time "${timeStr}"`)
      continue
    }

    const inOut = parseInt(inOutStr, 10)
    if (Number.isNaN(inOut) || inOut < 0 || inOut > 255) {
      skipped++
      skippedReasons.push(`Line ${i + 1}: invalid In/Out code "${inOutStr}"`)
      continue
    }

    const timestamp = `${dateStr}T${timeStr}`

    records.push({
      bio_id: String(pin),
      date: dateStr,
      timestamp,
      in_out: inOut,
    })
  }

  return { records, skipped, skippedReasons }
}

/**
 * Read file, classify, parse. Validates size (max 10MB).
 * @param {File} file
 * @returns {Promise<{ type: 'user'|'attendance', records: Array, skipped: number, skippedReasons: string[], fileName: string }>}
 */
export async function parseDatFile(file) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_BYTES / 1024 / 1024}MB.`)
  }

  const text = await file.text()
  const type = classifyDatFile(text)

  if (type === 'user') {
    const { records, skipped, skippedReasons } = parseUserDat(text)
    return { type: 'user', records, skipped, skippedReasons, fileName: file.name }
  }

  const { records, skipped, skippedReasons } = parseAttendanceDat(text)
  return { type: 'attendance', records, skipped, skippedReasons, fileName: file.name }
}
