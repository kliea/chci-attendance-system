-- Klinth — seed data. Run in Supabase SQL Editor after sql/supabase-schema.sql.
-- Use this for reference data (holidays, teams). For test users, use the Node seeder (see docs/seeding.md).

-- Example team (optional; manager_id can be set after you have a manager profile)
insert into public.teams (id, name)
values ('00000000-0000-0000-0000-000000000001'::uuid, 'Default Team')
on conflict do nothing;

-- Example holidays (current year; adjust dates as needed)
insert into public.holidays (date, name, type)
values
  ('2025-01-01', 'New Year''s Day', 'regular'),
  ('2025-04-18', 'Good Friday', 'regular'),
  ('2025-12-25', 'Christmas Day', 'regular')
on conflict (date) do nothing;
