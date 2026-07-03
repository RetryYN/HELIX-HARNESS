---
plan_id: PLAN-L7-237-ut-history-signal-hardening
title: "PLAN-L7-237 (impl): UT history signal 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-147 の既存 L6 contract 内で computeUtHistorySignals の判定精度を上げる実装であり、新規 product requirement や外部 contract は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM - UT history signal evidence"
  - role: tl
    slot_label: "TL - verification strategy signal hardening"
generates:
  - artifact_path: docs/plans/PLAN-L7-237-ut-history-signal-hardening.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-236-ut-evidence-history-backlog-split.md
  requires:
    - docs/plans/PLAN-L7-236-ut-evidence-history-backlog-split.md
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
    - src/workflow/contracts.ts
    - tests/workflow-contracts.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T09:45:13+09:00"
    tests_green_at: "2026-07-03T09:45:13+09:00"
    verdict: approve
    scope: "IMP-147 の残差を閉じず、既存 L6 contract 内で UT history signal の flake / duration regression 判定だけを強化した。別 oracle の pass/fail は混同せず、直近 duration は過去中央値と比較する。runner ingestion / test_flake_events DB projection / duration trend 永続化は残差として維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/workflow-contracts.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T09:45:13+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:f40a16a765d4652dbce490bb137b04cb641561a4b2882f39e2228de3a4c71a7c"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T09:45:13+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:5ea59f0b32b7fbec6d400bd8f2bdc2a7fe0be70d73c3645c662c8de79f9d849c"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T09:45:13+09:00"
        evidence_path: docs/plans/PLAN-L7-237-ut-history-signal-hardening.md
        output_digest: "sha256:2330f83c91fe059305557d52f4f7da303649ea72df28da21dd9b199b9c759ffd"
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-237: UT history signal 強化

## 0. 目的

IMP-147 は UT evidence history projection の残差を、general runner ingestion / flake history /
duration regression projection として分離した。この slice では DB ingestion 全体には踏み込まず、
既存 `computeUtHistorySignals` の履歴 signal を強化する。

外部根拠として、Playwright Test は retry 後の結果で flaky を通常失敗と区別し、Vitest は reporter で
test output を構造化できる。Google SRE は latency を window と percentile/分布で監視することを推奨する。
このため HELIX 側では、単一 run の pass/fail だけでなく、oracle 単位の履歴揺れと duration 変化を分けて
surface する。

参照した公式 source:

- Playwright Test retries: `https://playwright.dev/docs/test-retries`
- Vitest reporters: `https://vitest.dev/guide/reporters`
- Google SRE monitoring workbook: `https://sre.google/workbook/monitoring/`

## 1. スコープ

対象:

- `computeUtHistorySignals` が oracle 単位の pass/fail 履歴揺れを `flake_score` として計算する。
- `computeUtHistorySignals` が直近 duration と過去中央値を比較し、`duration_regression` signal を返す。
- `tests/workflow-contracts.test.ts` に flake / duration regression の oracle を追加する。
- L6 function-spec と backlog を、今回の部分実装と残差に同期する。

対象外:

- Vitest / Playwright JSON/JUnit parser の実装。
- `test_flake_events` DB 投影の実装。
- runner log ingestion と duration regression trend の永続化。
- L14 completion / version-up activation / irreversible rename cutover の承認。

## 2. 受入条件

- 同一 oracle が pass と fail の両方を持つと flake として signal 化される。
- 直近 duration が過去中央値の閾値以上なら duration regression として signal 化される。
- 単一 run の通常 green は flake / duration regression を 0 として扱う。
- `IMP-147` は完了扱いにせず、runner ingestion / DB flake projection の残差を残す。

## 3. 検証

- `bun test tests/workflow-contracts.test.ts --timeout 180000`
- `bun run src/cli.ts plan lint --gate governance`
- `bun run src/cli.ts db rebuild && bun run src/cli.ts doctor`

## 4. 完了条件

- [x] `computeUtHistorySignals` が flake / duration regression signal を返す。
- [x] flake / duration regression の単体テストが green。
- [x] IMP-147 の残差が backlog に残っている。
