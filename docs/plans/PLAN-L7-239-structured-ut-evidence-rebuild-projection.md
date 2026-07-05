---
plan_id: PLAN-L7-239-structured-ut-evidence-rebuild-projection
title: "PLAN-L7-239 (impl): structured unit-test evidence rebuild 投影"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-147 の既存 L5/L6 contract 内で、structured green-command evidence を rebuild 経路から unit-test history signal へ接続する slice。新規 product requirement や DB schema は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "Explorer - rebuild unit-test history projection"
  - role: tl
    slot_label: "TL - structured unit-test evidence rebuild projection"
generates:
  - artifact_path: docs/plans/PLAN-L7-239-structured-ut-evidence-rebuild-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-238-ut-history-db-signal-projection.md
  requires:
    - docs/plans/PLAN-L7-238-ut-history-db-signal-projection.md
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
    - src/state-db/projection-writer.ts
    - tests/projection-writer.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T10:09:30+09:00"
    tests_green_at: "2026-07-03T10:09:30+09:00"
    verdict: approve
    scope: "structured green-command evidence の `cases[]` を rebuild 経路で `test_results` に投影し、DB から unit-test history input を復元して `test_flake_events` / `quality_signals` / `feedback_events` へ接続した。生 reporter parser と duration trend 永続化は残差として維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts tests/workflow-contracts.test.ts tests/review-green-command-projection.test.ts tests/db-projection-ingestion.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T10:09:30+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:85f5f8aaa1c62a7ae4708f4b610661639ccf0bbfa51b36f5892c36e52bd73486"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T10:09:30+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:2b75560f97b74b5b8b4af3952a18a6b2bfbd7540d5d8b9ffee014cb5d90ee870"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T10:09:30+09:00"
        evidence_path: docs/plans/PLAN-L7-239-structured-ut-evidence-rebuild-projection.md
        output_digest: "sha256:615ca075cc9b149e37864a491fcee2131ca1d8fcb19977db367c614d656fc646"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T10:09:30+09:00"
        evidence_path: docs/plans/PLAN-L7-239-structured-ut-evidence-rebuild-projection.md
        output_digest: "sha256:87859462b8a4a8831edcfc14aa9fcdbfe2047d3ecf59796f1c30c1f1f451a7dd"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T10:09:30+09:00"
        evidence_path: .helix/harness.db
        output_digest: "sha256:e608ebd21e602c0d2ac37bf9585117e8f6e06a86f57fa2adcbdff6e7052579d2"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T10:09:30+09:00"
        evidence_path: docs/plans/PLAN-L7-239-structured-ut-evidence-rebuild-projection.md
        output_digest: "sha256:0864381c1220b92a655426edc39439d106eddc91c6adfe9f3b461e294ae8f620"
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-239: structured unit-test evidence rebuild 投影

## 0. 目的

PLAN-L7-238 で `projectUtHistorySignals` は DB へ書けるようになったが、deterministic
`rebuildHarnessDb` の通常経路から structured unit-test case evidence を読み、`test_results`、
`test_flake_events`、`quality_signals`、`feedback_events` へ到達する接続が残っていた。

この slice では `review_evidence.green_commands[].evidence_path` が JSON を指し、その JSON が
`cases[]` を持つ場合に限り、rebuild 中に `test_cases` / `test_results` / `test_artifact_edges` へ
投影する。その後、DB から `TestRunEvidenceInput` を復元して `projectUtHistorySignals` を呼び、
feedback 投影前に `quality_signals(source=ut-history)` を作る。

## 1. スコープ

対象:

- structured green-command evidence JSON の `cases[]` を rebuild 経路で読み、既存 `test_runs` に紐づけて
  `test_cases` / `test_results` / `test_artifact_edges` へ投影する。
- rebuild 後半で DB の `test_runs` / `test_results` / `test_cases` から unit-test history input を復元し、
  `projectUtHistorySignals` を呼ぶ。
- `projectFeedbackEvents` より前に unit-test history `quality_signals` を作り、feedback surface へ届くことを
  テストで固定する。

対象外:

- Vitest / Playwright / JUnit reporter の生出力 parser。
- `RebuildHarnessDbInput` の public API 拡張。
- DB schema / migration 追加。
- duration trend 専用 table または dashboard 表示。PLAN-L7-241 は既存 `quality_signals` に
  `duration_trend_ms` を保存する schema-less persistence として扱う。
- L14 completion / version-up activation / `.helix` irreversible cutover の承認。

## 2. 受入条件

- `rebuildHarnessDb` が structured green-command evidence の `cases[]` から `test_results` を作る。
- rebuild 後に DB から復元した unit-test history が `test_flake_events` と `quality_signals(source=ut-history)` を作る。
- duration regression / flake の `quality_signals` が `feedback_events` に接続される。
- 既存の `projectReviewEvidenceRegistry` による `test_runs` 投影を二重生成しない。
- schema 追加なしで既存 migration / doctor が green。

## 3. 検証予定

- `bun test tests/projection-writer.test.ts --timeout 180000`
- `bun test tests/projection-writer.test.ts tests/workflow-contracts.test.ts tests/review-green-command-projection.test.ts tests/db-projection-ingestion.test.ts --timeout 180000`
- `bun run tsc --noEmit`
- `bun run src/cli.ts plan lint --gate governance`
- `git diff --check`
- `bun run src/cli.ts db rebuild`
- `bun run src/cli.ts doctor`

## 4. 完了条件

- [x] structured green-command evidence が rebuild で `test_results` まで投影される。
- [x] rebuild 後の unit-test history signal が `test_flake_events` / `quality_signals` / `feedback_events` に届く。
- [x] L5/L6 設計と backlog が、今回閉じた範囲と残差を正しく表す。
- [x] governance lint / typecheck / doctor が green。
