---
plan_id: PLAN-L7-349-cli-split-slice
title: "PLAN-L7-349 (refactor): cli.ts 段階分割 — PLAN-L7-150 accepted debt の実行 slice（挙動不変・cold start 根治の起点)"
kind: refactor
layer: L7
drive: agent
status: draft
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "src/cli.ts の behavior-invariant な module 分割（PLAN-L7-150 accepted debt 台帳の attached slice）。コマンド surface・exit code・出力仕様は変更しない。"
owner: Claude (Fable)
parent_design: docs/process/modes/refactor.md
pair_artifact: tests/cli-surface.test.ts
agent_slots:
  - role: se
    slot_label: "SE (Sonnet) - コマンドグループ単位の register 関数抽出"
  - role: tl
    slot_label: "TL - --help 出力・exit code の挙動不変検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-349-cli-split-slice.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
  references:
    - docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
    - docs/plans/PLAN-L7-348-test-performance-improvement.md
---

# PLAN-L7-349 (refactor): cli.ts 段階分割

## 起点 signal

- feedback quality_signal（open、2026-07-06 実測）: `refactor-candidate:split-module:src-cli.ts:module-has-5360-nonblank-line-s-and-3-export-s-`
- PLAN-L7-150 台帳 disposition: `accepted_debt + attached_plan=PLAN-L7-150`（本 PLAN はその実行 slice）。

## 0. 目的

`src/cli.ts` は 5,360 行（2026-07-06 実測、refactor_candidate:split-module 検出中）で、
(a) テストでの CLI spawn cold start を重くし（PLAN-L7-348 B2）、(b) コマンド単位の
ユニットテスト境界を阻害している。PLAN-L7-150 台帳の accepted_debt
「CLI subcommand 群ごとに分割し、既存 CLI tests を fence にする」を実行する子 slice。

構造実測（2026-07-06、旧 5,510 行時点の棚卸し。着手時に
`grep -n '= program\.command(' src/cli.ts` で再実測すること）:
先頭〜約 960 行が共有ヘルパー、以降にトップレベルコマンドグループ約 31 個。
大きい順: `rename`（~564 行）、`route`（~459 行）、`handover`（~348 行）、
`web` / `team`（各 ~272 行)、`pair-agent`（~220 行)、`guard`（~173 行)、`setup`（~171 行）。

## 1. スコープ（Sonnet 実装手順、挙動不変）

分割方式（全 Step 共通）:

- 各グループを `src/cli/commands/<group>.ts` の
  `export function register<Group>Commands(program: Command): void` へ移す。
- 先頭の共有ヘルパー群は必要分だけ `src/cli/helpers.ts` へ先出しし、コマンド module は
  そこから import する（cli.ts からの再 export はしない。dead path を残さない）。
- `src/cli.ts` は import + register 呼び出し + `parseAsync` の薄い bootstrap へ段階収束させる。
- 移動は cut&paste + import 修正のみ。action 本体のロジック・オプション定義・出力文字列は
  一切変更しない。

### Step 1: 独立性の高い最大 3 グループ

1. `src/cli/commands/rename.ts` ← `rename` グループ（依存が rename-audit 系 lib に閉じる）。
2. `src/cli/commands/handover.ts` ← `handover`（`handover provider` / `handover db` 含む）。
3. `src/cli/commands/web.ts` ← `web`。
4. fence: `bun run typecheck` / `bun run src/cli.ts --help` の subcommand 一覧が分割前と一致 /
   `bun run vitest run tests/cli-surface.test.ts` の pass 集合が分割前と同一。

### Step 2: 大物 2 グループ

1. `src/cli/commands/route.ts` ← `route`（provider dynamic subcommand 生成が複雑なため、
   移動前に `bun run src/cli.ts route --help` 出力を記録し、移動後に diff ゼロを確認）。
2. `src/cli/commands/team.ts` ← `team`。

### Step 3: 残余グループの集約

- 20〜40 行の薄いグループ（`automation` / `guardrail` / `trouble` / `improvement` /
  `asset` / `builder` 等）は `src/cli/commands/misc.ts` に集約（1 グループ 1 ファイルにしない）。
- 以降のグループ（`guard` / `hook` / `pair-agent` / `completion` / `setup` ほか）は
  同方式で順次。全 Step 完了は必須とせず、cli.ts が 2,000 行を下回った時点で本 slice の
  受入条件を満たす（残りは台帳へ残件として記録し、後続 slice に委ねる）。

## 2. 対象外

- コマンドの追加・削除・オプション変更・出力文言変更（挙動不変が不変条件）。
- `src/doctor/index.ts` / `src/state-db/projection-writer.ts` / `src/setup/index.ts` /
  `src/lint/version-up-readiness.ts` の分割（同台帳の別 slice）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): Step 1 → fence 確認 → Step 2 → fence 確認。
- step 2 (mode: serial): Step 3（集約と収束確認）。

## 4. 受入条件（falsifiable / 検証コマンド）

- `bun run src/cli.ts --help` の subcommand 一覧が分割前後で一致（diff 記録）。
- `bun run vitest run tests/cli-surface.test.ts` の pass/fail 集合が分割前と同一
  （分割前に fail しているテストの是正は本 PLAN の責務外。新規 fail ゼロ）。
- `bun run typecheck` / `bunx biome check` green、`wc -l src/cli.ts` < 2000。
- `bun run src/cli.ts doctor` に本 PLAN 起因の新規 fail なし。
- 実装着手時に `generates:` へ新設 module と test を追記する（draft 時点では本 PLAN md のみ。
  merged-plan-status gate の draft + 既存 deliverable fail-close 回避）。

## 5. carry（持ち越し）

- 分割後の各 `src/cli/commands/*.ts` への対応ユニットテスト新設（missing-test-oracle 削減）。
- doctor / projection-writer / setup / version-up-readiness の分割 slice。
