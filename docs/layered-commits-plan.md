# Layered commits plan (fix/database)

Follow [commit-conventions.md](commit-conventions.md). Run from project root, in order.

---

## 1. Database: profile FK and staff RLS for employees

```bash
git add sql/supabase-schema.sql
git commit -m "fix(db): add profile.bio_id FK to staff and employee staff RLS

- profiles.bio_id references staff.bio_id for referential integrity
- RLS: Users can select own staff row (profile.bio_id = staff.bio_id)
  so employees can resolve staff_id and view own attendance_logs"
```

---

## 2. Store: attendance_logs naming and comment

```bash
git add src/stores/attendance.js
git commit -m "refactor(attendance): clarify attendance_logs in store and RLS comment"
```

---

## 3. Formatters: add formatTimeAmPm for day table

```bash
git add src/composables/useFormatters.js
git commit -m "feat(ui): add formatTimeAmPm for 12h display in attendance tables"
```

---

## 4. Shared day table: composable + component

```bash
git add src/composables/useAttendanceDayRows.js
git add src/components/ui/AttendanceDayTable.vue
git add src/components/ui/index.js
git commit -m "feat(attendance): add useAttendanceDayRows and AttendanceDayTable

- buildDayRows(month, logs): day-by-day rows with time in/out, hours rendered
- totalHoursRenderedInMonth, computeHoursRenderedForDay (8–5, 8:30 grace)
- AttendanceDayTable: Day, Weekday, Time in, Time out, Hours rendered
- Shared by employee My Attendance and manager daily logs + print"
```

---

## 5. Employee: My Attendance day table and total hours

```bash
git add src/views/employee/MyAttendanceView.vue
git commit -m "feat(employee): day-by-day My Attendance with month filter and total hours

- Month picker, day table (AttendanceDayTable), total rendered hours
- Local date range for month to fix timezone (no Jan 31 in Feb)"
```

---

## 6. Manager: daily logs and print use day table

```bash
git add src/views/manager/AttendanceView.vue
git commit -m "refactor(manager): use day table for daily logs modal and print

- Detail modal and print show Day, Weekday, Time in, Time out, Hours rendered
- Print payload uses dayRows; AttendanceDayTable with printMode"
```

---

## 7. Layout and copy: app name / branding

```bash
git add index.html src/components/layout/Sidebar.vue src/components/layout/TopBar.vue
git add src/views/auth/LoginView.vue src/views/auth/RegisterView.vue
git add src/views/manager/EmployeesView.vue
git commit -m "style(layout): align app name and copy across index, Sidebar, TopBar, auth"
```

---

## Summary

| # | Type       | Scope      | Description |
|---|------------|------------|-------------|
| 1 | fix        | db         | profile FK + staff RLS for employees |
| 2 | refactor   | attendance | store comments |
| 3 | feat       | ui         | formatTimeAmPm |
| 4 | feat       | attendance | useAttendanceDayRows + AttendanceDayTable |
| 5 | feat       | employee   | My Attendance day table + total hours |
| 6 | refactor   | manager    | daily logs and print use day table |
| 7 | style      | layout     | app name and copy |

After running all seven, verify with `git log --oneline -7`.
