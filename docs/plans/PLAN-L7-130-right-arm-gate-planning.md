---
plan_id: PLAN-L7-130-right-arm-gate-planning
title: "PLAN-L7-130: right-arm gate planning"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-30
owner: Codex
parent_design: docs/governance/ut-tdd-agent-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - right-arm gate planning"
generates:
  - artifact_path: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-130-right-arm-gate-planning.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/gates.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/right-arm-gate-planning.ts
    artifact_type: source_module
  - artifact_path: src/lint/right-arm-verification-strategy.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/right-arm-gate-planning.test.ts
    artifact_type: test_code
  - artifact_path: tests/right-arm-verification-strategy.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-95-lint-wiring-meta-gate.md
  requires:
    - docs/plans/PLAN-L7-95-lint-wiring-meta-gate.md
    - docs/process/gates.md
    - docs/improvement-backlog.md
    - docs/plans/PLAN-REVERSE-130-right-arm-gate-planning.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T16:55:32+09:00"
    tests_green_at: "2026-06-30T16:55:32+09:00"
    verdict: approve
    scope: "Right-arm verification source ledger now hard-gates gate-impact semantics: official source rows must map to recognized G8-G14/S3/S4/action-binding routes, and the ledger must cover every G8-G14 gate."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/right-arm-verification-strategy.test.ts tests/right-arm-gate-planning.test.ts tests/lint-wiring.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T16:55:32+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:c1585629984820c41eeb5fb738f6f5df3ba9b5fd6909e23df070ef55114533b7"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T16:55:32+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:185022df7fa3617a16e929d622323706907dc2af02a63950c0981b53b9e1a10a"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T14:21:41+09:00"
    tests_green_at: "2026-06-30T14:21:41+09:00"
    verdict: approve
    scope: "Official source ledger hardening for the right-arm verification strategy."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/right-arm-verification-strategy.test.ts tests/right-arm-gate-planning.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T14:19:36+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:c1585629984820c41eeb5fb738f6f5df3ba9b5fd6909e23df070ef55114533b7"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:21:31+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:c1585629984820c41eeb5fb738f6f5df3ba9b5fd6909e23df070ef55114533b7"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:21:41+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:185022df7fa3617a16e929d622323706907dc2af02a63950c0981b53b9e1a10a"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T16:30:00+09:00"
    tests_green_at: "2026-06-23T16:30:00+09:00"
    verdict: approve
    scope: "G8-G14 carry is routed to concrete PLAN evidence and doctor fail-close coverage."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\right-arm-gate-planning.test.ts tests\\lint-wiring.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T16:30:00+09:00"
        evidence_path: tests/right-arm-gate-planning.test.ts
        output_digest: "sha256:f321df37a40bc2ea221a2a2ab9d07c36ff6c8be0e02524791c40d198e8e9fb3b"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:30:00+09:00"
        evidence_path: src/lint/right-arm-gate-planning.ts
        output_digest: "sha256:5c5df976593649215c875d844ac067a99e6a5f3bbe107843f565be01f97caacd"
---

# PLAN-L7-130: right-arm gate planning

## Objective

Stop the G8-G14 right-arm gate mechanization carry from staying unplanned or
untraceable.

## Scope

- Add a doctor hard gate that checks the IMP-052 carry has concrete PLAN
  evidence.
- Treat `docs/plans/PLAN-L7-130-right-arm-gate-planning.md` and
  `docs/plans/PLAN-REVERSE-130-right-arm-gate-planning.md` as the first
  machine-readable route for the carry.
- Keep full G9-G14 executable gate implementation as child-plan work; this PLAN
  owns the route and the evidence-profile regression fence so G8-G14 cannot fall
  back to concept-only prose.
- Ground the right-arm verification strategy in an official source ledger with
  URL, adopted version/date, latest official status, adoption decision,
  verification use, and gate impact, so external standards are consumed
  semantically instead of as name-only markers or stale version claims.
- Require source-ledger `gate impact` values to map to recognized
  G8-G14/S3/S4/action-binding routes, and require the ledger as a whole to cover
  every G8-G14 gate. This prevents a live official-source table from drifting
  away from the right-arm verification band it is supposed to justify.
- Add targeted tests for unplanned, stale concept-only, missing profile-row, and
  routed cases.

## Acceptance Criteria

- Doctor fails when G8-G14 carry has no concrete PLAN reference.
- Doctor passes when the carry is backed by concrete PLAN artifacts.
- Doctor fails when `gates.md` reintroduces stale concept-only wording or when
  `L08-L14-verification-phase.md` loses any G8-G14 evidence-profile row,
  official external source ledger entry, external test-basis marker, or L14->L0
  feedback evidence.
- Doctor fails when the right-arm strategy loses official URLs, adopted version/date,
  latest official status, adoption decision, verification use, gate impact, or
  the OWASP LLM06 human-approval boundary for agentic workflow completion
  claims.
- Doctor fails when source-ledger `gate impact` values are not recognized
  G8-G14/S3/S4/action-binding routes, or when the source ledger no longer covers
  the full G8-G14 verification band.
- `lint-wiring` reaches both right-arm lint modules through the runtime
  entrypoint.
- The reverse record explains why this is a planning fail-close slice, not the
  full G8-G14 gate implementation.
