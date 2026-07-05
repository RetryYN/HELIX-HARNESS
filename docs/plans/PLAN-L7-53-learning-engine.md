---
plan_id: PLAN-L7-53-learning-engine
title: "PLAN-L7-53: skill learning engine — evaluation, trend, and recommendation feedback"
kind: impl
layer: L7
drive: db
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: confirmed
created: 2026-06-15
updated: 2026-06-15
agent_slots:
  - role: tl
    slot_label: 'TL - skill evaluation + learning engine review'
  - role: qa
    slot_label: 'QA - evaluation oracle and acceptance criteria'
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: claude-opus-4-8
    reviewer_model: claude-sonnet-4-6
    tests_green_at: "2026-06-15"
    reviewed_at: "2026-06-15"
    verdict: pass
    scope: "Learning Engine FR-L1-36/38/43 (projectSkillEvaluations/projectPocEvaluations/projectModelEvaluations + harness-db schema v12 + 3 evaluation test suites)。cold-start 不変条件 (0 telemetry/opt-in 無効で 0 行・throw しない) を 3 projection で確認、FR-38 cost-efficiency の explicit_l7_defer (当時 telemetry 未配線・捏造なし、後続 PLAN-L7-57/58 で discharge 済み) 正当性、値の正しさ (skill rating=adoption×success / PoC=confirmed/(confirmed+rejected+pivot) pivot 非成功 / model=success_count/run_count、join=plan_registry.status IN PLAN_SUCCESS_STATUSES) を検証。Critical=0、APPROVE。Important I-1 (poc PK single-row 制約 doc note) は対応、I-2 (unused cutoff 30d 境界テスト) + Minor M-1..3 (asOf 対称性/PLAN_SUCCESS_STATUSES export/index コメント) は §Carry に test-hardening follow-up として記録 (非ブロッカー、green コードへの増分)。V-model closure 用の後追い review (実装は 2026-06-15 同日 merge 済 green、status=draft + review_evidence 空のまま放置されていたのを本クローズで confirmed 化)。"
generates:
  # FR-L1-36 (基盤 slice。この PLAN で実装済み)
  - artifact_path: src/schema/harness-db.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/skill-evaluation.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/fr-unit-coverage.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/plans/PLAN-L7-53-learning-engine.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L1-requirements/functional-requirements.md
    artifact_type: design_doc
  # FR-L1-38 (model evaluation。この PLAN で実装済み)
  - artifact_path: tests/model-evaluation.test.ts
    artifact_type: test_code
  # FR-L1-43 (PoC success measurement。この PLAN で実装済み)
  - artifact_path: tests/poc-evaluation.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
next_pair_freeze: L7
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/plans/PLAN-L7-46-projection-writer.md
    - docs/plans/PLAN-L7-47-search-metrics-feedback.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/design/harness/L6-function-design/fr-unit-coverage.md
  references:
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L3-functional/business-detail.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-53: skill learning engine の実装

## 目的

`skill learning engine` の基盤 (FR-L1-36)、`model evaluation` の opt-in
(FR-L1-38)、PoC success measurement (FR-L1-43) を実装する。

BR-21 の 3 つの FR slice は、すべてこの PLAN で実装済みである。

## 範囲

### FR-L1-36 (実装済み、基盤 slice)

- harness-db schema に `skill_evaluations` table を追加し、`SCHEMA_VERSION` を 10 へ更新した。
- `projection-writer.ts` に `projectSkillEvaluations(db, opts?)` を追加し、`projectSkillMetrics` の後で
  `rebuildHarnessDb` から呼ぶように配線した。
- skill ごとに `skill_rating` (0.0-1.0) = `success_count / adoption_count`、`adoption_count`、
  `success_count`、`unused_flag` (直近 30 日に invocation がない場合は 1)、`evaluated_at` を記録する。
- success states は `"confirmed"` と `"completed"` とし、理由は source 側に記録した。
- cold-start (invocation 0 件) では 0 rows とし、例外を投げない。
- 未使用 skill の削除は人間だけが行い、flag は判断材料として signal を surface する。

### FR-L1-38 (実装済み、model evaluation の opt-in)

- harness-db schema に `model_evaluations` table を追加した (`SCHEMA_VERSION` 11→12)。
- `projection-writer.ts` に `projectModelEvaluations(db, repoRoot)` を追加し、`projectPocEvaluations` の後で
  `rebuildHarnessDb` から呼ぶように配線した。
- opt-in は `repoRoot` 配下の `.helix/config/model-opt-in.yaml` を読み、`enabled: true` の場合だけ実行する。
  既定 (file なし) は disabled として 0 rows にする。
- model ごとに `success_rate = success_count / run_count` を算出する (`model_runs.plan_id` を
  `plan_registry.status IN PLAN_SUCCESS_STATUSES` に join)。
- cold-start (`enabled` かつ `model_runs` 0 件) では 0 rows とし、例外を投げない。
- cost-efficiency (`cost_per_success`) は token/cost telemetry 待ちの `explicit_l7_defer` follow-up とする。
  捏造した cost data は保存しない。正式な owner と discharge condition は §Carry に記録する。

### FR-L1-43 (実装済み、PoC success measurement)

