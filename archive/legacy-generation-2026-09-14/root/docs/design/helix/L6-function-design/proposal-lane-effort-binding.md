---
title: "proposal lane effort binding機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-22
updated: 2026-08-22
owner: Claude / TL
plan: docs/plans/PLAN-L7-649-proposal-lane-effort-binding.md
pair_artifact: docs/test-design/helix/L8-proposal-lane-effort-binding-unit-test-design.md
github_issue_id: 881
behavior_contract_id: PROPOSAL-LANE-EFFORT-MODEL-BINDING-001
responsibility_owner: proposal-lane-effort-binding
---

# proposal lane effort binding機能設計

## 責務

proposal subagent lane の reasoning effort を、**lane に載る model と束縛して**導出する。
effort の authority は model であり、lane tier はその**上限**としてのみ働く。

## 背景（実測）

`effortForLane` は tier だけで effort を返し、member 組み立ては `model: lane.model` と
`effort: effortForLane(lane)` を**別経路**で行っていた。その結果、T1 lane に何を載せても `xhigh` になる。

```
T1-worker lane model=gpt-5.6-luna       → xhigh   （model 標準 xhigh、一致）
T1-worker lane model=gpt-5.6-terra      → xhigh   （model 標準 medium、乖離）
T1-worker lane model=gpt-5.4-codex      → xhigh   （model 標準 medium、乖離）
T1-worker lane model=claude-haiku-4-5   → xhigh   （model 標準 low、乖離）
```

`gpt-5.6-terra` は `luna-worker-model-registry.md` が「current worker fallback へ戻さない」と
明示している model であり、それが T1 lane に載ると `xhigh` で起動していた。

既存 oracle `U-LUNA-003` は `gpt-5.6-luna` の lane しか渡さないため、実装を model 由来へ
差し替えても通る（変異が survive する）。「Luna だから xhigh」なのか「T1 だから xhigh」なのかが
固定されていなかった。

## §1 責務境界

| 関数 | 責務 |
|---|---|
| `standardEffortForModel(model)` | **effort の authority**。exact 上書き → family 既定 → `medium` fallback で model の標準 effort を解く |
| `capEffort(effort, ceiling)` | ladder 上で上限を適用する純関数 |
| `effortForLane(lane)` | 上 2 つの合成。tier から上限を引き、model 標準 effort へ適用する |

以前は `effortForLane` と `standardEffortForModel` が**独立に**effort を決めており、
どちらが authority か決まっていなかった。本設計はそれを `standardEffortForModel` に一本化する。

## §2 lane tier 上限

```
T2-mini     : low
T2-spark    : low
T1-worker   : xhigh
T0-frontier : high
```

## §3 判定関数（DbC）

### `capEffort(effort, ceiling): ReasoningEffort`

- **Precondition**: どちらも `low | medium | high | xhigh`。
- **Postcondition**: ladder 順で `effort <= ceiling` ならそのまま、超えるなら `ceiling` を返す。
- **Invariant**: 上限を上へ押し上げない（下限として働かせない）。

### `effortForLane(lane): ReasoningEffort`

- **Precondition**: `lane.model` と `lane.tier` を持つ proposal lane。
- **Postcondition**: `capEffort(standardEffortForModel(lane.model), LANE_EFFORT_CEILING[lane.tier])`。
- **Invariant**: 未知 model は `standardEffortForModel` の安全側 `medium` を経由し、なお tier 上限を受ける。

## §4 現行 projection への影響

worker 既定が `gpt-5.6-luna`（標準 `xhigh`）である限り、T1 の投影値は `xhigh` のままである。
変わるのは**その値の根拠**で、tier 由来の固定値ではなく model 由来の結果になる。
既定 model が変わったときに effort が追従し、乖離が oracle で検出される。
