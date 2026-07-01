---
plan_id: PLAN-L7-221-pair-agent-replay-evidence
title: "PLAN-L7-221 (add-impl): pair-agent replay evidence hardening"
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
    slot_label: "TL - pair-agent replay evidence"
  - role: qa
    slot_label: "QA - pair-agent evidence projection regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-221-pair-agent-replay-evidence.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-221-pair-agent-replay-evidence.md
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
    - docs/plans/PLAN-REVERSE-221-pair-agent-replay-evidence.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:52:22+09:00"
    tests_green_at: "2026-07-01T09:52:22+09:00"
    verdict: approve
    scope: "Pair-agent --save-evidence now records semantic loop replay fields: loop_summary, transcript_digest, and per-phase output_excerpt_digest. DB rebuild projects consultation, failed-review, fix-cycle, and phase counts into quality_signals so the smart/light loop is auditable beyond stdout order."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts --test-name-pattern \"persists pair-agent run evidence\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:52:22+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:aa9a77ad5b62f764027ea7a7acd77678278e45acebceea915d113371e3da1edf"
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts --test-name-pattern \"projects pair-agent run evidence\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:52:22+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T09:52:22+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:7961c43a561d23e29399061699265a57ea8bc6e747cbeb69a32c646445611660"
      - kind: smoke
        command: "sha256sum src/state-db/projection-writer.ts docs/design/helix/L6-function-design/pillar-function-design.md docs/test-design/helix/L6-pillar-unit-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:52:22+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:d05022d03ef67dea4d3d832a85005a29a3398d6ebad8236c2b2ec41b4fedc45c"
---

# PLAN-L7-221: pair-agent replay evidence hardening

## Objective

Close the remaining semantic evidence gap in the pair-agent TDD route. A saved
pair-agent run must prove not only that phases executed, but also whether the
run contained consultation, smart-review failure, and light fix cycles.

## Scope

- Add `trace.loop_summary` to pair-agent run evidence.
- Add a stable bounded transcript digest and per-phase output excerpt digest.
- Project loop summary counts into `quality_signals` during DB rebuild.
- Extend unit tests so replay evidence covers consultation -> failed review ->
  light fix -> pass review.
- Backfill L3 requirements/acceptance wording plus L6 function and unit test
  design.

## Non-Scope

- Does not execute external provider CLIs.
- Does not change frontier approval requirements.
- Does not treat pair-agent local pass as a CI/merge gate substitute.
- Does not apply `.ut-tdd -> .helix` cutover.

## DoD

- [x] Saved pair-agent evidence contains `loop_summary`.
- [x] Saved phase spans contain `output_excerpt_digest`.
- [x] DB rebuild projects pair-agent loop counts into `quality_signals`.
- [x] L3/L6 design and paired test design describe the replay contract.
- [x] Targeted Red/Green tests cover evidence save and projection.
