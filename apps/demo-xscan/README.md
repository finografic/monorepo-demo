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

## GitHub token

Set `NPM_TOKEN` (or `GH_TOKEN` / `GITHUB_TOKEN`) in the **environment where Vite runs** — not in the browser — for Dependabot alerts and higher GitHub rate limits.

## Architecture

```
Browser (xterm.js)  ← SSE ←  Vite middleware /api/scan
                              ↓
                    materialize lockfiles from GitHub
                              ↓
                    spawn vendored xscan CLI
```
