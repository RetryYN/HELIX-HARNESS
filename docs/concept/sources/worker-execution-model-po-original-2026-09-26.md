---
title: "HELIX Worker実行モデル統合・旧実行主体廃止要求（POの原文、2026-09-26）"
kind: source_snapshot
source: PO（2026-09-26のClaude作業sessionで提示）
recorded_at: 2026-09-26
decision_record: docs/governance/decisions/worker-execution-model-po-decisions-2026-09-26.md
authority_effect: none
---

# HELIX Worker実行モデル統合・旧実行主体廃止要求（POの原文、2026-09-26）

2026-09-26（Asia/Tokyo）、POが示した本文を、そのまま保存する。
本書は書き換えない。現在の意味は[HELIX Concept](../helix-concept.md)と各機構の文書に置き、差分はgitで辿る。
原文の表題にある「v0.1」と、原文の名前「HELIX Runtime Infrastructure」は原文の一部として残す。

---

# HELIX Worker実行モデル統合・旧実行主体廃止要求 v0.1

## 1. 目的

HELIXの実行主体をWorkerへ統一し、同じ実行責務を表す複数の概念を廃止する。

廃止対象は次のとおりとする。

* HELIXサブエージェントという独立した実行主体
* エージェントレーンというWorkerとは別の実行主体
* Runnerという独立した共通部品
* Sandboxという独立した共通部品

これらが保持していた必要能力は削除せず、Worker、HELIX-SECURITY、HELIX Runtime Infrastructureへ責務を再配置する。

---

# 2. 新しい基本モデル

HELIXにおける作業の実行主体はWorkerへ統一する。

```text
INTELLIGENCE
Worker配置候補
        ↓

HELIX-OS
Ticket / Assignment
        ↓

HELIX-SECURITY
Authority / Constraints
        ↓

Worker
├─ Main Agent
├─ Subagents
├─ Provider / Model
├─ Execution Control
├─ Resource Binding
├─ Isolation Constraint
└─ Result Collection
        ↓

HELIX Runtime Infrastructure
Local / VPS / GPU / Cloud / Runtime
```

Workerは論理的な作業主体であると同時に、一つの実行レーンを表す。

---

# RETIRE-WORKER-001

## HELIXサブエージェントを独立した実行主体として廃止する

HELIXサブエージェントを、Workerと並列のHELIX共通実行主体として扱わない。

旧：

```text
Execution Actor
├─ Agent Lane
└─ HELIX Subagent
```

新：

```text
Execution Actor
└─ Worker
   ├─ Main Agent
   └─ Subagents
```

SubagentはWorker内部の実装能力として扱う。

---

# RETIRE-WORKER-002

## Subagentの構成はWorkerへ委ねる

Workerは、利用するProviderやRuntimeが対応する場合、割り当てられた作業を完了するためにSubagentを構成できる。

例：

```text
Worker: Codex
├─ Explorer
├─ Implementation
└─ Test

Worker: Claude
├─ Research
├─ Architecture
└─ Review Support
```

HELIXはProvider固有のSubagent構造を共通仕様として再実装しない。

---

# RETIRE-WORKER-003

## Subagentは親WorkerのAuthorityを拡張できない

Subagentの実行可能範囲は必ず親Worker以下とする。

```text
Subagent Authority
⊆
Parent Worker Authority
```

Subagentは親Workerを超えて、

* project
* tenant
* environment
* path
* network
* credential
* operation
* budget
* resource
* deadline

を拡張できない。

---

# RETIRE-WORKER-004

## Subagentによる自己承認を禁止する

作成Worker内部のSubagentによるReviewを、独立検証として扱わない。

```text
Worker A
├─ Implementation
└─ Review Subagent
```

はWorker A内部の自己検査として扱う。

独立検証が必要な場合は、

```text
Worker A
Producer

↓

Worker B
Verifier
```

のように別Workerへ割り当てる。

---

# RETIRE-WORKER-005

## エージェントレーンを独立概念として廃止する

「Agent Lane」と「Worker」を別の実行主体として管理しない。

Worker自身が一つの作業レーンを表す。

```text
Worker
= Execution Actor
= Work Lane
```

必要に応じてWorkerへ、

* producer
* verifier
* research
* security
* maintenance
* specialist

等の役割を付与できる。

Laneという名称を残す場合も、Workerの配置・Capacityを表す属性またはViewとして扱い、独立Authorityを持たせない。

---

# RETIRE-RUNNER-001

## Runnerを独立共通部品として廃止する

RunnerをHELIXの独立した実行主体・共通部品として扱わない。

Runnerが持っていた次の能力はWorkerのExecution能力へ移す。

* process / CLI / Agent起動
* stop
* cancel
* timeout
* stdin / input
* environment binding
* runtime selection
* exit status
* stdout / stderr
* result collection
* artifact collection
* diff collection
* execution receipt

---

# RETIRE-SANDBOX-001

## Sandboxを独立共通部品として廃止する

Sandboxという独立したHELIX部品を置かない。

Sandboxが意味していた隔離能力は残す。

