---
title: "workflow分類generated catalog runtime単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-15
updated: 2026-08-15
owner: QA / TL
plan: docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
pair_artifact: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
---

# workflow分類generated catalog単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFCAT-001 | typed identity projection | entity、axis、parent relation、signal bindingの欠落はregistryとの完全一致が崩れてred | `tests/workflow-classification-catalog.test.ts` |
| U-WFCAT-002 | source binding | source registry bytesまたはversion bindingのstale化はdeterministic再生成結果と不一致になりred | `tests/workflow-classification-catalog.test.ts` |
| U-WFCAT-003 | identity policy | legacy identity emissionまたはcommon route identityの有効化を受理しない | `tests/workflow-classification-catalog.test.ts` |
| U-WFCAT-004 | committed projection | committed JSONの手編集をload時のdrift判定でfail-close | `tests/workflow-classification-catalog.test.ts` |
| U-WFCAT-005 | freeze digest propagation | design catalogの更新をG3 freeze packet digestへ伝播し、stale digestを拒否する | `tests/l3-g3-freeze-packet-v2.test.ts` |
| U-CAT1437-001 | current identity authority | current identity集合をlegacy route inventoryから導出せず、generated catalog entityから取得する | `tests/workflow-classification-catalog.test.ts` |
| U-CAT1437-002 | DB registration consumer | `drive_runs` のtyped workflow identityはcurrent catalog集合へ照合し、legacy `mode`の欠落をcurrent green条件にしない | `tests/drive-db-registration.test.ts` |
| U-CAT1437-003 | current passage certificate authority | 旧Drive model表をcurrent certificateとして扱わず、catalog由来のworkflow identity表だけを受理する | `tests/drive-model-passage.test.ts` |
| U-DMP-001 | current identity passage evidence | catalogの全workflow identityについてForward targetとresidual statusを持つ証明書を受理する | `tests/drive-model-passage.test.ts` |
| U-DMP-002 | Forward re-entry evidence | Forward targetを欠くworkflow identity行を拒否する | `tests/drive-model-passage.test.ts` |
| U-DMP-002b | passage certificate presence | passage certificate文書の空集合を拒否する | `tests/drive-model-passage.test.ts` |
| U-DMP-003 | catalog identity completeness | current catalogと異なるidentity集合を受理しない | `tests/drive-model-passage.test.ts` |
| U-DMP-004 | identity uniqueness | current identityの重複行を拒否する | `tests/drive-model-passage.test.ts` |
| U-DMP-005 | identity presence | workflow identityが空の行を拒否する | `tests/drive-model-passage.test.ts` |

旧15-route inventoryのgreenは、上記canonical projectionの失敗を相殺しない。
