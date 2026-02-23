-- Klinth — seed staff (employees). Run in Supabase SQL Editor after supabase-schema.sql.
-- Staff roster: bio_id + full_name. No auth required. Use for attendance import.

insert into public.staff (bio_id, full_name)
values
  ('17', 'Lesley'),
  ('18', 'Ian'),
  ('19', 'Earl'),
  ('20', 'Dave'),
  ('21', 'Maria'),
  ('22', 'Kristine'),
  ('23', 'Leo'),
  ('24', 'Law'),
  ('25', 'Edrian'),
  ('26', 'Vicryl'),
  ('27', 'Pablo'),
  ('28', 'Abonales'),
  ('29', 'Corpin'),
  ('30', 'Isiderio'),
  ('31', 'Pacana'),
  ('32', 'Guilbert'),
  ('33', 'Roberto'),
  ('34', 'Hanz'),
  ('37', 'Mark')
on conflict (bio_id) do update set full_name = excluded.full_name;
