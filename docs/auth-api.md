# Register and login API

You do **not** need a custom backend for register or login. The app uses **Supabase Auth** as the API.

## Endpoints used

| Action    | Supabase API | Used in app |
|-----------|--------------|-------------|
| **Login**   | `auth.signInWithPassword({ email, password })` | `auth.signIn()` in store, LoginView |
| **Register**| `auth.signUp({ email, password, options })`   | `auth.signUp()` in store, RegisterView |

## Flow

- **Login:** Supabase validates credentials and returns a session; the app then loads `profiles` for role and name.
- **Register:** Supabase creates the user in `auth.users`; a **database trigger** (`handle_new_user`) creates the row in `profiles` (id, full_name, role = `'employee'`). The app does not insert into `profiles` from the client (to avoid RLS issues).

Register and login are both handled by Supabase; no separate Node/Express or “auth API” is required. Use the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; they allow the browser to call Supabase Auth and your Postgres (within RLS).
