---
plan_id: PLAN-L7-350-detection-performance
title: "PLAN-L7-350 (refactor): 検出系パフォーマンス改善 — projection rebuild 高速化と drive stats fast-path 恒常化（挙動不変）"
kind: refactor
layer: L7
drive: agent
status: draft
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
dependencies:
  parent: docs/plans/PLAN-L7-348-test-performance-improvement.md
  references:
    - docs/plans/PLAN-L7-348-test-performance-improvement.md
    - docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
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

### Step 2: プロファイル結果に基づく高速化（候補、計測で選定）

- SQLite バルク insert の transaction 化 / prepared statement 再利用（未実施箇所があれば）。
- docs 走査の重複 readFileSync / YAML パースの共有（同一ファイルを複数 projection が
  読む場合、mtime キーの read-through cache を `src/state-db/` 内に閉じて導入）。
- detector（split-module 等の quality signal 走査）の対象拡張子・除外 dir の見直し
  （検出結果が変わらないことを fence で確認できる範囲のみ）。

### Step 3: drive stats fast-path の恒常化

1. `bun run src/cli.ts db rebuild` 成功時に drive-registration の persisted stats
   （fingerprint 付き）を書き戻し、直後の doctor で fast path が hit するようにする
   （現状: PLAN ファイルが 1 つでも変わると常時 miss）。書き戻しは既存
   `collectDriveDbRegistrationStats` の結果のみ（新規収集なし・検査意味不変）。

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

## 5. carry（持ち越し）

- incremental rebuild（変更ファイルのみ再投影）— 設計判断が要るため L6 設計を経て別 PLAN。
