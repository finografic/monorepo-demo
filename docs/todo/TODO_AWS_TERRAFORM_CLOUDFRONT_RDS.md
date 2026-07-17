# TODO — AWS Terraform CloudFront RDS Migration

> **Created:** 2026-07-15
>
> **Branch:** `feat/aws-terraform-cloudfront-rds`
>
> **Goal:** migrate the portfolio deployment from GitHub Pages and SQLite toward a low-cost AWS shape with Terraform-managed infrastructure, S3 + CloudFront frontend hosting, a small EC2 API server, and RDS PostgreSQL.
>
> **Positioning:** keep the current App Runner deployment as the working backend baseline until the EC2 API path is proven. Replace GitHub Pages only after the S3 + CloudFront path is proven. Replace SQLite only after local PostgreSQL, RDS, and the EC2 API are proven.

Context:

- [DONE — AWS Lambda + API Gateway Demo](./DONE_AWS_LAMBDA_DEMO.md)
- [TODO — AWS Full Server App Runner Demo](./TODO_AWS_FULL_SERVER_APP_RUNNER.md)
- [AWS App Runner Full Server Demo](../process/AWS_APP_RUNNER_FULL_SERVER.md)
- [Portfolio Deployment](../process/PORTFOLIO_DEPLOYMENT.md)
- [Deferred App Runner/RDS plan](./DEFERRED_AWS_TERRAFORM_CLOUDFRONT_RDS.md)

---

## Overview

Target narrative:

```text
CloudFront
  -> S3 static React/Vite frontend
  -> small EC2 Hono/Auth.js API
  -> RDS PostgreSQL
```

The aim is to show pragmatic full-stack AWS delivery:

- Incremental migration from a working deployment.
- Terraform-managed infrastructure.
- Static frontend hosting through S3 + CloudFront.
- Small AWS-hosted Node API on EC2.
- Relational data on PostgreSQL/RDS.
- Simple server-side config and operational notes.
- Clear rollback points at every publishable checkpoint.

---

## Constraints

- Keep `master` deployable while this work is in progress.
- Keep the existing App Runner backend live until a replacement step is proven.
- Keep GitHub Pages as a fallback until CloudFront is proven.
- Do not introduce a custom domain in this slice.
- Use the default CloudFront distribution domain, for example `https://d111111abcdef8.cloudfront.net`.
- Prefer Terraform over AWS CDK for broader IaC job-market alignment.
- Prefer PostgreSQL over DynamoDB for this app because the current data model is relational.
- Do not commit AWS credentials, session tokens, generated secrets, database passwords, or local `.env` files.
- Keep costs explicit; document teardown for every paid AWS service.
- This is a low-traffic job-hunt portfolio demo in an intro AWS account. Prefer the lowest-cost pay-as-you-go option
  over production-grade redundancy unless a paid upgrade is explicitly approved.
- Avoid NAT Gateway by default because it has an hourly baseline charge even when traffic is tiny.
- Keep RDS within the free-tier/credit-friendly shape by default: `db.t4g.micro`, 20 GiB storage, no storage autoscaling,
  and no automated backups unless explicitly enabled.
- Keep Secrets Manager opt-in for RDS credentials because it has a recurring per-secret charge.
- Avoid NAT Gateway, ECS/Fargate, load balancers, WAF, Route 53, custom domains, and Secrets Manager unless explicitly
  accepted as paid upgrades.

---

## Target architecture

```text
Browser
  -> CloudFront default domain
  -> private S3 bucket with built React/Vite assets
  -> EC2 public API server
  -> RDS PostgreSQL
```

Optional production-style variants are deferred in `DEFERRED_AWS_TERRAFORM_CLOUDFRONT_RDS.md`.

---

## Checkpoint A — Terraform foundation, no runtime changes

Includes:

- Phase 0 — Baseline and safety
- Phase 1 — Terraform foundation

Deployability requirement:

- Existing GitHub Pages frontend still works.
- Existing App Runner API still works.
- No database migration has started.
- No AWS frontend cutover has happened.

---

## Phase 0 — Baseline and safety

- [x] Confirm current App Runner API is healthy.
- [x] Confirm current GitHub Pages frontend is healthy.
- [x] Record current public URLs:
  - GitHub Pages frontend: `https://finografic.github.io/monorepo-demo/`
  - App Runner API: `https://qvyq3mdegk.ap-southeast-2.awsapprunner.com`
  - Render API if still retained as fallback
- [x] Record current AWS resource identifiers:
  - App Runner service name: `monorepo-demo-server`
  - ECR repository: `monorepo-demo-server`
  - AWS region: `ap-southeast-2`
