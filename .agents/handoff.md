# monorepo-starter — Handoff

## Project

`@finografic/monorepo-starter` — Full-stack TypeScript monorepo starter built as a portfolio and GitHub demo piece.
Extracted selectively from `/Users/justin/repos-finografic/touch-monorepo`.

**Phase status:** Phases 01–07 complete. Phase 08 (testing + CI) is the original next step,
but the current focus has shifted to **completing the AI Markdown Pipeline demo**
(`apps/demo-ai-pipeline`).

---

## Architecture

```
monorepo-starter/
├── apps/
│   ├── client/              Vite 8 + React 19 + React Router v7 + shadcn/Tailwind 4
│   ├── server/              Hono + @hono/node-server + Drizzle ORM + Auth.js
│   ├── demo-ai-pipeline/    AI streaming markdown demo (Vite + React, standalone)
│   ├── demo-datavis/        Placeholder stub (no build step)
│   └── demo-ecosystem/      Placeholder stub (no build step)
├── config/                  @workspace/config — Valibot env + dotenv + workspace paths
├── packages/
│   └── ui/                  @workspace/ui — owned shadcn components + Tailwind 4 globals
└── pnpm-workspace.yaml      declares config, packages/*, apps/*
```

**Client** (`apps/client`) — port 3000, proxies `/api` → server
**Server** (`apps/server`) — port 4000, serves `/api/*`
**Config** (`config/`) — shared env schema, root-dir discovery, workspace paths
**UI** (`packages/ui`) — shadcn source components exported as `@workspace/ui/*`

---

## Stack

| Layer          | Technology                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| Runtime        | Node.js 24.16.0, pnpm, Moon (task runner)                                  |
| Server         | Hono, @hono/node-server, @hono/auth-js, hono-openapi                       |
| Database       | better-sqlite3, Drizzle ORM, drizzle-valibot                               |
| Auth           | @auth/core (Auth.js), JWT, credentials provider                            |
| Validation     | Valibot (server + client)                                                  |
| Client         | React 19, React Router v7, react-i18next                                   |
| Styling        | shadcn/Tailwind 4 (migrated from Panda CSS in Phase 07)                    |
| UI package     | `packages/ui` — owned shadcn source components                             |
| AI demo        | openai SDK (OpenAI-compatible), SSE streaming, Mermaid v11, react-markdown |
| Build (server) | tsdown (rolldown)                                                          |
| Build (client) | Vite 8                                                                     |
| Lint           | oxlint (root + per-app configs via `@finografic/oxc-config`)               |

---

## Phase 07 — shadcn/Tailwind Migration (complete)

`apps/client` and `packages/ui` were migrated from Panda CSS + `@finografic/design-system` to shadcn + Tailwind 4.

- `packages/ui` now holds owned shadcn source components (Button, Card, Input, etc.) + CSS globals
- Exported as `@workspace/ui/*` — consumed by `apps/client`
- `apps/client` imports components and uses Tailwind 4 utility classes directly
- `@finografic/design-system` and Panda CSS fully removed

---

## AI Markdown Pipeline Demo (`apps/demo-ai-pipeline`)

A self-contained Vite + React app demonstrating real-time AI output via SSE streaming,
rendered as rich markdown with Mermaid diagrams and syntax-highlighted code blocks.

### How it works

1. User selects one of 5 prompt cards in the left panel
2. Clicks **Generate** — triggers `GET /api/stream/fixture/{promptId}` (fixture mode) or `POST /api/stream/live` (live mode)
3. Server streams SSE events: `{ type: 'chunk', content: '...' }` then `{ type: 'done', metrics: MetricsData }`
4. Right panel renders markdown progressively as chunks arrive
5. MetricsBar shows tokens, TTFT, total time, model, and provider badge on completion

### Fixture mode (default)

- 5 JSON fixture files in `apps/demo-ai-pipeline/src/fixtures/` — each ~2000 chars of markdown
- Server splits content into ~12-char chunks with 280ms first-chunk delay, 30–55ms between
- No API cost; reliable for public demo — **keep this as the default**

### Live mode (LM Studio / OpenCode Go)

- Toggle via `Fixture | Live` pill in the UI
- Server picks provider via `LLM_MODE` env var: `local` → LM Studio, `hosted` → OpenCode Go
- Both use the same `openai` SDK via `baseURL` switching (`apps/server/src/lib/ai-provider.ts`)
- `.env.development` has all keys; `OPENCODE_API_KEY` must never have `VITE_` prefix

**Provider config (`.env.development`):**

