# demo-xscan

Portfolio wrapper for the `@finografic/deps-xscan` browser demo.

Port: **3003**

## Development

```bash
corepack pnpm --filter @workspace/demo-xscan dev
```

The app keeps the monorepo portfolio shell:

- `DemoAuthGuard`
- `DemoLayout`
- router/base-path integration
- shared workspace styles

The scanner UI itself is imported from `@finografic/deps-xscan-demo`.

## API

Live scans are served by the external deps-xscan demo API, not by this app. Set `VITE_DEMO_XSCAN_API_BASE_URL` to the
scan API origin for static or hosted builds:

```bash
VITE_BASE_PATH=/monorepo-demo/demo-xscan/ \
VITE_DEMO_XSCAN_API_BASE_URL=https://deps-xscan-api.onrender.com \
corepack pnpm --filter @workspace/demo-xscan build:pages
```

If `VITE_DEMO_XSCAN_API_BASE_URL` is omitted, the wrapper falls back to `VITE_API_BASE_URL`.

For local package development, `@finografic/deps-xscan-demo` may be linked to the sibling repo. Before deploying, use the published package version.
