-- Drop RLS and table for rectification_requests, then recreate to match supabase-schema.sql (60-73).
-- Run this in Supabase SQL Editor. Ensures table matches: user_id/reviewed_by → profiles(id), etc.

-- 1. Drop existing policies (so RLS is clean if table is recreated below)
drop policy if exists "Users can view own rectification requests" on public.rectification_requests;
drop policy if exists "Managers can view all rectification requests" on public.rectification_requests;
drop policy if exists "Users can create own rectification requests" on public.rectification_requests;
drop policy if exists "Managers can update rectification requests" on public.rectification_requests;
drop policy if exists "No deletion of rectification requests" on public.rectification_requests;

-- 2. Drop table (CASCADE removes any remaining dependencies; RLS goes with the table)
drop table if exists public.rectification_requests cascade;

-- 3. Recreate table per schema (profiles only, no users)
create table public.rectification_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) not null,
  attendance_id   uuid references public.attendance_logs(id),
  date            date not null,
  reason          text not null,
  requested_in    time,
  requested_out   time,
  status          text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  created_at      timestamptz default now()
);

-- 4. (Optional) Re-apply RLS using profiles: run sql/supabase-fix-rectification-users.sql
--    or uncomment below to enable RLS and create policies here:

/*
alter table public.rectification_requests enable row level security;

create policy "Users can view own rectification requests"
  on public.rectification_requests for select using (auth.uid() = user_id);

create policy "Managers can view all rectification requests"
  on public.rectification_requests for select using (public.is_manager());

create policy "Users can create own rectification requests"
  on public.rectification_requests for insert with check (auth.uid() = user_id);

create policy "Managers can update rectification requests"
  on public.rectification_requests for update using (public.is_manager());

create policy "No deletion of rectification requests"
  on public.rectification_requests for delete using (false);
*/
