---
plan_id: PLAN-L7-450-state-db-vscode-decoupling
title: "PLAN-L7-450 (refactor): state-db / VS Code ownership分離"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals: ["po_directive:2026-07-13 PLAN-L7-446 #11 architecture cycleをexact Vペアで解消"]
created: 2026-07-13
updated: 2026-07-13
owner: Codex
agent_slots:
  - { role: se, slot_label: "SE — contract/projector/evidence owner分離" }
  - { role: qa, slot_label: "QA — cycle/headless adapter oracle" }
backprop_decision: not_required
backprop_decision_reason: "confirmed前のPLAN-L6-79 contractを実装候補へ具体化し、上位意味は変更しない。"
parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md
pair_artifact: docs/test-design/harness/L8-source-boundary-contracts.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-001, test_path: tests/source-boundary-design.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-002, test_path: tests/source-boundary-design.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-005, test_path: tests/source-boundary-design.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-450-state-db-vscode-decoupling.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L6-79-source-boundary-contracts.md
  requires: []
---

# PLAN-L7-450: state-db / VS Code ownership分離

## 実装境界

共有DTO、pure projector、state-db evidence、VS Code decorationを物理分離し、composition rootだけで接続する。
既存symbolを新ownerへ移した後、state-dbとVS Code間のdirect/type-only edgeを0にする。

## 予定出力（draft、未生成）

次の source artifact は本PLANが `confirmed` になる実装時に `generates` へ昇格させる。現時点で
`generates` に載せると relation graph が未実在 artifact を実装済み edge と誤認するため、予定として明示する。

- `src/schema/visualization-contract.ts`
- `src/vmodel/visualization-tree-projector.ts`
- `src/state-db/visualization-evidence.ts`

## 検証境界

`tests/source-boundary-design.test.ts` は既存のV-pair structural guardであり、本PLANの生成物ではない。
`verification_bindings` は後続実装時に当該oracleを具体的なbehavior testへ拡張する責務を表す。

## 完了条件

`U-SBOUND-001/002/005`と`IT-SBOUND-001/002`、typecheck、targeted test、independent reviewがgreenである。
