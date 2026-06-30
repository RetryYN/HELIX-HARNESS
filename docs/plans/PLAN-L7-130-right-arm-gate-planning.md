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
    reviewed_at: "2026-06-30T11:29:00+09:00"
    tests_green_at: "2026-06-30T11:28:37+09:00"
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
        completed_at: "2026-06-30T11:26:21+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:f1628c61d5fbb75a19565793bcc79adb0ad30da50f6d0a6f887d844634a164d9"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T11:28:20+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:f1628c61d5fbb75a19565793bcc79adb0ad30da50f6d0a6f887d844634a164d9"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T11:28:30+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:3467298e525aa9e98f8c77d6e828fbf8dcdb7a0bbaf1bacb7972895841184530"
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
  URL, version/date, verification use, and gate impact, so external standards are
  consumed semantically instead of as name-only markers.
- Add targeted tests for unplanned, stale concept-only, missing profile-row, and
  routed cases.

## Acceptance Criteria

- Doctor fails when G8-G14 carry has no concrete PLAN reference.
- Doctor passes when the carry is backed by concrete PLAN artifacts.
- Doctor fails when `gates.md` reintroduces stale concept-only wording or when
  `L08-L14-verification-phase.md` loses any G8-G14 evidence-profile row,
  official external source ledger entry, external test-basis marker, or L14->L0
  feedback evidence.
- Doctor fails when the right-arm strategy loses official URLs, version/date,
  verification use, gate impact, or the OWASP LLM06 human-approval boundary for
  agentic workflow completion claims.
- `lint-wiring` reaches both right-arm lint modules through the runtime
  entrypoint.
- The reverse record explains why this is a planning fail-close slice, not the
  full G8-G14 gate implementation.
