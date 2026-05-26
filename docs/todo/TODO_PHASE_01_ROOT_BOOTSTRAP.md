# TODO — Phase 01 Root Bootstrap
> **Status:** In progress. Root config baseline defined on 2026-05-27.
📅 2026-05-27

## Goal

Turn the repo root into a clean pnpm monorepo control plane before any feature extraction starts.

## Scope

- [x] Convert the root `package.json` from a single-app setup into a workspace root.
- [x] Ensure `@finografic/project-scripts` is installed at the root.
- [x] Add root-level `clean`, `reset`, and Syncpack scripts.
- [x] Replace source-derived `@workspace/*` references in root config.
- [x] Add a root `syncpack.config.js`.
- [ ] Create initial workspace package directories and placeholder package manifests.
- [ ] Decide the published package naming scheme for internal apps/packages.
- [ ] Add any missing shared root config files once the first packages exist.

## Constraints

- Root must stay deployment-free for now.
- Root config should support phased extraction, not assume all future packages already exist.
- Internal package names should be published-style names, not `@workspace/*`.

## Deliverables

- Root config files install cleanly.
- The repo can act as a workspace root even before the first real apps are extracted.
- Planning docs align with the extraction strategy.

## Done

- [x] Reframed the root around Turbo, pnpm workspaces, TS base config, and Syncpack.
- [x] Kept formatting/linting tooling at the root without app-specific build logic.
