#!/usr/bin/env bash
# Cursor Cloud Agent Build用のrepo-owned install phase。
# runtimeはdigest固定Dockerfileが所有し、本scriptはhost toolchainを書き換えない。
set -euo pipefail

readonly REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() { printf '[helix-cursor-cloud] %s\n' "$*"; }

node -e '
const [major, minor, patch] = process.versions.node.split(".").map(Number);
if (major !== 24 || minor < 15 || !Number.isInteger(patch)) {
  console.error(`HELIX requires Node >=24.15.0 <25; observed ${process.version}`);
  process.exit(1);
}
'

cd "$REPO_DIR"
log "installing the frozen dependency graph"
npm ci

log "verifying the typed boundary"
npm run typecheck
npm run build
npm exec -- vitest run tests/cursor-cloud-environment.test.ts
npm run helix -- status --json

log "Cursor Cloud Agent Build completed"
