-- Fix: "relation public.users does not exist" on Rectifications page
-- Cause: database-migrations/add_rectification_fields.sql created RLS policies and
--        reviewed_by FK referencing public.users. This project uses public.profiles.
-- Run this in Supabase SQL Editor after the main schema.

-- 1. Fix reviewed_by to reference profiles (if it was set to users)
alter table public.rectification_requests
  drop constraint if exists rectification_requests_reviewed_by_fkey;
alter table public.rectification_requests
  add constraint rectification_requests_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id);

-- 2. Ensure is_manager() exists (uses profiles, not users)
create or replace function public.is_manager()
returns boolean
language sql security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'manager', 'supervisor')
  );
$$;

-- 3. Drop old RLS policies that reference users/userrole
drop policy if exists "Users can view own rectification requests" on public.rectification_requests;
drop policy if exists "Managers can view all rectification requests" on public.rectification_requests;
drop policy if exists "Users can create own rectification requests" on public.rectification_requests;
drop policy if exists "Managers can update rectification requests" on public.rectification_requests;
drop policy if exists "No deletion of rectification requests" on public.rectification_requests;

-- 4. Enable RLS and create policies using profiles only
alter table public.rectification_requests enable row level security;

create policy "Users can view own rectification requests"
  on public.rectification_requests for select
  using (auth.uid() = user_id);

create policy "Managers can view all rectification requests"
  on public.rectification_requests for select
  using (public.is_manager());

create policy "Users can create own rectification requests"
  on public.rectification_requests for insert
  with check (auth.uid() = user_id);

create policy "Managers can update rectification requests"
  on public.rectification_requests for update
  using (public.is_manager());

create policy "No deletion of rectification requests"
  on public.rectification_requests for delete
  using (false);
