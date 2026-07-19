---
plan_id: PLAN-L5-79-source-boundary-architecture
title: "PLAN-L5-79 (add-design): source boundary architecture"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-13 PLAN-L7-446 QS4-BOUNDARY #11/#13/#15 inventoryでstate-db⇄vscode循環、lint effect混在、29 EMPTY boundaryを実測"
created: 2026-07-13
updated: 2026-07-13
owner: Codex / TL
review_evidence:
  - reviewer: node_evidence_audit
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: gpt-5
    reviewed_at: "2026-07-19T01:33:00+09:00"
    tests_green_at: "2026-07-19T01:32:00+09:00"
    verdict: pass
    scope: "source boundary設計、Vペア、state-db/VS Code分離、headless composition、policy/effect/durability負例を独立監査。Blocker/High 0。2026-07-19に再検証。"
    green_commands:
      - { kind: integration_test, command: "npx --no-install vitest run tests/source-boundary-policy.test.ts tests/source-boundary-integration.test.ts --testTimeout 300000", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-19T01:28:00+09:00", evidence_path: docs/governance/merged-plan-closure-audit-2026-07-19.md, output_digest: "sha256:cadaacbff7c7843c07095c03e15d9f44b7822c00b147e1ccd203d1f24e1ce3dc" }
backprop_decision: not_required
backprop_decision_reason: "L3/L4の機能意味は変えず、既存module ownershipとeffect authorityを詳細化する。"
pair_artifact: docs/test-design/harness/L9-source-boundary-integration.md
agent_slots:
  - { role: aim, slot_label: "AIM — ownershipとeffect authority境界" }
  - { role: se, slot_label: "SE — live import/effect graphと移行順序" }
  - { role: qa, slot_label: "QA — headless/adapter/process負例" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-79-source-boundary-architecture.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L5-detailed-design/source-boundary-architecture.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L9-source-boundary-integration.md, artifact_type: test_design }
  - { artifact_path: tests/source-boundary-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-446-qs4-boundary-inventory.md
  requires: []
---

# PLAN-L5-79: source boundary architecture設計

## 工程表

| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [直列] | #11/#13/#15 live graphとownershipをfreeze | source/presentation/effect authority確定 |
| 2 | [直列] | L9 headless/adapter/process oracleをreverse trace | architecture負例が実行可能 |
| 3 | [review] | 別runtime/modelが移行順序と禁止方向を監査 | Blocker/High 0 |

## 完了条件

- state-dbからVS Code presentationへの依存を禁止し、adapter-neutral contractをcomposition rootで接続する。
- lint analyzerをpure input→findingとし、write/process probeはreceiptを返すexecutorへ隔離する。
- boundary policyの未指定方向を暗黙allowにせずfail-closeする。
