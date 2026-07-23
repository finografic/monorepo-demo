# DONE — TypeScript 5.9 → 6 → 7 Upgrade

> **Completed:** 2026-07-23 — TypeScript upgraded `5.9.3 → 6.0.3 → 7.0.2` across the whole
> workspace in two separate commits, no source changes required.
>
> **Completion legend:** `[ ]` to-do · `[x]` done · `[-]` deferred/N/A

---

## Background

This project had never been upgraded to TypeScript 6. Per npm registry state at execution time:

- Latest stable TS6: `6.0.3`
- Latest stable TS7: `7.0.2` (`7.1.0` was still `-dev` prereleases only — not targeted)

Decision: **did not skip TS6.** Migrated `5.9.3 → 6.0.3` first as a diagnostics bridge, landed it as
its own commit, then migrated `6.0.3 → 7.0.2` as a second commit. This kept deprecated-option
removal separate from genuine TS7 breakage.

## Stage 0 — Repository facts

- **Structure:** pnpm workspace (`pnpm-workspace.yaml`: `config`, `packages/*`, `apps/*`). No pnpm
  `catalog:` — each `package.json` pins `typescript` independently; `syncpack` keeps them aligned.
- **Authoritative version location:** every package's `devDependencies.typescript` (9 files, no
  single root-only pin) — `package.json` (root), `apps/client`, `apps/server`,
  `apps/demo-ai-pipeline`, `apps/demo-datavis`, `apps/demo-xscan`, `packages/shared`,
  `packages/ui`, `config`.
- **tsconfig files (10):** `tsconfig.base.json`, `tsconfig.json` (root), `config/tsconfig.json`,
  `packages/ui/tsconfig.json` (does not extend base), `packages/shared/tsconfig.json`,
  `apps/client/tsconfig.json`, `apps/server/tsconfig.json`, `apps/demo-ai-pipeline/tsconfig.json`,
  `apps/demo-datavis/tsconfig.json`, `apps/demo-xscan/tsconfig.json`.
- **Commands (moon-driven):** `pnpm typecheck` → `moon run :typecheck`; `pnpm lint` /
  `pnpm lint:ci`; `pnpm test` → `moon run :test`; `pnpm build` → `moon run :build`;
  `pnpm tsc:debug` for the root-only project.
- **Compiler-API-dependent tooling swept — none found requiring `typescript` as a library**
  directly: no `from 'typescript'` imports, no `ts-morph`, no custom transformers.
  `oxlint-tsgolint` is Go-native (typescript-go based), unaffected. The one real hit was indirect
  (`tsdown`, via `rolldown-plugin-dts`) — see Stage 2.
- **`better-sqlite3`:** N/A — not a dependency anywhere in this repo. Skipped entirely.
- **Pre-existing config preserved as-is:** `tsconfig.base.json`'s `skipLibCheck: true` and
  `types: ["node"]` predate this migration and were left untouched.
- **Baseline validation recorded before any change:** `pnpm typecheck` clean, `pnpm lint`/
  `lint:ci` clean (only pre-existing warnings), `pnpm build` green. `pnpm test` **already failing**
  at baseline in `demo-xscan`, `demo-datavis`, `demo-ai-pipeline` with "No test files found" — a
  pre-existing vitest config gap, unrelated to TypeScript, not something this migration touched.

---

## Stage 1 — TypeScript 5.9.3 → 6.0.3

- [x] Bumped `typescript` to `^6.0.3` in all 9 `package.json` files, `pnpm install`,
      `pnpm syncpack:lint` confirmed no drift.
- [x] `pnpm typecheck` (moon task graph) — **zero diagnostics**, all 8 packages clean.
- [x] Triaged the TS6 removal/behavior-change list:
  - [x] `types`/`rootDir` — no issues; existing config already correct.
  - [x] Deprecated `baseUrl` — **found**. Root `tsconfig.json` had `baseUrl: "."`. Moon's
        `:typecheck` task graph does **not** type-check the root config (it has `"files": []`), so
        this diagnostic never showed up in `pnpm typecheck` — only surfaced via
        `pnpm tsc:debug` (`tsc --pretty --project tsconfig.json`) as `TS5101`. Since the root
        config has no files in scope, `baseUrl` was inert and simply removed (no `paths`
        migration needed).
  - [x] `outFile` — none present.
  - [x] Legacy `module Foo {}` namespaces — none found (grepped all `.ts`/`.tsx`).
  - [x] Import assertions (`assert {`) vs import attributes (`with {`) — none found.
  - [x] Obsolete compiler options — none flagged.
  - [x] Direct `tsc some-file.ts` invocations — none found across any package's scripts.
  - [x] Changed defaults (`strict`, `module`, `target`, `noUncheckedSideEffectImports`,
        `libReplacement`) — no impact; this repo sets `strict`/`module`/`target` explicitly
        everywhere and the two new flags didn't produce diagnostics.
- [x] Fixed the one real finding (root `baseUrl`) at its source — no suppressions used.
- [x] `ignoreDeprecations: "6.0"` was never needed — the single finding was fixed directly.
- [x] Full validation: typecheck/lint/build all matched the pre-bump baseline exactly; `test`
      matched the pre-existing baseline failures (no new regressions).
- [x] `oxlint-tsgolint` smoke-checked via `pnpm lint:ci` — unaffected, as expected.
- [x] Committed as `ff1ea0e` — "chore(deps): upgrade TypeScript 5.9.3 -> 6.0.3".

## Stage 2 — TypeScript 6.0.3 → 7.0.2

