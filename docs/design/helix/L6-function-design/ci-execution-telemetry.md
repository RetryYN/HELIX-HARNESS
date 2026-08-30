---
title: "CI execution telemetry 機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
plan: docs/plans/PLAN-L7-704-ci-execution-telemetry.md
pair_artifact: docs/test-design/helix/L8-ci-execution-telemetry-unit-test-design.md
related_l3: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
---

# CI execution telemetry 機能設計

## 1. 目的と責務境界

`CiExecutionTelemetryEventV1` は、CIの実行事実を job、step、test、setup、artifact transfer の独立した
cost node として記録可能にする。実行事実は candidate HEAD、base HEAD、source HEAD、workflow/run/attempt、
runner、時刻、結果、入力／出力digestへ束縛する。

本機能は計測データの正規化、構造検証、決定的なread model投影だけを担う。GitHub API、runner、shell、
filesystem、DB、Issue／PLAN／Requirement authorityへの書込みは行わない。raw log、stdout、stderr、
credential、secret、PIIは入力・出力のいずれにも保持しない。

既存の `src/runtime/impact-ci.ts` は検証義務の選定と既存profile receiptを所有し、
`src/runtime/full-regression-shards.ts` はtest inventoryのpartitionを所有する。本機能はそれらの実行事実を
後から受け取る境界であり、選定・shard・scheduler・workflowを再実装しない。

## 2. 公開関数

| 関数 | 入力 | 出力 | 責務 |
|---|---|---|---|
| `createCiExecutionTelemetryEvent` | digest以外のtyped event | `CiExecutionTelemetryEventV1` | schema version、依存順、payload/evidence digestを決定的に付与 |
| `validateCiExecutionTelemetryEvent` | 未信頼なevent | `ok/errors` | strict key、identity、runner、時刻、結果、secret境界を検証 |
| `validateCiExecutionTelemetryBatch` | 一つのrun/attemptのevent集合 | `ok/errors` | context、event/node ID、依存DAG、cycleを検証 |
| `projectCiExecutionTelemetry` | 複数run/attemptのevent集合 | projectionまたはerrors | critical path、重複setup、failure、retry、flake、p50/p95/p99を投影 |

## 3. event契約

`schema_version` は `helix-ci-execution-telemetry.v1` に固定する。`verification_identity` はtest file名に
依存しないstable identityとし、shard移動やrenameで履歴を切断しない。`node_id` は一つのrun/attempt内の
実行nodeを一意に識別し、retryやrerunは新しいrun/attemptのeventとして保持する。

必須のidentityは次である。

```text
event_id / node_id / node_kind / verification_identity / operation
profile / execution_surface
source_head / base_head / candidate_head
workflow_id / run_id / attempt
runner.os / runner.architecture / runner.node_version
runner.toolchain_digest / runner.environment_digest
```

`source_head` と `candidate_head` は一致しなければならない。runner OS、architecture、Node version、
toolchain digest、environment digestはeffective execution environmentとして保持する。unknown runner、
不正HEAD、別sourceのeventはadmissionを通さない。

`operation` は `checkout`、`dependency_install`、`build`、`db_rebuild`、`doctor`、`test`、
`artifact_upload`、`artifact_download`、`workflow_control` のいずれかとする。これによりcheckout、
install、build、DB rebuild、doctor、artifact transferを別cost nodeとして再構築できる。

artifact transfer nodeだけがartifact digestを持ち、upload/download方向、lockfile digest、入力／出力digestをexact照合する。
artifact digestとpayload/evidence digestは `src/runtime/digest.ts` の `canonicalJson`／`sha256Digest` を再利用し、
第二のcanonicalization／hash実装を作らない。artifact transferが別transfer nodeへ依存する場合、依存先の
`output_digest`と依存元の`input_digest`、両nodeの`lockfile_digest`はexact一致し、transfer nodeのoperationはupload/downloadのいずれかに
限定する。

## 4. 時刻・結果・安全境界

時刻はRFC3339として parse 可能で、次を満たす。

```text
queued_at <= started_at <= completed_at
queue_time_ms == started_at - queued_at
wall_time_ms == completed_at - started_at
0 <= runner_time_ms <= wall_time_ms
```

`passed` は exit code 0、`failed` は非0 exit code、`cancelled`／`timed_out`／`superseded` は exit code null とする。
failureまたはtimeoutには `first_detecting_oracle_id` を必須とし、rerunのsuccessが過去のfailureを消さない。
`cancelled` と `superseded` は性能母集団から除外するが、除外件数をprojectionへ残す。

入力のunknown keyはfail-closeする。特にraw log、stdout、stderr、credential、secret、password、token、
API key、PIIに相当するkeyは明示的に拒否する。拒否理由はdigest化されたmetadataではなく、secret値を含まない
固定failure codeだけを返す。

## 5. batchとread model

batchは一つの `workflow_id/run_id/attempt`、profile、execution surface、HEAD対、runner環境へ束縛する。runner環境は
OS、architecture、Node version、toolchain digest、environment digest、cache class/hit、CPU／memory classの全てを同一にする。
依存nodeは同一batch内に存在し、自己依存・重複node・cycleを許さない。依存先の完了時刻より前に依存元nodeが開始する
時間逆転も拒否する。projectorはrun/attemptごとに次を計算する。

- `execution_wall_time_ms`: 全nodeの最初のqueuedから最後のcompletedまで
- `critical_path_ms`／`critical_path_node_ids`: dependency DAGのwall time最長経路
- `duplicate_setup_count`／`duplicate_setup_wall_time_ms`: 同じoperationとstable identityの2個目以降
- failure、timeout、cancel、superseded、retry、flakeの件数
- first detecting oracleの集合とfailure detection yield

performance seriesは `profile + execution_surface + runner_os + runner_architecture + runner_node_version +
toolchain_digest + environment_digest + cache_class + cache_hit + cpu_class + memory_class` で分け、terminal runの
wall timeとcritical pathからp50、p95、p99を計算する。別profile、別surface、別environment、cold/warmを混ぜない。
series内に有効なterminal runがない場合、percentileは `null` とし、観測された0msとして扱わない。
failureが0件の場合のfailure detection yieldも`null`とし、100%検出したとは表示しない。
selectionのcorrectness判定やrequired obligationをこのread modelで上書きしない。

## 6. 後続接続と非対象

本sliceのprojectionはread-onlyのため、CI workflowへのingestion、event journal／DB projection、GitHub log
adapter、schedule／retry制御、CI obligationの導出、Universal Improvement Loopのcandidate生成は後続sliceへ残す。

後続では、

```text
execution telemetry
  -> baseline / observed comparison
  -> global impact and counterfactual
  -> improvement candidate
  -> human decision / refreeze
  -> Forward
```

へ接続する。ただし本slice自身がRequirement、PLAN、Issue、DB authorityを直接変更してはならない。
