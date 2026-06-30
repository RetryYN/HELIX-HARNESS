---
plan_id: PLAN-L7-202-run-debug-runtime-verification
title: "PLAN-L7-202 (add-impl): L7.5 RUN & Debug runtime verification gate"
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
    slot_label: "TL - RUN & Debug verification contract"
  - role: se
    slot_label: "SE - runtime evidence classifier and log event helpers"
  - role: qa
    slot_label: "QA - projection-only rejection and completeness oracles"
generates:
  - artifact_path: docs/plans/PLAN-L7-202-run-debug-runtime-verification.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/runtime/run-debug.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/run-debug.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L6-01-function-spec.md
    - docs/plans/PLAN-REVERSE-202-run-debug-runtime-verification.md
    - docs/plans/PLAN-L7-43-implementation-verification-group.md
    - docs/plans/PLAN-L7-157-distribution-clean-pull.md
    - docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
  references:
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
    - docs/test-design/harness/L7-unit-test-design.md
    - docs/test-design/helix/L6-pillar-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T02:15:00+09:00"
    tests_green_at: "2026-06-30T02:15:00+09:00"
    verdict: approve
    scope: "L7.5 RUN & Debug is now an explicit runtime-verification gate: projection-only rows cannot close runtime claims, runtime claims require session/source/surface/timestamp/evidence provenance, and log events reject secret-like values."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/run-debug.test.ts tests/impl-plan-trace.test.ts tests/vmodel-pair.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: tests/run-debug.test.ts
        output_digest: "sha256:192bd5a2bed49493d64134d64343d9f1a243fee8aa8a3933ab5b67aeeeda3ebc"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:27b3d8f4ee9be5831603989e5211fe2c9f70c23b8fb7b838e0edf364bffd9adf"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: src/runtime/run-debug.ts
        output_digest: "sha256:217764259a121913527a17c247616a3c50c4cf32bea4a3b4367dbd46a20db145"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:c05811f1d253c8fd7abd109a076a3164490d8a5d88c6667f5ff6f159e80ada87"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: tests/run-debug.test.ts
        output_digest: "sha256:192bd5a2bed49493d64134d64343d9f1a243fee8aa8a3933ab5b67aeeeda3ebc"
---

# PLAN-L7-202: L7.5 RUN & Debug runtime verification gate

## Objective

Add the missing L7.5 boundary between static implementation tests and runtime acceptance.
The harness currently has DB projection and unit-test coverage for many runtime-adjacent
features, but a projection row is not proof that a hook fired, a provider executed, or a
debug recovery actually happened. This PLAN makes that distinction explicit.

## Design Contract

Runtime-behavior claims are claims that something `fired`, was `used`, `works`, was
`blocked`, was `recovered`, was `observed`, or was `executed` in a real runtime surface.
Those claims can close only when all of the following are present:

- non-empty `session_id`
- runtime `source` such as `runtime-hook`, `adapter-command`, `run-debug`, or `hosted-preflight`
- runtime surface such as `claude-hook`, `codex-hook`, `adapter-cli`, `team-runner`, `handover`, or `hosted-api-preflight`
- timestamp
- concrete evidence path

Projection-only data remains useful for indexing, dashboards, and trace support, but it
is classified as `projection_only_unverified` and cannot close runtime acceptance. Missing
runtime provenance is a blocked verification state, not an implicit pass.

## Scope

- Add L6 function contracts for runtime evidence classification, RUN & Debug obligation
  calculation, projection-only rejection, runtime verification log event creation, and
  log completeness validation.
- Add a CLI evidence producer (`ut-tdd run-debug log`) that appends complete runtime
  verification events to `.ut-tdd/evidence/run-debug/runtime-verification.jsonl`.
- Add L7 unit oracles `U-RUNDEBUG-001..006`.
- Implement the contracts in `src/runtime/run-debug.ts`.
- Add focused unit tests for projection-only rejection, pure helper exemption, secret-like
  value rejection, completeness validation, and append-only evidence writes.

## Non-Goals

- This PLAN does not launch external Claude/Codex provider CLIs; `run-debug log` records
  evidence produced by an already-observed runtime/debug action.
- This PLAN does not rename `ut-tdd` or `.ut-tdd`; mechanical identifier migration remains
  owned by `PLAN-M-02-helix-identifier-rename`.
- This PLAN does not change database schema. The log event type is an implementation
  contract for append-only evidence producers and future DB projection.

## Acceptance Criteria

- `src/runtime/run-debug.ts` is traced to this PLAN and has no impl-plan orphan.
- Projection-only evidence cannot close runtime behavior acceptance.
- Runtime claims require runtime provenance and evidence.
- Unit-only helpers can skip L7.5 RUN & Debug only when a reason and substitute oracle are
  recorded.
- Runtime verification log events reject secret-like values before storage.
- `ut-tdd run-debug log` appends complete runtime verification events and refuses
  projection-only or incomplete runtime acceptance claims before writing.
- Lint, typecheck, doctor, and the full test suite pass after this PLAN is added.
