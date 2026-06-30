---
plan_id: PLAN-REVERSE-215-hosted-preflight
title: "PLAN-REVERSE-215: hosted API preflight backfill"
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
    reason: "HBR-P2 now records hosted/API preflight core as implemented while preserving all-agent rule/memory generalization and Glossary SSoT as separate residual work."
  - layer: L3-requirements
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "HR-FR-P2-03 and HR-NFR-AC-02 remain the same requirements, but the residual-gap statement now records PLAN-L7-215 as implementation evidence."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-AC already defined hosted API/developer tool boundary and preflight-only behavior."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "HC-AC already defined adapter rule file, hook map, hosted API/developer-tool surface, and preflight audit contract at L5 granularity."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-AC now specifies direct hook coverage, hosted preflight-only classification, required hosted evidence, and work-guard block propagation."
  - layer: L1-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    reason: "HOT-P2/HOT-NAC now cite hosted/API preflight evidence without claiming whole-program completion."
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P2-03 and HAT-NAC-02 now point to tests/hosted-preflight.test.ts."
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P2-03 and HU-PILLAR-NAC-02 now cover direct vs hosted classification and hosted preflight evidence."
agent_slots:
  - role: tl
    slot_label: "TL - hosted/API preflight backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-215-hosted-preflight.md
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
  parent: docs/plans/PLAN-L7-215-hosted-preflight.md
  requires:
    - docs/plans/PLAN-L7-215-hosted-preflight.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:20:00+09:00"
    tests_green_at: "2026-07-01T07:20:00+09:00"
    verdict: pass
    scope: "Backfilled PLAN-L7-215 into HELIX P2/HNFR-AC requirements, function design, and paired test design. The backfill records hosted/API preflight as implemented while preserving all-agent rule/memory generalization, Glossary SSoT, and whole-program approval blockers."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/hosted-preflight.test.ts tests/work-guard.test.ts tests/codex-hook-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:20:00+09:00"
        evidence_path: tests/hosted-preflight.test.ts
        output_digest: "sha256:766166f6df5163bb6cc964b8307a37f0139633fefd1b79be5265fb92c1aaf98b"
---

# PLAN-REVERSE-215: hosted API preflight backfill

## Objective

Backfill `PLAN-L7-215` so hosted/API preflight enforcement is not an isolated
implementation. The semantic source remains HELIX P2/HNFR-AC: direct hook
surfaces and hosted/API developer tools must be distinguished, and hosted edits
must not pass without preflight evidence.

## Backfill Result

- HBR-P2 / HOT-P2 now record hosted/API preflight as implemented evidence while
  keeping whole-program completion blocked by approval/S4/cutover decisions.
- HNFR-AC / HOT-NAC keep all-agent rule/memory generalization as residual work.
- L6 HC-AC specifies direct hook coverage, hosted preflight-only classification,
  required preflight evidence, and work-guard block propagation.

## Acceptance Criteria

- `PLAN-L7-215` and this Reverse PLAN require each other for add-impl backfill
  closure.
- The new preflight enforcement is test-cited by `HU-PILLAR-P2-03` and
  `HU-PILLAR-NAC-02`.
- The backfill does not claim mechanical repo hook coverage for hosted/API tools.
- The backfill does not claim whole-program completion.
