---
plan_id: PLAN-L7-130-right-arm-gate-planning
title: "PLAN-L7-130: right-arm gate planning"
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
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T14:27:02+09:00"
    tests_green_at: "2026-07-01T14:27:02+09:00"
    verdict: approve
    scope: "Right-arm verification strategy now carries NASA Systems Engineering Handbook Appendix as a source-ledger row for V&V plan / requirements verification matrix / validation requirements matrix structure, with the official source ledger date refreshed to 2026-07-01 and gate impact bound to G8-G14."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/s4-decision-readiness.test.ts tests/version-up-readiness.test.ts tests/cutover-readiness.test.ts tests/projection-writer.test.ts tests/right-arm-verification-strategy.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:27:02+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:f1bd669549e2fd65c77f9167eec2e5ee7f79815a0b56898e749dc949af6b6b01"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:27:02+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:dfbe5f8656e4e7d98db3851a0d360756e9bb302b0e08d092d84f10ee4da04ac4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:27:02+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:dfbe5f8656e4e7d98db3851a0d360756e9bb302b0e08d092d84f10ee4da04ac4"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:27:02+09:00"
        evidence_path: docs/process/gates.md
        output_digest: "sha256:3b19226ee2809a7537604f8924f09336724689b9348696b95dbcdc3150465d85"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:27:02+09:00"
        evidence_path: docs/process/forward/L08-L14-verification-phase.md
        output_digest: "sha256:fed00c1c3c8f85ce76ff3e93614edbbc1111828bfd4ed9cc71ce265da61d5d19"
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
        output_digest: "sha256:22672f836c4d969a36752dafb9acaa5e84c1c4f3e953d6947846f3dee0277028"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T16:55:32+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:550762c692e696d3c0399e0da919826e64e0af17cafd63de822fb79971e8f5ec"
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
        output_digest: "sha256:22672f836c4d969a36752dafb9acaa5e84c1c4f3e953d6947846f3dee0277028"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:21:31+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:22672f836c4d969a36752dafb9acaa5e84c1c4f3e953d6947846f3dee0277028"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:21:41+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:550762c692e696d3c0399e0da919826e64e0af17cafd63de822fb79971e8f5ec"
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
- Require the source-ledger `checked` date to be non-future and no more than 90
  days old. A stale official-source ledger is not valid G8-G14 evidence even
  when rows, URLs, and adoption decisions are present.
- Parse source-ledger headings by `checked YYYY-MM-DD` shape instead of a
  single hard-coded date, so refreshing the official-source audit date does not
  make the ledger rows disappear.
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
- Doctor fails when the right-arm verification source ledger has a future
  `checked` date or is older than 90 days.
- Doctor continues to pass when the right-arm verification source ledger is
  refreshed to a newer valid `checked` date and its rows remain intact.
- `lint-wiring` reaches both right-arm lint modules through the runtime
  entrypoint.
- The reverse record explains why this is a planning fail-close slice, not the
  full G8-G14 gate implementation.
