---
title: "HELIX Runtime Infrastructure L1要求候補（POの原文、2026-09-26）"
kind: source_snapshot
source: PO（2026-09-26のClaude作業sessionで提示）
recorded_at: 2026-09-26
decision_record: docs/governance/decisions/infrastructure-l1-idea-po-decisions-2026-09-26.md
authority_effect: none
---

# HELIX Runtime Infrastructure L1要求候補（POの原文、2026-09-26）

2026-09-26（Asia/Tokyo）、POが示した本文を、そのまま保存する。
本書は書き換えない。現在の意味は[HELIX-INFRASTRUCTUREの企画（L1）案](../L1-planning/infrastructure-intent.md)に置き、差分はgitで辿る。
原文の表題にある「v0.1」と、原文の名前「HELIX Runtime Infrastructure」は原文の一部として残す。正式名称は、POの回答でHELIX-INFRASTRUCTUREとした（[判断記録](../../governance/decisions/infrastructure-l1-idea-po-decisions-2026-09-26.md)）。

---

# HELIX Runtime Infrastructure L1要求候補 v0.1

## 1. 中心価値

HELIX Runtime Infrastructureは、HELIX自身の各機構、Worker、Model Runtime、Data Store、Connector等が、安全かつ継続的に稼働するための実行基盤を提供する。

設計知識はBRAIN、Infrastructure要求・設計はHELIX自身のHELIX-HARNESS-CORE、進行統制はHELIX-OS、権限制約はHELIX-SECURITYが所有する。

Runtime Infrastructureは、

> **承認されたHELIX Infrastructure Designを、観測可能・復旧可能な実Runtimeとして成立させ、その実状態を保持する領域**

とする。

```text
BRAIN
Infrastructure Knowledge
        ↓
HELIX-HARNESS-CORE
HELIX固有Infrastructure Design
        ↓
HELIX Runtime Infrastructure
実Runtime
        ↓
Observed Actual State
```

---

# HRI-L1-001

## HELIX自身のRuntime Topologyを持つ

HELIXを構成するRuntime Resourceとその関係を識別できる。

対象例：

* HELIX-OS
* HELIX-BRAIN
* HELIX-LABO
* HELIX-INTELLIGENCE
* HELIX-SECURITY
* HELIX-CONNECT
* Runner / Sandbox
* Worker Runtime
* Model Runtime
* Database
* Queue
* Artifact Store
* Evidence Store
* Log / Metric infrastructure

各Resourceについて、

* identity
* role
* environment
* location
* version
* dependencies
* lifecycle state

を辿れる。

---

# HRI-L1-002

## Infrastructureの設計正本と実状態を分離する

次を同一状態として扱わない。

```text
Approved Design
        ≠
Deployment Target
        ≠
Observed Actual State
```

Infrastructure設計の意味正本はHELIX-HARNESS-COREが所有する。

Runtime Infrastructureは、その設計から導かれたDeployment Targetと観測したActual Stateを扱う。

Actual StateからInfrastructure要求・設計を直接書き換えない。

---

# HRI-L1-003

## Desired / Actual Driftを検出できる

承認されたInfrastructure構成と実環境の差を確認できる。

対象例：

* Resource missing
* Unexpected resource
* Version mismatch
* Configuration drift
* Network drift
* Permission drift
* Capacity drift
* Runtime replacement
* Unknown dependency

Driftを自動的に「正しい変更」とみなさない。

---

# HRI-L1-004

## Environmentを独立Identityとして扱う

少なくとも、

* Development
* Verification
* Staging
* Production
* Recovery

等のEnvironmentを混同しない。

各Environmentについて、

* resource
* configuration
* network
* credential scope
* data
* version
* authority

を分離する。

別Environmentの成功をProduction成立の証拠にしない。

---

# HRI-L1-005

## Compute Resourceを管理できる

HELIXが利用するComputeを共通モデルで扱う。

対象例：

* Local Machine
* VPS
* Dedicated Server
* Cloud VM
* Container Runtime
* GPU Node
* Worker Node

Providerや物理場所に関係なく、

* CPU
* RAM
* GPU / VRAM
* Storage
* Runtime
* Capacity
* Health
* Availability

を確認できる。

---

# HRI-L1-006

## Network Topologyを持つ

HELIX内部および外部への通信経路を把握できる。

少なくとも、

* source
* destination
* protocol
* endpoint
* direction
* purpose
* security boundary
* dependency

を持つ。

HELIX-CONNECTの論理接続と、Infrastructureの物理・Runtime通信経路を区別する。

---

# HRI-L1-007

## State / Storage Resourceを管理できる

HELIXが利用する永続・一時Stateを区別できる。

対象例：

* Operational DB
* Evidence Store
* Artifact Store
* Queue
* Cache
* Log Store
* Metric Store
* Model Store

各Stateについて、

