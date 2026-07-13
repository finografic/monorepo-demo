# DONE — AWS Lambda + API Gateway Demo

> **Completed:** 2026-07-14 — API Gateway HTTP API + Lambda demo deployed and verified.
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

- [x] Add Lambda bundle script (esbuild) — entry `src/lambda.ts`, Node 22, no `better-sqlite3`
- [x] Add `package.json` scripts: `lambda:build`, `lambda:deploy`, `lambda:delete`, `lambda:logs`
- [x] Validate artifact locally (handler present; native SQLite absent)
- [x] Commit Phase 2

---

## Phase 3 — SAM infrastructure

- [x] Add `apps/server/infra/aws-demo/template.yaml` (HttpApi + Function + IAM)
- [x] Add `apps/server/infra/aws-demo/samconfig.toml` (`ap-southeast-2`)
- [x] Wire build to pre-built `dist-lambda` artifact
- [x] Commit Phase 3

---

## Phase 4 — Docs + local validation

- [x] Add `docs/process/AWS_LAMBDA_DEMO.md` (architecture, commands, teardown, interview notes)
- [x] Run `lambda:build` + `sam build` successfully
- [x] Optional: `sam local invoke` smoke — skipped (no Docker/Finch runtime locally); event fixture added under `infra/aws-demo/events/`
- [x] Commit Phase 4

---

## Phase 5 — Deploy + verify

- [x] `sam deploy` to `ap-southeast-2` (stack `monorepo-demo-aws-api`)
- [x] Retrieve HTTP API URL from stack outputs
- [x] `curl` `/health` and `/api/aws-demo`
- [x] Inspect CloudWatch logs (`sam logs` / console)
- [x] Document URL + teardown in process doc (no secrets)
- [x] Commit Phase 5 (CJS bundle fix + deploy script + docs)

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
- Phase 2 — esbuild `dist-lambda` + `lambda:*` scripts (2026-07-14)
- Phase 3 — SAM HttpApi + Lambda template (`infra/aws-demo`) (2026-07-14)
- Phase 4 — Process doc + local `sam build` validation (2026-07-14)
- Phase 5 — Deployed + verified `https://lepd52mqnj.execute-api.ap-southeast-2.amazonaws.com` (2026-07-14)
