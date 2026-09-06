---
title: "Worker Budget Lifecycle 設計"
status: draft
plan_id: PLAN-RECOVERY-1601-worker-deadline
parent_requirement: docs/design/helix/L3-requirements/worker-context-boundary-compiler.md
pair_artifact: docs/test-design/helix/L8-worker-budget-lifecycle.md
---

# Worker Budget Lifecycle 設計

## 責務

admitted `WrapperLaunchExecution`のsealed contextから実行時間上限を取得し、provider process treeの生成から終了・回収までを単一lifecycleとして扱う。

## 状態

`running → completed`、`running → deadline_exceeded → term_sent → kill_sent? → reaped`、または`running → wrapper_interrupted → term_sent → kill_sent? → reaped`とする。deadline値はcallerの別定数ではなくpacketの`budget.time_ms`から導出する。

## OS境界

- POSIXはproviderを専用process groupで起動し、group全体を停止する。
- wrapperが`SIGINT`、`SIGTERM`、`SIGHUP`を受けた場合は同じ停止sequenceをprovider process groupへ適用する。wrapper終了時にも同期的な`SIGKILL` fenceを置き、provider treeだけが残る状態を許可しない。
- Windowsはprocess treeを停止できるadapterを使用する。direct childだけのkillを成功扱いしない。
- unsupportedなOSでは無期限実行へfallbackせずfail-closeする。

## 出力

通常のstatus/signal/errorに加え、`timed_out`、`interrupted_by`、`deadline_ms`、`termination_stage`、`duration_ms`、`reaped`を返す。`reaped=true`はdirect childのcloseだけでなく、対象treeの停止処理が終端したことを表す。
