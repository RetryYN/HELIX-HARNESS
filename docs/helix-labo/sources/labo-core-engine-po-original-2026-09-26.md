---
title: "HELIX-LABO Core Engine（POの原文、2026-09-26）"
kind: source_snapshot
source: PO（2026-09-26のClaude作業sessionで提示）
recorded_at: 2026-09-26
decision_record: docs/governance/decisions/labo-core-engine-po-decisions-2026-09-26.md
authority_effect: none
---

# HELIX-LABO Core Engine（POの原文、2026-09-26）

2026-09-26（Asia/Tokyo）、POが「ラボをこんな感じにするのはどうかね？」として示した本文を、そのまま保存する。
本書は書き換えない。現在の意味は[HELIX-LABOの企画（L1）案](../L1-planning/labo-intent.md)に置き、差分はgitで辿る。
原文の表題にある「v0.3」は原文の一部として残す。現行文書の版は、同じファイルの更新と項目の版の印で表す。

---

# HELIX-LABO Core Engine v0.3

## 1. 一文定義

HELIX-LABOは、HELIX全機構・各Product・運用環境から発生するログ、証拠、計測値、失敗、再作業、利用結果を横断的に集積・相関し、内部実績と外部情報を分解・比較・実験・評価して、各コアシステムへ改善Feedbackを返すHELIX全体の観測・研究・評価・還流中枢である。

LABOは各機構のauthorityやruntime stateの正本を奪わない。

LABOが保持する中心対象は「何が起き、なぜ起き、何を変えたらどうなったか」という横断的なepisodeである。

---

# 2. HELIX全体における位置

```text
HARNESS ───────┐
OS ────────────┤
BRAIN ─────────┤
Intelligence ──┤
Security ──────┤
CONNECT ───────┤
Runner/Sandbox ┤
Product Core ──┤
Web / Web-OS ──┤
CI / Worker ───┤
               ↓
          HELIX-LABO
               │
      Observation / Episode
      Experiment / Evaluation
      Pattern / Regression
      Feedback Derivation
               │
       ┌───────┼─────────┐
       ↓       ↓         ↓
    BRAIN Intelligence  OS
       ↓       ↓         ↓
    HARNESS / Security / Runner /
    CONNECT / Product Core ...
```

LABOはHELIXの中央制御装置ではない。

HELIXの中央的な
**観測・比較・学習材料形成・Feedback生成地点**
である。

---

# 3. Log Aggregation Principle

すべての機構は、自身の責務に属する原ログ・state・authorityを所有する。

LABOはそれらから、許可された観測情報を共通形式で集積する。

```text
Source Authority
HARNESS / OS / Intelligence / Product ...
        ↓
Log / Event / Evidence / Metric Export
        ↓
LABO Observation Store
```

LABOへの集積によってsource authorityを移動しない。

最低限、観測を次へ結ぶ。

```text
episode_id
requirement_revision
ticket_id
responsibility_id
product
mechanism
worker
provider
model
configuration
artifact
CI/test
release
deployment
runtime
failure
rework
cost
time
result
```

これにより、一つの開発・運用episodeを機構横断で追跡する。

---

# 4. LABO Core Pipeline

LABO Coreは7段で構成する。

```text
1. Aggregate
      ↓
2. Correlate
      ↓
3. Decompose
      ↓
4. Hypothesize
      ↓
5. Experiment
      ↓
6. Evaluate
      ↓
7. Feedback
```

---

# 5. Aggregate Engine

HELIX全体から観測情報を集める。

対象：

* 開発ログ
* Worker実行結果
* AI判断結果
* CI結果
* Test結果
* Review finding
* Backflow
* Recovery
* Incident
* Refactor結果
* Release結果
* Deployment結果
* Runtime metric
* 利用履歴
* 再作業
* 費用
* token/API利用量
* model/provider情報
* failure
* correction
* rollback
* Product利用結果

成功例だけを集めない。

```text
success
failure
rejected
cancelled
blocked
unknown
not_observed
```

を区別する。

---

# 6. Correlation Engine

個別ログを単発eventのまま扱わず、episodeへ組み立てる。

例：

```text
Requirement
↓
Ticket
↓
Worker
↓
Implementation
↓
Atomic CI
↓
Boundary Integration
↓
Proof CI
↓
Release
↓
Deployment
↓
Runtime
↓
Incident
↓
Recovery
```

この一連を同じepisodeとして追跡する。

これにより、

「CIが失敗した」

ではなく、

> どの要求・構造・Worker・model・変更・環境からその失敗が生じたか

を比較できる。

---

# 7. Structural Decomposition Engine

