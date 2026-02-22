# First push — series of commits

Use these commands from the **project root** so the first push has a clear history instead of one big commit. Run them in order after `git init` (and optionally `git remote add origin <url>`).

**Prerequisite:** Ensure `.gitignore` exists so `node_modules` and `.env` are not committed.

---

## 1. Chore: project init and config

```bash
git add package.json package-lock.json vite.config.js tailwind.config.js postcss.config.js index.html
git commit -m "chore: init Vue 3 + Vite + Tailwind project"
```

---

## 2. Chore: app entry and base styles

```bash
git add src/main.js src/App.vue src/assets/base.css
git commit -m "chore: add app entry and base Tailwind styles"
```

---

## 3. Feat: Supabase client and env example

```bash
git add src/lib/supabase.js .env.example
git commit -m "feat(lib): add Supabase client and env example"
```

---

## 4. Feat: auth store

```bash
git add src/stores/auth.js
git commit -m "feat(auth): add auth store with session, profile, signIn, signUp, signOut"
```

---

## 5. Feat: router and auth guard

```bash
git add src/router/index.js
git commit -m "feat(router): add routes and role-based auth guard"
```

---

## 6. Feat: layout components

```bash
git add src/components/layout/AppShell.vue src/components/layout/Sidebar.vue src/components/layout/TopBar.vue
git commit -m "feat(layout): add AppShell, Sidebar, TopBar"
```

---

## 7. Feat: auth views

```bash
git add src/views/auth/LoginView.vue src/views/auth/RegisterView.vue
git commit -m "feat(auth): add login and register views"
```

---

## 8. Feat: manager and employee views

```bash
git add src/views/manager/DashboardView.vue src/views/manager/EmployeesView.vue src/views/manager/AttendanceView.vue src/views/manager/ImportView.vue src/views/manager/RectificationsView.vue src/views/manager/HolidaysView.vue src/views/employee/MyAttendanceView.vue src/views/employee/RectifyView.vue
git commit -m "feat(views): add manager and employee placeholder views"
```

---

## 9. Docs: README and setup/running/usage

```bash
git add README.md docs/README.md docs/setup.md docs/running.md docs/usage.md docs/auth-api.md docs/project-structure.md docs/database.md docs/import.md docs/troubleshooting.md
git commit -m "docs: add README and core documentation"
```

---

## 10. Chore: database schema and seed

```bash
git add supabase-schema.sql supabase-seed.sql scripts/seed.js
git commit -m "chore(db): add Supabase schema and seed script"
```

---

## 11. Docs: RBAC, seeding, commit conventions

```bash
git add docs/rbac.md docs/seeding.md docs/commit-conventions.md docs/first-push-commits.md
git commit -m "docs: add RBAC, seeding, and commit conventions"
```

---

## 12. Chore: gitignore

```bash
git add .gitignore
git commit -m "chore: add gitignore for node_modules and env"
```

> **Note:** If you already ran `git init` and want `.gitignore` in the first commit, do step 12 first, then 1–11. Otherwise leave it last so untracked files are ignored from the start.

---

## 13. Style: light mode theme

```bash
git add tailwind.config.js
git commit -m "style: switch to light mode blue/white/black theme"
```

---

## Push

```bash
git push -u origin main
```

(Use `master` instead of `main` if your default branch is `master`.)

---

## Optional: single script

To run all adds/commits in one go (after reviewing), copy the block below. Ensure you’re in the project root and have run `git init` and added `.gitignore` first so `node_modules` and `.env` are ignored.

```bash
git add .gitignore && git commit -m "chore: add gitignore for node_modules and env"

git add package.json package-lock.json vite.config.js tailwind.config.js postcss.config.js index.html
git commit -m "chore: init Vue 3 + Vite + Tailwind project"

git add src/main.js src/App.vue src/assets/base.css
git commit -m "chore: add app entry and base Tailwind styles"

git add src/lib/supabase.js .env.example
git commit -m "feat(lib): add Supabase client and env example"

git add src/stores/auth.js
git commit -m "feat(auth): add auth store with session, profile, signIn, signUp, signOut"

git add src/router/index.js
git commit -m "feat(router): add routes and role-based auth guard"

git add src/components/layout/AppShell.vue src/components/layout/Sidebar.vue src/components/layout/TopBar.vue
git commit -m "feat(layout): add AppShell, Sidebar, TopBar"

git add src/views/auth/LoginView.vue src/views/auth/RegisterView.vue
git commit -m "feat(auth): add login and register views"

git add src/views/manager/*.vue src/views/employee/*.vue
git commit -m "feat(views): add manager and employee placeholder views"

git add README.md docs/README.md docs/setup.md docs/running.md docs/usage.md docs/auth-api.md docs/project-structure.md docs/database.md docs/import.md docs/troubleshooting.md
git commit -m "docs: add README and core documentation"

git add supabase-schema.sql supabase-seed.sql scripts/seed.js
git commit -m "chore(db): add Supabase schema and seed script"

git add docs/rbac.md docs/seeding.md docs/commit-conventions.md docs/first-push-commits.md
git commit -m "docs: add RBAC, seeding, and commit conventions"

git add tailwind.config.js
git commit -m "style: switch to light mode blue/white/black theme"
```

Then: `git push -u origin main`
