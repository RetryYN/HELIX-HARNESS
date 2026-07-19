---
plan_id: PLAN-REVERSE-214-loop-effort-budget
title: "PLAN-REVERSE-214: loop effort-budget backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: TL (Codex)
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/design/helix/L1-requirements/pillar-requirements.md
    reason: "HBR-P2 now distinguishes implemented loop effort-budget enforcement from hosted/API preflight work later closed by PLAN-L7-215."
  - layer: L3-requirements
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "HR-FR-P2-02 remains the same requirement, but the residual-gap statement now records PLAN-L7-214 as the core implementation evidence."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-P2 already defined loop effort as an agent-loop-contract concern; this backfill materializes the L6/L7 function."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "HC-P2 already defined effort budget, model role, provider route, and over-budget self-continue failure mode at L5 granularity."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P2 now specifies plan-size/model-role limits, iteration/tool/cost/elapsed usage, tick pre/post enforcement, and effort_budget stop evidence."
  - layer: L1-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    reason: "HOT-P2 now cites loop effort-budget evidence without claiming whole P2 completion."
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P2-02 now points to tests/orchestration/orchestration.test.ts and tickLoopEffortBudget."
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P2-02 now covers pure budget decisions and tick pre/post enforcement."
agent_slots:
  - role: tl
    slot_label: "TL - loop effort-budget backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-214-loop-effort-budget.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-214-loop-effort-budget.md
  requires:
    - docs/plans/PLAN-L7-214-loop-effort-budget.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:05:00+09:00"
    tests_green_at: "2026-07-01T07:05:00+09:00"
    verdict: pass
    scope: "Backfilled PLAN-L7-214 into HELIX P2 requirements, function design, and paired test design. The backfill records loop effort-budget as implemented while preserving hosted/API preflight for PLAN-L7-215."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/orchestration/orchestration.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:05:00+09:00"
        evidence_path: tests/orchestration/orchestration.test.ts
        output_digest: "sha256:27d21f17db9adbeac47bd7d1894214c45c679ef657d7a5ddc9e06ab55a39ab1c"
---

# PLAN-REVERSE-214: loop effort-budget backfill（loop effort-budget 逆伝播 backfill）

## 目的

`PLAN-L7-214` を backfill し、新しい loop effort-budget enforcement が孤立した実装に
ならないようにする。意味上の source は HELIX P2 のままであり、agent loop は明示的な
effort limit を持ち、budget 超過時に self-continue したり pass したりしてはならない。

## Backfill 結果

- HBR-P2 / HOT-P2 は loop effort-budget を実装済み evidence として記録した。
  Hosted/API preflight は PLAN-L7-215 で扱う。
- L3 acceptance は HR-FR-P2-02 を変更せず、具体的な test evidence を参照する。
- L6 HC-P2 は plan-size/model-role limits、usage dimensions、`tick` pre/post
  enforcement を明記する。

## 受入条件

- `PLAN-L7-214` とこの Reverse PLAN は、add-impl backfill closure のために相互に
  require されている。
- 新しい budget enforcement は `HU-PILLAR-P2-02` で test-cited されている。
- この backfill は P2 全体の完了を主張しない。Hosted/API preflight は PLAN-L7-215 で
  別途 close される。
