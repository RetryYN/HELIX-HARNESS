---
plan_id: PLAN-L7-222-pair-agent-plan-evidence
title: "PLAN-L7-222 (add-impl): pair-agent plan evidence persistence"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - pair-agent plan evidence"
  - role: qa
    slot_label: "QA - pair-agent plan evidence projection"
generates:
  - artifact_path: docs/plans/PLAN-L7-222-pair-agent-plan-evidence.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-222-pair-agent-plan-evidence.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/pair-agent.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
  requires:
    - docs/plans/PLAN-REVERSE-222-pair-agent-plan-evidence.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T10:08:25+09:00"
    tests_green_at: "2026-07-01T10:08:25+09:00"
    verdict: approve
    scope: "Pair-agent plan evidence is no longer stdout-only. `pair-agent plan --save-evidence` writes adapter plan, prompt digest, phase evidence, and frontier guardrail evidence; DB rebuild projects the plan evidence into model_runs, gate_runs, and guardrail_decisions."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts --test-name-pattern \"persists pair-agent plan evidence|adapter plans in text\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:08:25+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:aa9a77ad5b62f764027ea7a7acd77678278e45acebceea915d113371e3da1edf"
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts --test-name-pattern \"projects pair-agent plan evidence\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:08:25+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T10:08:25+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:cacff0381a7376521e7f29cdc6c2377252455dfe2c9b61c62378f57b2c027c5a"
      - kind: smoke
        command: "sha256sum src/state-db/projection-writer.ts docs/design/helix/L6-function-design/pillar-function-design.md docs/test-design/helix/L6-pillar-unit-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:08:25+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:d05022d03ef67dea4d3d832a85005a29a3398d6ebad8236c2b2ec41b4fedc45c"
---

# PLAN-L7-222: pair-agent plan evidence persistence

## Objective

Close the pair-agent workflow hole where `pair-agent plan` could display the
route and adapter dry-run only on stdout. The planning phase must be replayable
before any provider execution begins.

## Scope

- Add `pair-agent plan --save-evidence`.
- Persist `pair-agent-plan-evidence.v1` with adapter plan digest, phase prompt
  digests, required evidence, and frontier guardrail decision.
- Project plan evidence into `model_runs`, `gate_runs`, and
  `guardrail_decisions`.
- Keep run evidence and loop-summary projection unchanged.
- Backfill L3/L6 design and paired test design.

## Non-Scope

- Does not execute external provider CLIs.
- Does not authorize T0 frontier execution.
- Does not activate `.ut-tdd -> .helix` cutover.
- Does not treat local pair-agent evidence as a CI/merge gate substitute.

## DoD

- [x] `pair-agent plan --save-evidence --json` returns an evidence path.
- [x] Plan evidence records adapter and prompt digests.
- [x] DB rebuild projects plan evidence into model/gate/guardrail rows.
- [x] L3/L6 design and paired test design describe plan and run evidence.
