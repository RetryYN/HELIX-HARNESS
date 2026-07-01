---
plan_id: PLAN-REVERSE-217-pair-agent-consultation-precedence
title: "PLAN-REVERSE-217: pair-agent consultation precedence backfill"
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
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "HR-FR-P2-04 / HAC-P2-04b now state that consultation questions take precedence over simultaneous implementation evidence and that light-agent completion/approval/verdict markers fail-close."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-P2 already defines the pair-agent route at workflow block level; this slice tightens L6 execution semantics."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "HC-P2 detailed contract already owns pair-agent run semantics; no new L5 block is required."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P2 now records consultation precedence and light-agent closing-authority marker rejection in the runPairAgentTddPlan contract."
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P2-04 now cites pair-agent consultation precedence and light-agent closure-claim rejection as acceptance evidence."
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P2-04 now expects mixed consultation output to remain pending until smart response and light closure markers to fail-close."
agent_slots:
  - role: tl
    slot_label: "TL - pair-agent consultation precedence backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-217-pair-agent-consultation-precedence.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-217-pair-agent-consultation-precedence.md
  requires:
    - docs/plans/PLAN-L7-217-pair-agent-consultation-precedence.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:16:27+09:00"
    tests_green_at: "2026-07-01T09:16:27+09:00"
    verdict: pass
    scope: "Backfilled the light-agent closing-authority rejection into HR-FR-P2-04/HAC-P2-04b, L6 HC-P2, and paired L3/L6 test design. This keeps the smart review agent as the only local verdict authority in the TDD pair route."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:f698066884627d97eb9550441c85ac444773f569d10534e28f2f3c22ef55e7b2"
      - kind: smoke
        command: "sha256sum docs/design/helix/L3-requirements/pillar-functional-requirements.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
        output_digest: "sha256:4e5a63c3892774eca246120e66bad38c73b99950b1faaef5d044a49cf40cb200"
      - kind: smoke
        command: "sha256sum docs/design/helix/L6-function-design/pillar-function-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
        output_digest: "sha256:3a8569bd1dd080d7a7be99dd0902c5b8b9f423f45f5e9e39470efd178b5587a8"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:41:20+09:00"
    tests_green_at: "2026-07-01T07:41:20+09:00"
    verdict: pass
    scope: "Backfilled PLAN-L7-217 into HR-FR-P2-04/HAC-P2-04b, L6 HC-P2, and paired L3/L6 test design. The backfill preserves frontier approval and CI/merge gate boundaries."
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
        output_digest: "sha256:f698066884627d97eb9550441c85ac444773f569d10534e28f2f3c22ef55e7b2"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:41:20+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:f698066884627d97eb9550441c85ac444773f569d10534e28f2f3c22ef55e7b2"
---

# PLAN-REVERSE-217: pair-agent consultation precedence backfill

## Objective

Backfill pair-agent consultation precedence so the implementation change is a
workflow rule, not an isolated parser tweak. The semantic source is HR-FR-P2-04:
the light agent may ask for consultation, but consultation is not a pass.

## Backfill Result

- HR-FR-P2-04 / HAC-P2-04b record that consultation mixed with implementation
  evidence still routes to smart instruction.
- HR-FR-P2-04 / HAC-P2-04b record that light-agent completion/approval/verdict
  markers fail-close because the light implementation agent has no closing
  authority.
- L6 HC-P2 records the `runPairAgentTddPlan` fail-close contract.
- L3/L6 paired test design cite `tests/pair-agent.test.ts`.
- Frontier approval, evidence persistence, and CI/merge boundaries remain
  unchanged.

## Acceptance Criteria

- `PLAN-L7-217` and this Reverse PLAN require each other for add-impl backfill.
- The new behavior is test-cited by `HU-PILLAR-P2-04`.
- The backfill does not claim whole-program completion or `.ut-tdd -> .helix`
  cutover.
