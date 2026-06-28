# AI Pipeline — Model Selection, Discovery & Reasoning Handling

> Scope: `apps/demo-ai-pipeline` + `apps/server/src/lib/ai-provider.ts` + `apps/server/src/routes/stream/`
>
> **Completion legend:** `[ ]` to-do · `[x]` done · `[-]` deferred

---

## Background

OpenCode Go confirmed working via smoke test (2026-06-28). Endpoint: `https://opencode.ai/zen/go/v1`.
Key observations from the smoke test response:

- The model `glm-5.2` was accepted, but the API returned `"model":"frank/GLM-5.2"` — the
  internal name uses a `frank/` vendor prefix.
- `choices[0].message.content` was **empty**. The actual output was in `reasoning_content`. This
  means `glm-5.2` is a **reasoning model** (think-before-answer, like DeepSeek R1). Our current
  stream handler only reads `delta.content` and will produce blank output with this model.
- `max_tokens: 20` was too small for a reasoning model to complete a thought — reasoning budget
  must be allocated separately from completion budget.

---

## Phase A — Model Discovery

### A1: Query the `/models` endpoint

Run once and record the full model catalog:

```bash
source .env.development
curl "$OPENCODE_BASE_URL/models" \
  -H "Authorization: Bearer $OPENCODE_API_KEY" | jq '.data[] | {id, owned_by, created}'
```

- [ ] Record full model list in this doc (populate the allow/block lists below)
- [ ] Note which models include "reason", "think", or "r1" in their ID (likely reasoning models)
- [ ] Note pricing per model if the API or dashboard exposes it
- [ ] Identify at least one cheap non-reasoning model suitable for structured markdown output

### A2: Model naming convention

- [ ] Confirm whether request model IDs use the `frank/` prefix or the short form (`glm-5.2`)
- [ ] Confirm whether the `model` field in the SSE done event should use the API-returned name
      (`frank/GLM-5.2`) or the configured name for display purposes
- [ ] Update `OPENCODE_MODEL` default in `ai-provider.ts` once a preferred model is confirmed

---

## Phase B — Reasoning Model Content Handling

### Context

Reasoning models (GLM-5.2, DeepSeek R1, QwQ, etc.) separate their output into two fields:

| Field                     | Content                                | Show to user? |
| ------------------------- | -------------------------------------- | ------------- |
| `delta.content`           | Final answer (may be empty mid-stream) | Yes           |
| `delta.reasoning_content` | Chain-of-thought thinking              | Optional      |

Our current stream route reads only `delta.content`. With a reasoning model, this produces blank
output until the model finishes its internal reasoning and writes the final answer.

### B1: Detect reasoning content in the stream handler

In `apps/server/src/routes/stream/stream.routes.ts`:

- [ ] Read `chunk.choices[0]?.delta` and check for both `content` and `reasoning_content`
- [ ] Decide what to stream to the client for each:
  - **Option 1 (recommended for demo):** stream only `content`; wait for reasoning to complete
    before any text reaches the client. Simpler renderer, but long TTFT.
  - **Option 2:** stream `reasoning_content` as a collapsible "thinking" block, then stream
    `content` as the main output. Better UX; requires renderer changes.
  - **Option 3:** skip reasoning models entirely for this demo; pick a non-reasoning model.
- [ ] Implement chosen option and update `MetricsData` to include a `isReasoning` boolean if
      option 2 is chosen

### B2: Token budget for reasoning models

Reasoning models consume tokens in two phases: reasoning tokens + completion tokens. `max_tokens`
may apply only to completion tokens depending on the provider.

- [ ] Test with `max_tokens: 1500` on a reasoning model — confirm full output is received
- [ ] Add a `maxTokens` option to `getAiProvider()` or pass it per-request
- [ ] Add `reasoning_tokens` to `MetricsData` if the API returns it (it did in the smoke test:
      `"reasoning_tokens":0`)

---

## Phase C — Model Selector UI

A dropdown in the demo sidebar lets the user pick a model at runtime. The server uses whatever
model the client specifies (within the allow list — the key stays server-side).

### C1: Shared model registry

Create `packages/shared/src/models.ts`:

```ts
export interface ModelOption {
  id: string;           // value sent to the server
  label: string;        // display name
  provider: LlmProviderId;
  isReasoning: boolean; // needs reasoning_content handling
  blocked: boolean;     // hidden from the UI
  tags: ModelTag[];
}

export type ModelTag = 'reasoning' | 'fast' | 'cheap' | 'code' | 'vision';
```

- [ ] Define `ModelOption` type in `@workspace/shared`
- [ ] Populate initial model list once Phase A (discovery) is complete
- [ ] Export a `MODELS` constant filtered to `blocked: false` for the client
- [ ] Export a `MODEL_IDS` allowlist for server-side validation

### C2: Block list and allow list

Do not expose every model. Two control mechanisms:

**Block list** (hide specific models — use until full catalog is known):

```ts
const BLOCKED_MODEL_IDS = new Set([
  // expensive or unsuitable models — populate after discovery
  // 'some-expensive-model',
]);
```

**Allow list** (whitelist approach — switch to this once catalog is fully known):

```ts
const ALLOWED_MODEL_IDS = new Set([
  'glm-5.2',
  // 'cheaper-model-id',
]);
```

