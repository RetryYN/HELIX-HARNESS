---
title: "HELIX-INTELLIGENCE L1要求アイデア（POの原文、2026-09-26）"
kind: source_snapshot
source: PO（2026-09-26のClaude作業sessionで提示）
recorded_at: 2026-09-26
decision_record: docs/governance/decisions/intelligence-l1-idea-po-decisions-2026-09-26.md
authority_effect: none
---

# HELIX-INTELLIGENCE L1要求アイデア（POの原文、2026-09-26）

2026-09-26（Asia/Tokyo）、POが「アイディアで」として示した本文を、そのまま保存する。
本書は書き換えない。現在の意味は[HELIX-INTELLIGENCEの企画（L1）案](../L1-planning/intelligence-intent.md)に置き、差分はgitで辿る。
原文の表題にある「v0.1」、原文中の「INTELLIGENCE-L1-001」等のID、コードブロックに付いたidは、原文の一部として残す。

---

# HELIX-INTELLIGENCE L1要求アイデア v0.1

## INTELLIGENCEの中心価値

HELIX-INTELLIGENCEは、HELIXの現在の状態を理解し、利用可能な根拠・知識・制約から、次に何をするべきかの判断候補を生成する。

要求、設計、状態、知識、権限そのものの正本にはならない。

```text id="w73pko"
BRAIN
= 何を知っているか

HARNESS / Product Core
= 何を満たすべきか

OS
= 何を実際に進めるか

INTELLIGENCE
= 今の状況ではどう判断するか
```

---

# INTELLIGENCE-L1-001

## 判断領域を分けて持つ

INTELLIGENCEは、ソフトウェア開発とHELIX自身の稼働について、判断対象をDomainとして分離して扱える。

初期Domain候補：

```text id="0x89ii"
Requirement / Meaning Support
Design
Implementation
Verification / CI
Integration / Change
Release
Operation / Incident
Worker
Model / Provider
HELIX Self
```

Domainは固定enumにせず、追加・分割・統合・退役可能とする。

各Domainが別システムになるわけではなく、INTELLIGENCE Core内部の判断領域として扱う。

---

# INTELLIGENCE-L1-002

## Domainごとに判断能力を持つ

各Domainでは必要に応じて、

```text id="wi8p6o"
Understand
Plan
Predict
Diagnose
Review
Recommend
```

を使える。

したがってINTELLIGENCEは、

```text id="9efpld"
Domain × Capability
```

として構成する。

例：

```text id="miy6go"
Design × Review
Implementation × Diagnose
CI × Predict
Worker × Recommend
Model × Compare
HELIX Self × Audit
```

全Domainに全Capabilityを強制しない。

---

# INTELLIGENCE-L1-003

## Current Situation Modelを形成する

INTELLIGENCEは、各機構の正本を直接所有せず、現在の状況を判断するための作業上の状況モデルを形成できる。

最低限、

* target
* requirement revision
* design revision
* ticket
* current state
* dependency
* evidence
* unresolved finding
* worker
* model/provider
* environment
* cost/budget
* risk
* time
* known / unknown

を関連づけられる。

ただし、このSituation Modelを元データのauthorityへ昇格させない。

```text id="vrkihu"
Source Mechanisms
↓ Connector
INTELLIGENCE Situation Model
↓
Judgment
```

元情報と矛盾した場合は元情報を優先する。

---

# INTELLIGENCE-L1-004

## 理解と事実を分ける

INTELLIGENCEは、

```text id="az47bj"
Observed Fact
Derived Interpretation
Hypothesis
Unknown
```

を区別できる。

AIが推論した内容を観測済み事実として扱わない。

判断の根拠へ、

* source
* revision
* evidence
* inference
* uncertainty

を残す。

---

# INTELLIGENCE-L1-005

## 計画候補を作る

INTELLIGENCEは、承認済み要求、HARNESS工程契約、現在状態、依存、risk、BRAINの知識等から、次の作業計画候補を生成できる。

計画候補には、

* goal
* target
* prerequisite
* dependency
* order
* parallelizable work
* expected result
* risk
* uncertainty
* stop condition
* fallback

を含められる。

INTELLIGENCE自身はticketを発行しない。

```text id="usj6d1"
INTELLIGENCE
Plan Proposal
↓ Connector
OS Promotion
↓
Ticket
```

とする。

---

# INTELLIGENCE-L1-006

## 予測を扱う

INTELLIGENCEは、現在状態と変更候補から将来状態を予測できる。

対象例：

* requirement change impact
* design impact
* dependency impact
* regression risk
* CI failure risk
* integration conflict
* performance risk
* release risk
* Worker failure probability
* cost/time tendency

予測には、

```text id="v7lsbx"
prediction
assumption
evidence
uncertainty
falsification condition
```

を持たせる。

予測を実測済み事実として扱わない。

後の実測との比較はLABOへ渡せる。

---

# INTELLIGENCE-L1-007

## 診断を行う

INTELLIGENCEは、発生中の異常・失敗・停滞について原因候補を絞り込める。

