---
plan_id: PLAN-REVERSE-223-clean-distribution-no-web
title: "PLAN-REVERSE-223: clean distribution no-web backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: be
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: TL (Codex)
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    reason: "PLAN-L7-157 already required screenless clean distribution. This slice hardens the interpretation and evidence at L6/L7 without changing product requirements."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "The setup/distribution block already owns clean distribution at the architecture level; this slice hardens the L6/L7 artifact contract."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "No schema, API, or detailed interface shape changes are required; the existing distribution planning surface is reused."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/setup-solo-team.md
    reason: "The clean export contract now excludes central UI runtime, web-only tests, and frontend residue."
  - layer: HELIX-L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P6 now records no-web clean distribution semantics and optional web module loading."
  - layer: L3-acceptance-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L3-acceptance-test-design.md
    reason: "AT-DIST-001 observes absence of `src/web/` and web-only tests before install/status/distribution/typecheck."
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-SETUP-011 and U-SETUP-013 now encode no-web distribution as artifact exclusion plus core CLI viability."
  - layer: HELIX-L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-DIST-01 now binds HC-P6 distribution to the stronger no-web clean artifact contract."
  - layer: prior-plan
    decision: updated
    evidence_path: docs/plans/PLAN-L7-157-distribution-clean-pull.md
    reason: "R2/AC2 and cross-review M2 now explicitly close the weaker no-screen wording."
agent_slots:
  - role: tl
    slot_label: "TL - no-web backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-223-clean-distribution-no-web.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-223-clean-distribution-no-web.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-157-distribution-clean-pull.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L3-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-223-clean-distribution-no-web.md
  requires:
    - docs/plans/PLAN-L7-223-clean-distribution-no-web.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T10:23:04+09:00"
    tests_green_at: "2026-07-01T10:23:04+09:00"
    verdict: pass
    scope: "Backfilled the no-web distribution interpretation from PLAN-L7-157 R2/AC2 into L6 function design, HELIX HC-P6, L3 acceptance design, L7 unit design, and HELIX HU-PILLAR-DIST-01."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/distribution-acceptance.test.ts tests/web.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:489ffab05e118deb404f475310a65dd58650da75465bc3124ad007fa45f567f4"
      - kind: smoke
        command: "bun test tests/setup.test.ts tests/distribution-acceptance.test.ts tests/web.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: tests/distribution-acceptance.test.ts
        output_digest: "sha256:3c11dda19ff144068769244a9dd28f02ff0c06328a98a1b9a354d5879b80ae5c"
      - kind: smoke
        command: "sha256sum docs/plans/PLAN-L7-157-distribution-clean-pull.md docs/design/harness/L6-function-design/setup-solo-team.md docs/design/helix/L6-function-design/pillar-function-design.md docs/test-design/harness/L3-acceptance-test-design.md docs/test-design/harness/L7-unit-test-design.md docs/test-design/helix/L6-pillar-unit-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: docs/plans/PLAN-L7-157-distribution-clean-pull.md
        output_digest: "sha256:56d86a78bcfb8855585540e7ac0ca5be96354743b97df36737248188b60981d2"
---

# PLAN-REVERSE-223: clean distribution no-web backfill

## Objective

Backfill the distribution design so "screenless" is evaluated by artifact
semantics. A clean package must not carry UI runtime files, web-only tests, or
frontend residue, while the dogfood source repo may still keep the web slice for
future UI work.

## Backfill Result

- PLAN-L7-157 R2/AC2 now defines no-web distribution explicitly.
- L6 setup design and HELIX HC-P6 describe the clean export contract with
  `src/web/`, `tests/web.test.ts`, and frontend residue excluded.
- L3/L7 harness test design and HELIX HU-PILLAR-DIST-01 observe the same
  contract.
- Implementation remains additive and keeps source-repo web tests green.

## Acceptance Criteria

- `PLAN-L7-223` and this Reverse PLAN require each other.
- No product requirement expansion: this only hardens the already-required
  screenless clean distribution.
- Source web implementation remains available outside the clean distribution.
