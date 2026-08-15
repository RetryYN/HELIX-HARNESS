---
title: "design elicitation typed workflow分類単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: QA / TL
plan: docs/plans/PLAN-L7-570-design-elicitation-typed-classification.md
pair_artifact: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md
---

# design elicitation typed workflow分類単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DESIGNELIC-001 | typed routing | `design_uncertain`を名称類似で旧modeへ戻さず`DISCOVERY_POC`へ分類 | `tests/design-elicitation.test.ts` |
| U-DESIGNELIC-002 | axis分離 | specialist workflow、trigger、case modelを同一enumへ畳み込まない | `tests/design-elicitation.test.ts` |
| U-DESIGNELIC-003 | output境界 | current discovery出力にmode/model/catalog route/classを含めない | `tests/design-elicitation.test.ts` |
| U-DESIGNELIC-004 | freeze propagation | design／test design登録とcatalog digestをG3 packetへ伝播 | `tests/l3-g3-freeze-packet-v2.test.ts` |

legacy-only greenでtyped routing failureを相殺しない。
