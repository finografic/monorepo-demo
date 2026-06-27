# @finografic/monorepo-starter

> A selective-extraction, full-stack pnpm monorepo starter — pick what you need, delete the rest.

Built as a reference implementation and portfolio demo for a modern TypeScript monorepo with a production-quality
toolchain. Everything is pre-wired: auth, routing, i18n, database, design tokens, OpenAPI docs, structured logging,
and CI-ready linting — all in a single repository you can clone and carve up.

---

## Stack at a Glance

| Layer         | Technology                                                        |
| :------------ | :---------------------------------------------------------------- |
| Workspace     | pnpm workspaces + Turborepo                                       |
| Client        | Vite 8, React 19, React Router v7                                 |
| Styling       | Tailwind 4 + shadcn components in `@workspace/ui`                 |
| i18n          | i18next + i18next-http-backend + react-i18next                    |
| Server        | Hono, `@hono/node-server`                                         |
| Database      | Drizzle ORM, better-sqlite3                                       |
| Auth          | Auth.js (`@auth/core` + `@hono/auth-js`)                          |
| API docs      | hono-openapi + Scalar UI (`@scalar/hono-api-reference`)           |
| Logging       | Pino (via `hono-pino`)                                            |
| Env config    | Valibot-validated env, auto-resolved dotenv (`@workspace/config`) |
| Build         | tsdown (server), Vite (client), tsc project references            |
| Lint & format | oxlint, oxfmt (Rust-based, fast)                                  |
| Git hooks     | Husky + lint-staged + commitlint                                  |
| Testing       | Vitest                                                            |
| Deps          | syncpack (cross-workspace version alignment)                      |

---

## Apps

### `apps/client` — Vite 8 + React 19

React SPA served by Vite on port **3000** in development. All `/api` requests are proxied to the server.

**Routes:**

| Path                  | Access | Description                  |
| :-------------------- | :----- | :--------------------------- |
| `/`                   | Public | Landing page                 |
| `/login`              | Public | Auth.js sign-in form         |
| `/dashboard`          | Auth   | Authenticated user dashboard |
| `/admin`              | Admin  | Admin area root              |
| `/admin/users`        | Admin  | User management              |
| `/admin/translations` | Admin  | Translation CMS              |
| `/admin/settings`     | Admin  | Admin settings               |

Access control is enforced client-side by `ProtectedRoute`, which accepts an optional `requiredRole` prop. The
server independently enforces the same roles on every API route.

**Notable features:**

- Language switcher component — calls the server i18n endpoint and stores the preference
- shadcn components sourced from `packages/ui` and consumed as `@workspace/ui/*`
- Tailwind 4 tokens and generated shadcn theme from `@workspace/ui/globals.css`

### `apps/server` — Hono API

Hono application served by `@hono/node-server` on port **4000** in development. Built with `tsdown` for production.

**API routes (all under `/api`):**

| Route                      | Description                              |
| :------------------------- | :--------------------------------------- |
| `GET  /api/health`         | Liveness / readiness probe               |
| `POST /api/auth/sign-up`   | Create a new account                     |
| `POST /api/auth/sign-in`   | Authenticate and receive a session       |
| `POST /api/auth/sign-out`  | End the current session                  |
| `GET  /api/i18n/languages` | List supported languages                 |
| `GET  /api/i18n/:lang`     | Fetch translation strings for a language |
| `GET  /api/users`          | List users (admin)                       |
| `GET  /api/translations`   | List all translation keys (admin)        |
| `GET  /api/doc`            | OpenAPI 3.1 JSON spec                    |
| `GET  /api/reference`      | Scalar interactive API explorer          |

**Notable features:**

- Pino structured logging on every request via `hono-pino` middleware
- Global error handler returns consistent `{ error, message }` JSON on every failure
- Auth middleware (`initAuthConfig`) applied globally — routes opt in to session checks
- OpenAPI spec generated from route definitions via `hono-openapi`; browsable via Scalar UI at `/api/reference`

---

## Shared Packages

### `config` — `@workspace/config`

Centralised environment configuration shared by both apps.

- Validates all environment variables with **Valibot** schemas at startup — hard fails on missing or malformed values
- Uses `dotenv` with automatic root-directory discovery (walks up from `process.cwd()` until it finds `.env`)
- Exports `env`, `paths`, and workspace root utilities
- Zero runtime surprises: type-safe env access throughout the stack

---

## Project Structure

```
monorepo-starter/
├── apps/
│   ├── client/          # Vite 7 + React 19 SPA
│   └── server/          # Hono API server
├── config/              # @workspace/config — env + paths
├── docs/
│   └── todo/            # ROADMAP.md, NEXT_STEPS.md
├── .github/
│   └── instructions/    # Shared AI-assistant coding rules
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Getting Started

**Requirements:** Node ≥ 22.17.1, pnpm ≥ 10.20.0

```bash
# Install dependencies
pnpm install

# Copy and populate environment files
cp apps/server/.env.example apps/server/.env

# Start all apps in watch mode
pnpm dev
```

The client dev server starts on `http://localhost:3000`.
The API server starts on `http://localhost:4000`.
The Scalar API explorer is available at `http://localhost:4000/api/reference`.

---

## Scripts

All root scripts delegate to Turborepo and run across all workspaces in dependency order.

| Script               | Description                              |
| :------------------- | :--------------------------------------- |
| `pnpm dev`           | Start all apps in parallel watch mode    |
| `pnpm build`         | Build all packages and apps              |
| `pnpm typecheck`     | Run `tsc --noEmit` across all workspaces |
| `pnpm lint`          | oxlint across all workspaces             |
| `pnpm lint:fix`      | oxlint with auto-fix                     |
| `pnpm lint:ci`       | oxlint quiet mode (for CI pipelines)     |
| `pnpm lint:md`       | Markdown linting                         |
| `pnpm format:check`  | oxfmt dry-run check                      |
| `pnpm format:fix`    | oxfmt in-place formatting                |
| `pnpm test`          | Vitest across all workspaces             |
| `pnpm clean`         | Delete all build artefacts               |
| `pnpm syncpack:lint` | Check for cross-workspace version drift  |
| `pnpm syncpack:fix`  | Fix mismatched dependency versions       |

---

## Selective Extraction

This repo is designed to be carved up, not cloned wholesale. Each concern is isolated so you can:

- **Keep the full stack** — clone and extend in place
- **Extract just the server** — copy `apps/server` + `config`; the Valibot env layer and Hono patterns are self-contained
- **Extract just the client** — copy `apps/client` + `packages/ui`; swap the shadcn theme tokens for your own brand
- **Use the toolchain only** — lift `turbo.json`, the oxlint/oxfmt config, and the Husky setup into an existing repo

Internal packages use the `@workspace/*` scope. External published dependencies use real npm scopes.

---

## License

MIT — see [LICENSE](LICENSE).
