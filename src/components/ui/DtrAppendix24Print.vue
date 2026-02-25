<template>
  <div class="dtr-appendix24">
    <div class="dtr-header">
      <p class="dtr-republic">Republic of the Philippines</p>
      <p class="dtr-csc">Civil Service Commission</p>
      <h1 class="dtr-title">DAILY TIME RECORD</h1>
      <p class="dtr-form-no">Appendix 24 / Civil Service Form No. 48</p>
    </div>

    <div class="dtr-info">
      <div class="dtr-info-row">
        <span class="dtr-label">Name:</span>
        <span class="dtr-value dtr-name">{{ employeeName }}</span>
      </div>
      <div class="dtr-info-row">
        <span class="dtr-label">Month:</span>
        <span class="dtr-value">{{ monthLabel }}</span>
      </div>
    </div>

    <table class="dtr-table">
      <thead>
        <tr>
          <th class="dtr-th dtr-day">Day</th>
          <th class="dtr-th dtr-weekday">Weekday</th>
          <th class="dtr-th dtr-time">A.M.<br>Arrival</th>
          <th class="dtr-th dtr-time">A.M.<br>Departure</th>
          <th class="dtr-th dtr-time">P.M.<br>Arrival</th>
          <th class="dtr-th dtr-time">P.M.<br>Departure</th>
          <th class="dtr-th dtr-undertime">Undertime</th>
          <th class="dtr-th dtr-total">Total<br>Hours</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paddedDayRows" :key="row.day ?? row.dateStr" class="dtr-row">
          <td class="dtr-td dtr-td-day">{{ row.day ?? '—' }}</td>
          <td class="dtr-td dtr-td-weekday">{{ row.weekday ?? '—' }}</td>
          <td class="dtr-td dtr-td-time">{{ row.amArrival ?? '—' }}</td>
          <td class="dtr-td dtr-td-time">{{ row.amDeparture ?? '—' }}</td>
          <td class="dtr-td dtr-td-time">{{ row.pmArrival ?? '—' }}</td>
          <td class="dtr-td dtr-td-time">{{ row.pmDeparture ?? '—' }}</td>
          <td class="dtr-td dtr-td-undertime">{{ row.undertime ?? '—' }}</td>
          <td class="dtr-td dtr-td-total">{{ row.hoursRendered ?? '—' }}</td>
        </tr>
      </tbody>
    </table>

    <div class="dtr-cert">
      <p class="dtr-cert-line">I certify that the above is a true and correct record of the hours of work performed.</p>
      <div class="dtr-signature-row">
        <span class="dtr-signature-label">Employee signature</span>
        <span class="dtr-signature-placeholder">_________________________</span>
      </div>
      <div class="dtr-signature-row dtr-verified">
        <span class="dtr-signature-label">Verified by (In Charge)</span>
        <span class="dtr-signature-placeholder">_________________________</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  employeeName: { type: String, default: '' },
  monthLabel: { type: String, default: '' },
  dayRows: { type: Array, default: () => [] },
})

/** Map timeIn/timeOut (e.g. "8:11AM", "5:30PM") to AM/PM columns. */
function mapToAmPmColumns(rows) {
  return rows.map((r) => {
    const amArrival = r.timeIn && String(r.timeIn).toUpperCase().includes('AM') ? r.timeIn : null
    const pmArrival = r.timeIn && String(r.timeIn).toUpperCase().includes('PM') ? r.timeIn : null
    const amDeparture = r.timeOut && String(r.timeOut).toUpperCase().includes('AM') ? r.timeOut : null
    const pmDeparture = r.timeOut && String(r.timeOut).toUpperCase().includes('PM') ? r.timeOut : null
    return {
      ...r,
      amArrival,
      pmArrival,
      amDeparture,
      pmDeparture,
      undertime: null, // optional; could be computed if needed
    }
  })
}

/** Pad to 31 rows so the form has a full month grid. */
const paddedDayRows = computed(() => {
  const mapped = mapToAmPmColumns(props.dayRows)
  const len = mapped.length
  if (len >= 31) return mapped
  const padded = [...mapped]
  for (let i = len; i < 31; i++) {
    padded.push({
      dateStr: `empty-${i}`,
      day: null,
      weekday: null,
      amArrival: null,
      amDeparture: null,
      pmArrival: null,
      pmDeparture: null,
      hoursRendered: null,
      undertime: null,
    })
  }
  return padded
})
</script>

<style scoped>
.dtr-appendix24 {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  color: #000;
  max-width: 100%;
}

.dtr-header {
  text-align: center;
  margin-bottom: 12px;
}
.dtr-republic { font-size: 11px; margin: 0 0 2px 0; }
.dtr-csc { font-size: 11px; font-weight: bold; margin: 0 0 4px 0; }
.dtr-title { font-size: 14px; font-weight: bold; margin: 0 0 2px 0; letter-spacing: 0.02em; }
.dtr-form-no { font-size: 9px; margin: 0; color: #333; }

.dtr-info { margin-bottom: 10px; }
.dtr-info-row { margin-bottom: 4px; }
.dtr-label { font-weight: bold; margin-right: 8px; }
.dtr-value { }
.dtr-name { text-decoration: underline; }

.dtr-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.dtr-th {
  border: 1px solid #000;
  padding: 4px 6px;
  text-align: center;
  font-weight: bold;
  font-size: 9px;
  background: #f0f0f0;
}
.dtr-day { width: 8%; }
.dtr-weekday { width: 12%; }
.dtr-time { width: 12%; }
.dtr-undertime { width: 10%; }
.dtr-total { width: 10%; }

.dtr-row { }
.dtr-td {
  border: 1px solid #000;
  padding: 3px 6px;
  text-align: center;
  vertical-align: middle;
}
.dtr-td-day, .dtr-td-weekday { text-align: left; }
.dtr-td-time, .dtr-td-undertime, .dtr-td-total { font-family: 'Consolas', 'Monaco', monospace; font-size: 9px; }

.dtr-cert {
  margin-top: 16px;
  font-size: 9px;
}
.dtr-cert-line { margin: 0 0 12px 0; font-style: italic; }
.dtr-signature-row { margin-bottom: 8px; }
.dtr-signature-row .dtr-signature-label { display: inline-block; width: 140px; }
.dtr-signature-placeholder { margin-left: 8px; }
.dtr-verified { margin-top: 12px; }

@media print {
  .dtr-appendix24 {
    font-size: 10px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .dtr-table { page-break-inside: avoid; }
  .dtr-th { background: #e8e8e8 !important; }
}
</style>
