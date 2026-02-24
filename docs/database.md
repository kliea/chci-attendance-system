# Database

Supabase (PostgreSQL) schema used by Klinth. The schema is applied via **`sql/supabase-schema.sql`** (run in Supabase SQL Editor).

## Tables

- **`profiles`** — Extends `auth.users`. Fields: `id` (FK to auth.users), `bio_id`, `full_name`, `role` (`admin` | `manager` | `supervisor` | `employee`), `team_id`, `created_at`. See [rbac.md](rbac.md) for role behaviour and SQL to change a user’s role. RLS: users can read/update own row; no client insert (profile created by trigger on sign-up).
- **`teams`** — `id`, `name`, `manager_id` (FK to profiles), `created_at`.
- **`attendance_logs`** — `id`, `user_id`, `date`, `time_in`, `time_out`, `status`, `source`, `created_at`; unique on `(user_id, date)`.
- **`rectification_requests`** — `id`, `user_id`, `attendance_id`, `date`, `reason`, `requested_in`/`requested_out`, `status`, `reviewed_by`, `reviewed_at`, `created_at`.
- **`holidays`** — `id`, `date`, `name`, `type`, `created_at`.

## Trigger

- **`on_auth_user_created`** — After insert on `auth.users`, inserts a row into `profiles` with `full_name` from `raw_user_meta_data` and `role = 'employee'`. Required for register to work without client-side profile insert (avoids RLS errors).

Each Auth user must have a matching `profiles` row with the correct `role` for the app’s route guard to work.
