---
title: "HELIX-HARNESS Infrastructure要求候補（POの原文、2026-09-26）"
kind: source_snapshot
source: PO（2026-09-26のClaude作業sessionで提示）
recorded_at: 2026-09-26
decision_record: docs/governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md
authority_effect: none
---

# HELIX-HARNESS Infrastructure要求候補（POの原文、2026-09-26）

2026-09-26（Asia/Tokyo）、POが示した本文を、そのまま保存する。1回目の貼り付けは途中で切れていたため、2回目に貼られた全文を保存した。
本書は書き換えない。現在の意味は[HARNESSのInfrastructureの要求候補](../candidates/infrastructure-requirements.md)に置き、差分はgitで辿る。
原文の表題にある「v0.1」、原文中の「HARNESS-INFRA-001」等のID、コードブロックに付いたidは、原文の一部として残す。

---

# HELIX-HARNESS Infrastructure要求候補 v0.1

## 位置づけ

HELIX-HARNESSはInfrastructureそのものを所有・運転しない。

HARNESSが持つのは、

> 対象製品に必要なInfrastructure要求を形成し、設計義務・検証義務・Release条件・運用評価まで一貫して接続する工程契約

である。

```text id="bc8zqa"
BRAIN
= Infrastructureの汎用設計知識

HELIX-HARNESS
= 何を要求・設計・検証すべきか

HELIX-HARNESS-CORE
= 今回の製品のInfrastructure要求・設計

Infrastructure Runtime
= 実際に稼働するInfrastructure
```

---

## HARNESS-INFRA-001

### Infrastructure適用性を要求形成時に確認する

対象製品について、少なくとも次の品質領域の適用性を確認する。

* Availability
* Reliability
* Performance
* Capacity
* Scalability
* Cost
* Security
* Privacy
* Recovery
* Backup / Restore
* Observability
* Deployment
* Operation
* Maintenance

各項目は、

```text id="v12k1a"
required
conditional
N/A
unresolved
```

を理由付きで区別する。

不明をN/Aへ変換しない。

---

## HARNESS-INFRA-002

### Infrastructure設計に必要な入力を要求から形成する

Infrastructure設計へ進む前に、必要に応じて次を要求入力として確認する。

* workload
* expected traffic
* concurrency
* data volume
* data criticality
* latency expectation
* availability expectation
* durability expectation
* recovery expectation
* geographic constraint
* security constraint
* privacy constraint
* external dependency
* operational constraint
* cost / budget constraint
* deployment constraint

値をHARNESSが勝手に決めない。

不足している入力はBackflowで要求へ戻す。

---

## HARNESS-INFRA-003

### BRAINのInfrastructure Patternと接続する

Infrastructure設計義務を形成するとき、HELIX-BRAINのInfrastructure Domainから、

* Pattern
* Design Unit
* Part
* applicability
* trade-off
* failure pattern
* anti-pattern
* evidence

を参照できる。

BRAINにPatternが存在することを、その製品への採用決定としない。

---

## HARNESS-INFRA-004

### Infrastructure要求を単体・接続・構成体に分ける

Infrastructure要求についても、

```text id="94vwfe"
Unit
Connection
Composite
```

を別identityとして扱う。

例：

```text id="5g5smy"
Database単体が成立
≠
Application → Database接続が成立
≠
System全体の可用性が成立
```

単体の成功からInfrastructure全体の成立を推定しない。

---

## HARNESS-INFRA-005

### Infrastructure Topologyの設計義務を導く

対象製品の要求から、必要なInfrastructure componentと関係を設計義務として導ける。

対象例：

* Compute
* Network
* Storage
* Database
* Cache
* Queue
* Load Balancer
* Runtime
* External Service
* Monitoring
* Backup
* Recovery

Componentの存在だけでなく、

```text id="p5xdu7"
depends_on
communicates_with
deployed_on
replicated_by
backed_up_by
monitored_by
failover_to
```

等のConnectionを設計対象にする。

---

## HARNESS-INFRA-006

### Failureを設計入力に含める

正常動作だけでInfrastructureを設計しない。

適用するFailure候補を明示し、

* dependency failure
* network failure
* resource exhaustion
* storage exhaustion
* queue saturation
* timeout
* partial failure
* configuration error
* deployment failure
* backup failure
* restore failure
* external provider failure

について、

```text id="ae960h"
Detection
Impact
Containment
Recovery
Verification
```

