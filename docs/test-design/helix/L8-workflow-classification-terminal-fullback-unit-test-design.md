---
title: "workflow分類是正終端fullback監査 単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-20
updated: 2026-08-20
owner: QA / TL
plan: docs/plans/PLAN-REVERSE-694-workflow-classification-terminal-fullback.md
pair_artifact: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
pair_freeze_exempt: true
pair_freeze_exempt_kind: cross_layer_meta
pair_freeze_exempt_reason: "本書は複数の既存Forward sliceを束ねる終端監査のL8契約であり、単一のL6実装設計へpairを再束縛しない。監査契約のconfirmed化時に専用oracleを追加し、暗黙の完了主張を行わない。"
---

# workflow分類是正終端fullback監査 単体テスト設計

本書はIssue #694の既存Forward sliceを再実装せず、各sliceの実測証拠とcurrent-mainの意味一致を
終端監査へ束ねるためのL8設計である。現段階では監査契約を起票しただけで、completion claimを許可しない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFTERM-001 | Forward receipt exactness | merge HEAD、required CI、Claude review、DB convergenceのいずれかが欠けたsliceを未完了として返す | `tests/workflow-classification-terminal-fullback.test.ts`（後続実装） |
| U-WFTERM-002 | current-main read-after | review時HEADまたは旧mainの成功だけでcurrent-main完了を主張したらred | `tests/workflow-classification-terminal-fullback.test.ts`（後続実装） |
| U-WFTERM-003 | typed identity chain | requirements／registry／catalog／consumerのversion、digest、axis、IDが不一致ならred | `tests/workflow-classification-terminal-fullback.test.ts`（後続実装） |
| U-WFTERM-004 | legacy boundary | 旧mode、model、15-route identityがcurrent output／DB／generated docsへ戻ったらred | `tests/workflow-classification-terminal-fullback.test.ts`（後続実装） |
| U-WFTERM-005 | dependency release | #204、#635、#188のIssue stateがcompletion判定と不一致なら#694を閉じずfail-closeする | `tests/workflow-classification-terminal-fullback.test.ts`（後続実装） |

canonical側の失敗をcompatibility側のgreenで相殺しない。テスト実装時は、GitHub read-after、commandの
exit code、output digest、独立review receiptを同一HEADへ束縛してPLANへ記録する。
