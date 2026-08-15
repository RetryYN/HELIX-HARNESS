---
title: "workflow execution policy resolution runtime単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-15
updated: 2026-08-15
owner: QA / TL
plan: docs/plans/PLAN-L7-565-workflow-execution-policy-resolution.md
pair_artifact: docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md
---

# workflow execution policy resolution単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFEPOLRES-001 | exact binding | 登録済みidentity、execution form、conditionsの完全一致だけが`resolved` | `tests/workflow-execution-policy-registry.test.ts` |
| U-WFEPOLRES-002 | unsupported policy | identityまたはrisk combination未登録を`policy_unsupported`で閉じる | `tests/workflow-execution-policy-registry.test.ts` |
| U-WFEPOLRES-003 | ambiguous policy | 同一precedenceの複数一致を`policy_ambiguous`で閉じる | `tests/workflow-execution-policy-registry.test.ts` |
| U-WFEPOLRES-004 | legacy token mutation | `unsupported`／`ambiguous`へ戻すmutationをexact期待値で検出する | `tests/workflow-execution-policy-registry.test.ts` |
| U-WFEPOLRES-005 | freeze digest propagation | design／test design登録をG3 freeze packetへ伝播しstale digestを拒否 | `tests/l3-g3-freeze-packet-v2.test.ts` |

旧token側のgreenはcanonical dispositionの失敗を相殺しない。
