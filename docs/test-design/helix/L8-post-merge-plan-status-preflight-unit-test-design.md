---
title: "post-merge PLAN status preflight L8単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-28
updated: 2026-08-28
owner: QA / Codex TL
plan: docs/plans/PLAN-RECOVERY-66-post-merge-plan-status-preflight.md
pair_artifact: docs/design/helix/L6-function-design/post-merge-plan-status-preflight.md
github_issue_id: 1132
behavior_contract_id: POST-MERGE-PLAN-STATUS-PREFLIGHT-001
responsibility_owner: merged-plan-status
---

# post-merge PLAN status preflight L8単体テスト設計

| U-ID | 対象 | 正例 | 反例／mutation | 実行先 |
|---|---|---|---|---|
| U-MPS-PRE-001 | base選択 | candidate modeは`HEAD`だけを読む | `origin/main`へ戻してbranch-only artifactを見逃す | `tests/merged-plan-status.test.ts` |
| U-MPS-PRE-002 | PLAN gate | existing analyzer結果をそのまま返す | candidate violationを成功へ丸める | 同上 |
| U-MPS-PRE-003 | workflow | plan lint直後にpost-merge gateを実行する | step削除、順序逆転、`continue-on-error`追加 | `tests/harness-check-workflow.test.ts` |

既存doctorのpublished-base動作とS3 PoC例外も同じtargeted runでgreenを維持する。
