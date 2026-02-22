# How to use the app

End-user guide for login, register, and role-based flows.

## Logging in

1. Open the app (e.g. http://localhost:5173).
2. If not signed in, you are sent to **Login** (`/login`).
3. Enter **email** and **password** of a user that exists in Supabase Auth and has a `profiles` row.
4. After sign-in you are redirected by role:
   - **Manager** → **Dashboard** (`/dashboard`)
   - **Employee** → **My Attendance** (`/my-attendance`)

From the login page you can follow **Create one** to go to the register page.

## Registering

1. Go to **Register** (`/register`) or use the **Create one** link on the login page.
2. Enter **full name**, **email**, and **password** (at least 6 characters).
3. Submit **Create account**. The app creates the user in Supabase Auth; a database trigger creates a `profiles` row with role **employee**.
4. You are then signed in and redirected to **My Attendance**.

New accounts are always created as **employee**. Managers must be set in Supabase (e.g. update `profiles.role` to `'manager'`) or created via your own process.

## Manager

Managers see the sidebar: **Dashboard**, **Employees**, **Attendance**, **Import**, **Rectifications**, **Holidays**.

- **Dashboard** — Today’s attendance overview (realtime when wired).
- **Employees** — Full employee list and search.
- **Attendance** — Filterable attendance log table.
- **Import** — Upload ZKTeco `user.dat` / `att.dat` files to sync users and punches to Supabase.
- **Rectifications** — Review and approve or reject employee rectification requests.
- **Holidays** — Manage holiday calendar.

**Log out:** use **Log out** in the top-right.

## Employee

Employees see: **My Attendance**, **Rectify**.

- **My Attendance** — View your own attendance log.
- **Rectify** — Submit a rectification request for a date (e.g. forgot to punch, wrong time).

**Log out:** use **Log out** in the top-right.

## Route guard behaviour

- No session → redirect to `/login` (optional `?redirect=` is used after login).
- Logged-in **manager** opening an employee-only route → redirect to `/dashboard`.
- Logged-in **employee** opening a manager-only route → redirect to `/my-attendance`.
