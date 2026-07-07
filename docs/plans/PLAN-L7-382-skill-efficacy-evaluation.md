---
plan_id: PLAN-L7-382-skill-efficacy-evaluation
title: "PLAN-L7-382: skill efficacy evaluation"
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
backprop_decision_reason: "oh-my-openagent の with/without skill eval pattern を HELIX skill hygiene の L7 evidence へ追加する。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: qa
    slot_label: "QA - skill efficacy fixture / grading"
  - role: se
    slot_label: "SE - eval evidence schema"
generates:
  - artifact_path: docs/plans/PLAN-L7-382-skill-efficacy-evaluation.md
    artifact_type: markdown_doc
  - artifact_path: tests/skill-efficacy-evaluation.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/orchestration-memory.md
  requires: []
  references:
    - PLAN-L7-369-skill-memory-hygiene
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-382: skill efficacy evaluation

## 目的

skill が本当に作業品質を上げるかを、with-skill / without-skill fixture、grading、timing、evidence digest で測る。

## スコープ

- skill eval manifest を定義する。
- fixture、expected artifacts、grading rubric、timing、command evidence を保存する。
- skill quarantine / promotion decision を efficacy evidence に接続する。

## 対象外

- 人間評価を不要にすること。
- private data を含む fixture。
- model benchmark の一般化 claim。

## 受入条件

- skill promotion は少なくとも 1 件の reproducible eval evidence を要求する。
- regression は quarantine candidate になる。
- grading は artifact path と command digest を持つ。

## 検証予定

- `bun test tests/skill-efficacy-evaluation.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-382-skill-efficacy-evaluation.md`
