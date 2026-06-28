# Toolchain: Moon, Proto, Syncpack

How the three runtime/task/dependency tools fit together, how to update them, and why `.nvmrc` still matters.

---

## Overview

| Tool         | What it manages                                | Config file(s)                      |
| ------------ | ---------------------------------------------- | ----------------------------------- |
| **proto**    | Runtime versions (Node, pnpm, moon)            | `.prototools`                       |
| **Moon**     | Task runner (dev, build, lint, typecheck…)     | `.moon/workspace.yml`, `*/moon.yml` |
| **syncpack** | npm package version alignment across workspace | `syncpack.config.ts`                |

These three tools operate at completely different levels and do not overlap.

---

## proto

proto is a toolchain manager — it installs and pins the versions of **runtimes and CLI tools** used in this repo. Think of it as the layer below pnpm and Node.

### How it works

`.prototools` declares the pinned versions:

```toml
node = "24.16.0"
pnpm = "10.33.0"
moon = "2.3.5"
```

When you `cd` into the repo and run any command, proto's shim layer intercepts `node`, `pnpm`, and `moon` and uses the versions declared in `.prototools`. No global version conflicts.

### What proto does NOT manage

proto only manages **runtimes and CLI tools** — not npm packages. It has no concept of `react`, `@types/node`, `vite`, etc. Those live in `package.json` files and are managed by pnpm and syncpack.

### Updating proto-managed tools

```bash
# Bump Node in .prototools, .nvmrc, and .moon/toolchain.yml
# 1. Edit .prototools:
node = "24.x.y"

# 2. Edit .nvmrc:
24.x.y

# 3. Edit .moon/toolchain.yml:
node:
  version: '24.x.y'

# 4. Update @types/node in every package.json that has it:
#    (syncpack keeps these aligned — see Syncpack section)

# Bump pnpm
# 1. Edit .prototools: pnpm = "10.x.y"
# 2. Edit .moon/toolchain.yml: pnpm: version: '10.x.y'
# 3. Edit root package.json: "packageManager": "pnpm@10.x.y"

# Bump Moon itself
# 1. Edit .prototools: moon = "2.x.y"
# (Moon reads its own version from .prototools at startup)
```

### Updating proto itself

```bash
proto upgrade
```

---

## Moon

Moon is the **task runner** for this monorepo. It replaces Turbo as the primary orchestration layer (Turbo is still installed but Moon is preferred for local dev).

### How it works

Each workspace package has a `moon.yml` that declares tasks:

```yaml
language: 'typescript'
tasks:
  dev:
    command: 'pnpm dev'
    local: true
  build:
    command: 'pnpm build'
    outputs: ['dist']
```

Moon reads the workspace layout from `.moon/workspace.yml` and the toolchain from `.moon/toolchain.yml`. It can run tasks in parallel, with dependency awareness, and with caching.

### Moon vs Turbo

| Aspect       | Moon                              | Turbo                           |
| ------------ | --------------------------------- | ------------------------------- |
| Task config  | Per-package `moon.yml`            | Root `turbo.json`               |
| Runtime pins | `.moon/toolchain.yml` (via proto) | No concept of runtimes          |
| Local dev    | `moon run client:dev`             | `turbo run dev --filter=client` |
| Cache        | `~/.moon/cache`                   | `.turbo/cache`                  |
| Remote cache | moonrepo.dev (paid)               | Vercel Remote Cache (paid)      |

Moon does **not** replace Vite or any bundler — it's purely the orchestration layer that calls `pnpm <script>` inside each package. Vite still runs independently on its own port per app.

### Common Moon commands

```bash
# Run a task in one project
moon run client:dev
moon run server:build

# Run a task across all projects
moon run :typecheck
moon run :lint

# Run multiple projects at once (how dev:all works)
moon run client:dev server:dev demo-ai-pipeline:dev

# List all projects and tasks
moon project-graph
moon query projects
```

### Why Vite ports don't auto-increment

Each Vite instance is a separate process with an explicit port in its `vite.config.ts`. Moon starts them in parallel but each one owns its port — there is no negotiation between them. Use `pnpm kill:dev` (which calls `scripts/kill-dev.sh`) before `pnpm dev:all` to free ports cleanly.

### Updating Moon

Moon's version is pinned in `.prototools`. To upgrade:

