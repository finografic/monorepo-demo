#!/usr/bin/env bash
set -euo pipefail

rm -rf pages

AWS_FRONTEND_URL="${VITE_AWS_FRONTEND_URL:-https://d2h3ihm2ddi3lx.cloudfront.net}"

VITE_AWS_FRONTEND_URL="${AWS_FRONTEND_URL}" VITE_API_BASE_URL= VITE_BASE_PATH=/ pnpm --filter @workspace/client build:pages
VITE_AUTH_API_BASE_URL= VITE_API_BASE_URL= VITE_BASE_PATH=/demo-ai-pipeline/ pnpm --filter @workspace/demo-ai-pipeline build:pages
VITE_AUTH_API_BASE_URL= VITE_API_BASE_URL= VITE_BASE_PATH=/demo-datavis/ pnpm --filter @workspace/demo-datavis build:pages
VITE_AUTH_API_BASE_URL= VITE_API_BASE_URL= VITE_DEMO_XSCAN_API_BASE_URL=https://deps-xscan-api.onrender.com VITE_BASE_PATH=/demo-xscan/ pnpm --filter @workspace/demo-xscan build:pages

mkdir -p pages/demo-ai-pipeline pages/demo-datavis pages/demo-xscan
cp -R apps/client/dist/. pages/
cp -R apps/demo-ai-pipeline/dist/. pages/demo-ai-pipeline/
cp -R apps/demo-datavis/dist/. pages/demo-datavis/
cp -R apps/demo-xscan/dist/. pages/demo-xscan/
cp pages/index.html pages/404.html
