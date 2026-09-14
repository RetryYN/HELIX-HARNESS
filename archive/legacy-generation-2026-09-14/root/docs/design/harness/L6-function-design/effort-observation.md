---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-51-effort-observation.md
---

> **L6 contract marker**: `deriveEffortObservation(input: EffortObservationInput) => EffortObservation` は unit-test 粒度の contract。pre: input は全フィールド optional。post: 決定論（同一入力→同一出力）で LLM 呼び出しを含まない。invariant: shallow/tooSlow の打ち消し優先順位を本関数で作らない（`adaptReasoningEffort` の「矛盾は維持」規則に委ねる）。

# effort 観測供給と全経路配線 — 機能設計

## §1 範囲

PLAN-L7-310（標準 effort registry + 適応関数）/ PLAN-L7-311（`selectTeamModel` 配線）で確定した
effort ladder を、runtime の全実行経路へ行き渡らせる。2026-07-06 検査で確認した未配線 3 箇所
（G1: observation 未供給、G2: codex provider の effort フラグ欠落、G3: pair-agent の effort バイパス）
を閉じる。registry・適応規則そのものは変更しない（L7-310 の設計を再利用）。

## §2 関数 / 定数 contract

| 対象 | contract |
|---|---|
| `deriveEffortObservation(input)` (`src/orchestration/loop-effort-budget.ts` 新設) | `{verdictFail?, outputChars?, truncated?, elapsedMs?}` から `{shallow?, tooSlow?}` を決定論導出。`shallow = verdictFail===true \|\| outputChars < SHALLOW_OUTPUT_CHARS_MIN`。`tooSlow = truncated!==true && elapsedMs > TOO_SLOW_ELAPSED_MS`。両立時は両方 true のまま返す。 |
| `SHALLOW_OUTPUT_CHARS_MIN = 400` / `TOO_SLOW_ELAPSED_MS = 600_000` | named constant（同ファイル先頭）。初期値は運用観測前の暫定で、調整は telemetry 突合の後続 PLAN。 |
| `buildTeamRunPlan(..., observations?)` (`src/team/run.ts`) | `Record<role, EffortObservationInput>` を optional 受領。該当 member のみ `selectTeamModel({..., observation})` へ供給。未供給 member は現行どおり standard（後方互換: 既存呼び出し無変更で通る）。 |
| `CODEX_EFFORT_FLAG = "-c"` / `CODEX_EFFORT_CONFIG_KEY = "model_reasoning_effort"` (`src/runtime/adapter-policy.ts` 新設) | codex 委譲 CLI に effort を届ける。`buildAdapterPlan` codex 分岐で `effort` があるときのみ `-c model_reasoning_effort=<effort>` を args に追加。 |
| pair-agent effort 付与 (`src/orchestration/pair-agent.ts`) | 各 agent/phase に `standardEffortForModel(model)` を付与し `buildPairAgentAdapterPlans` の `buildAdapterPlan` へ `effort` を渡す。model 選択ロジック（smart/light 固定）は変更しない。 |

## §3 Runtime 挙動

- ループ経路（`src/orchestration/loop-bridge.ts`）は前サイクルの transcript/verdict から
  `EffortObservationInput` を構成し、次サイクルの `buildTeamRunPlan` へ渡す。
  情報源は `boundedTranscriptOutput` と review verdict の既存データのみ（新規収集なし）。
- `effort_source` は observation 供給時のみ `"adaptive"` になり得る。既存の explicit override
  （agent frontmatter `effort:` / member.effort）は引き続き最優先（L7-311 の優先順位を変えない）。
- fail 挙動: observation の構成に失敗した場合は observation なし（standard）で続行する
  （effort 適応は品質最適化であり、実行を block しない fail-open）。

## §4 Test oracle 設計

Covered by `tests/effort-observation.test.ts`:

| ID | oracle |
|---|---|
| U-EFF-001 | codex intent.effort=high → args に `-c model_reasoning_effort=high` |
| U-EFF-002 | effort 未指定 codex intent → effort args なし |
| U-EFF-003 | light 実装 phase に model 標準 effort（haiku/spark=low） |
| U-EFF-004 | smart review phase に opus/frontier 標準 high |
| U-EFF-005 | `verdictFail=true` の入力で shallow 判定が true になる |
| U-EFF-006 | `outputChars=100` では shallow 判定が true、`4000` では false になる |
| U-EFF-007 | elapsedMs 超過 → tooSlow=true |
| U-EFF-008 | observations 供給 → effort_source=adaptive で 1 段適応 |
| U-EFF-009 | observations なし → standard（後方互換） |
