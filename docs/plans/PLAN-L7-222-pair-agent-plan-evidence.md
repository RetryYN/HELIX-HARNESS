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
        output_digest: "sha256:7961c43a561d23e29399061699265a57ea8bc6e747cbeb69a32c646445611660"
      - kind: smoke
        command: "sha256sum src/state-db/projection-writer.ts docs/design/helix/L6-function-design/pillar-function-design.md docs/test-design/helix/L6-pillar-unit-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:08:25+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:d05022d03ef67dea4d3d832a85005a29a3398d6ebad8236c2b2ec41b4fedc45c"
---

# PLAN-L7-222: pair-agent plan evidence 永続化

## Objective

`pair-agent plan` が route と adapter dry-run を stdout にだけ表示できていた workflow の穴を閉じる。
provider 実行が始まる前に、planning phase を再生可能にする。

## Scope

- Add `pair-agent plan --save-evidence`.
- adapter plan digest、phase prompt digest、required evidence、frontier guardrail decision を含む
  `pair-agent-plan-evidence.v1` を永続化する。
- plan evidence を `model_runs`、`gate_runs`、`guardrail_decisions` へ投影する。
- run evidence と loop-summary projection は変更しない。
- L3/L6 design と paired test design へ backfill する。

## 対象外

- 外部 provider CLI は実行しない。
- T0 frontier 実行を承認しない。
- `旧 state path -> .helix` cutover は有効化しない。
- local pair-agent evidence を CI / merge gate の代替として扱わない。

## DoD

- [x] `pair-agent plan --save-evidence --json` returns an evidence path.
- [x] plan evidence が adapter digest と prompt digest を記録する。
- [x] DB rebuild が plan evidence を model / gate / guardrail rows へ投影する。
- [x] L3/L6 design と paired test design が plan evidence と run evidence を説明する。
