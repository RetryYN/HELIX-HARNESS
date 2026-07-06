---
plan_id: PLAN-L7-350-detection-performance
title: "PLAN-L7-350 (refactor): 検出系パフォーマンス改善 — projection rebuild 高速化と drive stats fast-path 恒常化（挙動不変）"
kind: refactor
layer: L7
drive: agent
route_mode: Refactor
entry_signals:
  - po_directive:2026-07-06-detection-performance
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "rebuildHarnessDb / doctor 検出系の behavior-invariant な高速化（キャッシュ・fast path 恒常化）。projection 内容・gate 判定・schema は変更しない。"
owner: Claude (Fable)
parent_design: docs/process/modes/refactor.md
pair_artifact: tests/projection-writer.test.ts
agent_slots:
  - role: se
    slot_label: "SE (Sonnet) - rebuild プロファイルとキャッシュ実装"
  - role: tl
    slot_label: "TL - projection 内容の同一性（挙動不変）検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-350-detection-performance.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/state-db/drive-registration.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: tests/drive-db-registration.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-348-test-performance-improvement.md
  references:
    - docs/plans/PLAN-L7-348-test-performance-improvement.md
    - docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T16:05:00+09:00"
    tests_green_at: "2026-07-06T16:05:00+09:00"
    verdict: approve
    scope: "PLAN-L7-350 の projection rebuild 計測 hook、review evidence 読み取り cache、artifact_progress の一括 index 化、drive-registration 永続 DB fast-path 恒常化を確認した。projection schema / gate 判定 / 検出 rule は変更していない。doctor は別 PLAN/既存差分（PLAN-L7-352、PLAN-L7-351、PLAN-L6-55、src/plan/lint.ts）で exit 1 だが、drive-db-registration / db-projection-ingestion / design-language / plan-entry-routing は green で本 PLAN 起因の新規 fail は確認されなかった。"
    worker_model: gpt-5.5-codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/projection-writer.test.ts tests/drive-db-registration.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T16:02:27+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:eb4fd791719c122987bcf7d7af2eb1233b008bf242d9d68881ccac655f0757bd"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T16:02:03+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:44220009afe0690be55eb18f2b4b35dee3d3bb863b32a1b2318af0386a4f54fe"
      - kind: smoke
        command: "/usr/bin/time -f 'elapsed=%e user=%U sys=%S' bun run src/cli.ts db rebuild"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T16:02:03+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:54fbe9eeab591828ea4c650f4ab5b385fec071bd2d584ef81f20fdb742a82276"
---

# PLAN-L7-350 (refactor): 検出系パフォーマンス改善

## 起点 signal

- `po_directive:2026-07-06 「テストや検出系のパフォーマンス向上の起票をして」`
- 実測 signal（debt_degradation）: `bun run src/cli.ts db rebuild` 単体 **13.4 秒**（55,373 行）、
  doctor 内の in-memory rebuild 15〜25 秒（PLAN-L7-348 Step 1 計測）。rebuild は
  doctor / db rebuild / drive stats / テスト群から高頻度に呼ばれる検出系の共通コスト。

## 0. 目的

PLAN-L7-348 Step 2（rebuild の doctor 内共有、47s→32s）の続きとして、**rebuild 1 回そのものを
速くする**。挙動不変（projection 内容の同一性）が不変条件。

## 1. スコープ（Sonnet 実装手順、挙動不変）

### Step 1: rebuild の内訳プロファイル

1. `rebuildHarnessDb`（`src/state-db/`）の projection family 単位で `performance.now()` 計時し、
   上位を本 PLAN の計測記録節へ記録する（docs 走査 / YAML パース / SQLite insert /
   detector（refactor-candidate 等）走査の内訳を分離）。
2. 挙動不変 fence: 改善前の rebuild 後 DB を基準に、全テーブルの行数と主要テーブルの
   content digest（`SELECT` 結果の安定ソート + sha256）を記録するスクリプト手順を残す。

#### Step 1 実施記録（2026-07-06）

- `rebuildHarnessDb({ onProfile })` を追加し、通常呼び出しでは挙動不変のまま projection family ごとの
  `performance.now()` 計測を可能にした。
- 初回 profile 上位: `projectReviewEvidenceRegistry` **7.8s**、`projectArtifactProgress` **3.8s**、
  `projectCurrentImpactResults` **1.0s**、`truncateProjectionTables` **0.9s**、
  `projectTestCaseCatalog` **0.6s**。
- fence 手順: in-memory DB を 2 個作り、通常 rebuild と `onProfile` rebuild の全 table row count と
  volatile timestamp 列除外 digest を比較する。`onProfile` は projection 内容へ影響しない。

