---
title: "Requirement Discovery event／candidate projection単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-07-30
updated: 2026-07-30
owner: QA / TL
plan: docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md
pair_artifact: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md
---

# Requirement Discovery event／candidate projection単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RDJ-000 | shadow JSON schemaとexecutable enum／authority境界が一致 | event/payload/lifecycle/convergenceの片側drift | `tests/requirement-discovery.test.ts` |
| U-RDJ-001 | 17 event種をstrict parse | unknown event／extra property | `tests/requirement-discovery.test.ts` |
| U-RDJ-002 | 同じevent列から同じcandidate projection／digest | projection直接更新、非決定順序 | `tests/requirement-discovery.test.ts` |
| U-RDJ-003 | sequenceとdigest chainが連続 | event改変、途中切断、sequence gap、initiative混入 | `tests/requirement-discovery.test.ts` |
| U-RDJ-004 | human accept/reject/agreementだけを許可 | AI acceptance、AI沈黙agreement | `tests/requirement-discovery.test.ts` |
| U-RDJ-005 | 質問semantic keyとcandidate lifecycleを検証 | 重複質問、unknown answer、L2 frozen | `tests/requirement-discovery.test.ts` |
| U-RDJ-006 | 10条件の不足をtyped blockerとして返す | numeric scoreでready、agreementなしready | `tests/requirement-discovery.test.ts` |

全oracleはDB、network、filesystem writeを行わない。fixture生成時のevent digestもproduction関数で作り、
テスト側に別hash実装を持たない。
