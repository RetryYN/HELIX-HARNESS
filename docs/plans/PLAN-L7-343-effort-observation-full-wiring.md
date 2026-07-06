---
plan_id: PLAN-L7-343-effort-observation-full-wiring
title: "PLAN-L7-343 (impl): 駆動モデル effort 完全配線 — 観測供給・codex effort フラグ・pair-agent effort 付与で下位モデルの実行品質を底上げ"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-310 (effort registry) / PLAN-L7-311 (selectTeamModel 配線) で確定済みの設計を runtime 全経路へ行き渡らせる実装ギャップ埋め。新規 L1/L3 要求は追加しない。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/effort-observation.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE (Sonnet) - observation 供給・adapter flag・pair-agent effort の実装"
  - role: tl
    slot_label: "TL - effort ladder の決定論性と provider CLI 互換の境界レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-343-effort-observation-full-wiring.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/loop-effort-budget.ts
    artifact_type: source_module
  - artifact_path: src/team/run.ts
    artifact_type: source_module
  - artifact_path: src/runtime/adapter-policy.ts
    artifact_type: source_module
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/pair-agent.ts
    artifact_type: source_module
  - artifact_path: tests/effort-observation.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-311-model-effort-runtime-wiring.md
  requires:
    - docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
    - docs/plans/PLAN-L7-311-model-effort-runtime-wiring.md
  references:
    - docs/plans/PLAN-L6-51-effort-observation.md
    - docs/plans/PLAN-REVERSE-214-loop-effort-budget.md
    - docs/plans/PLAN-L7-309-fe-roster-orchestration.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T23:59:00+09:00"
    tests_green_at: "2026-07-06T23:59:00+09:00"
    verdict: approve
    scope: "doctor merged-plan-status が draft の既存 generated deliverable 列挙を fail-close したため、PLAN を archive せず confirmed に正規化した。implementation は本 PLAN の受入条件に従って後続 slice で実施する。"
    worker_model: claude-fable
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-06T23:59:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:5e3992a3efde53826f9f417bcd54e78fb45b4eb1012abb973bc01eb427ea14ba"
---

# PLAN-L7-343 (impl): 駆動モデル effort 完全配線

## 0. 目的（下位モデルで Mythos 級の実行品質を引き出す）

PLAN-L7-310/311 で「モデル別標準 effort + shallow/tooSlow 適応」の registry と
`selectTeamModel` 配線は確定したが、2026-07-06 の検査で runtime 全経路のうち **3 箇所が未配線**
であることを確認した。effort ladder が実際の実行に届かない限り、Sonnet/Haiku/spark など下位モデルは
CLI 既定の浅い挙動のまま実行され、「浅ければ一段上げる」PO ルール (2026-07-04) が機能しない。

検査で確認したギャップ（証拠は 2026-07-06 時点の行番号。実装時は関数名で再特定すること）:

- **G1: observation 未供給** — `selectTeamModel()` (`src/team/model-policy.ts:199`) は
  `observation: {shallow, tooSlow}` を受けて 1 段適応する設計だが、唯一の呼び出し元
  `buildTeamRunPlan()` (`src/team/run.ts:316` 付近) が `observation` を渡していない。
  結果 `effort_source` は常に `"standard"` で、実行中に effort が動く経路が存在しない。
- **G2: codex provider に effort フラグ欠落** — `buildAdapterPlan()` (`src/runtime/adapter.ts:385`
  付近) は claude には `CLAUDE_EFFORT_FLAG` を付与するが、codex 分岐の args 構築には
  正規化済み `effort` 変数が一切使われず捨てられている（`src/runtime/adapter-policy.ts` に
  codex 用 effort flag 定義が無い）。gpt-5.4/5.5 委譲は codex CLI 既定 effort のまま。
- **G3: pair-agent が effort ladder をバイパス** — TDD ペアループ (`src/orchestration/pair-agent.ts`)
  は `smartModel`/`lightModel` で model のみ固定選択し、`buildPairAgentAdapterPlans`
  (同 `:343` 付近) の `buildAdapterPlan` 呼び出しに `effort` を渡さない。

## 1. スコープ（Sonnet 実装手順）

### Step 1: codex effort フラグ (G2) — 独立・最小

1. `src/runtime/adapter-policy.ts` に追加:
   `export const CODEX_EFFORT_FLAG = "-c";`
   `export const CODEX_EFFORT_CONFIG_KEY = "model_reasoning_effort";`
2. `src/runtime/adapter.ts` の codex args 構築（`isCodex` 分岐、`CODEX_MODEL_FLAG` 挿入箇所の直後）に
   `...(effort ? [CODEX_EFFORT_FLAG, `${CODEX_EFFORT_CONFIG_KEY}=${effort}`] : [])` を挿入する。
   `effort` は既存の `normalizeProviderEffort` 結果を使う（新規正規化を作らない）。
3. テスト `tests/effort-observation.test.ts` に
   `U-EFF-001: codex intent.effort=high が args に -c model_reasoning_effort=high として現れる`、
   `U-EFF-002: effort 未指定の codex intent には effort 関連 args が追加されない` を追加。
   既存 adapter テスト（`grep -l buildAdapterPlan tests/` で特定）が args 配列を厳密比較して
   いる場合は期待値を更新する。

