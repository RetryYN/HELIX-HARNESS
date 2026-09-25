---
title: "HELIX-BRAIN L1要求アイデア（POの原文、2026-09-26）"
kind: source_snapshot
source: PO（2026-09-26のClaude作業sessionで提示）
recorded_at: 2026-09-26
decision_record: docs/governance/decisions/brain-l1-idea-po-decisions-2026-09-26.md
authority_effect: none
---

# HELIX-BRAIN L1要求アイデア（POの原文、2026-09-26）

2026-09-26（Asia/Tokyo）、POが「こんな感じのアイディアで」として示した本文を、そのまま保存する。
本書は書き換えない。現在の意味は[HELIX-BRAINの企画（L1）案](../L1-planning/brain-intent.md)に置き、差分はgitで辿る。
原文の表題にある「v0.1」と、原文中の「BRAIN-L1-001」等のIDは原文の一部として残す。

---

# HELIX-BRAIN L1要求アイデア v0.1

## BRAINの中心価値

HELIX-BRAINは、HELIXが複数の製品開発から得た再利用可能な設計知識を、領域ごとの構造として保持し、製品やAIが変わっても再利用できる形で提供する。

製品固有の要求・設計・判断結果を保存する場所ではない。

```text
Product-specific
→ HELIX-HARNESS-CORE

Reusable design knowledge
→ HELIX-BRAIN
```

---

## BRAIN-L1-001：設計知識を領域別に持つ

人は、再利用可能な設計知識を、意味の異なる設計領域へ分けて管理できる。

初期領域候補：

* Software / System Architecture
* Application Architecture
* Backend
* Frontend
* API / Integration
* Data / Database
* Infrastructure
* Security Design
* Reliability / Recovery
* Performance
* Observability
* Testing / Quality
* Operations / Maintenance
* UX / Interaction
* Visual Design
* Accessibility

領域は固定enumにせず、追加・分割・統合・退役できる。

製品名や特定projectをDomainとして扱わない。

---

## BRAIN-L1-002：各領域に階層化された設計知識を持つ

各Domainは最低限、

```text
Domain
└─ Pattern
   └─ Design Unit
      └─ Part
```

として分解できる。

例：

```text
Visual Design
└─ Dashboard Pattern
   ├─ Navigation Unit
   ├─ KPI Unit
   └─ Work Area Unit
       ├─ Table Part
       ├─ Filter Part
       └─ Status Part
```

単なるファイル・コード断片・UI部品集にはしない。

---

## BRAIN-L1-003：Patternが「いつ使えるか」を持つ

Design Patternは形だけでなく、

* 解決する問題
* 前提
* applicability
* 必要input
* constraint
* trade-off
* negative case
* failure mode
* compatible pattern
* incompatible pattern
* evidence
* maturity

を持てる。

「このパターンが存在する」ことと「今回これを採用すべき」を区別する。

---

## BRAIN-L1-004：正解を一つに潰さない

同一問題に複数の成立するPatternが存在する場合、それらを保持できる。

例：

```text
Data Consistency
├─ Strong Consistency Pattern
├─ Eventual Consistency Pattern
└─ Compensating Transaction Pattern
```

BRAINは一つを絶対的な正解として上書きしない。

各方式の、

* 適用条件
* 長所
* 短所
* 制約
* failure
* cost

を比較可能にする。

今回どれを使うかの稼働判断はINTELLIGENCE等との接続で行う。

---

## BRAIN-L1-005：領域をまたぐ設計関係を保持する

設計知識は領域ごとに分離しつつ、領域間の関係を失わない。

例：

```text
Authentication Pattern
        ↓ affects
Session Design
        ↓ affects
Frontend State
        ↓ affects
UX Flow
```

または、

```text
Database Pattern
        ↓
Performance Pattern
        ↓
Infrastructure Pattern
```

BRAINはPattern、Unit、Part間の、

* requires
* depends_on
* compatible_with
* conflicts_with
* affects
* alternative_to
* composed_of

などの意味relationを扱える。

---

## BRAIN-L1-006：ビジュアルデザインを独立した設計知識領域として持つ

BRAINはビジュアルデザインを単なる装飾情報として扱わず、再利用可能な設計知識として保持する。

対象例：

* Information Architecture
* Visual Hierarchy
* Layout
* Grid
* Spacing / Density
* Typography
* Navigation
* Component Composition
* Form
* Feedback
* Empty / Loading / Error State
* Responsive Design
* Dashboard
* Content Hierarchy
* Accessibility

