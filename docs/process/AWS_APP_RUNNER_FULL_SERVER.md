# AWS App Runner Full Server Demo

This doc covers the fuller AWS backend demo:

```text
GitHub Pages client -> AWS App Runner -> full apps/server Hono API
```

The existing Lambda/API Gateway deployment remains the small serverless contrast point. App Runner is
for running the same long-lived Node server shape used by Render.

## Why App Runner

Use App Runner for this interview slice because the full server has behaviour that is awkward to force
into Lambda:

- Auth routes and cross-origin cookies
- SQLite plus native `better-sqlite3`
- Long-lived Node server startup assumptions
- Streaming routes that are easier to reason about on a container service

For production, SQLite should move to Postgres/RDS or another durable data service. For this short
demo, SQLite inside the container service is acceptable only as a temporary demo constraint.

The demo image seeds the SQLite database at image build time so App Runner can start the server directly
on a small instance. This is intentionally not a production persistence model.

## Local container build

The Dockerfile lives at:

```text
apps/server/Dockerfile.app-runner
```

Build from the server workspace:

```sh
pnpm --filter @workspace/server app-runner:docker:build
```

If private `@finografic/*` packages require auth during install, export `NPM_TOKEN` first:

```sh
export NPM_TOKEN="..."
pnpm --filter @workspace/server app-runner:docker:build
```

The token is passed as a Docker BuildKit secret. Do not put it in the Dockerfile or commit it to an env
file.

## Local container smoke

Create a local-only env file named `.env.app-runner.local` at the repo root:

```sh
NODE_ENV=production
PORT=4000
API_BASE_PATH=/api
DB_NAME=monorepo-demo.sqlite.db
AUTH_SECRET=replace-with-a-32-character-demo-secret
AUTH_URL=http://localhost:4000/api/auth
AUTH_COOKIE_PREFIX=monorepo-demo
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_SECURE=false
AUTH_INVALIDATE_JWT_ON_SERVER_BOOT=false
CORS_ORIGINS=http://localhost:3000,https://finografic.github.io
LLM_MODE=hosted
OPENCODE_BASE_URL=https://opencode.ai/zen/go/v1
OPENCODE_MODEL=qwen3.7-plus
```

Then run:

```sh
pnpm --filter @workspace/server app-runner:docker:run
curl http://localhost:4000/api/health
```

Add live provider keys only when you intentionally smoke test live routes. Fixture-first demos do not
need provider keys.

## AWS deployment shape

Use ECR as the image source for App Runner:

```text
local Docker build -> ECR image -> App Runner service
```

This avoids giving App Runner source-build access to private package tokens.

## Account plan blocker

The first App Runner create attempt was blocked on 2026-07-14:

```text
SubscriptionRequiredException: The AWS Access Key Id needs a subscription for the service
```

This is expected for an AWS Free account plan when the target service is not in the limited free-plan
service set. The image is already built and pushed to ECR, but App Runner service creation requires
upgrading the AWS account to the Paid plan or choosing a service that is available in the current Free
account plan.

After account activation, App Runner deployed successfully:

```text
Service: monorepo-demo-server
Region: ap-southeast-2
URL: https://qvyq3mdegk.ap-southeast-2.awsapprunner.com
Instance: 0.25 vCPU / 0.5 GB
Health check: /api/health
```

The first deployment attempt failed because runtime DB bootstrap was killed on the smallest instance
with exit code `137`. The Docker image now seeds the SQLite demo database during image build and starts
the server directly with `node apps/server/dist/index.mjs`.

Recommended region:

```text
ap-southeast-2
```

Recommended ECR repository name:

```text
monorepo-demo-server
```

Recommended App Runner service name:

```text
monorepo-demo-server
```

## Push image to ECR

Set shell variables:

```sh
AWS_REGION=ap-southeast-2
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_REPOSITORY=monorepo-demo-server
IMAGE_TAG=interview-demo
IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG"
```

Create the repository once:

```sh
aws ecr create-repository \
  --repository-name "$ECR_REPOSITORY" \
  --region "$AWS_REGION"
```

Login, tag, and push:

```sh
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

docker tag monorepo-demo-server:app-runner "$IMAGE_URI"
docker push "$IMAGE_URI"
```

## Create App Runner service

For the interview demo, the AWS Console path is acceptable and easier to verify visually:

1. Open App Runner.
2. Create service.
3. Source: Container registry.
4. Provider: Amazon ECR.
5. Image URI: the pushed `IMAGE_URI`.
6. Deployment trigger: manual.
7. Port: `4000`.
8. Health check path: `/api/health`.
9. CPU/memory: lowest practical setting.
10. Runtime env vars: configure the production values below.

Minimum runtime env vars:

```sh
NODE_ENV=production
PORT=4000
API_BASE_PATH=/api
DB_NAME=monorepo-demo.sqlite.db
AUTH_SECRET=<generated-secret>
AUTH_URL=https://<app-runner-url>/api/auth
AUTH_COOKIE_PREFIX=monorepo-demo
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
AUTH_INVALIDATE_JWT_ON_SERVER_BOOT=false
CORS_ORIGINS=https://finografic.github.io
LLM_MODE=hosted
OPENCODE_BASE_URL=https://opencode.ai/zen/go/v1
OPENCODE_MODEL=qwen3.7-plus
```

Only add `OPENCODE_API_KEY` if live hosted LLM calls are part of the demo.

Current demo API URL:

```text
https://qvyq3mdegk.ap-southeast-2.awsapprunner.com
```

## GitHub Pages client wiring

For a hosted demo, point the Pages build at the App Runner API URL through the existing repository
variable path rather than hard-coding a URL:

```text
DEMO_API_BASE_URL=https://<app-runner-url>
```

Keep Render as a fallback until the AWS smoke test passes.

Smoke test order:

1. `GET /api/health` against App Runner.
2. `GET /api/reference` against App Runner.
3. GitHub Pages client loads with no CORS errors.
4. Auth flow only if needed for the interview.
5. Live stream route only if intentionally enabled.

## Teardown

After the interview:

1. Delete the App Runner service.
2. Delete the ECR image or repository if not retaining it.
3. Check Billing and Cost Management.
4. Confirm no unexpected App Runner, ECR, or CloudWatch charges are active.

Do not delete the Lambda stack unless you also want to remove the completed serverless stub demo.

Current App Runner service teardown command:

```sh
aws apprunner delete-service \
  --service-arn arn:aws:apprunner:ap-southeast-2:906655020591:service/monorepo-demo-server/60eb771e297f49fab58825d67e4a32be \
  --region ap-southeast-2
```

If App Runner remains blocked and the pushed image is no longer needed, clean up the partial resources:

```sh
aws ecr delete-repository \
  --repository-name monorepo-demo-server \
  --region ap-southeast-2 \
  --force

aws iam detach-role-policy \
  --role-name AppRunnerEcrAccessRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess

aws iam delete-role --role-name AppRunnerEcrAccessRole
```

## Interview talking points

- Lambda was useful for a small API Gateway/serverless proof.
- App Runner is a better fit for the full long-lived Node API.
- SQLite is a demo shortcut; Postgres/RDS is the production answer.
- GitHub Pages and the API remain separately deployable.
- Secrets stay server-side; no provider keys are exposed through `VITE_*`.
- The next production step would be IaC plus CI/CD around image build, ECR push, and App Runner deploy.
