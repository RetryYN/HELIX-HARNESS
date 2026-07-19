---
plan_id: PLAN-L7-241-duration-trend-quality-signal
title: "PLAN-L7-241 (impl): duration trend quality signal 永続化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-147 の既存 L5/L6 contract 内で、duration trend を既存 quality_signals sink に永続化する slice。新規 product requirement、DB schema、migration は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "Explorer - duration trend schema boundary"
  - role: tl
    slot_label: "TL - duration trend persistence"
generates:
  - artifact_path: docs/plans/PLAN-L7-241-duration-trend-quality-signal.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/plans/PLAN-L7-238-ut-history-db-signal-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-239-structured-ut-evidence-rebuild-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-240-reporter-artifact-ut-ingestion.md
    artifact_type: markdown_doc
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-240-reporter-artifact-ut-ingestion.md
  requires:
    - docs/plans/PLAN-L7-238-ut-history-db-signal-projection.md
    - docs/plans/PLAN-L7-239-structured-ut-evidence-rebuild-projection.md
    - docs/plans/PLAN-L7-240-reporter-artifact-ut-ingestion.md
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
    - src/workflow/contracts.ts
    - src/state-db/projection-writer.ts
    - tests/workflow-contracts.test.ts
    - tests/projection-writer.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T17:16:00+09:00"
    tests_green_at: "2026-07-03T17:16:00+09:00"
    verdict: approve
    scope: "IMP-147 の duration trend 残差を、専用 table / migration 追加ではなく既存 quality_signals(metric=duration_trend_ms) の oracle/run-scoped row として永続化した。value=duration_ms、threshold=prior median、computed_at=run completed_at を保存し、duration_regression は悪化判定として維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/workflow-contracts.test.ts tests/projection-writer.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T17:16:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:a2efa30cfe3d93ae963e0183662e4a62bbf300615586b21f0358e5e2ae85e5fc"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T17:16:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:83a09dd5d92390095236b25814613b89ad9c9c1d8eff577b09cd2426f52b6a17"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T17:16:00+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:7e2f031a717908e51d967a86df43e1f3a8f449b53055b751b8e27ff3cb18b4a3"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T17:16:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:cbecd93062287add021f7f3dc7319637f1a18dac7d722e552bf9ee0d6389b599"
      - kind: smoke
        command: "npx --no-install tsx src/cli.ts db rebuild"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T17:16:00+09:00"
        evidence_path: docs/improvement-backlog.md
        output_digest: "sha256:b3a8e788d4b4fb470b896af151a5a385499e7961a782d50b264c467515530087"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T17:16:00+09:00"
        evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
        output_digest: "sha256:c148eb7c9ded386376c5863a4ef2675659384ffe6b501daad3481251e0667ceb"
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-241: duration trend quality signal 永続化

## 0. 目的

IMP-147 の最後の残差は、duration regression を warn signal として出せても、各 run/oracle の
duration 観測点を時系列として query できないことだった。専用 table / migration を追加すると
handover の D-DB escalation 境界に入るため、この slice では既存 `quality_signals` を
rebuild 可能な trend sink として使う。

## 1. スコープ

対象:

- `projectUtHistorySignals` と deterministic rebuild 経路の両方で、oracle/run 時点ごとの
  `duration_trend_ms` を `quality_signals(source=ut-history)` に保存する。
- `subject_id` は `oracle:<plan_id>:<oracle_id>`、`value` は duration ms、`threshold` はその時点より前の
  duration 中央値、`computed_at` は run completed_at とする。
- `signal_id` は `plan_id + oracle_id + completed_at + duration + duration index` を含め、rebuild で冪等にする。
- `duration_regression` は悪化判定 signal として維持し、`duration_trend_ms` は時系列観測点として分離する。
- L5/L6 設計と IMP-147/IMP-109 backlog の状態を同期する。

対象外:

- DB schema / migration / index 追加。
- p50/p95/stddev/slope/window summary 専用 table。
- dashboard 専用 read model。
- L14 completion / version-up activation / `.helix` irreversible cutover の承認。

## 2. 受入条件

- `projectUtHistorySignals` 直呼びで、同一 oracle の duration 観測点が `duration_trend_ms` として複数行保存される。
- rebuild 経路で structured green-command evidence から同じ `duration_trend_ms` 行が保存される。
- 最新 trend row は `threshold=prior median` と `status=warn/pass` を持つ。
- `duration_regression` の既存 aggregate/oracle signal は退行しない。
- schema 追加なしで typecheck、targeted tests、plan lint、db rebuild、doctor が green。

## 3. schema 変更が必要になる境界

現時点で不要:

- per-run duration、prior median threshold、oracle 単位 trend query。

将来 schema 変更を検討する境界:

- p50/p95/stddev/slope/window size など複数統計を 1 row に保持する。
- trend window 専用 table、run/result への厳密 FK/unique 制約、dashboard 向け高性能 query/index が必要になる。
- その場合は D-DB / migration 境界として別 PLAN と human approval に回す。
