# Setup

Get the project running locally.

## Prerequisites

- **Node.js** 18+
- **Supabase project** with the Klinth schema applied (`profiles`, `teams`, `attendance_logs`, `rectification_requests`, `holidays`)

## Steps

### 1. Clone and install

```bash
cd chci-attendance-system
npm install
```

### 2. Environment

Copy the example env and set your Supabase keys:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get both from Supabase: **Project Settings → API** (Project URL and **anon public** key). The anon key is a long JWT starting with `eyJ...`.

### 3. Database

The app expects the `public` schema tables to exist in Supabase. If you see *"Could not find the table 'public.profiles' in the schema cache"*:

- Open your Supabase project → **SQL Editor**.
- Run the script **`sql/supabase-schema.sql`** in the Supabase SQL Editor (creates `profiles`, `teams`, `attendance_logs`, `rectification_requests`, `holidays`, RLS policies, and the trigger that creates a profile on sign-up).
- If the error persists, refresh the schema cache or restart the project.

Each Supabase Auth user should have a matching row in `profiles` with the correct `role` (`manager` or `employee`). See [database.md](database.md) for the schema.
