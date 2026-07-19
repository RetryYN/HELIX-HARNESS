---
plan_id: PLAN-L7-148-refactor-candidate-module-extraction
title: "PLAN-L7-148: refactor candidate detector module extraction"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "Behavior-invariant module extraction inside existing state-db projection boundary. No public CLI/API contract, persistence schema, requirements, or L4/L6 design semantics changed; Refactor mode guidance was updated in-place as the canonical process artifact."
agent_slots:
  - role: se
    slot_label: "SE - detector module extraction"
  - role: tl
    slot_label: "TL - refactor model precision review"
generates:
  - artifact_path: docs/plans/PLAN-L7-148-refactor-candidate-module-extraction.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/refactor.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/refactor-candidates.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-147-refactor-candidate-detector.md
  requires:
    - docs/plans/PLAN-L7-147-refactor-candidate-detector.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T14:52:00+09:00"
    tests_green_at: "2026-06-25T14:52:00+09:00"
    verdict: approve
    scope: "Behavior-invariant extraction of detector logic plus Refactor mode precision guidance."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\projection-writer.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T14:49:29+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T14:49:41+09:00"
        evidence_path: src/state-db/refactor-candidates.ts
        output_digest: "sha256:0e270c1572d46850fe94dd43359a38c04b75ecc7b23a62cf8bf983f74c8f601a"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T14:49:41+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:d05022d03ef67dea4d3d832a85005a29a3398d6ebad8236c2b2ec41b4fedc45c"
      - kind: smoke
        command: "npm run src\\cli.ts db rebuild"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T14:50:05+09:00"
        evidence_path: docs/process/modes/refactor.md
        output_digest: "sha256:915ec6686156b8ed12e57a18b666105a488bc3ae85c31e1d89db2c1336ac94b4"
---

# PLAN-L7-148: refactor candidate detector のモジュール抽出

## 目的

detector 自身が出した最上位の `split-module` candidate から、振る舞いを変えない
Refactor を実行し、その結果を Refactor driving model へ戻す。

## スコープ

- refactor candidate detection を `projection-writer.ts` から専用の
  `src/state-db/refactor-candidates.ts` module へ抽出する。
- `projection-writer.ts` の責務は candidate rows を `quality_signals` と
  `feedback_events` へ投影することだけに保つ。
- detector output semantics、schema、CLI behavior、public contracts を維持する。
- repository に対して detector を実行して得た precision/triage rule を
  Refactor mode guidance へ反映する。

## 受入条件

- `analyzeRefactorCandidates` は既存の projection writer tests で引き続き
  cover される。
- `harness.db` の rebuild 後も refactor candidate quality signals と promoted
  feedback events が emit される。
- `npx --no-install vitest run tests\projection-writer.test.ts` が pass する。
- `npm run typecheck` が pass する。
- `npm run lint` が pass する。
- `npx --no-install tsx src\cli.ts doctor` が pass する、または既存の non-blocking warnings
  だけを report する。

## Refactor 不変条件

- persisted schema changes はない。
- 新しい user-visible CLI behavior はない。
- module extraction と process guidance を超える functional scope はない。
- Detector candidate ranking と promotion rules は変更しない。

## レビュー証跡

- `reviewer`: `codex-intra-runtime`
- `review_kind`: `intra_runtime_subagent`
- `reviewed_at`: `2026-06-25T14:52:00+09:00`
- `tests_green_at`: `2026-06-25T14:52:00+09:00`
- `verdict`: `approve`
- `scope`: detector logic の振る舞い不変な抽出と、Refactor mode の
  precision guidance。

green commands:

- `npx --no-install vitest run tests\projection-writer.test.ts` exit 0
  (`tests/projection-writer.test.ts`,
  `sha256:c2103c58ac697008d1b532d5cb5e91f0d7950b7b480048e6b4ec4335f2e715ca`)
- `npm run typecheck` exit 0 (`src/state-db/refactor-candidates.ts`,
  `sha256:b69ae5d05ee9ff7029c7f290a1e2fa7b6d636d8fd141a66a7622a220946036d9`)
- `npm run lint` exit 0 (`src/state-db/projection-writer.ts`,
  `sha256:152268bfc67b38d7c5f3fe9c4eba7ee052fafdc934370f19ece1b6cfe4430a4e`)
- `npx --no-install tsx src\cli.ts db rebuild` exit 0 (`docs/process/modes/refactor.md`,
  `sha256:fc06ec424d72496170fa17325a0041ba00112ce0fa01b519e65b3ae6c18342bf`)
