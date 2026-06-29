# demo-ai-pipeline

Streaming markdown demo for LLM-generated transport workflows, Mermaid diagrams, tables, syntax-highlighted code, and source-context style output.

Port: **3001**

```bash
corepack pnpm --filter @workspace/demo-ai-pipeline dev
```

The app can run from fixture streams or live model streams. Both stream endpoints are served by the Hono API server in local development through the Vite `/api` proxy.

## GitHub Pages Setup

This app is deployed as a static Vite build under the shared repository Pages site:

```text
https://<owner>.github.io/<repo>/demo-ai-pipeline/
```

GitHub setup:

1. Go to repository **Settings -> Pages**.
2. Set **Source** to **GitHub Actions**.
3. Run **Deploy Demo Pages** from the Actions tab, or push to `master`.
4. Optional: set repository variable `DEMO_API_BASE_URL` to the hosted Hono API origin, for example `https://your-api.onrender.com`.

Local Pages-style build:

```bash
VITE_BASE_PATH=/monorepo-demo/demo-ai-pipeline/ \
VITE_API_BASE_URL=https://your-api.example.com \
corepack pnpm --filter @workspace/demo-ai-pipeline build:pages
```

Notes:

- `VITE_BASE_PATH` lets Vite emit asset URLs for the GitHub Pages subdirectory.
- `VITE_API_BASE_URL` is optional locally, but required on GitHub Pages for live or fixture stream endpoints.
- Without a hosted API, the static shell loads but stream generation cannot call `/api/stream/*`.
