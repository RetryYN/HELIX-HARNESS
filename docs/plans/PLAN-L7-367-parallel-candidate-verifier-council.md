---
plan_id: PLAN-L7-367-parallel-candidate-verifier-council
title: "PLAN-L7-367: parallel candidate verifier council"
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
backprop_decision_reason: "worker/verifier 分離の L7 拡張。merge/apply は plan-only で、人間承認境界と既存 gate を維持する。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - candidate run packet / neutral verifier"
  - role: qa
    slot_label: "QA - replay tests / council veto"
generates:
  - artifact_path: docs/plans/PLAN-L7-367-parallel-candidate-verifier-council.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/parallel-candidate-verifier-council.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/parallel-candidate-verifier-council.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - docs/plans/PLAN-L7-217-pair-agent-consultation-precedence.md
  references:
    - docs/plans/PLAN-L7-363-isolated-worktree-sandbox-runner.md
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T16:36:23+09:00"
    tests_green_at: "2026-07-09T16:35:52+09:00"
    verdict: approve
    scope: "PLAN-L7-367 parallel candidate verifier council。candidate / verifier / council decision packet、self-review veto、missing replay reject、merge/apply は既存GitHub gateへ委譲する policy を追加した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/agent-session-command-center.test.ts tests/agent-mailbox-conflict-locks.test.ts tests/autonomous-loop-run-receipts.test.ts tests/parallel-candidate-verifier-council.test.ts tests/cli-surface.test.ts tests/handover-db-derivation.test.ts tests/agent-slots.test.ts tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:35:52+09:00"
        evidence_path: tests/parallel-candidate-verifier-council.test.ts
        output_digest: "sha256:824bc4ab8b78490fcf71a5b2a9e8b349e746bd01e5518fd9690bcb1d81be8986"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T16:34:00+09:00"
        evidence_path: src/runtime/parallel-candidate-verifier-council.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bunx biome check src/cli.ts src/runtime/agent-session-command-center.ts src/runtime/agent-mailbox-conflict-locks.ts src/runtime/autonomous-loop-run-receipts.ts src/runtime/parallel-candidate-verifier-council.ts tests/agent-session-command-center.test.ts tests/agent-mailbox-conflict-locks.test.ts tests/autonomous-loop-run-receipts.test.ts tests/parallel-candidate-verifier-council.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:36:23+09:00"
        evidence_path: src/runtime/parallel-candidate-verifier-council.ts
        output_digest: "sha256:6a0b2f2edd1b67893754cb7200712a15817aa1133f4c51e47d8f83edc64eb6a8"
---

# PLAN-L7-367: parallel candidate verifier council 整備

## 目的

h5i / zeroshot / Loki Mode などの「複数候補を隔離実行し、中立 verifier が replay/test して選ぶ」
pattern を HELIX の pair-agent / verification gate へ落とす。

## スコープ

- candidate run packet、verifier packet、council decision packet を定義する。
- candidate は isolated worktree を前提にし、main worktree へ直接 apply しない。
- verifier は test command、diff summary、risk finding、accept/reject/veto reason を返す。
- council は best candidate を選んでも、merge / push は既存 GitHub gate へ委譲する。

## 対象外

- automatic merge。
- hosted benchmark。
- LLM judge だけの合否判定。

## 受入条件

- worker と verifier が同一 session の自己採点にならない。
- replay command がない candidate は採用不可。
- council decision は evidence path と reject reason を全候補分持つ。

## 検証予定

- `bun test tests/agent-slots.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-367-parallel-candidate-verifier-council.md`