```
LLM_MODE=local
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_MODEL=google/gemma-4-26b-a4b
OPENCODE_BASE_URL=https://opencode.ai/zen/go/v1
OPENCODE_API_KEY=<secret>
OPENCODE_MODEL=glm-5.2
```

### Key types (`packages/shared/src/types.ts`)

```ts
type StreamMode = 'fixture' | 'live';
type LlmProviderId = 'fixture' | 'lmstudio' | 'opencode-go';
interface MetricsData { tokens, timeToFirstToken, totalTime, model, mode, provider }
```

### Server routes

| Method | Path                          | Description                         |
| ------ | ----------------------------- | ----------------------------------- |
| GET    | /api/stream/fixture/:promptId | Streams fixture JSON as chunked SSE |
| POST   | /api/stream/live              | Streams live LLM via openai SDK SSE |

### Demo component map

| Component                | Path                                | Role                                                 |
| ------------------------ | ----------------------------------- | ---------------------------------------------------- |
| `DemoPage`               | `src/pages/DemoPage.tsx`            | Root: state, prompt selection, mode                  |
| `PromptList`             | `src/components/PromptList/`        | 5 prompt cards with tag chips                        |
| `StreamingControls`      | `src/components/StreamingControls/` | Fixture/Live toggle + Generate/Stop/Clear            |
| `MarkdownRenderer`       | `src/components/MarkdownRenderer/`  | react-markdown + rehype-sanitize + custom components |
| `MermaidBlock`           | `src/components/MermaidBlock/`      | Mermaid v11 SVG render + DOMPurify                   |
| `CodeBlock`              | `src/components/CodeBlock/`         | Shiki syntax highlighting                            |
| `MetricsBar`             | `src/components/MetricsBar/`        | Token count, TTFT, total time, provider badge        |
| `useStreamingGeneration` | `src/lib/useStreamingGeneration.ts` | SSE fetch + chunk accumulation hook                  |

---

## Open Issues — Next Up

### 1. Mermaid diagram labels missing on flowcharts

The "Service Request Workflow" fixture uses a `flowchart TD` diagram. Labels render empty (black shapes, no text).

**Root cause investigated:** Enabling `htmlLabels: true` makes Mermaid render labels via
`<foreignObject>` (HTML inside SVG). DOMPurify strips `<foreignObject>` content even when
`ADD_TAGS` includes it — likely because `securityLevel: 'strict'` conflicts with
`foreignObject` injection post-render.

**Current state:** `htmlLabels` is commented out in `MermaidBlock.tsx` with a detailed TODO.
Labels show truncated text (clipping at node boundary) rather than empty —
lesser-of-two-evils.

**Options to investigate:**

- `securityLevel: 'loose'` — disables Mermaid's internal DOMPurify; rely solely on our own DOMPurify pass; less safe
- Post-render DOM patching — inject labels into the SVG DOM after sanitisation
- Fix fixture content — use shorter node labels that don't overflow SVG text rendering
- Different Mermaid layout engine — `elk` layout handles label sizing differently

See commented TODO block in `apps/demo-ai-pipeline/src/components/MermaidBlock/MermaidBlock.tsx`.

### 2. Live mode / OpenCode Go — model selection + reasoning model handling

Full detail in [`docs/todo/TODO_AI_PIPELINE_MODEL_SELECTION.md`](../docs/todo/TODO_AI_PIPELINE_MODEL_SELECTION.md):

- **Phase A**: Discover available models via `GET $OPENCODE_BASE_URL/models`
- **Phase B**: GLM-5.2 is a reasoning model — output lands in `delta.reasoning_content`,
  not `delta.content`; live stream produces blank output currently
- **Phase C**: `ModelSelector` dropdown UI + `modelId` server validation + block/allow lists
- **Phase D–F**: Per-prompt reasoning analysis, cost controls, deployment checklist

---

## Server Route Map

| Method | Path                           | Auth          | Description                         |
| ------ | ------------------------------ | ------------- | ----------------------------------- |
| GET    | /api/health                    | public        | Liveness check                      |
| GET    | /api/stream/fixture/:promptId  | public        | AI demo — fixture SSE stream        |
| POST   | /api/stream/live               | public        | AI demo — live LLM SSE stream       |
| POST   | /api/auth/sign-up              | public        | Register new account (rate-limited) |
| POST   | /api/auth/clear-all-cookies    | public        | Debug: wipe auth cookies            |
| \*     | /api/auth/\*                   | public        | Auth.js standard routes             |
| GET    | /api/i18n/:namespace           | public        | i18next bulk bundle load            |
| GET    | /api/i18n/translations/:domain | public        | Per-domain CMS list                 |
| GET    | /api/users                     | admin         | List all users                      |
| PATCH  | /api/users/:id                 | authenticated | Update user                         |
| DELETE | /api/users/:id                 | admin         | Delete user                         |
| PATCH  | /api/translations/:domain/:id  | admin         | Update translation entry            |
| GET    | /api/doc                       | public        | OpenAPI 3.1 JSON spec               |
| GET    | /api/reference                 | public        | Scalar interactive API docs         |

