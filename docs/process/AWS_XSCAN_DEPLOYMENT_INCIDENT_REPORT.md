# AWS xscan Deployment Incident Report

Date: 2026-07-23

This report documents the cross-repo incident where the AWS-hosted portfolio app recovered from a
blank CloudFront frontend, but Demo 3 (`demo-xscan`) then failed with `Failed to fetch` in the
embedded terminal.

The incident involved two repos:

- `monorepo-demo`: CloudFront/S3 frontend deploy, `/api/xscan/*` proxy, and demo wrapper.
- `@finografic/deps-xscan`: hosted xscan API container and GitHub lockfile materialization.

## Final State

- CloudFront frontend is canonical: `https://d2h3ihm2ddi3lx.cloudfront.net/`.
- `demo-xscan` must call the same-origin proxy path: `/api/xscan`.
- `monorepo-demo-api` proxies `/api/xscan/*` to `XSCAN_API_URL`, currently `http://127.0.0.1:4001`.
- `deps-xscan-api` runs separately on the same EC2 instance, on host port `4001`.
- `deps-xscan-api` is not public; CloudFront reaches it only through `monorepo-demo-api`.
- The old Render API URL, `https://deps-xscan-api.onrender.com`, is legacy only and must not be
  baked into the AWS build.

## What Broke

### monorepo-demo

The immediate blank-page issue was caused by a stale HTML plus deleted asset mismatch:

1. Browsers or CloudFront edges still had older HTML.
2. That stale HTML referenced older Vite-hashed asset names.
3. The frontend deploy had used `aws s3 sync --delete` for non-HTML files.
4. The old hashed assets were deleted from the private S3 bucket.
5. CloudFront/S3 returned `403 Forbidden` for the missing private objects.
6. The app loaded no JS/CSS, so the page went blank.

After restoring old asset keys, a second issue appeared:

1. Some stale `demo-xscan` JS bundles still contained the old Render API URL.
2. Once old bundles were restored, stale HTML could load old JS successfully.
3. That old JS called `https://deps-xscan-api.onrender.com/api/scan`.
4. Render returned `404`, and the embedded terminal showed `Failed to fetch`.

### deps-xscan

The EC2 xscan API was reachable, but scans could still fail:

1. `deps-xscan-api` runs without `NPM_TOKEN`, `GH_TOKEN`, or `GITHUB_TOKEN`.
2. The API asked `https://api.github.com/repos/:owner/:repo` for default-branch metadata.
3. GitHub sometimes returned unauthenticated `403`.
4. The API aborted before trying raw lockfile URLs.
5. The SSE stream returned an error instead of scan output.

This was separate from the Render/stale-bundle issue. The proxy and container were alive:

```sh
curl https://d2h3ihm2ddi3lx.cloudfront.net/api/xscan/api/health
```

returned:

```json
{"ok":true}
```

## Fixes Applied

### monorepo-demo: Stop Deleting Old Hashed Assets

Updated `scripts/deploy-aws-frontend.sh` so the non-HTML S3 sync does not use `--delete`.

Why:

- Hashed Vite assets are immutable and cheap to keep.
- Old HTML can survive briefly in browsers or CloudFront edges.
- Keeping old hashes prevents old HTML from breaking the app.

Do this:

```sh
aws s3 sync pages s3://monorepo-demo-demo-frontend \
  --region ap-southeast-2 \
  --exclude '*.html' \
  --cache-control 'public,max-age=31536000,immutable'
```

Do not do this for normal frontend deploys:

```sh
aws s3 sync pages s3://monorepo-demo-demo-frontend --delete
```

HTML files remain separately uploaded with `no-cache`, then CloudFront is invalidated.

### monorepo-demo: Add Root Favicon

Updated `scripts/build-aws-frontend.sh` to copy the shared SVG favicon to `pages/favicon.ico`.

Why:

- Browsers probe `/favicon.ico` before app JS sets the SVG favicon.
- Without the root object, CloudFront/S3 returned `403`.
- This did not blank the app, but it made debugging noisier.

### monorepo-demo: Repair Existing S3 Objects

Restored or repointed stale asset keys so already-cached HTML could recover:

- Root app stale keys:
  - `/assets/index-BGHiT8i7.js`
  - `/assets/index-D4xU64YH.css`
- `demo-xscan` stale keys:
  - old `/demo-xscan/assets/index-*.js`
  - old `/demo-xscan/assets/index-*.css`

Important nuance:

- Restoring an old JS object from version history can restore old behavior.
- For `demo-xscan`, old JS objects were repointed to the current JS content instead, so stale HTML
  would load current `/api/xscan` behavior rather than old Render behavior.

Useful diagnostics:

```sh
aws s3api list-object-versions \
  --bucket monorepo-demo-demo-frontend \
  --prefix demo-xscan/assets/index-

curl -I https://d2h3ihm2ddi3lx.cloudfront.net/demo-xscan/
curl -I https://d2h3ihm2ddi3lx.cloudfront.net/demo-xscan/assets/index-B8OHMwSr.js
```

### monorepo-demo: Invalidate CloudFront

After bucket repairs and deploy script fixes:

```sh
aws cloudfront create-invalidation \
  --distribution-id ERCVOSB81GPS9 \
  --paths '/*'
```

or for xscan-specific repair:

```sh
aws cloudfront create-invalidation \
  --distribution-id ERCVOSB81GPS9 \
  --paths '/demo-xscan/*'
```

### deps-xscan: Fallback When GitHub Metadata Lookup Is Blocked

Updated `demo/api/materialize-github.ts`:

