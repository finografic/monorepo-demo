# Portfolio Demos — Full Execution Plan

Target: convert this monorepo into a portfolio site with linked demos, built to directly address the TMR Frontend Developer role description.

**Completion legend:** `[ ]` to-do · `[x]` done · `[-]` skipped/deferred

---

## Phase 1 — Moon + Proto Toolchain Setup

Replace Turbo with Moon as the task runner. Add Proto for deterministic Node/pnpm version management.

- [x] Install `proto` toolchain manager globally via curl installer
- [x] Create `.prototools` at repo root pinning `node = "24.3.0"` and `pnpm = "10.33.0"`
- [x] Install `moon` via `proto install moon`
- [x] Run `moon init` to scaffold `.moon/workspace.yml` and `.moon/toolchain.yml`
- [x] Configure `.moon/workspace.yml` — declare projects: `client`, `server`, `demo-ai-pipeline`, `ui`, `config`, `shared`
- [x] Configure `.moon/toolchain.yml` — Node 24.3.0, pnpm 10.33.0, inherit from `.prototools`
- [x] Add `moon.yml` to `apps/client` (tasks: dev, build, lint, typecheck, test)
- [x] Add `moon.yml` to `apps/server` (tasks: dev, build, lint, typecheck)
- [x] Add `moon.yml` to `packages/ui` (tasks: build, lint, typecheck)
- [x] Add `moon.yml` to `config` (tasks: build, typecheck)
- [x] Verify `moon run client:dev` works end-to-end
- [x] Keep `turbo.json` in place during migration — remove only after Moon fully verified
- [x] Update root `package.json` scripts: add `moon`-prefixed script aliases alongside Turbo ones

---

## Phase 2 — File Tree Restructure

Scaffold the target monorepo shape. No code yet — just directories, stubs, and workspace wiring.

- [x] Create `apps/demo-ai-pipeline/` with stub `package.json` (`@workspace/demo-ai-pipeline`)
- [x] Create `apps/demo-ecosystem/` with stub `package.json` (`@workspace/demo-ecosystem`) — placeholder only; later removed before publishing
- [x] Create `apps/demo-datavis/` with stub `package.json` (`@workspace/demo-datavis`) — placeholder only
- [x] Create `packages/shared/` with stub `package.json` (`@workspace/shared`) and `src/index.ts`
- [x] Update `pnpm-workspace.yaml` — confirm `apps/*` and `packages/*` globs cover new paths (they already do)
- [x] Run `pnpm install` — verify workspace links resolve
- [x] Add `moon.yml` stubs for `demo-ai-pipeline`, `demo-ecosystem`, `demo-datavis`, `shared`; `demo-ecosystem` later removed
- [x] Update `.moon/workspace.yml` — register all new projects
- [x] Verify `moon query projects` lists all workspaces

---

## Phase 3 — `demo-ai-pipeline` App Scaffold

Full Vite + React + TypeScript app setup, mirroring `apps/client` conventions.

- [x] Scaffold with `pnpm create vite apps/demo-ai-pipeline --template react-ts`
- [x] Align `tsconfig.json` to `tsconfig.base.json` path aliases and strict settings
- [x] Install core deps: `react-markdown`, `remark-gfm`, `rehype-sanitize`, `mermaid`, `shiki`
- [x] Install TanStack Query: `@tanstack/react-query`
- [x] Install dev deps: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@playwright/test`, `axe-core`, `@axe-core/playwright`
- [x] Add `@workspace/ui` and `@workspace/shared` as workspace deps
- [x] Configure Vite: port 3001, `/api` proxy → `http://localhost:4000`
- [x] Set up Tailwind 4 config — import from `packages/ui` globals
- [x] Set up React Router v7 with a single `DemoPage` route at `/`
- [x] Set up TanStack Query `QueryClientProvider` in `main.tsx`
- [x] Update `moon.yml` for `demo-ai-pipeline` with full task definitions
- [x] Verify `moon run demo-ai-pipeline:dev` starts on port 3001

