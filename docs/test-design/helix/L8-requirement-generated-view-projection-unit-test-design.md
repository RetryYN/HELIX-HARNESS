---
title: "Requirement generated view／DB shadow projection単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-07-30
updated: 2026-07-30
owner: QA / TL
plan: docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
pair_artifact: docs/design/helix/L6-function-design/requirement-generated-view-projection.md
---

# Requirement generated view／DB shadow projection単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RGV-001 | shard exact set読込 | path、kind、count、key、digest driftを拒否 | `tests/requirement-generated-view.test.ts` |
| U-RGV-002 | JSON→Markdown→normalized JSON | record欠落／semantic drift | `tests/requirement-generated-view.test.ts` |
| U-RGV-003 | shadow authority headerとhuman section | canonical過大claim、section欠落 | `tests/requirement-generated-view.test.ts` |
| U-RGV-004 | fail-close parser | path escape、marker欠落 | `tests/requirement-generated-view.test.ts` |
| U-RGV-005 | checked-in generated view | generatorとのbyte drift | `tests/requirement-generated-view.test.ts` |
| U-RGV-006 | DB rebuild x2 | denominator／row driftを拒否 | `tests/requirement-generated-view-db.test.ts` |
| U-RGV-007 | DB stale/orphan | root/record digest drift、owner/oracle orphanを拒否 | `tests/requirement-generated-view-db.test.ts` |

DB oracleは`:memory:`の既存schema registry／projection writerを使い、別schema実装をテスト側へ持たない。
