# RBAC (Role-based access control)

Klinth uses roles stored in **`profiles.role`**. Access to routes and UI is determined by this value.

## Roles

| Role         | Description | Can access |
|--------------|-------------|------------|
| **admin**      | Full access; same as manager. Use for super-users or IT. | Dashboard, Employees, Attendance, Import, Rectifications, Holidays (manager side) |
| **manager**    | Team lead; manages attendance and team data. | Same as admin (manager side) |
| **supervisor** | Same as manager; use when you don’t have “manager” in your user roles. | Same as manager (manager side) |
| **employee**   | Regular staff. | My Attendance, Rectify only |

**To view the manager side**, set `profiles.role` to `admin`, `manager`, or `supervisor`. All three see the same sidebar and routes.

## Where roles are enforced

1. **Router** (`src/router/index.js`)  
   - Routes with `meta: { managerOnly: true }` are allowed when `role` is `admin`, `manager`, or `supervisor`.  
   - Routes with `meta: { employeeOnly: true }` are allowed only when `role` is `employee`.  
   - If a manager-side role visits an employee-only route, they are redirected to the dashboard.  
   - If an employee visits a manager-only route, they are redirected to My Attendance.

2. **Sidebar** (`src/components/layout/Sidebar.vue`)  
   - Manager nav (Dashboard, Employees, Attendance, Import, Rectifications, Holidays) is shown when `role` is `admin`, `manager`, or `supervisor`.  
   - Employee nav (My Attendance, Rectify) is shown when `role` is `employee`.

3. **Database**  
   - `profiles.role` is constrained to `'admin' | 'manager' | 'supervisor' | 'employee'`.  
   - Row-level security (RLS) on `profiles` controls who can read/update which rows.

## Allowing all roles and setting a user to see the manager side

After a user has registered, you can change their role in the database so they see the manager side (e.g. `supervisor` or `manager`).

### 1. Update the role check constraint (one-time)

Run this in the **Supabase SQL Editor** so `supervisor` (and all current roles) are allowed:

```sql
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'manager', 'supervisor', 'employee'));
```

### 2. Set a user’s role so they see the manager side

Replace `'your-registered@email.com'` with the user’s email.

```sql
-- Promote by email (updates the profile for that auth user)
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'your-registered@email.com'
);
```

To set **manager** or **supervisor** (both see the manager side):

```sql
-- manager
update public.profiles set role = 'manager'
where id = (select id from auth.users where email = 'your-registered@email.com');

-- or supervisor (same access as manager)
update public.profiles set role = 'supervisor'
where id = (select id from auth.users where email = 'your-registered@email.com');
```

### 3. Optional: find the user first

To see current role and id for a user:

```sql
select p.id, p.full_name, p.role, au.email
from public.profiles p
join auth.users au on au.id = p.id
where au.email = 'your-registered@email.com';
```

Then update by id:

```sql
update public.profiles
set role = 'admin'
where id = 'paste-uuid-here';
```

After updating, the user must log out and log in again (or refresh) so the app reloads their profile and applies the new role.