### Step 2: プロファイル結果に基づく高速化（候補、計測で選定）

- SQLite バルク insert の transaction 化 / prepared statement 再利用（未実施箇所があれば）。
- docs 走査の重複 readFileSync / YAML パースの共有（同一ファイルを複数 projection が
  読む場合、mtime キーの read-through cache を `src/state-db/` 内に閉じて導入）。
- detector（split-module 等の quality signal 走査）の対象拡張子・除外 dir の見直し
  （検出結果が変わらないことを fence で確認できる範囲のみ）。

#### Step 2 実施記録（2026-07-06）

- `projectReviewEvidenceRegistry`: `green_commands` の `evidence_path` 読み直しを rebuild 内
  read-through cache に変更。1221 command / 321 unique path の重複 `readFileSync` を削減した。
- `projectArtifactProgress`: `test_runs` と `impact_results` を node ごとに SELECT していた箇所を
  rebuild 内 index（passed test run index / open dependency impact count）へ変更した。
- 改善後 profile 上位: `projectReviewEvidenceRegistry` **1.9s**、`projectCurrentImpactResults` **1.0s**、
  `defaultRelationGraphProjection` **0.6s**、`projectTestCaseCatalog` **0.6s**、
  `projectArtifactProgress` **0.15s**。

### Step 3: drive stats fast-path の恒常化

1. `bun run src/cli.ts db rebuild` 成功時に drive-registration の persisted stats
   （fingerprint 付き）を書き戻し、直後の doctor で fast path が hit するようにする
   （現状: PLAN ファイルが 1 つでも変わると常時 miss）。書き戻しは既存
   `collectDriveDbRegistrationStats` の結果のみ（新規収集なし・検査意味不変）。

#### Step 3 実施記録（2026-07-06）

- `refreshPersistedDriveDbRegistrationStats(repoRoot)` を追加し、`db rebuild` 成功直後に persisted
  harness.db から `collectDriveDbRegistrationStats` + current PLAN fingerprint を再読込する経路を固定した。
- `bun run src/cli.ts db rebuild` は rebuild 成功後に上記 refresh を呼ぶ。出力 shape は変えていない。
- `tests/drive-db-registration.test.ts` に、persisted rebuild 後の
  `loadOrBuildDriveDbRegistrationStats(repoRoot)` が current fingerprint の fast-path hit になる回帰テストを追加。

## 2. 対象外

- projection schema / 検出 rule / gate 判定の変更（挙動不変が不変条件）。
- `src/state-db/projection-writer.ts` の split-module 分割（PLAN-L7-150 の別 slice）。
- doctor gate の並列実行（PLAN-L7-348 carry のまま）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): Step 1（プロファイル + fence）→ Step 2（計測上位から高速化）。
- step 2 (mode: parallel): Step 3（fast-path 恒常化）— Step 2 と触るファイルが独立なら並列可。

## 4. 受入条件（falsifiable / 検証コマンド）

- 挙動不変: 改善前後で rebuild 後 DB の全テーブル行数一致 + 主要テーブル digest 一致
  （実測 diff を本文に記録）。
- `time bun run src/cli.ts db rebuild` が **13.4s → 8s 以下**（未達時は内訳計測と理由を記録し、
  target 再設定の後続 slice を明示）。
- `bun run vitest run tests/projection-writer.test.ts` green、`bun run typecheck` green、
  `bun run src/cli.ts doctor` に本 PLAN 起因の新規 fail なし。
- 実装着手時に `generates:` へ触った module / test を追記（draft 時点は本 PLAN md のみ）。

### 受入検証記録（2026-07-06）

- `bun run vitest run tests/projection-writer.test.ts tests/drive-db-registration.test.ts`
  → **green**（2 ファイル / 39 テスト pass、30.82s）。
- `bun run typecheck` → **green**。
- `/usr/bin/time -f 'elapsed=%e user=%U sys=%S' bun run src/cli.ts db rebuild`
  → **green**、`elapsed=7.23`（13.4s → 8s 以下を達成）。
- `bun run src/cli.ts doctor` → exit 1。既存/別 PLAN 起因の fail:
  `merged-plan-status`（PLAN-L7-352）、`coding-rules`（src/plan/lint.ts 既存差分）、
  `plan-governance`（PLAN-L7-351）、`review-evidence`（PLAN-L6-55 / PLAN-L7-351）。
  本 PLAN 関連 gate は `drive-db-registration - OK`、`db-projection-ingestion - OK`、
  `design-language - OK`、`plan-entry-routing - OK`、`plan-governance - OK`。

## 5. carry（持ち越し）

- incremental rebuild（変更ファイルのみ再投影）— 設計判断が要るため L6 設計を経て別 PLAN。
