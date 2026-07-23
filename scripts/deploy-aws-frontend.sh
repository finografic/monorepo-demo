#!/usr/bin/env bash
set -euo pipefail

BUCKET="s3://monorepo-demo-demo-frontend"
DISTRIBUTION_ID="ERCVOSB81GPS9"
REGION="ap-southeast-2"

pnpm aws:frontend:build

# Content-hashed assets (filenames change on every build) are safe to cache forever.
# Keep previous hashes in the bucket so stale HTML in a browser or CloudFront edge
# does not break by referencing an asset deleted by a newer deploy.
aws s3 sync pages "$BUCKET" \
  --region "$REGION" \
  --exclude '*.html' \
  --cache-control 'public,max-age=31536000,immutable'

# HTML entry points keep stable filenames, so they must always be revalidated -
# otherwise a browser (or CloudFront) can keep serving an old index.html that
# references hashed asset files a later deploy's --delete has already removed,
# which surfaces as 403s on the old asset URLs.
aws s3 sync pages "$BUCKET" \
  --region "$REGION" \
  --exclude '*' \
  --include '*.html' \
  --cache-control 'no-cache'

aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths '/*'
