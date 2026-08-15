---
title: "workflow分類typed routing単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-15
updated: 2026-08-15
owner: QA / TL
plan: docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
pair_artifact: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md
---

# workflow分類typed routing単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFROUTE-001 | typed signal分類 | 最長一致bindingが正しいaxis／identityを返し、legacy identity fieldを出力しない | `tests/workflow-classification-routing.test.ts` |
| U-WFROUTE-002 | decision境界 | `unresolved_until_decision`を確定identityとして返したらred | `tests/workflow-classification-routing.test.ts` |
| U-WFROUTE-003 | ambiguity | 同率で異なるidentityを任意選択したらred | `tests/workflow-classification-routing.test.ts` |
| U-WFROUTE-004 | unknown／legacy入力 | bindingのない旧`Scrum`文字列をcurrent identityへ推測変換したらred | `tests/workflow-classification-routing.test.ts` |
| U-WFROUTE-005 | freeze digest propagation | typed routing設計登録をG3 freeze packet digestへ伝播し、stale digestを拒否する | `tests/l3-g3-freeze-packet-v2.test.ts` |

旧`routeSignalToMode`のgreenはcurrent typed resolverの失敗を相殺しない。
