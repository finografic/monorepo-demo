# Next Steps — Recommended Implementation Order

> **Context:** Starter phases 01–07 and the portfolio demo plan are complete. GitHub Pages publishes
> the landing page plus `demo-ai-pipeline`, `demo-datavis`, and `demo-xscan`. Fixture mode, mock
> datavis charts, shared `DemoLayout`, and TMR-specific AI fixtures are shipped.
>
> 📅 2026-06-30

Completed work is recorded in `DONE_*.md` files — see [ROADMAP.md](/docs/todo/ROADMAP.md) for links.
Do not re-open finished phases here.

---

## 1 — Host the Node API for live demo features

GitHub Pages serves static apps only. Live auth, LLM streaming, and xscan execution need a hosted
`apps/server`.

- [ ] Deploy `apps/server` per [Portfolio Deployment](/docs/process/PORTFOLIO_DEPLOYMENT.md)
- [ ] Set `DEMO_API_BASE_URL` (and optional `DEMO_XSCAN_API_BASE_URL`) on the Pages repo
- [ ] Configure `CORS_ORIGINS`, `AUTH_COOKIE_SAME_SITE=none`, `AUTH_COOKIE_SECURE=true`
- [ ] Smoke test sign-in from `https://finografic.github.io/monorepo-demo/` against the hosted API
- [ ] Smoke test `POST /api/stream/live` with credentials from the AI pipeline demo

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