観測された事象を丸ごと評価しない。

```text
事象
├─ 良かった部分
├─ 悪かった部分
├─ 条件依存部分
├─ 汎用可能部分
├─ Product固有部分
├─ System化可能部分
├─ 運用で補う部分
├─ 不明部分
└─ 不要部分
```

対象を、

```text
採用 / 不採用
```

だけで処理しない。

---

# 8. Vector Shu-Ha-Ri Engine

LABOの仮説形成方法としてVector守破離を用いる。

## 守

既存方式の意味・目的・条件・構造を正確に保持する。

```text
A =
[
 purpose,
 structure,
 behavior,
 assumption,
 constraint,
 guarantee,
 cost
]
```

元の意味を理解する前に改変しない。

## 破

全体一致ではなく部分構造を比較する。

```text
A ≠ B

しかし

A.a ≈ B.c
A.d ≈ B.b
```

条件による変化も扱う。

```text
A + condition X → A'
```

## 離

有効な部分を再構成する。

```text
A.a
+ B.c
+ Context X
- A.d
= Candidate C
```

Candidateはauthorityではない。

LABO Experimentの仮説である。

---

# 9. Transformation Engine

仮説には以下の操作を行える。

```text
KEEP
REDUCE
SPLIT
MERGE
REDEFINE
REPLACE
RELOCATE
ABSTRACT
SPECIALIZE
REFRAME
DEFER
RETIRE
```

LABOの目的は新しい仕組みを増やすことではない。

既存構造を、

* より少ない責務で表現できないか
* 他機構へ移せないか
* 既存Mechanismへ吸収できないか
* 運用へ戻した方がよくないか

も評価する。

---

# 10. Experiment Engine

候補はbaselineと比較する。

```text
Current
vs
Candidate
vs
Hybrid
```

測定対象：

* 品質
* 成功率
* failure率
* false positive
* false negative
* 再作業量
* 速度
* CI時間
* Worker時間
* token/API費
* 人間介入量
* context量
* complexity
* recovery時間
* release lead time
* 運用負荷
* Product間再利用性

「動いた」だけでは改善としない。

---

# 11. Assurance Allocation Engine

LABOは「何をSystemへ持たせ、何をOperationへ残すべきか」を評価する。

## 冪等化側

同一条件から再現可能な結果を得られ、

* 機械判定可能
* oracleがある
* 副作用が限定可能
* retry可能
* rollback可能
* 冪等化可能

ならSystem化候補とする。

```text
Operation
↓
Repeated Stable Decision
↓
Rule Candidate
↓
Shadow
↓
Mechanism Candidate
```

## 抑制側

以下は運用保証候補とする。

* 文脈依存
* 意味判断
* 例外多数
* oracle不完全
* System化による誤検知が高い
* 過剰拘束になる

Operationは未完成なSystemではない。

Systemで完全性を担保できない部分を、
Operationで補完する。

---

# 12. Operational Fallback Engine

System化したものも永続固定しない。

```text
System Rule
↓
例外増加
誤検知増加
回避運用増加
変更コスト増大
↓
LABO再評価
↓
Operational Fallback
```

つまり、

```text
Operation → System
```

だけでなく、

```text
System → Operation
```

も正規の改善経路とする。

---

# 13. Generalization Engine

LABOは実験結果の適用範囲を測る。

```text
Single Episode
↓
Repeated Episodes
↓
Cross-Project
↓
Cross-Product
↓
General Structure
```

この一般化レベルによってFeedback先を変える。

---

# 14. Feedback Derivation Engine

LABOの最重要成果物は「改善そのもの」ではなく、

**どのコアシステムの何を改善すべきかというFeedback**

である。

一つの実験結果から複数Feedbackを生成してよい。

---

# 15. BRAIN Feedback

BRAINはHELIX全体で利用可能な汎用構造、

* Design Pattern
* Design Unit
* Part
* Composition Pattern
* Structure Template

を持つ。

LABOが複数Productや複数episodeから、

```text
異なる意味
+
異なるProduct
+
同じ構造
```

を確認した場合、BRAINへPattern/Part候補を返す。

```text
LABO
↓
Generalized Structure Candidate
↓
BRAIN
```

BRAINへProduct固有意味を移さない。

---

# 16. Intelligence Feedback

最新のHELIX定義ではIntelligenceは1.0から稼働し、

* 理解
* 計画
* 予測
* 診断
* Review
* Worker配置案
* HELIX全体監査
* Bugbot
* Helpbot
* Crawler

を担う方向にある。

LABOはIntelligenceへ、

