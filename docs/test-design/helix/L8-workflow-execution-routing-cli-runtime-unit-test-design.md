---
title: "workflow execution routing CLI runtime単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-15
updated: 2026-08-15
owner: QA / TL
plan: docs/plans/PLAN-L7-567-workflow-execution-routing-cli.md
pair_artifact: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md
---

# workflow execution routing CLI単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFEXCLI-001 | JSON route eval | typed identity、binding、command ID、exact exitを返しlegacy fieldを持たない | `tests/cli-surface.test.ts` |
| U-WFEXCLI-002 | policy output | action stageをregistryから返しrecommended/raw commandを持たない | `tests/route-action-approval-cli.test.ts` |
| U-WFEXCLI-003 | exact input | execution formまたはboolean setの省略・未知値をexit 2で拒否 | `tests/route-action-approval-cli.test.ts` |
| U-WFEXCLI-004 | approval audit | typed audit eventにlegacy identity／raw invocationが無い | `tests/route-action-approval-cli.test.ts` |
| U-WFEXCLI-005 | freeze digest propagation | design／test design登録をG3 freeze packetへ伝播しstale digestを拒否 | `tests/l3-g3-freeze-packet-v2.test.ts` |
| U-WFEXCLI-006 | contract admission | authority contract読込・digest失敗をreceiptへ偽装せずexit 1で拒否 | `tests/route-action-approval-cli.test.ts` |

旧route eval contractのgreenはcurrent CLIの失敗を相殺しない。
