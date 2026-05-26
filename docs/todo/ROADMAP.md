# @finografic/monorepo-starter — Roadmap
> **Status:** Initial extraction plan defined. Phase 1 ready to start.
📅 2026-05-27

This roadmap is the high-level sequencing plan for turning this repo into a selective-extraction
starter based on `/Users/justin/repos-finografic/touch-monorepo`.

## How to use this file

| Tier | Meaning                                 |
| ---- | --------------------------------------- |
| P0   | Active now                              |
| P1   | Next, fully scoped                      |
| P2   | Planned, sequencing decided             |
| P3   | Backlog, intentionally deferred         |

Detailed execution lives in:

- [TODO — Phase 01 Root Bootstrap](/docs/todo/TODO_PHASE_01_ROOT_BOOTSTRAP.md)
- [TODO — Phase 02 App Shell Extraction](/docs/todo/TODO_PHASE_02_APP_SHELL_EXTRACTION.md)
- [TODO — Phase 03 Shared Platform Extraction](/docs/todo/TODO_PHASE_03_SHARED_PLATFORM_EXTRACTION.md)
- [TODO — Phase 04 Data Auth and I18n](/docs/todo/TODO_PHASE_04_DATA_AUTH_AND_I18N.md)

## P0 — Active

- Root monorepo bootstrap and planning docs. Detail: [TODO — Phase 01 Root Bootstrap](/docs/todo/TODO_PHASE_01_ROOT_BOOTSTRAP.md)

## P1 — Next Up

- Extract minimal `apps/client` and `apps/server` shells from the source repo without business features. Detail: [TODO — Phase 02 App Shell Extraction](/docs/todo/TODO_PHASE_02_APP_SHELL_EXTRACTION.md)

## P2 — Planned

- Reintroduce shared packages only where they remain generic after cleanup. Detail: [TODO — Phase 03 Shared Platform Extraction](/docs/todo/TODO_PHASE_03_SHARED_PLATFORM_EXTRACTION.md)
- Add optional platform layers for Drizzle, Auth.js, and i18next as starter-grade skeletons, not full product implementations. Detail: [TODO — Phase 04 Data Auth and I18n](/docs/todo/TODO_PHASE_04_DATA_AUTH_AND_I18N.md)

## P3 — Backlog

- Add example tests and CI once the package graph stabilises.
- Decide whether the starter should ship release/versioning automation or remain app-only.
- Add a starter-focused example content/data set after the dashboard shell exists.

## Non-starters

- Do not copy the source monorepo wholesale and trim later.
- Do not preserve `@workspace/*` package naming or imports in this repo.
- Do not migrate deployment scripts, release flows, or production-only operational tooling yet.
- Do not pull over source business routes, seed data, or domain-specific admin features in early phases.

## Checkpoints

- Prefer small extraction batches with cleanup before the next copy step.
- Use commit checkpoints between phases once the workspace installs and validates cleanly.
- When copied code reveals hidden coupling, trim dependencies before extracting more surface area.

## Done

| Date       | Item                                                                 |
| ---------- | -------------------------------------------------------------------- |
| 2026-05-27 | Initial repo scaffolding files added                                 |
| 2026-05-27 | Root roadmap created                                                 |
| 2026-05-27 | Root monorepo config baseline and phased extraction plan established |
