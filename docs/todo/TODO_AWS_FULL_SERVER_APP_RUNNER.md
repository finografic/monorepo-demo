# TODO — AWS Full Server App Runner Demo

> **Created:** 2026-07-14
>
> **Branch:** `feat/aws-lambda-demo`
>
> **Goal:** deploy the full `apps/server` API to AWS as an interview-ready backend target for the existing GitHub Pages client.
>
> **Positioning:** keep the completed Lambda/API Gateway slice as the serverless contrast point. This plan adds a fuller AWS backend path; it does not replace Render or the GitHub Pages workflow.

Context:

- [DONE — AWS Lambda + API Gateway Demo](./DONE_AWS_LAMBDA_DEMO.md)
- [AWS Lambda Demo process doc](../process/AWS_LAMBDA_DEMO.md)
- [AWS App Runner Full Server Demo](../process/AWS_APP_RUNNER_FULL_SERVER.md)
- [Portfolio Deployment](../process/PORTFOLIO_DEPLOYMENT.md)

---

## Interview story

Use this as the technical narrative:

```text
GitHub Pages React client
  -> AWS App Runner full Node/Hono API
  -> same API surface currently hosted on Render
```

The completed Lambda demo proves a small serverless slice:

```text
API Gateway HTTP API -> Lambda -> minimal Hono routes
```

The App Runner demo proves the fuller backend deployment shape:

```text
Managed AWS container -> full Hono server -> auth/API/live-demo routes
```

This gives a direct answer for interview questions about Lambda vs containers, CI/CD, cloud tradeoffs, technical discovery, de-risking, and production-readiness boundaries.

---

## Constraints

- Do not change `master`.
- Do not change Render production behaviour.
- Do not change the GitHub Pages workflow unless explicitly needed for a staging/demo API URL.
- Do not commit AWS credentials, session tokens, generated secrets, or local `.env` files.
- Keep client and server deployments separate:
  - GitHub Pages hosts the static React client.
  - AWS App Runner hosts the full Node/Hono server.
- Treat SQLite as acceptable for a short-lived demo only.
- Do not introduce RDS/Postgres in this slice.
- Avoid extra AWS services unless they materially improve the demo.
- Tear down AWS resources after the interview unless intentionally retained.

---

## Target architecture

```text
Browser
  -> https://finografic.github.io/monorepo-demo/
  -> VITE/DEMO API base URL
  -> https://<app-runner-service>.awsapprunner.com
  -> apps/server full Hono API
```

Recommended AWS service:

- **App Runner** for the interview demo container runtime.

Alternatives intentionally deferred:

- **ECS Fargate** — stronger enterprise shape, too much setup for this slice.
- **Lightsail** — easiest VPS-style option, less aligned to container/cloud platform interview questions.
- **Full Lambda migration** — not suitable for the current full server because of auth, SQLite/native modules, and streaming concerns.

---

## Phase 0 — Pre-flight and safety checks

- [x] Confirm AWS account is still on Free account plan or credits are active.
- [x] Confirm billing alert exists at `$5`.
- [x] Note current AWS region preference (`ap-southeast-2` unless App Runner constraints suggest otherwise).
- [ ] Capture current Render API URL and GitHub Pages client URL.
- [x] Confirm the intended demo backend URL will be additive, not a production cutover.
- [x] Confirm branch strategy: continue on `feat/aws-lambda-demo` unless this expands beyond interview-demo scope.

Done when:

- Cost guardrails are in place.
- Target region and branch strategy are explicit.
- No production endpoint is being replaced.

---

## Phase 1 — Server runtime audit

- [x] Inspect `apps/server` build and start scripts.
- [x] Confirm the Render-style start command for the built server.
- [x] Identify required runtime environment variables:
  - `NODE_ENV`
  - `PORT`
  - `DATABASE_URL` or SQLite path variables
  - `AUTH_SECRET`
  - `AUTH_URL`
  - `CORS_ORIGINS`
  - cookie security / SameSite variables
  - any live demo provider keys
- [ ] Identify routes that must work for the interview:
  - `/api/health`
  - auth/session routes if demoed
  - AI pipeline live or fixture-backed API route if demoed
  - stream routes if demoed
- [ ] Identify routes that can remain out of scope.

Done when:

- There is a short env checklist for App Runner.
- The exact API routes for the interview demo are known.
- Any SQLite/native-module risk is documented before container work starts.

---

## Phase 2 — Containerize the full server

- [x] Add a production Dockerfile for the full server.
- [x] Use the repo's existing pnpm/Node toolchain expectations.
- [x] Build only what is needed to run `apps/server`.
- [x] Keep implementation code out of `index.ts` files.
- [x] Ensure native dependencies are installed for the Linux container environment.
- [x] Ensure the container listens on App Runner's expected `PORT`.
- [x] Add `.dockerignore` if required to keep the build context small and safe.
- [x] Build the image locally.
- [x] Run the image locally with minimal env and smoke test `/api/health`.

