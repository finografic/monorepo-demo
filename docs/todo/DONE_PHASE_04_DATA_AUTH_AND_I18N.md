# DONE — Phase 04 Data Auth and I18n

> **Completed:** 2026-05-27 — Auth.js, Drizzle, i18next, admin CMS, and client auth guards shipped as starter-grade platform layers.

## Goal

Add platform features as starter-grade skeletons after the monorepo structure and app shells are
already clean.

## Scope

- [x] Add Valibot where request/response or form validation is part of the starter baseline.
- [x] Add Drizzle as a minimal schema/migration example (`apps/server`, `drizzle.config.ts`, seeds).
- [x] Add Auth.js as a minimal integration boundary (`@hono/auth-js`, JWT strategy, cookie config).
- [x] Add i18next with HTTP backend, language detection, and admin translation CMS.

## Delivered sub-phases

| Phase | Scope                                                | Outcome                                                 |
| ----- | ---------------------------------------------------- | ------------------------------------------------------- |
| 04A   | Auth routes, server env, JWT strategy, cookie config | `apps/server/src/lib/auth.ts`, `requireAuth` middleware |
| 04B   | i18n schemas, seed data, `GET /api/i18n` routes      | `translations_*` tables and seed files                  |
| 04C   | i18next HTTP backend, language detection, switcher   | `apps/client/src/i18n/`                                 |
| 04D   | Auth guards, admin CRUD routes, full client UI       | `AuthContext`, admin users/translations pages           |
| 04E   | Build + typecheck validation                         | All packages green                                      |

## Guardrails (observed)

- Scaffolds and seams over full product implementations.
- No production-only auth flows or large domain schema sets copied wholesale.
- Demo data and sample users kept intentionally minimal.

## Exit criteria

- [x] Features feel optional and composable within the starter.
- [x] Starter remains understandable for a new project, not just a stripped product clone.

## Post-plan extensions

- [x] Cross-origin auth for GitHub Pages → hosted API (`CORS_ORIGINS`, `SameSite=None` cookies)
- [x] `DemoAuthGuard` on portfolio demo apps (`packages/shared`)
