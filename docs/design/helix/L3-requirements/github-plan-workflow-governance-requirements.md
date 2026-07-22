---
title: "GitHub PLAN workflow-model governance要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: PO / TL
pair_artifact: docs/test-design/helix/github-plan-workflow-governance-system-test-design.md
---

# GitHub PLAN workflow-model governance要件定義

## 1. 目的と適用境界

本書はIssueから生成するPLANのworkflow model、ID、表示名、物理path、frontmatter route、DB projection、model遷移、Issue closureを
一つのadmission契約へ束縛する。layerだけのPLAN名、任意path、renameだけのmodel遷移、検証欠落Issue closeを拒否する。

## 2. 機能要件

### GH-FR-023 PLAN駆動モデル名・folder admission

IssueからPLANを生成する際はlayerだけのPLAN名を拒否し、canonical ID、表示名、物理pathにworkflow modelを必須化する。
generatorはworkflow model別rootとlayer別subdirectoryだけを出力先に選び、folder、IDの`workflow_model` token、frontmatter routeが
一致しない場合はfile write前にfail-closeする。任意path作成APIを正規入口に含めない。

正規pathは`docs/plans/<workflow_model>/<layer>/PLAN-<layer>-<WORKFLOW_MODEL>-<slug>.md`とし、DBはpathではなく不変`plan_id`をidentityに使う。
`workflow_model`、`layer`、`artifact_path`、dependency edgeを独立projectionし、再帰scannerでexactly once取込む。

workflow model遷移はrenameで表現せず、新PLAN、子Issue、dependency edge、transition receiptを作る。元・先のHEADと依存閉包をDBから
再生できる場合だけadmitする。既存flat PLANはsystem-wide Forwardで移行し、requirement、design、implementation、test/verification、
DB、Issue、PR、receiptの全edgeを依存順に修正する。全移行完了までlegacy loaderとnested loaderのdual-greenを要求する。

Infinity Loopは予定外のルール違反、進行trouble、将来改善をIssueとして追跡し、要求されたverification receiptが揃う場合だけclosureする。
PoC artifactはForwardまたはProduction Scrum PLANへ接続し、production契約と独立reviewを閉じるまで昇格しない。

計画済み長期検証は対応V-pairで実行し、予定外findingだけをIssue化する。Issue closureはclosure link、同一HEAD verification、独立review、
DB receipt、mergeで判定する。Incidentは事実、timeline、影響、原因、ルール化事項とRecovery接続receiptの完成で閉じ、Recovery mergeと同時closeを
強制しない。計画済み検証の想定外failureはRecoveryへrouteし、必須ACなら元PLANをblockする。current PRの承認scope内で完結する
軽微findingはPR evidenceへ記録し、scope外、再発防止、別episodeが必要なfindingだけをIssue化する。

全gate green後もGitHub native auto-mergeを設定せず、AI-Bがcurrent HEAD、文脈review、DB追従、内部CI、GitHub Actions receiptを再照合して
明示mergeする。AI-Aまたは修正主体による自己merge判断を禁止する。

## 3. 受入条件

| AC | 合格条件 |
|---|---|
| GH-AC-031 | layerだけのPLAN名、workflow-model folder不一致、frontmatter route不一致をwrite前に拒否し、正規generatorだけがmodel付きID・表示名・pathを生成し、nested pathをDBへexactly once投影する |
| GH-AC-032 | Infinity Loop対象Issueはverification receipt欠落時にcloseされず、PoC artifactはForward/Production Scrumのproduction契約、DB追従、test、独立reviewが揃うまで昇格しない |
| GH-AC-033 | 計画済み長期検証をV-pairで追跡し、予定外findingだけをIssue化する。Issue closureはclosure PR、同一HEAD verification/review/DB receipt、mergeを要求し、Incidentから恒久修正Recoveryを逆引きできる |
| GH-AC-034 | 全gate green後もnative auto-mergeせず、AI-Bがcurrent HEADの文脈review、DB追従、内部CI、GitHub Actions receiptを再照合した明示mergeだけを許可する |

## 4. freeze境界

本書はworkflow-model PLAN governanceのL3契約である。nested path cutover、loader、DB schema、generator、merge commandの実装はL4以降へ降下し、
flat PLANの実移動は専用migration PLANとrollback evidenceなしに行わない。
