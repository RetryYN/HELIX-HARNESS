---
plan_id: PLAN-L7-240-reporter-artifact-ut-ingestion
title: "PLAN-L7-240 (impl): reporter artifact UT ingestion"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-147 の既存 L5/L6 contract 内で、green-command evidence の reporter artifact parser を追加する slice。新規 product requirement、DB schema、外部依存は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "Explorer - reporter parser scope"
  - role: tl
    slot_label: "TL - reporter artifact ingestion"
generates:
  - artifact_path: docs/plans/PLAN-L7-240-reporter-artifact-ut-ingestion.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: src/state-db/test-report-parser.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/test-report-parser.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-239-structured-ut-evidence-rebuild-projection.md
  requires:
    - docs/plans/PLAN-L7-239-structured-ut-evidence-rebuild-projection.md
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
    - src/state-db/projection-writer.ts
    - tests/projection-writer.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T16:43:00+09:00"
    tests_green_at: "2026-07-03T16:43:00+09:00"
    verdict: approve
    scope: "Vitest/Jest-compatible JSON、Playwright JSON、JUnit XML の reporter artifact を pure parser で TestCaseEvidence へ正規化し、既存 rebuild 経路から test_results / test_flake_events / quality_signals へ接続した。duration trend 永続化は IMP-147 残差として維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/test-report-parser.test.ts tests/projection-writer.test.ts tests/workflow-contracts.test.ts tests/review-green-command-projection.test.ts tests/db-projection-ingestion.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:43:00+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:e21be7cb77522b3a284426473f916de658a715be6b706b58441ba62fae2216b0"
      - kind: unit_test
        command: "npm test tests/test-report-parser.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:43:00+09:00"
        evidence_path: tests/test-report-parser.test.ts
        output_digest: "sha256:2d64fd9e2b2da86ab065c34b7ebe4cd9ee9585dc8b788c8c3738d25c23a3c0df"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:43:00+09:00"
        evidence_path: src/state-db/test-report-parser.ts
        output_digest: "sha256:cb1c8889f1c892626a3becb0137126430b8e1bfd58e48b94e19376ba07cc2e4c"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T16:43:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:98c393e869014932a2498c6d432ff30480850549068009007dd24615168dd4da"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T16:43:00+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:c6406b052c3ec605afa95cd85251c1eeacaa7b4b6b55fc181338613db0bed2a5"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:43:00+09:00"
        evidence_path: docs/improvement-backlog.md
        output_digest: "sha256:25076b230f28f64e52661e7a43d4df76e0f1fbff1e3c51c369fdc49df19b1023"
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-240: reporter artifact の UT ingestion

## 0. 目的

PLAN-L7-239 で structured `cases[]` JSON は deterministic rebuild から unit-test history に接続された。
ただし実運用の green command evidence は Vitest / Playwright / JUnit reporter artifact を直接保存する
ことが多く、structured wrapper だけでは検証戦略の実効性が弱い。

この slice では `review_evidence.green_commands[].evidence_path` が repo 内 JSON/XML evidence を指す場合、
official reporter artifact を `TestCaseEvidence[]` に正規化し、既存 `test_cases` / `test_results` /
`test_artifact_edges` / `test_flake_events` / `quality_signals` へ流す。

## 1. 外部根拠

- Vitest reporter docs: `https://vitest.dev/guide/reporters`
  - JSON reporter は Jest-compatible JSON を出し、JUnit reporter は JUnit XML を出せる。
  - `outputFile` によって reporter output をファイル化できる。
- Playwright reporter docs: `https://playwright.dev/docs/test-reporters`
  - built-in JSON / JUnit reporters と `outputFile` 設定がある。

## 2. スコープ

対象:

- structured `cases[]` JSON の既存契約を維持する。
- Vitest/Jest-compatible JSON の `testResults[].assertionResults[]` を読む。
- Playwright JSON の `suites -> specs -> tests -> results` を読む。
- JUnit XML の `<testcase>`、`<failure>` / `<error>`、`<skipped>`、`time` を読む。
- parser を `src/state-db/test-report-parser.ts` に分離し、projection writer は orchestration に限定する。
- DTD/ENTITY 付き XML、未知 format、空 cases は rebuild を壊さず無視する。

対象外:

- DB schema / migration 追加。
- duration trend 専用 table / dashboard 永続化。PLAN-L7-241 は既存 `quality_signals` に
  `duration_trend_ms` を保存する schema-less persistence として扱う。
- reporter の実行、外部依存追加、ネットワーク利用。
- HTML / trace / coverage / attachment / blob parser は対象外。
- JUnit XML 全方言への完全対応。
- L14 completion / version-up activation / `.helix` irreversible cutover 承認。

## 3. 受入条件

- parser unit test が Vitest JSON、Playwright JSON、JUnit XML を `TestCaseEvidence[]` に正規化する。
- Playwright retry の failed -> passed が同一 oracle の pass/fail 履歴として残り、`test_flake_events` に届く。
- JUnit XML の failed / skipped / passed と秒単位 duration が正規化される。
- structured `cases[]` JSON の既存 projection test が退行しない。
- `rebuildHarnessDb` が reporter evidence を既存 `test_runs` に紐づけ、`test_results` へ投影する。
- schema 追加なしで typecheck、governance plan lint、db rebuild、doctor が green。

## 4. 実装メモ

- `parseGreenCommandEvidence` は pure parser とし、repo path の安全確認と DB upsert は
  `projectStructuredGreenCommandCaseEvidence` 側に残す。
- `oracle_id` は explicit field / annotation または `U-*` marker がある場合だけ採用する。
- `artifact_path` は reporter の file/name field または path-like JUnit classname のみに限定し、
  absolute path / URL は投影しない。
- XML message は 500 文字で切り詰める。
