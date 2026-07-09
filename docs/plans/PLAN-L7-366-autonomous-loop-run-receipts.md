---
plan_id: PLAN-L7-366-autonomous-loop-run-receipts
title: "PLAN-L7-366: autonomous loop run receipts"
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
backprop_decision_reason: "既存 loop / effort / handover を run receipt へ束ねる L7 追加。無制限自動実行は行わない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - loop receipt / restart / retry evidence"
  - role: qa
    slot_label: "QA - budget stop / completion claim gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-366-autonomous-loop-run-receipts.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/autonomous-loop-run-receipts.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/autonomous-loop-run-receipts.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/orchestration-memory.md
  requires:
    - docs/plans/PLAN-L7-343-effort-observation-full-wiring.md
    - docs/plans/PLAN-L7-354-harness-memory-compaction-impl.md
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T16:36:23+09:00"
    tests_green_at: "2026-07-09T16:35:52+09:00"
    verdict: approve
    scope: "PLAN-L7-366 autonomous loop run receipts。loop state / iteration receipt から restartable next action、stop kind、retry bound、missing receipt fail-close を出す read-only receipt surface を追加した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/agent-session-command-center.test.ts tests/agent-mailbox-conflict-locks.test.ts tests/autonomous-loop-run-receipts.test.ts tests/parallel-candidate-verifier-council.test.ts tests/cli-surface.test.ts tests/handover-db-derivation.test.ts tests/agent-slots.test.ts tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:35:52+09:00"
        evidence_path: tests/autonomous-loop-run-receipts.test.ts
        output_digest: "sha256:824bc4ab8b78490fcf71a5b2a9e8b349e746bd01e5518fd9690bcb1d81be8986"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T16:34:00+09:00"
        evidence_path: src/runtime/autonomous-loop-run-receipts.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bunx biome check src/cli.ts src/runtime/agent-session-command-center.ts src/runtime/agent-mailbox-conflict-locks.ts src/runtime/autonomous-loop-run-receipts.ts src/runtime/parallel-candidate-verifier-council.ts tests/agent-session-command-center.test.ts tests/agent-mailbox-conflict-locks.test.ts tests/autonomous-loop-run-receipts.test.ts tests/parallel-candidate-verifier-council.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:36:23+09:00"
        evidence_path: src/runtime/autonomous-loop-run-receipts.ts
        output_digest: "sha256:6a0b2f2edd1b67893754cb7200712a15817aa1133f4c51e47d8f83edc64eb6a8"
---

# PLAN-L7-366: autonomous loop run receipt 整備

## 目的

Ralph loop / wake-work-sleep / retry runner 系の知見を HELIX の loop_iterations と handover DB に結び、
長時間自走 run が「どこまで進み、なぜ止まり、どう再開するか」を receipt として残す。

## スコープ

- run receipt schema を定義する。
- iteration id、budget、commands、green/red evidence、retry reason、handover summary、next action を束ねる。
- budget stop と blocker stop と success stop を区別する。
- completion claim は receipt ではなく既存 gate / outstanding に従う。

## 対象外

- 無限ループ実行。
- 自動 commit / push。
- CI runner 常駐化。

## 受入条件

- receipt なしの autonomous-loop claim は fail-close する。
- restart 可能な next action が JSON に残る。
- retry/backoff は上限と reason を持つ。

## 検証予定

- `bun test tests/memory-compaction.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-366-autonomous-loop-run-receipts.md`
