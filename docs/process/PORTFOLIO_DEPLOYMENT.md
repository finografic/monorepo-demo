# Portfolio Deployment

📅 Jun 29, 2026

> **TEMPORARY (2026-07-23):** GitHub Pages (`https://finografic.github.io/monorepo-demo/`) no
> longer builds/serves the apps described below. It now publishes a static redirect to the AWS
> CloudFront deployment (`https://d2h3ihm2ddi3lx.cloudfront.net/`), preserving old shared links,
> because the Render.com account backing this section is being cancelled.
>
> **To revert:** `git revert` the commit that replaced
> `.github/workflows/deploy-demo-pages.yml` with the redirect-only version — it restores the full
> build/deploy steps below unchanged. The rest of this doc describes that pre-redirect state and
> is kept for when/if Pages is reactivated.
>
> **Resolved (2026-07-23):** `demo-xscan`'s scan API no longer depends on Render at all. It now
> runs as a `deps-xscan-api` container on the same EC2 instance as `monorepo-demo-api` (both on
> `--network host`), reached through an internal proxy at `apps/server/src/routes/xscan` mounted
> at `/api/xscan/*` — no Terraform/CloudFront changes needed since `/api/*` already routes to EC2.
> The AWS build points `VITE_DEMO_XSCAN_API_BASE_URL` at the relative `/api/xscan` path (see
> `scripts/build-aws-frontend.sh`). The `deps-xscan` repo has its own
> `Dockerfile.ec2-xscan-api` for this. This part is **not** temporary — see the updated xscan
> section below.

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

Set these GitHub Actions repository variables before deploying Pages:

GitHub repo -> Settings -> Secrets and variables -> Actions -> Variables tab -> Repository variables

| Variable                  | Value                                                                        |
| ------------------------- | ---------------------------------------------------------------------------- |
| `DEMO_API_BASE_URL`       | Hosted Hono API origin, for example `https://monorepo-demo-api.onrender.com` |
| `DEMO_XSCAN_API_BASE_URL` | Hosted xscan API origin, for example `https://deps-xscan-api.onrender.com`   |

The root login app and all demo auth guards use `DEMO_API_BASE_URL` for Auth.js session checks. The xscan demo uses
`DEMO_XSCAN_API_BASE_URL` for scan requests because the scanner API is hosted by the separate `deps-xscan-api` Render
service. Both values are build-time Vite inputs for the GitHub Pages workflow, so changes require rerunning the Pages
workflow or pushing a new commit.

## Render API

Deploy `apps/server` as the Node service. Required runtime variables:

Build command:

```sh
corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/server build
```

Legacy Render start command:

```sh
pnpm --filter @workspace/server start
```

Render is no longer the canonical deployment target. The active AWS path uses EC2 plus RDS PostgreSQL.

| Variable                                     | Notes                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `NODE_ENV`                                   | `production`                                                                     |
| `AUTH_SECRET`                                | Strong random string, at least 16 characters                                     |
| `AUTH_URL`                                   | Public API origin, for example `https://monorepo-demo-api.onrender.com/api/auth` |
| `CORS_ORIGINS`                               | Comma-separated browser origins allowed to send credentials                      |
| `AUTH_COOKIE_SAME_SITE`                      | `none` for GitHub Pages to Render auth cookies                                   |
| `AUTH_COOKIE_SECURE`                         | `true` for HTTPS deployments                                                     |
| `DATABASE_URL`                               | PostgreSQL connection string                                                     |
| `OPENAI_API_KEY` or compatible provider vars | Only if AI Pipeline live mode is enabled                                         |

Recommended `CORS_ORIGINS` for the published Pages site:

```text
https://finografic.github.io
```

## xscan API (EC2, canonical)

`demo-xscan`'s scan execution runs in a separate repo, `finografic/deps-xscan`
(`demo/api/server.ts` — spawns the `xscan` CLI via `node-pty`, streams SSE output). It runs as a
second container on the same EC2 instance as `monorepo-demo-api`:

- Build: `Dockerfile.ec2-xscan-api` in the `deps-xscan` repo (root CLI build + `demo/api`,
  `node-pty` compiled for `linux/amd64`).
- Run: `docker run -d --name deps-xscan-api --restart unless-stopped --network host -e PORT=4001 deps-xscan-api:latest`
- Both `deps-xscan-api` and `monorepo-demo-api` run with `--network host` so `apps/server`'s
  internal proxy (`apps/server/src/routes/xscan`, mounted at `/api/xscan/*`) can reach it over
  `http://127.0.0.1:4001` — set via `XSCAN_API_URL` in `/opt/monorepo-demo/.env`.
- Not published on any public port; only reachable through the `/api/xscan/*` proxy, which
  CloudFront already forwards to EC2 via the existing `/api/*` behavior. No security group or
  Terraform change needed.
- To redeploy after a `deps-xscan` change: SSM into EC2, `git -C /opt/deps-xscan/repo pull`,
  rebuild the image, `docker rm -f deps-xscan-api` + rerun the `docker run` above.

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
