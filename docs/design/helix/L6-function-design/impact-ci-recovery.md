---
title: "Impact CI Recovery機能設計"
layer: L6
kind: add-design
status: draft
created: 2026-08-01
updated: 2026-08-27
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

full回帰をgreen完走したpull_request runだけが、head SHAとbase SHAを束縛した
`impact-ci-full-receipt` artifactを発行する。Draftの選択実行greenはfull判定でないため発行されない。
`ready_for_review`／`converted_to_draft`はPR状態遷移だけを表すeventであり、同一head SHAの
prior green run（conclusion success・現run除外）のreceiptが現在のcandidate headとbase tipの
両SHAに完全一致する場合に限り、全回帰stepはそのfull admissionを再利用してよい。照会失敗・
receipt欠落・SHA不一致はfail-closeして通常のfull実行へ戻り、再利用時はreused run idとtested headを
receiptとして残し、再利用したrunはreceiptを再発行しない。契約gate（PLAN lint、authority、typecheck、
DB rebuild、Biome、doctor）は再利用時も毎回実行する。

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

## 5. TypeScript compiler lazy-loader の共有境界（TS-LAZY-SHARED-001）

compiler を使わない CLI 経路の起動単価を維持するため、`typescript` の runtime load は
`src/shared/typescript-lazy.ts` の proxy 1件だけが担う。proxy 自体の import では実体を読まず、最初の
property access 時に `createRequire` でcompiler APIを解決する。lint owner の9 moduleと
requirements owner の `requirement-authority-gate.ts` はcanonical shared pathを直接 importする。

`src/lint/typescript-lazy.ts` は PLAN-RECOVERY-40 の confirmed artifact path を維持する re-export shim であり、
loader 実装を持たず、production importerも持たない。完全削除は typed retirement authority を伴う別sliceとする。
`src/lint/*.ts` の全fileをruntime到達性検査する `lint-wiring` には、このshimを理由付き
`DEFERRED_LINTS` として明示登録する。未登録の死蔵扱いも、canonical consumerが旧shimへ戻って
stale-deferredになる状態もfail-closeする。

source module policy は `requirements -> shared` のみを明示許可する。`requirements -> lint` と
`shared -> requirements` はdefault denyを維持し、共有utilityを理由に owner 間cycleや上位ownerへの逆依存を許さない。
契約oracleは `U-TSLAZY-001`（遅延load）・`U-TSLAZY-002`（唯一実装とconsumer exact set）・
`U-TSLAZY-003`（互換shimの理由付きdeferred分類）・`IT-SBOUND-007`（正負direction）で構成する。

## 6. Full regression job shard契約

`GH-NFR-010`／`GH-AC-017`のp95 3分目標へ近づけるため、同一2-core runner内のbackground process並列を
GitHub Actionsの独立jobへ移行する。workflowへpartition意味を埋め込まず、
`src/runtime/full-regression-shards.ts`のpure contractがtracked test inventoryを次へ分割する。

- `bulk-1`／`bulk-2`: `cli-surface`と`tests/slow/**`を除くfast testをpath digestで安定分割する。
- `stateful`: `tests/cli-surface.test.ts`と全slow testだけを保持する。

partitionはcandidate HEAD、base SHA、inventory digest、shard ID、kind、canonical file exact set、file digestへ
束縛する。全shardの和集合はtracked test inventoryと完全一致し、交差、欠落、余剰、空required shardを拒否する。
各runnerのreceiptは同じpartition digestと自身のfile digest、exit code、output digest、開始／完了時刻を持つ。
finalizeはreceipt exact setを再検証し、wrong HEAD／base／partition／files、nonzero、欠落、重複をfail-closeする。

本pure contractはtest実行、filesystem列挙、GitHub API、artifact uploadを行わない。workflow job配線、cancel／timeout、
post-test DB rebuild／doctor、実runのwall-clock計測はIssue #1071が所有する。

| oracle ID | 設計上の観測点 |
|---|---|
| `U-FULLSHARD-001` | 入力順非依存のbulk 2件＋stateful安定partition |
| `U-FULLSHARD-002` | inventory exact union、交差／欠落／余剰0 |
| `U-FULLSHARD-003` | inventory／partition／shard fileの正規digest |
| `U-FULLSHARD-004` | CLI／slow stateful固定とbulk補集合 |
| `U-FULLSHARD-005` | receiptのHEAD／base／partition／shard／files exact binding |
| `U-FULLSHARD-006` | receipt exact set、exit 0、時刻妥当性 |
