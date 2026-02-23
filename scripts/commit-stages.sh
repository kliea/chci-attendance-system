#!/bin/bash
# Run from project root: bash scripts/commit-stages.sh
set -e

git add supabase-schema.sql supabase-migrate-to-staff.sql supabase-seed-employees.sql
git commit -m "feat(db): add staff table, teams, and attendance_logs keyed by staff"

git add supabase-fix-profiles-500.sql
git commit -m "fix(db): add is_manager() helper to resolve profiles RLS 500"

git add src/stores/staff.js src/stores/attendance.js src/stores/employees.js src/stores/import.js
git commit -m "feat(stores): add staff, attendance, employees, and import stores"

git add src/composables/useZkParser.js
git commit -m "feat(composables): add useZkParser for ZKTeco .dat parsing"

git add src/components/import/
git commit -m "feat(import): add FileDropzone, ParsePreviewTable, ImportSummary components"

git add src/views/manager/ImportView.vue
git commit -m "feat(views): wire ImportView with ZKTeco upload flow"

git add src/views/manager/AttendanceView.vue src/views/manager/EmployeesView.vue
git commit -m "feat(views): wire AttendanceView and EmployeesView for managers"

git add src/views/employee/MyAttendanceView.vue
git commit -m "feat(views): wire MyAttendanceView for employees"

git add IMPORT_FLOW.md .cursorrules
git commit -m "docs: add IMPORT_FLOW and cursorrules"

echo "Done. Run: git push"
