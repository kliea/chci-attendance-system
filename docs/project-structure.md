# Project structure

Source layout for developers.

```
src/
├── main.js                 # App entry, Pinia, Router
├── App.vue                 # Root, <router-view>
├── lib/
│   └── supabase.js        # Supabase client (uses .env)
├── router/
│   └── index.js           # Routes + auth guard
├── stores/
│   └── auth.js            # Session, profile, role, signIn/signOut/signUp
├── components/
│   └── layout/
│       ├── AppShell.vue   # Sidebar + main area
│       ├── Sidebar.vue    # Role-based nav
│       └── TopBar.vue     # Title, user, logout
├── views/
│   ├── auth/
│   │   ├── LoginView.vue
│   │   └── RegisterView.vue
│   ├── manager/           # Dashboard, Employees, Attendance, Import, Rectifications, Holidays
│   └── employee/          # MyAttendance, Rectify
└── assets/
    └── base.css           # Tailwind base
```

## Key files

- **`src/lib/supabase.js`** — Single Supabase client; requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **`src/router/index.js`** — All routes and the auth guard (redirect by session and role).
- **`src/stores/auth.js`** — User session, profile, role; `init()`, `signIn()`, `signUp()`, `signOut()`.

See [database.md](database.md) for the Supabase schema.
