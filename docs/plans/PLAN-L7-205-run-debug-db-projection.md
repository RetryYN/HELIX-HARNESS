---
plan_id: PLAN-L7-205-run-debug-db-projection
title: "PLAN-L7-205 (add-impl): L7.5 RUN & Debug runtime verification DB projection"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/harness/L5-detailed-design/physical-data.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - runtime evidence projection boundary"
  - role: se
    slot_label: "SE - harness.db projection schema"
  - role: qa
    slot_label: "QA - deterministic rebuild evidence"
generates:
  - artifact_path: docs/plans/PLAN-L7-205-run-debug-db-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-205-run-debug-db-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/schema/harness-db.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-tables-core.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-indexes.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-202-run-debug-runtime-verification.md
  requires:
    - docs/plans/PLAN-REVERSE-205-run-debug-db-projection.md
    - docs/plans/PLAN-L7-202-run-debug-runtime-verification.md
    - docs/plans/PLAN-L7-204-upstream-adoption-decisions.md
  references:
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T02:53:00+09:00"
    tests_green_at: "2026-06-30T02:53:00+09:00"
    verdict: approve
    scope: "L7.5 RUN & Debug JSONL evidence now deterministically projects into harness.db runtime_verification_events. The projection keeps verification_class and accept_status explicit so dashboards do not infer runtime acceptance from projection-only telemetry."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/projection-writer.test.ts tests/db-projection-coverage.test.ts tests/impl-plan-trace.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T02:53:00+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:53:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:d05022d03ef67dea4d3d832a85005a29a3398d6ebad8236c2b2ec41b4fedc45c"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:53:00+09:00"
        evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
        output_digest: "sha256:0a1c082db408d7627b0ddce759b6f62c4919dac544bab952124d206d3bc11adf"
---

# PLAN-L7-205: L7.5 RUN & Debug runtime verification DB projection

## Objective

Close the remaining RUN & Debug visibility gap: append-only runtime verification
JSONL is useful evidence, but deterministic visualization and completion audits
need it in `harness.db`.

## Scope

- Add `runtime_verification_events` to the harness.db schema registry.
- Project `.ut-tdd/evidence/run-debug/runtime-verification.jsonl` during
  deterministic `rebuildHarnessDb`.
- Store `verification_class` and `accept_status` explicitly.
- Keep malformed or incomplete rows as `findings`, not accepted runtime evidence.
- Add a projection-writer regression test and register `U-RUNDEBUG-007`.

## Non-Goals

- This PLAN does not launch external Claude/Codex providers.
- This PLAN does not treat projection rows as runtime proof; it stores the runtime
  classification produced from the append-only log.
- This PLAN does not implement the VSCode Webview itself. It provides the DB read
  model required by that later view.

## Acceptance Criteria

- `rebuildHarnessDb` populates `runtime_verification_events` from valid L7.5
  JSONL rows.
- Malformed JSONL rows create `findings`.
- Runtime dashboards can distinguish `runtime_verified` / `accepted` from blocked
  or malformed rows without reading raw JSONL.
- Typecheck, lint, targeted projection tests, doctor, and full tests pass.
