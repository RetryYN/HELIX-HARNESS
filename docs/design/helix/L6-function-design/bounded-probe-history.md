---
title: "bounded probe履歴 機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-17
updated: 2026-08-17
owner: Codex / TL
plan: docs/plans/PLAN-L7-582-bounded-probe-history.md
pair_artifact: docs/test-design/helix/L8-bounded-probe-history-unit-test-design.md
---

# bounded probe履歴 機能設計

## 1. 公開関数

| 関数 | 契約 |
|---|---|
| `admitBoundedProbePlan` | strict schema、allowlist、registry／HEAD／dataset一致を確認 |
| `runBoundedProbe` | port resultをdeadline、sample、resource、statusで再検証 |
| `appendBoundedProbeRun` | event digestを生成し、head CASと履歴insertを一transactionで実施 |
| `replayMeasurementHistory` | sequence、前event digest、event digest、head一致を再検証 |

## 2. eventの意味

`passed`だけを`quality=measured`とし、`insufficient`は`unknown`、`failed`／`timed_out`は`failed`
とする。resultが失敗系の場合はvalueをnullに固定し、失敗を測定値で覆い隠さない。

同一run IDでplanまたはresult digestが変わった再送は`history_conflict`、headの前event digestやsequenceが
変わった並行書込は`history_head_conflict`としてrollbackする。既存eventを更新・削除するAPIは提供しない。

## 3. 実行器port

portの入力はtyped planだけであり、`command`、`args`、`cwd`、DB path、secret、network URLを持たない。
allowlistへ登録されていないprobe IDはschema admissionで拒否する。実際のprobe実装を追加する場合も、
ID、resource enforcement、network deny、credential none、negative oracleを同一sliceで追加する。
---
