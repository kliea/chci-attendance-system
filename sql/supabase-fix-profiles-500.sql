-- Fix: profiles 500 Internal Server Error
-- Cause: RLS "Managers can select all profiles" recursed into profiles, causing stack overflow.
-- Solution: Add SECURITY DEFINER helper is_manager() so policies don't read profiles under RLS.

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

-- Recreate policies that previously caused recursion
drop policy if exists "Managers can select all profiles" on public.profiles;
drop policy if exists "Managers can update profiles" on public.profiles;
create policy "Managers can select all profiles"
  on public.profiles for select using (public.is_manager());
create policy "Managers can update profiles"
  on public.profiles for update using (public.is_manager());

-- Optional: simplify staff/attendance policies for consistency (no recursion, but cleaner)
drop policy if exists "Managers can select staff" on public.staff;
drop policy if exists "Managers can insert staff" on public.staff;
drop policy if exists "Managers can update staff" on public.staff;
create policy "Managers can select staff" on public.staff for select using (public.is_manager());
create policy "Managers can insert staff" on public.staff for insert with check (public.is_manager());
create policy "Managers can update staff" on public.staff for update using (public.is_manager());

drop policy if exists "Managers can read all attendance" on public.attendance_logs;
drop policy if exists "Managers can insert attendance" on public.attendance_logs;
drop policy if exists "Managers can update attendance" on public.attendance_logs;
create policy "Managers can read all attendance" on public.attendance_logs for select using (public.is_manager());
create policy "Managers can insert attendance" on public.attendance_logs for insert with check (public.is_manager());
create policy "Managers can update attendance" on public.attendance_logs for update using (public.is_manager());
