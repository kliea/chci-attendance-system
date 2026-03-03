# ANITO — Full Codebase Audit Report

**System:** ANITO (OJT Attendance Monitoring for CHCI)  
**Stack:** Vue 3 (Composition API, `<script setup>`), Vite, Pinia, Vue Router 4, Tailwind CSS, Supabase  
**Audit type:** Read-only analysis — no files modified.

---

## 📁 CODEBASE MAP

**Summary:** 10 views (2 auth, 5 manager, 3 employee), 22+ UI/layout/import components, 6 Pinia stores, 5 composables, 1 Supabase client. Router has role-based guards; no 404 route.

| Area | Count | Notes |
|------|--------|------|
| **Views** | 10 | LoginView, RegisterView; Dashboard, Employees, Attendance, Import, Rectifications, Holidays (manager); MyAttendance, Rectify (employee). RectifyStatusView and RectifyRequestView exist but are not in router. |
| **Components** | 22+ | `ui/`: Button, Input, Label, Card, CardHeader, CardHeaderFlex, Badge, DataTable, Dialog, EmptyState, StatCard, LoadingBar, AttendanceDayTable, PrintDailyLogsButton, DtrAppendix24Print. `layout/`: AppShell, Sidebar, TopBar. `import/`: FileDropzone, ParsePreviewTable, ImportSummary. |
| **Stores** | 6 | auth (Options API), attendance, employees, rectifications (Options API), staff, import. All use Supabase. |
| **Composables** | 5 | useAttendanceDayRows, useFillAppendix24Pdf, useHoursRendered, useZkParser, useFormatters. |
| **Router** | 1 file | createWebHistory, requiresAuth / managerOnly / employeeOnly meta, no catch-all 404. |
| **Lib** | 2 | supabase.js (env-based client), utils.js (cn, valueUpdater). |

**Key dependencies (package.json):** Vue 3.4, Pinia 2.1, Vue Router 4.2, Supabase 2.39, Vite 5, Tailwind 3.4, Inter/Playfair Display/Montserrat fonts, pdf-lib, lucide-vue-next, class-variance-authority, clsx, tailwind-merge.

**Tailwind:** Custom `anito` palette (black, blue-deep, blue-mid, blue-light, white, gray, gray-light); font-display (Playfair Display), font-sans (Inter), font-heading (Montserrat). Design system specifies Cormorant Garamond + DM Sans in prompt; actual config uses Playfair + Inter (comment in config says "replaces Cormorant Garamond" / "replaces DM Sans").

**Global styles (base.css):** shadcn-style HSL variables, hero-title/hero-subtitle classes, chci-accent/chci-grid blobs, marquee styles. Body uses Inter.

---

## 🔧 CODE QUALITY FINDINGS

### 2A. Vue & Composition API

- [MINOR] `src/views/employee/RectifyView.vue` line ~232 — `v-for="(rect, index) in rectifications"` with `:key="index"` on a mutable list (items can be removed); key should be a stable id to avoid wrong DOM reuse.
- [MINOR] `src/views/employee/RectifyRequestView.vue` line ~322 — Same pattern: `v-for` over `rectifications` with `:key="index"`.
- [MINOR] `src/components/import/ParsePreviewTable.vue` line ~45 — `v-for="(row, idx) in displayRecords"` with `:key="idx"`; displayRecords is a slice, so index is stable for display-only list — lower risk but still index-as-key.
- [MINOR] `src/components/ui/AttendanceDayTable.vue` — Uses both `<script setup>` and a second `<script>` block with `export default { inheritAttrs: false }`; can be merged into script setup with `defineOptions({ inheritAttrs: false })` (Vue 3.3+).
- [SUGGESTION] `src/views/manager/DashboardView.vue` — Inline status badge class logic in template (lines ~42–50) could be a small computed or shared Badge variant for consistency.
- ✓ All audited views use `<script setup>` and ref/reactive appropriately; no Options API in views. defineProps/defineEmits used where needed.

### 2B. Pinia Stores

