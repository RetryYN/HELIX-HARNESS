---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
l3_progression_marker: HELIX:L3-PROGRESSION-AUTHORITY:v1
l3_progression_authority: docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
title: "Windows Lite canary PR横断 bounded admission 要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-08-27
updated: 2026-08-27
owner: PO / Codex TL
plan: PLAN-L3-70-windows-lite-canary-admission
parent_design: docs/design/helix/L3-requirements/github-ci-performance-requirements.md
pair_artifact: docs/test-design/helix/windows-lite-canary-admission-acceptance.md
next_pair_freeze: L10
refines:
  - GH-NFR-009
  - GH-NFR-010
  - GH-NFR-011
  - DIST-LITE-R-04
---

# Windows Lite canary PR横断 bounded admission 要件

> 本書は#1002のLite canary selector／Linux artifact authorityを置き換えず、PRをまたぐWindows
> heavy laneの競合、lease、backpressure、性能計測をrequirements-owned contractとして追加する。
> status=draftの間はL3要求の候補であり、実行権限、GitHub設定、publish、cutoverを付与しない。

## §0 authorityと責務境界

意味authorityは現行requirements、既存の`consumer_core_v1`／distribution catalog、`slot-scheduler`、
event journal、measurement historyである。GitHub Actionsのconcurrency設定、通知本文、`harness.db`の
projection、PRコメントを単独のauthorityにしない。新しい外部queue、provider固有の正本、Lite builderの
複製、#819 Notification Fabricの再実装は行わない。

Linuxで検証したLite artifactをWindowsへ渡す既存のsource／profile／artifact／digest bindingと、
Full／Liteのtyped aggregateは不変とする。Windows runnerの待機が長いことだけを理由にtimeoutを無制限化、
`continue-on-error`、暗黙skip、別artifactの再buildへ退行させない。

## WLCA-FR-001 Windows heavy lane の受入

HELIXは、Windows Lite canary heavy laneをPR横断で受理するため、versioned policy、bounded queue、
lease receipt、typed dispositionを一方向に評価する。GitHub Actionsは実行adapterであり、HELIXが
admissionの観測可能なidentityを検証できない状態をsuccessへ投影してはならない。

## WLCA-FR-002 Windows canary の計測

HELIXは、Windows laneの実行時間、timeout、contention、backpressure、lease expiryをappend-only
measurementへ記録し、同じlane／profile／artifact契約の母集団から決定論的にp95／p99を算出する。
再実行のgreen、単発の最短値、検査集合の縮退を性能改善の証拠にしない。

## §1 補助要件

### WLCA-R-01 policyの明示性

admission policyは、`policy_id`、`policy_version`、`lane_id`、`max_active`、`max_waiting`、
`lease_ttl_ms`、`heartbeat_interval_ms`、`backpressure_disposition`、`measurement_window`を必須とする。
上限は正の整数、TTL／heartbeatは正の有限値、heartbeatはTTL未満、windowは決定的な期間または
固定sample数でなければならない。欠落、zero、負値、unknown field、相互矛盾はfail-closeする。

### WLCA-R-02 bounded queueとbackpressure

active lease数は`max_active`以下、待機数は`max_waiting`以下に固定する。上限到達時は対象をdropせず、
`backpressure`または明示的なretryable dispositionとして返す。無制限待機、暗黙skip、容量を超えた
成功投影、PATや別providerへの暗黙fallbackを許可しない。

### WLCA-R-03 lease／heartbeat／fence の束縛

leaseの取得、heartbeat、解放、expiryは`assignment_id`、PR番号、`candidate_head`、Linux artifact digest、
`lane_id`、run ID、run attempt、owner、lease ID、fence token、correlation IDへ束縛する。期限切れowner、
古いfence、別lane、別assignmentからのcompletionは受理せず、既存event journalへstale findingを残す。

### WLCA-R-04 candidateと同一artifact

Windows receiptは、Linuxで検証済みのsource HEAD、profile／manifest digest、artifact digest、PR、run attempt、
lane identityをexactに再掲する。Windows側の再build、event payloadだけのHEAD補完、artifact／attemptの欠落を
成功とみなさない。

### WLCA-R-05 不確実性のfail-close

queue state、lease state、owner、fence、HEAD、artifact、run attempt、path、digestのいずれかが読めない、
stale、重複、矛盾している場合、Windows successまたはauthorized skipへ投影しない。failure codeは
`queue_state_uncertain`、`lease_expired`、`stale_fence`、`binding_mismatch`、`measurement_invalid`等の
typed reasonとして保持し、failureの詳細へsecret、token、private payloadを出力しない。

### WLCA-R-06 append-only measurementとpercentile

測定eventは`measurement_id`、lane／profile／artifact／source identity、window、observed duration、
outcome、timeout／contention／backpressure分類、run attempt、event digestを持つappend-only recordとする。
通常時p95／p99の分母は同じlane、profile、artifact、measurement schema、windowに属するterminalな
実測durationだけとし、timeout・cancel・重複・stale completion・別artifactを混ぜない。percentile方式、
sort順、rank、除外数、母集団digestをreceiptへ固定する。

### WLCA-R-07 aggregate接続

既存`harness-check` aggregateは、Windows heavy laneについて、成功または正規化済みtyped dispositionだけを
受理する。missing lease receipt、unauthorized skip、stale receipt、wrong HEAD／artifact／attempt、
不確実なqueue stateをFull laneのgreenで相殺しない。Linux artifact authorityとFull／Liteの独立job DAGを維持する。

### WLCA-R-08 再利用と段階実装

後続実装は既存のslot scheduler／work-graph lease、event journal、measurement history、Impact CI、
`harness-check` adapterを再利用し、同じ責務を持つ第二queue／第二lease／第二measurement authorityを作らない。
実装順は、typed policy／lease schema → pure queue／expiry evaluator → Actions adapter → concurrent E2E →
main／nightly measurement read-afterとする。policy以外の実装不足を「性能目標達成」と扱わない。

## §2 初期typed contract

```yaml
schema_version: helix-windows-lite-canary-admission.v1
policy:
  policy_id: windows-lite-canary-heavy
  policy_version: <versioned>
  lane_id: windows-lite-canary
  max_active: <positive integer>
  max_waiting: <positive integer>
  lease_ttl_ms: <positive integer>
  heartbeat_interval_ms: <positive integer less than lease_ttl_ms>
  backpressure_disposition: retryable | fail_close
measurement:
  schema_version: helix-windows-lite-canary-measurement.v1
  window_id: <deterministic window>
  percentile_method: fixed_rank
binding:
  assignment_id: <id>
  candidate_head: <40-hex git sha>
  linux_artifact_digest: <sha256 digest>
  run_attempt: <positive integer>
  lease_id: <id>
  fence_token: <opaque token>
```

`<...>`は未確定値を意味し、実装側の暗黙defaultではない。値はrequirements承認後のversioned policyで
明示し、欠落時はadmitしない。

## §3 非目標

- #1002／#1066のprofile closure selector、Lite builder、Linux artifact検証の再実装。
- `#819` resident lane、#188 routing／allocation、provider fallback、Notification Fabricの再設計。
- 新外部queue、GitHub設定の無審査変更、tag／publish／DevOS cutover。
- timeout値だけの延長、`continue-on-error`、unauthorized skip、測定母集団の縮退。

本書がconfirmedになるまで、L6 runtime、DB schema、GitHub Actionsの実変更を本要件の存在だけで先取りしない。
