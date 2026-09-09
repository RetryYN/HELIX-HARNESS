---
title: "Design Catalog Relation Projection L7単体テスト設計"
layer: L6
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-10
updated: 2026-09-10
owner: QA
plan: docs/plans/PLAN-RECOVERY-1706-design-catalog-relation-projection.md
pair_artifact: docs/design/helix/L6-function-design/design-catalog-relation-projection.md
related_l6: docs/design/helix/L6-function-design/design-catalog-relation-projection.md
next_pair_freeze: L6
---

# Design Catalog Relation Projection単体テスト設計

親設計: `docs/design/helix/L6-function-design/design-catalog-relation-projection.md`

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-RELGRAPH-012 | catalog typed relation | catalog-item nodeを除去すると必須edgeが`stale-edge`となりRED。正常時はartifact、digest authority、coverage、governing PLANへのimpactが非空になる。 | `tests/relation-graph-loader.test.ts` |
| U-RELGRAPH-013 | catalog drift分類 | done artifact削除、catalog bytes変更、未登録design文書追加を、それぞれ別findingでREDにする。 | `tests/relation-graph-loader.test.ts` |

## `U-RELGRAPH-012`: catalog関係とimpact

同じ既存graph内でroot、item、artifact、authority consumerを結び、node／必須edge欠落mutationが生存しないことを検証する。

## `U-RELGRAPH-013`: driftの分離

deterministicなartifact／登録driftとsemantic review pinのstaleを取り違えず、semantic pinを自動更新しないことを検証する。
