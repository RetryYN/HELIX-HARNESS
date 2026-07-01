---
plan_id: PLAN-REVERSE-221-pair-agent-replay-evidence
title: "PLAN-REVERSE-221: pair-agent replay evidence backfill"
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
    reason: "HAC-P2-04b now states that pair-agent --save-evidence includes loop_summary, transcript/output digests, and quality_signals projection."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-P2 already owns the pair-agent route at block level; replay counters are L6 execution evidence details."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "The physical tables already include quality_signals; no schema or new L5 block is required."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P2 now requires loop_summary, transcript_digest, phase output_excerpt_digest, and quality_signals projection for pair-agent --save-evidence."
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P2-04 now expects consultation/fix/review loop replay fields and quality_signals projection."
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P2-04 now observes pair-agent replay loop fields and quality_signals projection."
agent_slots:
  - role: tl
    slot_label: "TL - pair-agent replay evidence backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-221-pair-agent-replay-evidence.md
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
  parent: docs/plans/PLAN-L7-221-pair-agent-replay-evidence.md
  requires:
    - docs/plans/PLAN-L7-221-pair-agent-replay-evidence.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:52:22+09:00"
    tests_green_at: "2026-07-01T09:52:22+09:00"
    verdict: pass
    scope: "Backfilled pair-agent replay evidence into HAC-P2-04b, HAT-P2-04, L6 HC-P2, and HU-PILLAR-P2-04. L4/L5 stay unchanged because the block boundary and physical quality_signals sink already exist."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts --test-name-pattern \"projects pair-agent run evidence\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:52:22+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: smoke
        command: "sha256sum docs/design/helix/L6-function-design/pillar-function-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:52:22+09:00"
        evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
        output_digest: "sha256:239418553b56722c54dc3cb22d3b780eef7ad1e69c21eb1e579f0308e36e247e"
      - kind: smoke
        command: "sha256sum docs/test-design/helix/L6-pillar-unit-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:52:22+09:00"
        evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
        output_digest: "sha256:cea1c9b0276b10f5f9587d0774f225f3ac17ed067fa27d896a910ce65578bfa3"
---

# PLAN-REVERSE-221: pair-agent replay evidence backfill

## Objective

Backfill the pair-agent replay evidence change as a design contract. The L7
implementation is not just extra JSON fields; it makes the saved TDD pair loop
auditable as consultation, review failure, and fix-cycle evidence.

## Backfill Result

- HAC-P2-04b records `loop_summary`, transcript digest, phase output digest, and
  `quality_signals` projection as part of `--save-evidence`.
- HAT-P2-04 observes the same replay fields at acceptance level.
- L6 HC-P2 and HU-PILLAR-P2-04 expect replayable consultation/fix/review loop
  evidence.
- L4 and L5 remain unchanged because they already define the pair-agent block
  boundary and existing `quality_signals` sink.

## Acceptance Criteria

- `PLAN-L7-221` and this Reverse PLAN require each other.
- The changed L3/L6 design and paired test design cite the semantic replay fields.
- The implementation remains additive and preserves frontier approval and
  CI/merge-gate boundaries.
