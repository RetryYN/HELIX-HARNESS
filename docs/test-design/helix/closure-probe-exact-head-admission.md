---
title: "closure evidence-probe exact HEAD実行許可テスト設計"
status: draft
canonical_layer: L7
canonical_pair: L6-L7
plan_id: PLAN-RECOVERY-1753-closure-probe-exact-head
parent_design: docs/design/helix/L6-function-design/closure-probe-exact-head-admission.md
pair_artifact: docs/design/helix/L6-function-design/closure-probe-exact-head-admission.md
---

# closure evidence-probe exact HEAD実行許可テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-CLPROBE-001 | clean exact HEAD | cleanかつcurrent worktreeとremote refが同一HEADならverified | `tests/closure-evidence-probe-context.test.ts` |
| U-CLPROBE-002 | dirty tree | conflictまたはuntrackedがあれば実行前blocked、dirty digestを保持 | `tests/closure-evidence-probe-context.test.ts` |
| U-CLPROBE-003 | remote drift | local HEADがremote refに存在しなければblocked | `tests/closure-evidence-probe-context.test.ts` |
| U-CLPROBE-004 | worktree ownership | pathとHEADが一致する一意なworktreeでなければblocked | `tests/closure-evidence-probe-context.test.ts` |

CLI結合ではdirtyな作業treeで`--execute --out`を呼び、exit 2、`record_written=false`、
`failure_evidence_generated=false`、出力file不存在を確認する。clean exact HEADの実command成功証拠は
commit/push後の独立worktreeで取得し、開発中dirty treeの成功へ偽装しない。