### Step 2: pair-agent への標準 effort 付与 (G3)

1. `src/orchestration/pair-agent.ts` の agent 定義生成（`buildPairAgentTddPlan` 付近、
   `smartModel`/`lightModel` を割り当てる箇所）で、各 agent/phase に
   `effort: standardEffortForModel(model)`（`src/team/model-effort.ts` から import）を付与する。
2. `buildPairAgentAdapterPlans` の `buildAdapterPlan({...})` 呼び出しに `effort: agent.effort` を渡す。
3. テスト:
   `U-EFF-003: light 実装 phase の adapter plan に model 標準 effort（haiku=low / spark=low）が設定される`、
   `U-EFF-004: smart review phase は opus/frontier の標準 high が設定される`。

### Step 3: 観測 (shallow/tooSlow) の供給 (G1)

1. `src/orchestration/loop-effort-budget.ts` に純関数を追加:
   ```ts
   export interface EffortObservationInput {
     verdictFail?: boolean;        // 直前 review verdict が fail
     outputChars?: number;         // 直前 transcript 出力長
     truncated?: boolean;          // boundedTranscriptOutput で切られたか
     elapsedMs?: number;           // 直前 phase 所要時間
   }
   export function deriveEffortObservation(input: EffortObservationInput): EffortObservation
   ```
   判定規則（決定論・閾値は named constant で同ファイル先頭に定義）:
   - `shallow = verdictFail === true || (outputChars !== undefined && outputChars < SHALLOW_OUTPUT_CHARS_MIN)`
     （`SHALLOW_OUTPUT_CHARS_MIN = 400` を初期値とする）
   - `tooSlow = truncated !== true && elapsedMs !== undefined && elapsedMs > TOO_SLOW_ELAPSED_MS`
     （`TOO_SLOW_ELAPSED_MS = 600_000` を初期値とする）
   - 両方 true になる入力はそのまま両方 true で返す（打ち消しは `adaptReasoningEffort` 側の既存
     規則「矛盾は維持」に委ねる。ここで独自の優先順位を作らない）。
2. `src/team/run.ts` の `buildTeamRunPlan` member ループで、呼び出し側から渡せる
   `observations?: Record<string, EffortObservationInput>`（key = member.role）を options に追加し、
   ある場合のみ `selectTeamModel({..., observation: deriveEffortObservation(obs) })` として渡す。
   観測が無い member は現行どおり standard（後方互換：既存呼び出しは無変更で通る）。
3. `src/orchestration/loop-bridge.ts` のループ tick で、前サイクルの transcript/verdict から
   `EffortObservationInput` を組み立てて次サイクルの `buildTeamRunPlan` に渡す配線を追加する。
   transcript 出力長・truncation は `pair-agent.ts` の `boundedTranscriptOutput` と同じ情報源を使う。
4. テスト:
   `U-EFF-005: verdictFail=true で shallow=true`、
   `U-EFF-006: outputChars=100 で shallow=true / 4000 で false`、
   `U-EFF-007: elapsedMs 超過で tooSlow=true`、
   `U-EFF-008: observations 供給時に effort_source が adaptive になり standard から 1 段動く`、
   `U-EFF-009: observations 無しの既存呼び出しは standard のまま（後方互換）`。

## 2. 対象外

- LLM による shallow 判定（本 PLAN は決定論ヒューリスティクスのみ。意味的な浅さ判定は将来 PLAN）。
- 閾値の自動チューニング（初期値は named constant。運用観測後に別 PLAN で調整）。
- `loop-effort-budget.ts` の既存「実行量予算」ロジックの変更（reasoning effort とは別軸、触らない）。
- provider API 直呼び・課金・認証・秘密情報への変更なし。

## 3. スケジュール（schedule steps）

- step 1 (mode: parallel): Step 1 (codex flag) と Step 2 (pair-agent effort) — 相互依存なし、並列可。
- step 2 (mode: serial): Step 3 (observation 供給) — Step 1/2 の adapter 期待値確定後に実施。
- step 3 (mode: serial): 統合検証（`bun run typecheck` / 対象テスト / `helix doctor`）。

## 4. 受入条件（falsifiable / 検証コマンド）

- `bun run vitest run tests/effort-observation.test.ts` green（U-EFF-001..009 全件）。
- `bun run typecheck` green。
- `bun run vitest run tests/team-run.test.ts tests/model-effort.test.ts` green（既存回帰なし。
  team-run 系テストのファイル名が異なる場合は `grep -rl buildTeamRunPlan tests/` で特定して実行）。
- `bun run src/cli.ts doctor` が本 PLAN 起因の新規 fail を出さない。

## 5. carry（持ち越し）

- shallow/tooSlow の意味的判定（reviewer verdict のテキスト解析・LLM 判定）は後続。
- 閾値定数の実測ベース調整（telemetry `drive_firing_rate` 等との突合）は後続。
