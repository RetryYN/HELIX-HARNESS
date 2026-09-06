---
title: "CI event-class concurrency generation 要件差分候補"
status: draft_candidate
canonical_layer: L3
canonical_pair: L10
plan: PLAN-L3-93-ci-event-concurrency-generation
refines:
  - CIS-R-01
  - CIS-R-02
  - CIS-R-12
  - CIS-R-13
---

# CI event-class concurrency generation 要件差分候補

## CIG-R-01 型付きevent generation identity

CI eventを最低限`pull_request`、`main_push`、`schedule`、`workflow_dispatch`へ分類し、repository、workflow、
event class、PR identity、ref、candidate/base/before HEAD、run ID、attemptからgeneration identityを決定的に
生成する。payload不足、unknown event、wrong HEAD／attemptは暗黙補完せずfail-closeまたは明示DEGRADEDとする。

## CIG-R-02 非干渉と有界置換

`main_push`、`schedule`、`workflow_dispatch`、別PRは相互にcancelしない。同一PRのnewer HEADはそのPRのstale
HEADだけを置換でき、newer scheduleはolder scheduleだけを置換できる。`cancel-in-progress:false`だけによる
無制限並走を代替実装にしない。

## CIG-R-03 正規main引継ぎ

newer main pushがolder main pushをsupersedeできるのは、older HEADがcurrent mainでないこと、新current HEADの
generation確保、required obligationのhandoff receipt、terminal read-afterを検証できる場合だけとする。
GitHub native concurrencyはevent class間の粗い隔離に限定し、状態依存cancelを単独で決定しない。

## CIG-R-04 証拠・telemetry・replay収束

receiptへgeneration ID、event class、repository、workflow、ref、HEAD群、run／attempt、supersedes、cancel
actor/class/reason、handoff、terminal read-afterを束縛する。cancelled runをpost-main completion、terminal green、
deferred recovery success、review receiptへ採用しない。aggregate、doctor、telemetry、DB replayは同じgeneration
digestへ収束し、same HEADでも証明義務の同値性が証明されない別event classの結果を流用しない。

## 既存責務の再利用

- #908のbounded cancel providerを再利用し、別cancel実行authorityを作らない。
- CIS-R-01〜03のtelemetry identity、CIS-R-12のbounded cancellation、CIS-R-13のdeferred recoveryを拡張する。
- #1106/#1137のWindows lease、#538のreceipt失効、#848/#1322の監査内容を再実装しない。

本候補は人間承認、独立技術review、canonical promotionまでcurrent authorityではなく、workflow/runtime/DBを
先行変更しない。
