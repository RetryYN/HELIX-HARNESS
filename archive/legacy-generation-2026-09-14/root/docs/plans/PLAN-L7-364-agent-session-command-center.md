---
plan_id: PLAN-L7-364-agent-session-command-center
title: "PLAN-L7-364: agent session command center"
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
backprop_decision_reason: "status/handover の read-model 拡張。GUI や remote channel activation は含めない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - session board read model / needs-you triage"
  - role: qa
    slot_label: "QA - stale handover / resume state regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-364-agent-session-command-center.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/agent-session-command-center.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/agent-session-command-center.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - docs/plans/PLAN-L7-355-handover-db-derivation-impl.md
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T16:36:23+09:00"
    tests_green_at: "2026-07-09T16:36:23+09:00"
    verdict: approve
    scope: "PLAN-L7-364 agent session command center。agent slot と handover pointer を統合した read-only board を追加し、active/stale/blocked、needs-you reason、DB/handover next action を機械表示した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/agent-session-command-center.test.ts tests/agent-mailbox-conflict-locks.test.ts tests/autonomous-loop-run-receipts.test.ts tests/parallel-candidate-verifier-council.test.ts tests/cli-surface.test.ts tests/handover-db-derivation.test.ts tests/agent-slots.test.ts tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:35:52+09:00"
        evidence_path: tests/agent-session-command-center.test.ts
        output_digest: "sha256:824bc4ab8b78490fcf71a5b2a9e8b349e746bd01e5518fd9690bcb1d81be8986"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T16:34:00+09:00"
        evidence_path: src/runtime/agent-session-command-center.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bunx biome check src/cli.ts src/runtime/agent-session-command-center.ts src/runtime/agent-mailbox-conflict-locks.ts src/runtime/autonomous-loop-run-receipts.ts src/runtime/parallel-candidate-verifier-council.ts tests/agent-session-command-center.test.ts tests/agent-mailbox-conflict-locks.test.ts tests/autonomous-loop-run-receipts.test.ts tests/parallel-candidate-verifier-council.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:36:23+09:00"
        evidence_path: src/runtime/agent-session-command-center.ts
        output_digest: "sha256:6a0b2f2edd1b67893754cb7200712a15817aa1133f4c51e47d8f83edc64eb6a8"
---

# PLAN-L7-364: agent session command center 整備

## 目的

kanban / dashboard / session manager 系の知見を HELIX の DB read-model に落とし、複数 agent session の
状態、needs-you、blocked reason、next action、resume/handover を一覧できる surface を作る。

## スコープ

- `helix sessions board --json` 相当の read-only surface を追加する。
- session id、role、task、plan id、worktree、state、heartbeat、needs-you reason、handover path を集約する。
- text mode は compact table、JSON は UI / future webview がそのまま使える stable schema にする。
- remote/mobile/Telegram/Slack は notification adapter 候補として記録のみ。

## 対象外

- GUI / Web dashboard 実装。
- 外部 messaging platform 連携。
- hosted service。

## 受入条件

- stale session と active session を deterministic に区別する。
- needs-you は human escalation 境界と gate red を区別する。
- handover DB 由来の next action を prose handover より優先する。

## 検証予定

- `bun test tests/handover-db-derivation.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-364-agent-session-command-center.md`
