# TODO — Phase 02 App Shell Extraction
> **Status:** Not started. Sequencing agreed on 2026-05-27.
📅 2026-05-27

## Goal

Extract the smallest useful `client` and `server` shells from the source monorepo while avoiding
product-specific features.

## Scope

- [ ] Create `apps/client` as a Vite + React + TypeScript app shell.
- [ ] Create `apps/server` as a Hono + TypeScript app shell.
- [ ] Keep the first client scope to a landing page and admin/dashboard demo only.
- [ ] Keep the first server scope to health and demo routes only.
- [ ] Remove source features during extraction, not after a full copy.
- [ ] Validate the first end-to-end dev flow through Turbo.

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

- [ ] `pnpm install`
- [ ] `pnpm build`
- [ ] `pnpm dev`
