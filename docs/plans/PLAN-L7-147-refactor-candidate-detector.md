---
plan_id: PLAN-L7-147-refactor-candidate-detector
title: "PLAN-L7-147: refactor candidate detector projection"
kind: impl
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
agent_slots:
  - role: se
    slot_label: "SE - DB projection refactor candidate detector"
  - role: tl
    slot_label: "TL - behavior-invariant detector review"
generates:
  - artifact_path: docs/plans/PLAN-L7-147-refactor-candidate-detector.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/refactor-candidates.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-133-refactor-brush-up-workflow.md
  requires:
    - docs/plans/PLAN-L7-133-refactor-brush-up-workflow.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T14:05:55+09:00"
    tests_green_at: "2026-06-25T14:05:55+09:00"
    verdict: approve
    scope: "Refactor candidate detector projects typed structural candidates into quality_signals and feedback_events without schema changes."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\projection-writer.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T14:05:55+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T14:05:55+09:00"
        evidence_path: src/state-db/refactor-candidates.ts
        output_digest: "sha256:0e270c1572d46850fe94dd43359a38c04b75ecc7b23a62cf8bf983f74c8f601a"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T14:05:55+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:d05022d03ef67dea4d3d832a85005a29a3398d6ebad8236c2b2ec41b4fedc45c"
---

# PLAN-L7-147: refactor candidate detector projection の射影

## 目的

Refactor mode の DB 起点 candidate surface を実体化し、構造的な brush-up 作業を手作業の記憶や
prose handover だけでなく `harness.db` から発見できるようにする。

## スコープ

- behaviour-invariant な refactor candidate kind を検出する決定的 source scanner を追加する。
- candidate を既存の `quality_signals` 行へ射影し、
  `metric=refactor_candidate:<kind>`.
- 既存の `feedback_events` projection を再利用し、candidate が takeover / feedback surface に現れるようにする。
- schema は変更せず、既存 table への additive projection として扱う。

## 候補種別

- `split-module`: module が十分に大きい、または export が多く、分割候補として扱う。
- `extract-helper`: function body が十分に大きく、helper extraction の候補として扱う。
- `deduplicate-function`: 2 つ以上の function が同じ normalized body を持つ。
- `externalize-literal`: 同じ nontrivial literal が十分に繰り返され、named constant または config boundary の候補として扱う。

## 受入条件

- pure detector test が 4 種類すべての candidate kind を covered にする。
- rebuild projection が candidate row を `quality_signals` へ書き込む。
- 既存 feedback projection が candidate を `feedback_events` row として公開する。
- `npx --no-install vitest run tests\projection-writer.test.ts` passes.
- `npm run typecheck` passes.
