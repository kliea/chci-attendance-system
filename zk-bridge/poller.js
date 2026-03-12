import 'dotenv/config'
import ZKLibModule from 'node-zklib'
import { createClient } from '@supabase/supabase-js'

// node-zklib is CommonJS; support both default/named export shapes
const ZKLib = ZKLibModule?.default || ZKLibModule

// ---- Env / config ----

const {
  ZK_IP,
  ZK_PORT = '4370',
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  POLL_INTERVAL_MS = '60000',
  STAFF_CACHE_TTL_MS = '300000', // 5 minutes
} = process.env

if (!ZK_IP || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[Config] Missing ZK_IP, SUPABASE_URL, or SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Important: ZKLib v0.x expects (ip, port, timeout, inTime)
const zk = new ZKLib(ZK_IP, parseInt(ZK_PORT, 10), 10000, 4000)

// ---- Staff cache (bio_id → staff_id) ----

let staffCache = {
  map: {},
  loadedAt: 0,
}

async function loadStaffMap(force = false) {
  const ttl = parseInt(STAFF_CACHE_TTL_MS, 10) || 300000
  const now = Date.now()
  if (!force && now - staffCache.loadedAt < ttl && Object.keys(staffCache.map).length > 0) {
    return staffCache.map
  }

  console.log('[Bridge] Loading staff roster from Supabase...')
  const { data, error } = await supabase.from('staff').select('id, bio_id')

  if (error) {
    console.error('[Bridge] Failed to load staff:', error.message)
    return staffCache.map
  }

  const map = {}
  ;(data || []).forEach((row) => {
    if (row.bio_id && row.id) {
      map[String(row.bio_id)] = row.id
    }
  })

  staffCache = { map, loadedAt: now }
  console.log(`[Bridge] Loaded ${Object.keys(map).length} staff records into cache.`)
  return map
}

// ---- Helpers ----

function toDateTimeParts(recordTime) {
  const d = new Date(recordTime)
  if (Number.isNaN(d.getTime())) return null

  const iso = d.toISOString() // YYYY-MM-DDTHH:MM:SS.sssZ
  const date = iso.slice(0, 10)
  const time = iso.slice(11, 19)
  return { date, time }
}

// Normalize raw device log into { bio_id, date, timestamp, in_out }
function normalizeLog(log) {
  // node-zklib variants: deviceUserId, uid, userId, etc.
  const bioId =
    log.deviceUserId != null
      ? String(log.deviceUserId)
      : log.uid != null
      ? String(log.uid)
      : log.userId != null
      ? String(log.userId)
      : null

  const rt = log.recordTime || log.timestamp || log.time
  const type = typeof log.type === 'number' ? log.type : parseInt(log.type ?? log.state ?? 0, 10)

  if (!bioId || !rt || Number.isNaN(type)) {
    return null
  }

  const parts = toDateTimeParts(rt)
  if (!parts) return null

  return {
    bio_id: bioId,
    date: parts.date,
    timestamp: `${parts.date}T${parts.time}`,
    in_out: type, // 0=in, 1=out, 4=OT in, 5=OT out (verify on your device)
  }
}

// Group by (bio_id, date) and compute time_in/out + overtime_in/out
function buildAttendanceRows(normalizedLogs, bioToStaffId) {
  const grouped = new Map()

  for (const log of normalizedLogs) {
    const key = `${log.bio_id}__${log.date}`
    if (!grouped.has(key)) {
      grouped.set(key, {
        bio_id: log.bio_id,
        date: log.date,
        entries: [],
      })
    }
    grouped.get(key).entries.push(log)
  }

  const rows = []
  const unmappedBioIds = new Set()

  for (const group of grouped.values()) {
    const staffId = bioToStaffId[group.bio_id]
    if (!staffId) {
      unmappedBioIds.add(group.bio_id)
      continue
    }

    const row = {
      staff_id: staffId,
      date: group.date,
      source: 'biometric_live',
      time_in: null,
      time_out: null,
      overtime_in: null,
      overtime_out: null,
    }

    for (const e of group.entries) {
      const hhmmss = e.timestamp.slice(11, 19)
      switch (e.in_out) {
        case 0:
          // First check-in of the day; keep earliest
          if (!row.time_in || hhmmss < row.time_in) row.time_in = hhmmss
          break
        case 1:
          // Last check-out of the day; keep latest
          if (!row.time_out || hhmmss > row.time_out) row.time_out = hhmmss
          break
        case 4:
          if (!row.overtime_in || hhmmss < row.overtime_in) row.overtime_in = hhmmss
          break
        case 5:
          if (!row.overtime_out || hhmmss > row.overtime_out) row.overtime_out = hhmmss
          break
        default:
          // ignore other codes for now
          break
      }
    }

    rows.push(row)
  }

  return { rows, unmappedBioIds: Array.from(unmappedBioIds) }
}

function stripNulls(row) {
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    if (v !== null && v !== undefined) out[k] = v
  }
  return out
}

