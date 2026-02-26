# .dat file import — codebase analysis

## Overview

The app imports **ZKTeco attendance .dat** files on the **Import** page (manager only). Flow: upload → parse → preview → confirm → upsert into `attendance_logs` keyed by **staff** (Bio ID → staff_id). User-roster .dat files are detected but **not** imported; staff must be added via **Employees → Add from list** (or seed SQL).

---

## 1. Entry and UI

| Path | Role |
|------|------|
| **Route** | `/import` → `ImportView.vue` (manager layout) |
| **FileDropzone.vue** | Accepts `.dat` only, max 10MB; drag-and-drop or file picker; emits `file` |
| **ImportView.vue** | Orchestrates steps: `upload` → `preview` → `importing` → `result` |

- User drops or selects a file → `onFileSelected(file)` runs.
- `parseDatFile(file)` (from `useZkParser.js`) reads the file, classifies it, and returns `{ type, records, skipped, skippedReasons, fileName }`.
- If `type === 'user'`, the view shows an error and does **not** go to preview (user roster must be added via Employees, not imported).
- If `type === 'attendance'`, step switches to **preview**; `ParsePreviewTable` shows the parsed records (first 100) and skipped count/reasons.
- User clicks **Confirm & import** → `importStore.importAttendance(parsed.records)` runs; step becomes `importing` then `result`; `ImportSummary` shows success/error counts and logs.

---

## 2. Parser: `useZkParser.js`

### File classification

- **`classifyDatFile(text)`**  
  - Splits on newlines, trims, then scans tokens of each line.  
  - If any token matches `YYYY-MM-DD` → **attendance**.  
  - Otherwise → **user**.

### User .dat (not imported by this flow)

- **`parseUserDat(text)`**  
  - Expects: **PIN**, then name tokens (until trailing numeric-looking fields).  
  - Returns `{ records: [{ bio_id, fname, minit, lname }], skipped, skippedReasons }`.  
  - Used only to detect “user file”; staff are added via Employees UI or seed, not by importing user .dat here.

### Attendance .dat (imported)

- **`parseAttendanceDat(text)`**  
  - Expects per line (whitespace/tab-separated):  
    **PIN**, **Date** (YYYY-MM-DD), **Time** (HH:MM:SS), **Verify**, **In/Out** [, …]  
  - Extra columns after In/Out are ignored.  
  - Validates: PIN numeric, date regex, time regex, In/Out 0–255.  
  - Returns:  
    `{ records: [{ bio_id, date, timestamp, in_out }], skipped, skippedReasons }`.  
  - **In/Out** semantics:  
    - `0` → time_in  
    - `1` → time_out  
    - `4` → overtime_in (parsed but not written to DB; see import store)  
    - `5` → overtime_out (parsed but not written to DB)

### Top-level

- **`parseDatFile(file)`**  
  - Max size **10MB** (throws if larger).  
  - Reads `file.text()`, classifies, then calls `parseUserDat` or `parseAttendanceDat`.  
  - Returns `{ type: 'user'|'attendance', records, skipped, skippedReasons, fileName }`.

---

## 3. Import store: `stores/import.js`

- **`importAttendance(parsedLogs)`**  
  - Input: array of `{ bio_id, date, timestamp, in_out }` from the attendance parser.

Steps:

1. **Load staff map**  
   - `SELECT id, bio_id FROM staff`.  
   - Builds `bioToStaffId[bio_id] = id`.  
   - Any PIN in the file not in this map is **unmapped**; those are reported and not imported.

2. **Group by (bio_id, date)**  
   - Key: `bio_id__date`.  
   - Each group has `entries[]` of raw records (same person, same day).

3. **Build one row per (staff_id, date)**  
   - `staffId = bioToStaffId[group.bio_id]`; if missing, skip and add to `unmapped`.  
   - For each group, create one object:  
     `staff_id`, `date`, `status: 'present'`, `source: 'biometric'`.  
   - From `group.entries` (by `in_out`):  
     - `0` → `time_in` (from `toTimeOnly(timestamp)`)  
     - `1` → `time_out`  
     - `4` → `overtime_in` (stored in row but then stripped before upsert)  
     - `5` → `overtime_out` (stored in row but then stripped before upsert)  
   - **Late rule:** if `time_in` exists and is after 08:10, set `status = 'late'`.

4. **Upsert in batches**  
   - Batches of 50 rows.  
   - Payload: `staff_id`, `date`, `time_in`, `time_out`, `status`, `source` (no overtime columns).  
   - `supabase.from('attendance_logs').upsert(batch, { onConflict: 'staff_id,date', ignoreDuplicates: false })`.  
   - So re-importing the same (staff_id, date) **overwrites** existing row with new time_in/time_out.

5. **Progress and errors**  
   - `progress` 0–100 by batch; `successCount` / `errorCount`; errors pushed to `errorLog`.  
   - If any PINs were unmapped, one error entry is added before any upsert.

---

## 4. Data flow summary

```
.dat file (attendance)
  → FileDropzone (validate .dat, ≤10MB)
  → parseDatFile → classifyDatFile → parseAttendanceDat
  → records[] { bio_id, date, timestamp, in_out }
  → ImportView: preview (ParsePreviewTable)
  → importStore.importAttendance(records)
  → staff lookup (bio_id → staff_id)
  → group by (bio_id, date), derive time_in/time_out/status
  → upsert attendance_logs (staff_id, date, time_in, time_out, status, source)
```

---

## 5. Important details

- **Staff must exist first.** Only `staff.bio_id` values that exist in the DB get logs; others are skipped and reported.
- **One row per (staff_id, date).** Multiple punches per day are collapsed: first `in_out=0` → `time_in`, last `in_out=1` → `time_out` (within that group’s entries order).
- **Re-import = overwrite.** Same file re-imported overwrites existing rows for the same (staff_id, date) because of `onConflict: 'staff_id,date', ignoreDuplicates: false`.
- **User .dat:** Parsed only to detect type; no insert into staff or profiles. Staff/employees are managed in Employees view or seed SQL.
- **Overtime (4/5):** Parsed but not persisted; only `time_in` and `time_out` are written.
- **File format:** Tab or space separated; date and time as separate tokens (e.g. `1970-01-01` and `00:00:10`). Sample in `files/3088182660241_attlog.dat` matches (PIN, date, time, …).

---

## 6. Files touched

| File | Role |
|------|------|
| `src/views/manager/ImportView.vue` | Page and step flow; calls parser and import store |
| `src/components/import/FileDropzone.vue` | .dat accept, size check, emit file |
| `src/components/import/ParsePreviewTable.vue` | Preview table and skipped reasons |
| `src/components/import/ImportSummary.vue` | Post-import success/error summary |
| `src/composables/useZkParser.js` | classify, parseUserDat, parseAttendanceDat, parseDatFile |
| `src/stores/import.js` | importAttendance (staff lookup, group, upsert batches) |
