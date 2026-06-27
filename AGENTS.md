# AGENTS.md — AI Assistant Guide

## Rules — Project-Specific

- Project-specific rules live in `.github/instructions/project/**/*.instructions.md`.
- All internal workspace packages use the `@workspace/*` scope (e.g. `@workspace/client`, `@workspace/server`, `@workspace/config`).
- External published dependencies use their real npm scope (e.g. `@finografic/project-scripts`).

## Rules — Global

Rules are canonical in `.github/instructions/` — see `README.md` there for folder structure.
Shared across Claude Code, Cursor, and GitHub Copilot.

**General**

- General baseline: `.github/instructions/general.instructions.md`

**Code**

- TypeScript patterns: `.github/instructions/code/typescript-patterns.instructions.md`
- Modern TS patterns: `.github/instructions/code/modern-typescript-patterns.instructions.md`
- ESLint & style: `.github/instructions/code/linting-code-style.instructions.md`
- Provider/context patterns: `.github/instructions/code/provider-context-patterns.instructions.md`
- Picocolors CLI styling: `.github/instructions/code/picocolors-cli-styling.instructions.md`

**Naming**

- File naming: `.github/instructions/naming/file-naming.instructions.md`
- Variable naming: `.github/instructions/naming/variable-naming.instructions.md`

**Documentation**

- Documentation: `.github/instructions/documentation/documentation.instructions.md`
- README standards: `.github/instructions/documentation/readme-standards.instructions.md`
- Agent-facing markdown: `.github/instructions/documentation/agent-facing-markdown.instructions.md`
- Feature design specs: `.github/instructions/documentation/feature-design-specs.instructions.md`
- TODO/DONE docs: `.github/instructions/documentation/todo-done-docs.instructions.md`

**Git**

- Git policy: `.github/instructions/git/git-policy.instructions.md`

---

## Rules — Markdown Tables

- Padded pipes: one space on each side of every `|`, including the separator row.
- Align column widths so all cells in the same column are equal width.

---

## Git Policy

- Do not include `Co-Authored-By` lines in commit messages.
- `.github/instructions/git/git-policy.instructions.md` (see Commits and Releases sections)

---

## Claude Code — Session Memory and Handoff

> This section applies to Claude Code only. Other agents can ignore it.

- **Session log:** `.claude/memory.md` (gitignored) — maintenance rules are in that file.
- **Project state snapshot:** `.agents/handoff.md` (git-tracked) — maintenance rules are in that file.

---

## Learned User Preferences

- Do not create git commits unless the user explicitly asks.
- When changing typography, prepend new body fonts to the stack and keep existing fallbacks unless the user asks to remove a family entirely.
- For `@finografic/design-system`, ship prebuilt `dist/` from CI in the npm tarball; do not commit `dist/` or use postinstall build scripts.
- In this workspace, do not remove unused imports on save (`source.organizeImports: never`); sort only via `source.sortImports: explicit`. Keep `source.fixAll.oxc: explicit` for oxlint fixes without organize-imports cleanup.
- Prefer adding missing imports on save (`source.addMissingImports: explicit`) and TypeScript auto-import suggestions while typing.
- Use `:` as the segment separator in npm script names everywhere (e.g. `db:migrations:seed`, not `db.migrations.seed` or space-separated variants).
- Prefer the published `@finografic/project-scripts` from the registry; use `file:`/`link:` only when explicitly testing local project-scripts changes.
- `pnpm link` writes persistent `link:` specifiers in `package.json` and `pnpm-workspace.yaml` overrides — global unlink does not restore registry ranges.
- Only list seeds in `config/db-setup.config.ts` for schemas/tables that exist in this repo.

## Learned Workspace Facts

- This is a selective-extraction monorepo starter based on touch-monorepo; intentionally beyond bare-bones (auth, admin/CMS, Drizzle, i18n) and also a GitHub demo/portfolio piece.
- `pnpm-workspace.yaml` declares: `config`, `packages/*`, `apps/*`.
- Turbo drives `build`, `dev`, `lint`, `typecheck`, `test`, and `clean` tasks.
- `apps/client`: Vite 8 + React 19 + React Router v7 + shadcn/Tailwind 4; dev on port 3000, proxies `/api` → server. `apps/server`: Hono + @hono/node-server; `tsdown` build, `tsx watch` dev, default port 4000.
- `@workspace/config`: Valibot env validation + dotenv with root-dir auto-discovery + workspace paths; hosts `db-setup.config.ts`.
- Each app has a local `oxlint.config.ts` importing presets from `@finografic/oxc-config/oxlint`.
- Root `package.json` does NOT set `"type": "module"` — each sub-package declares its own.
- `packages/ui` contains owned shadcn source components and Tailwind 4 globals, exported as `@workspace/ui/*`.
- `packages/core` and `packages/shared` were intentionally skipped; `apps/` plus `packages/ui` is valid.
- No deployment workflow — GitHub Pages removed as unsuitable for full-stack monorepo.
- For selective extraction: use touch-monorepo for auth/server/db patterns; use LLAAB and vite-monorepo for shadcn/Tailwind UI package patterns.
- Root `db:reset` chains drop → migrate → `db:setup` via the `@finografic/project-scripts` `db-setup` CLI (`NODE_OPTIONS='--import tsx' db-setup -y`); do not duplicate a local db-setup script.
- `config/db-setup.config.ts` seeds: `user`, `supported_languages`, `translations_ui`, `translations_app`, `translations_admin`; `viewConfigs` is empty (no SQL views). Seed files use underscore names matching schema exports.

---

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
