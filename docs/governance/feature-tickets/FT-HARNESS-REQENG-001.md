---
feature_ticket_id: FT-HARNESS-REQENG-001
title: "HARNESS要求エンジンPython semantic core"
product_target: HELIX-HARNESS
state: proposed_upstream_waiting
priority_order: 3
created: 2026-09-15
authority_effect: work_projection_only
github_projection:
  issue: 1799
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1799
  projected_source_commit: 543ffc3058b15de181c4064ec77046969e09bc86
  read_after_state: OPEN
parent_requirements:
  - HARNESS-L2-008
acceptance_source: docs/helix-harness/L11-acceptance/product-acceptance.md
depends_on:
  - FT-OS-REQREG-001
  - FT-HARNESS-SEMEXTRACT-001
---

# FT-HARNESS-REQENG-001: HARNESS要求エンジンPython semantic core

## 目的

Concept、企画、利用者指示、回答、反応、既存要求、製品固有packから要求候補を作り、欠落、矛盾、重複、
過剰解釈、対象違い、semantic diff、変更影響と次の質問を返す製品非依存のPython semantic coreを具体化する。
入力原eventと出力proposalはFT-OS-REQREG-001の登録入口を通し、直接管理stateを書かない。
意味分類のOS側projectionはFT-OS-REQCLASS-001が所有し、Python coreのschemaを原登録層へ埋め込まない。

## core capability候補

- source provenanceを保つ意味単位の抽出、正規化、stable identity候補。
- `unit`、`connection`、`composite`の分類と、包含・接続・依存・制約・検証relation候補。
- actor、目的、scope、non-goal、制約、正常・取消・失敗・timeout・回復、acceptanceの不足検出。
- Concept／企画L1と要求候補間、および要求revision間のsemantic diff。
- 指示の欠落、意味追加、対象製品違い、矛盾、曖昧性、確認質問の提示。
- 構成体固有のend-to-end behavior、順序、data意味、整合性、性能、failure propagation、回復、security境界の不足検出。
- 影響する要求、設計、V-pair、検証、提供物、運用評価、判断ownerの候補提示。

## runtime境界候補

- Pythonは決定論的な意味処理を行い、versioned strict JSONLでproposalだけを返す。
- network default deny、bounded time／memory／input／outputを必須にする。
- DB path、Git repository、`.helix`、credential、GitHub token、write authorityを渡さない。
- Python出力のcommand、SQL、absolute path、codeを実行しない。
- Node／TypeScript境界がschema、revision、permission、stale、duplicateを再検証し、FT-OS-REQREG-001経由で登録する。
- 製品固有の語彙、質問、policy、品質matrixはversioned packとしてcoreから分離する。

## 降下順序

1. HARNESS L1-008／L2-008とL11を承認revisionへ束縛する。
2. FT-OS-REQREG-001の登録contractとnegative oracleを先にfreezeする。
3. FT-HARNESS-SEMEXTRACT-001で旧Requirement Engine、Requirement Compiler、discovery、trace、impact資産からsemantic behavior atomを個別採否する。
4. L3でsemantic contract、schema、pack、resource boundary、determinismを定義する。
5. L10で欠落、過剰抽出、対象違い、粒度混在、構成体成立の誤推定、stale、malformed outputを検証する。
6. Python coreを実装し、Node境界と登録入口へ接続する。
7. FT-OS-REQCLASS-001へversioned分類結果を投影する。
8. HELIX自身と性質の異なる複数productで評価し、指示との差、訂正率、見逃し、過剰抽出、質問量、trace欠落を再観測する。

## 停止条件

- 親Concept／L1／L2または登録contractが未承認・未freeze。
- engine出力と人間承認済み要求を区別できない。
- unit／connection／compositeのidentityとrelationが未定義。
- data利用scope、retention、fixture化、評価方法が未定義。
- 旧TypeScript／vendor実装のbulk copyや旧CI parityを完成条件にしている。

現在はticket発行と要求具体化だけを行い、Python実装、Node接続、学習、runtime、CIを起動しない。