- [x] Confirm billing alert and credits/free plan status (`$5` alert configured; AWS credits/free-plan status checked in console).
- [x] Document rollback rule: `master` remains the known-good deployment baseline until CloudFront + RDS are proven.

Done when:

- The current deployed demo is verified before any new infrastructure is added.
- The rollback baseline is explicit.

---

## Phase 1 — Terraform foundation

- [x] Add Terraform folder structure:

  ```text
  infra/terraform/
    environments/demo/
    modules/
  ```

- [x] Configure AWS provider and required version constraints.
- [x] Add shared variables:
  - `aws_region`
  - `project_name`
  - `environment`
- [x] Decide initial state strategy:
  - local state for the first safe checkpoint, or
  - S3 backend after the frontend bucket/state bucket decision is made.
- [x] Add Terraform docs for:
  - `terraform init`
  - `terraform fmt`
  - `terraform validate`
  - `terraform plan`
  - `terraform apply`
  - `terraform destroy`

Done when:

- Terraform can initialise and validate.
- No live runtime behaviour has changed.

Validation:

- [x] `terraform fmt -recursive -check`
- [x] `terraform init -input=false`
- [x] `terraform validate`
- [x] `terraform plan -input=false -no-color` showed output-only changes and no real AWS resources.

---

## Checkpoint B — AWS frontend in parallel

Includes:

- Phase 2 — S3 + CloudFront frontend
- Phase 3 — CloudFront CI/CD

Deployability requirement:

- CloudFront serves the full portfolio frontend.
- The frontend still calls the existing App Runner API.
- GitHub Pages remains available as a fallback.
- No database migration has started.

---

## Phase 2 — S3 + CloudFront frontend

- [x] Use Terraform to create a private S3 bucket for built frontend assets.
- [x] Use Terraform to create a CloudFront distribution.
- [x] Configure CloudFront Origin Access Control for the S3 origin.
- [x] Enforce HTTPS viewer access.
- [x] Configure SPA fallback/error routing to `index.html`.
- [x] Use the default CloudFront domain; do not add Route 53 or ACM custom-domain work.
- [x] Build frontend apps with CloudFront-compatible base paths:
  - `/`
  - `/demo-ai-pipeline/`
  - `/demo-datavis/`
  - `/demo-xscan/`
- [x] Keep monorepo API env values pointed at the existing App Runner URL.
- [x] Keep xscan API env value pointed at the existing deps-xscan Render API until the scan service is migrated.
- [x] Upload a local build to S3 and test through CloudFront.

Done when:

- CloudFront can serve the landing page and all three demo apps.
- Auth, i18n, AI streaming, and datavis still call the App Runner API correctly.
- xscan still calls the existing deps-xscan scan API correctly.

Plan validation:

- [x] `terraform validate`
- [x] `terraform plan -input=false -no-color`
- [x] Plan proposes 7 resources to create and no changes/destroys:
  - private S3 frontend bucket
  - S3 ownership controls
  - S3 public access block
  - S3 versioning
  - CloudFront Origin Access Control
  - CloudFront distribution
  - S3 bucket policy for CloudFront reads
- [x] Apply reviewed plan.
- [x] Upload local CloudFront-targeted build to S3.
- [x] Create CloudFront invalidation.
- [x] Add CloudFront route rewrite for subdirectory app indexes.
- [x] CloudFront URL: `https://d2h3ihm2ddi3lx.cloudfront.net`
- [x] Verified route headers:
  - `/` -> `200`, root landing HTML
  - `/demo-ai-pipeline/` -> `200`, AI pipeline HTML
  - `/demo-datavis/` -> `200`, datavis HTML
  - `/demo-xscan/` -> `200`, xscan HTML
- [x] Verified built frontend assets contain App Runner API URL: `https://qvyq3mdegk.ap-southeast-2.awsapprunner.com`
- [x] Demo 3 uses the existing deps-xscan scan API: `https://deps-xscan-api.onrender.com`
- [x] `terraform plan -input=false -no-color` reports no changes after apply.

---

## Phase 3 — CloudFront CI/CD

- [x] Add or update GitHub Actions workflow for S3 + CloudFront deployment.
- [x] Upload built assets to S3.
- [x] Invalidate CloudFront after deployment.
- [x] Keep workflow manual-first with `workflow_dispatch` until proven.
- [x] Preserve GitHub Pages workflow temporarily as fallback.
- [x] Document required GitHub Actions variables/secrets.
- [x] Add Terraform-managed GitHub Actions OIDC deploy role.
- [x] Configure GitHub `aws-cloudfront` environment variable `AWS_GITHUB_ACTIONS_ROLE_ARN`.
- [x] Run the manual workflow once and verify CloudFront after invalidation.

