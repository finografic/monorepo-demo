# Portfolio Deployment

📅 Jun 29, 2026

## Target Architecture

Use a mixed deployment:

- GitHub Pages serves the static Vite apps.
- Render serves the Hono Node API.
- Server-side auth and rate limiting protect paid or limited API paths.

Static Pages apps:

- `apps/client` at `/monorepo-demo/`
- `apps/demo-ai-pipeline` at `/monorepo-demo/demo-ai-pipeline/`
- `apps/demo-datavis` at `/monorepo-demo/demo-datavis/`
- `apps/demo-xscan` at `/monorepo-demo/demo-xscan/`

Node-backed features:

- Auth.js routes under `/api/auth`
- AI Pipeline live LLM streaming at `POST /api/stream/live`
- xscan execution endpoints, if hosted by this server or another Node service
- Future DataViz QLD Open Data proxy endpoints, if browser-direct calls need server-side rate limits

## GitHub Pages

The Pages workflow is [.github/workflows/deploy-demo-pages.yml](/.github/workflows/deploy-demo-pages.yml).

It runs:

```sh
pnpm build:pages
```

Set these repository variables when live API features should work from Pages:

| Variable                  | Value                                                                          |
| ------------------------- | ------------------------------------------------------------------------------ |
| `DEMO_API_BASE_URL`       | Hosted Hono API origin, for example `https://monorepo-demo-api.onrender.com`   |
| `DEMO_XSCAN_API_BASE_URL` | Optional hosted xscan API origin, if xscan is deployed separately              |

The root login app and all demo auth guards use `DEMO_API_BASE_URL` for Auth.js session checks. If xscan is served by
the same Hono service, leave `DEMO_XSCAN_API_BASE_URL` unset so the workflow falls back to `DEMO_API_BASE_URL`.

## Render API

Deploy `apps/server` as the Node service. Required runtime variables:

| Variable                                     | Notes                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `NODE_ENV`                                   | `production`                                                                       |
| `AUTH_SECRET`                                | Strong random string, at least 16 characters                                       |
| `AUTH_URL`                                   | Public API origin, for example `https://monorepo-demo-api.onrender.com/api/auth`   |
| `CORS_ORIGINS`                               | Comma-separated browser origins allowed to send credentials                        |
| `AUTH_COOKIE_SAME_SITE`                      | `none` for GitHub Pages to Render auth cookies                                     |
| `AUTH_COOKIE_SECURE`                         | `true` for HTTPS deployments                                                       |
| `DB_NAME`                                    | `monorepo-demo.sqlite.db`                                                          |
| `DB_PATH`                                    | Optional persistent SQLite path, if using a Render disk                            |
| `OPENAI_API_KEY` or compatible provider vars | Only if AI Pipeline live mode is enabled                                           |

Recommended `CORS_ORIGINS` for the published Pages site:

```text
https://finografic.github.io
```

For local testing against a hosted API, include local origins too:

```text
https://finografic.github.io,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003
```

## Cross-Origin Auth

GitHub Pages and Render are different sites. Credentialed requests require all of these:

- Server CORS must allow the exact Pages origin.
- Server CORS must set `Access-Control-Allow-Credentials: true`.
- Auth cookies must use `SameSite=None; Secure`.
- Client fetches must use `credentials: 'include'`.

The server defaults to production-safe cookies when `NODE_ENV=production`:

- `AUTH_COOKIE_SAME_SITE=none`
- `AUTH_COOKIE_SECURE=true`

For local development, defaults stay browser-friendly:

- `AUTH_COOKIE_SAME_SITE=lax`
- `AUTH_COOKIE_SECURE=false`

## Protection Boundary

Frontend code on GitHub Pages is public. Do not rely on static UI checks to protect paid APIs.

The demo apps include a client-side session guard so unauthenticated visitors are redirected to `/login` with the
attempted demo URL preserved. This improves the portfolio UX, but it does not make static JavaScript private.

Protect these on the Node side:

- `POST /api/stream/live`
- xscan execution endpoints
- any future proxied QLD Open Data endpoints

Fixture mode and static visualisations can remain public.
