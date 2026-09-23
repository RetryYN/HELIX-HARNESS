---
document_id: HELIX-FIVE-GOALS-V0.1
goals_version: "0.1-candidate"
status: draft_candidate
authority_status: awaiting_human_approval
source_basis: PO direction 2026-09-16
source_quote_record: docs/concept/helix-five-goals.md#PO提示原文
derived_from:
  - docs/concept/helix-concept.md
canonical_promotion: pending
approval_scope: exact_body_revision_pending
approved_body_sha256: pending_human_decision
authority_effect_before_approval: none
---

# HELIX自体の5大目標候補

## 位置づけ

本書の親は[HELIX Concept](helix-concept.md)である。5大目標はConceptの同名節に含まれる意味を展開する子文書であり、独立した親authorityや新しい承認経路を作らない。各目標から対象別要求・受入へ降ろす際は、Conceptの機構、導入版、製品属性を保持する。旧候補の状態と承認履歴はdecision recordで追う。

2026-09-24の承認decisionは旧本文のSHA-256 `cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca`に限る。現行本文の位置づけと責務表は未承認の差分候補であり、[PO判断パッケージ](../governance/crosswalks/concept-requirement-po-decision-packet.md)に変更前後を記録する。

5大目標はHELIXの到達方向・価値を示す。別PR #1826の「HELIXエージェントの七大原則」は、その方向へ進む際の
エージェントの行動基準を示す。どちらもConceptに従属し、目標または原則だけから要求、責務、workflow、実装を
直接生成しない。統合後の読込順は、Concept／製品責務境界→5大目標→七大原則→対象別L1とする。

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

## Conceptの機構・版への接続

| 目標 | 1.0の責務 | 後続版の拡張 |
|---|---|---|
| 1 自走 | HARNESSの工程契約、BRAINの計画案、OSの管理・推進・検収、SecurityとRunner／Sandboxの限定実行 | 1.xのWeb・Web-OSは顧客提供とservice運転を追加する |
| 2 改善 | LABOが計測・効果・退行を評価し、OSが改善候補を上流へ登録する | 2.0はBRAINの根拠付き推薦とLABOの推薦評価、3.0はIntelligenceの知識・モデル改善 |
| 3 予測 | BRAINが前提と不確実性を示した予測を行い、LABOが実測と照合する。HARNESSは検証契約を持つ | 4.0は調整済みモデルを用いたBRAINの動的フロー構成 |
| 4 非エンジニア | HARNESSのサービス①〜⑦と入口・枠・部品・コアを、OSのCI・botによる検査・差戻し・証拠化と接続する | 1.xのWebが顧客の操作入口を、Web-OSがservice運転を担う |
| 5 Worker配置 | HARNESSの検証義務、BRAINの配置案、OS推進の割当、OS検収の独立確認、LABOの実測評価を分ける | 後続版の推薦・モデル改善は前の版の完成条件にしない |

この表は現行Conceptとの責務対応候補であり、既存L1・L2・L11の意味変更や承認を確定しない。
旧本文にあったsimulation入力の所有者、Web-OSのWorker実行境界、Webでの利用者同意と確認は、この表から採否や担当確定を導かない。各旧記述と現行Conceptとの差分を[PO判断パッケージ](../governance/crosswalks/concept-requirement-po-decision-packet.md)に残す。

## 達成の考え方

5大目標は標語の掲載や単一機能の実装で達成扱いにしない。各目標について、対象別要求、利用場面、negative case、
設計、検証、実測、利用者受入、運用評価へ追跡できる状態を作る。目標間の優先順位、数値目標、段階release、採用技術は、
Conceptと対象別L1の承認後に別の要求・設計decisionとして定める。

## 本PRで決めないこと

- 5大目標から導く個別要求の追加、採否、分割、配置、優先順位。
- simulation model、要求engine、database、CI、bot、dashboard、Worker routerのschema・技術・実装。
- 「賢くなる」「予測」「品質」「スピード」「低コスト」「最高」「最適」を判定する数値基準。
- HELIX-HARNESS Version 1の完成、HELIX-Web展開、release、deploymentの許可。
- 現行Concept、対象別L1、L2／L11の承認またはcanonical promotion。

## PO提示原文

2026-09-16のPO指示を、表記を変えずに本候補のsourceとして保持する。

> HELIX自体の5大目標
> ①システム駆動エージェント自走システム
> ②開発するほど賢くなる自己知能型改善システム
> ③設計から全体をシミュレーションする予測型システム
> ④CIとbotで品質とスピードを両立した非エンジニアでも作れるシステム
> ⑤低コストワーカでも最高のパフォーマンスを発揮して最適配置するシステム

本書はPOが提示した5大目標をHELIX全体の到達方向として固定する候補である。承認後も、目標から下流を直接実装せず、
目標を取り込んだConcept revision、対象別L1、要求、設計、検証の順に降ろす。
