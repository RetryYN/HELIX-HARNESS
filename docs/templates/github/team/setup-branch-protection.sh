#!/usr/bin/env bash
# Phase 0-B: main の branch protection 適用 (一回限り ops、要件 §6.5/§9.1)。
#
# ut-tdd setup は既定でこのスクリプトを「生成」するのみ (emit-only)。
# branch protection 変更は本番 merge ゲートの変更 = 認可・本番影響であり、
# action-binding approval record なしに remote GitHub 設定を変更しない。
#
# このファイルは実適用コマンドではなく、承認前 checklist である。
# token は本スクリプト / harness に保持しない。
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

echo "main の branch protection は action-binding approval が必要です: ${REPO}"
echo "  - harness-check を Required Status Check (strict) に登録"
echo "  - 必須レビュー承認数 = 1 / 管理者も対象 (enforce_admins)"
echo "承認前に `ut-tdd action-binding approval-packet --json` と setup dry-run / doctor evidence を確認してください。"
echo "この script は remote GitHub API を呼びません。"
exit 2