```text
判断精度の評価
failure corpus
counterexample
model/provider比較
誤検知/見逃し
diagnosis結果
review結果
training/evaluation data
bot化候補
```

をFeedbackする。

3.0以降はこれをローカルLLMの学習・チューニング・評価へ利用できる。

```text
LABO
↓
Qualified Episode / Corpus
↓
Intelligence
↓
Model / Audit / Bot / Runtime Judgment
↓
実運用
↓
LABO
```

で閉じる。

---

# 17. HARNESS Feedback

以下の問題はHARNESSへ返す。

* V-model構造
* Requirement形成
* Design obligation
* Verification contract
* Backflow規則
* Boundary reconciliation
* Refactor原則
* Release成立条件
* 運用保守工程

つまり、

```text
「工程・契約そのものが悪かった」
```

という評価。

---

# 18. OS Feedback

以下はOSへ返す。

* Ticket分解
* Ticket発行
* WIP
* Worker配車
* Priority
* CI profile
* 検収
* Integration
* Release promotion
* Retry
* Recovery
* 費用
* 実行順
* 状態管理

つまり、

```text
「工程の意味ではなく、運転方法が悪かった」
```

という評価。

OSは現行定義どおり、改善候補の登録・還流先への振り分けと実行統制を担う。

LABOはOSのauthorityを直接更新しない。

---

# 19. Product Helix Core Feedback

Product固有の、

* 意味
* 要求
* 設計
* domain
* UX
* Product-specific pattern

はProduct側Helix Coreへ返す。

```text
LABO
↓
Product-specific Finding
↓
Product Helix Core
```

汎用化できないものをBRAINへ押し込まない。

---

# 20. その他CoreへのFeedback

```text
Security
← 認可、隔離、credential、情報保護の失敗

Runner / Sandbox
← 実行隔離、resource、停止、復旧の失敗

CONNECT
← 機構間・内外接続、再送、契約版、追跡の失敗

Web-OS
← tenant、job、deployment、runtime運転の改善
```

各機構へ改善候補を返す。

---

# 21. External Knowledge Loop

2.0では、外部情報をLABOで分解し、BRAINへ入れる。

```text
External Source
OSS / Design / Paper / Issue / PR ...
        ↓
Crawler / CONNECT等
        ↓
LABO
        ↓
Provenance確認
Structural Decomposition
Vector Shu-Ha-Ri
Experiment / Comparison
        ↓
General Structure Candidate
        ↓
BRAIN
```

外部で成功した方式をそのままBRAINへ入れない。

LABOを評価境界にする。

---

# 22. Feedback Contract

LABOから各機構へ出すFeedbackは最低限、

```text
source_episode
source_revision
target_mechanism
target_responsibility

observation
evidence
failure_or_success

hypothesis
experiment
result
counterexample

scope
confidence
regression_risk

recommended_action:
  maintain
  redefine
  replace
  split
  merge
  systemize
  operational_fallback
  retire

revalidation_condition
```

を持つ。

Feedbackは提案でありauthorityではない。

---

# 23. Feedback Lifecycle

```text
Observed
↓
Correlated
↓
Hypothesized
↓
Experimented
↓
Evaluated
↓
Feedback Candidate
↓
OS registration / target routing
↓
Target mechanism change process
↓
Verification
↓
Deployment / Operation
↓
LABO re-observation
```

この循環を閉じる。

---

# 24. LABO Core Invariants

1. LABOは全HELIXの観測結果を横断して扱える。
2. 原state/authorityをLABOへ集中させない。
3. 成功だけでなく失敗・拒否・不明も集積する。
4. correlationを因果と決めつけない。
5. 一事例を一般化しない。
6. 外部方式をそのまま採用しない。
7. Product固有意味をBRAINへ送らない。
8. BRAINには汎用構造のみをFeedbackする。
9. Intelligenceには判断・監査・bot・モデル改善に使える評価材料を返す。
10. System化率最大化を目的にしない。
11. Operationを正規の保証手段として認める。
12. SystemからOperationへの降格を認める。
13. LABO評価だけで変更を確定しない。
14. 変更後は必ず再観測する。
15. Feedbackの効果そのものもLABOで評価する。

---

# 25. HELIXの改善循環

最終的には、

```text
HELIXが動く
↓
全機構からログが出る
↓
LABOへ集積
↓
episode化
↓
分析
↓
Vector守破離
↓
改善仮説
↓
実験
↓
評価
↓
各CoreへFeedback
↓
変更
↓
実運用
↓
再びLABO
```

をHELIXの基本的な自己改善循環とする。

LABOは、

**HELIXが経験したすべてを、次の改善へ変換する場所**

として位置づける。