- [MAJOR] `src/stores/auth.js` — No `$reset()`; store holds user, profile, loading, error. On sign-out state is cleared manually; a `$reset()` would help consistency and testing.
- [MAJOR] `src/stores/rectifications.js` — No `$reset()`. Holds requests, loading, error, submitting, submitError, submitSuccess; clearSubmitStatus exists but no full reset for session/form state.
- [MINOR] `src/stores/attendance.js` — For employee path, `fetchAttendance` calls `supabase.auth.getUser()` and then separate `profiles` and `staff` lookups; this duplicates auth/profile resolution that could live in a shared composable or auth store helper.
- [SUGGESTION] Auth store uses Options API, rectifications uses Options API; others use setup/store composition style. Consistency could be improved by migrating to composition-style stores.
- ✓ import store has `$reset()`. Async actions use try/catch or handle `error` from Supabase. Loading/error state is generally set in stores.

### 2C. Supabase Usage

- [MAJOR] `src/views/auth/RegisterView.vue` line ~182 — Supabase called directly in view: `await supabase.rpc("get_unregistered_staff")`. Should be moved to a store or composable for consistency and testability.
- [MINOR] `src/stores/auth.js` line ~61 — `profiles` fetch uses `.select("*")`; could select only needed columns (e.g. id, full_name, role, bio_id).
- [MINOR] `src/stores/rectifications.js` — Multiple `.select("*")` on rectification_requests and attendance_logs (lines ~31, 227, 261, 272); could restrict to required columns.
- [MINOR] `src/stores/attendance.js` — Employee path does not destructure `error` from profile/staff lookups (e.g. `const { data: profile } = ...`); errors are silently ignored and flow continues.
- ✓ No service role or credentials in repo; client uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. No realtime subscriptions found that would need cleanup. `.single()` / `.maybeSingle()` used where appropriate for single-row expectations.

### 2D. Router & Navigation

- [MAJOR] `src/router/index.js` — No 404 / catch-all route; unknown paths do not render a dedicated not-found view.
- [MINOR] `src/views/auth/LoginView.vue` — Uses `router.push(redirect)` with string path (e.g. `/dashboard`, `/my-attendance` or `route.query.redirect`); using named routes would be safer (e.g. `router.push({ name: 'dashboard' })`).
- [MINOR] `src/views/auth/RegisterView.vue` line ~207 — `router.push("/login")`; could use `router.push({ name: 'login' })`.
- ✓ Routes have meta: public, requiresAuth, managerOnly, employeeOnly. beforeEach enforces auth and role. createWebHistory() used (no hash); ensure server is configured for SPA fallback for deep links.

### 2E. Component Architecture

- [MAJOR] `src/views/manager/EmployeesView.vue` — Large single file (~412 lines) with multiple modals (edit staff, delete staff, edit profile, delete profile, add list), many refs and handlers; could be split into smaller components (e.g. StaffTable, ProfileTable, AddStaffModal, EditStaffModal) or composables for modal state.
- [MAJOR] `src/views/manager/RectificationsView.vue` — Very long (~768 lines) with inline detail and reject modals, bulk actions, and duplicated formatting/status helpers; modals and table could be extracted; formatDate, formatDateTime, getStatusClass, getRequesterName duplicated across views.
- [MINOR] `src/views/employee/RectifyView.vue` and `src/views/employee/RectifyRequestView.vue` — Overlapping rectification form + list UX and similar logic (formatDate, getStatusClass); RectifyRequestView is not in router; consider consolidating and removing dead code.
- [MINOR] `formatDate` / `formatDateTime` / `getStatusClass` repeated in RectificationsView, RectifyView, RectifyStatusView, RectifyRequestView; should live in `useFormatters.js` or a shared composable.
- [MINOR] Late threshold `08:30` appears in `DashboardView.vue` as `LATE_THRESHOLD = '08:30'` and in `useAttendanceDayRows.js` as `GRACE_END = 8*60+30`; should be a single constant (e.g. in a config or composable).
- ✓ Component barrel `src/components/ui/index.js` exists. No inline styles in most components; Tailwind used. DataTable/EmptyState/Button used consistently.

