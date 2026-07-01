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
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
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
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T15:01:52+09:00"
    tests_green_at: "2026-07-01T15:01:52+09:00"
    verdict: approve
    scope: "Follow-up audit: saved pair-agent run evidence no longer relies only on phase order. DB rebuild projects runtime `result.findings` such as light-agent closing authority violations into findings, blocks the pair-agent-run-evidence gate for error findings, and doctor fails db-projection-ingestion when blocked/open pair-agent evidence exists. This makes saved evidence replay stricter instead of trusting local runtime verdicts."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts -t \"pair-agent\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:58:56+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:60849e320ddf38b2474f163ee150f0891a0c8e0be91e46c5a4e13c6d37b8f884"
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:58:56+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:06d5d5fdc6c8a7bb80bffe0d06bda53b068fdef616a117b9ddec39c8d885f008"
      - kind: unit_test
        command: "bun test tests/doctor.test.ts -t \"pair-agent evidence gates\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:58:56+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:395e5fdd831e541d9740058e0329864989217f51aed91e5e916c5e1bd6f9eb73"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:58:56+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:d874cf70f4311748cea0093c1b8e697c58a7559afc633bda7ec9b6b9b0a0398b"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:58:56+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:432eea7839170c55d33de7dd77273c8738df1e593aa9f0f38d5f0002c92ff457"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T15:01:52+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:432eea7839170c55d33de7dd77273c8738df1e593aa9f0f38d5f0002c92ff457"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T15:01:52+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:395e5fdd831e541d9740058e0329864989217f51aed91e5e916c5e1bd6f9eb73"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T13:34:22+09:00"
    tests_green_at: "2026-07-01T13:34:22+09:00"
    verdict: approve
    scope: "Semantic design audit follow-up: L3 requirements, L3 acceptance, L6 function design, L6 unit test design, DB projection, and projection tests now agree that saved pair-agent run evidence must prove smart_test_author -> light_implementation -> smart_review order. Invalid phase_spans block the pair-agent-run-evidence gate and emit a finding; quality_signals project phase, smart/light/review, consultation, pending consultation, failed review, and fix cycle counts."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts --test-name-pattern \"pair-agent\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T13:34:22+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:1c5f57229de3e966a14d197cede7c3bb219f47348970be051c0f5903a0471913"
      - kind: unit_test
        command: "bun test tests/review-evidence.test.ts tests/green-command-digest.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T13:31:09+09:00"
        evidence_path: tests/review-evidence.test.ts
        output_digest: "sha256:dfbf0e3feee78280b464dbae6e28bc3b5c0a652e416c6587f14c2d90c95f6af2"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:31:09+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:b2085ff2a1ca704a5750aaa4e2a3230792bd39dddb703fcb8484341b04a19e00"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:31:09+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:b2085ff2a1ca704a5750aaa4e2a3230792bd39dddb703fcb8484341b04a19e00"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:31:09+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:b2085ff2a1ca704a5750aaa4e2a3230792bd39dddb703fcb8484341b04a19e00"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:31:09+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:1c5f57229de3e966a14d197cede7c3bb219f47348970be051c0f5903a0471913"
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
run contained consultation, smart-review failure, and light fix cycles. DB
rebuild must also reject saved replay evidence whose `phase_spans` do not prove
the smart-test-author -> light-implementation -> smart-review order.

## Scope

- Add `trace.loop_summary` to pair-agent run evidence.
- Add a stable bounded transcript digest and per-phase output excerpt digest.
- Project loop summary counts into `quality_signals` during DB rebuild.
- Validate saved run `phase_spans` order during DB rebuild and block the
  `pair-agent-run-evidence` gate when replay evidence starts with
  implementation or otherwise violates the TDD pair order.
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
- [x] DB rebuild blocks saved pair-agent evidence whose phase order violates
      smart-test-author -> light-implementation -> smart-review.
- [x] L3/L6 design and paired test design describe the replay contract.
- [x] Targeted Red/Green tests cover evidence save and projection.
