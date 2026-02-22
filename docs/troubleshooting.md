# Troubleshooting

Common issues and fixes.

- **"Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"** — Create `.env` from `.env.example` and set both variables. Restart `npm run dev`.

- **Blank page or error when the app runs** — Usually invalid Supabase keys. Use the real **Project URL** and **anon (public) key** from Supabase Dashboard → Project Settings → API (anon key is a long JWT starting with `eyJ...`). If session init fails, the app recovers and shows the login page instead of hanging.

- **Login fails** — Confirm the user exists in Supabase **Authentication**, and that `profiles` has a row with the same `id` and a valid `role` (`manager` or `employee`).

- **Wrong redirect after login** — Check `profiles.role` for that user in Supabase.

- **Register fails / RLS or profile error** — Ensure the `handle_new_user` trigger exists (see `supabase-schema.sql`). The app does not insert into `profiles` from the client; the trigger creates the profile on sign-up.

- **406 or “table not in schema cache”** — Run `supabase-schema.sql` in the Supabase SQL Editor so the `profiles` table (and others) exist. Refresh the schema cache or restart the project if the error persists.
