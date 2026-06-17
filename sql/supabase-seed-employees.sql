-- Klinth — seed staff (employees). Run in Supabase SQL Editor after sql/supabase-schema.sql.
-- Staff roster: bio_id + full_name. No auth required. Use for attendance import.

insert into public.staff (bio_id, full_name)
values
  ('45', 'S.Nacar'),
  ('46', 'I.Reyes'),
  ('47', 'Olaybar'),
  ('48', 'A.Sabuero'),
  ('49', 'M.Galdiano'),
  ('50', 'G.Ongco'),
  ('51', 'K.Octobre'),
  ('52', 'R.Labastida')
on conflict (bio_id) do update set full_name = excluded.full_name;
