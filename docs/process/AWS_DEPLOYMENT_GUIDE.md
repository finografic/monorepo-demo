# AWS Deployment Guide

This guide separates normal application deployments from infrastructure changes
for the low-cost AWS demo.

**Canonical AWS URL:**

```text
https://d2h3ihm2ddi3lx.cloudfront.net/
```

**Current AWS shape:**

```text
CloudFront + S3 frontend
  /api/* -> EC2 Hono/Auth.js API
  API -> RDS PostgreSQL
```

## What Push To Master Does

Pushes to `master` still run the legacy GitHub Pages workflow.

They do not automatically deploy to AWS CloudFront, update EC2, run database
migrations, or apply Terraform.

AWS frontend deployment currently uses the manual workflow
`.github/workflows/deploy-aws-frontend.yml`, or the local commands:

```bash
pnpm aws:frontend:build
pnpm aws:frontend:sync
pnpm aws:frontend:invalidate
```

## What Requires Terraform Apply

Run Terraform only for infrastructure shape changes under
`infra/terraform/environments/demo`.

Examples that require `terraform plan` and reviewed `terraform apply`:

- CloudFront origins, behaviours, cache policies, or distribution settings.
- S3 bucket settings or bucket policy.
- EC2 instance type, root volume size, security groups, IAM role, or instance profile.
- RDS instance class, storage, engine version, subnet group, security group, or parameter group.
- GitHub Actions OIDC role or AWS IAM policy changes.
- Any new AWS service.

Terraform is not required for ordinary frontend code, server code, or seed data
changes unless the change also modifies AWS resource configuration.

## Frontend Changes

**Includes:**

- `apps/client`
- `apps/demo-ai-pipeline`
- `apps/demo-datavis`
- `apps/demo-xscan`
- `packages/shared`
- `packages/ui`
- frontend build scripts in `package.json`

**Deploy to AWS:**

```bash
pnpm aws:frontend:build
pnpm aws:frontend:sync
pnpm aws:frontend:invalidate
```

Terraform is required only if the frontend change also needs CloudFront, S3,
IAM, or other infrastructure changes.

## Server Changes

**Includes:**

- `apps/server`
- server-facing shared code
- runtime env expectations
- API routes, Auth.js, streaming, and database adapters

**Deploy to AWS EC2:**

1. Update the checked-out repo under `/opt/monorepo-demo/repo`.
2. Install/build with pnpm inside the Node container.
3. Restart the `monorepo-demo-api` container.
4. Smoke test:

```bash
curl https://d2h3ihm2ddi3lx.cloudfront.net/api/health
```

Terraform is required only when the server change also needs EC2, security
group, IAM, CloudFront origin behaviour, or RDS infrastructure changes.

## Database Changes

**Schema changes:**

1. Update PostgreSQL schema files.
2. Generate and commit PostgreSQL migrations.
3. Deploy server code if needed.
4. Run migrations against RDS from EC2 or another approved private path.

**Seed data changes:**

- Changed seed source files do not update RDS by themselves.
- Run the PostgreSQL seed command against RDS after deployment.
- Review whether the seed operation is idempotent before running it on live demo data.

**Local SQLite data changes:**

- Local SQLite database contents are not deployed to AWS.
- AWS uses RDS PostgreSQL as the primary database.

Terraform is required only for RDS infrastructure changes, not normal table
structure migrations or seed data updates.

## Infrastructure Changes

Use this flow:

```bash
cd infra/terraform/environments/demo
terraform fmt
terraform validate
terraform plan -input=false -out=tfplan
terraform apply tfplan
rm -f tfplan
```

Do not commit `tfplan` or local Terraform state files.

## Current Manual Smoke Checks

```bash
curl https://d2h3ihm2ddi3lx.cloudfront.net/
curl https://d2h3ihm2ddi3lx.cloudfront.net/api/health
curl https://d2h3ihm2ddi3lx.cloudfront.net/api/auth/session
curl 'https://d2h3ihm2ddi3lx.cloudfront.net/api/i18n/translations?lng=en-GB'
curl -N https://d2h3ihm2ddi3lx.cloudfront.net/api/stream/fixture/change-address
```

**Also check:**

- `/demo-ai-pipeline/`
- `/demo-datavis/`
- `/demo-xscan/`
