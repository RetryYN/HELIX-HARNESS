---
title: "proposal lane effort binding単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L7-649-proposal-lane-effort-binding.md
pair_artifact: docs/design/helix/L6-function-design/proposal-lane-effort-binding.md
---

# proposal lane effort binding単体テスト設計

対象は `src/team/launch-policy.ts` の `effortForLane` / `LANE_EFFORT_CEILING` と
`src/team/model-effort.ts` の `capEffort`。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-LANEEFF-001 | model 由来 | T1 lane へ `gpt-5.6-terra` / `gpt-5.4-codex` / `claude-haiku-4-5` を渡すと `medium` / `medium` / `low`。tier 固定実装ではすべて `xhigh` になり red | `tests/team-launch-policy.test.ts` |
| U-LANEEFF-002 | 上限のみ | T2 lane は model 標準が上でも `low` を超えない（`gpt-5.6-luna` でも `low`） | `tests/team-launch-policy.test.ts` |
| U-LANEEFF-003 | T0 上限 | T0 lane も model 由来で、上限 `high` を超えない（`gpt-5.6-luna` でも `high`） | `tests/team-launch-policy.test.ts` |
| U-LANEEFF-004 | 未知 model | 未知 model は安全側 `medium` へ解決し、なお tier 上限を受ける | `tests/team-launch-policy.test.ts` |
| U-LANEEFF-005 | freeze 伝播 | 本設計と L8 の design-catalog 登録が G3 freeze packet の digest へ伝播していることを固定する | `tests/l3-g3-freeze-packet-v2.test.ts` |
| U-LUNA-003 | 既存 pin | worker 既定 `gpt-5.6-luna` の T1 lane は `xhigh` のまま（本変更で退行しない） | `tests/team-launch-policy.test.ts` |

## 検出力の実測（mutation）

| 変異 | red になる oracle |
|---|---|
| tier 固定（旧実装）へ差し戻す | U-LANEEFF-001 / 003 / 004 |
| 上限適用を外す（model 標準をそのまま返す） | U-LANEEFF-002 / 003 / 004 |
| `capEffort` を恒等関数にする | U-LANEEFF-002 / 003 / 004 |
| T1 上限を `high` へ下げる | U-LUNA-003 |
| T2-mini 上限を `medium` へ緩める | U-LANEEFF-002 / 004 |
| T0 上限を `xhigh` へ緩める | U-LANEEFF-003 |

`U-LUNA-003` の green だけで新 oracle の失敗を相殺しない（Luna 単独 lane は tier 固定実装でも通る）。
