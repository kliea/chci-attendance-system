# Pulling Supabase remote schema

You can get the **current schema** from your remote Supabase project in two ways.

## Option 1: Supabase CLI – `db pull` (migration file)

Creates a migration file under `supabase/migrations/` that matches the remote schema. Best if you use or plan to use CLI migrations.

**One-time setup**

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started).
2. From the project root:
   ```bash
   supabase init
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   Get `YOUR_PROJECT_REF` from the Supabase dashboard URL:  
   `https://supabase.com/dashboard/project/<project-ref>`.

**Pull schema**

```bash
supabase db pull
```

- Writes a new file: `supabase/migrations/<timestamp>_remote_schema.sql`.
- Requires Docker (used to diff the remote schema).
- To limit to `public` only:  
  `supabase db pull --schema public`

You can copy the contents into `sql/supabase-schema.sql` or keep it as a migration.

---

## Option 2: Supabase CLI – `db dump` (single SQL file)

Dumps the remote schema (no data by default) into one file. No migration history needed.

**One-time setup**

- Same as Option 1: install CLI, then from project root:
  ```bash
  supabase init
  supabase link --project-ref YOUR_PROJECT_REF
  ```

**Dump schema to file**

```bash
supabase db dump -f sql/remote-schema.sql
```

- Optional: only `public` schema:  
  `supabase db dump -f sql/remote-schema.sql --schema public`
- With data: add `--data-only` (or combine with `-f` for schema + separate data dump).

---

## Without Supabase CLI (direct Postgres)

If you prefer not to use the CLI, use `pg_dump` with your project’s **Database connection string** (Settings → Database in Supabase):

```bash
pg_dump "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres" \
  --schema-only \
  --schema=public \
  --no-owner \
  --no-privileges \
  -f sql/remote-schema.sql
```

Replace `[ref]`, `[password]`, and `[region]` with your project values. Use the **connection string (URI)** from the dashboard (transaction pooler, port 6543, is usually best).

---

## Summary

| Method              | Command / approach              | Output                          |
|---------------------|----------------------------------|---------------------------------|
| CLI migration       | `supabase db pull`              | `supabase/migrations/*.sql`     |
| CLI dump            | `supabase db dump -f sql/remote-schema.sql` | Single SQL file        |
| pg_dump             | See command above               | Single SQL file                 |

After pulling, you can diff against `sql/supabase-schema.sql` to see how the remote project differs from the repo’s canonical schema.
