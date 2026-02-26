-- Remove status column from attendance_logs. Run in Supabase SQL Editor if you have an existing DB that still has status.
alter table public.attendance_logs drop column if exists status;
