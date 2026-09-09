---
title: "CLI-R00 throughput baseline 機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-09
updated: 2026-09-09
owner: Cursor / TL
plan: docs/plans/PLAN-L7-1687-cli-r00-throughput-baseline.md
pair_artifact: docs/test-design/helix/L8-cli-r00-throughput-baseline-unit-test-design.md
github_issue_id: 1687
behavior_contract_id: CLI-R00-THROUGHPUT-BASELINE-001
---

# CLI-R00 throughput baseline 機能設計

## 1. 目的と境界

本設計は Issue #1687 の **CLI-R00** だけを扱う。`src/cli.ts` の責務分割に着手する前に、
throughput指標の測定可能／測定不能を分け、同一条件で再計測できるrepo-owned artifactと
collectorを固定する。

本sliceは次を行わない。

- `src/cli.ts` の実装変更、CLI command／option／exit code／出力契約の変更
- Requirement／Policy／workflow identity／fail-close／review／CI gateの意味変更または緩和
- CLI-R01以降のinventory、command抽出、renderer集約、composition freeze
- 検証・oracle・receiptを減らした結果を高速化として扱うこと

計測用の観測責務はsemantic pathへ混ぜない。collectorは `src/runtime/cli-r00-throughput-baseline.ts`
のpure functionであり、CLI command登録やGitHub／filesystem／clockへ依存しない。
frozen artifactの読込と再計測コマンド実行はtest／運用手順側のadapterとする。

## 2. 公開関数

| 関数 | 入力 | 出力 | 責務 |
|---|---|---|---|
| `cliR00MetricDefinitions` | なし | Issue #1687の13指標定義 | 測定可能／proxy／測定不能の正本分類 |
| `collectCliR00StructuralSnapshot` | source_head／cli bytes／source／workflow source | 構造snapshot | fan-out／collision proxyを決定的に再抽出。Gitは呼ばない |
| `validateCliR00BaselineArtifact` | 未信頼JSON | okとartifact、またはfailure code | exact keyと分類契約をfail-close |
| `compareCliR00Observation` | baselineとcandidate | comparable／delta／failure | 同一条件以外の比較を拒否。unmeasurableは`unmeasurable_not_comparable` |
| `remesureCliR00StructuralProxies` | frozen artifactとsource_head snapshot | failure list | `snapshot.source_head`がartifactと異なる、または構造proxyがblobと違うと拒否 |

## 3. 指標分類

Issue本文の指標を過不足なく所有する。欠落も余剰も拒否する。

| 指標 | 観測 | 単位 | 再計測の正本 |
|---|---|---|---|
| `CI_WALL_CLOCK` | measured | seconds | 同一`harness-check`成功runの`startedAt`→`updatedAt` |
| `FULL_REGRESSION_WALL_CLOCK` | measured | seconds | 同一runのpreflight開始→finalize完了。reuse未起動は除外 |
| `TARGETED_TEST_WALL_CLOCK` | measured | milliseconds | 同一Node majorでの`tests/cli-r00-throughput-baseline.test.ts` |
| `CLI_COMMAND_STARTUP_TIME` | measured | milliseconds | 同一Node versionでの`tsx src/cli.ts --version` 複数sample |
| `CI_RERUN_COUNT` | unmeasurable | count | PR episode窓を先に固定しない単一HEADでは母集団を作れない |
| `FULL_REGRESSION_INVOCATION_COUNT` | measured | count | 対象runでfull shardが起動したなら1。shard数は数えない |
| `REVIEW_RECEIPT_REGEN_COUNT` | unmeasurable | count | receipt再発行の第一級ledgerが無い |
| `CHANGED_FILE_FAN_OUT` | proxy | files | `source_head` blob上でcommand family変更が必ず含む実装file数。現行は`src/cli.ts`の1 |
| `CHANGED_SYMBOL_FAN_OUT` | proxy | symbols | 同一`source_head` blobを共有するtop-level command family数 |
| `DIFF_BYTES` | proxy | bytes | `artifact.source_head`の`src/cli.ts` blobのUTF-8 byte長をreview下限とする |
| `REVIEW_CONTEXT_BYTES_OR_TOKENS` | proxy | bytes | 同上bytesを正本とする。tokenは`ceil(bytes/4)`の見積もり |
| `BASE_SYNC_COUNT` | unmeasurable | count | base syncは過程量であり単一treeから固定できない |
| `MERGE_CONFLICT_OR_SHARED_FILE_COLLISION_COUNT` | proxy | families | 共有file collision class size。同時open PR数を代入しない |

GitHub上で直接観測できない指標は測定不能と明示するか、shared-file collision等の
再現可能なproxyだけを定義する。historical noteは測定値へ昇格しない。

## 4. 同一条件

比較は次のcondition軸が完全一致する場合だけ許可する。

```text
schema_version / metric_id / observability / environment
collection_recipe_id / source_head / workflow_id / workflow_run_id
command_argv / test_paths / node_version / runner_os
```

local_processとgithub_actionsを混ぜない。この禁止は指標ごとの`compareCliR00Observation`が担う。
artifact全体のenvironment集合検査は2値enumでは到達不能なので持たない。
Node versionが違うstartup sampleを同一系列へ入れない。
異なるHEADのCI wallはhistorical noteであり、同一条件sampleではない。
構造proxyの再計測入力は`artifact.source_head`のblobだけとする。checkout中の`src/cli.ts`を
test oracleへ結合しない。live treeとの突合はR07の運用手順へ残す。
測定不能指標の数値delta比較は`unmeasurable_not_comparable`で拒否する。
proxyをmeasuredへ読み替えた比較も拒否する。

単発runの偶然を高速化判定に使わない。変動が大きいmeasured指標はsampleとp50/p95を残す。
時間そのものをtest oracleの合否閾値にしない。

## 5. artifact

正本pathは `config/cli-r00-throughput-baseline.v1.json`。schemaは
`helix-cli-r00-throughput-baseline.v1`。未知key、短縮HEAD、catalogと異なる観測分類、
Issue指標の欠落／順序変更をfail-closeする。

supporting_contextは補助観測であり、Issue指標の欠落を補完してgreenにしない。
token見積もりと2026-09-09時点の並行PR実測はここに隔離する。

## 6. 非対象

R01のsymbol inventory、R02以降のcommand抽出、新しいCLI command、doctor gateの追加、
design-catalog以外のauthority意味変更、既存testの削除は後続sliceとする。
本sliceのgreenを#1687全体の完了として扱わない。
