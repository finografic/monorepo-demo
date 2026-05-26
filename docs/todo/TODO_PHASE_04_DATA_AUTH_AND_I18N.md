# TODO — Phase 04 Data Auth and I18n
> **Status:** Not started. Intentionally deferred until the starter shape is stable.
📅 2026-05-27

## Goal

Add platform features as starter-grade skeletons after the monorepo structure and app shells are
already clean.

## Scope

- [ ] Add Valibot where request/response or form validation is part of the starter baseline.
- [ ] Add Drizzle as a minimal schema/migration example if database support is still desired.
- [ ] Add Auth.js as a minimal integration boundary, not a full production auth system.
- [ ] Add i18next only if multilingual support remains a starter requirement after shell extraction.

## Guardrails

- Prefer scaffolds and seams over full product implementations.
- Avoid bringing over production auth flows, large schema sets, or source-specific migrations.
- Keep demo data and sample users intentionally minimal.

## Open Decisions

- Whether DB/auth belong in the first public starter cut or an optional later phase.
- Whether i18n is baseline or an add-on package/example.

## Exit Criteria

- These features feel optional and composable.
- The starter remains understandable for a new project, not just as a stripped product clone.
