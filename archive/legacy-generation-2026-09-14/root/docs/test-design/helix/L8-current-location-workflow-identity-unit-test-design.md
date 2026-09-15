---
title: "current-location typed workflow identity単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-18
updated: 2026-08-18
owner: QA / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-L7-584-current-location-workflow-identity.md
pair_artifact: docs/design/helix/L6-function-design/current-location-workflow-identity.md
---

# current-location typed workflow identity単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CLWI-001 | typed tuple | current registry tupleのtyped identityを受理する | `tests/current-location-workflow-identity.test.ts` |
| U-CLWI-002 | legacy conversion | unambiguous legacy inputをwarning付きで一方向変換する | `tests/current-location-workflow-identity.test.ts` |
| U-CLWI-003 | ambiguity | `Forward`／`Scrum`を推測せず`ambiguous`で拒否する | `tests/current-location-workflow-identity.test.ts` |
| U-CLWI-004 | axis boundary | specialist verificationをworkflow modelへ昇格しない | `tests/current-location-workflow-identity.test.ts` |
| U-CLWI-005 | stale tuple | stale registry tupleを拒否する | `tests/current-location-workflow-identity.test.ts` |
| U-CLWI-006 | input cardinality | unknown identityと複数入力を拒否する | `tests/current-location-workflow-identity.test.ts` |
| U-CLWI-007 | route integration | production current-location routeがtyped receiptを必ず持つ | `tests/current-location-workflow-identity.test.ts` |

テストは`current-location-workflow-identity.ts`のreceipt、出力禁止、registry drift境界を対象とする。
