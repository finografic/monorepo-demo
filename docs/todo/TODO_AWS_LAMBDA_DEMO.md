# TODO — AWS Lambda + API Gateway Demo

> **Status:** Phase 1 complete (2026-07-14). Phase 2 starting.
>
> **Branch:** `feat/aws-lambda-demo` · **Region:** `ap-southeast-2` · **Profile:** `default`
>
> **Commit policy:** one focused git commit after each completed phase below.
>
> **Hard constraints:** do not touch `master`, GitHub Pages workflow, Render behaviour, or production
> `DEMO_API_BASE_URL`. AWS is an additive backend target, not a replacement.

Context: [`.agents/AWS_CONTEXT.md`](../../.agents/AWS_CONTEXT.md)

---

## Goal

Deploy a small, interview-ready Hono slice:

```text
API Gateway HTTP API → Lambda (nodejs22.x) → CloudWatch Logs
```

Initial surface:

- `GET /health`
- `GET /api/aws-demo`

Reuse `createApp()` / router patterns. Do **not** import full `app.ts` (Auth.js, SQLite, SSE).

---

## Phase 0 — Planning doc + roadmap link

- [x] Add this TODO doc
- [x] Link from `docs/todo/ROADMAP.md` under active planning docs
- [x] Commit Phase 0

---

## Phase 1 — Lambda-safe Hono slice

- [x] Add `apps/server/src/routes/aws-demo/` (`GET /api/aws-demo`)
- [x] Add `apps/server/src/lambda-app.ts` (createApp + `/health` + aws-demo; no Auth/DB)
- [x] Add `apps/server/src/lambda.ts` (`hono/aws-lambda` handler)
- [x] Confirm Render entry (`index.ts` / `app.ts`) unchanged
- [x] Commit Phase 1

---

## Phase 2 — Bundle + package scripts

- [ ] Add Lambda bundle script (esbuild) — entry `src/lambda.ts`, Node 22, no `better-sqlite3`
- [ ] Add `package.json` scripts: `lambda:build`, `lambda:deploy`, `lambda:delete`, `lambda:logs`
- [ ] Validate artifact locally (handler present; native SQLite absent)
- [ ] Commit Phase 2

---

## Phase 3 — SAM infrastructure

- [ ] Add `apps/server/infra/aws-demo/template.yaml` (HttpApi + Function + IAM)
- [ ] Add `apps/server/infra/aws-demo/samconfig.toml` (`ap-southeast-2`)
- [ ] Wire build to pre-built `.aws-sam` / `dist-lambda` artifact
- [ ] Commit Phase 3

---

## Phase 4 — Docs + local validation

- [ ] Add `docs/process/AWS_LAMBDA_DEMO.md` (architecture, commands, teardown, interview notes)
- [ ] Run `lambda:build` + `sam build` successfully
- [ ] Optional: `sam local invoke` smoke
- [ ] Commit Phase 4

---

## Phase 5 — Deploy + verify

- [ ] `sam deploy` to `ap-southeast-2` (stack e.g. `monorepo-demo-aws-api`)
- [ ] Retrieve HTTP API URL from stack outputs
- [ ] `curl` `/health` and `/api/aws-demo`
- [ ] Inspect CloudWatch logs (`sam logs` / console)
- [ ] Document URL + teardown in process doc (no secrets)
- [ ] Commit Phase 5 (docs/scripts only if deploy artifacts are gitignored)

---

## Out of scope (v1)

- [ ] DynamoDB / VPC / EC2 / RDS / ALB / NAT
- [ ] Full API on Lambda (Auth, SQLite, SSE stream)
- [ ] Changing GitHub Pages or Render production config
- [ ] CI/CD deploy workflow for AWS
- [ ] Committing AWS credentials

---

## Done

- Phase 0 — Planning doc + ROADMAP link (2026-07-14)
- Phase 1 — Lambda-safe Hono slice (`lambda.ts`, `lambda-app.ts`, aws-demo routes) (2026-07-14)
