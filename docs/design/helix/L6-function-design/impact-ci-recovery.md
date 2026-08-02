---
title: "Impact CI Recovery機能設計"
layer: L6
kind: add-design
status: draft
created: 2026-08-01
updated: 2026-08-01
owner: Codex / TL
plan: docs/plans/PLAN-L6-92-impact-ci-recovery.md
parent_design: docs/design/helix/L5-detail/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
queue_id: L3Q-IT-024
---

# Impact CI Recovery機能設計

## 1. 純粋コア

`src/runtime/impact-ci.ts`はinventory validation、impact selection、exact partition、receipt validation、
percentile集計だけを担う。入力配列をcanonical sort/dedupし、shell commandを実行せず、filesystemやGitHubへ
直接アクセスしない。既存relation graphの結果はpath selector／relation node IDとして入力する。
`relationResolvedPaths`はtest consumerが解決したpathだけを表し、L5の`known_no_consumer` receiptとは別概念とする。

## 2. プロファイル振り分け

- draft PR: `draft_preflight`。mandatoryとimpact-selected testを実行する。
- Ready PR: `candidate_admission`。full exact setを一度実行する。
- main push: `post_merge_full`。full exact setを実行する。deferred回収receiptの生成・永続化は§4のとおり
  本PRでは未接続であり、後続のresult reporter接続で閉じる。
- `nightly_full`: selector／validatorは実装するが、本PRではschedule triggerを有効化しない。Issue #153の
  scheduled failure観測性と同じ運用ownerへ接続してからactivationする。

workflow、selector自身、security、permission、secret、schema、migration、DB、authority、lockfile、未知pathは
`fullAdmissionRequired=true`とする。changed testは必ずselectedへ入れ、source/designは同名testまたは明示relationが
解決できない限りunknownとしてfullへ倒す。

## 3. CLI／workflow境界

`helix ci impact-plan --profile ... --changed ...`はJSON decisionを返す。既存`harness-check` jobはdecisionから
`full`またはtest file exact listを受け取り、Draftだけ選択実行する。PLAN lint、canonical authority、typecheck、
DB rebuild、Biome、doctorは既存ownerのまま維持し、selectorへ複製しない。

full admissionでは、同一checkout内のworker数を増やしてはならない。repository rootへ一時生成物を書くtest同士が
distribution inventoryなどのread-only oracleへ混入するためである。代わりにtested HEADから2つのdetached worktreeを作り、
全test inventoryを、`cli-surface`とslow projectを直列実行するstateful lane、および残りのfast testを実行するbulk laneへexact partitionする。
2-core runner上で3 processを競合させず、stateful testのtimeoutを性能改善で偽装しない。各laneは
同じrepository-pinned `node_modules`をread-only参照し、filesystem stateは共有しない。2 laneのいずれかが非0、起動不能、
または完了不能なら集約stepをredにし、単一required checkと全test inventoryを維持する。

## 4. receipt

terminal receipt validatorはselected exact setとresult exact set、全exit 0、同じHEAD／inventory digest／profile／surfaceを
要求する。percentile calculatorは`profile + executionSurface + environmentDigest + cacheClass`の混在入力を拒否し、correctnessと
performance budgetを分離する。workflowからのper-item receipt生成・永続化、cancelled／superseded sampleの除外数記録、
candidate run IDとprofileの機械束縛はVitest result reporterとの接続が必要なため本PRでは未接続とし、成功の過大主張をしない。
