---
title: "workflow output consumer inventory単体テスト設計"
status: draft
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
plan: PLAN-L7-692-workflow-output-consumer-inventory
pair_artifact: docs/design/helix/L6-function-design/workflow-output-consumer-inventory.md
behavior_contract_id: WORKFLOW-OUTPUT-CONSUMER-INVENTORY-001
responsibility_owner: workflow-output-consumer-inventory
---

# workflow output consumer inventory単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFOCI-001 | schema／authority／exact set | schema、Issue、HEAD、surface、token集合の欠落を拒否する | `tests/workflow-output-consumer-inventory.test.ts` |
| U-WFOCI-002 | surface×token matrix closure | entry未記載token、stale entry、件数ずれ、substring誤計数を拒否する | `tests/workflow-output-consumer-inventory.test.ts` |
| U-WFOCI-003 | entry uniqueness／metadata | path＋token重複、実在しないproducer、owner／consumer／successor欠落を拒否する | `tests/workflow-output-consumer-inventory.test.ts` |
| U-WFOCI-004 | disposition fail-close | unknown disposition、別axisの同一enum化を拒否する | `tests/workflow-output-consumer-inventory.test.ts` |

mutationでは`expected_occurrences`を1件ずらし、U-WFOCI-002がRedになることを確認する。
