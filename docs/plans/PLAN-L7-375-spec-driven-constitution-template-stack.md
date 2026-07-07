---
plan_id: PLAN-L7-375-spec-driven-constitution-template-stack
title: "PLAN-L7-375: spec-driven constitution template stack"
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
backprop_decision_reason: "Spec Kit の constitution / template stack を HELIX runtime artifact governance へ追加する L7 hardening。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - constitution / template resolver"
  - role: qa
    slot_label: "QA - priority and override regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-375-spec-driven-constitution-template-stack.md
    artifact_type: markdown_doc
  - artifact_path: tests/spec-driven-constitution-template-stack.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-317-skill-scaffold-generator
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-375: spec-driven constitution template stack 整備

## 目的

Spec Kit の constitution、template override、preset priority の pattern を、HELIX の adapter template、
role brief、task lens、PLAN scaffold の governance へ変換する。

## スコープ

- HELIX artifact template stack の優先順位を定義する。
- project override、role template、core template の競合時 resolution を deterministic にする。
- constitution violation を plan lint / doctor finding へ接続する。

## 対象外

- `.specify/` template の採用。
- 外部 preset install。
- AGENTS.md / CLAUDE.md の機械識別子 rename。

## 受入条件

- 同じ template key の競合は silent override にならない。
- constitution check は warning と blocker の区別を持つ。
- generated artifact は resolver source と digest を持つ。

## 検証予定

- `bun test tests/spec-driven-constitution-template-stack.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-375-spec-driven-constitution-template-stack.md`
