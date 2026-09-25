---
title: "HELIX-BRAIN Infrastructure Domain 要求候補（POの原文、2026-09-26）"
kind: source_snapshot
source: PO（2026-09-26のClaude作業sessionで提示）
recorded_at: 2026-09-26
decision_record: docs/governance/decisions/brain-l1-idea-po-decisions-2026-09-26.md
authority_effect: none
---

# HELIX-BRAIN Infrastructure Domain 要求候補（POの原文、2026-09-26）

2026-09-26（Asia/Tokyo）、POが「アイディアで」として示した本文を、そのまま保存する。
本書は書き換えない。現在の意味は[BRAINのInfrastructure領域の要求候補](../candidates/infrastructure-domain-requirements.md)に置き、差分はgitで辿る。
原文の表題にある「v0.1」と、原文中の「HELIXBRAIN-L2-INFRA-001」等のIDは原文の一部として残す。

---

# HELIX-BRAIN Infrastructure Domain 要求候補 v0.1

## 位置づけ

HELIX-BRAINは、Infrastructureを製品固有の実インフラとしてではなく、複数の製品へ再利用できる設計知識のDomainとして持つ。

```text
HELIX-BRAIN
= Infrastructure Design Knowledge

HELIX-HARNESS-CORE
= 対象製品で採用したInfrastructure Design

Infrastructure Runtime
= 実際に稼働しているInfrastructure
```

BRAINはAWS、GCP、VPS等の実環境状態を所有しない。

---

## HELIXBRAIN-L2-INFRA-001

### Infrastructureを独立したDesign Domainとして持つ

BRAINは、Infrastructure設計知識を他のSoftware Designと区別して体系化できる。

少なくとも次のSubdomainを扱える。

* Compute
* Network
* Storage
* Database Infrastructure
* Cache
* Queue / Messaging
* Load Balancing
* Service Discovery
* Deployment
* Scaling
* Availability
* Reliability
* Backup / Restore
* Disaster Recovery
* Observability
* Capacity
* Cost Architecture
* Infrastructure Security
* Environment
* Runtime / Execution Platform

Subdomainは固定一覧とせず追加・分割・統合・退役できる。

---

## HELIXBRAIN-L2-INFRA-002

### Infrastructure Patternを構造として保持する

Infrastructure Domainでも、

```text
Domain
└─ Pattern
   └─ Design Unit
      └─ Part
```

の共通構造を使う。

例：

```text
Availability
└─ Active / Passive Pattern
   ├─ Primary Unit
   ├─ Standby Unit
   ├─ Health Detection Unit
   └─ Failover Unit
```

または、

```text
Deployment
└─ Blue-Green Pattern
   ├─ Active Environment
   ├─ Candidate Environment
   ├─ Traffic Switch
   └─ Rollback Unit
```

Cloud provider固有設定だけをPatternとして扱わない。

---

## HELIXBRAIN-L2-INFRA-003

### Patternの成立条件を持つ

Infrastructure Patternは、少なくとも次を持てる。

* problem
* workload assumptions
* expected load
* availability condition
* consistency requirement
* latency requirement
* capacity condition
* scaling condition
* failure assumptions
* recovery condition
* data durability
* network requirement
* security constraint
* operational complexity
* cost characteristic
* required observability
* applicability
* negative case
* trade-off
* evidence

単に「この構成が一般的」という理由で適用可能としない。

---

## HELIXBRAIN-L2-INFRA-004

### 非機能要求とInfrastructure Patternを関係付ける

Infrastructure Patternを、非機能要求と意味的に接続できる。

例：

```text
Availability
Performance
Capacity
Reliability
Recoverability
Security
Privacy
Observability
Maintainability
Cost
```

について、

```text
Requirement characteristic
        ↓
relevant Infrastructure Pattern
        ↓
required Design Input
```

を辿れる。

BRAIN自身は要求値を決定しない。

---

## HELIXBRAIN-L2-INFRA-005

### Failureを正常系と同じ重要度で持つ

Infrastructure知識は正常構成だけでなくFailure構造を持つ。

対象例：