* owner
* durability
* backup requirement
* retention
* environment
* security classification
* recovery requirement

を持てる。

---

# HRI-L1-008

## Control PlaneとExecution Planeを分離する

HELIXの管理・判断機構と、大量Resourceを消費するWorker実行を分離できる。

```text
Control Plane
OS / Security / Coordination

Execution Plane
Worker / CI / Model / Sandbox
```

Worker暴走、CI負荷、Model Runtime負荷によって、HELIXの管理・停止・復旧能力そのものが失われない構成を取れる。

---

# HRI-L1-009

## Model RuntimeをInfrastructure Resourceとして扱う

LLM Runtimeを通常の外部APIだけでなく、Infrastructure Resourceとして扱える。

対象例：

* External Model API
* Local LLM
* GPU Server
* Distributed Model Server
* Fine-tuned Model Runtime

少なくとも、

* model
* version
* server
* GPU / memory requirement
* concurrency
* latency
* capacity
* health
* endpoint

へ辿れる。

モデルの知能評価はINTELLIGENCE/LABOへ分離する。

---

# HRI-L1-010

## CapacityとSaturationを観測できる

各Resourceについて、

* capacity
* utilization
* queue
* concurrency
* saturation
* rejection
* backpressure

を観測できる。

Resource枯渇を突然の異常としてだけ扱わず、予定された状態として制御できる。

---

# HRI-L1-011

## Resource Admissionを持つ

新しいJob、Worker、Model、CI等を起動する前に、必要Resourceを利用可能か確認できる。

Capacity不足時に、

* queue
* delay
* lower-cost runtime
* alternative node
* reject
* human escalation

等へ接続できる。

過負荷状態で無制限にJobを追加しない。

---

# HRI-L1-012

## Failure Domainを識別する

Resourceを単なる一覧ではなくFailure Domainとして扱える。

例：

```text
Local PC failure
VPS failure
GPU node failure
Network failure
Provider failure
Database failure
Storage failure
```

一つの故障がどこまで影響するか、Blast Radiusを辿れる。

---

# HRI-L1-013

## Single Point of Failureを把握する

HELIX自身について、

> このResourceを失うとHELIXの何が止まるか

を把握できる。

冗長化を必須にはしないが、

* accepted SPOF
* impact
* recovery
* rationale

を明示する。

---

# HRI-L1-014

## ObservabilityをRuntimeの必須能力とする

HELIX自身のInfrastructureについて最低限、

* health
* metric
* log
* resource usage
* dependency status
* queue state
* error
* latency
* deployment revision
* recovery state

を観測できる。

「観測不能」をHealthyへ変換しない。

---

# HRI-L1-015

## Infrastructure Eventを共通Episodeへ接続する

Runtime EventをHELIX全体の相関IDへ接続する。

例えば、

```text
Requirement
→ Ticket
→ Worker
→ Runner
→ Infrastructure Resource
→ Failure
→ Recovery
```

を一つのEpisodeとして追跡できる。

LABOへ渡せる観測材料を失わない。

---

# HRI-L1-016

## IncidentをRuntime状態として扱える

HELIX Infrastructure上で、

* degraded
* unavailable
* capacity exhausted
* dependency failure
* data unavailable
* network unavailable
* security isolation
* unknown

等を通常状態と区別できる。

Incidentの意味・Severityは承認済み要求を参照し、Runtime自身が勝手に定義しない。

---

# HRI-L1-017

## Backupを実行状態として追跡する

HELIX自身の重要Stateについて、

* backup target
* source revision
* timestamp
* completeness
* location
* integrity
* expiry

を確認できる。

「Backup設定がある」ことをBackup成功としない。

---

# HRI-L1-018

## Restore可能性を実証できる

BackupとRestoreを別状態として扱う。

```text
Backup Exists
≠
Restore Works
```

実際に、

* restoration
* integrity
* dependency reconnection
* startup
* verification

まで確認できる。

---

# HRI-L1-019

## Rollback先を保持する

Infrastructure変更、Runtime更新、Model更新等について、変更前の適格な状態へ戻せる。

Rollback先には、

* infrastructure version
* configuration
* artifact
* dependency
* data compatibility
* recovery procedure

を関連付ける。

---

# HRI-L1-020

## Bootstrap / Recovery Rootを持つ

HELIX全体が停止した場合でも、HELIX自身を使わなければ復旧できない循環依存を避ける。

最低限の、

```text
Bootstrap
Recovery
Inspection
Rollback
```

能力は、停止したHELIX本体から独立して利用できる。

例：

```text
HELIX OS dead
↓
HELIX OSに「OSを直して」と頼めない
```

という自己依存を作らない。

---

# HRI-L1-021

## Out-of-Band Recovery Pathを持つ

通常のHELIX Control Planeが利用不能な場合に、