を必要に応じて設計義務へ含める。

---

## HARNESS-INFRA-007

### Single Point of Failureを明示する

重要な機能・データ・接続について、

> 何が壊れたら全体が止まるか

を設計上確認できる。

Single Point of Failureを必ず冗長化するという要求にはしない。

受容する場合も、

* rationale
* impact
* recovery
* accepted risk

を明示する。

---

## HARNESS-INFRA-008

### CapacityとSaturationを設計・検証へ接続する

適用対象では、

* expected capacity
* resource limit
* bottleneck
* saturation behavior
* scaling condition
* backpressure
* overload behavior

を確認できる。

性能が正常時に速いことだけでなく、

> 限界を超えたときにどうなるか

を設計・検証対象にする。

---

## HARNESS-INFRA-009

### Observabilityを後付けにしない

Infrastructure設計時点で、

> 成立・異常・劣化・復旧を何で観測するか

を決める。

必要に応じて、

* Metric
* Log
* Trace
* Health
* Dependency status
* Capacity
* Saturation
* Error
* Latency
* Deployment state
* Recovery state

を観測義務として持つ。

観測不能な状態を「正常」と判定しない。

---

## HARNESS-INFRA-010

### Incidentの成立条件を要求化する

「何をIncidentとして扱うか」を製品要求とInfrastructure設計へ接続する。

最低限、

* observable symptom
* affected scope
* severity condition
* detection
* notification
* response boundary
* recovery condition
* evidence

へ辿れるようにする。

Incident定義を実装後の運用判断だけに任せない。

---

## HARNESS-INFRA-011

### BackupとRestoreを別成果として検証する

Backupの存在だけでRecoverability成立としない。

```text id="p3l9kw"
Backup Created
≠
Restore Verified
≠
Recovery Requirement Satisfied
```

とする。

適用対象では、

* backup対象
* backup version
* restore target
* restore procedure
* restored integrity
* recovery time
* acceptable data loss

へ接続する。

RTO/RPOの具体値は製品要求が所有する。

---

## HARNESS-INFRA-012

### ReleaseとDeploymentを分離する

Release可能であることと、特定環境へDeploymentされたことを区別する。

Deployment設計には必要に応じて、

* artifact
* artifact version
* target environment
* configuration
* dependency
* migration
* precondition
* health verification
* rollback
* post-deployment observation

を要求する。

```text id="4h40x1"
Release Eligible
≠
Deployed
≠
Observed Healthy
```

とする。

---

## HARNESS-INFRA-013

### Infrastructure変更を通常の変更影響解析へ含める

次の変更をInfrastructure Changeとして追跡する。

* Compute
* Network
* Storage
* Database
* Dependency
* Runtime
* Deployment method
* Configuration
* Resource size
* Scaling rule
* Backup
* Recovery
* Monitoring
* Provider
* Region / location

Infrastructure変更から、

```text id="hrhz2s"
affected requirement
affected design
affected connection
required re-verification
operational observation
```

を導出する。

---

## HARNESS-INFRA-014

### Infrastructure Driftを設計差分として扱えるようにする

Desired InfrastructureとActual Infrastructureが異なる可能性を前提とする。

HARNESSは、

```text id="bhnt8q"
Desired
↓ compare
Actual
↓
Drift
```

を検証対象として定義できる。

実際のDrift検出・Runtime state取得はHARNESS自身では行わない。

---

## HARNESS-INFRA-015

### Costを非機能要求として扱う

Costを運用後の請求額だけで扱わない。

必要に応じて、

* expected resource cost
* idle cost
* scaling cost
* redundancy cost
* storage cost
* network cost
* model/runtime cost
* operational cost

をInfrastructure DesignのTrade-offへ接続する。

具体価格や予算値は対象製品の要求が所有する。

---

## HARNESS-INFRA-016

### Security要求とInfrastructure設計を接続する

HELIX-SECURITYまたは対象製品のSecurity要求から、

* network boundary
* isolation
* credential boundary
* data boundary
* execution boundary
* external connection
* update boundary

等のInfrastructure設計義務を導出できる。

HARNESS自身が操作Authorityを発行しない。

---

## HARNESS-INFRA-017

### Infrastructureの検証義務を動的に導出する

変更内容、Risk、Layer、対象Infrastructureから必要な検証義務を導出する。

例：

