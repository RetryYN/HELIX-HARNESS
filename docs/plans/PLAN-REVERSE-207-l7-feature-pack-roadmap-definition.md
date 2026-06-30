---
plan_id: PLAN-REVERSE-207-l7-feature-pack-roadmap-definition
title: "PLAN-REVERSE-207: L7 feature-pack roadmap semantic back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L1-requirements/pillar-requirements.md
    reason: "HBR-P1/HBR-P9 already require work breakdown and DB convergence. This back-fill makes the L7 roadmap express those responsibilities."
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    reason: "Existing pillar blocks already separate continuous autonomy, DB convergence, and visualization. No block boundary changes."
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    reason: "No module dependency boundary changes. Feature packs classify roadmap responsibility over existing modules."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "Roadmap feature-pack schema and L7 feature-pack coverage function contract are added."
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-ROADMAP-025..028 define duplicate/unknown pack and real-repo pack coverage oracles."
agent_slots:
  - role: tl
    slot_label: "TL - feature-pack roadmap back-fill review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-207-l7-feature-pack-roadmap-definition.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md
  requires:
    - docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md
  references:
    - docs/plans/PLAN-REVERSE-44-roadmap-definition-design.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:21:36+09:00"
    tests_green_at: "2026-06-30T03:21:36+09:00"
    verdict: approve
    scope: "Back-fill confirms the change is a roadmap metamodel hardening, not a new user requirement or production schema/API change."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:e0ffe82bef95b8c4115266ee8b1ec790f1bfeca3d4134ebeab55a52c00e6943e"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:2bff04a1e83e1970e3e4420b88768d425396321812a8275aa9bfde77ac53dd05"
      - kind: unit_test
        command: "bun run vitest run tests/roadmap.test.ts tests/doctor.test.ts tests/plan-lint.test.ts tests/impl-plan-trace.test.ts tests/oracle-test-trace.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: tests/roadmap.test.ts
        output_digest: "sha256:e4dee03f96fa6468aff5ddf2b55a30d1669256e4f7e1e50c289218ef840fb710"
---

# PLAN-REVERSE-207: L7 feature-pack roadmap semantic back-fill

## R0-R4 Summary

- R0: The roadmap mechanism registered `layer`, `gates`, and `spans`, but not
  semantic responsibility packs.
- R1: As-built behavior could report L7 coverage while DB, service, frontend,
  and UI responsibilities were only implied by PLAN prose or `drive`.
- R2: The correct as-is model is a program roadmap plus a missing L7 pack
  taxonomy.
- R3: Intent is to make L7 work self-assignable by semantic pack, without
  marking deferred UI complete.
- R4: Route to L5/L6 contract and L7 implementation. Requirements and L4 block
  boundaries are unchanged.

## Gap Closed

`drive` is not a roadmap taxonomy. The forward artifact now carries explicit
`feature_packs[]` and `span.feature_pack`, and doctor checks the required L7
pack layers.
