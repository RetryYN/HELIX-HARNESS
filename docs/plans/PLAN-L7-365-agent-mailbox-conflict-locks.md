---
plan_id: PLAN-L7-365-agent-mailbox-conflict-locks
title: "PLAN-L7-365: agent mailbox and conflict locks"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-07
updated: 2026-07-09
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:awesome-agent-catalog-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "agent 間通信と競合検知を state DB に追加する L7 contract。外部 daemon / network relay は導入しない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - mailbox / heartbeat / file-symbol lock schema"
  - role: tl
    slot_label: "TL - lock stale policy / conflict escalation"
generates:
  - artifact_path: docs/plans/PLAN-L7-365-agent-mailbox-conflict-locks.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/agent-mailbox-conflict-locks.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/agent-mailbox-conflict-locks.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires: []
  references:
    - docs/plans/PLAN-L7-363-isolated-worktree-sandbox-runner.md
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T16:36:23+09:00"
    tests_green_at: "2026-07-09T16:36:23+09:00"
    verdict: approve
    scope: "PLAN-L7-365 agent mailbox and conflict locks。lock conflict fail-close、stale lock owner review、mailbox dry-run packet を追加し、network relay / destructive checkout は対象外のまま維持した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/agent-session-command-center.test.ts tests/agent-mailbox-conflict-locks.test.ts tests/autonomous-loop-run-receipts.test.ts tests/parallel-candidate-verifier-council.test.ts tests/cli-surface.test.ts tests/handover-db-derivation.test.ts tests/agent-slots.test.ts tests/pair-agent.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:35:52+09:00"
        evidence_path: tests/agent-mailbox-conflict-locks.test.ts
        output_digest: "sha256:824bc4ab8b78490fcf71a5b2a9e8b349e746bd01e5518fd9690bcb1d81be8986"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T16:34:00+09:00"
        evidence_path: src/runtime/agent-mailbox-conflict-locks.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npx --no-install biome check src/cli.ts src/runtime/agent-session-command-center.ts src/runtime/agent-mailbox-conflict-locks.ts src/runtime/autonomous-loop-run-receipts.ts src/runtime/parallel-candidate-verifier-council.ts tests/agent-session-command-center.test.ts tests/agent-mailbox-conflict-locks.test.ts tests/autonomous-loop-run-receipts.test.ts tests/parallel-candidate-verifier-council.test.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:36:23+09:00"
        evidence_path: src/runtime/agent-mailbox-conflict-locks.ts
        output_digest: "sha256:6a0b2f2edd1b67893754cb7200712a15817aa1133f4c51e47d8f83edc64eb6a8"
---

# PLAN-L7-365: agent mailbox と conflict lock

## 目的

message bus / shared room / file lock / symbol lock 系の知見を HELIX に取り込み、parallel agent が
同じ file、symbol、plan artifact を同時に壊さないようにする。

## スコープ

- state DB に mailbox / heartbeat / lock projection を追加する設計と最小実装を行う。
- lock granularity は file path を初期値とし、Tree-sitter symbol lock は future extension として schema を予約する。
- `helix agent locks --json` と `helix agent message --dry-run` 相当の surface を検討する。
- stale lock expiry と human escalation を分ける。

## 対象外

- network relay / mobile relay は対象外。
- AST parser の全言語実装。
- lock を使った destructive checkout / merge。

## 受入条件

- 同一 path に対する active lock 競合が fail-close する。
- stale lock は自動解除せず、expiry evidence と owner を表示する。
- mailbox message は task / plan / session id に紐づく。

## 検証予定

- `npm test tests/state-db.test.ts tests/cli-surface.test.ts --timeout 180000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-365-agent-mailbox-conflict-locks.md`
