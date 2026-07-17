# monorepo-demo — Handoff

## Current State

This repo is a portfolio monorepo demo for showing full-stack frontend/backend work to employers and recruiters.

The canonical deployed AWS shape is now:

```text
CloudFront default domain
  -> S3 static React/Vite frontend
  -> /api/* CloudFront behavior
  -> EC2 Hono/Auth.js API
  -> RDS PostgreSQL
```

Canonical URL:

```text
https://d2h3ihm2ddi3lx.cloudfront.net/
```

AWS is now the single active deployment story. Historical App Runner work is archived in `DONE_` docs only, and optional
production upgrades live in `DEFERRED_` docs.

## Git / Working Rules

- Branch: `master`
- Do **not** commit unless the user explicitly asks.
- Use `git status --short` before editing or committing.
- `.agents/handoff.md` is tracked and should contain stable current truth.
- `.agents/memory.md` is gitignored and should contain recent session notes only.

## Active Deployment Model

Use [AWS Deployment Guide](/docs/process/AWS_DEPLOYMENT_GUIDE.md) as the operational source of truth.

Normal deployment paths:

- **Frontend code:** build/sync/invalidate S3 + CloudFront.
- **Server code:** update the EC2 checkout/build and restart `monorepo-demo-api`.
- **Server runtime env:** update `/opt/monorepo-demo/.env` over SSM and restart `monorepo-demo-api`.
- **Infrastructure:** run Terraform from `infra/terraform/environments/demo`.
- **Database schema/data:** run RDS migrations/seeds from EC2 or another approved private path.

The manual GitHub Actions workflow `.github/workflows/deploy-aws-frontend.yml` is still useful: it deploys the AWS
frontend assets to S3 and invalidates CloudFront. It does not deploy EC2 server code, run database work, or apply
Terraform.

## AWS Resources and Runtime

Known current AWS resource identifiers:

- CloudFront distribution URL: `https://d2h3ihm2ddi3lx.cloudfront.net`
- CloudFront distribution ID: `ERCVOSB81GPS9`
- S3 frontend bucket: `monorepo-demo-demo-frontend`
- EC2 API instance ID: `i-0805afb8519b94f3d`
- EC2 API public DNS: `ec2-54-252-64-116.ap-southeast-2.compute.amazonaws.com`
- EC2 API container: `monorepo-demo-api`
- EC2 API port: `4000`
- RDS endpoint: `monorepo-demo-demo-postgres.cvkgiaqoc64i.ap-southeast-2.rds.amazonaws.com:5432`
- RDS database: `monorepo_demo`
- AWS region: `ap-southeast-2`

EC2 runtime facts:

- `DB_DIALECT=postgres`
- `DATABASE_URL` points to RDS PostgreSQL with SSL.
- Live LLM mode uses the hosted OpenCode-compatible endpoint.
- `AUTH_URL=https://d2h3ihm2ddi3lx.cloudfront.net`
- `AUTH_COOKIE_SECURE=true`
- `AUTH_COOKIE_SAME_SITE=none`

Do not commit AWS credentials, database URLs with passwords, local `.env` files, generated Terraform plans, or SSM
parameter files containing secrets.

## Completed AWS Work

The active AWS migration checklist is [TODO_AWS_TERRAFORM_CLOUDFRONT_RDS.md](/docs/todo/TODO_AWS_TERRAFORM_CLOUDFRONT_RDS.md).

Current completed checkpoints:

- Terraform foundation.
- S3 + CloudFront frontend.
- GitHub Actions manual CloudFront deploy role/workflow.
- Local PostgreSQL migration path.
- RDS PostgreSQL foundation.
- EC2 API infrastructure and server deployment.
- CloudFront `/api/*` cutover to EC2.
- RDS-backed auth/i18n/admin data path.
- Live LLM streaming through CloudFront.
- App Runner active-path cleanup.

Historical App Runner references are intentionally archived in:

- [DONE_AWS_FULL_SERVER_APP_RUNNER.md](/docs/todo/DONE_AWS_FULL_SERVER_APP_RUNNER.md)
- [DONE_AWS_APP_RUNNER_FULL_SERVER.md](/docs/todo/DONE_AWS_APP_RUNNER_FULL_SERVER.md)

Do not reintroduce App Runner as an active deployment path unless the user explicitly asks.

## Recent Smoke Evidence

These passed after the CloudFront -> EC2 -> RDS cutover:

- CloudFront root returns `200 text/html`.
- `/login` renders.
- `/admin` serves the SPA and redirects anonymous users to login.
- `/demo-ai-pipeline/`, `/demo-datavis/`, and `/demo-xscan/` resolve through CloudFront.
- `/api/health` returns JSON `{"status":"ok"}`.
- Invalid `/api/*` routes return JSON `404`, not `index.html`.
- `/api/i18n/translations?lng=en-GB` returns seeded RDS-backed translation JSON.
- Fixture streaming returns `text/event-stream`.
- Live LLM streaming works in the browser after the SSE heartbeat and CloudFront timeout fix.
- EC2 SSM smoke confirmed `DB_DIALECT=postgres`, a PostgreSQL `DATABASE_URL`, and `monorepo-demo-api` running.

Known polish item:

- Anonymous protected API responses currently return `401` with an ugly `INTERNAL_ERROR` body. Behavior is correct, but
  the response envelope can be improved later.

## Portfolio Apps

The deployed frontend includes:

- `apps/client` — landing, auth/login, dashboard/admin shell.
- `apps/demo-ai-pipeline` — protected AI markdown streaming demo with fixture and live modes.
- `apps/demo-datavis` — protected transport data dashboard.
- `apps/demo-xscan` — protected dependency scan demo; still uses the external deps-xscan API unless intentionally
  migrated.

The AI pipeline prompt set is TMR/transport-flavoured and includes:

- Registration Renewal Eligibility
- Driver Licence Renewal
- Change of Address
- Fine Payment Flow
- AI Service Finder

## Cost Guardrails

Keep this demo cheap and pay-as-you-go:

- No NAT Gateway.
- No load balancer.
- No WAF.
- No custom domain/Route 53/ACM unless explicitly approved.
- No ECS/Fargate unless explicitly approved.
- No Secrets Manager unless explicitly accepted as a paid upgrade.
- RDS remains small: `db.t4g.micro`, 20 GiB storage, no automated backups by default.
- EC2 remains small: `t3.micro`, public subnet, direct outbound internet.
- User has a `$5` AWS budget alert and expects very low organic traffic.

## Current Follow-Ups

Highest-value next work:

1. Finish Phase 9 documentation/cleanup in `TODO_AWS_TERRAFORM_CLOUDFRONT_RDS.md`.
2. Add rollback, teardown, and cost-control notes to the AWS docs.
3. Decide whether to keep or archive the legacy GitHub Pages workflow.
4. Decide whether any old AWS resources outside Terraform should be stopped/deleted.
5. Polish protected-route error envelopes for anonymous API calls.