* runtime inspection
* health confirmation
* service stop
* rollback
* recovery startup

を行える限定経路を持つ。

通常運用の万能な裏口にはせず、SECURITYの別Authorityを要求する。

---

# HRI-L1-022

## DeploymentをVersion付きで追跡する

何が、

* where
* when
* version
* configuration
* artifact
* dependency

で動いているかを確認できる。

同じ「HELIX」という名前でも異なるRuntime Revisionを区別する。

---

# HRI-L1-023

## Infrastructure Updateを段階適用できる

HELIX自身のInfrastructure変更を一括更新だけにしない。

必要に応じて、

```text
Candidate
→ Isolated / Shadow
→ Partial
→ Verified
→ Promoted
```

と段階適用できる。

SECURITYのUpdate Admissionを通過しないInfrastructure変更を自動昇格させない。

---

# HRI-L1-024

## Infrastructure変更のBlast Radiusを限定する

変更前に、

* affected resource
* affected mechanism
* dependent job
* affected environment
* affected data
* rollback target

を確認できる。

Infrastructure変更からHELIX全体を無条件に停止させない。

---

# HRI-L1-025

## Providerを交換可能にする

HELIX Runtime Infrastructureを、

* AWS
* GCP
* Azure
* VPS vendor
* Local Machine
* specific GPU provider

等へ恒久固定しない。

Provider固有実装とHELIXが必要とするCapabilityを分離する。

---

# HRI-L1-026

## Local / VPS / Cloudを混在できる

HELIX自身は単一Cloudだけを前提としない。

例えば、

```text
Local PC
├─ Control / development

VPS
├─ always-on worker
├─ CI

GPU Server
├─ Local LLM

Cloud
└─ optional service
```

のようなHybrid Runtimeを扱える。

配置判断自体はINTELLIGENCE/OSとの接続で行う。

---

# HRI-L1-027

## Resource Locationを明示する

State、Worker、Model、Artifact等について、

> どこに存在するか

を確認できる。

Location不明なResourceを安全な利用対象とみなさない。

---

# HRI-L1-028

## Infrastructure SecurityをHELIX-SECURITYへ接続する

Runtime InfrastructureはSECURITYから、

* network constraint
* credential constraint
* environment isolation
* project isolation
* action authority
* update admission
* egress policy

を受け取る。

Infrastructure自身がSecurity policyを自己生成しない。

---

# HRI-L1-029

## CredentialをInfrastructure状態へ埋め込まない

Runtime ResourceはCredentialそのものを通常Stateとして保存しない。

CredentialはHELIX-SECURITYの管理境界から必要scopeで受け取る。

Infrastructure backupやsnapshotへSecretを無条件に含めない。

---

# HRI-L1-030

## CostをResource状態として観測できる

HELIX自身について、

* Compute
* GPU
* Storage
* Network
* external service
* Model API
* always-on resource

等のCostをResourceやWorkloadへ関連付けられる。

費用の採否や予算決定はRuntime Infrastructureが行わない。

---

# HRI-L1-031

## Lifecycle全体を扱う

Infrastructure Resourceについて、

```text
Plan
Provision
Configure
Activate
Observe
Update
Degrade
Recover
Retire
Decommission
```

を区別する。

作成できることだけでInfrastructure管理成立としない。

---

# HRI-L1-032

## Decommissionを正式状態として扱う

不要になったResourceを「使っていない」だけで放置しない。

Decommission時に、

* dependency
* data
* credential
* network
* cost
* backup
* replacement

を確認する。

---

# HRI-L1-033

## Runtime StateのFreshnessを持つ

観測したActual Stateには、

* observed_at
* source
* freshness
* collector
* confidence / unknown

を持つ。

古い観測結果を現在のInfrastructure状態として使わない。

---

# HRI-L1-034

## Unknownを第一級状態として扱う

Infrastructureでは、

```text
Healthy
Unhealthy
Unknown
Unobserved
Stale
```

を区別する。

確認できないResourceをHealthyとして補完しない。

---

# HRI-L1-035

## HELIX本体とHELIX-Web Infrastructureを分離する

将来のWeb展開では、

```text
HELIX Internal Infrastructure
≠
HELIX-Web Service Infrastructure
```

とする。

HELIX-Web側の、

* tenant runtime
* customer job
* customer credential
* service state
* deployment

をHELIX本体Infrastructureへ暗黙共有しない。

---

# HRI-L1-036

## HELIX Core AssetをRuntime境界でも保護する

HELIX-HARNESS-CORE、BRAIN、INTELLIGENCE、LABO等の内部Assetを、Runtime Infrastructureの配置によって不用意に外部へ公開しない。

SECURITYのAsset Boundaryに従って、

* internal only
* service internal
* external
* restricted

等の配置条件を適用できる。

---

# HRI-L1-037

## Self-hosting更新で現行稼働版を失わない

