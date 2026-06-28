# monorepo-starter — Handoff

## Current Objective

This repo has moved from "monorepo starter" into a **portfolio monorepo** for presenting to a prospective TMR employer.

Two demos are now complete:

1. `apps/demo-ai-pipeline` — AI/LLM streaming markdown pipeline (see full notes below)
2. `apps/demo-datavis` — QLD transport data dashboard (Recharts + D3 + live CKAN API)

The demo is meant to show:

- streaming AI/LLM UI
- fixture vs live model generation
- robust markdown rendering
- Mermaid diagrams
- syntax highlighting
- partial markdown handling
- basic accessibility discipline
- TMR-flavoured service/documentation workflows
- RAG / knowledge graph / GenAI interface language

The target role is in:

`.ideas/TMR_Role_Description_Frontend_Developer.md`

Important job-description anchors:

- React, TypeScript, Tailwind, frontend component quality
- REST APIs and modern data-fetching patterns
- accessibility testing/remediation to WCAG 2.1/2.2 AA
- AI / RAG / knowledge graphs / LLM-powered UIs
- government service delivery, registration and licensing transformation

## Current Branch / Git

- Branch: `master`
- Do **not** commit unless the user explicitly asks.
- Working tree is intentionally dirty with demo-ai-pipeline changes.
- `apps/demo-ai-pipeline/src/qld.svg` is untracked and must be included when committing.

Current notable dirty files include:

- `apps/demo-ai-pipeline/src/components/MermaidBlock/MermaidBlock.tsx`
- `apps/demo-ai-pipeline/src/components/MetricsBar/MetricsBar.tsx`
- `apps/demo-ai-pipeline/src/components/ModelSelector/ModelSelector.tsx`
- `apps/demo-ai-pipeline/src/components/PromptSelector/PromptSelector.tsx`
- `apps/demo-ai-pipeline/src/components/SourceToggle/SourceToggle.tsx`
- `apps/demo-ai-pipeline/src/components/StreamingControls/StreamingControls.tsx`
- `apps/demo-ai-pipeline/src/pages/DemoPage.tsx`
- `apps/demo-ai-pipeline/src/prompts/service-finder.prompt.ts`
- `apps/demo-ai-pipeline/src/fixtures/service-finder-*.fixture.json`
- `packages/ui/src/styles/globals.css`
- plus earlier uncommitted fixture/prompt work if not already committed in the active tree

Run `git status --short` before continuing.

## Recent Completed Work

### Live/Fixture Model Switching

The demo supports:

- Fixture mode: pre-recorded streamed markdown, no API cost
- Live mode: OpenAI-compatible server provider via OpenCode/hosted model path
- model selector in the sidebar
- selected model included in cache key
- generated markdown cache per prompt/mode/model/parameter selection

Live streaming is natural provider streaming. There is no artificial throttling in Live mode.
Fixture mode is intentionally chunked with mock streaming delays.

### New 5 TMR-Aligned Fixtures

The primary prompt cards are now:

1. Registration Renewal Eligibility
2. Driver Licence Renewal
3. Change of Address
4. Fine Payment Flow
5. AI Service Finder

Prompt implementation files were split so `index.ts` is barrel-only:

- `apps/demo-ai-pipeline/src/prompts/index.ts`
- `apps/demo-ai-pipeline/src/prompts/prompts.ts`
- `apps/demo-ai-pipeline/src/prompts/*.prompt.ts`

This matches the user preference:

> `index.ts` files should be barrels only, not implementation files.

### AI Service Finder Variable

AI Service Finder has a selector for customer need:

- Transfer used vehicle
- Pay a fine
- Change address

Fixture mode maps each option to a separate fixture:

- `service-finder-used-vehicle-transfer.fixture.json`
- `service-finder-fine-payment.fixture.json`
- `service-finder-change-address.fixture.json`

Live mode appends the selected option text to the live system prompt.

### RAG / Knowledge Graph Context

The AI Service Finder prompt and fixture variants were updated to make RAG and source-context ideas explicit.

Relevant `.ideas` data-source files scanned:

