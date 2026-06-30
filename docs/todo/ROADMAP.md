# @finografic/monorepo-demo — Roadmap

> **Status:** Starter phases 01–07 complete. Portfolio shell + three demos shipped on GitHub Pages.
> 📅 2026-06-30

This roadmap is the high-level sequencing plan for the monorepo-demo portfolio and its demo apps.

## How to use this file

| Tier | Meaning                         |
| ---- | ------------------------------- |
| P0   | Active now                      |
| P1   | Next, fully scoped              |
| P2   | Planned, sequencing decided     |
| P3   | Backlog, intentionally deferred |

## Completed — detailed records

**Starter extraction**

- [DONE — Phase 01 Root Bootstrap](/docs/todo/DONE_PHASE_01_ROOT_BOOTSTRAP.md)
- [DONE — Phase 02 App Shell Extraction](/docs/todo/DONE_PHASE_02_APP_SHELL_EXTRACTION.md)
- [DONE — Phase 03 Shared Platform Extraction](/docs/todo/DONE_PHASE_03_SHARED_PLATFORM_EXTRACTION.md)
- [DONE — Phase 04 Data Auth and I18n](/docs/todo/DONE_PHASE_04_DATA_AUTH_AND_I18N.md)
- [DONE — Phase 06 LLAAB Client/Server Patterns](/docs/todo/DONE_PHASE_06_LLAAB_CLIENT_SERVER_PATTERNS.md)
- [DONE — Phase 07 Shadcn Tailwind Migration](/docs/todo/DONE_PHASE_07_SHADCN_TAILWIND_MIGRATION.md)

**Portfolio demos**

- [DONE — Portfolio Demos Plan](/docs/todo/DONE_PLAN_PORTFOLIO_DEMOS.md)
- [DONE — demo-datavis](/docs/todo/DONE_DEMO_DATAVIS.md)
- [DONE — AI Pipeline TMR Fixtures](/docs/todo/DONE_5_FIXTURES.md)

**Active planning docs**

- [TODO — AI Pipeline Model Selection](/docs/todo/TODO_AI_PIPELINE_MODEL_SELECTION.md)
- [TMR Data Sources](/docs/TMR_DATA_SOURCES.md) (reference + optional expansions)
- [Next Steps](/docs/todo/NEXT_STEPS.md)

## P0 — Active

- Host `apps/server` for cross-origin auth and live demo APIs — see
  [Portfolio Deployment](/docs/process/PORTFOLIO_DEPLOYMENT.md) and [Next Steps](/docs/todo/NEXT_STEPS.md)
- Harden AI pipeline live mode — model catalog, smoke tests, session caps —
  [TODO — AI Pipeline Model Selection](/docs/todo/TODO_AI_PIPELINE_MODEL_SELECTION.md)

## P1 — Next up

- End-to-end validation from clean clone (`pnpm dev:all`, auth flow, all three demos)
- Set GitHub Pages repo variables (`DEMO_API_BASE_URL`, CORS/cookie config on server)

## P2 — Planned

- Expand server test coverage and add a CI `test` job
- Optional map-heavy datavis views (crash locations, incident layers) from TMR source list

## P3 — Backlog

- Release/versioning automation beyond demo Pages deploy
- OAuth provider demo on Auth.js
- Email verification extension
- Ollama local LLM provider

## Non-starters

- Do not copy the source monorepo wholesale and trim later.
- All internal packages use the `@workspace/*` scope — intentional, not a leftover.
- Do not commit LLM API keys or expose them via `VITE_` env names.
- Portfolio fixtures remain mock-first; live API calls are opt-in.

## Checkpoints

- Prefer small batches with cleanup before the next feature.
- Graduate `TODO_` → `DONE_` when all tracked work in that doc is complete.
- Keep [Next Steps](/docs/todo/NEXT_STEPS.md) focused on open work only.

## Done

| Date       | Item                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 2026-05-27 | Initial repo scaffolding and roadmap                                         |
| 2026-05-27 | Phase 01 — workspace bootstrap                                               |
| 2026-05-27 | Phase 02 — client and server app shells                                      |
| 2026-05-27 | Phase 03 — `@workspace/config` extracted; core skipped                       |
| 2026-05-27 | Phase 04 — Auth.js, Drizzle, i18next, admin CMS, client UI                   |
| 2026-05-27 | Phase 05 — pino logging, OpenAPI/Scalar, error envelope, rate limiting       |
| 2026-06-28 | Phase 06 — Vite 8, Hono RPC, TanStack Query, route-tree migration            |
| 2026-06-28 | Phase 07 — shadcn/Tailwind 4 UI package migration                            |
| 2026-06-29 | Portfolio shell — `DemoLayout`, shared assets, landing links all three demos |
| 2026-06-29 | GitHub Pages workflow — client + three demo apps                             |
| 2026-06-30 | `demo-datavis` — seven charts, keyboard a11y, live CKAN views                |
| 2026-06-30 | `demo-xscan` — terminal scan console with `DemoLayout`                       |
| 2026-06-30 | AI pipeline — five TMR fixtures and prompt manifest                          |
| 2026-06-30 | Cross-origin auth seams — CORS allowlist, credentialed stream, `requireAuth` |
