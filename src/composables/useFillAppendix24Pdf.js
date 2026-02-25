/**
 * Fill the official Appendix 24 / CSC Form 48 DTR PDF with employee data
 * and return the filled PDF as a blob for download.
 *
 * Coordinates are tuned for the PDF at public/Appendix-24-Daily-Time-Record-DTR.pdf.
 * If your form layout differs, adjust COORDS below (PDF origin: bottom-left).
 */

import { PDFDocument, StandardFonts } from 'pdf-lib'
import { totalHoursRenderedInMonth } from '@/composables/useAttendanceDayRows.js'

/** X offset for the right-side copy (same y as left). */
const COPY_OFFSET_X = 282

/** Default name under "In Charge" (certification section). */
export const IN_CHARGE_DEFAULT_NAME = 'Elbert S. Moyon'

/** Coordinate map for the Appendix 24 PDF (points; origin bottom-left). Two copies: left and right (offset ~300). */
export const COORDS = {
  pageHeight: 841.92,
  fontSize: { header: 10, table: 8, cert: 9 },
  /** Left copy */
  left: {
    name: { x: 115, y: 87 },
    month: { x: 120, y: 115 },
    table: {
      startY: 185,
      rowHeight: 10.8,
      cols: { timeIn: 73, timeOut: 179, undertime: 225 },
    },
    /** Total rendered hours for the month (HH:MM) — hours part */
    totalHoursMonth: { x: 230, y: 520 },
    /** Total rendered hours for the month (HH:MM) — minutes part */
    totalMinutesMonth: { x: 255, y: 520 },
    /** Below line above "VERIFIED as to the prescribed office hours:" */
    verifiedName: { x: 110, y: 590 },
    /** Below line above "In Charge" */
    inCharge: { x: 195, y: 638 },
  },
  /** Right copy: same y as left, x + COPY_OFFSET_X */
  right: {
    name: { x: 115 + COPY_OFFSET_X, y: 87 },
    month: { x: 120 + COPY_OFFSET_X, y: 115 },
    table: {
      startY: 185.2,
      rowHeight: 10.8,
      cols: {
        timeIn: 73 + COPY_OFFSET_X,
        timeOut: 179 + COPY_OFFSET_X,
        undertime: 225 + COPY_OFFSET_X,
      },
    },
    totalHoursMonth: { x: 230 + COPY_OFFSET_X, y: 520 },
    totalMinutesMonth: { x: 255 + COPY_OFFSET_X, y: 520 },
    verifiedName: { x: 110 + COPY_OFFSET_X, y: 590 },
    inCharge: { x: 195 + COPY_OFFSET_X, y: 638 },
  },
}

/**
 * Format undertime as hh:mm (8 - hoursRendered). E.g. 0 → "0:00", 0.5 → "0:30", 1.5 → "1:30".
 */
