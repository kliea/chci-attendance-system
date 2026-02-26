-- Klinth — run this in Supabase SQL Editor to create tables if they don't exist.
-- Attendance is keyed by staff (no auth required); add staff via Employees → Add from list, then import .dat.
-- If you already have attendance_logs with user_id, drop that table first or run a migration to switch to staff_id.

-- TEAMS (created first so profiles can reference it)
create table if not exists public.teams (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  created_at   timestamptz default now()
);

-- PROFILES (extends auth.users)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  bio_id       text unique,
  full_name    text not null,
  email        text,
  program      text check (program is null or program in ('CS', 'IS', 'IT')),
  role         text not null check (role in ('admin', 'manager', 'supervisor', 'employee')),
  team_id      uuid references public.teams(id),
  created_at   timestamptz default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists program text;
alter table public.profiles drop constraint if exists profiles_program_check;
alter table public.profiles add constraint profiles_program_check check (program is null or program in ('CS', 'IS', 'IT'));

-- Add manager_id to teams (after profiles exists)
alter table public.teams
  add column if not exists manager_id uuid references public.profiles(id);

-- STAFF (roster: no auth required; used for attendance by Bio ID)
create table if not exists public.staff (
  id           uuid primary key default gen_random_uuid(),
  bio_id       text not null unique,
  full_name    text not null,
  created_at   timestamptz default now()
);

-- FK: profile.bio_id → staff.bio_id so profiles (logged-in employees) can access own attendance
alter table public.profiles
  drop constraint if exists profiles_bio_id_fkey;
alter table public.profiles
  add constraint profiles_bio_id_fkey foreign key (bio_id) references public.staff(bio_id);

-- ATTENDANCE LOGS (keyed by staff so attendance can exist without user accounts)
create table if not exists public.attendance_logs (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid references public.staff(id) on delete cascade not null,
  date         date not null,
  time_in      time,
  time_out     time,
  source       text default 'biometric',
  created_at   timestamptz default now(),
  unique(staff_id, date)
);

-- RECTIFICATION REQUESTS
create table if not exists public.rectification_requests (
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

-- HOLIDAYS
create table if not exists public.holidays (
  id           uuid primary key default gen_random_uuid(),
  date         date not null unique,
  name         text not null,
  type         text check (type in ('regular', 'special')),
  created_at   timestamptz default now()
);

-- RPC: return staff not yet linked to a profile (for registration dropdown). Anon can call.
create or replace function public.get_unregistered_staff()
returns table (id uuid, bio_id text, full_name text)
language sql security definer
set search_path = public
as $$
  select s.id, s.bio_id, s.full_name
  from public.staff s
  left join public.profiles p on p.bio_id = s.bio_id and p.bio_id is not null
  where p.id is null
  order by s.full_name;
$$;

grant execute on function public.get_unregistered_staff() to anon;

-- Helper: SECURITY DEFINER so RLS on profiles doesn't recurse (avoids 500 on profile fetch)
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

-- RLS: staff — managers can do all; employees can select only their own row (for own attendance_logs)
alter table public.staff enable row level security;
drop policy if exists "Managers can select staff" on public.staff;
drop policy if exists "Managers can insert staff" on public.staff;
drop policy if exists "Managers can update staff" on public.staff;
drop policy if exists "Users can select own staff row" on public.staff;
create policy "Managers can select staff"
  on public.staff for select using (public.is_manager());
create policy "Users can select own staff row"
  on public.staff for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.bio_id = staff.bio_id)
  );
create policy "Managers can insert staff"
  on public.staff for insert with check (public.is_manager());
create policy "Managers can update staff"
  on public.staff for update using (public.is_manager());
create policy "Managers can delete staff"
  on public.staff for delete using (public.is_manager());

-- RLS: attendance_logs — employee reads own (via profile.bio_id = staff.bio_id); managers read all
alter table public.attendance_logs enable row level security;
drop policy if exists "Users can read own attendance" on public.attendance_logs;
drop policy if exists "Managers can read all attendance" on public.attendance_logs;
drop policy if exists "Managers can insert attendance" on public.attendance_logs;
drop policy if exists "Managers can update attendance" on public.attendance_logs;
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
  on public.attendance_logs for select using (public.is_manager());
create policy "Managers can insert attendance"
  on public.attendance_logs for insert with check (public.is_manager());
create policy "Managers can update attendance"
  on public.attendance_logs for update using (public.is_manager());

-- RLS: allow users to read/update own profile, and to insert own profile on signup
alter table public.profiles enable row level security;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Managers can select all profiles" on public.profiles;
drop policy if exists "Managers can update profiles" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
create policy "Managers can select all profiles"
  on public.profiles for select using (public.is_manager());
create policy "Managers can update profiles"
  on public.profiles for update using (public.is_manager());

-- No insert policy: profile is created only by the trigger below (avoids RLS issues on signup)

-- Required: trigger creates profile on signup so the app never inserts (avoids RLS "new row violates" error)
-- Sets full_name, role = 'employee', bio_id, email, program from raw_user_meta_data when provided (e.g. from Employees → Register)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, bio_id, email, program)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'User'),
    'employee',
    new.raw_user_meta_data->>'bio_id',
    new.email,
    new.raw_user_meta_data->>'program'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    bio_id = coalesce(excluded.bio_id, profiles.bio_id),
    email = coalesce(excluded.email, profiles.email),
    program = coalesce(excluded.program, profiles.program);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
