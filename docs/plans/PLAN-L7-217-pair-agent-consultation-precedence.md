---
plan_id: PLAN-L7-217-pair-agent-consultation-precedence
title: "PLAN-L7-217 (add-impl): pair-agent consultation precedence"
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
    slot_label: "TL - pair-agent consultation precedence"
  - role: qa
    slot_label: "QA - pair-agent TDD loop regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-217-pair-agent-consultation-precedence.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-217-pair-agent-consultation-precedence.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/pair-agent.ts
    artifact_type: source_module
  - artifact_path: tests/pair-agent.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
  requires:
    - docs/plans/PLAN-REVERSE-217-pair-agent-consultation-precedence.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:41:20+09:00"
    tests_green_at: "2026-07-01T07:41:20+09:00"
    verdict: approve
    scope: "Pair-agent TDD route now treats any lightweight consultation question as pending consultation, even when changed-files/test/implementation evidence is present. The smart review agent must provide an implementation directive or fix response before the next light fix cycle; mixed consultation output cannot silently pass as implementation."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:41:20+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:57eff1fd2acb014c9f7c5ab3857cf37c33341e877cf86a57b8187b248b39a330"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:41:20+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:57eff1fd2acb014c9f7c5ab3857cf37c33341e877cf86a57b8187b248b39a330"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:41:20+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:f36f925b2ef7ddf24d78aa836d3043b562ea927487318e251b59a63f1701fd38"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:41:20+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:f36f925b2ef7ddf24d78aa836d3043b562ea927487318e251b59a63f1701fd38"
---

# PLAN-L7-217: pair-agent consultation precedence

## Objective

Close the pair-agent workflow hole where a lightweight implementation output
could include both implementation evidence and a consultation question. In that
case, the consultation must win: the route is not Green until the smart review
agent gives a directive or fix response and the next light fix cycle applies it.

## Scope

- Treat any `CONSULTATION_QUESTION` from `light_implementation` as pending
  consultation, regardless of simultaneous changed-files/test/notes evidence.
- Add a regression test proving mixed consultation output routes through smart
  instruction before the next light fix cycle.
- Backfill HR-FR-P2-04 / HAC-P2-04b and L3/L6 pair test design.

## Non-Scope

- Does not execute external provider CLIs.
- Does not change frontier approval requirements.
- Does not make pair-agent local verdict a CI/merge gate substitute.

## External Basis

The rule follows the existing TDD basis cited by L6: Red/oracle clarification is
part of the TDD loop, not a Green implementation. Fowler's TDD Red/Green cycle
and NIST SSDF review/remediation evidence both support requiring explicit review
instruction before treating ambiguous implementation work as accepted.

## DoD

- [x] Mixed implementation evidence plus consultation is marked pending.
- [x] Smart directive/fix response is required before the next light fix cycle.
- [x] Pair-agent tests cover the regression.
- [x] L3/L6 design and paired test-design are updated.
