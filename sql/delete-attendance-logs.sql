-- Delete attendance_logs. Run in Supabase SQL Editor.
-- WARNING: This removes records permanently. Use filters to limit scope if needed.

-- Option 1: Delete ALL attendance logs
-- DELETE FROM public.attendance_logs;

-- Option 2: Delete by date range (uncomment and set dates)
-- DELETE FROM public.attendance_logs
-- WHERE date >= '2026-01-01' AND date <= '2026-12-31';

-- Option 3: Delete for one staff (by bio_id)
-- DELETE FROM public.attendance_logs
-- WHERE staff_id = (SELECT id FROM public.staff WHERE bio_id = '19' LIMIT 1);

-- Option 4: Delete before a certain date
-- DELETE FROM public.attendance_logs
-- WHERE date < '2026-01-01';