---

## Phase 4 — Shared Types Package (`packages/shared`)

Types and constants shared between demo frontend and server.

- [x] Define `StreamChunk` type (SSE event payload)
- [x] Define `Prompt` type (`id`, `title`, `description`, `systemPrompt`)
- [x] Define `MetricsData` type (`tokens`, `timeToFirstToken`, `totalTime`, `model`, `mode`)
- [x] Define `StreamMode` enum: `'fixture' | 'live'`
- [x] Define `GenerationStatus` type: `'idle' | 'streaming' | 'complete' | 'error'`
- [x] Export all from `src/index.ts`
- [x] Verify types resolve in both `demo-ai-pipeline` and `server`

---

## Phase 5 — Server: SSE Fixture Replay + Live LLM Proxy

Extend `apps/server` with two new routes under `/api/stream`.

- [x] Create `apps/server/src/routes/stream.ts` — Hono router
- [x] Implement `GET /api/stream/fixture/:promptId` — SSE endpoint that replays a pre-recorded JSON fixture file with realistic inter-chunk delays
- [x] Implement `POST /api/stream/live` — SSE endpoint that proxies to Anthropic Messages API with `stream: true` (API key server-side only, never reaches client)
- [x] Implement `GET /api/stream/prompts` — returns the curated prompt manifest (id, title, description — no systemPrompts)
- [x] Add in-memory rate limiter to `/api/stream/live` (max 10 req/hour per IP)
- [x] Add `ANTHROPIC_API_KEY` to `.env.example` and validate in `@workspace/config`
- [x] Add `STREAM_MODE` env var (`fixture` | `live`), default `fixture`
- [x] Mount `streamRouter` in `apps/server/src/index.ts`
- [x] Test fixture SSE manually with `curl -N http://localhost:4000/api/stream/fixture/workflow`

---

## Phase 6 — Curated Prompts + Fixture Files

Five prompts, each exercising a different renderer capability. Pre-recorded fixture responses stored as JSON.

- [x] Create `apps/demo-ai-pipeline/src/prompts/index.ts` — typed prompt manifest array
- [x] Prompt 01 — **"Service request workflow"**: produces Mermaid flowchart + headings + prose (TMR domain relevance)
- [x] Prompt 02 — **"Registration renewal eligibility"**: produces Mermaid sequence diagram + decision table
- [x] Prompt 03 — **"React state management comparison"**: produces markdown comparison table + prose
- [x] Prompt 04 — **"TypeScript deep merge utility"**: produces syntax-highlighted code block
- [x] Prompt 05 — **"REST API design for task management"**: produces headings + endpoint table + sequence diagram
- [x] Create `apps/demo-ai-pipeline/src/fixtures/` — one `.fixture.json` per prompt
  - Each fixture: `{ "promptId": "...", "model": "claude-sonnet-4-6", "chunks": [{ "text": "...", "delayMs": 40 }], "metrics": { "tokens": 142, "timeToFirstToken": 310, "totalTime": 2100 } }`
- [x] Implement fixture generator script: `scripts/record-fixture.ts` — calls live Anthropic API, saves chunk array with timing metadata (run once, commit output)
- [x] Record and commit all 5 fixture files

---

## Phase 7 — Stream Buffer + Partial Fence Detection

The core custom utility that makes streaming polished.

