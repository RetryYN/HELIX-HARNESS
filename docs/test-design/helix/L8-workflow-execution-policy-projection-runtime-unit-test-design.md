---
title: "workflow execution policy generated projection runtime単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-15
updated: 2026-08-15
owner: QA / TL
plan: docs/plans/PLAN-L7-563-workflow-execution-policy-projection.md
pair_artifact: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md
---

# workflow execution policy generated projection単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFEPROJ-001 | policy projection | command、typed binding、coverage欠落はregistryとの完全一致が崩れてred | `tests/workflow-execution-policy-projection.test.ts` |
| U-WFEPROJ-002 | source binding | requirements、classification、policy registry digestのstale化は再生成結果と不一致になりred | `tests/workflow-execution-policy-projection.test.ts` |
| U-WFEPROJ-003 | output policy | raw command、legacy identity、旧modeのcurrent出力をstrict schemaが拒否 | `tests/workflow-execution-policy-projection.test.ts` |
| U-WFEPROJ-004 | committed projection | committed JSONの手編集をload時のdrift判定でfail-close | `tests/workflow-execution-policy-projection.test.ts` |
| U-WFEPROJ-005 | freeze digest propagation | design catalog更新をG3 freeze packetへ伝播しstale digestを拒否 | `tests/l3-g3-freeze-packet-v2.test.ts` |

旧route-mapのgreenは、canonical projectionの失敗を相殺しない。