```bash
# 1. Check moonrepo.dev for latest version
# 2. Edit .prototools: moon = "2.x.y"
# 3. proto install moon
```

---

## Syncpack

Syncpack ensures that the **same package appears at the same version across all workspace package.json files**. When two packages both depend on `react` they should pin the same version — syncpack enforces that.

### How it works

`syncpack.config.ts` declares:

- **`sortFirst`** — canonical key ordering for all `package.json` files (enforced by `syncpack lint` formatting check).
- **`versionGroups`** — which packages should be version-locked across the workspace. The `pinned cross-workspace versions` group covers all shared deps. The `@workspace/*` group is ignored (workspace: refs are not versioned by syncpack).
- **`semverGroups`** — enforces `^` range on all real deps; ignores `workspace:*` refs.

### npm scripts

```bash
pnpm syncpack:lint      # check formatting + versions + semver ranges (CI gate)
pnpm syncpack:fix       # fix version mismatches (sets all to the highest found)
pnpm syncpack:format    # fix package.json key ordering to match sortFirst
```

In practice you run these after:

- Adding a new package to any `package.json`
- Bumping a shared dependency
- Adding a new workspace package

### Updating a shared dependency

```bash
# 1. Update the version in the primary package.json (e.g. apps/client)
# 2. Run syncpack fix to propagate to all other packages that use it
pnpm syncpack:fix

# 3. Run pnpm install to update the lockfile
pnpm install

# 4. Verify
pnpm syncpack:lint
```

### Adding a new package to the pinned group

If you add a new shared dep (e.g. `zod`) that appears in more than one workspace package, add it to the `pinned cross-workspace versions` group in `syncpack.config.ts` so syncpack tracks it.

### What syncpack does NOT manage

Syncpack only looks at `package.json` version strings. It has no concept of Node.js runtime versions, proto tools, or lockfile integrity.

---

## @types/node and runtime-adjacent packages

`@types/node` is an npm package but it corresponds directly to the Node.js runtime version. It is NOT managed by proto — proto only manages the runtime binary. You must update `@types/node` manually whenever you bump Node.

### Update discipline

When bumping Node (e.g. `24.3.0` → `24.16.0`):

1. Update `.prototools`, `.nvmrc`, `.moon/toolchain.yml` (proto layer)
2. Update `@types/node` in every `package.json` that has it (npm layer)
3. Run `pnpm syncpack:fix && pnpm install` to ensure alignment

### Why @types/node is in the syncpack pinned group

`@types/node` appears in every package that uses Node APIs. If `apps/server` uses `^24.12.0` and `config` uses `^20.0.0`, TypeScript will use different Node type signatures per package. The pinned group prevents this silent drift.

---

## .nvmrc — why it's still here alongside proto

`.nvmrc` and `.prototools` both pin Node to the same version. They serve different audiences:

| Who reads it        | Tool                                                  |
| ------------------- | ----------------------------------------------------- |
| You (locally)       | proto (via shim)                                      |
| CI (GitHub Actions) | `actions/setup-node` with `node-version-file: .nvmrc` |
| VS Code / WebStorm  | nvm/fnm extension — reads `.nvmrc` for the status bar |
| Other team members  | nvm, fnm, Volta — all read `.nvmrc`                   |

proto and `.nvmrc` are not redundant — they cover different entry points. Always keep them in sync.

---

## Update checklist

When bumping **Node**:

- [ ] `.prototools` — `node = "x.y.z"`
- [ ] `.nvmrc` — `x.y.z`
- [ ] `.moon/toolchain.yml` — `node.version: 'x.y.z'`
- [ ] All `package.json` `engines.node` fields
- [ ] All `@types/node` versions → `pnpm syncpack:fix`
- [ ] `pnpm install` to update lockfile

When bumping **pnpm**:

- [ ] `.prototools` — `pnpm = "x.y.z"`
- [ ] `.moon/toolchain.yml` — `pnpm.version: 'x.y.z'`
- [ ] Root `package.json` — `"packageManager": "pnpm@x.y.z"`

When bumping **Moon**:

- [ ] `.prototools` — `moon = "x.y.z"`

When bumping a **shared npm dep**:

- [ ] Update version in one `package.json`
- [ ] `pnpm syncpack:fix` to propagate
- [ ] `pnpm install`
- [ ] `pnpm syncpack:lint` to verify
