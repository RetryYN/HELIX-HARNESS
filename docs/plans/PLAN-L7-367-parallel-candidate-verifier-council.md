---
plan_id: PLAN-L7-367-parallel-candidate-verifier-council
title: "PLAN-L7-367: parallel candidate verifier council"
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
  - artifact_path: tests/parallel-candidate-verifier-council.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-217-pair-agent-consultation-precedence
  references:
    - PLAN-L7-363-isolated-worktree-sandbox-runner
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-367: parallel candidate verifier council

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
