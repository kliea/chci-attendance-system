-- Sample queries for rectification_requests (run in Supabase SQL Editor)
-- Table: public.rectification_requests
--   id, user_id → profiles(id), attendance_id → attendance_logs(id), date, reason,
--   requested_in, requested_out, status ('pending'|'approved'|'rejected'),
--   reviewed_by → profiles(id), reviewed_at, created_at

-- 1. All rectification requests with requester and reviewer names (profiles)
SELECT
  r.id,
  r.date,
  r.reason,
  r.requested_in,
  r.requested_out,
  r.status,
  r.created_at,
  r.reviewed_at,
  requester.full_name AS requester_name,
  requester.bio_id   AS requester_bio_id,
  reviewer.full_name AS reviewer_name
FROM public.rectification_requests r
LEFT JOIN public.profiles requester ON requester.id = r.user_id
LEFT JOIN public.profiles reviewer  ON reviewer.id = r.reviewed_by
ORDER BY r.created_at DESC;

-- 2. Pending requests only
SELECT
  r.id,
  r.date,
  r.reason,
  r.requested_in,
  r.requested_out,
  r.created_at,
  p.full_name AS requester_name
FROM public.rectification_requests r
JOIN public.profiles p ON p.id = r.user_id
WHERE r.status = 'pending'
ORDER BY r.created_at ASC;

-- 3. Requests for a specific employee (by profile id)
-- Replace '<profile-uuid>' with the profile id (auth.uid() in app)
SELECT r.*, p.full_name AS requester_name
FROM public.rectification_requests r
JOIN public.profiles p ON p.id = r.user_id
WHERE r.user_id = '<profile-uuid>'
ORDER BY r.created_at DESC;

-- 4. Requests with linked attendance (join to attendance_logs)
SELECT
  r.id,
  r.date,
  r.reason,
  r.requested_in,
  r.requested_out,
  r.status,
  r.attendance_id,
  al.time_in  AS log_time_in,
  al.time_out AS log_time_out,
  al.status   AS log_status,
  p.full_name AS requester_name
FROM public.rectification_requests r
JOIN public.profiles p ON p.id = r.user_id
LEFT JOIN public.attendance_logs al ON al.id = r.attendance_id
ORDER BY r.created_at DESC;

-- 5. Count by status
SELECT status, count(*) AS count
FROM public.rectification_requests
GROUP BY status
ORDER BY count DESC;