- [ ] Start with block list approach (less maintenance while catalog is unknown)
- [ ] Switch to allow list once the full model catalog is recorded
- [ ] Server validates that the requested model ID is in the allow list before calling the API;
      returns `403` if not — prevents prompt injection via model parameter manipulation

### C3: Server route update

`POST /api/stream/live` currently ignores `promptId` (prefixed `_promptId`). Extend the body
schema to accept an optional `modelId`:

```ts
const LiveBodySchema = v.object({
  promptId: v.string(),
  systemPrompt: v.pipe(v.string(), v.minLength(1)),
  modelId: v.optional(v.string()),  // if omitted, use env default
});
```

- [ ] Add `modelId` to `LiveBodySchema` in `stream.routes.ts`
- [ ] Validate `modelId` against server-side allow list
- [ ] Pass validated `modelId` to `getAiProvider()` or override `model` after provider creation
- [ ] Return `400` with a clear message if `modelId` is not in the allow list

### C4: Model selector component

New component: `apps/demo-ai-pipeline/src/components/ModelSelector/ModelSelector.tsx`

- [ ] Render a `<select>` (or shadcn `Select`) listing available `ModelOption[]`
- [ ] Group options by tag (e.g. "Reasoning", "Fast / Cheap") using `<optgroup>`
- [ ] Disable/grey out blocked models rather than hiding entirely (shows the list exists but
      prevents selection — better for demo transparency)
- [ ] Show a tooltip or badge on reasoning models warning about longer TTFT
- [ ] Only render when mode is `live` — fixture mode ignores model selection
- [ ] Emit `onModelChange: (modelId: string) => void`

### C5: Wire into DemoPage

- [ ] Add `modelId` state to `DemoPage` (default: env-configured model or first allowed model)
- [ ] Pass `modelId` to `StreamingControls` → `ModelSelector`
- [ ] Pass `modelId` to `start(promptId, mode, systemPrompt, modelId)`
- [ ] Update `useStreamingGeneration` to include `modelId` in POST body

---

## Phase D — Do the Demo Prompts Need Reasoning?

### Short answer: no, but reasoning helps with diagram correctness

| Prompt                        | Output type               | Needs reasoning? | Notes                                   |
| ----------------------------- | ------------------------- | ---------------- | --------------------------------------- |
| Service Request Workflow      | Mermaid flowchart + table | No               | Template-like; fast model fine          |
| Registration Renewal          | Mermaid sequence + table  | Marginal         | Sequence diagram logic benefits from it |
| React State Management        | Markdown table            | No               | Pure factual comparison                 |
| TypeScript Deep Merge Utility | TypeScript code block     | Yes              | Correctness of recursive generics       |
| Task Management REST API      | Table + JSON + sequence   | Marginal         | Mixed output; reasoning improves JSON   |

**Recommendation:** use a fast non-reasoning model as the default for the demo. Reserve a
reasoning model as an optional selection for the code and complex diagram prompts. This keeps TTFT
low for the demo's first impression and avoids blank-content issues.

If a cheaper non-reasoning model is not available on OpenCode Go, then:

- Implement option 2 from Phase B (stream thinking block + content)
- Or route code/diagram prompts only to the reasoning model via a per-prompt `preferReasoning`
  flag on `Prompt` in shared types

---

## Phase E — Cost Controls

- [ ] Set `max_tokens: 1200` per live request (covers the longest demo prompt outputs)
- [ ] Add per-session request cap: 5 live calls per demo session (in-memory, resets on refresh)
- [ ] Log `prompt_tokens`, `completion_tokens`, `reasoning_tokens`, `estimated_cost` from the
      done event if OpenCode returns them (confirmed: `estimated_cost` appeared in smoke test)
- [ ] Display estimated cost in `MetricsBar` when non-zero (useful for demo transparency)
- [ ] Cache last response per `promptId + modelId` for the session — hitting Generate twice with
      the same selection returns the cached result without a second API call

---

## Phase F — Deployment Checklist

- [ ] Set `LLM_MODE=hosted` as a server secret (never in client-side env)
- [ ] Set `OPENCODE_BASE_URL`, `OPENCODE_API_KEY`, `OPENCODE_MODEL` as server secrets
- [ ] Confirm no `VITE_` or `NEXT_PUBLIC_` prefix on any LLM key
- [ ] Verify rate limit (currently 10 req/hour) is appropriate for public demo traffic
- [ ] Smoke test the `/live` endpoint via `curl` against the deployed server before publishing
- [ ] Set fixture mode as the client default on first load — user opts into live mode explicitly

---

## Open Questions

| #   | Question                                                                     | Status     |
| --- | ---------------------------------------------------------------------------- | ---------- |
| 1   | What is the full OpenCode Go model catalog? (run Phase A curl)               | Unresolved |
| 2   | Does OpenCode Go support streaming `reasoning_content` in SSE chunks?        | Unresolved |
| 3   | Is there a non-reasoning cheap model suitable as the demo default?           | Unresolved |
| 4   | Does `max_tokens` apply to completion only or reasoning+completion combined? | Unresolved |
| 5   | What is the per-token cost for `glm-5.2` vs cheaper alternatives?            | Unresolved |
| 6   | Should `frank/` prefix be used in requests or is it internal only?           | Unresolved |