---

## Client Route Map

| Path                | Guard         | Component             |
| ------------------- | ------------- | --------------------- |
| /                   | public        | LandingPage           |
| /login              | public        | LoginPage             |
| /dashboard          | authenticated | DashboardPage         |
| /admin              | role=admin    | AdminLayout (nested)  |
| /admin/users        | role=admin    | AdminUsersPage        |
| /admin/translations | role=admin    | AdminTranslationsPage |
| /admin/settings     | role=admin    | AdminSettingsPage     |

---

## Database Schema

All tables in `apps/server/src/db/schemas/`:

| Table                 | Key columns                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `user`                | id, name, email, hashedPassword, role, emailVerified, createdAt, updatedAt |
| `session`             | id, userId, expires, sessionToken                                          |
| `account`             | id, userId, provider, providerAccountId, ...                               |
| `verification_token`  | identifier, token, expires                                                 |
| `supported_languages` | id, code, name, isDefault, isActive                                        |
| `translations_ui`     | id, key, translations (JSON), isActive                                     |
| `translations_app`    | id, key, translations (JSON), isActive                                     |
| `translations_admin`  | id, key, translations (JSON), isActive                                     |

Seed: en-GB (default) + es-ES.

---

## Key Files

| File                                                                         | Purpose                                                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `apps/server/src/lib/ai-provider.ts`                                         | `getAiProvider()` — LLM_MODE switch, returns openai client + model + providerId |
| `apps/server/src/routes/stream/stream.routes.ts`                             | `/fixture/:id` and `/live` SSE route handlers                                   |
| `apps/demo-ai-pipeline/src/lib/useStreamingGeneration.ts`                    | Client SSE hook                                                                 |
| `apps/demo-ai-pipeline/src/components/MermaidBlock/MermaidBlock.tsx`         | Mermaid render + DOMPurify (see open issues)                                    |
| `apps/demo-ai-pipeline/src/components/MarkdownRenderer/MarkdownRenderer.tsx` | react-markdown with custom element overrides                                    |
| `apps/demo-ai-pipeline/docs/markdown-rendering-styles.md`                    | Internal styling reference for the demo renderer                                |
| `apps/server/env.server.ts`                                                  | Server env schema (Valibot)                                                     |
| `apps/server/src/lib/create-app.ts`                                          | App factory: pino, notFound, onError                                            |
| `apps/server/src/lib/auth.ts`                                                | `getAuthConfig()` — Auth.js config factory                                      |
| `config/src/env.ts`                                                          | Shared env schema (`@workspace/config`)                                         |

---

## Decisions

1. Custom picocolors pino destination instead of pino-pretty — avoids worker-thread crashes. (2026-05-27)
2. `sqliteBooleanField()` returns `0|1`; `normalisePatch()` converts to boolean for Drizzle. (2026-05-27)
3. `packages/core` and `packages/shared` intentionally skipped. (2026-05-27)
4. No GitHub Pages deployment — unsuitable for full-stack monorepo. (2026-05-27)
5. Migrated from Panda CSS + `@finografic/design-system` to shadcn + Tailwind 4 in Phase 07. (2026-06-27)
6. `@moonrepo/cli` added to root devDependencies so `moon` binary is available to pnpm scripts
   in non-login shells (proto installs to `~/.proto/bin` which pnpm can't see). (2026-06-28)
7. Fixture mode is the default for the AI demo — reliable, no API cost, good for public demos.
   Live mode is an opt-in toggle. (2026-06-28)
8. All LLM calls are server-side only. `OPENCODE_API_KEY` must never carry a `VITE_` prefix. (2026-06-28)

---

## Status

**Current focus:** `apps/demo-ai-pipeline` — AI Markdown Pipeline demo.

Immediate next tasks:

1. **Fix Mermaid flowchart labels** — see Open Issues §1 above
2. **Live mode / OpenCode Go** — see
   [model selection TODO](../docs/todo/TODO_AI_PIPELINE_MODEL_SELECTION.md) Phase A+B

Longer-term:

- Phase 08 — Testing + CI (Vitest unit + integration tests, GitHub Actions)
