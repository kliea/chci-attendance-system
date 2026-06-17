-- Klinth — seed data. Run in Supabase SQL Editor after sql/supabase-schema.sql.
-- Use this for reference data (holidays, teams). For test users, use the Node seeder (see docs/seeding.md).

-- Example team (optional; manager_id can be set after you have a manager profile)
insert into public.teams (id, name)
values ('00000000-0000-0000-0000-000000000001'::uuid, 'Default Team')
on conflict do nothing;

-- Example holidays (current year; adjust dates as needed)
insert into public.holidays (date, name, type)
values
  ('2026-08-21', 'Ninoy Aquino Day', 'regular'),
  ('2026-12-30', 'National Heroes Day', 'regular')
on conflict (date) do nothing;
