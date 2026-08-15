---
title: "workflow分類generated catalog runtime単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
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

旧15-route inventoryのgreenは、上記canonical projectionの失敗を相殺しない。
