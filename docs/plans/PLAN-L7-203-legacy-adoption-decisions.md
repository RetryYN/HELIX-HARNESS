---
plan_id: PLAN-L7-203-legacy-adoption-decisions
title: "PLAN-L7-203 (add-impl): old HELIX semantic adoption decision contracts"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/helix/L6-function-design/legacy-helix-extension.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - legacy HELIX semantic anti-corruption boundary"
  - role: se
    slot_label: "SE - pure decision contracts"
  - role: qa
    slot_label: "QA - U-HLX oracle coverage"
generates:
  - artifact_path: docs/plans/PLAN-L7-203-legacy-adoption-decisions.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/runtime/legacy-adoption.ts
    artifact_type: source_module
  - artifact_path: tests/legacy-adoption.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
  requires:
    - docs/plans/PLAN-REVERSE-203-legacy-adoption-decisions.md
    - docs/design/helix/L3-requirements/legacy-helix-extension.md
    - docs/design/helix/L4-basic-design/legacy-helix-extension.md
    - docs/design/helix/L5-detail/legacy-helix-extension.md
    - docs/design/helix/L6-function-design/legacy-helix-extension.md
    - docs/test-design/helix/legacy-helix-extension.md
  references:
    - docs/design/helix/L6-function-design/legacy-helix-extension.md
    - docs/test-design/helix/legacy-helix-extension.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:00:00+09:00"
    tests_green_at: "2026-06-30T03:00:00+09:00"
    verdict: approve
    scope: "Old HELIX semantic adoption L6 contracts now have pure L7 decision helpers and U-HLX-001..013 unit coverage. The implementation rejects legacy runtime/state assumptions instead of porting Python/Bash code."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/legacy-adoption.test.ts tests/vmodel-pair.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:00:00+09:00"
        evidence_path: tests/legacy-adoption.test.ts
        output_digest: "sha256:c5b300b1fc82a220b8ccc11d3e4d0f14c9b8817654c1ad046c2b1525e976ece5"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:00:00+09:00"
        evidence_path: src/runtime/legacy-adoption.ts
        output_digest: "sha256:dc68d604d6fe36db8727e8f427622ccea283d2bcf88ff96030eaa3026783078e"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:00:00+09:00"
        evidence_path: src/runtime/legacy-adoption.ts
        output_digest: "sha256:dc68d604d6fe36db8727e8f427622ccea283d2bcf88ff96030eaa3026783078e"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:00:00+09:00"
        evidence_path: .ut-tdd/evidence/green-command/20260630-legacy-adoption-doctor.json
        output_digest: "sha256:5d88ccad441f6522019b75d4f72b9387ab9c347d9ad125cf4bf33b5b1800ccf5"
---

# PLAN-L7-203: old HELIX semantic adoption decision contracts

## Objective

Implement the L7 slice for the old HELIX semantic adoption contracts that were
lowered to L6 in `legacy-helix-extension.md`. The goal is not to port old
Python/Bash runtime code. The goal is to make the anti-corruption decisions
executable and testable so HELIX can reject legacy runtime assumptions while
retaining the useful capability meanings.

## Scope

- Implement pure decision helpers for `U-HLX-001..013` in `src/runtime/legacy-adoption.ts`.
- Add focused unit tests in `tests/legacy-adoption.test.ts`.
- Register the implementation oracles in the L7 unit-test design.
- Keep the implementation inside the existing `runtime` building block to avoid
  new module-drift and to preserve the provider-neutral decision boundary.

## Non-Goals

- This PLAN does not port old HELIX Python modules, shell commands, `.helix`
  state, or personal workspace paths.
- This PLAN does not expose a new public CLI command. The helpers are pure L7
  contracts for later CLI/doctor/adapter wiring.
- This PLAN does not claim full old-HELIX product parity. Runtime parity remains
  a separate implementation scope.

## Acceptance Criteria

- `src/runtime/legacy-adoption.ts` implements all functions named by the old
  HELIX L6 extension design.
- `tests/legacy-adoption.test.ts` covers `U-HLX-001..013`.
- Legacy personal/global paths are rejected as current truth.
- Stub/advisory detector results cannot close hard gates.
- Unknown workflows and raw legacy DB/state imports fail closed.
- Continuous run requires a stop condition and verification evidence.
- Learning feedback cannot close acceptance by itself.
- Typecheck, lint, targeted V-model tests, doctor, and full test suite pass.
