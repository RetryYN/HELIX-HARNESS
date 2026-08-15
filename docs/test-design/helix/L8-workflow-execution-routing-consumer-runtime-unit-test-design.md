---
title: "workflow execution routing consumer runtime単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-15
updated: 2026-08-15
owner: QA / TL
plan: docs/plans/PLAN-L7-566-workflow-execution-routing-consumer.md
pair_artifact: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md
---

# workflow execution routing consumer単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFEXROUTE-001 | resolved receipt | typed identity／binding／command ID／exit mapping欠落とlegacy field混入を拒否 | `tests/workflow-execution-routing.test.ts` |
| U-WFEXROUTE-002 | classification fail-close | unknownとdecision待ちを推測せずunresolved/2へ写像し、同率複数identityをclassification_ambiguous/blocked/1で閉じる | `tests/workflow-execution-routing.test.ts` |
| U-WFEXROUTE-003 | policy fail-close | exact binding欠落をpolicy_unsupported/unresolved/2、同率複数bindingをpolicy_ambiguous/blocked/1で閉じる | `tests/workflow-execution-routing.test.ts` |
| U-WFEXROUTE-004 | approval boundary | high-impact bindingはapproval_required/blocked/1でraw invocationを出さない | `tests/workflow-execution-routing.test.ts` |
| U-WFEXROUTE-005 | freeze digest propagation | design／test design登録をG3 freeze packetへ伝播しstale digestを拒否 | `tests/l3-g3-freeze-packet-v2.test.ts` |
| U-WFEXROUTE-006 | contract injection validation | legacy fieldを混入したcatalog／projectionを各strict schemaで拒否し、未検証objectをreceiptへ流さない | `tests/workflow-execution-routing.test.ts` |
| U-WFEXROUTE-007 | contract pair consistency | classification registry／requirements digestが異なるcatalogとprojectionの混在を拒否 | `tests/workflow-execution-routing.test.ts` |

旧route evalのgreenはcurrent consumerの失敗を相殺しない。