- `.ideas/TMR_DATA_Transportation_CSV.md`
- `.ideas/TMR_DATA_REST-SOURCES.md`
- `.ideas/TMR_DATA_Transport-Features-QLD.md`
- `.ideas/TMR_DATA_QLD-Traffic-GeoJSON.md`
- `.ideas/TMR_DATA_Road-Crash-Locations.md`
- `.ideas/TMR_DATA_Traffic-Census.md`
- `.ideas/TMR_DATA_Datasets.md`
- `.ideas/API_TMR_DATA_DOCS.md`

Useful source-context themes found:

- Transport customer service centres
- Customer service centre wait times
- Q-Ride providers
- BoatSafe training organisations
- Registration call-centre enquiries
- Non-generic registration enquiries
- Registration renewals by channel
- Transport features Queensland REST / ArcGIS source
- QLDTraffic GeoJSON/API notes
- Road crash locations Queensland
- Queensland Open Data / CKAN catalogue metadata

The demo is still mock-data only. Do not build a full RAG backend unless explicitly asked.

### Visual / UX Polish

Recent UI changes:

- QLD Government SVG logo centered in standby state
- standby text below logo in primary blue
- centered spinner while streaming before the first chunk arrives
- wider sidebar
- larger prompt cards
- larger tags/badges
- taller footer to allow larger metadata
- larger controls/selects/toggle labels
- single-line `text` fenced code blocks render as compact pills instead of full black code boxes

Theme update:

- `packages/ui/src/styles/globals.css`
- `--primary` now uses logo blue in OKLCH:

```css
--primary: oklch(0.489 0.161 254.944);
```

This approximates `#005EB8`.

### Mermaid

Mermaid labels were restored earlier.

Current Mermaid setup:

- `htmlLabels: false`
- custom theme/styles in:
  - `apps/demo-ai-pipeline/src/components/MermaidBlock/mermaid.theme.ts`
  - `apps/demo-ai-pipeline/src/components/MermaidBlock/mermaid.styles.ts`
- `MermaidBlock` now gives wrapper `role="img"`
- label varies by diagram type:
  - Mermaid sequence diagram
  - Mermaid flowchart diagram
  - Mermaid graph diagram
- inner SVG gets `aria-hidden="true"` and `focusable="false"`

This is a pragmatic accessibility improvement, not a complete screen-reader diagram description.

## Accessibility Status

User specifically asked to at least:

- fix 2 axe Serious errors
- ensure buttons are keyboard navigable
- ensure Mermaid has aria labels if needed

Known axe serious error from screenshot:

- color contrast on `.bg-purple-500` Mermaid flowchart badge
- fixed by changing badge palette in `PromptSelector.tsx`

Button/control status:

- prompt cards are keyboard selectable via Enter/Space and arrow navigation
- mode buttons are native buttons
- Generate/Stop/Clear are native buttons with `aria-label`
- Source toggle uses shadcn `Switch` + visible `Label`
- model and parameter selects have visible labels

Still worth doing next:

- run axe again in the browser
- run a quick keyboard-only pass:
  - Tab through sidebar
  - arrow through prompt list
  - Enter/Space selects prompt
  - Tab to Fixture/Live, model select, Generate, Stop, Clear, Raw markdown
- run Lighthouse accessibility if time permits

Do not over-invest here unless the user asks. The goal is “defensible rough demo”, not a full day of accessibility remediation.

## Remaining Work Before Calling Demo "Done"

Highest priority:

1. Re-run axe and confirm the two serious contrast issues are gone.
2. Browser smoke all five prompts in Fixture mode.
3. Browser smoke AI Service Finder selector variants.
4. Browser smoke Live mode once with Qwen/Qwen3.7 Plus if API env is available.
5. Check keyboard navigation quickly.
6. Optionally add a small visible disclaimer in the AI Service Finder output/prompt language:
   “AI-assisted draft, verify against official services.”

Nice-to-have:

- Add/adjust QLD/TMR details in Registration Renewal and Driver Licence Renewal fixtures:
  - licence renewal notice about 6 weeks before expiry
  - e-notices
  - online renewal limits
  - photo/signature capture
  - 21-day delivery
  - 90-day contact window
  - direct debit/card payment branch
  - service centre fallback
