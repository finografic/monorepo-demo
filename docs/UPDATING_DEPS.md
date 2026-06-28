# Dep updates with pmpm + syncpack

---

Upgrading npm packages is still a **pnpm + syncpack** workflow.

## What Moon/Proto actually manage

| Layer         | Tool                                   | What it pins                               |
| ------------- | -------------------------------------- | ------------------------------------------ |
| **Toolchain** | `.prototools` + `.moon/toolchain.yml`  | Node, pnpm, moon CLI versions              |
| **Tasks**     | `moon.yml` per project                 | `build`, `dev`, `typecheck`, etc.          |
| **npm deps**  | Each `package.json` + `pnpm-lock.yaml` | commitlint, syncpack, typescript, react, … |

Moon tasks mostly call `pnpm …` (e.g. `pnpm typecheck`, `pnpm lint`). They don’t declare or resolve npm dependencies.

Proto is the same split: it installs **Node/pnpm/moon**, not `@commitlint/cli` or `lint-staged`.

So migrating Turbo → Moon does **not** add a second registry step for npm deps. You don’t “register” commitlint in Moon.

---

## Upgrading npm packages — still pnpm

For packages like those listed below, the right move is:

```bash
pnpm update @commitlint/cli @commitlint/config-conventional @finografic/md-lint lint-staged oxlint-tsgolint syncpack --latest --recursive
```

That updates:

- `package.json` ranges (e.g. `^21.1.0`)
- `pnpm-lock.yaml`
- Any workspace package that lists those deps (e.g. `oxlint-tsgolint` in `packages/ui`)

Moon doesn’t need to be involved unless you want to run checks afterward:

```bash
moon run :typecheck
moon run :lint
```

---

## Where syncpack fits

Syncpack is **not** Moon’s dependency system. It enforces **consistent versions across workspace
`package.json` files** for deps you’ve marked as shared.

Your `syncpack.config.ts` has a `versionGroups` block (“pinned cross-workspace versions”) for things like:

- `typescript`, `oxlint`, `oxlint-tsgolint`, `vitest`, `vite`, `react`, …
- `@finografic/*` tooling packages
- `syncpack` itself

**For those:** after `pnpm update`, run:

```bash
pnpm syncpack:fix    # align mismatched ranges across packages
pnpm syncpack:lint   # verify
```

Your `reset` script already does this: `pnpm install && pnpm syncpack:fix && pnpm build`.

**For root-only tools** (`@commitlint/cli`, `lint-staged`, `husky`): they’re **not** in that version
group, so `pnpm update --latest` alone is enough — syncpack won’t touch them.

---

## Practical workflow (recommended)

```text
1. pnpm update <packages> --latest --recursive
2. pnpm syncpack:fix          # if any updated package is in versionGroups
3. pnpm syncpack:lint
4. moon run :typecheck        # (or :build / :lint)
```

For a broad bump:

```bash
pnpm deps:update              # your script: update --latest --recursive
pnpm syncpack:fix
```

---

## What _does_ need separate attention

These are **not** updated by `pnpm update @commitlint/cli …`:

| Item                   | Where                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| Node / pnpm / moon CLI | `.prototools`, `.moon/toolchain.yml`, `engines`, `packageManager` |
| `@moonrepo/cli`        | root `devDependencies` — update via pnpm like any other package   |

Keep `.prototools` and `toolchain.yml` in sync when you bump Node/pnpm/moon; that’s orthogonal to commitlint/syncpack upgrades.

---

## Mental model

```text
Turbo/Moon  →  “how do I run tasks across projects?”
Proto       →  “which Node/pnpm/moon binaries?”
pnpm        →  “which npm packages and versions?”
syncpack    →  “do all package.json files agree on shared deps?”
```

So: **`pnpm update --latest` is still the core upgrade path.** Syncpack is the extra step for
**shared** deps listed in `syncpack.config.ts`, not a Moon registration step. Root-only dev tools
skip syncpack unless you add them to `versionGroups`.
