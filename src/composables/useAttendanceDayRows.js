/**
 * Build day-by-day attendance rows (Day, Weekday, Time in, Time out, Hours rendered)
 * for a given month and list of attendance logs. Shared by employee My Attendance
 * and manager daily logs (modal + print).
 */

import { formatTimeAmPm } from "@/composables/useFormatters.js";
import { useSettingsStore } from "@/stores/settings.js";

export function timeToMinutes(t) {
  if (t == null || t === "") return null;
  const s = String(t).trim();
  const match = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)?$/i);
  if (!match) return null;

  let h = Number(match[1]);
  const min = Number(match[2]);
  const sec = match[3] != null ? Number(match[3]) : 0;
  const meridiem = match[4]?.toUpperCase();

  if (Number.isNaN(h) || Number.isNaN(min) || Number.isNaN(sec)) return null;
  if (meridiem === "AM") {
    if (h === 12) h = 0;
  } else if (meridiem === "PM") {
    if (h < 12) h += 12;
  }

  return h * 60 + min + sec / 60;
}

/**
 * Hours rendered for expected schedule (8h work).
 * Grace: not late if time_in is by configured threshold.
 * Late mins = minutes after threshold (deducted from 8h).
 * If ON TIME (in by threshold): expected out = time_in + 9h (e.g. 8:25 in → 5:25 out).
 * If LATE (after threshold): expected out = 5:30 PM (fixed).
 * Undertime = max(0, expected_out − time_out). Hours = 8 − (late/60) − (undertime/60), cap 0–8.
 */
const WORK_MIN = 8 * 60; // 8 hours
const EXPECTED_OUT_SPAN_MIN = 9 * 60; // on-time: expected out = time_in + 9h (8:25 → 5:25)
const EXPECTED_OUT_IF_LATE = 17 * 60 + 30; // 5:30 PM (fixed for late arrivals)

export function computeHoursRenderedForDay(timeInStr, timeOutStr) {
  const tin = timeToMinutes(timeInStr);
  const tout = timeToMinutes(timeOutStr);
  if (tin == null) return null;

  // Use dynamic late threshold from settings
  const settingsStore = useSettingsStore();
  const GRACE_END = settingsStore.lateThresholdMinutes ?? 8 * 60 + 30; // Default 8:30 AM

  const lateMinutes = tin <= GRACE_END ? 0 : Math.round(tin - GRACE_END);
  const isLate = lateMinutes > 0;
  const expectedOutMinutes = isLate
    ? EXPECTED_OUT_IF_LATE
    : tin + EXPECTED_OUT_SPAN_MIN;

  let undertimeMinutes = 0;
  if (tout != null) {
    undertimeMinutes = Math.max(0, Math.round(expectedOutMinutes - tout));
  } else {
    undertimeMinutes = WORK_MIN;
  }

  const deducted = (lateMinutes + undertimeMinutes) / 60;
  const hours = Math.max(0, Math.min(8, 8 - deducted));
  return Math.round(hours * 100) / 100;
}

export function formatHours(h) {
  if (h == null || typeof h !== "number") return null;
  if (Number.isInteger(h)) return `${h}h`;
  const m = Math.round((h % 1) * 60);
  return m > 0 ? `${Math.floor(h)}h ${m}m` : `${Math.floor(h)}h`;
}

/**
 * Build one row per calendar day for the given month from attendance logs.
 * @param {string} selectedMonth - "YYYY-MM"
 * @param {Array<{ date: string, time_in?: string, time_out?: string }>} logs
 * @returns {Array<{ dateStr, day, weekday, timeIn, timeOut, hoursRendered, hasLog }>}
 */
export function buildDayRows(selectedMonth, logs) {
  if (!selectedMonth || selectedMonth.length < 7) return [];
  const [y, m] = selectedMonth.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const byDate = {};
  
  // Index logs by date
  for (const log of logs || []) {
    const d =
      (typeof log.date === "string" ? log.date : log.date?.slice?.(0, 10)) ??
      "";
    if (d) byDate[d] = log;
  }
  
  const pad = (n) => String(n).padStart(2, "0");
  const rows = [];
  
  // Build row for each day of month
  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${y}-${pad(m)}-${pad(day)}`;
    const d = new Date(y, m - 1, day);
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const log = byDate[dateStr];
    
    // Format time values only if log exists
    const timeIn = log?.time_in != null 
      ? formatTimeAmPm(String(log.time_in)) 
      : null;
    const timeOut = log?.time_out != null 
      ? formatTimeAmPm(String(log.time_out)) 
      : null;
    const hoursRendered = log
      ? formatHours(computeHoursRenderedForDay(log.time_in, log.time_out))
      : null;
    
    rows.push({
      dateStr,
      day,
      weekday,
      timeIn,
      timeOut,
      hoursRendered,
      hasLog: !!log,
    });
  }
  
  return rows;
}

/**
 * Sum of hours rendered for all logs in the given month (same 8–5 rule as per day).
 * @param {string} selectedMonth - "YYYY-MM"
 * @param {Array<{ date: string, time_in?: string, time_out?: string }>} logs
 * @returns {number}
 */
export function totalHoursRenderedInMonth(selectedMonth, logs) {
  if (!selectedMonth || selectedMonth.length < 7 || !Array.isArray(logs))
    return 0;
  const [y, m] = selectedMonth.split("-").map(Number);
  const pad = (n) => String(n).padStart(2, "0");
  let total = 0;
  for (const log of logs) {
    const d =
      (typeof log.date === "string" ? log.date : log.date?.slice?.(0, 10)) ??
      "";
    if (!d || d.slice(0, 7) !== `${y}-${pad(m)}`) continue;
    const h = computeHoursRenderedForDay(log.time_in, log.time_out);
    if (h != null) total += h;
  }
  return Math.round(total * 100) / 100;
}

/**
 * Sum of hours rendered for all logs across all time (same 8–5 rule as per day).
 * @param {Array<{ time_in?: string, time_out?: string }>} logs
 * @returns {number}
 */
export function totalHoursRenderedAllTime(logs) {
  if (!Array.isArray(logs)) return 0;
  let total = 0;
  for (const log of logs) {
    const h = computeHoursRenderedForDay(log.time_in, log.time_out);
    if (h != null) total += h;
  }
  return Math.round(total * 100) / 100;
}