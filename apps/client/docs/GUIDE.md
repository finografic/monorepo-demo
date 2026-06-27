# Client Guide — Vite + React Router

> Quick reference for the `apps/client` SPA after the shadcn + Tailwind migration.

## Stack

| Layer   | Choice                                      |
| ------- | ------------------------------------------- |
| Bundler | Vite 8                                      |
| UI      | React 19 + shadcn via `@workspace/ui`       |
| Router  | React Router v7 with `createBrowserRouter`  |
| Data    | TanStack Query + Hono RPC via `src/lib/api` |
| Styles  | Tailwind 4 + `@workspace/ui/globals.css`    |

## Project Layout

```text
apps/client/
  index.html
  vite.config.ts
  components.json              # shadcn app config
  src/
    main.tsx                    # root providers + global CSS import
    App.tsx                     # RouterProvider
    router.tsx                  # createBrowserRouter route tree
    components/                 # shared client components
    context/                    # AuthProvider / useAuth
    layout/                     # public and admin layout shells
    pages/                      # route page components
    providers/
      QueryClientProvider/      # TanStack Query client provider
    queries/                    # TanStack Query hooks
    lib/api.ts                  # typed Hono RPC client
packages/ui/
  components.json               # shadcn package config
  src/styles/globals.css        # Tailwind 4 + shadcn theme tokens
  src/components/               # owned shadcn source components
```

## Providers

`main.tsx` owns global provider order:

1. `I18nextProvider`
2. `QueryClientProvider`
3. `AuthProvider`
4. `App`

Put future app-wide providers under `src/providers/` rather than expanding `main.tsx` with inline
setup logic.

## Adding a Route

1. Create a page component under `src/pages/`.
2. Register it in `src/router.tsx`.
3. Use `Layout` for public/authenticated routes or `AdminLayout` for admin routes.
4. Wrap protected route elements with `ProtectedRoute`.

Route guards currently remain component wrappers. Move them to React Router loaders only if that
becomes useful after the query/auth layer settles.

## Data Fetching

Use query hooks under `src/queries/*`. Do not call `fetch('/api/...')` directly from pages when a
typed Hono RPC route is available.

Current query groups:

| Query group     | Purpose                           |
| --------------- | --------------------------------- |
| `users/`        | Admin user list and role updates  |
| `translations/` | Translation CMS lists and updates |

`src/lib/api.ts` exports the typed Hono RPC client:

```ts
import { api } from 'lib/api';

const res = await api.users.$get();
```

Auth.js credential callback helpers remain in `src/lib/auth-client.ts` because Auth.js wildcard
routes are not a great fit for Hono RPC typing.

## Auth

This starter uses DB-backed Auth.js/session auth. Do not copy LLAAB's basic password auth.

The client auth boundary is:

- `src/lib/auth-client.ts` for CSRF-aware Auth.js calls.
- `src/context/AuthContext.tsx` for auth state and page-facing actions.
- `src/components/ProtectedRoute.tsx` for route protection.

## Dev

| Mode       | Client URL              | API proxy               |
| ---------- | ----------------------- | ----------------------- |
| `pnpm dev` | `http://localhost:3000` | Vite proxy → `API_PORT` |

Run both apps from the repo root with:

```sh
pnpm dev
```

## Styling

Client styling is Tailwind 4 plus owned shadcn source components.

- Import global styles once from `@workspace/ui/globals.css`.
- Import primitives from paths like `@workspace/ui/components/button`.
- Keep app-local styling as readable Tailwind class names unless a reusable primitive belongs in
  `packages/ui`.
- Keep foundational colors on shadcn tokens such as `bg-background`, `bg-card`, `text-foreground`,
  `text-muted-foreground`, `border-border`, and `ring-ring`.

## Common Pitfalls

| Symptom                 | Fix                                                                   |
| ----------------------- | --------------------------------------------------------------------- |
| QueryClient error       | Ensure the component is under `QueryClientProvider`                   |
| API client type missing | Build `@workspace/server` so `dist/index.d.mts` exists                |
| UI alias not resolving  | Check Vite/TS aliases for `@workspace/ui`, `ui`, `utils`, and `hooks` |
| Auth session missing    | Check `/api/auth/session`, cookies, and server logs                   |
