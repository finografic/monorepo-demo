# TODO — AWS Terraform CloudFront RDS Migration

> **Created:** 2026-07-15
>
> **Branch:** `feat/aws-terraform-cloudfront-rds`
>
> **Goal:** migrate the portfolio deployment toward a more production-like AWS shape with Terraform-managed infrastructure, S3 + CloudFront frontend hosting, App Runner API hosting, RDS PostgreSQL, managed secrets/config, and basic observability.
>
> **Positioning:** keep the current App Runner deployment as the working backend baseline. Replace GitHub Pages only after the S3 + CloudFront path is proven. Replace SQLite only after local PostgreSQL and RDS are both proven.

Context:

- [DONE — AWS Lambda + API Gateway Demo](./DONE_AWS_LAMBDA_DEMO.md)
- [TODO — AWS Full Server App Runner Demo](./TODO_AWS_FULL_SERVER_APP_RUNNER.md)
- [AWS App Runner Full Server Demo](../process/AWS_APP_RUNNER_FULL_SERVER.md)
- [Portfolio Deployment](../process/PORTFOLIO_DEPLOYMENT.md)

---

## Interview story

Target narrative:

```text
CloudFront
  -> S3 static React/Vite frontend
  -> AWS App Runner Hono/Auth.js API
  -> RDS PostgreSQL
  -> Secrets Manager / SSM config
  -> CloudWatch logs, alarms, and budget guardrails
```

The aim is to show pragmatic full-stack AWS delivery:

- Incremental migration from a working deployment.
- Terraform-managed infrastructure.
- Static frontend hosting through S3 + CloudFront.
- Containerised Node API on App Runner.
- Relational data on PostgreSQL/RDS.
- Server-side secrets and operational visibility.
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
- Avoid ECS/Fargate until the RDS + CloudFront + Terraform path is complete.

---

## Target architecture

```text
Browser
  -> CloudFront default domain
  -> private S3 bucket with built React/Vite assets
  -> App Runner public API URL
  -> RDS PostgreSQL
```

Optional later architecture:

```text
Browser
  -> CloudFront
  -> S3 frontend
  -> ECS Fargate / ALB API
  -> RDS PostgreSQL
```

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

- [ ] Add local PostgreSQL setup, preferably Docker Compose.
- [ ] Add local `DATABASE_URL` documentation for PostgreSQL.
- [ ] Update Drizzle database config for PostgreSQL.
- [ ] Review schema differences:
  - timestamps
  - booleans
  - IDs
  - defaults
  - JSON/text fields
  - indexes and constraints
- [ ] Generate PostgreSQL-compatible migrations.
- [ ] Update seed flow for PostgreSQL.
- [ ] Validate local flows:
  - auth/session
  - admin pages
  - translations/i18n
  - AI streaming
  - datavis
  - xscan

Done when:

- Local app runs against PostgreSQL end-to-end.
- SQLite is either documented as legacy/demo fallback or removed from the active path.

---

## Checkpoint D — RDS-backed App Runner

Includes:

- Phase 5 — RDS PostgreSQL

Deployability requirement:

- App Runner API works against RDS PostgreSQL.
- CloudFront frontend works against the RDS-backed API.
- SQLite is no longer required for the deployed demo.

---

## Phase 5 — RDS PostgreSQL

- [ ] Use Terraform to create RDS PostgreSQL.
- [ ] Add DB subnet group and security group.
- [ ] Decide network shape:
  - simplest secure demo path, or
  - private RDS + App Runner VPC connector.
- [ ] Account for public outbound needs from the API, especially hosted AI provider calls.
- [ ] Store database credentials outside source control.
- [ ] Run migrations against RDS.
- [ ] Run seeds against RDS.
- [ ] Update App Runner runtime configuration to use the RDS `DATABASE_URL`.
- [ ] Smoke test deployed flows:
  - `/api/health`
  - auth/session
  - AI live streaming
  - translations/i18n
  - xscan execution

Done when:

- The deployed App Runner API uses RDS PostgreSQL.
- CloudFront frontend can be used as the main demo entry point.

---

## Checkpoint E — Production-readiness polish

Includes:

- Phase 6 — Secrets Manager / SSM
- Phase 7 — Observability
- Phase 8 — Clean cutover and docs

Deployability requirement:

- AWS is the canonical deployment path.
- Secrets/config are managed intentionally.
- Logs, alarms, and teardown docs are in place.

---

## Phase 6 — Secrets Manager / SSM

- [ ] Classify runtime values as secret or non-secret config.
- [ ] Move secret values to Secrets Manager or SSM SecureString:
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `OPENCODE_API_KEY`
- [ ] Move non-secret config to SSM Parameter Store where useful.
- [ ] Update Terraform to manage references without committing secret values.
- [ ] Update App Runner environment configuration.
- [ ] Confirm no provider keys are exposed through `VITE_*` variables.

Done when:

- App Runner starts using managed secret/config references.
- No sensitive runtime value is stored in source control.

---

## Phase 7 — Observability and cost guardrails

- [ ] Configure CloudWatch log retention.
- [ ] Add basic alarms where practical:
  - App Runner errors or 5xx indicators
  - RDS CPU/storage/connections
  - budget/cost alert
- [ ] Add a small runbook for:
  - checking App Runner status
  - checking CloudFront deployment
  - checking RDS connectivity
  - finding API logs
  - confirming AI streaming failures
- [ ] Document known cost-bearing resources and teardown commands.

Done when:

- There is a clear observe/debug/rollback story for the AWS deployment.

---

## Phase 8 — Clean cutover and docs

- [ ] Update README architecture section.
- [ ] Update deployment docs:
  - frontend: S3 + CloudFront
  - backend: App Runner
  - database: RDS PostgreSQL
  - IaC: Terraform
- [ ] Decide whether to keep, disable, or archive the GitHub Pages workflow.
- [ ] Update repo description/topics if useful.
- [ ] Update roadmap and mark completed AWS migration slices.
- [ ] Add final smoke-test checklist.
- [ ] Track non-blocking Demo 3 browser warning in `@finografic/deps-xscan-demo`:
  - invalid HTML `pattern` regular expression for GitHub repository URL input
  - deployed scan flow still works; fix later in the external xscan demo package

Done when:

- CloudFront is the primary frontend.
- App Runner is the primary API.
- RDS PostgreSQL is the primary database.
- Terraform describes the retained AWS infrastructure.

---

## Phase 9 — Optional ECS Fargate comparison

Only start this after Checkpoint E.

- [ ] Decide whether ECS/Fargate materially improves interview positioning.
- [ ] Reuse the existing server Docker image.
- [ ] Add Terraform for:
  - ECS cluster
  - task definition
  - service
  - ALB
  - target group
  - security groups
- [ ] Keep App Runner documented as the simpler managed-container option.

Done when:

- ECS/Fargate can be discussed as an optional enterprise container path, not a blocker for the main portfolio deployment.

---

## Recommended execution order

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
  Phase 6 + Phase 7 + Phase 8
```

Do not begin Phase 9 until the main AWS path is stable.
