---
plan_id: PLAN-L7-381-agent-ssot-runtime-projection
title: "PLAN-L7-381: agent SSoT runtime projection"
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
backprop_decision_reason: "oh-my-agent の .agents SSoT pattern を HELIX adapter projection へ変換する L7 hardening。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - agent/rule/skill projection manifest"
  - role: qa
    slot_label: "QA - projection drift and cleanup"
generates:
  - artifact_path: docs/plans/PLAN-L7-381-agent-ssot-runtime-projection.md
    artifact_type: markdown_doc
  - artifact_path: tests/agent-ssot-runtime-projection.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-362-runtime-capability-matrix
    - PLAN-L7-379-extension-preset-bundle-registry
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-381: agent SSoT runtime projection

## 目的

agent、skill、rule、hook pack を HELIX の正本 manifest から Claude / Codex / OpenCode 等の runtime native layout へ
安全に投影する。

## スコープ

- projection manifest schema を定義する。
- runtime ごとの file layout、format、unsupported reason を記録する。
- generated file は source digest と cleanup policy を持つ。
- keyword / state hook は adapter capability matrix に従う。

## 対象外

- `.agents/` を HELIX 正本にすること。
- runtime native config の無条件上書き。
- external package manager install。

## 受入条件

- projection drift は doctor finding になる。
- user-modified generated file は上書きしない。
- unsupported runtime は silent skip せず report する。

## 検証予定

- `bun test tests/agent-ssot-runtime-projection.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-381-agent-ssot-runtime-projection.md`