### 2F. General JavaScript

- [MINOR] Multiple `console.error` / `console.warn` in stores and views (auth, rectifications, router, LoginView, RectificationsView, PrintDailyLogsButton, AttendanceView); acceptable for dev but should be guarded or replaced with a logger for production.
- [SUGGESTION] `src/router/index.js` line ~85 — Timeout fallback calls `next()` without arguments after 2s to avoid hanging; could call `next(false)` or redirect to login to make behavior explicit.
- ✓ No `var`; const/let used. Async/await used consistently; no mixed .then() chains. Long functions are limited (e.g. updateAttendanceRecord in rectifications store is long but single-purpose). Nested property access generally guarded (optional chaining or checks).

---

## 🎨 UI/UX CONSISTENCY FINDINGS

### 3A. Typography

- [MINOR] `src/views/employee/RectifyRequestView.vue` — Uses `font-semibold` and `rounded-xl` in several places (e.g. buttons, table headers); ANITO standard is font-light for headings and no rounded-xl.
- [MINOR] `src/views/auth/RegisterView.vue` line ~130 — Modal title uses `text-xl font-semibold`; design system prefers `font-display font-light` for headings.
- [MINOR] `src/components/layout/Sidebar.vue` — Nav links use `text-xs tracking-[0.12em]`; prompt specifies `uppercase tracking-widest text-[10px]` for nav; current is 12px and different letter-spacing.
- [SUGGESTION] StatCard uses `hero-title font-light text-5xl` for value; other pages use `font-display font-light text-xl` for page titles — consistent use of font-display/font-light is mostly there; RectifyRequestView is the main outlier with font-semibold.

### 3B. Colors

- [MINOR] Hardcoded hex in several places: DashboardView and Badge use `#fdecea`, `#b91c1c`, `#fef3e2`, `#9a5f1a`, `#e8f4ec`, `#276749`; base.css uses `#0A3D91`, `#3a7cc3` in blobs and grid; DtrAppendix24Print uses `#000`, `#333`, `#f0f0f0`, `#e8e8e8` in scoped styles. Prefer anito-* or semantic tokens (e.g. danger, success) where possible.
- [MINOR] RectificationsView and RectifyView use Tailwind semantic greens/reds (`bg-green-600`, `bg-red-600`, `text-green-800`, etc.) for approve/reject; not anito-* but consistent within the app; design system allows semantic danger/success — tailwind.config has danger/success/warn.
- [MINOR] Sidebar scoped styles use `#6b7280`, `#131820` instead of anito-gray / anito-black.
- ✓ Most surfaces use anito-white, anito-black, anito-blue-*, anito-gray; no purple/orange accents.

### 3C. Spacing & Layout

- [MINOR] AppShell main content uses `px-8 py-10`; DashboardView uses `px-8 py-10`; EmployeesView uses `max-w-4xl` and `mb-6`/`mb-8`; AttendanceView uses `max-w-5xl`; RectificationsView uses `max-w-6xl`. Max-width and horizontal padding vary by page; consider a consistent page wrapper (e.g. same max-width and px/py).
- [MINOR] Card padding: CardHeaderFlex uses `p-4`, Dialog content uses `p-8` (from contentClass); modal padding varies (e.g. RectificationsView custom modals use `p-6`, `px-6 py-4`).
- ✓ Section headings and table spacing are generally consistent within sections.

### 3D. Component Visuals

