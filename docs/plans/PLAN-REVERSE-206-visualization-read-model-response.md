---
plan_id: PLAN-REVERSE-206-visualization-read-model-response
title: "PLAN-REVERSE-206: visualization read-model semantic back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: be
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
    reason: "既存 L1 §2.8 の deterministic visualization 要求を実装可能な read-model response へ降ろす。新規要求は増やさない。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/architecture.md
    reason: "既存 state-db module に query layer を追加するだけで top-level module / action surface は増やさない。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
    reason: "既存 projection table の read-only 集計であり schema / migration は増やさない。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "`buildVisualizationSnapshot` function contract を追加し、VSCode/Webview 表示の API response 境界を固定。"
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-VISUAL-001/002 を追加し、determinism と projection-only evidence 誤表示禁止を oracle 化。"
agent_slots:
  - role: tl
    slot_label: "TL - visualization semantic back-fill review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-206-visualization-read-model-response.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-206-visualization-read-model-response.md
  requires:
    - docs/plans/PLAN-L7-206-visualization-read-model-response.md
  references:
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:20:00+09:00"
    tests_green_at: "2026-06-30T03:20:00+09:00"
    verdict: approve
    scope: "Reverse back-fill confirms the visualization implementation is a read-only response contract under existing L1 §2.8, with no schema, action surface, or authoring-source shift."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:20:00+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:5338c184e2ed20e96237ca27ed8afd7c3651b7f86b35076750dc6067397ee916"
---

# PLAN-REVERSE-206: visualization read-model semantic back-fill

## R0-R4 Summary

- R0: `PLAN-DISCOVERY-10` existed, but the API/read-model response was not
  fixed at L6/L7. A UI ticket alone could still drift into LLM-generated
  summaries.
- R1: The as-built response is a deterministic query over existing harness.db
  projection rows.
- R2: L1 §2.8 remains the requirement source. L4/L5 remain stable because no new
  module or schema is introduced; R4 routing uses the nearest supported
  Forward enum (`L5`) while the actual updated contract is L6.
- R3: L6 receives a function contract and L7 receives unit/CLI oracles.
- R4: `PLAN-L7-206` is the Forward merge point for this back-fill.

## Back-Filled Meaning

The visualization surface is a read-only response contract first, not a Webview
implementation first. UI renderers may choose Tree View, Mermaid, or a Webview,
but they must consume deterministic DB/docs-derived rows and drill down to
source evidence. Runtime evidence counts must keep accepted runtime verification
separate from projection-only telemetry.

## Merge Boundary

This Reverse does not add a VSCode extension, mutate docs from DB rows, or
create action buttons. Execution, external API calls, settings mutation, branch
or ruleset changes remain outside the read model and require action-binding
approval in a later PLAN.
