# AGENTS.md — AI Assistant Guide

## Project Memory Model

- `docs/todo/ROADMAP.md` = milestone plan, near-term tasks, and completed history.
- `.agents/handoff.md` = stable current project state.
- `.agents/memory.md` = chronological session log.

Promote durable findings from memory → handoff, priorities and follow-ups → roadmap.

Reference: [`docs/process/PROJECT_MEMORY_MODEL.md`](./docs/process/PROJECT_MEMORY_MODEL.md)

---

## Roadmap and Planning Docs

- Check `ROADMAP.md` before proposing new initiatives.
- Use `ROADMAP.md#next` for small follow-ups and manual validation.
- Keep detailed plans in `docs/todo/TODO_*.md`; graduate completed plans to `DONE_*.md`.
- Follow `.github/instructions/documentation/todo-done-docs.instructions.md`.

---

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
- Oxlint & style: `.github/instructions/code/linting-code-style.instructions.md`
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
- **Do NOT manually align column widths or pad cells to equal width.** `oxfmt` (run automatically
  by lint-staged on commit and by `pnpm format:fix`) fixes table alignment automatically. Spending
  tokens counting characters and iterating on spacing is wasted effort — write the content, let the
  formatter handle alignment.

---

## Git Policy

- Do not include `Co-Authored-By` lines in commit messages.
- `.github/instructions/git/git-policy.instructions.md` (see Commits and Releases sections)

---

## Cursor

- Always-on rules: `.cursor/rules/` (`alwaysApply` — entry point is `AGENTS.md`, same as `CLAUDE.md`)

---

## Learned User Preferences

- Do not create git commits unless the user explicitly asks.
- Treat pasted handoff or context blocks as orientation only; do not start work unless the user asks for a specific action.
- For typography and input placeholder styling, prefer global tokens in `globals.css` (`--placeholder-foreground` with base `::placeholder` rules, `html` root font-size, semantic text tokens) over per-component `placeholder:text-*` classes; prepend new body fonts to the stack and keep existing fallbacks unless asked to remove a family. On the portfolio landing, keep TMR blue as the primary brand/action colour; use soft semantic tinted badges/pills (light alpha backgrounds, matching feature icon wells) and keep tag chips on one line.
- In `demo-datavis`, centralize common Recharts props in `src/constants/charts.config.ts`; keep chart-specific constants (domains, IDs, label text) in each chart file.
- npm dependency upgrades use pnpm + syncpack (Moon/Proto pin Node/pnpm/moon only); `deps:update` chains `pnpm syncpack:fix` after `--latest --recursive`; syncpack v14+ uses `fix` not `fix-mismatches`.
- Prefer en-GB as the default locale; do not re-enable the portfolio landing language selector without an explicit ask (translations are incomplete). For i18n architecture, use touch-monorepo `packages/i18n` + JSON-as-seed-source as the reference.
- In this workspace, use `source.addMissingImports: explicit` and `source.sortImports: explicit`; do not remove unused imports on save (`source.organizeImports: never`); keep `source.fixAll.oxc: explicit` for oxlint without organize-imports cleanup. Prefer keeping `index.ts`/`index.tsx` as re-export barrels; split implementation into sibling modules (e.g. `{id}.prompt.ts`) rather than inlining into index files.
- Use `:` as the segment separator in npm script names everywhere (e.g. `db:migrations:seed`, not `db.migrations.seed` or space-separated variants).
- Prefer the published `@finografic/project-scripts` from the registry; use `file:`/`link:` only when explicitly testing local changes — `pnpm link` writes persistent `link:` specifiers in `package.json` and `pnpm-workspace.yaml` overrides, and global unlink does not restore registry ranges.
- When `docs/todo/TODO_*.md` work is complete, rename to `DONE_*.md`, cross-check against the codebase, and update `ROADMAP.md` and `NEXT_STEPS.md` links.
- `target="_blank"` in Cursor's embedded browser/Simple Browser often does not open a system tab; verify in an external browser before treating link behavior as an app bug.
- Only list seeds in `config/db-setup.config.ts` for schemas/tables that exist in this repo.

