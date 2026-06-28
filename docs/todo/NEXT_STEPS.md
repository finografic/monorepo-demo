# Next Steps — Recommended Implementation Order

> **Context:** Phases 01–05 complete. Auth, env, i18n, admin routes, full client UI, DS integration,
> OpenAPI/Scalar docs, pino logging, error envelope, and rate limiting are all wired up.
> `pnpm build` + `pnpm typecheck` pass cleanly across all packages.

📅 2026-05-27

---

## Phase 4A — Auth Routes + Server Env ✅ DONE

- [x] `apps/server/env.server.ts` — Valibot-validated, merges shared env, builds `COOKIES` object + `COOKIE_DELETE_ATTRIBUTES`
- [x] `apps/server/tsconfig.json` — path aliases: `env.server`, `db`, `db/*`, `lib/*`, `routes/*`, `utils/*`
- [x] `src/lib/auth.ts` — `getAuthConfig()` for `@hono/auth-js`, JWT strategy, role in session
- [x] `src/lib/auth-secret.runtime.ts` — ephemeral secret in dev, stable in prod
- [x] `src/lib/valibot.utils.ts` — `sqliteBooleanField()` helper matching touch-monorepo
- [x] `src/routes/auth/auth.route.ts` — sign-up, clear-all-cookies, `authHandler()`
- [x] `src/app.ts` — `initAuthConfig` middleware wired
- [x] `.env.development` / `.env.example` — updated with auth + cookie fields
- [x] `data/*.sqlite.db` already covered by `.gitignore`

---

## Phase 4B — i18n Tables + Routes ✅ DONE

- [x] `src/db/schemas/supported-languages.schema.ts`
- [x] `src/db/schemas/translations-ui.schema.ts`
- [x] `src/db/schemas/translations-app.schema.ts`
- [x] `src/db/schemas/translations-admin.schema.ts`
- [x] `src/routes/i18n/i18n.route.ts`
  - `GET /api/i18n/:namespace?lng=` — bulk domain-grouped load for i18next
  - `GET /api/i18n/translations/:domain?lng=` — single domain array for CMS
- [x] Seed: `supported-languages` (en-GB default + es-ES)
- [x] Seed: `translations-ui` (22 entries), `translations-app` (12), `translations-admin` (19)
- [x] `src/db/seed.ts` — orchestrated, idempotent, picocolors output

---

## Phase 4C — Client i18n Integration ✅ DONE

- [x] `src/i18n/i18n.config.ts` — HTTP backend `/api/i18n/translations?lng=`, localStorage detection
- [x] `src/i18n/i18n.constants.ts` — `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE`, `LOCALE_MAPPING`
- [x] `I18nextProvider` added to `main.tsx`
- [x] `src/components/LanguageSwitcher/LanguageSwitcher.tsx` — en-GB / es-ES toggle with DS tokens

---

## Phase 4D — Client Pages + Admin Dashboard ✅ DONE

### Server

- [x] `src/lib/require-auth.ts` — `requireAuth()` using `verifyAuth()` from `@hono/auth-js`
- [x] `src/lib/require-role.ts` — `requireRole('admin')` checks session role via `getAuthUser(c)`
- [x] `src/routes/users/users.route.ts` — `GET /api/users` (admin), `PATCH`, `DELETE`
- [x] `src/routes/translations/translations.route.ts` — `PATCH /api/translations/:domain/:id` (admin)

### Client

- [x] `src/lib/auth-client.ts` — CSRF-aware sign-in/sign-up/sign-out (opaqueredirect pattern)
- [x] `src/context/AuthContext.tsx` — `AuthProvider` + `useAuth()`, useMemo value, visibilitychange refresh
- [x] `src/components/ProtectedRoute.tsx` — role-aware guard with Spinner fallback
- [x] `src/layout/AdminLayout.tsx` — sidebar nav + topbar (AvatarDS, sign-out)
- [x] `src/layout/Layout.tsx` — updated header with auth state, role badge, language switcher
- [x] `src/pages/LoginPage.tsx` — sign-in / sign-up toggle with DS Card + Button
- [x] `src/pages/LandingPage.tsx` — hero + feature grid redesign (DS Badge, Card)
- [x] `src/pages/admin/AdminDashboardPage.tsx` — stat cards
- [x] `src/pages/admin/AdminUsersPage.tsx` — DataTable with inline role editing
- [x] `src/pages/admin/AdminTranslationsPage.tsx` — TabsDS with per-domain inline editor
- [x] `src/pages/admin/AdminSettingsPage.tsx` — placeholder

