---
plan_id: PLAN-REVERSE-130-right-arm-gate-planning
title: "PLAN-REVERSE-130: right-arm gate planning fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-30
owner: Codex
forward_routing: L4
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/governance/ut-tdd-agent-harness-requirements_v1.2.md
    reason: "The existing requirement already records G8-G14 as future mechanization; this slice mechanizes the planning route."
  - layer: process-gates
    decision: updated-by-plan-evidence
    evidence_path: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
    reason: "The carry now has a concrete PLAN, official source ledger, and doctor lint checks the route."
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "The basic function model is unchanged; this slice only enforces planning evidence."
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/internal-processing.md
    reason: "Detailed G8-G14 fail-close behavior remains child-plan work."
  - layer: implementation
    decision: updated
    evidence_path: src/lint/right-arm-gate-planning.ts
    reason: "Doctor now fails if the carry has no concrete PLAN route."
agent_slots:
  - role: tl
    slot_label: "TL - right-arm gate planning fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-130-right-arm-gate-planning.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/gates.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/ut-tdd-agent-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/internal-processing.md
    artifact_type: design_doc
  - artifact_path: src/lint/right-arm-gate-planning.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
dependencies:
  parent: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
  requires:
    - docs/plans/PLAN-L7-130-right-arm-gate-planning.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T14:21:41+09:00"
    tests_green_at: "2026-06-30T14:21:41+09:00"
    verdict: approve
    scope: "R4 fullback update for official source ledger semantic grounding."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/right-arm-verification-strategy.test.ts tests/right-arm-gate-planning.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T14:19:36+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:7784e6d73cdce4c48315c409ae74f30ffaa728dfd4a71227b823338329f7ec02"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:21:31+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:7784e6d73cdce4c48315c409ae74f30ffaa728dfd4a71227b823338329f7ec02"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:21:41+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:5763680f81c135d7bdd24cd1c98eb1f331905bfde21717d979c857bd11e6dff4"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T16:30:00+09:00"
    tests_green_at: "2026-06-23T16:30:00+09:00"
    verdict: approve
    scope: "R4 fullback for IMP-052 route mechanization."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\right-arm-gate-planning.test.ts tests\\lint-wiring.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T16:30:00+09:00"
        evidence_path: tests/right-arm-gate-planning.test.ts
        output_digest: "sha256:f321df37a40bc2ea221a2a2ab9d07c36ff6c8be0e02524791c40d198e8e9fb3b"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:30:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:358f76d23bc9090b638152803fcbd19146121899675c0a90019a0ac3e9bb8a54"
---

# PLAN-REVERSE-130: right-arm gate planning fullback

## Objective

Record the back-propagation decision for turning the G8-G14 unplanned carry into
a doctor-enforced planning route.

## Scope

- This reverse slice does not claim full G8-G14 gate implementation.
- It closes the specific process hole where the carry could remain "future PLAN"
  without any actual PLAN artifact.
- It also closes the weaker-source hole where external verification standards
  could be referenced by name without an official URL, adopted version/date,
  latest official status, adoption decision, verification use, and gate impact.
- Future child PLANs should define the concrete G8-G14 fail-close conditions.

## Acceptance Criteria

- The L7 PLAN and reverse PLAN both exist as machine-readable artifacts.
- Doctor runs the right-arm planning lint.
- The lint fails in tests when no PLAN route exists.
- The right-arm verification strategy fails if its official source ledger loses
  semantic source-to-gate mapping.
