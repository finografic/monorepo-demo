# I18n — JSON Source of Truth, DB Seeding & Demo Content

> Scope: `packages/i18n/`, `apps/server` (schemas, seeds, routes), `apps/client`, `apps/demo-*`
>
> **Reference implementation:** `/Users/justin/repos-finografic/touch-monorepo/packages/i18n`
>
> **Completion legend:** `[ ]` to-do · `[x]` done · `[-]` deferred
>
> **Commit policy:** create one focused git commit after completing each phase below.

---

## Background

The portfolio landing page currently mixes three translation sources:

| Source                                       | Example                             | Problem                                                    |
| -------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| DB-backed `t(...)` keys                      | `app.title`, `ui.nav.home`          | Partial es-ES coverage; autodetection can activate Spanish |
| Inline `t(..., 'English fallback')` defaults | Feature cards, buttons              | Fallbacks mask missing keys; not editable in admin CMS     |
| Hardcoded JSX strings                        | Portfolio Demos section, demo cards | Never translated; always English                           |

`i18next-browser-languagedetector` is configured with `order: ['localStorage', 'navigator']` and
caches to `localStorage.i18nextLng`. A prior `es-ES` selection persists across sessions and
overrides navigator language — this is why Spanish can appear even when based in Australia.

`fallbackLng` and the DB default language are both **`en-GB`**. Catalan (`ca-ES`) is intentionally
**omitted** from this repo (touch-monorepo includes it; monorepo-demo does not).

### Interim override (2026-07-01)

Until this plan ships, the landing route forces `en-GB` in `Layout.tsx` and `LandingPage.tsx` via
`useTranslation(undefined, { lng: DEFAULT_LANGUAGE })`. This is a **route-scoped override**, not a
global detection fix. Remove it in Phase E.

---

## Target architecture

```
packages/i18n/translations/
├── ui/           → translations_ui      (navbar, buttons, forms — canonical monorepo chrome)
├── app/          → translations_app     (client shell — landing, login, dashboard)
├── admin/        → translations_admin   (admin CMS chrome)
└── content/      → translations_content (portfolio demos — transient / demo-specific copy)
    ├── en-GB.json
    └── es-ES.json
```

- **Single source of truth:** nested JSON files in `packages/i18n/translations/`.
- **DB tables** are populated at seed time from those JSON files (not hand-authored in `*.seed.ts`).
- **`app` + `admin` + `ui`** remain the canonical monorepo structure tables.
- **`translations_content`** is a new table for demo/portfolio copy shared by `apps/demo-ai-pipeline`,
  `apps/demo-datavis`, and `apps/demo-xscan`.

---

## Phase A — Scaffold `packages/i18n`

Mirror the touch-monorepo package shape (trimmed — no `ca-ES`):

- [ ] Create `packages/i18n/package.json` as `@workspace/i18n` (see touch-monorepo exports map)
- [ ] Add `tsconfig.json`, `tsdown.config.ts`, build scripts
- [ ] Add `translations/ui/en-GB.json`, `translations/ui/es-ES.json`
- [ ] Add `translations/app/en-GB.json`, `translations/app/es-ES.json`
- [ ] Add `translations/admin/en-GB.json`, `translations/admin/es-ES.json`
- [ ] Add `translations/content/en-GB.json`, `translations/content/es-ES.json` (initially `{}` or stubs)
- [ ] Add `translations/index.ts` barrel exporting locale bundles
- [ ] Add `src/constants/app-locales.constants.ts` — `DEFAULT_LANGUAGE = 'en-GB'`, `SUPPORTED_LANGUAGES = ['en-GB', 'es-ES']`
- [ ] Add `src/utils/flatten-translations.ts` (or reuse touch-monorepo pattern)
- [ ] Wire `packages/i18n` into `pnpm-workspace.yaml` if not already covered by `packages/*`
- [ ] Add root scripts: `i18n:update`, `i18n:force` (orchestrate build + client refresh)
- [ ] **Commit:** `feat(i18n): scaffold @workspace/i18n package`

