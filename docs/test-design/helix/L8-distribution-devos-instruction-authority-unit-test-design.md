---
title: "DevOS distribution instruction authority L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-23
updated: 2026-08-23
owner: QA / TL
plan: docs/plans/PLAN-L7-654-distribution-devos-instruction-authority.md
pair_artifact: docs/design/helix/L6-function-design/distribution-devos-instruction-authority.md
---

# DevOS distribution instruction authority L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RDRIFT-005 | project instruction authority | AGENTS／CLAUDEの片面からDevOSまたはcompatibility markerを除くとrule-driftがred | `tests/rule-drift.test.ts` |
| U-RDRIFT-006 | real repository | tracked AGENTS／CLAUDEが同じDevOS authorityを返す | `tests/rule-drift.test.ts` |

runtime outputの旧identity残存は後続sliceの別oracleで扱い、本sliceのgreenへ数えない。
