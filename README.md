# @finografic/monorepo-demo

> Portfolio monorepo demo with protected React/Vite apps for AI markdown streaming, Queensland TMR data
> visualisation, and dependency scan tooling, backed by a Hono/Auth.js API.

This repo is a TypeScript-first portfolio project showing frontend engineering patterns across multiple small apps:
accessible UI, protected routes, streaming AI output, transport data visualisation, terminal-style tooling, and
production-minded API/auth boundaries.

The AWS-hosted demo runs the static Vite apps through CloudFront/S3, with authenticated API features served by the
Hono API on EC2 backed by RDS PostgreSQL.

---

## Stack at a Glance

| Layer         | Technology                                                        |
| :------------ | :---------------------------------------------------------------- |
| Workspace     | pnpm workspaces + Moon                                            |
| Client        | Vite 8, React 19, React Router v7                                 |
| Styling       | Tailwind 4 + shadcn components in `@workspace/ui`                 |
| i18n          | i18next + i18next-http-backend + react-i18next                    |
| Server        | Hono, `@hono/node-server`                                         |
| Database      | Drizzle ORM, PostgreSQL locally and on AWS/RDS                    |
| Auth          | Auth.js (`@auth/core` + `@hono/auth-js`)                          |
| API docs      | hono-openapi + Scalar UI (`@scalar/hono-api-reference`)           |
| Logging       | Pino (via `hono-pino`)                                            |
| Env config    | Valibot-validated env, auto-resolved dotenv (`@workspace/config`) |
| Build         | tsdown (server), Vite apps, tsc project references                |
| Lint & format | oxlint, oxfmt (Rust-based, fast)                                  |
| Git hooks     | Husky + lint-staged + commitlint                                  |
| Testing       | Vitest                                                            |
| Deps          | syncpack (cross-workspace version alignment)                      |

---

## Portfolio Demos

### AI Markdown Pipeline

LLM-powered markdown workspace generating Queensland TMR-informed content with live streaming, fixture replay,
Mermaid diagrams, Shiki code highlighting, and RAG-style service guidance.

Highlights:

- Streaming Server-Sent Events UI
- Raw markdown and rendered output modes
- Mermaid diagrams, markdown tables, and syntax-highlighted code blocks
- Fixture mode for static hosting and live mode for authenticated API use

### Transport Data Dashboard

Accessible Queensland TMR dashboard with interactive charts, keyboard-friendly views, source links, and live Open Data
catalogue integration.

Highlights:

- Recharts and D3 visualisations
- WCAG-minded chart navigation and keyboard support
- Mock transport datasets plus live Queensland Open Data views
- Source links and transport-domain framing for portfolio review

### Dependency Scan Terminal

Browser-based security scan console for running dependency checks against GitHub repositories, with terminal streaming
and structured summaries.

Highlights:

- xterm.js terminal UI
- Server-side scan execution bridge
- Streaming scan output
- Dependency security summaries for public GitHub repositories

## Apps

### `apps/client` — Landing, Auth, and Shell

React SPA served by Vite on port **3000** in development. It hosts the portfolio landing page, Auth.js login flow,
protected dashboard routes, and links to the three demo apps.

Demo apps require a session in the UI and redirect unauthenticated visitors to `/login` with the attempted demo URL
preserved. Static GitHub Pages assets are not private; API endpoints enforce the real protection server-side.

### `apps/demo-ai-pipeline`

Vite app served on port **3001** locally and published under `/demo-ai-pipeline/` on GitHub Pages.

### `apps/demo-datavis`

Vite app served on port **3002** locally and published under `/demo-datavis/` on GitHub Pages.

### `apps/demo-xscan`

Vite app served on port **3003** locally and published under `/demo-xscan/` on GitHub Pages. Local development uses a
Vite middleware endpoint for `/api/scan`; hosted scan execution should run through a Node service.

### `apps/server` — Hono API

Hono application served by `@hono/node-server`. Built with `tsdown` for production.

**API routes (all under `/api`):**