Done when:

- A GitHub Actions run can publish the frontend to CloudFront.
- CloudFront can be used as the primary demo URL while GitHub Pages remains a fallback.

---

## Checkpoint C — Local PostgreSQL

Includes:

- Phase 4 — Local PostgreSQL migration

Deployability requirement:

- Local development can run on PostgreSQL.
- Deployed App Runner can remain on the existing SQLite-backed image until RDS is ready.
- No AWS database cutover has happened.

---

## Phase 4 — Local PostgreSQL migration

- [x] Add local PostgreSQL setup, preferably Docker Compose.
- [x] Add local `DATABASE_URL` documentation for PostgreSQL.
- [x] Add reusable SQLite to PostgreSQL migration notes.
- [x] Update Drizzle database config for PostgreSQL.
- [x] Review schema differences:
  - timestamps
  - booleans
  - IDs
  - defaults
  - JSON/text fields
  - indexes and constraints
- [x] Generate PostgreSQL-compatible migrations.
- [x] Update seed flow for PostgreSQL.
- [x] Add dialect-aware runtime database switching:
  - default remains SQLite
  - `DB_DIALECT=postgres` selects the PostgreSQL adapter and schema tables
  - missing `DATABASE_URL` fails fast when PostgreSQL is selected
- [x] Validate local flows:
  - auth/session
  - admin pages
  - translations/i18n
  - AI streaming
  - datavis
  - xscan

Validation evidence:

- [x] `DB_DIALECT=postgres` server started against local Docker PostgreSQL.
- [x] `/api/health` returned `{"status":"ok"}`.
- [x] Anonymous `/api/auth/session` returned `null`.
- [x] Auth.js credentials login with seeded `admin@test.com` succeeded and `/api/users` returned seeded users.
- [x] `/api/auth/sign-up` created a new PostgreSQL-backed user.
- [x] `/api/i18n/translations?lng=en-GB` returned UI, app, and admin translation bundles.
- [x] `/api/i18n/translations/ui` returned 22 active UI translation rows.
- [x] `/api/stream/fixture/change-address` returned SSE fixture chunks.
- [x] Datavis and xscan remain client/external-service flows; the PostgreSQL runtime switch does not change their API
      configuration.

Done when:

- [x] Local app runs against PostgreSQL end-to-end.
- [x] SQLite is documented as the default legacy/demo fallback while PostgreSQL remains explicit via `DB_DIALECT`.

---

## Checkpoint D — RDS PostgreSQL Foundation

Status: reached. Phase 5 can begin from the completed local PostgreSQL checkpoint.

Includes:

- Phase 5 — Low-cost RDS PostgreSQL

Deployability requirement:

- RDS PostgreSQL exists in AWS.
- RDS uses the smallest practical pay-as-you-go/free-credit-friendly shape.
- No App Runner, EC2, or frontend runtime cutover has happened yet.

---

## Phase 5 — Low-cost RDS PostgreSQL

- [ ] Use Terraform to create RDS PostgreSQL.
  - [x] Add reviewable Terraform config.
  - [x] Validate Terraform config.
  - [x] Generate a no-apply Terraform plan.
  - [x] Apply reviewed Terraform plan.
- [x] Add DB subnet group and security group.
- [x] Keep the database private by default.
- [x] Leave NAT Gateway out of the plan.
- [x] Leave Secrets Manager out of the active RDS plan.
- [x] Keep RDS defaults minimal:
  - `db.t4g.micro`
  - 20 GiB `gp2`
  - no storage autoscaling
  - no automated backups by default
  - no deletion protection by default
- [x] Capture Terraform outputs after apply:
  - `rds_endpoint`
  - `rds_database_name`
  - `rds_port`
  - `rds_security_group_id`
- [x] Run migrations against RDS.
- [x] Run seeds against RDS.
- [x] Verify RDS row counts.

Done when:

- RDS PostgreSQL is applied and reachable from EC2 over SSL.
- RDS contains the migrated schema and seed data.
- The deployed App Runner service still remains the rollback backend.

Plan evidence:

