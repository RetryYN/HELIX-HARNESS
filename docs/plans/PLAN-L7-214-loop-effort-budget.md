---
plan_id: PLAN-L7-214-loop-effort-budget
title: "PLAN-L7-214 (add-impl): loop effort-budget enforcement"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - HC-P2 loop effort-budget enforcement"
  - role: qa
    slot_label: "QA - over-budget loop cannot continue or pass"
generates:
  - artifact_path: docs/plans/PLAN-L7-214-loop-effort-budget.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/loop-effort-budget.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/loop-runner.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/loop-state.ts
    artifact_type: source_module
  - artifact_path: tests/orchestration/orchestration.test.ts
    artifact_type: test_code
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
  parent: docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
  requires:
    - docs/plans/PLAN-L3-06-helix-pillar-descent.md
    - docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
    - docs/plans/PLAN-REVERSE-214-loop-effort-budget.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:05:00+09:00"
    tests_green_at: "2026-07-01T07:05:00+09:00"
    verdict: approve
    scope: "HC-P2 loop effort-budget: plan size / model role / iteration / toolCalls / costUsd / elapsedMs now have a pure budget decision, and tick applies it before worker dispatch and before verifier verdict recording. Over-budget loops stop with effort_budget and cannot record same-worker pass/continue. This closes the core loop effort-budget gap but does not close hosted/API preflight or whole-program completion."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/orchestration/orchestration.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:05:00+09:00"
        evidence_path: tests/orchestration/orchestration.test.ts
        output_digest: "sha256:27d21f17db9adbeac47bd7d1894214c45c679ef657d7a5ddc9e06ab55a39ab1c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:05:00+09:00"
        evidence_path: src/orchestration/loop-effort-budget.ts
        output_digest: "sha256:71f0b3adcee87013c199c4f7510764c3f522e0014aab48878a0ad63c0d6f7dfb"
---

# PLAN-L7-214: loop effort-budget enforcement

## Objective

Close the HC-P2 / HR-FR-P2-02 gap where loop budget was described at L3/L6 but
the runtime only had a generic `cost_budget` stop rule. The implementation must
bind effort to plan size, model role, iteration count, tool use, cost, and
elapsed time, and must prevent an over-budget worker from continuing or recording
`pass`.

## Scope

- Add `src/orchestration/loop-effort-budget.ts` with pure budget construction,
  derived role/plan-size limits, and `tickLoopEffortBudget`.
- Extend `LoopState` with optional effort-budget state while preserving existing
  loop JSON compatibility.
- Connect `tick` to the budget decision before worker dispatch and before
  verifier verdict recording.
- Add unit coverage for derived limits, over-budget detection, pre-dispatch stop,
  and post-verdict pass suppression.
- Update L1/L3/L6 and paired test-design text so P2 residuals no longer claim
  loop effort-budget is wholly absent.

## Non-Scope

- This PLAN does not make hosted/API developer tools mechanically hook-covered.
- This PLAN does not implement the full continuous-run heartbeat engine.
- This PLAN does not activate `.ut-tdd -> .helix` cutover.

## Design Notes

`tickLoopEffortBudget` is intentionally pure and provider-neutral. The runtime
loop may inject fresh usage through `readEffortUsage`; if absent, the decision
uses the budget usage stored on `LoopState`. A configured overrun always returns
`allowContinue=false` and `allowWorkerPass=false`, so `tick` cannot silently
turn an over-budget pass into loop progress.

## DoD

- [x] Plan-size / model-role derived limits exist.
- [x] Iteration / toolCalls / costUsd / elapsedMs overrun fails closed.
- [x] `tick` stops before worker dispatch when the budget is already exceeded.
- [x] `tick` suppresses post-verifier `pass` when the budget becomes exceeded.
- [x] L1/L3/L6 design and paired test-design are updated without claiming whole
      P2 completion.
