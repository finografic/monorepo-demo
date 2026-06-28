# DONE — Phase 01 Root Bootstrap

> **Completed:** 2026-05-27 — root monorepo workspace bootstrap shipped.

## Goal

Turn the repo root into a clean pnpm monorepo control plane before any feature extraction starts.

## Scope

- [x] Convert the root `package.json` from a single-app setup into a workspace root.
- [x] Ensure `@finografic/project-scripts` is installed at the root.
- [x] Add root-level `clean`, `reset`, and Syncpack scripts.
- [x] Adopt `@workspace/*` naming for all internal workspace packages.
- [x] Add a root `syncpack.config.js`.
- [x] Create initial workspace package directories and placeholder package manifests.
- [x] Decide the package naming scheme for internal apps/packages → `@workspace/*`.
- [x] Add any missing shared root config files once the first packages exist.

## Constraints

- Root must stay deployment-free for now.
- Root config should support phased extraction, not assume all future packages already exist.
- Internal package names use the `@workspace/*` scope (e.g. `@workspace/client`, `@workspace/config`).

## Deliverables

- Root config files install cleanly.
- The repo can act as a workspace root even before the first real apps are extracted.
- Planning docs align with the extraction strategy.

## Done

- [x] Reframed the root around Turbo, pnpm workspaces, TS base config, and Syncpack.
- [x] Kept formatting/linting tooling at the root without app-specific build logic.
- [x] Created `apps/client`, `apps/server`, `config` with placeholder manifests and tsconfigs.
- [x] Validated: `pnpm install` resolves all 4 workspace projects; `turbo typecheck` passes.
