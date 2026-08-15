---
title: "workflow分類legacy input-only adapter単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-16
updated: 2026-08-16
owner: QA / TL
plan: docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
pair_artifact: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md
---

# workflow分類legacy input-only adapter単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFLEG-001 | exact conversion | Reverse等をworkflow model identityへ変換しsource warningを残す | `tests/workflow-classification-legacy-adapter.test.ts` |
| U-WFLEG-002 | axis分離 | Discoveryをcase-driven model、Recoveryをworkflow modelとして返す | `tests/workflow-classification-legacy-adapter.test.ts` |
| U-WFLEG-003 | ambiguity | Forward／Scrum／design-bottomup／verificationを推測せずexit 1 | `tests/workflow-classification-legacy-adapter.test.ts` |
| U-WFLEG-004 | unknown | unknownをForwardへ丸めずunsupported | `tests/workflow-classification-legacy-adapter.test.ts` |
| U-WFLEG-005 | output境界 | current classificationにmode/model/catalog route/classを出力しない | `tests/workflow-classification-legacy-adapter.test.ts` |
| U-WFLEG-006 | registry authority | registryから変換を除いた反例で実装内fallbackせずunsupported | `tests/workflow-classification-legacy-adapter.test.ts` |
| U-WFLEG-007 | freeze digest propagation | design／test design登録とcatalog digestをG3 packetへ伝播する | `tests/l3-g3-freeze-packet-v2.test.ts` |

legacy-only greenでcurrent typed routing failureを相殺しない。
