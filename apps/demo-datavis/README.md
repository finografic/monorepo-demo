# demo-datavis

Transport data visualisation demo with accessible chart views, mock TMR-shaped datasets, and selected live Queensland Open Data API examples.

Port: **3002**

```bash
corepack pnpm --filter @workspace/demo-datavis dev
```

## GitHub Pages Setup

This app is deployed as a static Vite build under the shared repository Pages site:

```text
https://<owner>.github.io/<repo>/demo-datavis/
```

GitHub setup:

1. Go to repository **Settings -> Pages**.
2. Set **Source** to **GitHub Actions**.
3. Run **Deploy Demo Pages** from the Actions tab, or push to `master`.

Local Pages-style build:

```bash
VITE_BASE_PATH=/monorepo-demo/demo-datavis/ \
corepack pnpm --filter @workspace/demo-datavis build:pages
```

Notes:

- `VITE_BASE_PATH` lets Vite emit asset URLs for the GitHub Pages subdirectory.
- The demo is mostly static and is the safest GitHub Pages target.
- Any live Open Data calls are browser-side `fetch` calls to public endpoints and do not require a Node backend.