- [x] Create `apps/demo-ai-pipeline/src/lib/stream-buffer.ts`
  - `splitAtUnclosedFence(buffer: string): { safe: string; pending: string }` — scans for odd number of ` ``` ` occurrences, returns safe portion to render and pending portion to hold
  - Handles `mermaid`, `ts`, `tsx`, `js`, `bash`, and plain fences
- [x] Create `apps/demo-ai-pipeline/src/lib/useStreamingGeneration.ts` — custom hook
  - Manages `status: GenerationStatus`, `buffer: string`, `metrics: MetricsData | null`
  - Opens SSE connection via `EventSource` (fixture or live mode)
  - Appends each `data` event text chunk to buffer
  - Captures `timeToFirstToken` on first chunk, `totalTime` on `[DONE]` event
  - Exposes `start(promptId)`, `stop()`, `clear()` methods
- [x] Unit tests (Vitest) for `splitAtUnclosedFence`:
  - Empty buffer → `{ safe: '', pending: '' }`
  - Complete fence → all in `safe`
  - Unclosed opening fence → split at fence start
  - Multiple complete fences + one unclosed → correct split

---

## Phase 8 — Core Components

Build the component tree from `DemoPage` down.

### PromptSelector

- [x] `src/components/PromptSelector/PromptSelector.tsx` — card grid, keyboard navigable (arrow keys, Enter/Space to select)
- [x] Each card: title, short description, visual "capability badge" (e.g. "Mermaid", "Table", "Code")
- [x] ARIA: `role="listbox"`, `aria-selected` on active card, `aria-label` on container
- [x] Active card highlighted with focus ring and accent border

### StreamingControls

- [x] `src/components/StreamingControls/StreamingControls.tsx` — Start, Stop, Clear buttons
- [x] Disables Start when `status === 'streaming'`; disables Stop when `status !== 'streaming'`
- [x] Keyboard accessible, ARIA labels on each button

### PartialMarkdownGuard

- [x] `src/components/PartialMarkdownGuard/PartialMarkdownGuard.tsx`
- [x] Calls `splitAtUnclosedFence(buffer)` on each render
- [x] Renders safe portion via `MarkdownRenderer`
- [x] Shows pending portion as muted monospace preview block (dimmed, labelled "rendering…")

### CodeBlock

- [x] `src/components/CodeBlock/CodeBlock.tsx`
- [x] Accepts `language` and `code` props
- [x] Uses Shiki `codeToHtml` (theme-aware: Vitesse Dark / Vitesse Light)
- [x] Renders highlighted HTML via `dangerouslySetInnerHTML` inside a `<pre>` wrapper (safe: Shiki generates the HTML, not user input)
- [x] Copy-to-clipboard button with `aria-label="Copy code"` and confirmation state
- [x] Language badge top-right

### MermaidBlock

- [x] `src/components/MermaidBlock/MermaidBlock.tsx`
- [x] Calls `mermaid.render(id, code)` on mount / when `code` changes
- [x] Injects SVG via `dangerouslySetInnerHTML` (safe: Mermaid generates SVG, not user input)
- [x] Wraps in `<div role="img" aria-label="Mermaid diagram">` with a text description fallback
- [x] Error state for invalid Mermaid syntax
- [x] Respects system dark/light preference via Mermaid `theme` config

### MarkdownRenderer

- [x] `src/components/MarkdownRenderer/MarkdownRenderer.tsx`
- [x] `ReactMarkdown` with `remarkPlugins={[remarkGfm]}` and `rehypePlugins={[rehypeSanitize]}`
- [x] Custom `components` overrides:
  - `code`: routes to `MermaidBlock` if `className === 'language-mermaid'`, else `CodeBlock`
  - `table`: wraps in `<div role="region" aria-label="Data table">` with overflow scroll
  - `a`: opens external links in `target="_blank" rel="noopener noreferrer"`

### SourceToggle

- [x] `src/components/SourceToggle/SourceToggle.tsx` — toggle button: "Rendered" / "Raw Markdown"
- [x] Shows `<pre>` of raw buffer when in raw mode
- [x] ARIA: `aria-pressed` reflects current mode

### MetricsBar

- [x] `src/components/MetricsBar/MetricsBar.tsx`
- [x] Displays: tokens, time to first token (ms), total time (ms), model (or "fixture")
- [x] Shows skeleton/loading state while `status === 'streaming'`
- [x] Hidden with `aria-hidden` when `status === 'idle'`

### DemoPage

- [x] `src/pages/DemoPage.tsx` — assembles full layout
- [x] Left panel: `PromptSelector` + `StreamingControls`
- [x] Right panel: `PartialMarkdownGuard` + `SourceToggle` + `MetricsBar`
- [x] Responsive: stacked on mobile, side-by-side on md+
- [x] Custom prompt input disabled in public mode with visible note (reads `VITE_ALLOW_CUSTOM_PROMPTS`)

---

## Phase 9 — Accessibility & Styling

- [x] Colour contrast audit: all text meets WCAG 2.1 AA (4.5:1 normal, 3:1 large)
- [x] Dark / light theme toggle in header using CSS `prefers-color-scheme` + manual override class
- [x] Focus-visible rings on all interactive elements (no `:focus` without `:focus-visible`)
- [x] Keyboard-only walkthrough: prompt selection → generate → copy code → toggle source
- [x] Screen reader test: headings, ARIA labels, live regions for streaming status
- [x] `aria-live="polite"` region wrapping `PartialMarkdownGuard` for streaming announcements
- [x] Responsive layout tested at 375px, 768px, 1280px

---

## Phase 10 — Tests

- [x] Vitest unit tests — `stream-buffer.ts`: all fence-detection edge cases (see Phase 7)
- [x] Vitest unit tests — `MarkdownRenderer`: renders headings, tables, code blocks from static fixtures
- [x] Vitest unit tests — `MermaidBlock`: renders SVG, handles invalid syntax
- [x] Testing Library — `PromptSelector`: keyboard navigation, selection state
- [x] Testing Library — `StreamingControls`: button disabled states during streaming
- [x] Playwright E2E — `fixture-stream.spec.ts`: selects prompt, clicks Start, streaming completes, metrics appear
- [x] Playwright + axe-core — accessibility scan on `DemoPage` after stream completes
- [x] MSW setup for mocking SSE stream in component tests

---

## Phase 11 — Portfolio Shell (`apps/client`) Updates

Wire the existing `client` app into a portfolio landing page that navigates to the demo.

- [x] Update home page to include a "Demos" section with cards linking to each demo
- [x] Demo card for `demo-ai-pipeline`: title, description, capability tags, link
- [x] Placeholder cards for `demo-ecosystem` and `demo-datavis` (with "Coming soon" state); `demo-ecosystem` later removed
- [x] Navigation header: logo/name, links to demos, GitHub link
- [x] Update `moon.yml` for `client` — `dev` task starts both client and `demo-ai-pipeline` in parallel (or note to run separately)

---

## Phase 12 — CI/CD (GitHub Actions)

- [x] Create `.github/workflows/ci.yml` — runs on push/PR to master
  - Jobs: `lint` (oxlint), `typecheck`, `test` (Vitest), `build`
  - Uses Moon for task orchestration: `moon ci`
  - Proto installs correct Node/pnpm versions from `.prototools` automatically
- [x] Add Dependabot config for npm dependency updates (`.github/dependabot.yml` — may already exist)
- [x] Add Socket.dev GitHub App reference in README (dependency supply-chain scanning)

---

## Completion Checkpoint

At this point the demo is:

- Locally runnable with `moon run demo-ai-pipeline:dev`
- Displaying all 5 curated prompts
- Streaming fixture responses with partial fence protection
- Rendering markdown, code blocks (Shiki), tables, and Mermaid diagrams
- Accessible (WCAG 2.1 AA targets met)
- Tested (unit + E2E)
- CI green on GitHub Actions
- Portfolio shell links to it

---

## Deferred (Post-Plan)

- `apps/demo-datavis` — QLD transport data dashboard (D3 / Recharts)
- `apps/demo-xscan` — browser terminal wrapper for xscan dependency/security scans
- Deployment (Railway / Fly.io) for live demo hosting
- Live LLM mode toggle in UI (requires deployed server with `ANTHROPIC_API_KEY`)
- Ollama local provider integration