## Learned Workspace Facts

- This is a portfolio monorepo demo (`monorepo-demo`, renamed from `monorepo-starter`); `monorepo-starter` is a separate repo—mention it only as migration history. Selectively extracted from touch-monorepo (auth/server/db); use LLAAB and vite-monorepo for shadcn/Tailwind UI patterns; intentionally beyond bare-bones (auth, admin/CMS, Drizzle, i18n) and also a GitHub demo/portfolio piece.
- `pnpm-workspace.yaml` declares: `config`, `packages/*`, `apps/*`.
- Moon drives `build`, `dev`, `lint`, `typecheck`, `test`, and `clean` tasks (Turbo removed); Moon/Proto pin toolchain (Node, pnpm, moon)—npm deps are upgraded via pnpm + syncpack.
- `apps/client`: Vite 8 + React 19 + React Router v7 + shadcn/Tailwind 4; dev on port 3000, proxies `/api` → server; landing keeps the language selector hidden (translations incomplete) with en-GB as default locale; landing section order is Monorepo Features above Portfolio Demos; GitHub CTA lives on the hero outline button (no duplicate nav “View on GitHub”). `apps/server`: Hono + @hono/node-server; `tsdown` build, `tsx watch` dev, default port 4000.
- `@workspace/config`: Valibot env validation + dotenv with root-dir auto-discovery + workspace paths; hosts `db-setup.config.ts`.
- Each app has a local `oxlint.config.ts` importing presets from `@finografic/oxc-config/oxlint`; root `lint:ci` uses `oxlint --quiet` so warnings are hidden and only errors fail CI.
- Root `package.json` does NOT set `"type": "module"` — each sub-package declares its own.
- `packages/ui` contains owned shadcn components and Tailwind 4 globals (`@workspace/ui/*`); includes Grid `Container`/`Row`/`Col` matching the LLAAB export pattern — prefer those for page/section layouts over Tailwind `grid-cols-*` (DemoLayout shell and login micro-grids are intentional Keep exceptions); shadcn theme `baseColor: neutral`, `style: radix-vega`; semantic text tokens in `globals.css` (`--foreground`, `--muted-foreground`, `--placeholder-foreground` with base `::placeholder` rules); `body` uses `text-foreground`, most paragraph copy `text-muted-foreground`; root scale via `html { font-size: 112.5%; }`.
- `packages/core` was intentionally skipped in Phase 03; `@workspace/shared` main barrel is types/models only (server-safe); JSX components (`DemoLayout`, `StandbyPlaceholder`, `OptionCard`) export via `@workspace/shared/components`; assets via `@workspace/shared/assets/*`; demo apps alias `@workspace/shared` → `packages/shared/src` (directory, required for asset subpaths). Portfolio demos: `demo-ai-pipeline` :3001 (TMR/open-data grounding is mock RAG via prompts/fixtures, not live CKAN), `demo-datavis` :3002 (live CKAN/open data), `demo-xscan` :3003 (`demo-xscan` keeps its own monitor-icon `StandbyPlaceholder`, runs vendored `@finografic/deps-xscan` inline in an xterm terminal during dev, not QLD branding).
- `.github/workflows/deploy-demo-pages.yml` publishes static demo apps to GitHub Pages under `/demo-ai-pipeline/`, `/demo-datavis/`, and `/demo-xscan/`; API-backed features need a hosted Node service — full Hono API has been hosted on AWS App Runner for Pages clients (Render remains an alternative); the Lambda + API Gateway demo is a minimal `/health` + `/api/aws-demo` stub, not full-server parity.
- Root `db:reset` chains drop → migrate → `db:setup` via the `@finografic/project-scripts` `db-setup` CLI (`NODE_OPTIONS='--import tsx' db-setup -y`); do not duplicate a local db-setup script.
- `config/db-setup.config.ts` seeds: `user`, `supported_languages`, `translations_ui`, `translations_app`, `translations_admin`; `viewConfigs` is empty (no SQL views). Seed files use underscore names matching schema exports.

---
