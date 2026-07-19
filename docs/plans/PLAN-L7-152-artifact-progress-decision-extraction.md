---
plan_id: PLAN-L7-152-artifact-progress-decision-extraction
title: "PLAN-L7-152: artifact progress decision extraction（進捗判定抽出）"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "Behavior-invariant extraction inside the existing harness.db projection boundary. No persisted schema, CLI behavior, requirement semantics, or workflow state semantics changed."
agent_slots:
  - role: se
    slot_label: "SE - artifact progress decision extraction（進捗判定抽出）"
  - role: tl
    slot_label: "TL - behavior invariant review（挙動不変レビュー）"
generates:
  - artifact_path: docs/plans/PLAN-L7-152-artifact-progress-decision-extraction.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/artifact-progress-decision.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
  requires:
    - docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T17:15:00+09:00"
    tests_green_at: "2026-06-25T17:15:00+09:00"
    verdict: approve
    scope: "projection-writer から artifact progress decision policy を挙動不変で抽出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\projection-writer.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T17:14:00+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:14:20+09:00"
        evidence_path: src/state-db/artifact-progress-decision.ts
        output_digest: "sha256:94649018e5c8e51acb161ddc371df0237e0014499d2ae378cf061d3ac3eb06eb"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:14:05+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:d05022d03ef67dea4d3d832a85005a29a3398d6ebad8236c2b2ec41b4fedc45c"
---

# PLAN-L7-152: artifact progress decision extraction（進捗判定抽出）

## 目的

pure な artifact progress decision policy を専用 module へ移し、
`projection-writer.ts` の `split-module` candidate を減らす。

## スコープ

- `deriveArtifactProgressDecision` と exported types を
  `src/state-db/artifact-progress-decision.ts` へ抽出する。
- re-export により `src/state-db/projection-writer.ts` の public exports を安定させる。
- 既存の projection writer tests は、新 module から pure decision helper を直接 import するよう更新する。

## 受入条件

- Artifact progress decision behavior は変えない。
- 既存の `projection-writer` rebuild tests は引き続き pass する。
- `bun run typecheck`、`bun run lint`、DB rebuild、doctor が pass する。
