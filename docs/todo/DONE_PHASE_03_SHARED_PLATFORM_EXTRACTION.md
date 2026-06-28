# DONE — Phase 03 Shared Platform Extraction

> **Completed:** 2026-05-27 — shared platform evaluated; `@workspace/config` extracted.

## Goal

Reintroduce only the shared packages that still make sense after the app shells are simplified.

## Scope

- [x] Evaluate `config` for shared env/path/i18n config that remains generic.
- [x] Evaluate `packages/shared` for DTOs, shared schemas, and neutral contracts.
- [x] Evaluate `packages/core` only if it still provides clear starter value after pruning.
- [x] Add package-level build/typecheck/lint scripts only after each package boundary is stable.

## Evaluation Results

| Source package    | Verdict | Reasoning                                                              |
| ----------------- | ------- | ---------------------------------------------------------------------- |
| `config`          | Extract | Generic env validation (Valibot), root-dir finder, paths utility.      |
| `packages/core`   | Skip    | Utility types covered by `type-fest`. Global `log()` too opinionated.  |
| `packages/shared` | Skip    | Entirely domain models (drinks, orders, containers). No starter value. |

## Keep

- Cross-app contracts.
- Generic runtime/env helpers.
- Shared validation primitives.

## Exclude

- Business-domain constants and models.
- App-specific utilities disguised as shared abstractions.
- Shared packages that only exist to support features we are not carrying over.

## Exit Criteria

- Each extracted package has a narrow purpose.
- The dependency graph is understandable without source-project context.
- No package is kept solely because it existed in the source repo.

## Done

- [x] Populated `config/` with env validation (Valibot + dotenv), root finder, and paths utility.
- [x] Wired `@workspace/config` into `@workspace/server` — server reads port from shared env.
- [x] Cleaned `.env.example` to starter-appropriate defaults.
- [x] Validated: install, typecheck, build, and runtime all pass with cross-package imports.