- harness-db schema に `poc_evaluations` table を追加し、`SCHEMA_VERSION` を 11 へ更新した。
- `projection-writer.ts` に `projectPocEvaluations(db, opts?)` を追加し、`projectSkillEvaluations` の後で
  `rebuildHarnessDb` から呼ぶように配線した。
- summary row は 1 件とする (`id="poc-evaluation:summary"`)。`poc_success_rate = confirmed /
  (confirmed + rejected + pivot)` で、pivot は非成功として扱う。
- cold-start (decision 済み PoC PLAN 0 件) では 0 rows とし、例外を投げない。

## 受入条件

### FR-L1-36

- AC-FR-BR21-36-01: skill を 5 plans が採用し、5 件すべてが `"confirmed"` の場合は rating 1.0、`unused_flag` 0。
- AC-FR-BR21-36-02: 最終 invocation が 30 日超前の skill は `unused_flag` 1 とし、row は保持する。
- cold-start: invocation 0 件では evaluation rows 0 件とし、例外を出さない。

### FR-L1-38

- AC-38-01 (`enabled`): `model-A` は 2 runs とも成功なら rate 1.0、`model-B` は 2 runs 中 1 件成功なら rate 0.5。
- AC-38-02 (`disabled`): opt-in file がない場合は `model_evaluations` rows 0 件。
- cold-start (`enabled`、`model_runs` 0 件) では 0 rows とし、例外を投げない。

### FR-L1-43

- AC-FR-BR21-43-01: 10 PoC (6 confirmed / 3 rejected / 1 pivot) では rate 0.60。
- AC-FR-BR21-43-02 cold-start: PoC PLAN 0 件では 0 rows。

## 完了証跡

- `src/schema/harness-db.ts` は `skill_evaluations`、`poc_evaluations`、`model_evaluations` tables を持つ。`SCHEMA_VERSION=12`。
- `src/state-db/projection-writer.ts` は `projectSkillEvaluations`、`projectPocEvaluations`、`projectModelEvaluations` を export し、`rebuildHarnessDb` から呼ぶ。
- `tests/skill-evaluation.test.ts` は pass (6 tests、U-FR-L1-36 を明記)。
- `tests/poc-evaluation.test.ts` は pass (U-FR-L1-43 を明記)。
- `tests/model-evaluation.test.ts` は pass (U-FR-L1-38 を明記)。
- `npx tsc --noEmit` は clean。
- `npx vitest run` は fully green。
- `npx biome check src tests` は clean。
- `bun run src/cli.ts doctor` は exit 0。thin-coverage advisory に learning-engine FR は出ない。

## DoD

- [x] FR-L1-36 acceptance criteria は green。
- [x] FR-L1-38 acceptance criteria は green。
- [x] FR-L1-43 acceptance criteria は green。
- [x] tsc + vitest + biome + doctor はすべて pass。
- [x] function-spec.md、fr-unit-coverage.md、L7-unit-test-design.md を更新済み。
- [x] FR-L1-38 follow-up (cost-efficiency) を PLAN body と function-spec.md invariant に明記済み。
- [x] FR-L1-38 cost-efficiency formalized as a named defer with explicit owner + discharge condition (§Carry)。後続 PLAN-L7-57/58 で discharge 済み。

## Carry (defer follow-up、owner + discharge condition 明示 / 後続 discharge 済み)

> 正規 defer 手続き (CLAUDE.md G.13 / concept §3.1.3.1: 明示宣言した defer は under-design ではない)。
> doc-only に留めず discharge condition を機械追跡可能な形で残す。

- **FR-L1-38 cost-efficiency (`cost_per_success`)** — `explicit_l7_defer`、後続 PLAN-L7-57/58 で discharge 済み
  - **defer 理由**: token/cost telemetry が現状 harness のどこにも存在しない (`model_runs` に
    cost/token 列がなく、cost を計算する原資データがゼロ)。捏造した cost を投影しない方針 (= 0 行 cold-start
    と同じ honest-absence 原則)。FR-L1-38 本体 (model 別 success_rate) は実装済・substance-verified
    (U-FR-L1-38 oracle / `tests/model-evaluation.test.ts`) であり、**deferred なのは cost 効率の sub-aspect のみ**
    (FR 全体を defer しているのではない)。
  - **owner**: PO (telemetry 配線の優先度判断) + telemetry 実装担当。
  - **discharge 済みの根拠**: PLAN-L7-57 token telemetry tracker + PLAN-L7-58 cost enrichment。`projectTokenUsage` が runtime session telemetry を `model_runs` に投入し、`projectModelEvaluations` が token/cost efficiency を集計する。未掲載 pricing は null のままにし、ダミー cost は投影しない。
  - **検証**: `tests/token-tracker.test.ts` + `tests/model-evaluation.test.ts`。

- **test-hardening follow-up (review 2026-06-15 I-2 / M-1..3、非ブロッカー)** — green コードへの増分:
  - I-2: `unused_flag` cutoff の **ちょうど 30 日前 (境界、`fired_at === cutoff`)** ケースを `tests/skill-evaluation.test.ts` に追加し inclusive (`>=`) を回帰固定。
  - M-1: `projectModelEvaluations` に `opts?: { asOf?: string }` を足し skill/poc と対称化 (値固定テスト可能化)。
  - M-3: `idx_poc_evaluations_rate` は単一行テーブルでは実質無効 = 「multi-row 拡張を見越した前倒し」コメント (I-1 の PK 注記とセット)。
