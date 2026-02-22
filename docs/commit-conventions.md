# Commit conventions

Use **Conventional Commits** so history is consistent and changelogs/tooling can parse messages.

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

- **type** — What kind of change (required).
- **scope** — Area of the codebase (optional).
- **description** — Short, imperative summary (required). No period at the end.

## Types

| Type       | Use for |
|------------|--------|
| `feat`     | New feature or user-facing capability |
| `fix`      | Bug fix |
| `docs`     | Documentation only (README, docs/, comments) |
| `style`    | Formatting, whitespace, no code logic change |
| `refactor` | Code change that is not a fix nor a feature (e.g. rename, restructure) |
| `perf`     | Performance improvement |
| `test`     | Adding or updating tests |
| `chore`    | Build, tooling, deps, config (e.g. package.json, vite config) |

## Scopes (optional)

Use when it helps; keep them short and lowercase.

Examples: `auth`, `router`, `attendance`, `ui`, `db`, `import`, `rbac`, `docs`.

## Examples

```
feat(auth): add register page and signUp in store
fix(router): allow admin and supervisor on manager routes
docs: add commit conventions and RBAC doc
style: trim trailing whitespace in views
refactor(attendance): use maybeSingle instead of single for profile fetch
chore: add dotenv for seed script
```

## Rules

- Use **imperative** in the description: “add”, “fix”, “update” — not “added”, “fixes”, “updated”.
- Keep the **first line** to **72 characters** or fewer when possible.
- You can add a **body** after a blank line for more detail; wrap at 72 characters.
- **Breaking changes**: put `BREAKING CHANGE:` in the footer or use `feat!:` / `fix!:` and describe in the body or footer.

## Breaking change example

```
feat(auth)!: require role in profiles for all authenticated routes

BREAKING CHANGE: Users without a profile.role will be redirected to login.
```