主な能力：

* filesystem isolation
* worktree isolation
* project isolation
* network restriction
* credential isolation
* environment sanitization
* process isolation
* CPU / RAM / GPU limit
* timeout
* side-effect restriction

これらをWorkerのExecution Constraintとして扱う。

---

# RETIRE-SANDBOX-002

## SECURITYが実行制約を所有する

Workerが実行時に守る制約はHELIX-SECURITYが所有する。

例：

```text
Worker = Worker-A

project = Project-A
environment = verification
write = /project-a/worktree-3
network = api.openai.com
credential = scoped-token-X
memory = 8GB
timeout = 30min
```

Workerはこの制約を自己拡張できない。

---

# RETIRE-SANDBOX-003

## Runtime Infrastructureが物理的な実行基盤を提供する

Workerの実行はHELIX Runtime Infrastructure上で成立する。

Runtime Infrastructureは、

* machine
* CPU
* RAM
* GPU
* storage
* network
* process/container runtime

等の実Resourceを提供する。

必要な隔離は、そのRuntimeで利用可能な機構によって適用する。

例：

* native provider sandbox
* process isolation
* container
* worktree
* OS permission
* Landlock
* bubblewrap
* VM
* remote execution environment

特定方式をHELIX共通仕様へ固定しない。

---

# RETIRE-WORKER-006

## Workerが実行結果の責任単位となる

実行結果はRunnerではなくWorker identityへ結び付ける。

最低限、

* worker identity
* provider
* model
* role
* ticket
* requirement revision
* project
* environment
* runtime
* authority
* constraints
* started_at
* finished_at
* result
* artifacts
* execution evidence

を追跡可能にする。

Subagentを利用した場合も親Workerまで辿れる。

---

# RETIRE-WORKER-007

## Worker内部のSubagent実行も観測可能にする

Subagentの内部構成をHELIXが統制する必要はないが、

* Subagentを使用したこと
* 何の目的だったか
* どのWorkerから派生したか
* どのAuthority下だったか
* どのResourceを消費したか
* どの成果へ関与したか

を必要な範囲で追跡可能にする。

Providerの内部推論過程そのものを要求しない。

---

# RETIRE-WORKER-008

## WorkerのCapabilityを明示する

Workerごとに利用可能な能力を把握できるようにする。

例：

```text
Worker-A
provider: Codex
capabilities:
  - coding
  - shell
  - test
  - subagent
  - web: false

Worker-B
provider: Claude
capabilities:
  - coding
  - review
  - research
  - subagent

Worker-C
provider: Local
capabilities:
  - coding
  - observation
  - offline
```

INTELLIGENCEはCapability等を材料として配置候補を出す。

---

# RETIRE-WORKER-009

## WorkerとModelを分離する

Worker identityをModel名と同一視しない。

```text
Worker
├─ Provider
├─ Model
├─ Runtime
├─ Role
├─ Capability
└─ Configuration
```

Model変更だけでWorker identityや作業責務を暗黙変更しない。

---

# RETIRE-WORKER-010

## WorkerとRuntime Infrastructureを分離する

Workerは作業主体であり、Machineそのものではない。

```text
Worker-A
↓ runs_on
GPU-Node-02
```

Workerは必要に応じて別Runtime Resourceへ移動できる。

Runtime変更でTicket・Requirement・Worker責務を失わない。

---

# RETIRE-WORKER-011

## WorkerのExecution Lifecycleを持つ

Worker実行について最低限、

```text
Assigned
→ Admitted
→ Running
→ Completed

または

→ Blocked
→ Cancelled
→ Failed
→ Revoked
```

等の意味を区別できる。

具体状態名は下流設計で確定する。

OSは作業進行を管理し、Worker実行状態そのものとの意味を混同しない。

---

# RETIRE-WORKER-012

## Revoke時に実行中Workerを停止できる

HELIX-SECURITYがAuthority失効を通知した場合、

```text
SECURITY
↓ revoke
Worker
↓
stop execution
↓
result / partial artifact quarantine
```

を成立させる。

Runnerという中間主体を必要としない。

---

# RETIRE-WORKER-013

## Worker終了時に実行状態を次Jobへ漏らさない

Job終了後に、

* process
* temporary credential
* environment
* temporary file
* lock
* network session
* runtime reservation

等のJob固有状態を次のAssignmentへ暗黙継承しない。

必要な永続状態は明示された正本へ保存する。

---

# RETIRE-WORKER-014

## Worker実行とHELIX-OSの責務を分ける

HELIX-OSは、

* Assignment
* Ticket
* priority
* dependency
* budget
* progression
* retry / reassignment

を管理する。

Workerは、

> 割り当てられた作業を、与えられたAuthorityとConstraint内で実行する

ことを担当する。

OS自身がWorker実装へ変わらない。

---

# RETIRE-WORKER-015

## Worker実行とINTELLIGENCEの責務を分ける

HELIX-INTELLIGENCEは、

* Worker suitability
* model suitability
* placement proposal
* diagnosis
* replanning proposal

を返せる。

