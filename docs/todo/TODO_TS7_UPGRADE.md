# TODO — TypeScript 5.9 → 6 → 7 Upgrade

> **Status:** Not started (2026-07-23). Plan only — no code changes yet.
>
> **Completion legend:** `[ ]` to-do · `[x]` done · `[-]` deferred/N/A

---

## Background

This project has never been upgraded to TypeScript 6. Per current npm registry state:

- Latest stable TS6: `6.0.3`
- Latest stable TS7: `7.0.2` (`7.1.0` is still `-dev` prereleases only — do not target it)

Decision: **do not skip TS6.** Migrate `5.9.3 → 6.0.3` first as a diagnostics bridge, land it as its
own reviewable change, then migrate `6.0.3 → 7.0.2`. This keeps deprecated-option removal separate
from genuine TS7 breakage, so a regression is easy to bisect.

## Stage 0 — Repository facts (already gathered)

- **Structure:** pnpm workspace (`pnpm-workspace.yaml`: `config`, `packages/*`, `apps/*`). No pnpm
  `catalog:` — each `package.json` pins `typescript` independently; `syncpack` keeps them aligned.
- **Authoritative version location:** every package's `devDependencies.typescript`, currently
  `^5.9.3` in all 9 below. There is no single root-only pin.
  - `package.json` (root)
  - `apps/client/package.json`
  - `apps/server/package.json`
  - `apps/demo-ai-pipeline/package.json`
  - `apps/demo-datavis/package.json`
  - `apps/demo-xscan/package.json`
  - `packages/shared/package.json`
  - `packages/ui/package.json`
  - `config/package.json`
- **tsconfig files (10):** `tsconfig.base.json`, `tsconfig.json` (root), `config/tsconfig.json`,
  `packages/ui/tsconfig.json` (does **not** extend base — own `target`/`lib`), `packages/shared/tsconfig.json`,
  `apps/client/tsconfig.json`, `apps/server/tsconfig.json`, `apps/demo-ai-pipeline/tsconfig.json`,
  `apps/demo-datavis/tsconfig.json`, `apps/demo-xscan/tsconfig.json`.
- **Known pre-flight finding:** root `tsconfig.json` sets `"baseUrl": "."` — deprecated, flagged for
  removal under Stage 1 (§ TS6 diagnostics). No app currently relies on bare (non-`paths`) baseUrl
  resolution as far as static inspection shows; confirm via typecheck, not assumption.
- **Commands (moon-driven, root `package.json` scripts):**
  - Typecheck: `pnpm typecheck` → `moon run :typecheck`
  - Lint: `pnpm lint` → `moon run :lint` (CI uses `pnpm lint:ci` = `oxlint --quiet`)
  - Test: `pnpm test` → `moon run :test`
  - Build: `pnpm build` → `moon run :build`
  - Single-project debug: `pnpm tsc:debug` (`tsc --pretty --project tsconfig.json`, root only)
- **CI:** `.github/workflows/ci.yml` runs `moon run :typecheck` (also has separate lint/test/build
  steps — confirm exact job list before/after each stage).
- **Compiler-API-dependent tooling swept — none found requiring `typescript` as a library:**
  - `[-]` No direct `from 'typescript'` / `require('typescript')` imports in app/package source.
  - `[-]` No `ts-morph` dependency anywhere in the workspace.
  - `[-]` No custom TS transformers or declaration-extraction tools found.
  - `oxlint-tsgolint` (`^0.24.0`, root devDependency) is a Go-native, typescript-go-based type-aware
    linter plugin for oxlint — it does not import the `typescript` npm package, so it is not expected
    to block either stage. Still worth a smoke-check after each stage (see validation).
  - `tsx` (`^4.22.3`) and `vitest` (`^4.1.10`) both depend on `typescript` only as an optional
    peer/type-stripping consumer, not a hard API dependency — verify their installed versions declare
    TS7 support before Stage 2; pin/upgrade them first if not.
- **`better-sqlite3`:** `[-]` N/A — not a dependency anywhere in this repo (grep across all
  `package.json` files returned no matches). Skip the better-sqlite3 checks entirely; do not add the
  dependency as part of this migration.
- **Pre-existing config to preserve, not treat as a migration workaround:** `tsconfig.base.json`
  already sets `skipLibCheck: true` and `types: ["node"]`. These predate this migration — keep them,
  don't newly introduce them to hide errors, and don't strip them either.

---

## Stage 1 — TypeScript 5.9.3 → 6.0.3

- [ ] Bump `typescript` to `^6.0.3` in all 9 `package.json` files listed above (root + 8 workspace
      packages). Use `pnpm update typescript@6.0.3 --recursive` or edit + `pnpm install`, then
      `pnpm syncpack:lint` to confirm no version drift.
