#!/bin/bash
# Layered commits for UI migration (shadcn-vue + shared components).
# Run from repo root: bash scripts/commit-ui-migration.sh
# Conventions: docs/commit-conventions.md

set -e
cd "$(dirname "$0")/.."

# 1. chore: shadcn-vue init and config
git add jsconfig.json components.json package.json package-lock.json tailwind.config.js src/assets/base.css src/lib/utils.js
git commit -m "chore: add shadcn-vue init, jsconfig, and theme config

- jsconfig.json with @/* path alias for shadcn-vue CLI
- components.json for shadcn-vue component registry
- tailwindcss-animate, shadcn CSS variables in base.css
- src/lib/utils.js for cn() helper"

# 2. feat(ui): shared UI component library
git add src/components/ui/
git commit -m "feat(ui): add shared UI component library

- Button (primary, secondary, outline, ghost variants)
- Input, Label with light/dark variants
- Badge for status (present, late, absent, holiday)
- Card, CardHeader, CardHeaderFlex
- Dialog with header/actions slots
- DataTable with configurable columns and row slot
- StatCard, EmptyState, LoadingBar"

# 3. feat(composables): useFormatters
git add src/composables/useFormatters.js
git commit -m "feat(composables): add useFormatters for date and time

- formatDate, formatTime shared across attendance views"

# 4. refactor(auth): use UI components in auth views
git add src/views/auth/LoginView.vue src/views/auth/RegisterView.vue
git commit -m "refactor(auth): use Button, Input, Label in login and register"

# 5. refactor(layout): use Button in layout components
git add src/components/import/FileDropzone.vue src/components/layout/TopBar.vue
git commit -m "refactor(layout): use Button in FileDropzone and TopBar"

# 6. refactor(views): use UI components in manager views
git add src/views/manager/DashboardView.vue src/views/manager/EmployeesView.vue src/views/manager/AttendanceView.vue src/views/manager/ImportView.vue src/views/manager/HolidaysView.vue src/views/manager/RectificationsView.vue
git commit -m "refactor(views): use UI components in manager views

- Dashboard: StatCard, Card, DataTable, Badge, useFormatters
- Employees: Card, DataTable, Dialog, EmptyState, LoadingBar
- Attendance: Card, DataTable, Dialog, Badge, useFormatters
- Import: Button, Card
- Holidays, Rectifications: EmptyState"

# 7. refactor(views): use UI components in employee views
git add src/views/employee/MyAttendanceView.vue src/views/employee/RectifyView.vue
git commit -m "refactor(views): use UI components in employee views

- MyAttendance: Card, DataTable, Badge, useFormatters
- Rectify: EmptyState"

echo "Done. Run: git push"