**Reference files:**

- `touch-monorepo/packages/i18n/package.json`
- `touch-monorepo/packages/i18n/translations/`
- `touch-monorepo/packages/i18n/README.i18n-workflow.md`

---

## Phase B — Populate JSON from existing inline / seed content

Migrate all known strings into JSON. Start from current seed files and inline JSX defaults.

### B1 — `ui` domain

- [ ] Port keys from `apps/server/src/db/seeds/translations_ui.seed.ts` into `packages/i18n/translations/ui/*.json`
- [ ] Audit `apps/client/src/layout/Layout.tsx`, `LoginPage.tsx`, `AdminLayout.tsx` for missing keys
- [ ] Remove hand-authored rows from `translations_ui.seed.ts` (replace with flatten import)

### B2 — `app` domain

- [ ] Port keys from `apps/server/src/db/seeds/translations_app.seed.ts`
- [ ] Extract landing page inline defaults from `apps/client/src/pages/LandingPage.tsx`:
  - Hero badge, title, subtitle
  - Feature card titles/descriptions (`app.features.*`)
  - Portfolio Demos heading + subtitle
  - Demo card titles, descriptions, tags, CTA labels (`content.demo.*` — see Phase C)
- [ ] Audit `DashboardPage.tsx` for hardcoded strings

### B3 — `admin` domain

- [ ] Port keys from `apps/server/src/db/seeds/translations_admin.seed.ts`
- [ ] Audit `apps/client/src/pages/admin/*` for hardcoded labels

### B4 — `content` domain (initial inventory)

Populate `packages/i18n/translations/content/*.json` from inline demo + landing copy:

| Area               | Source file(s)                                             | Notes                                        |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------- |
| Landing demo cards | `apps/client/src/pages/LandingPage.tsx` (`DEMOS` constant) | Move to `content.demo.*` keys                |
| AI pipeline UI     | `apps/demo-ai-pipeline/src/**/*.tsx`                       | Prompt labels, metrics, toggles, status text |
| Datavis UI         | `apps/demo-datavis/src/**/*.tsx`                           | Chart titles, nav, dataset labels            |
| Xscan UI           | `apps/demo-xscan/src/**/*.tsx`                             | Repo selector, terminal chrome, summaries    |

- [ ] Inventory and list all hardcoded user-facing strings per demo app (append checklist rows here as found)
- [ ] Fill `content/en-GB.json` completely from inventory
- [ ] Add `es-ES.json` stubs (empty string or copy en-GB where translation not yet available)
- [ ] **Commit:** `feat(i18n): populate translation JSON from existing copy`

---

## Phase C — `translations_content` table

New DB domain for portfolio/demo copy, separate from canonical `app` / `admin` / `ui`.

- [ ] Add `apps/server/src/db/schemas/translations-content.schema.ts`
- [ ] Export from `apps/server/src/db/schemas/index.ts`
- [ ] Generate Drizzle migration
- [ ] Add `apps/server/src/db/seeds/translations_content.seed.ts` using `flattenTranslationsForSeed('content')`
- [ ] Register in `config/db-setup.config.ts` (after `supported_languages`)
- [ ] Extend `I18N_TRANSLATION_DOMAINS` / types to include `content` where appropriate

**Schema shape:** match existing `translations_app` pattern (`key`, `translations` JSON, `isActive`).

---

## Phase D — Server routes & seed pipeline

- [ ] Add `apps/server/src/db/seeds/utils/flatten-translations.ts` (import from `@workspace/i18n/translations`)
- [ ] Rewrite `translations_ui.seed.ts` → flatten from `packages/i18n` (see touch-monorepo pattern)
- [ ] Rewrite `translations_app.seed.ts` → flatten from `packages/i18n`
- [ ] Rewrite `translations_admin.seed.ts` → flatten from `packages/i18n`
- [ ] Implement `translations_content.seed.ts`
- [ ] Update `apps/server/src/routes/i18n/i18n.routes.ts`:
  - Include `translations_content` in bundle response
  - Add `content` to `domainTranslations` switch