* Single Point of Failure
* Network Partition
* Dependency Failure
* Storage Exhaustion
* Queue Saturation
* Connection Exhaustion
* Resource Starvation
* Cascading Failure
* Region / Zone Failure
* Deployment Failure
* Backup Failure
* Restore Failure
* Configuration Drift

各Patternについて、

```text
expected failure
detection
impact
containment
recovery
residual risk
```

を扱える。

---

## HELIXBRAIN-L2-INFRA-006

### Recovery Patternを持つ

障害を防ぐ設計だけでなく、障害後に戻す設計知識を持つ。

対象例：

* Retry
* Timeout
* Circuit Breaker
* Failover
* Graceful Degradation
* Rollback
* Restore
* Rebuild
* Reconciliation
* Disaster Recovery

「落ちない構成」だけでInfrastructure成立としない。

---

## HELIXBRAIN-L2-INFRA-007

### Deployment Patternを持つ

提供・更新に関する再利用知識をInfrastructure Domainへ持てる。

対象例：

* Rolling Deployment
* Blue-Green
* Canary
* Immutable Deployment
* In-place Update
* Staged Rollout

各Patternについて、

* blast radius
* rollback characteristics
* required duplication
* availability impact
* migration constraint
* observability requirement

を比較できる。

実際のReleaseやDeploymentの進行はBRAINが行わない。

---

## HELIXBRAIN-L2-INFRA-008

### Scaling / Capacity Patternを持つ

Workloadに対してResourceをどう増減させるかの設計知識を持てる。

対象例：

* Vertical Scaling
* Horizontal Scaling
* Queue-based Load Leveling
* Sharding
* Read Replica
* Cache
* Worker Pool
* Backpressure

Patternには、

* trigger
* bottleneck
* limit
* statefulness
* synchronization cost
* expected saturation behavior

を持てる。

---

## HELIXBRAIN-L2-INFRA-009

### ObservabilityをInfrastructure設計の一部として持つ

Infrastructure Patternごとに、成立確認に必要な観測点を持てる。

対象例：

* Metrics
* Logs
* Traces
* Health
* Dependency status
* Capacity
* Saturation
* Error
* Latency
* Deployment state
* Recovery state

「構成を作った」だけで設計を閉じず、

> その構成が成立していることを何で観測できるか

までPatternに含める。

実際のlogやmetricはBRAINに保存しない。

---

## HELIXBRAIN-L2-INFRA-010

### BackupとRestoreを対で扱う

Backup PatternはRestore Patternと分離せず、成立条件を関係付けられる。

```text
Backup
≠
Recoverability

Backup
+
Restore verification
+
required recovery conditions
=
Recoverability Evidence Candidate
```

BRAINは、

* backup strategy
* retention pattern
* replication
* restore pattern
* recovery validation

の設計知識を持つ。

実際のRTO/RPO値は製品要求が所有する。

---

## HELIXBRAIN-L2-INFRA-011

### Costを設計Trade-offとして持つ

Infrastructure Patternについて、Costを設計判断材料として表現できる。

対象例：

* fixed / variable cost tendency
* idle resource cost
* scaling cost
* redundancy cost
* storage cost
* network cost
* operational cost

具体価格を恒久知識として扱わず、Providerや時点によって変わる値と、構造上のCost characteristicを区別する。

---

## HELIXBRAIN-L2-INFRA-012

### Provider非依存PatternとProvider実装を分ける

例えば、

```text
Pattern:
Object Storage

Implementation examples:
S3
GCS
Azure Blob
MinIO
```

として扱える。

BRAINの汎用PatternをAWS等の特定Providerへ固定しない。

ただしProvider固有の実装知識を、

```text
implements
compatible_with
constraint_of
```

等のrelationでPatternへ接続することはできる。

---

## HELIXBRAIN-L2-INFRA-013

### Local / VPS / Cloud / GPUを同じ抽象で扱う

HELIXが利用するInfrastructureはCloudだけを前提にしない。

少なくとも、

* Local machine
* VPS
* Dedicated server
* Cloud
* GPU node
* Distributed worker node