- [x] `terraform -chdir=infra/terraform/environments/demo init -input=false`
- [x] `terraform -chdir=infra/terraform/environments/demo fmt`
- [x] `terraform -chdir=infra/terraform/environments/demo validate`
- [x] `terraform -chdir=infra/terraform/environments/demo plan -input=false -no-color`
- [x] Plan proposes 5 resources to create and no changes/destroys:
  - Terraform random password (no AWS resource or monthly charge)
  - RDS PostgreSQL instance
  - DB parameter group
  - DB subnet group
  - RDS security group

---

## Checkpoint E — Low-cost EC2 API

Includes:

- Phase 6 — EC2 API infrastructure
- Phase 7 — EC2 server deployment

Deployability requirement:

- One small EC2 instance can run the Hono/Auth.js API.
- EC2 can receive public API calls.
- EC2 can connect privately to RDS PostgreSQL.
- EC2 can make outbound internet calls without NAT Gateway.
- App Runner remains available as rollback until EC2 is proven.

---

## Phase 6 — EC2 API Infrastructure

- [x] Add Terraform for one small EC2 API instance.
  - [x] Add reviewable Terraform config.
  - [x] Validate Terraform config.
  - [x] Generate a no-apply Terraform plan.
  - [x] Apply reviewed Terraform plan.
- [x] Choose the cheapest practical instance type for the demo.
  - [x] Default to `t3.micro` for x86 compatibility with the existing server Docker build path.
  - Avoid Auto Scaling Groups, load balancers, and ECS/Fargate for this slice.
- [x] Add an EC2 security group:
  - allow inbound HTTP/API traffic on port `4000` for the demo API;
  - leave SSH closed by default;
  - allow outbound internet from EC2;
  - allow EC2 -> RDS on `5432`.
- [x] Add an RDS ingress rule allowing only the EC2 security group.
- [x] Decide deployment style:
  - mounted repo built with pnpm inside `node:24-bookworm-slim`;
  - API runs as a restartable Docker container on EC2;
  - full custom image build remains available but was too heavy for the first `t3.micro` deploy.
- [x] Add minimal instance bootstrap:
  - install runtime dependencies;
  - create app directory;
  - leave actual app env/service setup for Phase 7.
- [x] Add SSM Session Manager access for administration without opening SSH.
- [x] Keep NAT Gateway, ALB, WAF, Route 53, ACM, ECS/Fargate, and Secrets Manager out of this slice.
- [x] Generate and review a no-apply Terraform plan.

Done when:

- Terraform can create the EC2 API host and security group wiring.
- Plan has no NAT Gateway, load balancer, ECS, WAF, Route 53, or Secrets Manager resources.

Plan evidence:

- [x] `terraform -chdir=infra/terraform/environments/demo fmt`
- [x] `terraform -chdir=infra/terraform/environments/demo validate`
- [x] `terraform -chdir=infra/terraform/environments/demo plan -input=false -no-color`
- [x] Initial EC2/RDS plan proposed 10 resources to create and no changes/destroys:
  - Terraform random password (no AWS resource or monthly charge)
  - RDS PostgreSQL instance
  - DB parameter group
  - DB subnet group
  - RDS security group
  - EC2 API instance
  - EC2 API security group
  - EC2 outbound rule
  - EC2 API ingress rule
  - RDS ingress from EC2 security group
- [x] Follow-up SSM plan proposed 3 IAM resources and one in-place EC2 profile update:
  - EC2 IAM role
  - SSM managed policy attachment
  - EC2 instance profile
  - in-place `iam_instance_profile` update on the EC2 instance

---

## Phase 7 — EC2 Server Deployment

- [x] Build or package the server for EC2.
  - EC2-specific Dockerfile added at `apps/server/Dockerfile.ec2-api`.
  - Root Docker scripts added for local build/run smoke checks.
  - Local `linux/amd64` image build completed.
- [x] Configure EC2 runtime env outside source control:
  - `DB_DIALECT=postgres`
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `CORS_ORIGINS`
  - AI provider keys if live streaming remains enabled
  - Runtime env documented in `docs/process/AWS_EC2_API_SERVER.md`.
- [x] Use SSM Session Manager for EC2 administration.
- [x] Start the Hono API on EC2.
- [x] Verify EC2 -> RDS connectivity.
- [x] Run or re-run migrations/seeds from an approved path if not completed in Phase 5.
- [ ] Smoke test EC2 API directly:
  - [x] `/api/health`
  - [x] auth/session
  - [ ] admin/users
  - [x] translations/i18n
  - [ ] AI fixture stream
  - [ ] AI live stream if provider keys are configured
- [x] Verify RDS-backed seed data:
  - 2 users
  - 2 supported languages
  - 53 translation rows
- [ ] Decide whether Demo 3 continues to use the external xscan API for now.

Validation evidence:

