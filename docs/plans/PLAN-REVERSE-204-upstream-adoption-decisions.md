---
plan_id: PLAN-REVERSE-204-upstream-adoption-decisions
title: "PLAN-REVERSE-204: upstream A-146 semantic adoption decision back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/upstream-substance-gap.md
    reason: "HU-FR-01..08 は既に confirmed。今回の L7 は既存 upstream A-146 採用契約の pure implementation であり、新規 user requirement を増やさない。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/helix/L4-basic-design/upstream-substance-gap.md
    reason: "runtime building block 内の pure decision helper であり、adapter boundary / package boundary を変えない。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/helix/L5-detail/upstream-substance-gap.md
    reason: "HU-C01..08 の contract shape は維持。DB schema/API 契約は追加しない。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/upstream-substance-gap.md
    reason: "TelemetryProvenanceClass / RuntimeMatcherCompatibility の alias と U-RUNDEBUG alias を明示し、実装型と既存 RUN & Debug 契約のズレを解消。"
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-UPSTREAM-001..009 を L7 unit oracle として登録。"
agent_slots:
  - role: tl
    slot_label: "TL - upstream adoption reverse back-fill review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-204-upstream-adoption-decisions.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/upstream-substance-gap.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/upstream-substance-gap.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/upstream-substance-gap.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/upstream-substance-gap.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/upstream-substance-gap.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-204-upstream-adoption-decisions.md
  requires:
    - docs/plans/PLAN-L7-204-upstream-adoption-decisions.md
  references:
    - docs/design/helix/L6-function-design/upstream-substance-gap.md
    - docs/test-design/helix/upstream-substance-gap.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T02:47:00+09:00"
    tests_green_at: "2026-06-30T02:47:00+09:00"
    verdict: approve
    scope: "Reverse back-fill confirms upstream A-146 semantic adoption L7 pure decisions map to existing L3-L6 contracts without changing user requirements, module boundaries, or L5 data/API contracts."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:47:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:adcaf0a35af15962da14931847dd43fa3e7dc56b06c9c00ec42fe2b8be80057f"
---

# PLAN-REVERSE-204: upstream A-146 semantic adoption decision back-fill

## R0-R4 Summary

- R0: `src/runtime/upstream-adoption.ts` implements the upstream A-146 semantic adoption decisions lowered to L6.
- R1: The implementation is pure and does not copy upstream runtime state, publish artifacts, call provider CLIs, or mutate the database.
- R2: L3/L4/L5 were checked; no new user requirement, module boundary, DB schema, or API contract is introduced by this slice.
- R3: L6 type aliases and L7 unit-test design were updated to match the current implementation and existing RUN & Debug oracle names.
- R4: `PLAN-L7-204-upstream-adoption-decisions` and this Reverse PLAN are linked through `dependencies.requires`.

## Back-Filled Meaning

The implementation makes upstream A-146 adoption decisions executable. HELIX can
now test whether a guard claim, consumer CLI path, green-evidence closure,
telemetry row, distribution document, FE design artifact, drive entry, or
runtime matcher claim is substantively acceptable instead of accepting prose
presence or projected evidence.

## Merge Boundary

This Reverse only back-fills L6 naming/alias alignment and L7 unit oracle
registration. It does not claim public distribution publication, external
runtime execution, provider CLI verification, or DB projection for every
decision helper.