ただし、

```text
「この製品は黒背景・青アクセント」
```

のような製品固有のVisual IdentityはProduct Core側に置く。

BRAINは、

```text
「高密度管理画面で情報階層を成立させる構造」
```

のような汎用構造を持つ。

---

## BRAIN-L1-007：設計知識の出所と根拠を失わない

Pattern / Unit / Partは、

* source
* provenance
* evidence
* adopted reason
* evaluated scope
* counterexample
* limitation

へ辿れる。

AIが生成したというだけでBRAINの汎用知識へ昇格させない。

---

## BRAIN-L1-008：知識の版と進化を管理する

すべての再利用可能構造はidentityとversionを持つ。

更新時には、

```text
current
superseded
deprecated
experimental
retired
```

等を区別できる。

旧Patternを無言で新Patternへ置換しない。

どのProduct Coreがどの版を参照したかを追跡可能にする。

実project側の利用版・利用状態の管理はOSへ委ねる。

---

## BRAIN-L1-009：Patternを再構成できる

既存Patternを丸ごとコピーするだけでなく、

```text
Pattern A
├─ Unit A1
└─ Unit A2

Pattern B
├─ Unit B1
└─ Unit B2
```

から、

```text
Candidate Pattern C
├─ A1
├─ B1
└─ new relation
```

のような構成候補を表現できる。

ただし、新しい構成候補を即座に確立済みPatternへ昇格しない。

評価はLABO等の適切な経路を必要とする。

---

## BRAIN-L1-010：Anti-Patternと失敗知識も持つ

成功した構造だけでなく、

* Anti-Pattern
* Failure Pattern
* Invalid Combination
* Context-dependent Failure
* Regression case

を構造化して保持できる。

これにより、

```text
「何を使えるか」
```

だけでなく、

```text
「この条件では何を使ってはいけないか」
```

も返せる。

---

## BRAIN-L1-011：製品固有知識を汎用知識へ混ぜない

BRAINへ入る構造は、特定製品の意味から分離されていなければならない。

例えば、

```text
×
RetryYN管理画面では左側にこのメニューを置く

○
高密度管理画面におけるpersistent navigation pattern
```

とする。

製品固有の名称、要求、画面、業務ルール、利用者判断をBRAINの汎用知識へそのまま昇格させない。

---

## BRAIN-L1-012：BRAINは採用判断をauthority化しない

BRAINは、

* 候補Pattern
* 必要なinput
* relation
* alternatives
* constraint
* evidence

を返せる。

しかし、

```text
「この製品ではPattern Xを採用する」
```

という製品固有の確定判断をBRAIN自身のauthorityで行わない。

Product Core、INTELLIGENCE、人間判断などの接続先と責務を混同しない。

---

# 接続要求として外へ出すもの

以下はBRAIN Core内部要求にしない。

## Product Core → BRAIN

製品固有の設計から、再利用候補となる構造を渡す。

## LABO → BRAIN

実績・実験・比較を経て汎用化候補として評価された構造を渡す。

## BRAIN → Product Core

要求・設計対象に利用可能なPattern / Unit / Partを返す。

## BRAIN ↔ INTELLIGENCE

BRAINの構造知識を判断材料として渡し、INTELLIGENCEが案件の状態に対する適用候補を考える。

## BRAIN → HARNESS

Patternが要求する設計inputや設計論点を、HARNESSの設計義務へ接続する。

これらはBRAIN単体ではなくConnection Requirementとして定義する。

---

# 2.0以降に回せる要求

1.0では、自前の内部実績・初期seedから設計知識体系を成立させる。

2.0では、

```text
External Information
↓
LABO
分解・比較・評価
↓
Reusable Structure Candidate
↓
BRAIN
```

を追加する。

外部で成功したPatternを、そのままBRAINへ投入しない。

---

# 要求の核

BRAINを一文で定義するなら、

> HELIX-BRAINは、ソフトウェア開発に必要な再利用可能な設計知識を領域別に構造化し、Pattern・Design Unit・Partと、それらの適用条件、関係、制約、反例、根拠、版を保持する。製品固有の意味や採用判断を持たず、各製品のHELIX-HARNESS-COREへ再利用可能な設計知識を提供する。

とする。

---

# 初期Domain候補

1.0で最初から全部を充実させる必要はないが、schema上は次の領域を扱えるようにする。

```text
Software Architecture
Application Architecture
Backend
Frontend
API / Integration
Data / Database
Infrastructure
Security
```
