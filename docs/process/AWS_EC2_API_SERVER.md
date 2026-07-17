# AWS EC2 API Server

This document covers the low-cost EC2 API path for the AWS portfolio demo.

The active architecture is:

```text
CloudFront + S3 frontend
  -> EC2 Hono/Auth.js API
  -> RDS PostgreSQL
```

The EC2 path intentionally avoids NAT Gateway, ALB, ECS/Fargate, WAF, Route 53,
ACM, and Secrets Manager unless one of those services is explicitly accepted as
a paid upgrade later.

## Docker Image

Use the EC2-specific Dockerfile:

```bash
pnpm aws:ec2:docker:build
```

This image builds the server only. It does not bootstrap SQLite during image
build.

Local smoke run:

```bash
pnpm aws:ec2:docker:run
```

The local run expects an ignored `.env.ec2-api.local` file.

For a one-off local smoke without creating an env file, run the image with
inline environment variables and point `DATABASE_URL` at Docker Postgres through
`host.docker.internal`.

## Runtime Env

Required runtime variables:

```bash
NODE_ENV=production
PORT=4000
DB_DIALECT=postgres
DATABASE_URL=postgresql://...
AUTH_SECRET=replace-with-secret
CORS_ORIGINS=https://d2h3ihm2ddi3lx.cloudfront.net
AUTH_URL=https://d2h3ihm2ddi3lx.cloudfront.net
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
```

Optional live AI variables:

```bash
LLM_MODE=hosted
OPENCODE_API_KEY=...
OPENCODE_BASE_URL=...
OPENCODE_MODEL=...
```

Keep all real values outside source control.

Live AI streaming on EC2 uses OpenCode Go hosted mode. If these values are
missing, the server falls back to local LM Studio mode, which does not work on
the EC2 host unless an OpenAI-compatible local server is also running there.

RDS requires encrypted PostgreSQL connections. Include `sslmode=require` in the
runtime `DATABASE_URL`.

## EC2 Deployment Shape

Phase 6 provisions the host and security groups. Phase 7 deploys the API
container.

The EC2 host uses AWS Systems Manager Session Manager for administration. Keep
SSH closed unless there is a temporary, explicit reason to open it.

The minimal manual deployment path is:

1. Build the EC2 API image locally.
2. Copy or load the image on the EC2 host.
3. Create `/opt/monorepo-demo/.env`.
4. Run the container with `--restart unless-stopped`.
5. Smoke test `http://<ec2-public-dns>:4000/api/health`.

The first deployment on the `t3.micro` host used a small swap file and a mounted
Node container instead of building the full project image on the instance. This
keeps the deployment inside the small 8 GiB root volume:

1. Pull `node:24-bookworm-slim`.
2. Clone/reset `finografic/monorepo-demo` under `/opt/monorepo-demo/repo`.
3. Install/build with pnpm inside the Node container.
4. Run PostgreSQL migrations and seeds from EC2 to private RDS.
5. Start `monorepo-demo-api` with `--restart unless-stopped`.

## Validation

Local image validation:

```bash
pnpm aws:ec2:docker:build
docker run --rm --platform linux/amd64 -p 4100:4000 \
  -e NODE_ENV=production \
  -e DB_DIALECT=postgres \
  -e DATABASE_URL=postgresql://monorepo_demo:monorepo_demo@host.docker.internal:5433/monorepo_demo \
  -e AUTH_SECRET=ec2-api-smoke-secret \
  -e CORS_ORIGINS=http://localhost:3000,http://localhost:4100 \
  -e AUTH_URL=http://localhost:4100 \
  monorepo-demo-server:ec2-api
curl http://localhost:4100/api/health
```

The browser-facing CloudFront frontend should not call the direct EC2 HTTP URL
long term. Use direct EC2 HTTP only for smoke testing; the cutover should keep
the browser entry point on CloudFront HTTPS.

AWS smoke evidence:

- EC2 SSM status: online.
- RDS query from EC2 container: `select 1` succeeded with SSL.
- PostgreSQL migrations applied successfully.
- PostgreSQL seed inserted 2 users, 2 languages, and 53 translation rows.
- API container: `monorepo-demo-api` running on port `4000`.
- Public API health: `http://ec2-54-252-64-116.ap-southeast-2.compute.amazonaws.com:4000/api/health`.
- Public auth/session: `200` with unauthenticated `null` session.
- Public i18n bundle returned `ui`, `app`, and `admin` resources.
- Hosted LLM smoke from EC2 returned `ok` with model `qwen3.7-plus`.
