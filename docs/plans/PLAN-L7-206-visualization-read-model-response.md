---
plan_id: PLAN-L7-206-visualization-read-model-response
title: "PLAN-L7-206 (add-impl): deterministic visualization read-model response"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - semantic visualization contract review"
  - role: se
    slot_label: "SE - deterministic DB read model"
  - role: qa
    slot_label: "QA - projection-only evidence oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-206-visualization-read-model-response.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-206-visualization-read-model-response.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/state-db/visualization-read-model.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/visualization-read-model.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-205-run-debug-db-projection.md
  requires:
    - docs/plans/PLAN-REVERSE-206-visualization-read-model-response.md
    - docs/plans/PLAN-L7-205-run-debug-db-projection.md
  references:
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:20:00+09:00"
    tests_green_at: "2026-06-30T03:20:00+09:00"
    verdict: approve
    scope: "Visualization work is now grounded in a deterministic DB read-model response instead of an LLM-generated diagram or UI-only ticket. The response keeps projection-only runtime evidence blocked from accepted runtime verification."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:20:00+09:00"
        evidence_path: tests/visualization-read-model.test.ts
        output_digest: "sha256:d8250da81a45567b00e32b8a41a71c30d0cede427ed1726d156db17cf2232516"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:20:00+09:00"
        evidence_path: src/state-db/visualization-read-model.ts
        output_digest: "sha256:578b3248089279d35cb7fb7196d851203a2ea24c5bcbc382f2d0ca8c26912bf6"
---

# PLAN-L7-206: deterministic visualization read-model response

## Objective

Close the semantic gap in `PLAN-DISCOVERY-10`: a visualization ticket alone does
not satisfy HBR-P9/HBR-P4. VSCode Webview/View needs a deterministic response
that says what the UI may render and how runtime evidence must be classified.

## Scope

- Add `buildVisualizationSnapshot(db)` as a read-only query over existing
  harness.db projection tables.
- Add `ut-tdd progress snapshot --json` as the UI-facing response surface.
- Preserve drill-down pointers to artifact progress, relation graph export,
  search, and runtime verification rows.
- Keep `projection_only_unverified` and missing-provenance runtime evidence out
  of accepted runtime counts.
- Register the new command in `ut-tdd builder catalog` so the command catalog
  remains aligned with the implemented surface.

## Non-Goals

- This PLAN does not implement the VSCode extension or Webview renderer.
- This PLAN does not add a new projection table or make DB rows the authoring
  source.
- This PLAN does not expose action buttons, external API calls, branch/ruleset
  mutation, or provider transcript storage.
- This PLAN is a first response slice for L1 §2.8, not the full visualization
  closure. Review evidence detail, `trace_edges`, feedback/findings, agent
  slots, handover, and memory recall remain visible through existing projection
  surfaces or follow-up Webview/View PLAN work.

## Acceptance Criteria

- The snapshot is deterministic for identical DB input and cold-start safe.
- Artifact red/yellow/green, plan status, gate status, graph node/edge/snapshot,
  test run, runtime verification, skill/model, and guardrail counts are present.
- Projection-only runtime evidence is surfaced as blocked/warning state, not
  accepted runtime verification.
- A projection-only row with an inconsistent `accept_status=accepted` is still
  excluded from accepted runtime verification unless its class is
  `runtime_verified`.
- CLI JSON smoke, targeted unit tests, typecheck, lint, doctor, and full tests
  pass before commit.
