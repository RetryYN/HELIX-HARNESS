#!/usr/bin/env bash
# Phase 0-B: main の branch protection 適用 (一回限り ops、要件 §6.5/§9.1)。
#
# helix setup は既定でこのスクリプトを「生成」するのみ (emit-only)。
# 明示的に実行した場合は gh の認証状態と repository admin 権限を使って remote GitHub 設定を変更する。
# token は本スクリプト / harness に保持しない。
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

gh auth status >/dev/null
gh api -X PUT "repos/${REPO}/branches/main/protection" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=harness-check" \
  -f "enforce_admins=true" \
  -f "required_pull_request_reviews[required_approving_review_count]=1" \
  -f "restrictions="

echo "main の branch protection を適用しました: ${REPO}"
