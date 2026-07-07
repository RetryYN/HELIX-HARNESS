---
plan_id: PLAN-L7-365-agent-mailbox-conflict-locks
title: "PLAN-L7-365: agent mailbox and conflict locks"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-07
updated: 2026-07-07
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:awesome-agent-catalog-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "agent 間通信と競合検知を state DB に追加する L7 contract。外部 daemon / network relay は導入しない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - mailbox / heartbeat / file-symbol lock schema"
  - role: tl
    slot_label: "TL - lock stale policy / conflict escalation"
generates:
  - artifact_path: docs/plans/PLAN-L7-365-agent-mailbox-conflict-locks.md
    artifact_type: markdown_doc
  - artifact_path: tests/agent-mailbox-conflict-locks.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires: []
  references:
    - PLAN-L7-363-isolated-worktree-sandbox-runner
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-365: agent mailbox and conflict locks

## 目的

message bus / shared room / file lock / symbol lock 系の知見を HELIX に取り込み、parallel agent が
同じ file、symbol、plan artifact を同時に壊さないようにする。

## スコープ

- state DB に mailbox / heartbeat / lock projection を追加する設計と最小実装を行う。
- lock granularity は file path を初期値とし、Tree-sitter symbol lock は future extension として schema を予約する。
- `helix agent locks --json` と `helix agent message --dry-run` 相当の surface を検討する。
- stale lock expiry と human escalation を分ける。

## 対象外

- network relay / mobile relay。
- AST parser の全言語実装。
- lock を使った destructive checkout / merge。

## 受入条件

- 同一 path に対する active lock 競合が fail-close する。
- stale lock は自動解除せず、expiry evidence と owner を表示する。
- mailbox message は task / plan / session id に紐づく。

## 検証予定

- `bun test tests/state-db.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-365-agent-mailbox-conflict-locks.md`