- [x] Checked `tsx`/`vitest` — both already at the latest stable line for their major
      (`tsx@4.23.1`, `vitest@4.1.10`; vitest 5 is beta-only) with no reported TS7 issues; left
      unchanged rather than bumping unrelated versions speculatively.
- [x] Bumped `typescript` to `^7.0.2` in the same 9 `package.json` files.
- [x] `pnpm install` surfaced one real peer-dependency break: **`tsdown@0.21.10`** (apps/server's
      build tool, generates `.d.mts` via `rolldown-plugin-dts`) declared
      `peerDependencies.typescript: "^5.0.0 || ^6.0.0"` — no TS7 support. Checked the registry:
      `tsdown@0.22.0` added `typescript: "^5.0.0 || ^6.0.0 || ^7.0.0"` to its peer range. Bumped
      `apps/server`'s `tsdown` `0.21.10 → 0.22.13` (latest at the time) — required by the TS7 move
      itself, not a scope-creep upgrade.
  - No other compiler-API-dependent tooling was affected; the Stage 0 sweep held.
- [x] `pnpm exec tsc --version` → confirmed `7.0.2`.
- [x] Full validation suite: `pnpm typecheck` (all 8 packages, zero diagnostics),
      `pnpm lint`/`lint:ci` (clean), `pnpm build` (all packages green, including `apps/server`'s
      `tsdown` build with correct `dist/index.d.mts` output), `pnpm test` (matches pre-migration
      baseline exactly, same 3 pre-existing "no test files" failures, no new ones).
- [x] Zero genuine TS7 compatibility errors were found — no `any`, no `@ts-ignore`, no
      `skipLibCheck` changes, no strictness or module-format changes, nothing unrelated bundled in.
- [x] Compiler-API sweep re-confirmed post-bump — only `tsdown` was affected, already handled.
- [x] Committed as `a13043e` — "chore(deps): upgrade TypeScript 6.0.3 -> 7.0.2".

## Final validation

- [x] `pnpm typecheck` — clean, all 8 packages
- [x] `pnpm lint` / `pnpm lint:ci` — clean (pre-existing warnings only, no errors)
- [x] `pnpm test` — matches pre-migration baseline (3 pre-existing failures, unrelated to TS)
- [x] `pnpm build` — all packages green
- [-] Declaration/package build for `packages/shared` and `packages/ui` — **N/A on inspection**:
  neither package has a `build` script; both are consumed directly as source via Vite aliases
  (`@workspace/shared` → `packages/shared/src`, same for `@workspace/ui`), not built as
  standalone declaration packages. `apps/server` is the one package that does emit
  declarations (via `tsdown`) and was verified directly above.
- [-] `better-sqlite3` smoke test — N/A, not present in this repo
- [ ] CI green on `.github/workflows/ci.yml` — not yet observed on a real CI run for this change;
      local `moon run :typecheck`/`:lint`/`:build` mirror the CI steps and all passed, but treat
      the actual GitHub Actions run as the final confirmation once this branch/commit is pushed.

## Final report

1. **Versions:** `5.9.3 → 6.0.3 → 7.0.2`
2. **Authoritative version location:** per-package `devDependencies.typescript`, 9 files, no pnpm
   catalog.
3. **TS5.9 → TS6 issues found and resolved:** one — deprecated `baseUrl` in root `tsconfig.json`
   (`TS5101`), removed (was inert, no files in scope for that config).
4. **TS6 → TS7 issues found and resolved:** one — `tsdown@0.21.10` peer range didn't cover TS7;
   bumped to `0.22.13`.
5. **Compiler-API-dependent tools found:** `tsdown` (via `rolldown-plugin-dts`) is the only tool in
   this repo that consumes the TypeScript compiler API for declaration generation. It now declares
   `typescript@^7.0.0` support as of `0.22.0`, but at runtime it still prints: _"TypeScript 7.0
   does not yet have a stable API and is experimental. Some options will be unavailable."_ Build
   output was verified correct (`apps/server/dist/index.d.mts` emitted as expected), but this is a
   live upstream caveat worth re-checking on future `tsdown`/TS7 point releases — not something
   this migration can "fix," only monitor. `@typescript/typescript6` compatibility shim was **not**
   needed since the actual build succeeded.
6. **Every changed file:**
   - Stage 1 (`ff1ea0e`): `package.json`, `apps/client/package.json`,
     `apps/demo-ai-pipeline/package.json`, `apps/demo-datavis/package.json`,
     `apps/demo-xscan/package.json`, `apps/server/package.json`, `config/package.json`,
     `packages/shared/package.json`, `packages/ui/package.json`, `tsconfig.json`,
     `pnpm-lock.yaml`
   - Stage 2 (`a13043e`): same 9 `package.json` files (typescript bump) plus
     `apps/server/package.json` (tsdown bump, same file as above), `pnpm-lock.yaml`
7. **Validation results:** typecheck/lint/build clean at every stage; test suite unchanged from
   pre-migration baseline (no regressions, no fixes attempted for the pre-existing vitest gaps —
   out of scope for this migration).
8. **`better-sqlite3` results:** N/A — not a dependency in this repo.
9. **Remaining risks/blockers:**
   - `tsdown`'s declaration-generation path runs against an explicitly experimental TS7 API
     surface per its own warning — low risk today (verified working) but worth a recheck on the
     next `tsdown` upgrade.
   - `pnpm test` still has pre-existing "no test files found" failures in three demo apps —
     unrelated to this migration, not fixed here, still open as separate work if desired.
   - Real CI run on `.github/workflows/ci.yml` not yet observed for this exact change (see Final
     validation above).
