---
plan_id: PLAN-L7-366-autonomous-loop-run-receipts
title: "PLAN-L7-366: autonomous loop run receipts"
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
backprop_decision_reason: "既存 loop / effort / handover を run receipt へ束ねる L7 追加。無制限自動実行は行わない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - loop receipt / restart / retry evidence"
  - role: qa
    slot_label: "QA - budget stop / completion claim gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-366-autonomous-loop-run-receipts.md
    artifact_type: markdown_doc
  - artifact_path: tests/autonomous-loop-run-receipts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/orchestration-memory.md
  requires:
    - PLAN-L7-343-effort-observation-full-wiring
    - PLAN-L7-354-harness-memory-compaction-impl
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-366: autonomous loop run receipts

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
