---
plan_id: PLAN-REVERSE-213-tool-contract-registry
title: "PLAN-REVERSE-213: typed agent-tool contract registry backfill"
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
    reason: "HBR-P2 now distinguishes the implemented typed agent-tool request/response registry core from loop effort-budget (later PLAN-L7-214) and hosted/API preflight (later PLAN-L7-215)."
  - layer: L3-requirements
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "HR-FR-P2-01 remains the same requirement, but the residual-gap statement now records PLAN-L7-213 as the core implementation evidence."
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/architecture.md
    reason: "The orchestration module map now exposes validateToolContractSurface as part of the P2 pure contract core."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "HC-P2 already defined tool call request, registered surface, tool contract registry, and tool request/response schema validator at L5 granularity; this backfill only materializes the L6/L7 function."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P2 now specifies request required fields, response required fields, forbidden fields, explicit defer, and deny disposition for tool contracts."
  - layer: L1-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    reason: "HOT-P2 now cites typed contract registry evidence without claiming whole P2 completion."
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P2-01 now points to tests/tool-contract.test.ts and doctor tool-contract-registry."
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P2-01 now covers request/response contract validation and registered deny surfaces."
agent_slots:
  - role: tl
    slot_label: "TL - typed agent-tool contract backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-213-tool-contract-registry.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
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
  parent: docs/plans/PLAN-L7-213-tool-contract-registry.md
  requires:
    - docs/plans/PLAN-L7-213-tool-contract-registry.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T06:44:00+09:00"
    tests_green_at: "2026-07-01T06:44:00+09:00"
    verdict: pass
    scope: "Backfilled PLAN-L7-213 into HELIX P2 requirements, architecture, function design, and paired test design. The backfill records typed request/response contract registry as implemented while preserving loop effort-budget for PLAN-L7-214 and hosted/API preflight for PLAN-L7-215."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T06:44:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:c3e9d220ec9291ae92893b01eb459952089f753683619874e6b18d9861128dc3"
---

# PLAN-REVERSE-213: typed agent-tool contract registry backfill

## Objective

Backfill `PLAN-L7-213` so the new typed agent-tool contract registry is not an
isolated implementation. The semantic source remains HELIX P2: agent loop
engineering must validate tool request/response contracts and prevent unknown
tool surfaces from becoming untracked autonomy.

## Backfill Result

- HBR-P2 / HOT-P2 record the typed request/response registry as implemented
  evidence. Loop effort-budget is handled by PLAN-L7-214 and hosted/API
  preflight by PLAN-L7-215.
- L3 acceptance keeps HR-FR-P2-01 unchanged but points to concrete test and
  doctor evidence.
- L4 architecture includes `validateToolContractSurface` in the orchestration
  pure contract core.
- L6 HC-P2 specifies request required fields, response required fields, forbidden
  fields, registered deny surfaces, and explicit defer semantics.

## Acceptance Criteria

- `PLAN-L7-213` and this Reverse PLAN require each other for add-impl backfill
  closure.
- The new registry is test-cited by `U-TOOLCONTRACT-001..006`.
- Doctor exposes `tool-contract-registry`.
- The backfill does not claim whole P2 completion. Loop effort-budget is closed
  separately by PLAN-L7-214; hosted/API preflight is closed separately by
  PLAN-L7-215.
