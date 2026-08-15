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
| U-WFEXROUTE-002 | classification fail-close | unknownとdecision待ちを推測せずunresolved/2へ写像 | `tests/workflow-execution-routing.test.ts` |
| U-WFEXROUTE-003 | policy fail-close | classified identityにexact bindingが無ければpolicy_unsupported/unresolved/2 | `tests/workflow-execution-routing.test.ts` |
| U-WFEXROUTE-004 | approval boundary | high-impact bindingはapproval_required/blocked/1でraw invocationを出さない | `tests/workflow-execution-routing.test.ts` |

旧route evalのgreenはcurrent consumerの失敗を相殺しない。
