#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
  echo "需要 RAILWAY_TOKEN。获取: Railway Dashboard → Account → Tokens"
  echo "用法: RAILWAY_TOKEN=xxx $0"
  exit 1
fi

cd "$ROOT/backend"
npx @railway/cli@latest up --service biolog-api --detach --ci
