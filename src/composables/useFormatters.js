/**
 * Shared date/time formatters for attendance views.
 */
export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

/** Format date for raw display (YYYY-MM-DD). */
export function formatDateRaw(d) {
  if (!d) return "—";
  return typeof d === "string" ? d.slice(0, 10) : d;
}

export function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString();
}

export function getStatusClass(status) {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
}

export function getRequesterName(requester) {
  if (!requester) return "Unknown";
  return requester.full_name?.trim() || requester.bio_id || "Unknown";
}

export function useFormatters() {
  return { formatDate, formatDateTime, getStatusClass, getRequesterName };
}

export function formatTime(t) {
  if (t == null || t === "") return "—";
  const s = typeof t === "string" ? t : String(t);
  return s.length >= 8 ? s.slice(0, 8) : s;
}

/** Format time as 12h with AM/PM (e.g. "8:11AM", "12:04PM") for AM/PM reflection tables. */
export function formatTimeAmPm(t) {
  if (t == null || t === "") return null;
  const s = typeof t === "string" ? t.trim() : String(t).trim();
  const match = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)?$/i);
  if (!match) return null;

  let hour24 = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[4]?.toUpperCase();

  if (Number.isNaN(hour24) || Number.isNaN(minute)) return null;
  if (meridiem === "AM") {
    if (hour24 === 12) hour24 = 0;
  } else if (meridiem === "PM") {
    if (hour24 < 12) hour24 += 12;
  }

  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 < 12 ? "AM" : "PM";
  const m = String(minute).padStart(2, "0");
  return `${hour12}:${m}${ampm}`;
}