- [x] `pnpm aws:ec2:docker:build`
- [x] Local container smoke against Docker PostgreSQL returned `/api/health` status `ok`.

Done when:

- EC2 is the working AWS API backend.
- EC2 uses RDS PostgreSQL.
- App Runner is still available as rollback.

---

## Checkpoint F — CloudFront Cutover and Cleanup

Includes:

- Phase 8 — Frontend API cutover
- Phase 9 — Documentation, rollback, and cost guardrails

Deployability requirement:

- CloudFront frontend and demo apps call the EC2 API.
- EC2 API works against RDS PostgreSQL.
- App Runner is no longer required for the primary demo path.

---

## Phase 8 — Frontend API Cutover

- [x] Update frontend build configuration to use same-origin CloudFront API calls.
- [x] Add CloudFront `/api/*` behavior pointing to the EC2 API origin.
- [x] Keep xscan pointed at the current external xscan API unless intentionally migrated.
- [x] Update EC2 runtime auth settings for CloudFront:
  - `AUTH_URL=https://d2h3ihm2ddi3lx.cloudfront.net`
  - `AUTH_COOKIE_SECURE=true`
  - `AUTH_COOKIE_SAME_SITE=none`
- [x] Build CloudFront-targeted frontend assets.
- [x] Verify built assets do not contain App Runner or direct EC2 API URLs.
- [x] Sync assets to S3.
- [x] Invalidate CloudFront.
- [ ] Smoke test CloudFront -> EC2 -> RDS:
  - [x] landing page
  - [x] login/session
  - [ ] admin pages
  - [x] translations/i18n
  - [x] AI pipeline fixture streaming
  - [ ] AI live streaming if enabled
  - [x] datavis
  - [x] xscan
- [x] Tighten CloudFront API error handling:
  - removed distribution-level `403/404 -> /index.html` custom error responses;
  - kept SPA route support through the existing viewer-request rewrite function;
  - verified JSON API errors for invalid `/api/*` routes.

Done when:

- CloudFront is the primary frontend.
- EC2 is the primary API.
- RDS PostgreSQL is the primary database.

---

## Phase 9 — Documentation, Rollback, and Cost Guardrails

- [ ] Update README architecture section.
- [ ] Update deployment docs:
  - frontend: S3 + CloudFront
  - backend: EC2
  - database: RDS PostgreSQL
  - IaC: Terraform
  - deployment trigger guide: push-to-master vs manual AWS deploy vs Terraform apply
- [ ] Document rollback:
  - CloudFront/frontend can point back to App Runner while it remains available.
  - App Runner can remain as a temporary backend fallback.
- [ ] Document teardown for paid resources:
  - EC2 instance
  - EBS volume
  - RDS instance
  - CloudFront distribution
  - S3 bucket contents
- [ ] Confirm the `$5` AWS budget alert remains configured.
- [ ] Add a small runbook:
  - checking EC2 service status;
  - checking RDS connectivity;
  - checking CloudFront deployment;
  - finding server logs;
  - confirming AI streaming failures.
- [ ] Decide whether to keep, disable, or archive the GitHub Pages workflow.
- [ ] Decide whether to stop or delete App Runner after EC2 is stable.
- [ ] Update roadmap and mark completed AWS migration slices.
- [ ] Track non-blocking Demo 3 browser warning in `@finografic/deps-xscan-demo`:
  - invalid HTML `pattern` regular expression for GitHub repository URL input
  - deployed scan flow still works; fix later in the external xscan demo package

Done when:

- AWS is the canonical deployment path.
- The retained resources are the minimum practical set for the demo.
- Optional paid upgrades are documented as deferred, not active requirements.

---

## Deferred Optional Upgrades

The previous App Runner/RDS and broader production-readiness plan is preserved in:

```text
docs/todo/DEFERRED_AWS_TERRAFORM_CLOUDFRONT_RDS.md
```

Deferred unless explicitly approved:

- NAT Gateway
- App Runner VPC connector path
- Secrets Manager / SSM migration
- WAF
- Route 53 / custom domain / ACM
- ALB
- ECS/Fargate
- Auto Scaling Groups
- production-grade observability/alarms beyond the existing budget alert and minimal runbook

---

## Recommended Execution Order

```text
Checkpoint A:
  Phase 0 + Phase 1

Checkpoint B:
  Phase 2 + Phase 3

Checkpoint C:
  Phase 4

Checkpoint D:
  Phase 5

Checkpoint E:
  Phase 6 + Phase 7

Checkpoint F:
  Phase 8 + Phase 9
```
