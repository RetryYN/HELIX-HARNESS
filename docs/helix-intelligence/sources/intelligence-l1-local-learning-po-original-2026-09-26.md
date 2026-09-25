---
title: "HELIX-INTELLIGENCE L1要求アイデア 3.0のローカル学習の追加（POの原文、2026-09-26）"
kind: source_snapshot
source: PO（2026-09-26のClaude作業sessionで提示）
recorded_at: 2026-09-26
decision_record: docs/governance/decisions/intelligence-l1-idea-po-decisions-2026-09-26.md
authority_effect: none
---

# HELIX-INTELLIGENCE L1要求アイデア 3.0のローカル学習の追加（POの原文、2026-09-26）

2026-09-26（Asia/Tokyo）、POが[HELIX-INTELLIGENCE L1要求アイデア](intelligence-l1-idea-po-original-2026-09-26.md)に続けて示した本文を、そのまま保存する。
本書は書き換えない。現在の意味は[HELIX-INTELLIGENCEの企画（L1）案](../L1-planning/intelligence-intent.md)に置き、差分はgitで辿る。

---

# INTELLIGENCE-L1-021

## Domain / Capability専用モデルを学習・チューニングできる

3.0以降、INTELLIGENCEはLABOから提供された評価済みの事例・反例・学習材料を使用し、判断DomainまたはCapabilityに特化したローカルLLMを学習・チューニングできる。

対象例：

* Requirement理解モデル
* Design Reviewモデル
* Implementation診断モデル
* CI Failure診断モデル
* Integration Reviewモデル
* Worker配置モデル
* Model Router
* Auditモデル
* Bounded Repairモデル

一つの万能モデルへの統合を必須としない。

小型モデルをDomainまたはCapabilityごとに持つ構成を許容する。

# INTELLIGENCE-L1-022

## 学習用データと評価用データを分離する

INTELLIGENCEは、LABOから渡されたデータの利用区分を保持し、

* training
* validation
* evaluation
* holdout
* prohibited

を混同しない。

評価用として隔離された事例を学習へ混入させない。

モデル性能の改善を、学習データへの適合だけで判定しない。

# INTELLIGENCE-L1-023

## Model lineageを追跡できる

生成されたモデル候補について、

* base model
* model version
* training dataset revision
* tuning method
* configuration
* Domain
* Capability
* training environment
* evaluation corpus
* known limitation
* rollback target

へ辿れる。

どの材料と設定から生まれたモデルか不明な候補を稼働モデルへ昇格させない。

# INTELLIGENCE-L1-024

## Candidate Modelを現行モデルと比較できる

モデル候補は同一responsibility scopeおよび比較可能なcorpusで現行モデルと比較する。

最低限、

* success
* finding
* false positive
* miss
* reproducibility
* latency
* cost
* resource consumption
* failure pattern

を比較可能にする。

新しいモデル、より大きいモデル、学習済みモデルであることだけを改善の根拠にしない。

# INTELLIGENCE-L1-025

## Model適用範囲を限定できる

一つのモデルの性能向上からINTELLIGENCE全体の置換を行わない。

モデルは、

Domain × Capability

の適格範囲を持てる。

例：

Design × Review
Implementation × Diagnose
CI × Diagnose
Worker × Recommend

適格性が確認されていない領域へ能力を外挿しない。

# INTELLIGENCE-L1-026

## LABOによる独立した効果評価へ戻す

INTELLIGENCE内部のモデル評価は、実運用上の改善成立を意味しない。

Candidate Modelまたは採用モデルの実績をLABOへ返し、

* 品質
* 誤検知
* 見逃し
* 再作業
* 時間
* 費用
* 人間介入
* 運用負荷
* regression

について、過去の方式との差を独立して評価できるようにする。

INTELLIGENCE自身のmodel evaluationだけで恒久的改善を確定しない。

# 接続

LABO
→ Evaluated Episode / Training Material / Counterexample / Eval Set
→ INTELLIGENCE

INTELLIGENCE
→ Training / Tuning
→ Candidate Model
→ Technical Evaluation
→ Operational Use

INTELLIGENCE
→ Model Result / Prediction / Decision / Failure
→ LABO

LABO
→ Effect / Regression Evaluation
→ 改善Feedback
