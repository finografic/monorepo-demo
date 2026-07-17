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
- [DONE — AWS Lambda + API Gateway Demo](/docs/todo/DONE_AWS_LAMBDA_DEMO.md)

**Active planning docs**

- [TODO — I18n JSON source of truth](/docs/todo/TODO_I18N.md)
- [TODO — AI Pipeline Model Selection](/docs/todo/TODO_AI_PIPELINE_MODEL_SELECTION.md)
- [TODO — AWS Terraform CloudFront RDS Migration](/docs/todo/TODO_AWS_TERRAFORM_CLOUDFRONT_RDS.md)
- [TMR Data Sources](/docs/TMR_DATA_SOURCES.md) (reference + optional expansions)
- [Next Steps](/docs/todo/NEXT_STEPS.md)

## Next

> **Context:** Starter phases 01–07 and the portfolio demo plan are complete. GitHub Pages publishes
> the landing page plus `demo-ai-pipeline`, `demo-datavis`, and `demo-xscan`. Fixture mode, mock
> datavis charts, shared `DemoLayout`, and TMR-specific AI fixtures are shipped.
>
> 📅 2026-06-30

Completed work is recorded in `DONE_*.md` files — see [ROADMAP.md](/docs/todo/ROADMAP.md) for links.
Do not re-open finished phases here.

---

## 1 — Operate the AWS-hosted Node API for live demo features

CloudFront/S3 serves the frontend and the EC2-hosted `apps/server` handles live auth, LLM streaming, and API features.

- [x] Deploy `apps/server` on EC2 behind CloudFront `/api/*`.
- [x] Configure `CORS_ORIGINS`, `AUTH_COOKIE_SAME_SITE=none`, `AUTH_COOKIE_SECURE=true`.
- [x] Smoke test sign-in, i18n, fixture streaming, and live LLM streaming through CloudFront.
- [ ] Finish AWS cleanup/docs in [TODO — AWS Terraform CloudFront RDS Migration](/docs/todo/TODO_AWS_TERRAFORM_CLOUDFRONT_RDS.md).

---

## 2 — AI pipeline live-mode hardening

Detail: [TODO — AI Pipeline Model Selection](/docs/todo/TODO_AI_PIPELINE_MODEL_SELECTION.md)

- [ ] Record the OpenCode Go `/models` catalog (allow/block lists, pricing, reasoning flags)
- [ ] Confirm `frank/` prefix behaviour for request vs response model names
- [ ] Smoke test all five TMR prompts against `qwen3.7-plus` in live mode
- [ ] Validate `glm-5.2` reasoning output end-to-end (long TTFT acceptable; blank output is not)
- [ ] Add per-session live call cap and optional response cache
- [ ] Set fixture mode as the default on first load; live mode remains opt-in

---

## 3 — Starter polish and validation

- [ ] Full `pnpm install && pnpm build && pnpm dev:all` validation from a clean clone
- [ ] End-to-end flow: landing → login → admin users → translations editor
- [ ] Confirm auth cookies and i18n language persistence across refresh

---

## 4 — Testing and CI (optional expansion)

CI already runs lint, typecheck, and format ([`.github/workflows/ci.yml`](/.github/workflows/ci.yml)).
Demo apps have Vitest/Playwright coverage locally; server/starter routes do not yet.

- [ ] Vitest unit tests for `password.utils.ts`
- [ ] Vitest integration tests for auth and i18n routes
- [ ] Add a `test` job to `ci.yml` once server coverage exists

---

## 5 — Backlog (not blocking publish)

- [ ] Map-heavy `demo-datavis` views (crash locations, QLDTraffic-style incidents) — see
      [TMR Data Sources](/docs/TMR_DATA_SOURCES.md)
- [ ] OAuth provider (GitHub/Google) as an Auth.js demo extension
- [ ] Email verification flow
- [ ] Ollama local LLM provider for offline live mode

---

## Key principles

1. **Fixture-first demos** — public Pages traffic should default to zero API cost.
2. **Server secrets stay server-side** — no `VITE_` keys for LLM providers.
3. **TMR alignment over generic examples** — portfolio copy and fixtures stay transport-domain specific.
4. **Link to DONE docs, don't duplicate** — update `ROADMAP.md` when a phase graduates.

## P0 — Active

- Finish AWS cleanup/docs for the CloudFront/S3 + EC2 + RDS deployment path — see
  [AWS Deployment Guide](/docs/process/AWS_DEPLOYMENT_GUIDE.md) and [Next Steps](/docs/todo/NEXT_STEPS.md)
- Harden AI pipeline live mode — model catalog, smoke tests, session caps —
  [TODO — AI Pipeline Model Selection](/docs/todo/TODO_AI_PIPELINE_MODEL_SELECTION.md)

## P1 — Next up

- End-to-end validation from clean clone (`pnpm dev:all`, auth flow, all three demos)
- Finish end-to-end validation and cost cleanup for the AWS deployment.

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
