#!/usr/bin/env bash
# Phase 0-B: main の branch protection 適用 (一回限り ops、要件 §6.5/§9.1)。
#
# helix setup は既定でこのスクリプトを「生成」するのみ (emit-only)。
# 明示的に実行した場合は gh の認証状態と repository admin 権限を
# GitHub 側で検査し、権限が無ければ remote GitHub 設定を変更しない。
# token は本スクリプト / harness に保持しない。
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

gh auth status >/dev/null
ADMIN="$(gh api "repos/${REPO}" -q '.permissions.admin')"
if [[ "${ADMIN}" != "true" ]]; then
  echo "repository admin permission is required before branch protection apply" >&2
  exit 2
fi

gh api -X PUT "repos/${REPO}/branches/main/protection" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=harness-check" \
  -f "enforce_admins=true" \
  -f "required_pull_request_reviews[required_approving_review_count]=1" \
  -f "restrictions="

echo "main の branch protection を適用しました: ${REPO}"
