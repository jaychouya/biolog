#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "需要 VERCEL_TOKEN。获取: https://vercel.com/account/tokens"
  echo "用法: VERCEL_TOKEN=xxx VITE_API_URL=... VITE_SITE_URL=... $0"
  exit 1
fi

: "${VITE_API_URL:?设置后端 URL}"
: "${VITE_SITE_URL:?设置前端 URL（可先 deploy 后再 redeploy 更新）}"

cd "$ROOT/frontend"
export VITE_API_URL VITE_SITE_URL
npm run build
npx vercel@latest deploy --prebuilt --prod --yes --token "$VERCEL_TOKEN"
