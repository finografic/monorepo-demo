# AWS Lambda Demo (API Gateway HTTP API)

📅 2026-07-14

## Architecture

```text
API Gateway HTTP API (ap-southeast-2)
        ↓
AWS Lambda nodejs22.x arm64  — Hono via hono/aws-lambda
        ↓
CloudWatch Logs
```

| Route               | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `GET /health`       | Liveness JSON                             |
| `GET /api/aws-demo` | Demo payload (region, runtime, timestamp) |

Source:

- `apps/server/src/lambda-app.ts` — minimal Hono (no Auth.js / SQLite / SSE)
- `apps/server/src/lambda.ts` — `export const handler = handle(app)`
- `apps/server/infra/aws-demo/` — SAM template + `samconfig.toml`

Production remains:

- Frontend → GitHub Pages (`master` workflow)
- Backend → Render (`apps/server` Node entry)

## Prerequisites

- AWS CLI profile `default` (temporary browser session is fine)
- SAM CLI
- `pnpm` workspace install
- Region: `ap-southeast-2`

## Commands

From repo root:

```sh
pnpm --filter @workspace/server lambda:build
pnpm --filter @workspace/server lambda:deploy
pnpm --filter @workspace/server lambda:logs
pnpm --filter @workspace/server lambda:delete
```

Or from `apps/server`:

```sh
pnpm lambda:build
pnpm lambda:deploy
```

Stack name: `monorepo-demo-aws-api`

After deploy, read the URL:

```sh
aws cloudformation describe-stacks \
  --stack-name monorepo-demo-aws-api \
  --region ap-southeast-2 \
  --profile default \
  --query "Stacks[0].Outputs"
```

Smoke test:

```sh
curl -sS "$API_URL/health"
curl -sS "$API_URL/api/aws-demo"
```

## Local frontend against AWS (optional)

Do **not** change GitHub Actions `DEMO_API_BASE_URL`.

```sh
pnpm dev:aws
# or: pnpm --filter @workspace/client dev:aws
```

This sets `VITE_API_BASE_URL` to the live HTTP API URL and starts Vite on port 3000.

Only `/health` and `/api/aws-demo` exist on Lambda; auth and other APIs still need Render/local server.

## Teardown

```sh
pnpm --filter @workspace/server lambda:delete
```

Confirm stack `DELETE_COMPLETE`. SAM may leave an empty packaging bucket — delete in the console if prompted.

## Live endpoint (feat/aws-lambda-demo)

Stack: `monorepo-demo-aws-api` · Region: `ap-southeast-2`

```text
https://lepd52mqnj.execute-api.ap-southeast-2.amazonaws.com
```

Verified (2026-07-14):

- `GET /health` → `{ "status": "ok", ... }`
- `GET /api/aws-demo` → demo JSON including `region: ap-southeast-2`

Bundle note: Lambda artifact is **CJS** (`dist-lambda/lambda.js`). An ESM bundle tripped pino’s dynamic `require("node:os")` at init.

## Cost notes

Creates only: HTTP API, Lambda, IAM execution role, CloudWatch log group (+ ephemeral SAM packaging bucket). No VPC, EC2, RDS, ALB, or NAT.

## Overview

- Shared Hono app factory (`createApp`) with two adapters: Node (`@hono/node-server`) and Lambda (`hono/aws-lambda`)
- Why the full API is not on Lambda yet (`better-sqlite3`, Auth cookies, SSE)
- HTTP API vs Function URL (routing, CORS, throttling, auth options)
- Bundle isolation (esbuild rejects `better-sqlite3`)
- Teardown and budget awareness
