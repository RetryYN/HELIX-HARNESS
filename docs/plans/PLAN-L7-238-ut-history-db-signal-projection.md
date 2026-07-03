---
plan_id: PLAN-L7-238-ut-history-db-signal-projection
title: "PLAN-L7-238 (impl): UT history signal DB 投影"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-147 の既存 L5/L6 contract が要求する test_flake_events / quality_signals への投影を実装する slice であり、新規 product requirement は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "Explorer - UT history DB projection risk"
  - role: tl
    slot_label: "TL - UT history DB projection implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-238-ut-history-db-signal-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-237-ut-history-signal-hardening.md
  requires:
    - docs/plans/PLAN-L7-236-ut-evidence-history-backlog-split.md
    - docs/plans/PLAN-L7-237-ut-history-signal-hardening.md
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
    - src/workflow/contracts.ts
    - tests/workflow-contracts.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T09:56:55+09:00"
    tests_green_at: "2026-07-03T09:56:55+09:00"
    verdict: approve
    scope: "IMP-147 の DB projection slice として `projectUtHistorySignals` を追加し、aggregate UT history signal、plan-scoped flake window、oracle-scoped flake/duration regression を DB 投影できることを確認した。general runner ingestion と duration trend 永続化は残差として維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/workflow-contracts.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T09:56:55+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:159180de74798015f39ca50395b95a47bd26148044e766bd92a20d7d6b72a496"
      - kind: unit_test
        command: "bun test tests/workflow-contracts.test.ts tests/db-projection-ingestion.test.ts tests/review-green-command-projection.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T09:56:55+09:00"
        evidence_path: tests/db-projection-ingestion.test.ts
        output_digest: "sha256:858dc6f324a98d020481f38d436071c0c54f51b1b05ce5e8f48ce7dc6ff0264a"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T09:56:55+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:2b75560f97b74b5b8b4af3952a18a6b2bfbd7540d5d8b9ffee014cb5d90ee870"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T09:56:55+09:00"
        evidence_path: docs/plans/PLAN-L7-238-ut-history-db-signal-projection.md
        output_digest: "sha256:58e7f94d941bd47161d5fb0715c234874f55f7cc78bed3d1e2e5cedcdd013924"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T09:56:55+09:00"
        evidence_path: docs/plans/PLAN-L7-238-ut-history-db-signal-projection.md
        output_digest: "sha256:87859462b8a4a8831edcfc14aa9fcdbfe2047d3ecf59796f1c30c1f1f451a7dd"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T09:56:55+09:00"
        evidence_path: .ut-tdd/harness.db
        output_digest: "sha256:33439f3ff195e125c2e62235ff588b778724775d5aed92417a252c7e31c54c4d"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T09:56:55+09:00"
        evidence_path: docs/plans/PLAN-L7-238-ut-history-db-signal-projection.md
        output_digest: "sha256:0864381c1220b92a655426edc39439d106eddc91c6adfe9f3b461e294ae8f620"
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-238: UT history signal DB 投影

## 0. 目的

IMP-147 は、UT evidence history の残差を `general UT runner ingestion`、`flake history`、
`duration regression projection` として分離した。PLAN-L7-237 では履歴 signal の計算精度を上げたが、
DB projection へ接続していなかったため、handover / feedback / visualization が同じ evidence を
問い合わせられなかった。

この slice では、既存 L5/L6 contract の範囲内で `computeUtHistorySignals` の結果を
`test_flake_events` と `quality_signals` へ投影する。これにより、flake と duration regression を
stdout や PLAN prose ではなく harness.db の feedback surface で観測できるようにする。

## 1. スコープ

対象:

- `projectUtHistorySignals` を追加し、UT 履歴 signal を `quality_signals` へ upsert する。
- 同一 oracle に pass / fail の両履歴がある場合、`test_flake_events` に window、pass/fail count、
  `flake_score`、evidence path を保存する。
- `flake_event_id` / oracle-scoped `test_case_id` / oracle-scoped `quality_signals.subject_id` は
  plan を跨いだ同一 oracle/window の衝突を避けるため `plan_id` を含める。
- `recordTestRunEvidence` の `test_results` に duration、start/end timestamp、failure digest を保存し、
  後続の DB rebuild 由来 duration analysis で必要な粒度を欠かさない。
- duration regression は oracle 単位の `quality_signals(metric=duration_regression)` として保存し、
  aggregate signal だけで原因 oracle が失われないようにする。
- `tests/workflow-contracts.test.ts` で DB 行の再問い合わせまで検証する。
- L5/L6 設計と IMP-147 backlog の残差を同期する。

対象外:

- Vitest / Playwright / JUnit など runner 出力 parser の実装。
- `src/state-db/projection-writer.ts` の rebuild path へ general runner ingestion を統合すること。
- duration trend の時系列専用 table または dashboard 表示。
- L14 completion / version-up activation / `.ut-tdd` irreversible cutover の承認。

## 2. 受入条件

- `projectUtHistorySignals` が aggregate UT history signal を `quality_signals(source=ut-history)` へ保存する。
- pass/fail が揺れる oracle は `test_flake_events` と oracle 単位 `quality_signals` の両方で観測できる。
- 同じ oracle/window が別 PLAN に現れても `test_flake_events` / `quality_signals` の primary key が衝突しない。
- `test_flake_events.test_case_id` は oracle-scoped `test_cases` 行として解決できる。
- duration regression は aggregate score だけでなく、原因 oracle の `quality_signals` として観測できる。
- IMP-147 は runner ingestion / duration trend 永続化の残差を残し、完了扱いにしない。
- 既存の `recordTestRunEvidence` / `computeUtHistorySignals` の API 互換性を壊さない。

## 3. 検証予定

- `bun test tests/workflow-contracts.test.ts --timeout 180000`
- `bun test tests/workflow-contracts.test.ts tests/db-projection-ingestion.test.ts tests/review-green-command-projection.test.ts --timeout 180000`
- `bun run tsc --noEmit`
- `bun run src/cli.ts plan lint --gate governance`
- `git diff --check`
- `bun run src/cli.ts db rebuild`
- `bun run src/cli.ts doctor`

## 4. 完了条件

- [x] UT history DB 投影関数が実装されている。
- [x] `test_flake_events` と `quality_signals` の row-level test が green。
- [x] L5/L6 設計と backlog が、今回閉じた範囲と残差を正しく表す。
- [x] governance lint / typecheck / doctor が green。
