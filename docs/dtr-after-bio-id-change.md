# DTR after editing Bio ID in Supabase

If you manually changed `bio_id` in the **staff** or **profiles** table in Supabase, use this to get the right DTR per employee.

## How it works

- **Attendance is stored by staff:** `attendance_logs.staff_id` → `staff.id`. Each row is tied to a **staff** row, not to `bio_id` directly.
- **Who sees what:** An employee (profile) sees logs where `profile.bio_id` = `staff.bio_id`. The manager sees all staff and picks one; logs are filtered by that staff’s `id`.
- **Hours/undertime:** Computed in the app from `attendance_logs` when you open the view or print. Nothing is “stored” to recalculate.

So there is no separate “recalculate DTR” step in the database. You only need to keep links correct and optionally refresh data.

---

## 1. Keep profile and staff in sync

After editing in Supabase:

- **Staff roster:** Each **staff** row has one `bio_id`. That’s the “PIN” from the device.
- **Registered employees:** Each **profile** has `bio_id` (optional). It must match a **staff.bio_id** so that person sees that staff’s attendance.

**What to do:** For each employee who should see their DTR, set:

- **staff.bio_id** = the PIN that appears in the device export (e.g. .dat), and  
- **profiles.bio_id** (for that person) = the same value.

Then in the app: refresh the page (or re-open Attendance / My Attendance). The correct logs and hours will show; no DB “recalculation” needed.

---

## 2. Refresh raw data from the device (optional)

If you fixed **staff.bio_id** so it matches the PIN in the device export:

1. Export a new .dat from the device (or use the same file if it already has the right PINs).
2. In the app: **Import** → choose the file → import.  
   The importer maps each PIN in the file to **staff** via `staff.bio_id` and upserts `attendance_logs` by `(staff_id, date)`. So you’re just refreshing time_in / time_out from the file; no separate “recalculate” step.

---

## 3. Move existing logs to a different staff row (optional)

Use this only if attendance was recorded under the wrong staff and you want to **reassign** those logs to another staff row (e.g. after merging two staff identities or fixing a wrong bio_id).

**Example:** All logs that were under staff with `bio_id = '123'` should now be under staff with `bio_id = '456'`.

Run in **Supabase SQL Editor** (replace the bio_id values with yours):

```sql
-- Reassign attendance from one staff (old bio_id) to another (new bio_id).
-- Replace OLD_BIO_ID and NEW_BIO_ID with actual values, then run once.

UPDATE public.attendance_logs
SET staff_id = (SELECT id FROM public.staff WHERE bio_id = 'NEW_BIO_ID' LIMIT 1)
WHERE staff_id = (SELECT id FROM public.staff WHERE bio_id = 'OLD_BIO_ID' LIMIT 1);
```

- `NEW_BIO_ID`: the staff row that should **own** the logs from now on.
- `OLD_BIO_ID`: the staff row that currently has those logs (they will be moved away).

After this, the employee whose **profile.bio_id** = `NEW_BIO_ID` will see those logs. No “recalculate” step; just refresh the app.

---

## Summary

| Goal | Action |
|------|--------|
| Correct DTR after editing bio_id | Set **staff.bio_id** and **profiles.bio_id** to the same value where needed; **refresh the app**. |
| Refresh punches from device | Re-import the .dat (staff.bio_id must match PIN in file). |
| Move logs to another staff | Run the `UPDATE attendance_logs SET staff_id = ...` SQL above in Supabase. |

Hours and DTR are always computed from `attendance_logs` when you open the view or print; there is no stored total to recalculate.
