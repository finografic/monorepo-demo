# DEMO - Accompanying Explainations

For this role, **local-first + GitHub + screen recordings** is completely valid, especially because the demos are meant to prove frontend engineering, architecture, data visualisation, AI UI, and React/TypeScript quality, not hosting ability.

A very strong low-cost submission package could be:

```text
1. GitHub repo
2. README with screenshots/GIFs
3. 2–3 minute screen recording
4. Short “What this demonstrates” section mapped to the JD
5. Optional live screenshare if they want to walk through it
```

For each demo, I’d make sure the README has a small section like:

```text
Role relevance:
- React + TypeScript component architecture
- Data visualisation / diagramming
- Markdown rendering for AI-generated content
- Accessibility considerations
- Testing approach
- Secure handling of API keys / no client-side secrets
```

For screen recordings, keep them short and polished:

**Demo 1: Transport dashboard**
Show filters, charts, table, responsive layout, loading/error state if possible.

**Demo 2: AI markdown/diagram renderer**
Show prompt selection, streaming, raw markdown toggle, rendered Mermaid diagram, code block, table.

**Demo 3: Admin/full-stack monorepo**
Show login/auth if present, CRUD/list/detail flow, API/backend structure, package layout.

I’d also keep a small local `.env.example` and fixture mode so anyone can run it without paid API keys:

```text
MODE=fixture
# MODE=live
# ANTHROPIC_API_KEY=
```

That actually looks mature. It says: “I understand cost, security, repeatable demos, and developer experience.”

Hosting is nice, but not required right now. A clean repo plus a good 2-minute Loom-style walkthrough can be more persuasive than a half-finished live deployment.

```ini

### Testing

- **Vitest**
- **Testing Library**
- **Playwright**
- **MSW** for mocked API/streaming responses
- Optional: axe checks through Playwright or Testing Library

### Security / quality

- `rehype-sanitize`
- no raw HTML by default
- server-side API key only
- rate limiting if live LLM enabled
- dependency scanning via Dependabot / Socket.dev / Snyk
- clear error states

```

---

Yes, Claude’s idea is genuinely good, and yes, there **was** more AI emphasis in the JD than it first looked like.

The JD explicitly says they want **“modern, AI-integrated web applications”**, plus **rich content rendering**, **robust markdown rendering pipelines for AI-generated or dynamic content**, **AI-assisted/agentic coding tools**, and nice-to-haves around **RAG / GenAI interfaces / LLM-powered UIs / knowledge graphs**. It also specifically mentions diagramming libraries like **D3.js, Cytoscape.js, Mermaid**, process/flow diagram visualisation, accessibility, security, and testing.

So Claude’s idea is not random AI fluff. It maps surprisingly closely to the role.

## 1. What I think overall

I like it a lot, with one caution: **do not make it too dependent on a live paid LLM API for the public demo.**

As a portfolio piece, this is strong because it demonstrates several JD points at once:

| JD area                  | Demo proves                                           |
| ------------------------ | ----------------------------------------------------- |
| React + TypeScript       | Core app                                              |
| AI-integrated web apps   | Prompt → generated content                            |
| Rich markdown rendering  | Markdown, code, tables, diagrams                      |
| Diagramming              | Mermaid-rendered process diagrams                     |
| REST/API integration     | Backend proxy to LLM                                  |
| Data-fetching / async UI | Streaming state, loading, errors                      |
| Security-conscious dev   | API key kept server-side, sanitised rendering         |
| Accessibility            | Keyboard-friendly controls, contrast, semantic output |
| Testing                  | Renderer tests + E2E streaming flow                   |

The clever part is that it is not just “I called an AI API”. It shows you can build the **frontend interface around AI output**, which is probably closer to what TMR actually needs.

## 2. Dumbed-down summary

Think of it like this:

> The AI writes a mini technical document.
> Your app turns that document into a polished page while it is still being written.

The AI might output something like:

````md
# How a request flows through an app

1. User clicks submit
2. React sends request to API
3. API validates input

