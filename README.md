# Klinth

Minimal web-based team attendance management. Connects ZKTeco biometric devices (via exported `.dat` files) with a real-time dashboard backed by Supabase.

**Stack:** Vue 3 (Composition API, `<script setup>`), Vite, Pinia, Vue Router 4, Supabase (Auth, PostgreSQL, Realtime), Tailwind CSS. No UI component library.

---

## Quick start (new developers)

1. **Clone and install**
   ```bash
   cd chci-attendance-system
   npm install
   ```

2. **Environment** — Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL` — Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — Supabase anon (public) key  

   Get both from **Supabase Dashboard → Project Settings → API**.

3. **Database** — Run **`supabase-schema.sql`** in the Supabase SQL Editor so tables and the sign-up trigger exist.

4. **Run**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 and sign in or register.

---

## Documentation

All detailed docs live in the **`docs/`** folder:

| Doc | Contents |
|-----|----------|
| [docs/setup.md](docs/setup.md) | Full setup (prerequisites, env, database) |
| [docs/running.md](docs/running.md) | Dev, build, preview commands |
| [docs/usage.md](docs/usage.md) | How to use the app (login, register, roles) |
| [docs/auth-api.md](docs/auth-api.md) | Register/login via Supabase Auth |
| [docs/project-structure.md](docs/project-structure.md) | Source layout |
| [docs/database.md](docs/database.md) | Schema and trigger |
| [docs/import.md](docs/import.md) | ZKTeco .dat import |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Common errors and fixes |

Start with [docs/setup.md](docs/setup.md) if you need step-by-step setup; use [docs/troubleshooting.md](docs/troubleshooting.md) when something breaks.
