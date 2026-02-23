-- Run this ONCE in Supabase SQL Editor when attendance_logs already exists with user_id.
-- It creates staff, migrates attendance to staff_id, then drops user_id.

-- 1. Ensure staff table exists and has RLS
create table if not exists public.staff (
  id           uuid primary key default gen_random_uuid(),
  bio_id       text not null unique,
  full_name    text not null,
  created_at   timestamptz default now()
);
alter table public.staff enable row level security;
drop policy if exists "Managers can select staff" on public.staff;
drop policy if exists "Managers can insert staff" on public.staff;
drop policy if exists "Managers can update staff" on public.staff;
create policy "Managers can select staff" on public.staff for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'supervisor')));
create policy "Managers can insert staff" on public.staff for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'supervisor')));
create policy "Managers can update staff" on public.staff for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'supervisor')));

-- 2. Only migrate if attendance_logs has user_id (old schema)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'attendance_logs' and column_name = 'user_id'
  ) then
    -- Populate staff from profiles that have bio_id
    insert into public.staff (bio_id, full_name)
    select distinct p.bio_id, p.full_name
    from public.profiles p
    where p.bio_id is not null
    on conflict (bio_id) do update set full_name = excluded.full_name;

    -- Add staff_id column
    alter table public.attendance_logs add column if not exists staff_id uuid references public.staff(id) on delete cascade;

    -- Backfill staff_id from user_id via profiles.bio_id (join in WHERE, not in FROM)
    update public.attendance_logs al
    set staff_id = s.id
    from public.staff s
    inner join public.profiles p on p.bio_id = s.bio_id
    where al.user_id = p.id and al.staff_id is null;

    -- Remove rows that could not be mapped (no matching staff)
    delete from public.attendance_logs where staff_id is null;

    -- Drop old unique constraint (name may vary; try common pattern)
    alter table public.attendance_logs drop constraint if exists attendance_logs_user_id_date_key;
    alter table public.attendance_logs drop column user_id;

    -- Enforce not null and new unique
    alter table public.attendance_logs alter column staff_id set not null;
    alter table public.attendance_logs add constraint attendance_logs_staff_id_date_key unique (staff_id, date);
  end if;
end $$;

-- 3. Recreate attendance_logs RLS policies (in case they failed or reference old columns)
drop policy if exists "Users can read own attendance" on public.attendance_logs;
drop policy if exists "Managers can read all attendance" on public.attendance_logs;
drop policy if exists "Managers can insert attendance" on public.attendance_logs;
drop policy if exists "Managers can update attendance" on public.attendance_logs;

alter table public.attendance_logs enable row level security;

create policy "Users can read own attendance"
  on public.attendance_logs for select
  using (
    exists (
      select 1 from public.staff s
      inner join public.profiles p on p.bio_id = s.bio_id and p.id = auth.uid()
      where s.id = staff_id
    )
  );
create policy "Managers can read all attendance"
  on public.attendance_logs for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'supervisor')));
create policy "Managers can insert attendance"
  on public.attendance_logs for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'supervisor')));
create policy "Managers can update attendance"
  on public.attendance_logs for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'supervisor')));