- [ ] Run `pnpm typecheck` before touching anything else. Record every diagnostic verbatim.
- [ ] Triage diagnostics against the known TS6 removal/behavior-change list:
  - [ ] Missing global types needing explicit `compilerOptions.types` (Node-only projects need
        `"types": ["node"]` — `tsconfig.base.json` already has this; check `packages/ui/tsconfig.json`
        specifically since it does not extend base and has no `types` array).
  - [ ] Emit paths needing an explicit `rootDir` (check `apps/server` — sets `rootDir: "."` with
        mixed `env.server.ts` + `src/**` includes).
  - [ ] Deprecated `baseUrl` usage — remove from root `tsconfig.json` if nothing depends on bare
        module resolution; convert any real usage to `paths`.
  - [ ] Removed `outFile` — grep confirms none currently used; re-check after bump.
  - [ ] Legacy `module Foo {}` namespace syntax — grep source for `^\s*(declare\s+)?module\s+\w+\s*{`
        (excluding `.d.ts` ambient module augmentation, which is a different, still-valid form).
  - [ ] Import assertions (`assert { type: "json" }`) vs import attributes (`with { type: "json" }`) —
        grep for `assert {` near `import`/`export ... from`.
  - [ ] Obsolete compiler options flagged by `tsc` itself.
  - [ ] Scripts invoking `tsc some-file.ts` directly while a `tsconfig.json` is present in scope
        (check `package.json` scripts across all 9 packages, not just root).
  - [ ] Changed defaults: `strict`, `module`, `target`, `noUncheckedSideEffectImports`,
        `libReplacement`. This repo already sets `strict: true` and explicit `target`/`module`
        everywhere, so exposure should be limited to the two new flags — decide explicitly whether
        to opt in/out rather than silently inheriting the new default.
- [ ] Fix each finding at its source (real code/config changes, not suppressions).
- [ ] If `ignoreDeprecations: "6.0"` is used at any point, treat it as a temporary inventory tool
      only — track every option it's masking in this doc, then remove it before closing Stage 1.
- [ ] Run full validation: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
- [ ] Smoke-check `oxlint-tsgolint` still runs cleanly (`pnpm lint:ci`) — it's Go-native but confirm
      no incidental breakage from the TS version bump touching shared tsconfig options it reads.
- [ ] Commit Stage 1 as its own change, separate from Stage 2.

## Stage 2 — TypeScript 6.0.3 → 7.0.2

- [ ] Confirm `tsx`/`vitest` installed versions support TS7 (see Stage 0 note); upgrade those first,
      in isolation, if needed — not as part of the TS bump commit.
- [ ] Bump `typescript` to `^7.0.2` in the same 9 `package.json` files.
- [ ] Run `pnpm exec tsc --version` and confirm it reports `7.0.2`.
- [ ] Run full validation suite: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
- [ ] Resolve genuine compatibility errors at the source. Explicitly disallowed as "fixes":
  - [ ] No new/broadened `any`.
  - [ ] No `@ts-ignore` additions.
  - [ ] No enabling `skipLibCheck` to hide errors (it's already on from before — don't lean on it
        for anything new).
  - [ ] No weakening `strict`, `noUncheckedIndexedAccess`, or `exactOptionalPropertyTypes`.
  - [ ] No module format changes unless a real incompatibility forces it.
  - [ ] No unrelated dependency upgrades or style rewrites bundled into this stage.
- [ ] Re-confirm the compiler-API sweep from Stage 0 still holds (no new `typescript`-importing
      tooling was added between stages).
- [ ] Commit Stage 2 as its own change.

## Final validation (after Stage 2)

- [ ] `pnpm typecheck` (all packages via moon)
- [ ] `pnpm lint` / `pnpm lint:ci`
- [ ] `pnpm test`
- [ ] `pnpm build` (app builds)
- [ ] Declaration/package build for `packages/shared` and `packages/ui` specifically (both are
      consumed by every app — verify their emitted types are unchanged in shape)
- [ ] `[-]` better-sqlite3 smoke test — N/A, not present in this repo
- [ ] CI green on `.github/workflows/ci.yml`

## Final report (fill in on completion)

1. Versions: original `5.9.3` → intermediate `6.0.3` → final `7.0.2`
2. Authoritative version location: per-package `devDependencies.typescript` (9 files, no catalog)
3. TS5.9 → TS6 issues found and resolved: _fill in_
4. TS6 → TS7 issues found and resolved: _fill in_
5. Compiler-API-dependent tools found: none at plan time (`oxlint-tsgolint` noted as Go-native, not
   API-dependent) — reconfirm at execution time
6. Every changed file: _fill in_
7. Validation results: _fill in_
8. better-sqlite3 results: N/A — not a dependency in this repo
9. Remaining risks/blockers: _fill in_
