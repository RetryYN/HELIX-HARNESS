---
plan_id: PLAN-REVERSE-218-version-up-reapproval-triggers
title: "PLAN-REVERSE-218: version-up reapproval trigger backfill"
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
    reason: "HR-FR-P1-02 now states that version-up activation packets carry reapproval triggers for HEAD/scope/source/evidence drift."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-P1 already owns version-up lifecycle semantics; this slice tightens L6 packet output."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "HC-P1 detailed contract already owns version-up activation packet boundaries; no new L5 block is required."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P1 now records reapprovalTriggers[] as part of buildVersionUpActivationPackets."
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P1-02 now treats HEAD/scope/source/evidence drift as activation blocker or reapproval route."
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P1-02 now expects reapprovalTriggers[] in activation packet behavior."
agent_slots:
  - role: tl
    slot_label: "TL - version-up reapproval trigger backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-218-version-up-reapproval-triggers.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
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
  parent: docs/plans/PLAN-L7-218-version-up-reapproval-triggers.md
  requires:
    - docs/plans/PLAN-L7-218-version-up-reapproval-triggers.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:50:58+09:00"
    tests_green_at: "2026-07-01T07:50:58+09:00"
    verdict: pass
    scope: "Backfilled PLAN-L7-218 into version-up process, HR-FR-P1-02, L6 HC-P1, and paired L3/L6 test design while preserving parked/future and approval boundaries."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
---

# PLAN-REVERSE-218: version-up reapproval trigger backfill

## Objective

Backfill version-up activation reapproval triggers so the new packet field is a
workflow rule, not a JSON-only addition.

## Backfill Result

- `docs/process/modes/version-up.md` defines `reapprovalTriggers[]`.
- HR-FR-P1-02 states that HEAD/scope/source/evidence drift invalidates stale
  activation evidence.
- L6 HC-P1 records the `buildVersionUpActivationPackets` contract.
- L3/L6 paired test design cite the behavior via version-up tests.

## Acceptance Criteria

- `PLAN-L7-218` and this Reverse PLAN require each other for add-impl backfill.
- The new behavior is test-cited by `HU-PILLAR-P1-02`.
- The backfill does not activate parked serverless work or `.ut-tdd -> .helix`
  cutover.
