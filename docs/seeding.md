# Seeding the database

Two ways to add initial data.

## 1. SQL seed (Supabase SQL Editor)

Good for **reference data** only (no Auth users).

1. Run **`supabase-schema.sql`** first if tables don’t exist.
2. Open Supabase → **SQL Editor**.
3. Run **`supabase-seed.sql`** from the project root.

This inserts example teams and holidays. It does **not** create login users (those live in `auth.users` and must be created via Auth or the Node seeder below).

## 2. Node seeder (test users + holidays)

Creates **Supabase Auth users** and their **profiles**, and upserts holidays. Uses the **service role** key (bypasses RLS).

### Setup

1. In Supabase Dashboard → **Project Settings → API**, copy the **service_role** key (secret; never commit or expose to the frontend).
2. In your project root `.env` add:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Install deps (includes `dotenv` for the script):
   ```bash
   npm install
   ```

### Run

```bash
npm run seed
```

Defaults:

- **Manager:** `manager@klinth.local` / `password123` (profile role `manager`).
- **Employee:** `employee@klinth.local` / `password123` (profile role `employee`).

Override with env vars (optional):

- `SEED_MANAGER_EMAIL`, `SEED_MANAGER_PASSWORD`, `SEED_MANAGER_NAME`
- `SEED_EMPLOYEE_EMAIL`, `SEED_EMPLOYEE_PASSWORD`, `SEED_EMPLOYEE_NAME`

If a user already exists, the script skips creation and logs it. Safe to run multiple times.

### Security

- **Never** put `SUPABASE_SERVICE_ROLE_KEY` in the frontend or in committed files. Use it only in local scripts or a secure backend.
