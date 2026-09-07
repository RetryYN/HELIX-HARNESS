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

`running → completed`、`running → child_completed → tree_drain → term_sent → kill_sent? → reaped`、`running → deadline_exceeded → term_sent → kill_sent? → reaped`、または`running → wrapper_interrupted → term_sent → kill_sent? → reaped`とする。direct childが期限内に正常終了した場合は`timed_out`へ読み替えず、短いdrain後も残るtreeを`tree_lingered`として回収する。deadline値はcallerの別定数ではなくpacketの`budget.time_ms`から導出する。

## OS境界

- POSIXはproviderを専用process groupで起動し、group全体を停止する。
- wrapperが`SIGINT`、`SIGTERM`、`SIGHUP`を受けた場合は同じ停止sequenceをprovider process groupへ適用する。cleanup中の同一・別signal再送は冪等に吸収し、treeのreap完了前にNode既定動作へ戻さない。wrapper終了時にも同期的な`SIGKILL` fenceを置き、provider treeだけが残る状態を許可しない。bounded reapが失敗した場合はexit fenceを保持する。
- Windowsはprocess treeを停止できるadapterを使用する。direct childだけのkillを成功扱いしない。
- unsupportedなOSでは無期限実行へfallbackせずfail-closeする。

## 出力

通常のstatus/signal/errorに加え、`timed_out`、`tree_lingered`、`interrupted_by`、`deadline_ms`、`termination_stage`、`duration_ms`、`reaped`を返す。`reaped=true`はdirect childのcloseだけでなく、対象treeの停止処理が終端したことを表す。割込み時のCLI終了codeはshell慣例どおり`SIGHUP=129`、`SIGINT=130`、`SIGTERM=143`へ投影する。停止とreap確認にはworker budget後も最大`TERMINATION_GRACE_MS + REAP_CONFIRMATION_MS`のbounded cleanup時間を使用できる。

## terminal admission

provider-neutralな`classifyProviderProcessTerminal`を唯一の成功判定とする。成功は
`status=0`、deadline未超過、残存treeなし、wrapper割込みなし、reap完了、lifecycle errorなしの
論理積である。direct CLIのconsult receipt、`PostToolUse`、terminal JSON、process exitと、
team compatibility facadeは同じ判定結果を消費する。providerが停止signalを捕捉してexit 0を
返しても、timeout・残存tree・割込み・未reapを成功へ昇格しない。

## team互換アダプター

`team run --execute`はmember adapterを再検証した後、同じprocess lifecycleへ委譲する。
deadlineはsealed packetの`budget.time_ms`だけから取得する。出力captureはboundedとし、
切捨て後も実観測byte数とterminal lifecycle fieldsを保持する。member adapterの返却契約では
`timed_out`、`deadline_ms`、`termination_stage`、`signal`、`duration_ms`、`reaped`を必須とし、
欠落、型不一致、packet budgetとのdeadline不一致、timeout、または未reapを成功へ投影しない。
`PostToolUse`を含む観測eventも同じterminal判定を使用し、`status=0`だけでtimeout済みprocessを
成功として記録してはならない。

この接続は旧team実行engineの延命authorityではない。process lifecycleは正規worker runtimeを
唯一のownerとし、team側は明示的なcompatibility facadeから呼ぶ。slot・順序・共有状態の恒久的な
所有は後継Assignment／Lease／Work Graphへ移管し、旧team engineのconsumer 0確認後に退役する。