// ---- Main poll loop ----

async function pollOnce() {
  console.log('---')
  console.log('[ZK] Starting poll cycle...')

  try {
    await loadStaffMap() // warm staff cache

    console.log('[ZK] Connecting to device...')
    await zk.createSocket()

    // Disable device during read (same as PHP ZK flow) — avoids lockup/partial data on some ZKTeco units
    try {
      await zk.disableDevice()
    } catch (e) {
      console.warn('[ZK] disableDevice failed (continuing):', e?.message)
    }

    const { data: rawLogs } = await zk.getAttendances()
    const logs = rawLogs || []
    console.log(`[ZK] Fetched ${logs.length} raw records`)

    if (!logs.length) {
      console.log('[ZK] No records; done.')
      return
    }

    const normalized = logs.map(normalizeLog).filter(Boolean)
    // Sort by timestamp (same as PHP usort) so earliest/latest per day are correct if device order is unstable
    normalized.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    console.log(`[Bridge] Normalized to ${normalized.length} device records`)

    if (!normalized.length) {
      console.log('[Bridge] No valid records after normalization; done.')
      return
    }

    const bioToStaffId = staffCache.map
    const { rows, unmappedBioIds } = buildAttendanceRows(normalized, bioToStaffId)

    if (unmappedBioIds.length) {
      console.warn(
        `[Bridge] ${unmappedBioIds.length} bio_id(s) from device are not in staff table: ${unmappedBioIds.join(
          ', '
        )}. Seed staff.bio_id first.`
      )
    }

    if (!rows.length) {
      console.log('[Bridge] No rows to upsert after mapping; done.')
      return
    }

    const payload = rows.map(stripNulls)

    console.log(`[Supabase] Upserting ${payload.length} attendance rows...`)
    const { error } = await supabase.from('attendance_logs').upsert(payload, {
      onConflict: 'staff_id,date',
    })

    if (error) {
      console.error('[Supabase] Upsert error:', error.message)
    } else {
      console.log('[Supabase] Upsert successful.')
    }
  } catch (err) {
    console.error('[Poll] Error during poll:', err.message || err)
  } finally {
    try {
      await zk.enableDevice()
    } catch {
      // ignore
    }
    try {
      await zk.disconnect()
    } catch {
      // ignore
    }
  }
}

// ---- Entrypoint ----

async function main() {
  console.log('[Bridge] ZKTeco → Supabase poller starting...')
  console.log(`[Bridge] Device: ${ZK_IP}:${ZK_PORT}`)
  console.log(`[Bridge] Poll interval: ${POLL_INTERVAL_MS}ms`)

  await pollOnce()

  const intervalMs = parseInt(POLL_INTERVAL_MS, 10) || 60000
  setInterval(pollOnce, intervalMs)
}

main().catch((err) => {
  console.error('[Bridge] Fatal error in main():', err?.message || err)
})


