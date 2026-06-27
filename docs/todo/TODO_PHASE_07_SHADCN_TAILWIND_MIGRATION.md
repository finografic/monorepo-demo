# TODO — Phase 07 Shadcn + Tailwind Migration

> **Status:** Planned.
> 📅 2026-06-28

## Goal

Replace the temporary `@finografic/design-system` + Panda CSS client layer with the newer shadcn +
Tailwind 4 setup used by LLAAB, adapted for this starter's `@workspace/*` package scope and the
generated light theme for this repo.

## Target Stack

| Layer      | Choice                                           |
| ---------- | ------------------------------------------------ |
| UI package | `packages/ui` copied from LLAAB and renamed      |
| Components | shadcn components exported as `@workspace/ui/*`  |
| Styling    | Tailwind 4 + `@tailwindcss/vite`                 |
| Theme      | shadcn preset `b7BE9nf27X` light-mode CSS tokens |
| Client CSS | global import from `@workspace/ui/globals.css`   |

## Source References

Primary implementation reference:

- `/Users/justin/LLAAB/packages/ui`
- `/Users/justin/LLAAB/packages/ui/components.json`
- `/Users/justin/LLAAB/apps/client/components.json`
- `/Users/justin/LLAAB/apps/client/src/layouts`

Clean generated reference:

- `/Users/justin/repos-finografic/vite-monorepo/packages/ui`
- `/Users/justin/repos-finografic/vite-monorepo/packages/ui/components.json`
- `/Users/justin/repos-finografic/vite-monorepo/apps/web/components.json`
- `/Users/justin/repos-finografic/vite-monorepo/apps/web/vite.config.ts`

Theme source for this repo:

- `.agents/assets/globals.css`

## Guardrails

- Do not delete `StyleSmokeTest` until Tailwind + shadcn are visibly working in the browser.
- Do not keep both Panda and Tailwind as long-term styling systems.
- Do not keep `@finografic/design-system` once all imports are migrated.
- Do not preserve LLAAB's `@llaab/*` package names; rewrite to `@workspace/*`.
- Prefer copying proven LLAAB patterns, then trimming LLAAB-only components/domains.
- Keep the current DB/Auth.js/Hono/TanStack architecture untouched during this phase.
- Validate after each slice; commit between slices if the diff gets large.

## Phase 07A — Copy UI Package and Config Baseline

### Tasks

- [x] Copy `/Users/justin/LLAAB/packages/ui` to `packages/ui`.
- [x] Remove copied `node_modules`, `.DS_Store`, build artifacts, and LLAAB-only package metadata.
- [x] Rename package from `@llaab/ui` to `@workspace/ui`.
- [x] Rewrite `packages/ui/package.json` exports for `@workspace/ui`.
- [x] Copy/adapt `/Users/justin/LLAAB/packages/ui/components.json`.
- [x] Copy/adapt `/Users/justin/LLAAB/apps/client/components.json` into `apps/client/components.json`.
- [x] Cross-check both copied `components.json` files against the clean generated repo.
- [x] Use `@workspace/ui` aliases from `vite-monorepo`, not LLAAB's `@llaab/ui` aliases.

### Validation

- [x] `pnpm install`
- [x] `pnpm --filter @workspace/ui typecheck`

## Phase 07B — Apply This Repo's Theme

### Tasks

- [x] Copy `.agents/assets/globals.css` into `packages/ui/src/styles/globals.css`.
- [x] Preserve any required shadcn/Tailwind imports already present in LLAAB's globals file.
- [x] Ensure the theme represents shadcn preset `b7BE9nf27X` light mode.
- [x] Confirm `packages/ui` exports `./globals.css`.
- [x] Keep dark-mode tokens only if they are present in the generated theme and do not add extra
      dark-mode work in this phase.

### Validation

- [x] `pnpm --filter @workspace/ui typecheck`

## Phase 07C — Wire Tailwind 4 into the Client

### Tasks

