---
plan_id: PLAN-REVERSE-224-pair-agent-difficulty-budget
title: "PLAN-REVERSE-224 (reverse): pair-agent difficulty budget"
kind: reverse
layer: cross
workflow_phase: R4
drive: agent
status: confirmed
confirmed_reverse_type: code
forward_routing: L5
promotion_strategy: reuse-with-hardening
created: 2026-07-01
updated: 2026-07-01
owner: Codex
agent_slots:
  - role: tl
    slot_label: "TL - reverse pair-agent difficulty policy"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-224-pair-agent-difficulty-budget.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-224-pair-agent-difficulty-budget.md
---

# PLAN-REVERSE-224: pair-agent difficulty budget

## R0 Evidence Acquisition

`src/orchestration/pair-agent.ts` already accepted `difficulty?: TaskDifficulty`,
but `buildPairAgentTddPlan` ignored it and defaulted all pair-agent runs to the
same `maxFixCycles` value.

Review also found two contract hazards in the surrounding release evidence:
CLI `--max-fix-cycles` used `parseInt` truncation, and the green-command digest
doctor gate treated every valid historical digest drift as a hard mismatch,
which encouraged rewriting old PLAN evidence instead of preserving the original
review-time digest.

## R1 Observed Contracts

- Pair-agent has a smart-test-author -> light-implementation -> smart-review
  sequence.
- `TaskDifficulty` exists in `src/team/model-policy.ts`.
- CLI `pair-agent plan/run` exposed `--max-fix-cycles` but not `--difficulty`.
- Review evidence digest must prevent fake evidence without requiring historical
  evidence restamping after later source/test edits.

## R2 As-Is Design

The old route separated task difficulty inference from pair-agent loop sizing.
That made the type look aligned with the user-facing requirement while the
runtime behavior stayed constant.

## R3 Intent Hypothesis

Pair-agent should use difficulty to set a conservative default fix-loop budget,
while preserving explicit operator override and auditability.

Review evidence should be immutable: malformed placeholder digest and missing
evidence files are hard failures, while a valid 64-hex digest that no longer
matches the current file is historical drift, not permission to rewrite old
evidence.

## R4 Gap & Routing

Route to L6/L7 add-impl:

- L6 design: record difficulty policy and max-cycle exhaustion invariant.
- L7 code: apply difficulty-derived default, CLI difficulty validation, and
  exhaustion finding; validate max-cycle CLI input strictly.
- L7 tests: cover inferred/explicit difficulty, CLI validation, exhausted loop
  finding, and audit-safe digest drift behavior.