- [MINOR] Buttons: RectificationsView uses custom `rounded-lg` and `rounded` for approve/reject; Button.vue uses `rounded`; RectifyRequestView uses `rounded-xl` for some buttons — border-radius should be standardized (e.g. `rounded` only).
- [MINOR] RectificationsView and RectifyView use custom modal markup (fixed overlay + div) instead of shared Dialog component in places; Dialog is used in RegisterView and EmployeesView — inconsistent modal implementation.
- [MINOR] Loading: Some views use LoadingBar, others use inline progress bar (RectificationsView, RectifyView, RectifyStatusView with `style="width: 60%"`); LoadingBar could be used consistently.
- [MINOR] Empty states: EmptyState component used in EmployeesView and HolidaysView; RectifyView/RectifyRequestView use inline "No previous requests" / "No rectifications added" text — could use EmptyState for consistency.
- ✓ Input and Label styling is consistent via shared components. Error text is mostly `text-red-600 text-sm`.

### 3E. Interaction & Feedback

- [MINOR] Destructive actions: EmployeesView has confirm modals for delete staff and delete profile; RectificationsView reject has a confirm modal; bulk approve/reject have no confirmation — consider confirmation for bulk actions.
- [MINOR] Success feedback: RectifyView shows submitSuccess then clears after 5s; RegisterView shows email modal then redirects; no global toast — pattern is acceptable but could be unified (e.g. toast or shared success component).
- ✓ Buttons have hover and disabled states. Forms show loading (e.g. "Signing in…", "Submitting…"). Transition-colors duration-150 used in many places.

### 3F. Responsive & Accessibility

- [MINOR] DataTable wraps table in `overflow-x-auto`; RectificationsView "All Requests" table has `overflow-x-auto`; AttendanceView print area is hidden on screen — tables are scrollable on small viewports.
- [MINOR] FileDropzone file input is `class="hidden"` and triggered by button; no visible `<label>` wrapping the input — consider associating a visible label or aria-label for the dropzone.
- [MINOR] RectificationsView and RectifyView custom modals use a single "✕" close button with `aria-label="Close"` in some places; focus trap and focus return on close not verified.
- [MINOR] Status badges (e.g. pending/approved/rejected) use color plus text; sufficient for accessibility; ensure sufficient contrast (yellow/green/red on light bg).
- ✓ Many inputs have associated Label with for-id. Icon-only "✕" buttons have aria-label where checked.

---

## 📊 SUMMARY

| Category | Critical | Major | Minor | Suggestions |
|----------|----------|-------|-------|-------------|
| Vue & Composition API | 0 | 0 | 4 | 1 |
| Pinia Stores | 0 | 2 | 2 | 1 |
| Supabase Usage | 0 | 1 | 3 | 0 |
| Router & Navigation | 0 | 1 | 2 | 1 |
| Component Architecture | 0 | 2 | 4 | 0 |
| General JavaScript | 0 | 0 | 1 | 1 |
| Typography | 0 | 0 | 3 | 1 |
| Colors | 0 | 0 | 3 | 0 |
| Spacing & Layout | 0 | 0 | 2 | 0 |
| Component Visuals | 0 | 0 | 4 | 0 |
| Interaction & Feedback | 0 | 0 | 2 | 0 |
| Responsive & Accessibility | 0 | 0 | 4 | 0 |
| **TOTAL** | **0** | **6** | **32** | **5** |

---

## 🚨 TOP 5 PRIORITY FIXES

1. **Add 404 route** — Router has no catch-all; add a not-found route and component so unknown paths show a consistent page instead of a blank or broken view.
2. **Move RegisterView Supabase call to store/composable** — `supabase.rpc("get_unregistered_staff")` in RegisterView should live in a store (e.g. staff or auth) or composable for consistency and testability.
3. **Add $reset() to auth and rectifications stores** — Enables predictable state reset (e.g. after logout or when leaving flows) and simplifies testing.
4. **Break up EmployeesView and RectificationsView** — Extract modals and tables into smaller components or composables to reduce file size and duplication (formatDate, getStatusClass, getRequesterName, modal markup).
5. **Centralize late threshold and shared formatters** — Single constant for 08:30 grace/late threshold; move formatDate, formatDateTime, getStatusClass into useFormatters (or similar) and reuse across RectificationsView, RectifyView, RectifyStatusView, RectifyRequestView.

---

*End of audit. No files were modified.*