---

## Phase 4E — Design System Integration ✅ DONE

### Why

The starter doubles as a portfolio piece — design-system usage must be visible and polished.

### Source

`/Users/justin/repos-finografic/cv-justin-rankin` — superior Panda CSS + design-system Vite config.

### Tasks

- [x] Verify `apps/client/vite.config.ts` matches cv-justin-rankin's Panda CSS setup
- [x] Verify `panda.config.ts` in `apps/client` uses `@finografic/design-system` preset correctly
- [x] Landing page uses DS tokens: `color.brand.*`, spacing, typography scale
- [x] Admin dashboard uses DS components: `Card`, `Button`, `Badge`, `Table`, `Input`, `Select`
- [x] Ensure DS peer dependencies (`react`, `react-dom`) match client versions
- [x] `pnpm build` end-to-end — Panda CSS generates, DS components render in build

---

## Phase 4F — Polish + Validation

### Tasks

- [ ] Full `pnpm install && pnpm build && pnpm dev` validation from clean state
- [ ] End-to-end flow: landing → login → dashboard → users table → translations editor
- [ ] Sign-up flow on `/login` page (toggle form mode)
- [ ] `clear-all-cookies` endpoint tested (useful for debugging)
- [ ] Auth cookie name confirms `monorepo-demo.session_token` in DevTools
- [ ] i18n language switch persists across page refresh (browser language detector)
- [x] Typecheck: `pnpm typecheck` passes across all packages
- [ ] Update `ROADMAP.md` Done table

---

## Phase 5 — Observability + Developer Experience ✅ DONE

Elevates this from "functional starter" to "reference implementation worth showing in a portfolio."

### Tasks

- [x] **OpenAPI / Scalar** — `hono-openapi` + `@scalar/hono-api-reference`; all endpoints annotated with `describeRoute`; interactive docs at `/api/reference`
- [x] **Request logging** — `hono-pino` with picocolors dev destination (no thread-stream); wired into `create-app.ts` via `AppBindings`
- [x] **Error shape** — `{ error, message }` envelope on all routes; `notFound` and `onError` updated
- [x] **Rate limiting** — in-memory rate limiter (no extra deps); 5 req/min on sign-up, 10 req/min on sign-in

---

## Phase 6 — Testing

- [ ] Vitest unit tests for `password.utils.ts` (hash + verify)
- [ ] Vitest unit tests for i18n `buildDomainGroupedResources` logic
- [ ] Vitest integration tests for auth routes (`sign-up`, `sign-in`, `signout`)
- [ ] Vitest integration tests for i18n routes (`GET /api/i18n/translations`)
- [ ] CI workflow (`ci.yml`) — install + typecheck + build + test on push/PR

---

## Phase 7 — Optional Enhancements

These are natural extensions once the starter is stable and demonstrated.

- [ ] **React Query** (`@tanstack/react-query`) for client data fetching in admin
- [ ] **Optimistic updates** in translations editor (shows off React Query mutation pattern)
- [ ] **`packages/shared`** — extract shared DTOs (user, translation) if they emerge during CMS
- [ ] **Dark mode** — design-system token switch, persisted in localStorage
- [ ] **Email verification** — extend auth flow with a verification token table + email send
- [ ] **OAuth provider** — add GitHub or Google provider to Auth.js config as a demo

---

## Key Principles

1. **Server first, client second** — routes/schemas must exist before UI can consume them.
2. **Design-system as portfolio** — use DS components on landing page and admin to showcase the system.
3. **Follow source patterns** — match touch-monorepo's route/handler/schema structure exactly.
4. **Starter-grade, not production** — auth is real but minimal; CMS is functional but not feature-complete.
5. **Small batches with cleanup** — commit checkpoint after each sub-phase.
6. **Demo-worthy UX** — every page should look intentional; this is a portfolio piece, not a boilerplate dump.
