---
plan_id: PLAN-L7-123-route-eval-recommended-command
title: "PLAN-L7-123: route eval RecommendedCommandV1 surface"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-07-01
owner: Codex
parent_design: docs/governance/ut-tdd-agent-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - route eval contract surface"
generates:
  - artifact_path: docs/plans/PLAN-L7-123-route-eval-recommended-command.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-123-route-eval-recommended-command.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/ut-tdd-agent-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/ut-tdd-agent-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: src/workflow/routing-contracts.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-72-task-classify-cli.md
  requires:
    - docs/plans/PLAN-L7-72-task-classify-cli.md
    - docs/plans/PLAN-REVERSE-123-route-eval-recommended-command.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:28:59+09:00"
    tests_green_at: "2026-07-01T09:28:59+09:00"
    verdict: approve
    scope: "Pair-agent TDD routing signals stay in add-feature mode while recommending the pair-agent planning surface; concept, requirements, L4, L7 tests, and CLI contract are aligned."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: unit_test
        command: "bun test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: unit_test
        command: "bun test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: src/workflow/routing-contracts.ts
        output_digest: "sha256:bb0621db65c315b9e92443ed9855b67c8da6fdeab87ed13eb6c403cd4e7b652e"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T15:30:00+09:00"
    tests_green_at: "2026-06-23T15:30:00+09:00"
    verdict: approve
    scope: "Signal route evaluation CLI returns a schema-validated RecommendedCommandV1 and backfills requirements/L4 design."
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
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T15:30:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T15:30:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-L7-123: route eval RecommendedCommandV1 surface

## Objective

Make the signal routing requirement executable through `ut-tdd route eval
--signal <s> --format json`.

## Scope

- Add a deterministic route evaluation contract over known routing signals.
- Return a human-facing `suggest_command` separately from the machine-facing
  `recommended_command`.
- Validate the machine-facing command with `RecommendedCommandV1`.
- Back-fill requirements and L4 function design so this implementation is not
  detached from the design baseline.

## Acceptance Criteria

- Known signals return `mode`, `suggest_command`, and a schema-valid
  `recommended_command`.
- `recommended_command.command` starts with `ut-tdd`; legacy runtime command
  names are rejected by the existing schema.
- Unknown signals return explicit not-available routing (`exit_code=2`) without
  a runnable command.
- `version_deferral` returns `mode=version-up`, matching
  `PLAN-REVERSE-140` / `docs/process/modes/version-up.md` after the
  version-up mode was adopted.
- `pair_agent_tdd` / `pair-agent-tdd` / `pair-agent TDD route` / pair
  programming signals return `mode=add-feature` with
  `recommended_command.command="ut-tdd pair-agent plan"` and the pair-route
  args required by the pair-agent TDD workflow.

## 2026-06-30 version-up route backfill

The original route evaluator predated `PLAN-DISCOVERY-09` / `PLAN-REVERSE-140`.
After version-up was adopted as a mode, docs/process and requirements named
`version_deferral -> version-up`, but `ut-tdd route eval --signal
version_deferral` still returned `no-route`. This was an executable drive-model
gap, not a docs-only typo.

This follow-up adds `version_deferral` / `version-up` / `version_up` tokens to
`src/workflow/routing-contracts.ts` and fixes
`tests/workflow-contracts.test.ts` so the route evaluator and mode docs remain
aligned.

## 2026-07-01 pair-agent TDD route backfill

The pair-agent TDD workflow existed as a planning surface, but route evaluation
did not recommend it from semantically equivalent user signals such as
`pair_agent_tdd` or `pair-agent TDD route`. That made the intended workflow
unreachable from the normal routing surface and could incorrectly fall back to
generic task classification.

This follow-up keeps the mode taxonomy stable (`add-feature`) and narrows the
change to the recommendation contract: pair-agent TDD signals now return
`ut-tdd pair-agent plan` with
`pair_route=smart_test_author_to_light_implementation_to_smart_review` and
`requires_plan_id=true`. Concept §2.6, requirements §7.8, L4 routing design,
L7 unit oracles, workflow contract tests, and CLI surface tests are back-filled
together.