```text id="3c46w9"
Symptom
↓
Candidate Causes
↓
Evidence
↓
Discrimination
↓
Diagnosis Proposal
```

一つの相関だけで原因を確定しない。

必要な追加観測・検査も提示できる。

終了した仕事を長期的に比較し「何が改善したか」を評価するのはLABOとする。

---

# INTELLIGENCE-L1-008

## Reviewを独立した判断能力として持つ

INTELLIGENCEは、

* Requirement consistency
* Design
* Implementation
* Test
* CI
* Integration
* Release preparation
* Operational change
* HELIX自身

を対象にReviewを行える。

Review結果は、

```text id="injrfs"
finding
severity
scope
evidence
reproduction
counterexample
suggested route
```

へ分解できる。

Review結果だけでmerge、要求変更、release、acceptanceを成立させない。

---

# INTELLIGENCE-L1-009

## HELIX全体監査を持つ

INTELLIGENCEはHELIX全体について、

* authority mismatch
* design/runtime mismatch
* stale assumption
* missing evidence
* invalid projection
* responsibility leak
* unsupported behavior
* repeated failure
* mechanism boundary violation

等を監査できる。

現行AAFD候補に従い、

```text id="54vnww"
HEAD
authority
producer
evidence
reproduction
falsification
```

へ辿れる監査結果を生成する。

自由文の指摘だけでauthorityを変更しない。

---

# INTELLIGENCE-L1-010

## Worker適性判断を持つ

INTELLIGENCEは作業内容と実績から、Workerの配置候補を判断できる。

判断軸候補：

* task type
* domain
* complexity
* context requirement
* tool requirement
* success history
* failure history
* rework
* latency
* cost
* reliability

```text id="46924r"
Task
×
Worker Capability
×
Observed Performance
→ Placement Proposal
```

価格、モデル名、ベンチマークだけで配置を決めない。

実際の割当と進行はOSが行う。

---

# INTELLIGENCE-L1-011

## Model / Provider適性判断を持つ

モデルやproviderを一つの固定能力として扱わず、DomainとCapabilityごとに適性を評価できる。

例：

```text id="dsju1b"
Model A
├─ Design Review: strong
├─ Coding: medium
├─ Long-running stability: weak
└─ Cost: high

Model B
├─ Design Review: medium
├─ Coding: strong
├─ Long-running stability: strong
└─ Cost: low
```

同一corpus・同一responsibility scopeで、

* findings
* false positives
* misses
* reproducibility
* latency
* cost

を比較できる。

モデル更新だけで上位モデルと判定しない。

---

# INTELLIGENCE-L1-012

## 不確実性を第一級情報として持つ

INTELLIGENCEは「判断できない」を正常な結果として返せる。

最低限、

```text id="3c2upy"
known
probable
uncertain
unknown
contradictory
```

等を区別できる。

不足情報がある場合、

* additional evidence
* Discovery
* test
* review
* human decision

等の必要条件を提示する。

unknownを自動的に安全・成功・問題なしへ変換しない。

---

# INTELLIGENCE-L1-013

## 判断理由を再現できる

重要な判断候補は、

* input revisions
* applicable rules
* referenced BRAIN knowledge
* observations
* assumptions
* model/provider/version
* reasoning result
* uncertainty
* rejected alternatives

へ辿れる。

同じ判断を将来完全に再生成できることまでは要求しないが、

> なぜその判断候補になったか

を検証可能にする。

---

# INTELLIGENCE-L1-014

## Botを専門判断器として発行できる

INTELLIGENCEは、繰り返し発生し、対象・入力・判定条件・停止条件を限定できる判断について、専門Botを発行できる。

現行Conceptにある、

* Bugbot
* Helpbot
* Crawler

を含む。

ただしBotごとの詳細責務はL2以降で定める。

BotはINTELLIGENCEそのものとは別identityを持ち、

```text id="326831"
purpose
scope
input
output
allowed action
stop condition
version
```

を持つ。

Bot追加を新しいauthority追加にしない。

---

# INTELLIGENCE-L1-015

## 繰り返し失敗からBugbot候補を作る

CIや実行で繰り返し現れる失敗について、

* failure pattern
* reproducibility
* machine-detectability
* false positive
* scope
* repairability

を確認し、機械的に扱えるものからBugbot候補へ昇格できる。

単発failureから恒久Botを作らない。

---

# INTELLIGENCE-L1-016

## 限定修復を扱う

現行候補に従い、INTELLIGENCEは限定された問題について、

```text id="2wo3v5"
Detect
↓
Diagnose
↓
Repair Candidate
↓
Bounded Repair
```

まで扱える。

修復対象には、

* target revision
* actor
* write-set
* side effect
* budget
* deadline
* retry
* impact scope
* recovery point

を持つ。

要求・設計・検証義務そのものを修復器が勝手に変更しない。

意味変更が必要なら上流へ戻す。

---

# INTELLIGENCE-L1-017

## 修復とauthorityを分離する