- Improve footer metadata presentation further.
- Fix remaining existing lint warnings:
  - `src/main.tsx` unassigned CSS import warning
  - `MarkdownRenderer` react-perf new array warnings

## Validation Recently Run

During this work, these passed at different points:

- `corepack pnpm --filter @workspace/demo-ai-pipeline typecheck`
- `corepack pnpm --filter @workspace/demo-ai-pipeline lint`
- `corepack pnpm --filter @workspace/demo-ai-pipeline test`
- `corepack pnpm --filter @workspace/demo-ai-pipeline build`
- `corepack pnpm typecheck`
- `graphify update . --force`

After any new edits, run at least:

```sh
corepack pnpm --filter @workspace/demo-ai-pipeline typecheck
corepack pnpm --filter @workspace/demo-ai-pipeline lint
graphify update . --force
```

Lint is expected to pass with existing warnings only unless they are fixed.

## Important Project Rules

- Do not commit unless explicitly asked.
- Use `corepack pnpm ...`.
- Use `:` in npm script names.
- Keep `index.ts` files barrel-only.
- After code changes, run `graphify update . --force` when possible.
- Do not publish/release.
- Do not convert this into a full backend/RAG/data integration without explicit instruction.

## Demo Positioning

Best way to describe the AI Markdown Pipeline:

> A React/TypeScript streaming AI interface that renders partial LLM output into safe markdown, diagrams, tables and code blocks, with fixture/live modes, provider/model selection, cached generations, and TMR-flavoured service-documentation prompts.

Best way to frame RAG:

> The demo does not implement real retrieval yet, but the AI Service Finder fixture demonstrates the interface contract and UX pattern for RAG-style source context, confidence flags, stale-data warnings, knowledge graph relationships, and human review for transactional advice.

---

## demo-datavis — QLD Transport Data Dashboard

**Status: complete base demo, ready to present.**

Port: `3002` — `corepack pnpm --filter @workspace/demo-datavis dev`

### Stack

- Recharts (bar, area, dual-line charts)
- D3 (d3-scale + d3-scale-chromatic — heatmap colour scale)
- Static mock fixtures inspired by Queensland Open Data
- One live CKAN API call (no auth required)

### 6 Chart Views

| Card                                       | Chart type           | Library          | Data                          |
| ------------------------------------------ | -------------------- | ---------------- | ----------------------------- |
| Service Centre Wait Times                  | Grouped bar          | Recharts         | Mock (8 QLD centres)          |
| Registration Call Centre — Daily Enquiries | Area chart           | Recharts         | Mock (May 2026)               |
| Traffic Volume — Hour × Day Heatmap        | SVG heatmap          | D3 colour scale  | Mock (7×24 grid)              |
| Translink Monthly Performance              | Dual-line (2 y-axes) | Recharts         | Mock (Jan–Dec 2025)           |
| Traffic Census — Road Network              | Horizontal bar       | Recharts         | Mock (top 10 roads)           |
| Live: QLD Open Data Catalogue              | Dataset list         | fetch → CKAN API | **Live** from data.qld.gov.au |

### Layout

Exact mirror of demo-ai-pipeline: left sidebar with keyboard-navigable chart cards, main pane renders selected chart, footer shows data source attribution.

### Accessibility

- `role="img"` + `aria-labelledby` on every chart wrapper
- sr-only `<table>` inside each chart (screen reader data fallback)
- Keyboard navigation on sidebar cards (arrow keys + Enter/Space)
- `isAnimationActive={false}` on all Recharts elements (respects reduced-motion intent)
- Live panel uses `aria-live="polite"` on tooltip and `role="status"` on loading spinner

### Validation

- Typecheck: clean
- Lint: one expected warning (CSS unassigned import in main.tsx — same pattern as demo-ai-pipeline)
- Browser smoke: all 6 views confirmed working

### Plan doc

`docs/todo/TODO_DEMO_DATAVIS.md`

---

## User Preferences

- Direct, practical responses.
- Avoid over-building.
- Polish enough to present, not perfect.
- Accessibility matters because the job description says it in bold, but time is limited.
- TMR alignment matters more than generic technical examples.
- Demo can use mock data; factual accuracy is not critical.
- Any real QLD/TMR data should be used as flavour/source context, not treated as authoritative production logic.
