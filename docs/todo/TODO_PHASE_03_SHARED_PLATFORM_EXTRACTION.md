# TODO — Phase 03 Shared Platform Extraction
> **Status:** Not started. Waiting on app shell boundaries.
📅 2026-05-27

## Goal

Reintroduce only the shared packages that still make sense after the app shells are simplified.

## Scope

- [ ] Evaluate `config` for shared env/path/i18n config that remains generic.
- [ ] Evaluate `packages/shared` for DTOs, shared schemas, and neutral contracts.
- [ ] Evaluate `packages/core` only if it still provides clear starter value after pruning.
- [ ] Add package-level build/typecheck/lint scripts only after each package boundary is stable.

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
