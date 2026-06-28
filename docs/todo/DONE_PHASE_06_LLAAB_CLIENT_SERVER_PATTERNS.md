# DONE — Phase 06 LLAAB Client/Server Patterns

> **Completed:** 2026-06-28 — Vite 8, Hono RPC, TanStack Query, and route-tree migration shipped.

## Goal

Align the starter's client/server architecture with the newer LLAAB patterns while keeping this repo
starter-grade and removing LLAAB-only domains such as vault, ingestion, runs, and agent execution.

The target shape is:

| Layer   | Choice                                     |
| ------- | ------------------------------------------ |
| Bundler | Vite 8                                     |
| UI      | React 19 + design-system now; shadcn last  |
| Router  | React Router v7 with `createBrowserRouter` |
| Data    | TanStack Query + Hono RPC via `lib/api.ts` |
| Styles  | Panda CSS now; Tailwind 4 last             |

## Source References

Use these files as the source-of-truth patterns, adapting only the domain names and response shapes:

- `/Users/justin/LLAAB/apps/client/src/lib/api.ts`
- `/Users/justin/LLAAB/apps/client/src/queries`
- `/Users/justin/LLAAB/apps/server/src/routes/index.route.ts`
- `/Users/justin/LLAAB/apps/server/src/routes/AGENTS.md`

## Guardrails

- Do not copy vault, runs, crons, ingest, LLM, or agent routes into this starter.
- Do not copy LLAAB's basic password auth. Preserve this starter's DB-backed Auth.js/session auth.
- Only borrow LLAAB's route organization and Hono RPC typing pattern around the existing auth
  implementation.
- Keep Tailwind 4, shadcn, and `packages/ui` for the final styling phase.
- Keep `@finografic/design-system` and Panda CSS working until the styling migration begins.
- Prefer route/index files that only wire route definitions; implementation lives in named route files.
- Keep `index.ts` files as barrels or router wiring only, not implementation-heavy modules.
- Validate each phase with the narrow command that proves it works, then commit.

## Phase 06A — Vite 8 Upgrade ✅ DONE

### Tasks

- [x] Update `apps/client` from `vite@^7.1.10` to `vite@^8.1.0`.
- [x] Update `@vitejs/plugin-react` from `^5.1.0` to `^6.0.3`.
- [x] Refresh `pnpm-lock.yaml`.
- [x] Run the client build once to catch Vite/plugin config drift.
- [x] Update root package description if it still says Vite 7.

### Validation

- [x] `pnpm --filter @workspace/client build`

## Phase 06B — Server Route Tree for Hono RPC ✅ DONE

### Target Structure

```text
apps/server/src/routes/
  AGENTS.md
  index.route.ts
  auth/
    auth.routes.ts
    index.ts
  health/
    health.routes.ts
    index.ts
  i18n/
    i18n.routes.ts
    index.ts
  translations/
    translations.routes.ts
    index.ts
  users/
    users.routes.ts
    index.ts
```

### Tasks

- [x] Add `apps/server/src/routes/AGENTS.md`, adapted from LLAAB for only this starter's route groups.
- [x] Add `routes/index.route.ts` for `GET /`, returning starter server metadata.
- [x] Convert current `*.route.ts` files into LLAAB-style group folders:
      route constants in `*.routes.ts`, validation schemas in `*.schema.ts`, router wiring in `index.ts`.
- [x] Keep the current DB-backed Auth.js implementation in the `auth` group:
      sign-up, clear-all-cookies, credentials sign-in, session, CSRF, sign-out, and callback routes.
- [x] Keep route group prefixes mounted in `app.ts`, for example `.route('/api/users', usersRouter)`.
- [x] Remove the current pattern where each router internally includes `/users`, `/auth`, etc.
- [x] Keep `describeRoute` OpenAPI metadata where useful, but do not let OpenAPI shape block RPC typing.
- [x] Export `app` and `type AppType = typeof app` from `apps/server/src/app.ts`.
- [x] Keep default export compatibility for `src/index.ts` if needed by the server entrypoint.

### Route Groups to Keep

| Prefix              | Router               | Purpose                      |
| ------------------- | -------------------- | ---------------------------- |
| `/`                 | `indexRouter`        | Server metadata / status     |
| `/api/health`       | `healthRouter`       | Health check                 |
| `/api/auth`         | `authRouter`         | Auth.js plus starter sign-up |
| `/api/i18n`         | `i18nRouter`         | i18next resources            |
| `/api/users`        | `usersRouter`        | Admin user CMS demo          |
| `/api/translations` | `translationsRouter` | Admin translation CMS demo   |

### Validation

- [x] `pnpm --filter @workspace/server typecheck`
- [x] `pnpm --filter @workspace/server build`

## Phase 06C — Client Hono RPC API Client ✅ DONE

### Tasks