Done when:

- Local container build succeeds.
- Local container run serves `/health`.
- No secrets are baked into the image.

---

## Phase 3 — App Runner deployment

- [x] Choose the lowest practical App Runner compute settings.
- [x] Create ECR repository `monorepo-demo-server`.
- [x] Push image `monorepo-demo-server:interview-demo` to ECR.
- [x] Create App Runner ECR access role `AppRunnerEcrAccessRole`.
- [x] Create the App Runner service from the container source.
- [x] Configure runtime env vars in AWS, not in committed files.
- [x] Configure health check path.
- [x] Deploy the service.
- [x] Capture the App Runner service URL.
- [ ] Smoke test:
  - [x] `GET /api/health`
  - [x] one public API route (`HEAD /api/reference`)
  - [ ] one credentialed route if auth is part of the demo
  - [ ] one stream/live route only if needed
- [ ] Inspect App Runner logs for startup errors.

Done when:

- App Runner URL serves the expected full server route set.
- Logs are clean enough for demo use.
- The service can be deleted or paused after the interview.

Current blocker:

- [x] AWS returned `SubscriptionRequiredException` for App Runner service creation on 2026-07-14:
      `The AWS Access Key Id needs a subscription for the service`.
- [x] Account activation resolved the App Runner access blocker.
- [x] First deployment failed on smallest instance because runtime DB bootstrap exited `137`.
- [x] Move SQLite demo DB bootstrap to image build time and start the server directly at runtime.

Current service:

```text
URL: https://qvyq3mdegk.ap-southeast-2.awsapprunner.com
ARN: arn:aws:apprunner:ap-southeast-2:906655020591:service/monorepo-demo-server/60eb771e297f49fab58825d67e4a32be
Instance: 0.25 vCPU / 0.5 GB
```

---

## Phase 4 — GitHub Pages client wiring

- [ ] Decide whether to test through a local client build or a GitHub Pages variable.
- [ ] For local validation, build/run the client with the App Runner API base URL.
- [ ] For hosted validation, update only the relevant GitHub repository variable if intentionally cutting the demo client over.
- [ ] Configure server CORS to allow the GitHub Pages origin.
- [ ] Configure auth cookie settings for cross-origin HTTPS if auth is demoed.
- [ ] Smoke test the hosted client against the AWS API URL.

Done when:

- The GitHub Pages client can hit the AWS App Runner API.
- CORS/auth behaviour is understood and documented.
- Render remains available as a fallback.

---

## Phase 5 — Documentation and interview talking points

- [x] Add or update a process doc for the full AWS server deployment.
- [x] Document:
  - chosen AWS service and why
  - why Lambda remains a stub
  - what would change for production
  - known demo limitations
  - teardown steps
- [x] Add exact commands used for local build, local container smoke, deploy, logs, and teardown.
- [x] Add short interview talking points:
  - Lambda vs containers
  - SQLite demo limitation vs Postgres production answer
  - CORS/auth cross-origin considerations
  - CI/CD/IaC next step
  - cost controls and cleanup

Done when:

- The deployment is repeatable from docs.
- The tradeoff story is clear without over-claiming production readiness.
- Teardown is documented before the interview.

---

## Phase 6 — Cleanup / teardown

- [ ] Delete or pause the App Runner service after the interview unless intentionally retained.
- [ ] Check Billing and Cost Management after teardown.
- [ ] Confirm no unexpected App Runner, ECR, CloudWatch, or related resources remain active.
- [ ] If the work is complete, rename this file to `DONE_AWS_FULL_SERVER_APP_RUNNER.md`.
- [ ] Update `ROADMAP.md` links when graduating this plan.

Done when:

- Demo resources are removed or intentionally retained.
- Billing console shows no surprising active services.
- The TODO doc is either still active or graduated to DONE.

---

## Out of scope

- RDS/Postgres migration.
- ECS/Fargate production architecture.
- Custom domain and TLS certificate setup.
- Route 53 domain registration.
- Load balancer setup.
- NAT Gateway or private VPC networking.
- Multi-environment CI/CD pipeline.
- Full production observability stack.

---

## Success criteria

- Full `apps/server` runs on AWS.
- Existing GitHub Pages client can call the AWS API.
- Render remains untouched as fallback.
- Lambda stub remains demonstrable as the serverless contrast.
- Demo can be torn down quickly.
- The story answers Origin-style questions about React, Node, AWS architecture, CI/CD direction, and senior tradeoff judgement.