- Try GitHub metadata default branch when available.
- If metadata lookup fails, try raw lockfile fetches against `main` and `master`.
- Only require a supported lockfile (`pnpm-lock.yaml` or `package-lock.json`) before running xscan.

Why:

- Raw GitHub content often remains available even when the REST metadata endpoint returns `403`.
- Demo targets such as `OWASP/NodeGoat` can still materialize from `master`.

Verified live with:

```sh
curl -i -N --max-time 25 \
  'https://d2h3ihm2ddi3lx.cloudfront.net/api/xscan/api/scan?repoUrl=https%3A%2F%2Fgithub.com%2FOWASP%2FNodeGoat&skipGithub=1'
```

Expected early SSE output:

```text
event: start
data: "OWASP/NodeGoat"

event: output
data: "[demo] Materialized package.json, package-lock.json @ master"
```

## EC2 Runtime Repair

The durable EC2 path should be:

```sh
git -C /opt/deps-xscan/repo pull
docker build --platform linux/amd64 \
  --secret id=npm_token,env=NPM_TOKEN \
  -f Dockerfile.ec2-xscan-api \
  -t deps-xscan-api:latest \
  /opt/deps-xscan/repo
docker rm -f deps-xscan-api
docker run -d \
  --name deps-xscan-api \
  --restart unless-stopped \
  --network host \
  -e PORT=4001 \
  -e NPM_TOKEN \
  deps-xscan-api:latest
```

During this incident, the Docker rebuild failed because EC2 did not have a valid private GitHub
Packages token for `@finografic/*` packages:

```text
ERR_PNPM_FETCH_401
GET https://npm.pkg.github.com/download/@finografic/cli-kit/...
Unauthorized - 401
```

Temporary runtime repair used:

1. Copy patched `demo/api/materialize-github.ts` into the running container.
2. Restart `deps-xscan-api`.

That fixed production immediately but is not a substitute for a token-backed rebuild.

## What Another Agent Likely Got Wrong

### In monorepo-demo

- Used or preserved `aws s3 sync --delete` for hashed frontend assets.
- Treated restoring deleted assets as enough without checking whether the restored JS contained old
  Render wiring.
- Did not verify the actual live request URL in browser DevTools.
- Did not check that AWS build output contained `/api/xscan` instead of `https://deps-xscan-api.onrender.com`.
- Focused on frontend asset recovery without separately smoke testing `/api/xscan/api/health` and
  `/api/xscan/api/scan`.

### In deps-xscan

- Added `Dockerfile.ec2-xscan-api`, but the deployment path did not ensure EC2 had a valid
  `NPM_TOKEN` for private GitHub Packages during Docker build.
- Ran the xscan API container without `NPM_TOKEN`, `GH_TOKEN`, or `GITHUB_TOKEN`, leaving GitHub API
  calls subject to anonymous 403/rate limits.
- Left the scan path dependent on GitHub REST metadata before attempting raw lockfile fetches.
- Did not validate the API through the real CloudFront path after deployment.

## Required Guardrails

### Agents Must Do

- Verify live browser requests in DevTools before changing infra.
- Check live HTML and live asset URLs with `curl`.
- Check S3 object versions before restoring or deleting hashed assets.
- Keep old hashed assets in S3 for normal deploys.
- Upload HTML with `Cache-Control: no-cache`.
- Invalidate CloudFront after frontend deploys or manual S3 object repairs.
- Confirm AWS `demo-xscan` bundles call `/api/xscan`, not Render.
- Smoke test:
  - `/api/xscan/api/health`
  - `/api/xscan/api/scan?...`
- Treat `deps-xscan-api` as a separate EC2 container with a separate deployment lifecycle.
- Pass a valid `NPM_TOKEN` when rebuilding `deps-xscan-api` from Docker.
- Prefer a real image rebuild over hot-patching containers; use hot-patching only as emergency repair.

### Agents Must Avoid

- Do not use `--delete` against S3 hashed frontend assets during normal deploys.
- Do not restore old JS bundles blindly; old bundles can reintroduce removed API URLs.
- Do not point AWS `demo-xscan` directly at Render.
- Do not expose `deps-xscan-api` publicly; keep it behind the `/api/xscan/*` proxy.
- Do not assume `/api/xscan/health` is the correct health route; the proxied upstream route is
  `/api/xscan/api/health`.
- Do not rebuild the EC2 Docker image without checking private package token availability.
- Do not print token values in SSM output, shell logs, or docs.

## Fast Triage Checklist

1. Blank page:

   ```sh
   curl -fsS https://d2h3ihm2ddi3lx.cloudfront.net/ | sed -n '1,20p'
   curl -I https://d2h3ihm2ddi3lx.cloudfront.net/assets/<asset-from-html>.js
   ```

2. Demo 3 calling Render:

   ```sh
   grep -R 'deps-xscan-api.onrender.com\|onrender' pages/demo-xscan apps/demo-xscan/dist
   ```

3. xscan API health:

   ```sh
   curl https://d2h3ihm2ddi3lx.cloudfront.net/api/xscan/api/health
   ```

4. xscan scan stream:

   ```sh
   curl -i -N --max-time 25 \
     'https://d2h3ihm2ddi3lx.cloudfront.net/api/xscan/api/scan?repoUrl=https%3A%2F%2Fgithub.com%2FOWASP%2FNodeGoat&skipGithub=1'
   ```

5. EC2 container status:

   ```sh
   aws ssm send-command \
     --instance-ids i-0805afb8519b94f3d \
     --document-name AWS-RunShellScript \
     --parameters commands='["docker ps --format '\''{{.Names}} {{.Image}} {{.Status}}'\''"]'
   ```
