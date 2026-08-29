---
title: "CLI typed workflow identity projection unit test design"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-28
updated: 2026-08-29
owner: Codex / TL
authority: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md
plan: docs/plans/PLAN-L7-698-cli-workflow-identity-projection.md
pair_artifact: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md
github_issue_id: 1125
behavior_contract_id: CLI-TYPED-WORKFLOW-IDENTITY-001
responsibility_owner: workflow-output-cli-projection
---

# CLI typed workflow identity projection テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CLIWI-001 | `helix drive model`のJSON／summary／text | current registryのexact typed tupleを返し、legacy identity key／model label／candidate集合を含まない | `tests/cli-workflow-identity-projection.test.ts` |
| U-CLIWI-002 | `helix recovery plan`のJSON／summary／text | 同じtyped tupleを返し、nested `drive_model`やlegacy selected labelを再出力しない | `tests/cli-workflow-identity-projection.test.ts` |
| U-CLIWI-003 | typed tupleへlegacy keyを再注入するseed mutation | 深さ優先検査がexact pathを返しmutationをkillする | `tests/cli-workflow-identity-projection.test.ts` |
| U-CLIWI-004 | stale digest、partial tuple、identity／receipt不一致、legacy identity emission要求 | 多重防御を含むreceipt整合条件として`cli_workflow_identity_invalid`でfail-closeし、`emit_legacy_identity=true`は単独反例で固定する | `tests/cli-workflow-identity-projection.test.ts` |
| U-CLIWI-005 | completion frontier／Project frontier／tree view | nested legacy model集合を再包装せずtyped tupleを投影する。identity unsupported fixtureは全surfaceでfail-closeする | `tests/cli-surface.test.ts` |

CLI subprocessの成功だけでtyped identity成立を主張せず、pure value objectへ退行を直接注入する。
