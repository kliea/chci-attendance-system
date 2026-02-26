-- Reassign ALL attendance logs: from each staff row with bio_id = N to the staff row with bio_id = N+1.
-- Use when the stored bio_id was wrong for everyone and the correct value is +1 (e.g. 18→19, 5→6).
--
-- OPTION A: You have TWO staff rows per person (wrong N and correct N+1). Run the UPDATE below to move all logs to the correct row.
--
-- OPTION B: You have ONE staff row per person. Then just fix bio_id in place; no log reassignment needed:
--   UPDATE public.staff SET bio_id = (bio_id::int + 1)::text WHERE bio_id ~ '^\d+$';
-- Also update profiles: match by your own rule (e.g. update profiles set bio_id = (bio_id::int + 1)::text where bio_id ~ '^\d+$').
--
-- Run in Supabase SQL Editor.

-- Step 1: Remove duplicate dates on the TARGET (N+1) so the move doesn't hit unique (staff_id, date).
-- For any date that exists on both source (N) and target (N+1), delete the target's row so we keep the source's data when we move it.
DELETE FROM public.attendance_logs al
USING public.staff AS source
JOIN public.staff AS target
  ON target.bio_id = (source.bio_id::int + 1)::text
WHERE al.staff_id = target.id
  AND source.bio_id ~ '^\d+$'
  AND EXISTS (
    SELECT 1 FROM public.attendance_logs al2
    WHERE al2.staff_id = source.id AND al2.date = al.date
  );

-- Step 2: Move logs from staff with bio_id N to staff with bio_id N+1 (numeric only)
UPDATE public.attendance_logs al
SET staff_id = target.id
FROM public.staff AS source
JOIN public.staff AS target
  ON target.bio_id = (source.bio_id::int + 1)::text
WHERE al.staff_id = source.id
  AND source.bio_id ~ '^\d+$';

-- Optional: remove now-empty staff rows that had the wrong bio_id (only if no profile still links to them).
-- Uncomment and run after verifying the correct rows show the right data.
-- DELETE FROM public.staff
-- WHERE bio_id ~ '^\d+$'
--   AND NOT EXISTS (SELECT 1 FROM public.attendance_logs WHERE staff_id = staff.id)
--   AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.bio_id = staff.bio_id);
