---
document_id: HELIX-FIVE-GOALS-V0.1
goals_version: "0.1-candidate"
status: draft_candidate
authority_status: awaiting_human_approval
source_basis: PO direction 2026-09-16
source_quote_record: docs/concept/helix-five-goals.md#PO提示原文
derived_from:
  - docs/concept/helix-concept-v4.1.md
  - docs/concept/product-boundary.md
canonical_promotion: pending
approval_scope: exact_body_revision_pending
approved_body_sha256: pending_human_decision
authority_effect_before_approval: none
---

# HELIX自体の5大目標候補

## 位置づけ

本書は、HELIX全体が何を実現するかを五つの到達目標として定める。製品identity、責務境界、authority、V-model、
個別要求、設計、実装方式を本書だけで確定しない。構造上の正本候補は[Concept v4.1](helix-concept-v4.1.md)と
[製品責務境界](product-boundary.md)に置き、各目標は承認後に対象別L1、L2／L11へ無損失に分解する。

本候補は人間がexact revisionを承認するまでauthorityを持たない。Issue、PR、review、CI、DB、実装状態から承認や
達成を生成しない。

## 5大目標

### 1. システム駆動エージェント自走システム

人間が定めたConcept、企画、要求、許可、予算、停止条件を、HARNESSの工程・検証契約とHELIX-OSの管理・推進・
検収へ接続し、エージェントが次の作業、依存、検証、差戻しをsystem stateから判断して継続できるようにする。
会話や個々のエージェントの記憶へ進行を依存させず、エージェントが要求、承認、権限を自己生成しない自走を目指す。

### 2. 開発するほど賢くなる自己知能型改善システム

開発中の判断、差戻し、失敗、review、検証、品質、費用、運用結果を出典とscope付きで蓄積し、要求、Design Template、
HARNESS、Worker運用、CI、製品を改善する候補へ変換する。HELIX-OSが改善loopを継続運転し、学習結果はauthorityを
直接書き換えず、人間の採否と上流変更を経て次の開発へ反映する。

### 3. 設計から全体をシミュレーションする予測型システム

要求、domain、責務、依存、interface、state、failure、V-pair、検証、運用条件を機械的に接続し、設計変更を適用する
前に、影響範囲、stale化する成果物、必要な再検証、競合、risk、費用・時間候補を全体視点で予測できるようにする。
予測は確定事実として扱わず、前提、model revision、不確実性、反証方法、実測との差を保持し、開発結果で精度を改善する。

### 4. CIとbotで品質とスピードを両立した非エンジニアでも作れるシステム

要求形成、prototype、設計、実装、検証、review、統合、運用を、利用者が目的と判断事項を理解できる入口と、CI・botに
よる自動検査・差戻し・証拠化へ接続する。非エンジニアでも、実装詳細を自ら操作せずに製品を作り、進行、品質、未決、
riskを確認して必要な判断を行えることを目指す。速度のために要求、検証、security、人間decisionを省略しない。

### 5. 低コストワーカでも最高のパフォーマンスを発揮して最適配置するシステム

作業のdomain、難易度、risk、必要能力、context、依存、予算、期限、検証可能性を分類し、各Workerの実測能力、費用、
成功率、失敗傾向、利用可能量に合わせて役割と作業を配置する。高価なWorkerへの一律依存を避け、低コストWorkerが
担当可能な範囲で最大限の成果を出し、必要な判断・統合・独立検証だけを適切な能力へrouteする。最適性は固定provider名や
自己申告で決めず、対象revisionに対する品質、費用、時間、再作業、失敗の計測で継続的に見直す。

## 製品責務への接続

| 目標 | HELIX-HARNESS | HELIX-OS | 個別製品／運転基盤 |
|---|---|---|---|
| 1 | 工程、層、pair、停止・差戻し・完了条件を規定する | 管理から工程を受け、推進がticket・workflowを生成し、Worker実行と検収を統制する | 承認済みHARNESS契約に従う |
| 2 | 要求・設計・検証契約と改善対象を提供する | log、学習、計測を改善候補へ変え、HARNESS自身を含むprojectへ還流する | 許可された利用・運用結果を改善入力として返す |
| 3 | 要求・設計・依存・V-pair・検証のsimulation contractを提供する | 対象revisionのgraph、実測、差分を使ってsimulationを実行・記録する | 製品固有のdomain、利用条件、運用条件を入力する |
| 4 | 非エンジニアにも判断可能な開発工程と品質契約を提供する | CI、bot、証拠、停止・再開、進行を運転する | HELIX-WebはHARNESS Version 1後に操作・dashboard体験を提供する |
| 5 | 作業分類、能力契約、検証義務を規定する | Worker能力・費用・品質を計測し、assignmentと独立検証を最適配置する | providerやmodelを製品要求の固定authorityにしない |

責務のprimary ownerは、各目標を対象別要求へ分解するときに一意にする。目標が複数製品へ関係することを理由に、
HARNESSとHELIX-OSのauthorityを一つへ戻さない。

## 達成の考え方

5大目標は標語の掲載や単一機能の実装で達成扱いにしない。各目標について、対象別要求、利用場面、negative case、
設計、検証、実測、利用者受入、運用評価へ追跡できる状態を作る。目標間の優先順位、数値目標、段階release、採用技術は、
Conceptと対象別L1の承認後に別の要求・設計decisionとして定める。

## 本PRで決めないこと

- 5大目標から導く個別要求の追加、採否、分割、配置、優先順位。
- simulation model、要求engine、database、CI、bot、dashboard、Worker routerのschema・技術・実装。
- 「賢くなる」「予測」「品質」「スピード」「低コスト」「最高」「最適」を判定する数値基準。
- HELIX-HARNESS Version 1の完成、HELIX-Web展開、release、deploymentの許可。
- Concept v4.1、対象別L1、L2／L11の承認またはcanonical promotion。

## PO提示原文

2026-09-16のPO指示を、表記を変えずに本候補のsourceとして保持する。

> HELIX自体の5大目標
> ①システム駆動エージェント自走システム
> ②開発するほど賢くなる自己知能型改善システム
> ③設計から全体をシミュレーションする予測型システム
> ④CIとbotで品質とスピードを両立した非エンジニアでも作れるシステム
> ⑤低コストワーカでも最高のパフォーマンスを発揮して最適配置するシステム

本書はPOが提示した5大目標をHELIX全体の到達方向として固定する候補である。承認後も、目標から下流を直接実装せず、
Concept、対象別L1、要求、設計、検証の順に降ろす。
