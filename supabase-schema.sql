-- Klinth — run this in Supabase SQL Editor to create tables if they don't exist.
-- After running: Supabase may need a moment to refresh; if the app still says
-- "table not in schema cache", try Dashboard → Project Settings → API → "Reload schema cache" (or restart project).
-- Handles circular ref: teams first (no manager_id), then profiles, then add manager_id.

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
  role         text not null check (role in ('admin', 'manager', 'supervisor', 'employee')),
  team_id      uuid references public.teams(id),
  created_at   timestamptz default now()
);

-- Add manager_id to teams (after profiles exists)
alter table public.teams
  add column if not exists manager_id uuid references public.profiles(id);
-- Re-create FK if you prefer it as constraint; "if not exists" on column only

-- ATTENDANCE LOGS
create table if not exists public.attendance_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) not null,
  date         date not null,
  time_in      time,
  time_out     time,
  status       text check (status in ('present', 'late', 'absent', 'holiday')),
  source       text default 'biometric',
  created_at   timestamptz default now(),
  unique(user_id, date)
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

-- RLS: allow users to read/update own profile, and to insert own profile on signup
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- No insert policy: profile is created only by the trigger below (avoids RLS issues on signup)

-- Required: trigger creates profile on signup so the app never inserts (avoids RLS "new row violates" error)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'User'),
    'employee'
  )
  on conflict (id) do update set full_name = coalesce(excluded.full_name, profiles.full_name);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