| Route                      | Description                              |
| :------------------------- | :--------------------------------------- |
| `GET  /api/health`         | Liveness / readiness probe               |
| `POST /api/auth/sign-up`   | Create a new account                     |
| `POST /api/auth/sign-in`   | Authenticate and receive a session       |
| `POST /api/auth/sign-out`  | End the current session                  |
| `GET  /api/i18n/languages` | List supported languages                 |
| `GET  /api/i18n/:lang`     | Fetch translation strings for a language |
| `POST /api/stream/live`    | Authenticated AI Pipeline live stream    |
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
monorepo-demo/
├── apps/
│   ├── client/          # Landing page, login, and app shell
│   ├── demo-ai-pipeline/
│   ├── demo-datavis/
│   ├── demo-xscan/
│   └── server/          # Hono API server
├── packages/
│   ├── shared/          # Shared demo layout and models
│   └── ui/              # shadcn/Tailwind components and globals
├── config/              # @workspace/config — env + paths
├── docs/
│   ├── process/
│   └── todo/
├── .github/
│   ├── instructions/
│   └── workflows/
├── pnpm-workspace.yaml
└── package.json
```

---

## Getting Started

**Requirements:** Node 24.16.x, pnpm ≥ 10.20.0, Docker for local PostgreSQL experiments

```bash
# Install dependencies
pnpm install

# Copy and populate environment files
cp apps/server/.env.example apps/server/.env

# Start the main client and API against local PostgreSQL
pnpm dev:postgres

# Start the main client, API, and all demo apps against local PostgreSQL
pnpm dev:all:postgres
```

Default local ports:

| App                      | URL                                         |
| ------------------------ | ------------------------------------------- |
| Landing page             | `http://localhost:3000`                     |
| AI Markdown Pipeline     | `http://localhost:3001`                     |
| Transport Data Dashboard | `http://localhost:3002`                     |
| Dependency Scan Terminal | `http://localhost:3003`                     |
| API reference            | `http://localhost:<API_PORT>/api/reference` |

### Local PostgreSQL

PostgreSQL is the only database runtime. Local development uses the Docker Compose helper.

```bash
pnpm db:up
pnpm db:setup
pnpm db:psql
pnpm db:down
```

Connection string for the local container:

```bash
DATABASE_URL=postgresql://monorepo_demo:monorepo_demo@localhost:5433/monorepo_demo
```

The Drizzle config points at the PostgreSQL schema:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

These commands use the PostgreSQL schema files in `apps/server/src/db/schemas`.

## Deployment

The canonical AWS deployment target is CloudFront/S3 for static Vite apps, EC2 for the Hono/Auth.js API, and RDS
PostgreSQL for relational data. See [AWS Deployment Guide](/docs/process/AWS_DEPLOYMENT_GUIDE.md).

---

## Scripts

All root scripts delegate to Moon and run across all workspaces in dependency order.

| Script               | Description                                         |
| :------------------- | :-------------------------------------------------- |
| `pnpm dev`           | Start local PostgreSQL, then main client + API      |
| `pnpm dev:all`       | Start local PostgreSQL, then client, API, and demos |
| `pnpm build`         | Build all packages and apps                         |
| `pnpm typecheck`     | Run `tsc --noEmit` across all workspaces            |
| `pnpm lint`          | oxlint across all workspaces                        |
| `pnpm lint:fix`      | oxlint with auto-fix                                |
| `pnpm lint:ci`       | oxlint quiet mode (for CI pipelines)                |
| `pnpm lint:md`       | Markdown linting                                    |
| `pnpm format:check`  | oxfmt dry-run check                                 |
| `pnpm format:fix`    | oxfmt in-place formatting                           |
| `pnpm test`          | Vitest across all workspaces                        |
| `pnpm clean`         | Delete all build artefacts                          |
| `pnpm db:up`         | Start local PostgreSQL in Docker                    |
| `pnpm db:setup`      | Start, migrate, and seed local PostgreSQL           |
| `pnpm db:reset`      | Drop local PostgreSQL volume, then setup DB         |
| `pnpm db:psql`       | Open `psql` in the local PostgreSQL DB              |
| `pnpm db:studio`     | Open Drizzle Studio for local PostgreSQL            |
| `pnpm db:down`       | Stop local PostgreSQL                               |
| `pnpm syncpack:lint` | Check for cross-workspace version drift             |
| `pnpm syncpack:fix`  | Fix mismatched dependency versions                  |

---

## AWS Scripts

Frontend deploy:

```
pnpm aws:frontend:build       # local build + assemble pages/
pnpm aws:frontend:sync        # upload pages/ to S3
pnpm aws:frontend:invalidate  # invalidate CloudFront
pnpm aws:frontend:deploy      # build + sync + invalidate
```

Infrastructure and EC2 helpers:

```bash
pnpm aws:infra:outputs        # show Terraform outputs
pnpm aws:infra:plan           # create infra/terraform/environments/demo/tfplan
pnpm aws:infra:apply          # apply infra/terraform/environments/demo/tfplan
pnpm aws:ec2:docker:build     # build EC2 API image locally
pnpm aws:ec2:docker:run       # run EC2 API image locally with .env.ec2-api.local
```

---

## License

MIT — see [LICENSE](LICENSE).
