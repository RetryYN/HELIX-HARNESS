---
canonical_vmodel: L1-L12
canonical_layer: L6
canonical_pair: L7
title: "Windows Lite canary bounded admission 機能設計"
layer: L6
kind: add-design
status: confirmed
created: 2026-08-27
updated: 2026-08-27
owner: SE / Codex TL
plan: docs/plans/PLAN-L3-70-windows-lite-canary-admission.md
parent_design: docs/design/helix/L5-detail/slot-scheduler-quota-handover.md
pair_artifact: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md
github_issue_id: 1106
behavior_contract_id: WINDOWS-LITE-CANARY-ADMISSION-001
responsibility_owner: windows-lite-canary-admission
---

# Windows Lite canary bounded admission 機能設計

## §0 設計境界

本設計は、#1002で成立済みのprofile closure selector、Linux artifact builder、Windows same-artifact smoke、
Full／Lite aggregateへ、PR横断のWindows heavy lane admissionを追加する。既存の
`slot-scheduler-quota-handover`、`WorkGraphLeaseV1`、event journal、append-only measurement historyを
入力・保存境界として再利用し、同じ責務を持つ二重queueや二重leaseを作らない。

pure kernelはclock、filesystem、process、network、DB writeを持たない。GitHub Actions adapterが取得した
snapshotをkernelへ渡し、kernelのtyped resultを再検証してから既存job output／aggregateへ投影する。
GitHub concurrencyは補助的な実行制御であり、HELIX receiptの代替ではない。

## §1 typed value object の定義

```ts
type WindowsCanaryDisposition =
  | "admitted"
  | "backpressured"
  | "lease_expired"
  | "stale_rejected"
  | "binding_rejected"
  | "state_uncertain";

interface WindowsCanaryAdmissionPolicyV1 {
  schema_version: "helix-windows-lite-canary-admission.v1";
  policy_id: string;
  policy_version: string;
  lane_id: "windows-lite-canary";
  max_active: number;
  max_waiting: number;
  lease_ttl_ms: number;
  heartbeat_interval_ms: number;
  backpressure_disposition: "retryable" | "fail_close";
  measurement_window: { window_id: string; sample_limit: number };
}

interface WindowsCanaryLeaseBindingV1 {
  schema_version: "helix-windows-lite-canary-lease-binding.v1";
  assignment_id: string;
  pr_number: number;
  candidate_head: string;
  linux_artifact_digest: string;
  profile_digest: string;
  lane_id: "windows-lite-canary";
  run_id: string;
  run_attempt: number;
  owner: string;
  lease_id: string;
  fence_token: number;
  correlation_id: string;
  issued_at: string;
  expires_at: string;
}
```

各recordはexact key set、canonical serialization、入力不変性を持つ。`candidate_head`、artifact、attempt、
lease、fenceのどれかを省略して別fieldから推測しない。`fence_token`は既存`WorkGraphLeaseV1`と同じ
lane内単調整数CASとして検証し、Windows用の第二fence authorityや文字列tokenへ再定義しない。

## §2 pure evaluator の責務

後続のL6実装は次の純粋関数へ分割する。

| 関数 | 責務 |
|---|---|
| `validateWindowsCanaryAdmissionPolicy` | policyのexact schema、上限、TTL／heartbeat、measurement windowを検証 |
| `evaluateWindowsCanaryQueue` | active／waitingの上限、重複assignment、決定的queue順、backpressureを評価 |
| `evaluateWindowsCanaryLease` | versioned policyのheartbeat intervalだけを用い、assignment／HEAD／artifact／attempt／owner／fence／expiryを比較 |
| `evaluateWindowsCanaryCompletion` | Linux artifact receiptとWindows completionを同一bindingへ照合 |
| `computeWindowsCanaryPercentiles` | 同一measurement keyのterminal durationだけから固定rank p95／p99を算出 |
| `aggregateWindowsCanaryLane` | admittedまたは正規typed dispositionを既存aggregate形式へ投影 |
| `replayWindowsCanaryMeasurement` | append-only sequence、前event digest、window／母集団digestを再検証 |

判定順は、policy schema → queue state → duplicate／conflict → lease expiry → fence／owner → candidate／
artifact／attempt binding → measurement validity → aggregateの順とする。failureは先行failureで閉じ、
後段のsuccessで相殺しない。

## §3 Actions adapterとevent flow

```text
PR context / Linux artifact receipt
  → HELIX snapshot取得
  → policy／queue／lease evaluator
  ├─ admitted → Windows job lease／heartbeat → same-artifact smoke
  ├─ backpressured → bounded retryable output
  ├─ expired／stale／binding rejected → success投影なし
  └─ uncertain → fail-close
        ↓
  append-only measurement／event journal
        ↓
  existing harness-check typed aggregate
```

Actions adapterはrun attempt、job ID、candidate HEAD、artifact digestをイベントpayloadから再構築せず、
取得したcurrent snapshotとHELIX lease receiptへ束縛する。leaseのexpiry・heartbeat失敗時はWindows
success outputを生成せず、再試行する場合も新しいattempt／lease／fenceを発行する。

同じPR refのworkflow concurrencyだけでPR横断競合を表現しない。adapterはcross-PR lane identityを
計測・検証可能なreceiptへ持ち上げ、pendingが置換された場合はdropではなくbackpressure／uncertainとして
観測する。

## §4 measurement

measurement keyは次のcanonical tupleから作る。

```text
(measurement_schema_version, lane_id, profile_digest, linux_artifact_digest, window_id)
```

terminalな`admitted`実測durationを昇順に並べ、固定rankでp95／p99を返す。timeout、cancel、stale、
backpressure、duplicateはduration母集団へ混ぜず、分類別countとdigestを別に保存する。sample不足、
異なるartifact／profileの混在、window不一致、順序／digest改変は`measurement_invalid`とする。

measurement eventは既存のappend-only historyへ追加し、同一`measurement_id`の再送はdedupeする。既存eventの
更新・削除、run rerunによる上書き、単発の画面表示によるp95／p99確定は許可しない。

## §5 非対象

policy／kernel設計だけではhost-global leaseの実装、GitHub Actions settings変更、外部queue導入、
resident lane、#819 Notification Fabric、tag／publishを完了扱いにしない。L3確認と後続L8 oracleが揃った後に、
実装PRが既存runtime／DB／workflowへ接続する。
