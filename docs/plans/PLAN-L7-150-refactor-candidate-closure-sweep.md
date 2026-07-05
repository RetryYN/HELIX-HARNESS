---
plan_id: PLAN-L7-150-refactor-candidate-closure-sweep
title: "PLAN-L7-150: refactor candidate closure sweep の完了整理"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "振る舞い不変の module extraction と detector precision tuning のため。public CLI/API contract、persisted schema、requirement、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - detector candidate closure の完了整理"
  - role: tl
    slot_label: "TL - precision と gate verification"
generates:
  - artifact_path: docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/refactor-candidates.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/state-db/feedback-projections.ts
    artifact_type: source_module
  - artifact_path: src/task/classify.ts
    artifact_type: source_module
  - artifact_path: src/task/proposal-coverage-data.ts
    artifact_type: source_module
  - artifact_path: src/lint/relation-graph.ts
    artifact_type: source_module
  - artifact_path: src/lint/relation-graph-evidence.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-catalog.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile-catalog.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile-safety.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: src/workflow/routing-contracts.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-148-refactor-candidate-module-extraction.md
  requires:
    - docs/plans/PLAN-L7-148-refactor-candidate-module-extraction.md
    - docs/plans/PLAN-L7-149-relation-graph-process-doc-node.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T15:56:00+09:00"
    tests_green_at: "2026-06-25T15:56:00+09:00"
    verdict: approve
    scope: "振る舞い不変の module extraction と large-but-shallow modules 向け confidence calibration により、detector high-confidence 候補を完了させる。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\projection-writer.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T15:55:00+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T15:53:00+09:00"
        evidence_path: src/state-db/refactor-candidates.ts
        output_digest: "sha256:0e270c1572d46850fe94dd43359a38c04b75ecc7b23a62cf8bf983f74c8f601a"
---

# PLAN-L7-150: refactor candidate closure sweep の完了整理

## 目的

PLAN-L7-148 後に detector が出す high-confidence refactor candidate を、振る舞い不変の extraction、
または prior signal が広すぎた箇所の detector precision calibration によって完了させる。

## 範囲

- static catalogs と evidence/routing/projection concerns を focused modules へ抽出する。
- 既存 public import paths は re-exports によって安定させる。
- `split-module` confidence を調整し、短く cohesive な functions で構成される large modules は medium として triage する。
  一方で extreme modules や large functions を含む modules は引き続き high-confidence feedback にする。
- DB schema、CLI behavior、projection semantics を維持する。

## 受入条件

- static detector output の high-confidence refactor candidates が 0 件になる。
- `harness.db` rebuild が open high-confidence refactor feedback を出さない。
- 移動した modules の targeted tests が pass する。
- `bun run typecheck`、`bun run lint`、`bun run src\cli.ts doctor` が pass する。
