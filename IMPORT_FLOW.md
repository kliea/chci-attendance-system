# Klinth — DAT Import Flow Plan
## ZKTeco Biometric Device → Supabase

---

## Overview

```
USB Device → .dat file export → browser upload → parse → preview → upsert → done
```

---

## File Types

ZKTeco exports two separate .dat files:

| File       | Contains                          | Key Fields                              |
|------------|-----------------------------------|-----------------------------------------|
| User .dat  | Employee roster from device       | PIN, Name, Password, Card, Role         |
| Att .dat   | Time-punch log                    | PIN, Date, Time, Verify, In/Out code    |

---

## In/Out Codes (ZKTeco Standard)

| Code | Meaning      | Maps To           |
|------|--------------|-------------------|
| 0    | Check In     | `time_in`         |
| 1    | Check Out    | `time_out`        |
| 4    | OT In        | `overtime_in`     |
| 5    | OT Out       | `overtime_out`    |

---

## Import Flow (Step by Step)

### Step 1 — Upload
- Admin navigates to `/admin/import`
- Drops or selects a `.dat` file (max 10MB)
- `useZkParser.js` reads the file as text via `File.text()`

### Step 2 — Classify
- Parser scans the first non-empty line
- If a token matches `YYYY-MM-DD` → **attendance file**
- Otherwise → **user file**

### Step 3 — Parse
**User file:**
- Split each line by whitespace
- Extract PIN (bio_id), Name tokens, strip trailing numeric fields
- Best-effort split into fname / minit / lname

**Attendance file:**
- Split each line: `[PIN, DATE, TIME, VERIFY, IN_OUT, ...]`
- Validate date `YYYY-MM-DD` and time `HH:MM:SS` formats
- Build timestamp string `YYYY-MM-DDTHH:MM:SS`
- Record in_out code for later mapping

### Step 4 — Preview
- Display parsed records in a table (capped at 100 rows)
- Show count: valid records vs skipped lines
- Expandable list of skipped lines with reason
- Admin must click **Confirm & Import** to proceed

### Step 5 — Upsert (Users)
```
parsed users
  → map to { bio_id, fname, minit, lname, username, email, userrole_id }
  → supabase.from('users').upsert(rows, { onConflict: 'bio_id' })
  → batches of 50
```
- `email` defaults to `{bio_id}@klinth.local` — admin updates later
- `username` defaults to `bio_id`
- `userrole_id` defaults to 3 (employee)

### Step 6 — Upsert (Attendance)
```
parsed logs
  → fetch all users with bio_id → build bioMap { bio_id: uuid }
  → group logs by bio_id + date
  → for each group, assign time_in / time_out / overtime_in / overtime_out by in_out code
  → determine status: present | late (if time_in > 08:10)
  → supabase.from('attendance').upsert(rows, { onConflict: 'user_id,date' })
  → batches of 50
```

### Step 7 — Result
- Progress bar fills during batching
- Done screen shows: records saved / failed
- Expandable error log per batch
- Option to import another file

---

## Important Rules

- **Import users before attendance** — attendance upsert requires bio_id → uuid mapping
- **Duplicate protection** — upsert with `onConflict` prevents double entries
- **No time_out overwrite risk** — grouping by date means all punches for a day are resolved together before upsert
- **Unmapped bio_ids** — logged as warnings, not hard failures; import continues

---

## Recommended First Run Order

1. Export `user.dat` from ZKTeco device via USB
2. Upload to Klinth → Import View → confirms users into DB
3. Export `att.dat` from ZKTeco device
4. Upload to Klinth → Import View → maps to user UUIDs and populates attendance

---

## Files

| File | Purpose |
|------|---------|
| `src/composables/useZkParser.js` | Reads & parses .dat file, returns structured array |
| `src/stores/import.js`           | Pinia store — handles Supabase upsert with batching |
| `src/views/admin/ImportView.vue` | Full UI: upload → preview → confirm → result |
| `.cursorrules`                   | Cursor IDE project context and coding rules |