等を、共通のResource / Capabilityモデルで表現できる知識構造を持つ。

特定のProviderやComputer構成をBRAINの前提にしない。

---

## HELIXBRAIN-L2-INFRA-014

### Infrastructureの構成関係をGraphとして持つ

Infrastructureは単体Componentの一覧ではなく、Topologyとして扱える。

例：

```text
Web
 ↓
Load Balancer
 ↓
Application
 ↓
Database
 ↓
Backup

Application
 ↓
Queue
 ↓
Worker
```

少なくとも、

* depends_on
* communicates_with
* replicated_by
* backed_up_by
* monitored_by
* failover_to
* secured_by
* deployed_on
* scales_with

等を扱える。

---

## HELIXBRAIN-L2-INFRA-015

### Cross-Domain relationを保持する

Infrastructure Domainを孤立させない。

例：

```text
API Design
   ↓ affects
Network Design
   ↓ affects
Latency / Availability

Data Design
   ↓ affects
Storage / Database
   ↓ affects
Backup / Recovery

Security Design
   ↓ constrains
Network / Runtime / Credential

Visual / UX
   ↓ may affect
Frontend Delivery / CDN / Performance
```

BRAIN内の他Domainとの関係を保持する。

---

## HELIXBRAIN-L2-INFRA-016

### Anti-Patternを持つ

Infrastructure固有の失敗知識を保持する。

例：

* Single Point of Failure
* Shared mutable production state
* Unbounded Retry
* Unbounded Queue
* Missing Timeout
* Backup Without Restore Test
* Monitoring Without Action
* Manual-only Recovery
* Hidden Dependency
* Undocumented Egress
* Unbounded Resource Growth

Anti-Patternには、

-成立する条件

* failure manifestation
* detection clue
* safer alternatives

を持たせる。

---

## HELIXBRAIN-L2-INFRA-017

### Infrastructure Patternの成熟度を管理する

Patternを、

```text
experimental
observed
validated
mature
deprecated
retired
```

等で区別できる。

内部Productで一度成功しただけで普遍的Patternへ昇格させない。

利用実績、Failure、反例、LABO評価を関係付ける。

---

# BRAIN外へ出す接続要求

## Product Core → BRAIN

製品で実際に成立したInfrastructure設計から、汎用化候補を渡す。

## LABO → BRAIN

運用実績、Failure、Incident、Recovery、Cost等を比較・評価し、再利用可能性が確認された構造を渡す。

## BRAIN → HELIX-HARNESS-CORE

対象製品のInfrastructure設計に利用可能なPattern、Unit、Part、Trade-off、Failure Patternを返す。

## BRAIN ↔ INTELLIGENCE

Infrastructure設計候補の選択、比較、影響予測にBRAIN知識を使う。

## BRAIN → HARNESS

Infrastructure Patternが必要とする、

* workload
* availability
* capacity
* recovery
* observability
* cost
* security

等の入力を、要求・設計義務へ接続する。

## BRAIN ↔ Infrastructure Runtime

BRAINは汎用のInfrastructure設計知識を渡す。

Runtimeの実状態をBRAINへ直接学習させず、利用結果はLABOの評価を経て汎用知識候補へ戻す。

---

# BRAINが持たないもの

BRAINは次を所有しない。

* 実Server
* 実Network
* 実Database
* 実Credential
* 現在のCPU/RAM/GPU使用率
* Productionの現在状態
* Deploymentの実行
* Backupの実行
* Restoreの実行
* Scalingの実行
* Provider account
* Infrastructure操作権限

これらはRuntime / OS / SECURITY / Runner等の責務へ分離する。

---

# 要求の核

> HELIX-BRAINは、Infrastructureを再利用可能な設計知識のDomainとして持ち、Compute、Network、Storage、Database、Deployment、Scaling、Availability、Recovery、Observability、Cost等について、Pattern・Design Unit・Part、成立条件、Failure、Trade-off、関係、根拠、版を構造化する。実Infrastructureの状態・操作・権限は所有せず、各製品のHELIX-HARNESS-COREとRuntimeが設計・実行するための知識を提供する。