```text id="4l7j2l"
Network change
→ connectivity / isolation / failure verification

Database change
→ migration / consistency / rollback verification

Scaling change
→ load / saturation / recovery verification

Backup change
→ backup + actual restore verification
```

固定された「Infrastructure CI一式」を毎回走らせるのではなく、変更と要求から必要な証明範囲を導く。

これはHARNESS-L2-005のDynamic CI原則に従う。

---

## HARNESS-INFRA-018

### Evidenceを再利用しつつInfrastructure固有義務を証明する

下位Componentの有効なEvidenceは上位へ集約できる。

ただし、

```text id="qu76u0"
Compute PASS
Database PASS
Network PASS
```

だけで、

```text id="71lzgx"
System Infrastructure PASS
```

とはしない。

ConnectionおよびComposite固有の未充足義務だけを追加検証する。

---

## HARNESS-INFRA-019

### 運用観測をL12へ接続する

Infrastructureについて、

```text id="uv27hg"
Designed
Implemented
Verified
Deployed
Observed
Operated
```

を区別する。

検証環境で成功したことを、本番運用成立へ読み替えない。

L12では実運用から、

* availability
* performance
* failure
* recovery
* saturation
* cost
* incident
* observability completeness

等を評価できるようにする。

---

## HARNESS-INFRA-020

### 運用結果を要求Backflowへ接続する

実運用で、

* 想定外Failure
* Capacity不足
* Cost逸脱
* Recovery失敗
* Observability不足
* Incident再発
* Infrastructure assumption不成立

が確認された場合、

```text id="c26y08"
Observation
↓
Finding
↓
Backflow
↓
Requirement / Design revision
```

へ戻せる。

運用logから要求を自動変更しない。

---

# サービス⑥ Releaseとの関係

Concept上のサービス⑥「リリースの仕組み（インフラ）」について、HARNESSは最低限、

```text id="ulac03"
Infrastructure Requirement
→ Infrastructure Design
→ Implementation / IaC等
→ Verification
→ Release Eligibility
→ Deployment Contract
→ Recovery Contract
```

を一つの追跡可能な流れとして扱えるようにする。

特定の、

* AWS
* GCP
* Terraform
* OpenTofu
* Ansible
* Docker
* Kubernetes

等をHARNESSの固定技術にしない。

---

# サービス⑦ Operation / Maintenanceとの関係

サービス⑦では、

```text id="11iwxw"
Observation
Incident
Recovery
Maintenance
Infrastructure Change
Backflow
```

をサービス⑥で作ったInfrastructure要求・設計へ戻せることを要求する。

サービス⑥と⑦を別リリース単位として成立させつつ、接続要求で結ぶ。

---

# BRAINとの境界

```text id="fa9sp7"
BRAIN
「InfrastructureにはどんなPatternがあるか」

HARNESS
「このProductでは何を要求・設計・検証しなければならないか」

HELIX-HARNESS-CORE
「このProductでは何を採用したか」
```

HARNESSはInfrastructure Pattern Catalogを複製しない。

---

# Runtimeとの境界

HARNESSは、

* Server作成
* Network変更
* Database操作
* Scaling
* Deploy
* Backup
* Restore
* Monitoring
* Incident対応

を直接実行しない。

HARNESSは、

> それらが何を満たし、何を証明しなければならないか

を定義する。

---

# 既存HARNESS要求への接続

主に既存要求を具体化する。

```text id="ogbl6x"
HARNESS-L2-003
→ Infrastructureの開始・freeze・Backflow・完了条件

HARNESS-L2-004
→ Infrastructure変更影響・trace・再検証範囲

HARNESS-L2-005
→ Infrastructure検証義務・Evidence・Dynamic CI

HARNESS-L2-006
→ Release/導入/依存/Recovery条件

HARNESS-L2-008
→ Infrastructure要求入力の形成・不足検出

HARNESS-L2-009
→ BRAIN Infrastructure Patternから設計義務導出
```

新しい独立HARNESSを作る要求ではない。

---

# 要求の核

> HELIX-HARNESSは、対象製品に必要なInfrastructure品質と運用条件の適用性を要求形成時に確認し、BRAINのInfrastructure設計知識を利用して、製品固有のInfrastructure要求、設計義務、Failure、Observability、Recovery、Release、検証義務、L12運用評価までを同じRequirement identityで接続する。Infrastructureの実状態・実行・権限は所有しない。
