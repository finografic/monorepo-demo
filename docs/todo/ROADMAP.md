# @finografic/monorepo-starter — Roadmap

> **Status:** Phase 04 complete. Auth, i18n, admin CMS, full client UI, and DS integration all done.
> 📅 2026-05-27

This roadmap is the high-level sequencing plan for turning this repo into a selective-extraction
starter based on `/Users/justin/repos-finografic/touch-monorepo`.

## How to use this file

| Tier | Meaning                         |
| ---- | ------------------------------- |
| P0   | Active now                      |
| P1   | Next, fully scoped              |
| P2   | Planned, sequencing decided     |
| P3   | Backlog, intentionally deferred |

Detailed execution lives in:

- [TODO — Phase 01 Root Bootstrap](/docs/todo/TODO_PHASE_01_ROOT_BOOTSTRAP.md)
- [TODO — Phase 02 App Shell Extraction](/docs/todo/TODO_PHASE_02_APP_SHELL_EXTRACTION.md)
- [TODO — Phase 03 Shared Platform Extraction](/docs/todo/TODO_PHASE_03_SHARED_PLATFORM_EXTRACTION.md)
- [TODO — Phase 04 Data Auth and I18n](/docs/todo/TODO_PHASE_04_DATA_AUTH_AND_I18N.md)
- [TODO — Phase 06 LLAAB Client/Server Patterns](/docs/todo/TODO_PHASE_06_LLAAB_CLIENT_SERVER_PATTERNS.md)
- [TODO — Phase 07 Shadcn Tailwind Migration](/docs/todo/TODO_PHASE_07_SHADCN_TAILWIND_MIGRATION.md)

## P0 — Active

- ~~Migrate the client UI layer from `@finografic/design-system` + Panda CSS to shadcn + Tailwind 4
  using the proven LLAAB package/layout patterns.~~ **Complete.** Detail: [TODO — Phase 07 Shadcn Tailwind Migration](/docs/todo/TODO_PHASE_07_SHADCN_TAILWIND_MIGRATION.md)
- ~~Adopt the newer LLAAB client/server architecture patterns: Vite 8, Hono RPC, TanStack Query,
  route-folder server structure, and React Router data-router setup.~~ **Complete.** Detail: [TODO — Phase 06 LLAAB Client/Server Patterns](/docs/todo/TODO_PHASE_06_LLAAB_CLIENT_SERVER_PATTERNS.md)
- ~~Root monorepo bootstrap and planning docs.~~ **Complete.** Detail: [TODO — Phase 01 Root Bootstrap](/docs/todo/TODO_PHASE_01_ROOT_BOOTSTRAP.md)

## P1 — Next Up

- ~~Extract minimal `apps/client` and `apps/server` shells from the source repo without business features.~~ **Complete.** Detail: [TODO — Phase 02 App Shell Extraction](/docs/todo/TODO_PHASE_02_APP_SHELL_EXTRACTION.md)

## P2 — Planned

- ~~Reintroduce shared packages only where they remain generic after cleanup.~~ **Complete.** Detail: [TODO — Phase 03 Shared Platform Extraction](/docs/todo/TODO_PHASE_03_SHARED_PLATFORM_EXTRACTION.md)
- ~~Add optional platform layers for Drizzle, Auth.js, and i18next as starter-grade skeletons, not full product implementations.~~ **Complete.** Detail: [TODO — Phase 04 Data Auth and I18n](/docs/todo/TODO_PHASE_04_DATA_AUTH_AND_I18N.md)

## P3 — Backlog

- Add example tests and CI once the package graph stabilises.
- Decide whether the starter should ship release/versioning automation or remain app-only.
- Add a starter-focused example content/data set after the dashboard shell exists.

## Non-starters

- Do not copy the source monorepo wholesale and trim later.
- All internal packages use the `@workspace/*` scope — this is intentional, not a leftover from the source.
- Do not migrate deployment scripts, release flows, or production-only operational tooling yet.
- Do not pull over source business routes, seed data, or domain-specific admin features in early phases.

## Checkpoints

- Prefer small extraction batches with cleanup before the next copy step.
- Use commit checkpoints between phases once the workspace installs and validates cleanly.
- When copied code reveals hidden coupling, trim dependencies before extracting more surface area.

## Done

| Date       | Item                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 2026-05-27 | Initial repo scaffolding files added                                         |
| 2026-05-27 | Root roadmap created                                                         |
| 2026-05-27 | Root monorepo config baseline and phased extraction plan established         |
| 2026-05-27 | Phase 01 complete — workspace packages created, install/typecheck pass       |
| 2026-05-27 | Phase 02 complete — client and server app shells extracted and building      |
| 2026-05-27 | Phase 03 complete — config extracted, core/shared skipped after evaluation   |
| 2026-05-27 | Phase 04A complete — auth routes, server env, JWT strategy, cookie config    |
| 2026-05-27 | Phase 04B complete — i18n schemas, seed data, GET /api/i18n routes           |
| 2026-05-27 | Phase 04C complete — i18next HTTP backend, language detection, switcher      |
| 2026-05-27 | Phase 04D complete — auth guards, admin CRUD routes, full client UI          |
| 2026-05-27 | Phase 04E complete — DS/Panda config verified; build + typecheck all green   |
| 2026-05-27 | Phase 05 complete — pino logging, OpenAPI/Scalar, error envelope, rate limit |
| 2026-06-28 | Phase 06 complete — Vite 8, Hono RPC, TanStack Query, route-tree migration   |
| 2026-06-28 | Phase 07 complete — shadcn/Tailwind UI package migration                     |