```mermaid
flowchart TD
  A[User] --> B[React App]
  B --> C[API]
  C --> D[Database]
Your app receives that text bit by bit, then says:

> “This part is a heading, render it as a heading.
> This part is a table, render it as a table.
> This part is code, syntax-highlight it.
> This part is Mermaid, turn it into a real diagram.”

So the actual demo is not really “AI writes text”.

The real demo is:

> **I can safely and cleanly render complex AI-generated content inside a React application.**

That is why it matches the JD.

## 3. Tweaks I would make

I would **not** let random visitors type any prompt at first. Too risky, possibly costly, and unnecessary.

Instead, make it a **controlled demo** with 3–4 preset prompts:

1. **Generate a process flow diagram**
   Output includes Mermaid.
2. **Explain a React architecture decision**
   Output includes code blocks.
3. **Compare state management options**
   Output includes a table.
4. **Summarise a transport-service incident workflow**
   Output includes headings, table, status callouts, and a diagram.

Then maybe have a disabled or “demo mode” custom prompt box saying:

> Custom prompts disabled in public demo to control cost and output safety.

That actually reads as mature and security-conscious, not limiting.

I’d also add a **“raw markdown / rendered view” toggle**. That is a killer feature because it makes the pipeline obvious. The viewer can see:

- raw AI output
- rendered result
- diagrams transformed from fenced Mermaid blocks

I’d name the demo something like:

> **AI Markdown Renderer & Diagram Pipeline**

or more role-tailored:

> **AI Content Rendering Demo**

I would avoid making the prompts too generic like “Explain the React component lifecycle”. Make at least one of them feel close to TMR:

> “Generate a service request workflow for a transport customer portal.”

or:

> “Create a flow diagram for registration renewal eligibility checks.”

That subtly says: “I understood the client context.”

## 4. Suggested tech stack

For your setup, I’d keep it very aligned with your existing ecosystem.

### Frontend

- **Vite**
- **React**
- **TypeScript**
- **React Router**
- **TanStack Query**, even for streamed generation history/status if useful
- **Zustand** only if local state starts getting messy
- **PandaCSS** or Tailwind
  Since the JD mentions utility-first CSS, Tailwind is the obvious keyword, but PandaCSS is very defensible from your design-system world.

### Markdown / rendering

- **react-markdown**
- **remark-gfm** for tables, strikethrough, task lists
- **rehype-sanitize** for safety
- **Shiki** for syntax highlighting
- **Mermaid** for flow diagrams
- Optional: **rehype-slug / rehype-autolink-headings** if you want nice heading anchors

### Backend

- **Hono**
- **Node or Bun**
- Server-side API route for LLM calls
- Streaming response via SSE or fetch streaming
- API key kept server-side only

### LLM provider

For the public demo:

- Best: **pre-recorded / fixture streaming mode** first
- Optional later: **Anthropic API via backend proxy**
- Local/private version: Ollama provider, matching your LLAAB story

The fixture approach means you can simulate streaming from saved markdown chunks without paying per visitor. You still prove the frontend pipeline. Then in the code/readme you can show the same interface supports a live provider.

### Testing

- **Vitest**
- **Testing Library**
- **Playwright**
- **MSW** for mocked API/streaming responses
- Optional: axe checks through Playwright or Testing Library

### Security / quality

- `rehype-sanitize`
- no raw HTML by default
- server-side API key only
- rate limiting if live LLM enabled
- dependency scanning via Dependabot / Socket.dev / Snyk
- clear error states

## Suggested architecture diagram

A simple diagram like this would be enough:

```mermaid
flowchart LR
  A[Preset prompt] --> B[React demo page]
  B --> C[Backend LLM proxy]
  C --> D[LLM provider or fixture stream]
  D --> E[Streaming markdown buffer]
  E --> F[Markdown parser]
  F --> G[Renderer components]
  G --> H[Code blocks]
  G --> I[Tables]
  G --> J[Mermaid diagrams]
  G --> K[Accessible rendered document]
````

And the component view:

```mermaid
flowchart TD
  DemoPage --> PromptSelector
  DemoPage --> StreamingControls
  DemoPage --> StreamingMarkdownRenderer
  StreamingMarkdownRenderer --> PartialMarkdownGuard
  StreamingMarkdownRenderer --> MarkdownRenderer
  MarkdownRenderer --> CodeBlock
  MarkdownRenderer --> MermaidBlock
  MarkdownRenderer --> TableBlock
  MarkdownRenderer --> SourceToggle
```

## How I’d fit this into the 3 portfolio pieces

I’d now revise the 3 demos to:

### 1. Full-stack Admin Platform

Your existing monorepo/admin demo.

### 2. Transport Operations Dashboard

Charts, filters, tables, incident/service data, maybe Nivo/D3/Recharts/ECharts.

### 3. AI Content Rendering & Diagram Pipeline

This Claude idea: streaming markdown, Mermaid diagrams, code blocks, tables, raw/rendered toggle.

That third one is probably more relevant than a generic component library demo because it directly hits the most unusual parts of this JD: **AI-generated content, markdown rendering, diagramming, and frontend architecture**.

My tweak: make the component system/design-system visible **inside all three demos**, rather than as its own standalone portfolio piece.
