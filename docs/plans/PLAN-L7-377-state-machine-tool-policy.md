---
plan_id: PLAN-L7-377-state-machine-tool-policy
title: "PLAN-L7-377: state-machine tool policy"
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
backprop_decision_reason: "本 PLAN は Statewright の per-state allowed tools / model / approval を L7 採用候補として起票する。workflow gate と adapter enforcement の L6 昇格は後続 add-design/backprop PLAN で扱う。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - state policy schema"
  - role: tl
    slot_label: "Security - hard/advisory enforcement boundary"
generates:
  - artifact_path: docs/plans/PLAN-L7-377-state-machine-tool-policy.md
    artifact_type: markdown_doc
  - artifact_path: tests/state-machine-tool-policy.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires: []
  references:
    - PLAN-L7-370-security-credential-egress-guard
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-377: state-machine tool policy 整備

## 目的

HELIX workflow phase ごとの allowed tools、model routing、approval gate、interrupt、hard/advisory enforcement を
state machine policy として表現する。

## スコープ

- state policy schema を追加する。
- adapter hook が hard enforcement できる surface と advisory-only surface を区別する。
- privilege escalation は approval gate なしに通さない。
- state transition evidence を run receipt に紐づける。

## 対象外

- Statewright runtime の導入。
- FSL gateway の取り込み。
- external MCP server install。

## 受入条件

- unsupported hard enforcement は hard と claim しない。
- tool escalation は severity を持つ finding になる。
- state policy なしの autonomous run は fail-close する。

## 検証予定

- `bun test tests/state-machine-tool-policy.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-377-state-machine-tool-policy.md`
