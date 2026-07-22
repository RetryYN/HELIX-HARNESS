---
title: "GitHub merge admission 要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-22
updated: 2026-07-23
owner: PO / TL
pair_artifact: docs/test-design/helix/github-merge-admission-system-test-design.md
---

# GitHub merge admission 要件定義

## 1. 目的と適用境界

本書は`github-autonomous-operations-requirements.md`のGH-FR-001..017を変更せず、PRの同一HEAD文脈レビューと
`harness.db`追従をmerge必須条件として追加する。CI green単独、自分自身の判断、別HEADのreceiptをmerge根拠にしない。

## 2. 機能要件

### GH-FR-018 同一HEAD文脈レビューとDB追従

作成者と別identity・別session・独立contextのAI-Bが、L0 authority、L2要求、L3要件とAC、L4基本設計、Issue/PLAN、
変更diff、trace、既存consumer、security・blast radiusを読み、要件適合と設計整合を判断する。入力path/digest集合、
reviewer identity/runtime/model/provider/session、finding/disposition、verdictをcurrent PR HEAD SHAへ束縛したtyped receiptに記録する。

同じHEADから隔離再構築した`harness.db`について、source HEAD、event head、projection digest、checkpoint digest、schema revision、
stale/orphan件数、rebuild一致結果をDB追従receiptへ記録する。DB未更新、event/projection片肺、checkpoint stale、rebuild不一致、
source HEAD不一致のいずれかがあれば文脈レビューPASSとmerge readinessを拒否する。

push、CI self-heal、base更新、入力正本digest変更のいずれかでHEADまたは入力集合が変わった場合、両receiptをstale化し、
AI-Bレビューから再実行する。runtime/provider familyの違いだけを独立性とみなさず、AI-A自身のverdict、単一AI fallback、
`degraded_mode`を禁止する。

### GH-FR-019 作成・監査・修正・クロスレビュー責務

AI-AはPR作成前に内部CIを通す。AI-Bはcurrent HEADの文脈レビュー、finding修正、影響Lに応じた再検証、内部CI、
GitHub Actions再実行を同じepisodeで担う。AI-Bが修正した場合、その差分は修正主体と別identity・別session・独立contextの
reviewerがクロスレビューし、AI-Bは自己承認しない。

修正pushで旧receiptをstale化し、クロスレビュー、内部CI、GitHub Actions、DB追従が同じ新HEADで全て合格した場合だけmergeする。
内部CIとGitHub Actionsは別receiptを発行し、同一HEADと結果digestを照合する。session内lightweight自己確認への縮退を認めない。

## 3. 受入条件

| AC | 合格条件 |
|---|---|
| GH-AC-014 | CI greenでも、必須文脈を読んだAI-Bのcurrent HEAD束縛receiptがなければmergeをblockする |
| GH-AC-015 | 隔離DB再構築でsource HEAD、event、projection、checkpoint、schemaが一致し、stale/orphan 0の場合だけDB追従receiptを受理する |
| GH-AC-016 | AI-Aの内部CIと、修正後HEADの独立クロスレビュー、内部CI、GitHub Actions、DB追従が全て同じHEADへ収束するまでmergeをblockする |

## 4. freeze境界

本書はL3要件であり、L4/L9設計、L5/L8詳細設計、L6/L7実装契約とTDD、実行証拠を先取りしない。
