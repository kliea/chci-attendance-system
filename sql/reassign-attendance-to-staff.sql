-- Reassign attendance_logs from one staff (by bio_id) to another.
-- Use when you fixed bio_id in Supabase and need logs to follow the "correct" staff row.
-- Run in Supabase SQL Editor. Replace OLD_BIO_ID and NEW_BIO_ID with your values.

UPDATE public.attendance_logs
SET staff_id = (SELECT id FROM public.staff WHERE bio_id = 'NEW_BIO_ID' LIMIT 1)
WHERE staff_id = (SELECT id FROM public.staff WHERE bio_id = 'OLD_BIO_ID' LIMIT 1);