- [x] Add `apps/client/src/lib/api.ts`, adapted from LLAAB.
- [x] Import `type { AppType }` from the server app source or package export.
- [x] Configure `hc<AppType>(baseUrl)` with `credentials: 'include'`.
- [x] Keep `/api/*` same-origin so the Vite proxy continues to work.
- [x] Replace direct `fetch('/api/...')` calls with `api.<group>...` calls where RPC typing is available.
- [x] Keep Auth.js credential callback helpers in `auth-client.ts` if Hono RPC cannot represent the Auth.js wildcard routes cleanly.
- [x] Do not replace Auth.js session fetching with LLAAB's basic `/auth/session` response shape.

### Validation

- [x] `pnpm --filter @workspace/client typecheck`

## Phase 06D — TanStack Query Structure ✅ DONE

### Target Structure

```text
apps/client/src/queries/
  users/
    index.ts
    useUsers.ts
    useUpdateUser.ts
  translations/
    index.ts
    useTranslationDomains.ts
    useUpdateTranslation.ts
apps/client/src/providers/
  QueryClientProvider/
    QueryClientProvider.tsx
    queryClient.ts
```

### Tasks

- [x] Add `@tanstack/react-query`.
- [x] Copy/adapt `/Users/justin/LLAAB/apps/client/src/providers/QueryClientProvider`.
- [x] Use `apps/client/src/providers/` for provider wrappers because more providers are expected later.
- [x] Mount `QueryClientProvider` in `main.tsx` around the router/auth stack, matching the LLAAB provider placement.
- [x] Create query-folder `index.ts` files with local `QUERY_KEYS`.
- [x] Move `AdminUsersPage` data loading and role updates into `queries/users`.
- [x] Move `AdminTranslationsPage` data loading and updates into `queries/translations`.
- [x] Consider a session query for `AuthContext`, but keep the existing Auth.js-backed context API stable for pages.
- [x] Use mutation invalidation instead of manually patching page state where the query cache is authoritative.

### Validation

- [x] `pnpm --filter @workspace/client typecheck`
- [x] `pnpm --filter @workspace/client build`

## Phase 06E — React Router Data Router ✅ DONE

### Tasks

- [x] Add `apps/client/src/router.tsx`.
- [x] Replace `<BrowserRouter><App /></BrowserRouter>` with `RouterProvider`.
- [x] Convert `App.tsx` route declarations into `createBrowserRouter` route objects.
- [x] Preserve existing layouts, protected routes, admin routes, and language switching behavior.
- [x] Decide whether route guards remain wrapper components or become route loaders after the query layer settles.

### Validation

- [x] `pnpm --filter @workspace/client typecheck`
- [x] `pnpm --filter @workspace/client build`

## Phase 06F — Cleanup and Docs ✅ DONE

### Tasks

- [x] Remove dead fetch helpers after query hooks own data access.
- [x] Update `apps/client/docs/GUIDE.md` to reflect this starter's actual choices.
- [x] Update this TODO as phases complete.
- [x] Update `docs/todo/ROADMAP.md` Done table.
- [x] Run `graphify update .` after code changes.

### Validation

- [x] `pnpm typecheck`
- [x] `pnpm build`

## Phase 06G — Valibot RPC Request Inference ✅ DONE

### Why

Hono RPC now derives route paths and response shapes from `AppType`, but request body inference is
still limited where routes manually call `c.req.json()`. Use Valibot validation middleware on route
inputs so the server remains the single source of truth for both request and response types.

### Tasks

- [x] Add or reuse Valibot middleware for Hono route validation.
- [x] Validate `POST /api/auth/sign-up` with a route-local Valibot schema.
- [x] Validate `PATCH /api/users/:id` with a route-local Valibot schema for editable user fields.
- [x] Validate `PATCH /api/translations/:domain/:id` with the domain-specific translation patch
      schemas.
- [x] Remove client-side Hono RPC request casts once request bodies infer correctly.
- [x] Keep Auth.js wildcard routes as explicit exceptions where Hono RPC typing is not useful.

### Validation

- [x] `pnpm --filter @workspace/server typecheck`
- [x] `pnpm --filter @workspace/client typecheck`
- [x] `pnpm build`

## Deferred

- Tailwind 4 token migration.
- shadcn and `packages/ui`.
- LLAAB AI/provider pages and routes.
- LLAAB basic password auth.
- Vault, runs, ingestion, crons, and agent execution.

## Deferred Shadcn Migration Notes

When it is time to move from `@finografic/design-system` + Panda CSS to shadcn + Tailwind:

- Copy `packages/ui` from `/Users/justin/LLAAB` directly as the primary UI package source.
- Copy the relevant shadcn/Tailwind/client setup from LLAAB, but cross-check against the fresh
  generated reference repo at `/Users/justin/repos-finografic/vite-monorepo`.
- Use the shadcn preset `b7BE9nf27X` for the light-mode theme.
- Use this repo's generated theme CSS at `.agents/assets/globals.css` as the theme source.
- Consider copying selected files from `/Users/justin/LLAAB/apps/client/src/layouts`, especially
  the main app layout.
- Keep LLAAB as the architectural reference and `vite-monorepo` as the clean generated reference.
- Do this after Vite 8, Hono RPC, TanStack Query, server route folders, and React Router data
  routing are stable.
