# demo-xscan

Portfolio demo for **xscan** (`@finografic/deps-xscan`). Sidebar lists three public GitHub repos; selecting one streams a live terminal scan in the browser.

Port: **3003**

```bash
# From monorepo root — build xscan first in sibling repo
cd ../@finografic-deps-xscan && pnpm build

# Install + run demo
corepack pnpm --filter @workspace/demo-xscan dev
```

## Vendored CLI (no submodules)

The demo does **not** install xscan as a workspace npm dependency or git submodule. Instead:

1. Build `deps-xscan` locally (`pnpm build` → `dist/index.mjs`)
2. `scripts/sync-xscan.mjs` copies `dist/` and installs xscan’s **runtime** dependencies into `vendor/xscan/`
3. The Vite dev/preview server spawns `node vendor/xscan/dist/index.mjs scan …` with `cwd` set to `vendor/xscan` so external imports like `@finografic/cli-kit` resolve

`predev` and `prebuild` run sync automatically. Override source repo with `XSCAN_REPO=/path/to/deps-xscan`.

`vendor/xscan/dist/` is **committed** so the demo runs without a local deps-xscan build. Runtime `node_modules/` under `vendor/xscan/` are gitignored — run `pnpm sync:xscan` (or `predev`) to install them.

## Terminal UI

Browser terminal uses **[xterm.js](https://xtermjs.org/)** (`@xterm/xterm` + `@xterm/addon-fit`). Scan stdout/stderr is streamed from `/api/scan?repoId=…` as Server-Sent Events.

The demo spawns xscan inside a **pseudo-TTY** (`node-pty`) so `@clack/prompts` task progress (e.g. `OSV.dev (71 / 1274 package versions)`) renders live, matching a normal terminal. If PTY allocation fails, the server sets `DEMO_XSCAN_FORCE_PROGRESS=1` so the vendored CLI still emits Clack progress over the pipe.

## GitHub token

Set `NPM_TOKEN` (or `GH_TOKEN` / `GITHUB_TOKEN`) in the **environment where Vite runs** — not in the browser — for Dependabot alerts and higher GitHub rate limits.

Demo scans pass **`--no-cache`** by default so hosted environments do not write to `~/.config/finografic/deps-xscan/cache`. For faster local iteration, set `DEMO_XSCAN_USE_CACHE=true`.

## Architecture

```
Browser (xterm.js)  ← SSE ←  Vite middleware /api/scan
                              ↓
                    materialize lockfiles from GitHub
                              ↓
                    spawn vendored xscan CLI
```

## GitHub Pages Setup

This app is deployed as a static Vite build under the shared repository Pages site:

```text
https://<owner>.github.io/<repo>/demo-xscan/
```

GitHub setup:

1. Go to repository **Settings -> Pages**.
2. Set **Source** to **GitHub Actions**.
3. Run **Deploy Demo Pages** from the Actions tab, or push to `master`.
4. Optional: set repository variable `DEMO_XSCAN_API_BASE_URL` to the hosted scan API origin.

Local Pages-style build:

```bash
VITE_BASE_PATH=/monorepo-demo/demo-xscan/ \
VITE_API_BASE_URL=https://your-xscan-api.example.com \
corepack pnpm --filter @workspace/demo-xscan build:pages
```

Notes:

- `VITE_BASE_PATH` lets Vite emit asset URLs for the GitHub Pages subdirectory.
- `VITE_API_BASE_URL` is optional for local dev, where Vite middleware serves `/api/scan`.
- On GitHub Pages, live scans require a separately hosted Node service that exposes `/api/scan`.
