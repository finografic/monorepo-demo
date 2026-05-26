# TODO — Phase 02 App Shell Extraction

> **Status:** Complete. App shells extracted on 2026-05-27.
> 📅 2026-05-27

## Goal

Extract the smallest useful `client` and `server` shells from the source monorepo while avoiding
product-specific features.

## Scope

- [x] Create `apps/client` as a Vite + React + TypeScript app shell.
- [x] Create `apps/server` as a Hono + TypeScript app shell.
- [x] Keep the first client scope to a landing page and admin/dashboard demo only.
- [x] Keep the first server scope to health and demo routes only.
- [x] Remove source features during extraction, not after a full copy.
- [x] Validate the first end-to-end dev flow through Turbo.

## Extraction Rules

- Copy the smallest coherent units from `/Users/justin/repos-finografic/touch-monorepo`.
- Prefer recreating tiny glue files over copying large source trees with hidden coupling.
- Strip product routes, queries, feature providers, and domain models immediately.
- Replace local source assumptions with starter-safe defaults as soon as code lands here.

## Expected Output

- `apps/client` renders a starter landing page.
- `apps/client` also includes a simple admin/dashboard demo route.
- `apps/server` runs independently and exposes starter-safe demo endpoints.

## Validation

- [x] `pnpm install`
- [x] `pnpm build`
- [x] `pnpm dev`

## Done

- [x] Server shell: Hono + @hono/node-server + tsdown, health and demo routes.
- [x] Client shell: Vite + React + react-router-dom, landing page and dashboard with server health fetch.
- [x] Proxy configured: client dev server proxies `/api` to server on port 4000.
- [x] All three packages typecheck, both apps build, server starts cleanly.
