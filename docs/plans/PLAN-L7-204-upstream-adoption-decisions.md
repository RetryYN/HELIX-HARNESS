---
plan_id: PLAN-L7-204-upstream-adoption-decisions
title: "PLAN-L7-204 (add-impl): upstream A-146 semantic adoption decision contracts"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/helix/L6-function-design/upstream-substance-gap.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - upstream A-146 semantic adoption boundary"
  - role: se
    slot_label: "SE - pure upstream adoption decisions"
  - role: qa
    slot_label: "QA - U-UPSTREAM oracle coverage"
generates:
  - artifact_path: docs/plans/PLAN-L7-204-upstream-adoption-decisions.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/runtime/upstream-adoption.ts
    artifact_type: source_module
  - artifact_path: tests/upstream-adoption.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-50-helix-orchestration-memory.md
  requires:
    - docs/plans/PLAN-REVERSE-204-upstream-adoption-decisions.md
    - docs/design/helix/L3-requirements/upstream-substance-gap.md
    - docs/design/helix/L4-basic-design/upstream-substance-gap.md
    - docs/design/helix/L5-detail/upstream-substance-gap.md
    - docs/design/helix/L6-function-design/upstream-substance-gap.md
    - docs/test-design/helix/upstream-substance-gap.md
  references:
    - docs/design/helix/L6-function-design/upstream-substance-gap.md
    - docs/test-design/helix/upstream-substance-gap.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T02:47:00+09:00"
    tests_green_at: "2026-06-30T02:47:00+09:00"
    verdict: approve
    scope: "Upstream A-146 semantic adoption L6 contracts now have pure L7 decision helpers and U-UPSTREAM-001..009 unit coverage. The implementation keeps runtime provenance and coverage-substance distinctions explicit."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/upstream-adoption.test.ts tests/vmodel-pair.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T02:47:00+09:00"
        evidence_path: tests/upstream-adoption.test.ts
        output_digest: "sha256:f876c2eda955c889739799ff506d6beface45cf4d19e810506f9941df565886c"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:47:00+09:00"
        evidence_path: src/runtime/upstream-adoption.ts
        output_digest: "sha256:1f9d0f1bdfc20996642a18c8215933bea595aa84536b651bf515a83d0eeb65b2"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:47:00+09:00"
        evidence_path: src/runtime/upstream-adoption.ts
        output_digest: "sha256:1f9d0f1bdfc20996642a18c8215933bea595aa84536b651bf515a83d0eeb65b2"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:47:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:2fc741680c390fe3afc9e5c7f86e8cd6b917ca931d074892f55e6766d09412b9"
---

# PLAN-L7-204: upstream A-146 semantic adoption decision contracts

## Objective

Implement the L7 slice for upstream A-146 semantic adoption contracts lowered in
`upstream-substance-gap.md`. This does not copy upstream prose or runtime state;
it makes the eight A-146 findings executable as HELIX adoption decisions.

## Scope

- Implement pure decision helpers for `U-UPSTREAM-001..009` in
  `src/runtime/upstream-adoption.ts`.
- Add focused unit tests in `tests/upstream-adoption.test.ts`.
- Register implementation oracles in the L7 unit-test design.
- Reuse existing `run-debug` runtime surface vocabulary for matcher evidence.

## Non-Goals

- This PLAN does not publish distribution artifacts, sign releases, or run
  external provider CLIs.
- This PLAN does not change database schema or public CLI surfaces.
- This PLAN does not replace the L7.5 runtime verification log; it complements
  it by making upstream coverage/provenance decisions testable.

## Acceptance Criteria

- `src/runtime/upstream-adoption.ts` implements all functions named by the
  upstream A-146 L6 design.
- `tests/upstream-adoption.test.ts` covers `U-UPSTREAM-001..009`.
- Unknown A-146 finding ids are not silently adopted.
- Guard, evidence, telemetry, distribution, FE substance, drive entry, and
  matcher coverage claims all fail closed when evidence is missing or hollow.
- Typecheck, lint, targeted V-model tests, doctor, and full test suite pass.