HELIXがHELIX自身のInfrastructureを変更する場合、

```text
Running Generation N
        ↓
Candidate Generation N+1
```

を分離する。

候補版が自身の成功を自己承認して、稼働版を先に破壊しない。

適格な旧Generationへ戻れる状態を保つ。

---

# HRI-L1-038

## Runtime Infrastructureを再構築可能にする

Infrastructure状態が失われても、

* approved design
* configuration
* artifact
* dependency
* data backup
* version
* deployment evidence

から必要なRuntimeを再構築できる。

特定の一台のMachine内部だけに復旧不能な知識を持たない。

---

# HRI-L1-039

## 実Infrastructure操作はRunnerを通す

HELIXがInfrastructureを操作するとき、

* provision
* configure
* deploy
* stop
* scale
* restore
* delete

等の実操作は、SECURITYによるAuthorityを受けたRunner / Sandbox等の限定実行経路を通す。

Runtime Infrastructure自身が無制限Shell主体にならない。

---

# HRI-L1-040

## Provider API / IaCを実装方式として固定しない

Infrastructure操作は、

* Terraform / OpenTofu
* Ansible
* Cloud API
* Provider CLI
* local script
* container runtime

等で実装できる。

特定ToolをHELIX Infrastructureの意味正本にしない。

---

# 各機構との境界

```text
HELIX-BRAIN
Infrastructure Pattern / Knowledge
        ↓

HELIX-HARNESS
Infrastructure Requirement / Verification Contract
        ↓

HELIX-HARNESS-CORE
HELIX固有Infrastructure Design
        ↓

HELIX Runtime Infrastructure
Deployment Target / Actual Runtime State
        │
        ├── SECURITY
        │   Authority / Isolation / Credential
        │
        ├── OS
        │   Change / Deployment / Incidentの進行統制
        │
        ├── Runner
        │   実Infrastructure操作
        │
        ├── INTELLIGENCE
        │   Placement / Capacity / Diagnosis proposal
        │
        └── LABO
            Operation / Failure / Cost / Recovery評価
```

---

# OSとの境界

HELIX-OSは、

* 何を変更するか
* どのTicketで進めるか
* 誰が行うか
* どの証拠を登録するか
* いつ停止・再開するか

を統制する。

Runtime Infrastructureは、

* どのResourceが存在するか
* どのTopologyか
* どのVersionか
* 現在どういう状態か
* どこに配置されているか

を扱う。

```text
OS
= Work / Change State

Runtime Infrastructure
= Runtime Resource State
```

同じStateを二重に正本化しない。

---

# SECURITYとの境界

```text
Runtime Infrastructure
「Server AにJobをDeployしたい」

SECURITY
「Server A / Project X / Operation Deploy /
 Revision Y / Expiry Zなら許可」

Runner
「その範囲だけ実行」
```

Infrastructureは自分で自分の権限を拡張しない。

---

# LABOとの境界

Runtime Infrastructureは生の、

* metric
* event
* failure
* recovery
* cost
* capacity

を観測可能にする。

「この構成が良かったか」はLABOが過去実績として評価する。

Runtime自身が成功実績から設計PatternをBRAINへ直接昇格させない。

---

# INTELLIGENCEとの境界

INTELLIGENCEは、

* Resource配置
* Worker placement
* Capacity shortage
* Failure diagnosis
* Scaling
* Recovery candidate

等を判断候補として出せる。

Runtime Infrastructureは候補を直接Authorityとして実行しない。

---

# 1.0で最低限成立させる範囲

1.0では少なくとも、

1. Runtime Resource Identity
2. Topology
3. Environment
4. Desired / Actual separation
5. Drift
6. Compute / Network / Storage
7. Model / Worker Runtime
8. Capacity
9. Observability
10. Incident state
11. Backup / Restore
12. Rollback
13. Deployment version
14. Security connection
15. OS connection
16. Runner execution
17. Bootstrap / Out-of-Band Recovery
18. Rebuildability

を成立させる。

高度なAutoscaling、Multi-cloud、完全自動Failover等は、必要性と実績から後の版へ拡張できる。

---

# 要求の核

> **HELIX Runtime Infrastructureは、HELIX自身を構成するCompute、Network、Storage、State、Worker、Model Runtime等の実行基盤とTopologyを扱い、承認されたInfrastructure Designから導かれたDeployment Targetと観測されたActual Stateを分離して保持する。Capacity、Failure、Observability、Backup、Restore、Rollback、Lifecycle、Cost、Driftを追跡し、HELIX全体が停止しても復旧できるBootstrap / Out-of-Band Recoveryを持つ。設計知識、要求意味、進行統制、Security Authority、判断、評価はそれぞれBRAIN、HARNESS/CORE、OS、SECURITY、INTELLIGENCE、LABOへ分離する。**