function formatUndertime(hoursRendered) {
  if (hoursRendered == null || typeof hoursRendered !== 'number') return ''
  const undertimeH = Math.max(0, 8 - hoursRendered)
  const h = Math.floor(undertimeH)
  const m = Math.round((undertimeH % 1) * 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

/** Parse hoursRendered string from buildDayRows (e.g. "8h", "7h 30m") to number for undertime calc. */
function parseHoursRendered(str) {
  if (str == null || str === '') return null
  const s = String(str).trim()
  const hMatch = s.match(/(\d+)\s*h/)
  const mMatch = s.match(/(\d+)\s*m/)
  const h = hMatch ? Number(hMatch[1]) : 0
  const m = mMatch ? Number(mMatch[1]) : 0
  return h + m / 60
}

/**
 * Fill the Appendix 24 PDF with DTR data and return the PDF bytes.
 * Uses the same hours logic as useAttendanceDayRows (totalHoursRenderedInMonth, formatHours).
 *
 * @param {ArrayBuffer} pdfBytes - Raw bytes of the Appendix 24 PDF
 * @param {Object} options
 * @param {string} options.employeeName
 * @param {string} options.monthLabel - e.g. "February 2026"
 * @param {string} [options.selectedMonth] - "YYYY-MM" for month total (used with options.logs)
 * @param {Array} [options.logs] - Raw attendance logs for the employee (date, time_in, time_out); used for totalHoursRenderedInMonth when provided
 * @param {number} [options.totalHoursMonth] - Precomputed month total (overrides selectedMonth+logs when provided)
 * @param {Array} options.dayRows - From buildDayRows (day, weekday, timeIn, timeOut, hoursRendered)
 * @returns {Promise<Uint8Array>} Filled PDF bytes
 */
export async function fillAppendix24Pdf(pdfBytes, options) {
  const { employeeName, monthLabel, dayRows, selectedMonth, logs, totalHoursMonth: totalHoursMonthOption } = options
  const doc = await PDFDocument.load(pdfBytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  const page = pages[0]
  const { height } = page.getSize()
  const fontSize = COORDS.fontSize.table
  const headerSize = COORDS.fontSize.header
  const certSize = COORDS.fontSize.cert ?? 9

  const rows = Array.isArray(dayRows) ? dayRows : []

  // Month total as HH:MM (same calculation as MyAttendanceView — totalHoursRenderedInMonth)
  let totalDecimal = 0
  if (totalHoursMonthOption != null && typeof totalHoursMonthOption === 'number') {
    totalDecimal = totalHoursMonthOption
  } else if (selectedMonth && Array.isArray(logs) && logs.length > 0) {
    totalDecimal = totalHoursRenderedInMonth(selectedMonth, logs)
  } else {
    for (const row of rows) {
      const n = parseHoursRendered(row?.hoursRendered)
      if (n != null) totalDecimal += n
    }
    totalDecimal = Math.round(totalDecimal * 100) / 100
  }
  let totalHoursPart = Math.floor(totalDecimal)
  let totalMinutesPart = Math.round((totalDecimal % 1) * 60)
  if (totalMinutesPart >= 60) {
    totalHoursPart += 1
    totalMinutesPart = 0
  }
  const totalHoursMonthStr = String(totalHoursPart)
  const totalMinutesMonthStr = String(totalMinutesPart).padStart(2, '0')

  const rowData = []
  for (let i = 0; i < 31; i++) {
    const row = rows[i]
    const timeIn = row?.timeIn ?? ''
    const timeOut = row?.timeOut ?? ''
    const hoursNum = parseHoursRendered(row?.hoursRendered)
    const undertime = hoursNum != null ? formatUndertime(hoursNum) : ''
    rowData.push({ timeIn, timeOut, undertime })
  }

  for (const copy of [COORDS.left, COORDS.right]) {
    if (employeeName) {
      page.drawText(employeeName, {
        x: copy.name.x,
        y: height - copy.name.y,
        size: headerSize,
        font,
      })
    }
    if (monthLabel) {
      page.drawText(monthLabel, {
        x: copy.month.x,
        y: height - copy.month.y,
        size: headerSize,
        font,
      })
    }
    const { startY, rowHeight, cols } = copy.table
    const pad = (v) => (v != null && v !== '' ? String(v) : '')
    for (let i = 0; i < 31; i++) {
      const y = height - (startY + i * rowHeight)
      const { timeIn, timeOut, undertime } = rowData[i]
      page.drawText(pad(timeIn), { x: cols.timeIn, y, size: fontSize, font })
      page.drawText(pad(timeOut), { x: cols.timeOut, y, size: fontSize, font })
      page.drawText(pad(undertime), { x: cols.undertime, y, size: fontSize, font })
    }
    page.drawText(totalHoursMonthStr, {
      x: copy.totalHoursMonth.x,
      y: height - copy.totalHoursMonth.y,
      size: headerSize,
      font,
    })
    page.drawText(totalMinutesMonthStr, {
      x: copy.totalMinutesMonth.x,
      y: height - copy.totalMinutesMonth.y,
      size: headerSize,
      font,
    })
    // Certification: employee name under "VERIFIED as to the prescribed office hours:"
    if (employeeName) {
      page.drawText(employeeName, {
        x: copy.verifiedName.x,
        y: height - copy.verifiedName.y,
        size: certSize,
        font,
      })
    }
    // In Charge: default name under "In Charge"
    page.drawText(IN_CHARGE_DEFAULT_NAME, {
      x: copy.inCharge.x,
      y: height - copy.inCharge.y,
      size: certSize,
      font,
    })
  }

  return doc.save()
}

/**
 * Fill the Appendix 24 PDF with placeholder text at every fill position (no real data).
 * Use this to generate a "filler template" PDF so you can verify alignment with the form
 * before applying real data. Compare the downloaded PDF to the blank form and adjust COORDS if needed.
 *
 * @param {ArrayBuffer} pdfBytes - Raw bytes of the Appendix 24 PDF
 * @returns {Promise<Uint8Array>} PDF bytes with placeholders drawn
 */
export async function fillAppendix24PdfWithTemplate(pdfBytes) {
  const doc = await PDFDocument.load(pdfBytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  const page = pages[0]
  const { height } = page.getSize()
  const fontSize = COORDS.fontSize.table
  const headerSize = COORDS.fontSize.header

  const t = (v) => (v != null && v !== '' ? String(v) : '—')
  for (const copy of [COORDS.left, COORDS.right]) {
    page.drawText('{{EMPLOYEE_NAME}}', {
      x: copy.name.x,
      y: height - copy.name.y,
      size: headerSize,
      font,
    })
    page.drawText('{{MONTH_YEAR}}', {
      x: copy.month.x,
      y: height - copy.month.y,
      size: headerSize,
      font,
    })
    page.drawText('{{TOTAL_HOURS_MONTH}}', {
      x: copy.totalHoursMonth.x,
      y: height - copy.totalHoursMonth.y,
      size: headerSize,
      font,
    })
    page.drawText('{{TOTAL_MINUTES_MONTH}}', {
      x: copy.totalMinutesMonth.x,
      y: height - copy.totalMinutesMonth.y,
      size: headerSize,
      font,
    })
    const { startY, rowHeight, cols } = copy.table
    for (let i = 0; i < 31; i++) {
      const y = height - (startY + i * rowHeight)
      page.drawText(t('08:00AM'), { x: cols.timeIn, y, size: fontSize, font })
      page.drawText(t('05:00PM'), { x: cols.timeOut, y, size: fontSize, font })
      page.drawText(t('00:00'), { x: cols.undertime, y, size: fontSize, font })
    }
    const certSize = COORDS.fontSize.cert ?? 9
    page.drawText('{{EMPLOYEE_NAME}}', {
      x: copy.verifiedName.x,
      y: height - copy.verifiedName.y,
      size: certSize,
      font,
    })
    page.drawText(IN_CHARGE_DEFAULT_NAME, {
      x: copy.inCharge.x,
      y: height - copy.inCharge.y,
      size: certSize,
      font,
    })
  }

  return doc.save()
}

/**
 * Fetch the Appendix 24 PDF and fill it with the filler template (placeholders only).
 * Download the result and compare to the blank form to calibrate COORDS before using real data.
 *
 * @param {string} [templateUrl] - URL to the PDF template
 * @returns {Promise<{ blobUrl: string, blob: Blob }>}
 */
export async function getAppendix24TemplateBlob(templateUrl = '/Appendix-24-Daily-Time-Record-DTR.pdf') {
  const res = await fetch(templateUrl)
  if (!res.ok) throw new Error(`Failed to load DTR template: ${res.status} ${res.statusText}`)
  const pdfBytes = await res.arrayBuffer()
  const filled = await fillAppendix24PdfWithTemplate(pdfBytes)
  const blob = new Blob([filled], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)
  return { blobUrl, blob }
}

/**
 * Fetch the Appendix 24 PDF template, fill it, and return a blob URL for download/open.
 * @param {Object} options - Same as fillAppendix24Pdf
 * @param {string} [templateUrl] - URL to the PDF template (default: /Appendix-24-Daily-Time-Record-DTR.pdf)
 * @returns {Promise<{ blobUrl: string, blob: Blob }>}
 */
export async function fillAndGetAppendix24Blob(options, templateUrl = '/Appendix-24-Daily-Time-Record-DTR.pdf') {
  const res = await fetch(templateUrl)
  if (!res.ok) throw new Error(`Failed to load DTR template: ${res.status} ${res.statusText}`)
  const pdfBytes = await res.arrayBuffer()
  const filled = await fillAppendix24Pdf(pdfBytes, options)
  const blob = new Blob([filled], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)
  return { blobUrl, blob }
}
