---
plan_id: PLAN-L7-378-state-machine-template-planner
title: "PLAN-L7-378: state-machine template planner"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-07
updated: 2026-07-07
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:agent-spec-orchestrator-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "Statewright の gen_sm / template library pattern を HELIX の role/lens selection へ追加する L7 planning helper。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - workflow template planner"
  - role: qa
    slot_label: "QA - template replay evidence"
generates:
  - artifact_path: docs/plans/PLAN-L7-378-state-machine-template-planner.md
    artifact_type: markdown_doc
  - artifact_path: tests/state-machine-template-planner.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-338-task-lens-injection
  references:
    - PLAN-L7-377-state-machine-tool-policy
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-378: state-machine template planner 整備

## 目的

task type から workflow state machine template を選び、必要に応じて生成候補を出す planner を追加する。

## スコープ

- workflow template catalog を定義する。
- task lens / role judgment から template selection を行う。
- success / failure execution triples を将来学習できる schema で保存する。
- generated template は human-readable diff と validation result を持つ。

## 対象外

- model fine-tuning。
- template の無検証自動適用。
- hosted visual editor。

## 受入条件

- template は allowed tools / transitions / exit criteria を持つ。
- generated workflow は validator を通らない限り実行不可。
- execution triple は secret / PII を含まない。

## 検証予定

- `bun test tests/state-machine-template-planner.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-378-state-machine-template-planner.md`