- [x] Add `@tailwindcss/vite` and `tailwindcss` where needed.
- [x] Add `@workspace/ui` as a client dependency.
- [x] Update `apps/client/vite.config.ts` to include the Tailwind Vite plugin.
- [x] Add client TS/Vite aliases for `@workspace/ui/*` if needed.
- [x] Replace Panda CSS imports in `apps/client/src/main.tsx` with `@workspace/ui/globals.css`.
- [x] Keep `apps/client/src/styles/theme.css`, `panda.config.ts`, and `styled-system` aliases until no
      `@styled-system/*` imports remain.
- [x] Verify `StyleSmokeTest` still renders or temporarily leave it harmless until the migration is
      visibly complete.

### Validation

- [x] `pnpm --filter @workspace/client typecheck`
- [x] `pnpm --filter @workspace/client build`

## Phase 07D — Migrate Layouts First

### Tasks

- [x] Review `/Users/justin/LLAAB/apps/client/src/layouts/AGENTS.md`.
- [x] Copy/adapt useful layout primitives from LLAAB:
      `AppLayout`, `PageLayout`, `PageDetail`, `PageList`, and sidebar contexts as needed.
- [x] Decide whether this starter should keep the current simple `layout/` folder or move to
      LLAAB's plural `layouts/` pattern.
- [x] Replace `@styled-system/css` layout styling with class names/Tailwind utilities.
- [x] Replace design-system layout components with `@workspace/ui` components.
- [x] Keep public layout and admin layout behavior unchanged.

### Validation

- [x] `pnpm --filter @workspace/client typecheck`
- [x] `pnpm --filter @workspace/client build`

## Phase 07E — Migrate Pages and Shared Components

### Tasks

- [x] Replace `@finografic/design-system` imports in client pages/components.
- [x] Replace `css({ ... })` usage with Tailwind class names or shadcn component props.
- [x] Migrate `LanguageSwitcher`, `ProtectedRoute`, landing page, login page, dashboard, users, and
      translations pages.
- [x] Use `@workspace/ui/components/button`, `card`, `badge`, `input`, `tabs`, `data-table`, etc.
- [x] Keep auth, i18n, Hono RPC, and TanStack Query behavior unchanged.
- [x] Do not delete `StyleSmokeTest` until this phase is visually verified.

### Validation

- [x] `pnpm --filter @workspace/client typecheck`
- [x] `pnpm --filter @workspace/client build`

## Phase 07F — Remove Panda and Design-System

### Tasks

- [x] Remove all `@styled-system/*` imports.
- [x] Remove `StyleSmokeTest` after Tailwind/shadcn visual verification.
- [x] Remove `apps/client/panda.config.ts`.
- [x] Remove generated `apps/client/styled-system/` if present and ignored.
- [x] Remove `@pandacss/dev`, `@finografic/design-system`, Emotion deps, and Panda scripts.
- [x] Remove Panda aliases from `vite.config.ts` and `tsconfig.json`.
- [x] Remove `apps/client/src/styles/theme.css` if no longer needed.
- [x] Update `apps/client/docs/GUIDE.md`.
- [x] Update `AGENTS.md` learned workspace facts from Panda/design-system to shadcn/Tailwind.

### Validation

- [x] `pnpm typecheck`
- [x] `pnpm build`
- [x] `graphify update .`

## Phase 07G — Visual Smoke and Polish

### Tasks

- [x] Run `pnpm dev`.
- [x] Verify landing page, login, dashboard, admin users, and translations pages in browser.
- [x] Confirm Tailwind styles load without a custom smoke component.
- [x] Confirm Auth.js sign-in/sign-up still works.
- [x] Confirm admin data loading/mutations still work through TanStack Query + Hono RPC.
- [x] Tune spacing/typography only after the mechanical migration is complete.

### Validation

- [x] Browser smoke: landing page
- [x] Browser smoke: login page
- [x] Browser smoke: admin dashboard
- [x] Browser smoke: users table
- [x] Browser smoke: translations editor

## Deferred

- Dark-mode UX beyond copied/generated tokens.
- LLAAB-only AI/provider components.
- Vault-specific layouts, sidebars, routes, or data components.
- New UI design polish beyond parity with the current starter.
