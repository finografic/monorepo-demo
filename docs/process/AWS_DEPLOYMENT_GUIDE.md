# AWS Deployment Guide

This guide separates normal application deployments from infrastructure changes
for the low-cost AWS demo.

## Deployment Decision Checklist

Use this checklist first, then follow the matching detailed section below:

- **Frontend code changed:** run `pnpm aws:frontend:build`, `pnpm aws:frontend:sync`, and `pnpm aws:frontend:invalidate`.
- **Terraform infrastructure changed:** run `terraform plan -out=tfplan`, review it, then run `terraform apply tfplan`.
- **Server runtime env changed:** update EC2 `/opt/monorepo-demo/.env` over SSM and restart `monorepo-demo-api`.
- **Server code changed:** pull/reset the repo on EC2, install/build, then restart `monorepo-demo-api`.
- **Database schema changed:** deploy code if needed, then run RDS PostgreSQL migrations from EC2 or another approved private path.
- **Seed data changed:** run the RDS seed command only after confirming the seed is safe and idempotent.

---

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

Live AI streaming requires hosted LLM runtime variables on EC2:

```bash
LLM_MODE=hosted
OPENCODE_API_KEY=...
OPENCODE_BASE_URL=https://opencode.ai/zen/go/v1
OPENCODE_MODEL=qwen3.7-plus
```

**Runtime env update over SSM:**

Use SSM for runtime-only changes that do not require a git deploy or Terraform.
This example appends/replaces hosted LLM settings, restarts the API container,
and smoke-tests health.

```bash
cat > /tmp/monorepo-demo-runtime-update.json <<'JSON'
{
  "commands": [
    "set -euo pipefail",
    "python3 - <<'PY'\nfrom pathlib import Path\npath = Path('/opt/monorepo-demo/.env')\nlines = path.read_text().splitlines()\nremove = {'LLM_MODE', 'OPENCODE_API_KEY', 'OPENCODE_BASE_URL', 'OPENCODE_MODEL'}\nlines = [line for line in lines if line.split('=', 1)[0] not in remove]\nlines.extend([\n  'LLM_MODE=hosted',\n  'OPENCODE_API_KEY=replace-with-secret',\n  'OPENCODE_BASE_URL=https://opencode.ai/zen/go/v1',\n  'OPENCODE_MODEL=qwen3.7-plus',\n])\npath.write_text('\\n'.join(lines) + '\\n')\npath.chmod(0o600)\nPY",
    "docker rm -f monorepo-demo-api >/dev/null 2>&1 || true",
    "docker run -d --name monorepo-demo-api --restart unless-stopped -p 4000:4000 --env-file /opt/monorepo-demo/.env -v /opt/monorepo-demo/repo:/app -w /app node:24-bookworm-slim bash -lc 'node apps/server/dist/index.mjs'",
    "sleep 3",
    "curl -fsS http://localhost:4000/api/health"
  ],
  "executionTimeout": ["300"]
}
JSON

aws ssm send-command \
  --region ap-southeast-2 \
  --instance-ids i-0805afb8519b94f3d \
  --document-name AWS-RunShellScript \
  --comment 'monorepo-demo runtime env update' \
  --parameters file:///tmp/monorepo-demo-runtime-update.json
```

Do not commit the temporary SSM parameter file if it contains secrets. Prefer
deleting it after the command is accepted.

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