- [ ] Update `apps/server/src/routes/translations/translations.routes.ts` for admin CRUD on `content` domain (if admin CMS should edit demo copy)
- [ ] Add `@workspace/i18n` dependency to `apps/server/package.json`
- [ ] Verify `pnpm db:reset` seeds all five tables from JSON
- [ ] **Commit:** `feat(server): seed translations from @workspace/i18n JSON`

**Reference seeds:**

- `touch-monorepo/apps/server/src/db/seeds/translations_app.seed.ts`
- `touch-monorepo/apps/server/src/db/seeds/utils/flatten-translations.ts`

---

## Phase E — Client (`apps/client`)

- [ ] Add `@workspace/i18n` dependency; align `i18n.constants.ts` with package constants
- [ ] Update `apps/client/src/i18n/i18n.config.ts` if namespace / domain loading changes
- [ ] Replace all inline English defaults in `LandingPage.tsx` with typed keys (no string fallbacks in JSX)
- [ ] Replace hardcoded Portfolio Demos section with `t('content.demo.*')` keys
- [ ] Update `LoginPage.tsx`, `DashboardPage.tsx`, admin pages to use keys only
- [ ] Re-enable `LanguageSwitcher` in `Layout.tsx` once es-ES coverage is complete (or gate behind env flag)
- [ ] **Remove** landing-route `en-GB` override from `Layout.tsx` and `LandingPage.tsx` (TEMP comments)
- [ ] Run `pnpm i18n:force` + smoke test both locales on landing, login, dashboard, admin
- [ ] **Commit:** `feat(client): wire landing and shell to @workspace/i18n keys`

---

## Phase F — Demo apps (`apps/demo-*`)

Each demo app should load `content` translations from the same API backend (or a shared i18n init helper).

- [ ] Extract shared i18n bootstrap (optional `packages/i18n` browser entry or thin `apps/client` re-export) for demo apps
- [ ] `apps/demo-ai-pipeline` — replace inline strings with `content.aiPipeline.*` keys
- [ ] `apps/demo-datavis` — replace inline strings with `content.datavis.*` keys
- [ ] `apps/demo-xscan` — replace inline strings with `content.xscan.*` keys
- [ ] Confirm demos work on GitHub Pages base paths with `VITE_*_URL` unset (static copy only; no API required for read-only labels if bundled)
- [ ] Decide: demos fetch `/api/i18n` live vs bundle JSON at build time for static Pages deploy
- [ ] **Commit per demo** (or one commit if small): `feat(demo-*): use translations_content keys`

---

## Phase G — Admin CMS & docs (optional follow-up)

- [ ] Extend `AdminTranslationsPage` with `content` domain tab
- [ ] Document workflow in `packages/i18n/README.md` (adapt touch-monorepo `README.i18n-workflow.md`)
- [ ] Update `docs/todo/ROADMAP.md` — move this doc to `DONE_I18N.md` when all phases complete
- [ ] **Commit:** `docs(i18n): add translation workflow README`

---

## Verification checklist

- [ ] `pnpm db:reset` — all translation tables populated from JSON only
- [ ] Fresh browser profile — landing shows consistent language (no mixed es-EN)
- [ ] `localStorage.i18nextLng = 'es-ES'` — all keyed strings render Spanish (no English fallbacks leaking)
- [ ] Admin translations editor can patch `ui`, `app`, `admin`, `content` rows
- [ ] All three demo apps display localized labels when locale switched
- [ ] No hand-authored translation strings remain in `*.seed.ts` files

---

## Non-goals

- Catalan (`ca-ES`) locale support
- Translating LLM-generated markdown output in demo-ai-pipeline
- Runtime machine translation — all copy is author-maintained JSON
