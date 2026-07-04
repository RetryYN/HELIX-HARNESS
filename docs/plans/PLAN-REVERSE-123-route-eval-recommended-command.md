---
plan_id: PLAN-REVERSE-123-route-eval-recommended-command
title: "PLAN-REVERSE-123: route eval RecommendedCommandV1 fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-07-01
owner: Codex
forward_routing: L4
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: concept
    decision: updated
    evidence_path: docs/governance/helix-harness-concept_v3.1.md
    reason: "The L0 signal-to-mode table now carries the pair-agent TDD add-feature routing vocabulary."
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "The route eval acceptance item and pair-agent TDD recommendation contract are now implemented and checked."
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "The public route eval surface, add-feature mode classification, and pair-agent planning recommendation are part of the L4 command and routing design."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "The implementation reuses the existing schema module and workflow contracts boundary."
agent_slots:
  - role: tl
    slot_label: "TL - route eval fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-123-route-eval-recommended-command.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-123-route-eval-recommended-command.md
  requires:
    - docs/plans/PLAN-L7-123-route-eval-recommended-command.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:28:59+09:00"
    tests_green_at: "2026-07-01T09:28:59+09:00"
    verdict: approve
    scope: "R4 fullback for pair-agent TDD route recommendation into concept, requirements, L4 design, and L7 route oracles."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: docs/governance/helix-harness-concept_v3.1.md
        output_digest: "sha256:1ccc4cb9d537607641dadf71bf4e281f39fbbde6e45970543d8ee70f2c3f3244"
      - kind: unit_test
        command: "bun test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: docs/governance/helix-harness-requirements_v1.2.md
        output_digest: "sha256:6654449488882155e7da27407fc44ddc81419452ddc7cc492ed214670001d8f3"
      - kind: unit_test
        command: "bun test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: docs/design/harness/L4-basic-design/function.md
        output_digest: "sha256:8725842f63f6be27697b164d41f93ad4d0422f6e3fd06a1e467f78e4273b1aa7"
      - kind: unit_test
        command: "bun test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:8b0a5469d89a2f6632771b0c46a574b99cf7f0f0efe9b24bcdabe3d306b835cf"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T15:30:00+09:00"
    tests_green_at: "2026-06-23T15:30:00+09:00"
    verdict: approve
    scope: "R4 fullback from route eval implementation to requirements and L4 design."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\workflow-contracts.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T15:30:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T15:30:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-REVERSE-123: route eval RecommendedCommandV1 fullback

## Objective

Back-fill the implemented route evaluation CLI surface to requirements and L4
function design.

## Scope

- Requirements §7.8.2 acceptance records the implemented CLI and contract.
- L4 function design lists the public command and names it as the routing
  surface.
- Human approval resolution remains a separate §7.8.3 acceptance item.

## Acceptance Criteria

- Requirements and L4 design both point to `ut-tdd route eval --format json`.
- Pair-agent TDD route signals are documented as add-feature mode with a
  pair-agent planning recommendation, not as a new mode or completion claim.
- The Reverse record keeps approval-policy execution out of this slice and
  leaves it as the next route-safety scope.
