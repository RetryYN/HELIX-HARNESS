---
title: "Impact CI Recovery基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-01
updated: 2026-08-01
owner: SE
plan: docs/plans/PLAN-L4-58-impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L9-impact-ci-recovery-system-test-design.md
related_l3: docs/design/helix/L3-requirements/github-ci-performance-requirements.md
queue_id: L3Q-PC-038
---

# Impact CI Recovery基本設計

## 1. 設計目的

PRごとの無条件full regressionを、変更影響に応じた高速な重要検査とfinal candidate admissionへ分離する。
検査範囲は削らず、PRで省略した集合をmain merge直後とnightlyでexact回収する。性能判定はcorrectness判定と
別receiptにし、予算超過だけでgreenな変更を偽redにしない。

## 2. component境界

| component | 入力 | 出力 | authority | failure |
|---|---|---|---|---|
| `ChangeImpactResolver` | merge-base、current PR body、changed path、PLAN、trace/relation graph | `ImpactSet` | read-only | base不明、PR body stale、relation未解決 |
| `VerificationInventory` | repository-owned gate/test catalog | versioned `VerificationItem[]`とinventory digest | read-only SSoT | ID重複、owner欠落、digest drift |
| `CiProfilePlanner` | `ImpactSet`、risk signal、inventory | `CiExecutionPlan` | proposal-only | unknown/high-riskをtargetedへ縮退 |
| `CiReceiptRecorder` | execution plan、各item terminal result | HEAD束縛receiptとitem→terminal link | append-only | 別HEAD、item欠落、二重terminal |
| `PerformanceRecoveryClassifier` | correctness receipt、duration series、budget | merge判定とRecovery packet | proposal-only | 性能超過をcorrectness redへ変換、証拠欠落 |

GitHub event payloadのPR本文を再利用せず、各admission開始時にGitHub APIからcurrent bodyとhead SHAを
read-after-GitHubする。body、base、HEAD、inventory digestのいずれかが変われば既存plan/receiptをstale化する。

## 3. typed projection

```ts
type CiProfile = "draft_preflight" | "candidate_admission" | "post_merge_full" | "nightly_full";
type RiskClass = "known_low" | "known_high" | "unknown";

interface ImpactSet {
  baseHead: string;
  candidateHead: string;
  changedPaths: readonly string[];
  planIds: readonly string[];
  affectedLayers: readonly string[];
  vPairOracleIds: readonly string[];
  traceConsumerIds: readonly string[];
  riskClass: RiskClass;
  reasonCodes: readonly string[];
}

interface CiExecutionPlan {
  profile: CiProfile;
  candidateHead: string;
  inventoryDigest: string;
  selectedItemIds: readonly string[];
  deferredItemIds: readonly string[];
  fullAdmissionRequired: boolean;
  reasonCodes: readonly string[];
}
```

`selectedItemIds`と`deferredItemIds`は同じinventoryのdisjoint partitionであり、和集合はinventory exact setと一致する。
selector自身、security、permission、secret、schema、migration、rollback、DB checkpoint、authority root、unknown impactを
変更する場合は`fullAdmissionRequired=true`とする。

## 4. profile責務

| profile | trigger | 必須集合 | 予算 | 回収責務 |
|---|---|---|---|---|
| `draft_preflight` | authoring中のpush前／draft更新 | scope、PLAN、authority、typecheck、impact-selected tests | p95 60秒 | deferred集合をcandidateへ渡す |
| `candidate_admission` | candidate HEAD固定後 | critical gate＋impact-selected tests。high/unknownはfull inventory | p95 60秒、full時p95 3分 | merge前receiptを固定 |
| `post_merge_full` | main merge commit | PRで未実行のdeferred exact set＋main整合 | p95 3分 | 各deferred itemを最初のterminal receiptへexactly once接続 |
| `nightly_full` | schedule | full inventory、historical、compatibility、未回収補完 | p95 3分 | post-merge欠落・flake・driftを補完しIssue化 |

budgetは目標であり、timeoutを延ばす／testを外す／`continue-on-error`を付ける操作を改善と数えない。

## 5. state transition

```text
impact_resolved
  -> inventory_bound
  -> profile_planned
  -> executing
  -> candidate_terminal
  -> merged_pending_recovery
  -> post_merge_terminal
  -> nightly_reconciled
```

`candidate_terminal`はselected集合の全itemがterminalでなければ到達しない。merge後はdeferred集合が空の場合も
空集合receiptを発行し、未観測と区別する。post-merge失敗はmainをredとしてsurfaceし、nightly成功で履歴を消さない。

## 6. receiptと計測

receiptはprofile、event/run/attempt、source HEAD、base HEAD、runner/environment、cold/warm、worker数、CPU/RSS、
inventory digest、selected/deferred exact set、itemごとの開始・終了・duration・exit code・output digestを持つ。
p50/p95は同一profile・環境・cache classのterminal run母集団から計算し、cancelled/supersededは除外理由と件数を残す。
rerunは同一itemの新attemptであり、最初のterminal receipt linkを置換せず追記する。

## 7. Performance Recovery

correctnessがgreenでbudgetだけ超過した場合、merge admissionはgreenを維持し、同episodeでIssue #93型のRecovery packetを作る。
packetはHEAD、環境、cold/warm、区間、before/after p50/p95、原因分類、inventory非縮退digest、独立review、再計測、
removal triggerを必須にする。correctness failure、security failure、data loss riskは性能Recoveryへ降格しない。

## 8. 設計リファクタリング

既存`harness-check`、verification profile、relation impact、PLAN/V-pair gate、DB rebuild、doctorを再実装しない。
本sliceは既存ownerをversioned inventoryへ参照し、selectorとreceiptの境界だけを追加する。新DB table、runner、cache、
workflow jobはL5/L8およびL6/L7で実測して必要性が証明されるまで追加しない。