INTELLIGENCE自身を常にWorkerとして扱わない。

実作業が必要な場合はWorker Assignmentへ落とす。

---

# RETIRE-WORKER-016

## Botを特別な実行階級にしない

Bug Bot、Security Bot、Research Bot等は必要に応じてSpecial Purpose Workerとして実行できる。

```text
Bot
= specialized Worker usage
```

とし、

```text
Worker
Bot
HELIX Subagent
Agent Lane
```

のような並列実行主体を増やさない。

---

# 3. 新しい責務境界

```text
HELIX-INTELLIGENCE
「どのWorkerが適しているか」
        ↓

HELIX-OS
「このTicketをWorker-Aへ割当」
        ↓

HELIX-SECURITY
「Worker-Aはこの範囲だけ許可」
        ↓

Worker-A
├─ Main Agent
├─ optional Subagents
├─ Execution Control
└─ Isolation Constraint
        ↓

HELIX Runtime Infrastructure
実Resourceを提供
        ↓

Result / Evidence
        ↓

HELIX-OS / HARNESS / LABO
```

---

# 4. 廃止後も保持しなければならない能力

概念を廃止しても、次の能力を欠落させてはならない。

## HELIXサブエージェントから保持

* 作業分解
* 専門Agent利用
* 並列実行
* Provider-native Subagent利用

→ Worker内部へ移す。

## Agent Laneから保持

* 継続した実行枠
* Capacity
* Role
* Provider / Model
* Work assignment

→ Workerへ統合する。

## Runnerから保持

* start
* stop
* cancel
* timeout
* result collection
* execution evidence

→ Worker Executionへ移す。

## Sandboxから保持

* scope isolation
* filesystem isolation
* network restriction
* credential isolation
* resource limit
* process isolation

→ SECURITY Constraint + Worker Execution + Runtime Infrastructureへ分割する。

---

# 5. 現行文書の変更要求

少なくとも次を更新対象とする。

## HELIX Concept

旧：

```text
実行者
エージェントレーン・HELIXサブエージェント

Runner／Sandbox
限定実行
```

新：

```text
Worker
作業実行・必要に応じたSubagent編成
```

とする。

`Runner／Sandbox` を機構一覧・共通部品一覧から削除する。

---

## HELIX-OS

旧：

```text
エージェントレーンとHELIXサブエージェントへ割り当てる
```

新：

```text
Workerへ割り当てる
```

とする。

旧：

```text
実行はRunner／Sandbox
```

新：

```text
実行はWorker
```

とする。

---

## HELIX-SECURITY

旧：

```text
制約はSECURITYが決め、
Runner／Sandboxが物理的に適用する
```

新：

```text
SECURITYが実行ConstraintとAuthorityを定め、
Workerの実行環境がその制約を強制する
```

とする。

Revoke先も、

```text
Runner
```

ではなく、

```text
Worker execution
```

へ置き換える。

---

## HELIX Runtime Infrastructure

Workerが実行されるPhysical Resource、

* local
* VPS
* server
* GPU node
* cloud

と、そのResource Capacity / Runtime状態を持つ。

Workerの作業責務やTicket状態をInfrastructure側へ移さない。

---

# 6. Migration条件

概念名の削除だけで移行完了としない。

既存のRunner、Sandbox、Agent Lane、HELIX Subagentに結び付く要求・設計・実装・テスト・設定・Hook・CI・文書を全数確認し、

```text
retain
→ Worker

retain
→ SECURITY

retain
→ Runtime Infrastructure

replace

retire
```

へ分類する。

必要能力の移管先が決まらない項目を削除してはならない。

---

# 7. 非目標

本変更では、

* Subagent利用そのものを禁止しない
* Sandbox技術そのものを禁止しない
* Provider native sandboxを禁止しない
* Container/VM/worktreeを禁止しない
* Workerの内部構成を一種類へ固定しない
* 全Workerを同一Providerへ統一しない

あくまでHELIXの上位Architectureから重複した実行主体・共通部品を除去する。

---

# 8. 廃止後の最終モデル

```text
Worker
├─ Identity
├─ Role
├─ Provider
├─ Model
├─ Capability
├─ Ticket / Assignment
├─ Main Agent
├─ Optional Subagents
├─ Authority
├─ Execution Constraints
├─ Resource Binding
├─ Execution Lifecycle
└─ Result / Evidence
```

これをHELIXにおける唯一の共通作業実行主体とする。

---

# 要求の核

> **HELIXは作業実行主体をWorkerへ統一し、HELIXサブエージェント、Agent Lane、Runner、Sandboxを独立した上位概念として廃止する。Workerは必要に応じてProvider固有のSubagentを内部で構成できるが、親WorkerのScope・Authority・Budgetを超えてはならない。実行制約はHELIX-SECURITY、実ResourceはHELIX Runtime Infrastructure、割当と進行はHELIX-OSが担う。独立検証が必要な場合は作成Worker内部のSubagentではなく別Workerを割り当てる。廃止対象が持っていた必要能力は移管先を確定してから退役させ、名称削除による能力欠落を認めない。**
