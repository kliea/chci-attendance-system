#!/bin/bash
# Structured commits for Dashboard, Employees, and Employee DTR phases.
# Run from repo root: bash scripts/commit-phases.sh
# Then: git push

set -e
cd "$(dirname "$0")/.."

# 1. Schema: profiles email + program, trigger
git add sql/supabase-schema.sql
git commit -m "feat(schema): add email and program to profiles

- Add profiles.email and profiles.program (CS, IS, IT)
- handle_new_user sets email and program from auth/metadata
- Alter statements for existing deployments"

# 2. Dashboard: attendance pagination + daily record and stat cards
git add src/stores/attendance.js src/views/manager/DashboardView.vue
git commit -m "feat(dashboard): daily attendance record with pagination and stat cards

- Attendance store: optional page/pageSize, totalCount, totalPages
- Dashboard: wire to attendance store, date picker, stat cards (Present/Late/Absent/On Leave)
- Daily attendance table with client-side pagination"

# 3. Employees: profile list, email/program in store and UI
git add src/stores/employees.js src/views/manager/EmployeesView.vue
git commit -m "feat(employees): profile list with bio id, email, name, program

- Employees store: fetch email/program, createEmployee accepts program, sync email to profile
- Registered employees table (Name, Bio ID, Email, Program)
- Staff roster section kept; Program dropdown in Register and Bulk create"

# 4. Employee DTR: composable, view, nav rename
git add src/composables/useHoursRendered.js src/views/manager/AttendanceView.vue src/components/layout/Sidebar.vue src/components/layout/TopBar.vue
git commit -m "feat(dtr): Employee DTR view with month filter, hours summary, print

- useHoursRendered: computeHoursRendered, groupLogsByStaff
- Attendance → Employee DTR: month filter, employee table (Name, Bio ID, Program, hours, days)
- Per-employee daily logs modal; Print daily logs and Print DTR
- Sidebar/TopBar label: Attendance → Employee DTR"

echo "Done. Run: git push"