限定修復をINTELLIGENCEが担当しても、

```text id="yhhl8t"
操作許可
→ SECURITY

隔離された実行
→ Runner / Sandbox

修復後の検証義務
→ HARNESS

検収
→ OS
```

を代替しない。

INTELLIGENCEが修復案を作れることから包括的write権限を生成しない。

---

# INTELLIGENCE-L1-018

## 判断の時間軸をLABOと分離する

INTELLIGENCEは主として、

```text id="efiguj"
現在
↓
次に何をするか
```

を扱う。

LABOは、

```text id="jhbll2"
過去
↓
何が起きたか
↓
何が効いたか
```

を扱う。

INTELLIGENCE自身が長期的な改善効果を自己評価して採択しない。

結果はLABOへ渡し、LABOの評価を今後の判断材料として受け取れる。

---

# INTELLIGENCE-L1-019

## BRAINと判断を混同しない

BRAINのPattern、Unit、Part等は判断材料として利用できる。

しかし、

```text id="lrk1zy"
BRAIN
「選択肢A/B/Cがある」

INTELLIGENCE
「今回の状態ではBが適用候補」
```

と分離する。

INTELLIGENCEが判断した結果をBRAINの汎用知識へ直接書き込まない。

汎用化はLABO等の評価経路を通す。

---

# INTELLIGENCE-L1-020

## Product Coreの意味を上書きしない

INTELLIGENCEは製品固有の要求・設計・意味を理解材料として利用できる。

ただし、

* requirement
* design authority
* acceptance
* product-specific meaning

を直接変更しない。

矛盾・不足・改善候補は適切なBackflow先を提示する。

---

# 3.0への拡張

## Local Intelligence Learning

1.0では外部モデルを利用して上記判断能力を成立させる。

3.0では、LABOから返された評価済み事例・反例を使い、

* Domain専用モデル
* Capability専用モデル
* 小型ローカルモデル
* routing model
* diagnosis model
* reviewer model

等を学習・調整・評価できる。

```text id="1gr4ii"
LABO
evaluated episodes
↓
INTELLIGENCE
training / tuning
↓
candidate model
↓
comparison
↓
qualified model
```

学習しただけで現行モデルと交換しない。

---

# INTELLIGENCE Coreの構造イメージ

```text id="lvmumv"
HELIX-INTELLIGENCE
│
├─ Situation Domain
│  └─ Current Situation Model
│
├─ Judgment Domains
│  ├─ Requirement / Meaning
│  ├─ Design
│  ├─ Implementation
│  ├─ Verification
│  ├─ Integration
│  ├─ Release
│  ├─ Operation
│  ├─ Worker
│  ├─ Model
│  └─ HELIX Self
│
├─ Judgment Capabilities
│  ├─ Understand
│  ├─ Plan
│  ├─ Predict
│  ├─ Diagnose
│  ├─ Review
│  └─ Recommend
│
├─ Audit
│
├─ Bot
│  ├─ Bugbot
│  ├─ Helpbot
│  └─ Crawler
│
└─ Bounded Repair
```

DomainとCapabilityは別軸で組み合わせる。

---

# Core外へ出す接続

## BRAIN → INTELLIGENCE

汎用Pattern、Unit、Part、適用条件、反例を判断材料として受け取る。

## Product Core / HARNESS → INTELLIGENCE

製品固有の要求、設計、工程契約、検証義務を受け取る。

## LABO → INTELLIGENCE

過去の評価結果、成功・失敗・反例、Worker/model実績を判断材料として受け取る。

## INTELLIGENCE → OS

計画、配置、診断、修復等の実行候補を渡す。

OSが登録・ticket化・進行を担う。

## INTELLIGENCE ↔ SECURITY

必要な操作に対する許可・制約を確認する。

## INTELLIGENCE → Runner / Sandbox

許可済みの限定実行だけを接続経由で渡す。

## INTELLIGENCE → LABO

判断、予測、配置、修復の結果を評価対象として返す。

これらはConnection RequirementとしてCore外に置く。

---

# 複数機構で成立する能力

以下をINTELLIGENCE単体の要求にしない。

```text id="msbt2k"
自動開発計画
BRAIN + Product Core + INTELLIGENCE + OS

最適Worker配置
LABO + INTELLIGENCE + OS

限定自動修復
INTELLIGENCE + SECURITY + Runner + HARNESS + OS

継続的自己改善
LABO + BRAIN + INTELLIGENCE + OS + HARNESS

将来の動的開発フロー
BRAIN + Product Core + INTELLIGENCE + OS
```

これらはComposite Requirementとして扱う。

---

# 要求の核

HELIX-INTELLIGENCEを一文で定義するなら、

> **HELIX-INTELLIGENCEは、HELIXと開発対象の現在状態を、根拠・版・不確実性付きで理解し、開発領域ごとに計画・予測・診断・レビュー・配置等の判断候補を生成する。判断結果はauthorityではなく、実行・採択・評価を担う各機構へ接続して利用する。**

とする。
