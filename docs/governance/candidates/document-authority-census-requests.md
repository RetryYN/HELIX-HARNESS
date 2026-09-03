---
title: "Document Authority Census要求候補"
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
owner_issue: 1381
plan_id: PLAN-L3-85-document-authority-census
---

# Document Authority Census要求候補

## 1. 目的

HELIXは、追跡対象の文書・規則・生成物をexact HEADから漏れなく列挙し、各artifactの意味上の地位、
所有責務、読取consumer、生成元、lifecycleを一意に説明できなければならない。古い文書が残ること自体ではなく、
古い文書がcurrent authorityとして読まれること、またはcurrent文書が未束縛のまま判断へ使われることを防ぐ。

本候補はIssue #1372のruntime実装より先に確定すべきsource authorityである。承認前はscanner、DB、CLI、doctor、
Requirement IRの意味入力にしない。

## 2. 利用者要求

| ID | 要求 |
|---|---|
| `DAC-BR-001` | 開発者は、どの文書が現行正本で、どれが候補・参照・互換・履歴なのかを迷わず識別できる。 |
| `DAC-BR-002` | HELIXは、startup、agent instruction、generator、CLI、CI、setup template等のactive consumerが古いauthorityを読む事故をmerge前に止める。 |
| `DAC-BR-003` | 文書更新時に、生成物、digest、索引、consumer、V-pairへ必要な追従範囲を決定的に示す。 |
| `DAC-BR-004` | 文書の自動削除や意味変更をscannerへ許さず、所見を既存のRecovery、Redesign、Refactoring、Requirement Re-entryへ返す。 |
| `DAC-BR-005` | 大量の既存負債を可視化しつつ、新規負債は即時拒否し、段階的にUNKNOWNをゼロへ収束できる。 |

## 3. 機能要求

| ID | 要求 |
|---|---|
| `DAC-FR-001` | Git treeのexact HEADから対象artifactを列挙し、working treeや未追跡fileを正本inventoryへ混ぜない。 |
| `DAC-FR-002` | artifact classとlifecycle dispositionを別軸で管理し、classごとに必要bindingを変える。 |
| `DAC-FR-003` | authority bindingの参照先を再帰検査し、存在するが失効・互換・履歴化したtargetへのcurrent edgeを拒否する。 |
| `DAC-FR-004` | artifactからconsumerへの逆向きgraphを構築し、startup reachabilityと生成伝播を明示する。 |
| `DAC-FR-005` | source、generator、generated artifact、digest、consumerを同一provenance chainへ束縛する。 |
| `DAC-FR-006` | authority claim、active consumer、startup到達性、生成伝播に基づきseverityとdispositionを決める。 |
| `DAC-FR-007` | baseline debtと新規debtを分離し、new debt ratchetをfail-closeで適用する。 |
| `DAC-FR-008` | findingをtyped taxonomyで発行し、曖昧な分類や修正先を推測しない。 |
| `DAC-FR-009` | #825の要求materialization監査、#1370のstartup projection、#206の旧surface是正と責務を重複させずAND条件で接続する。 |
| `DAC-FR-010` | Concept、requirements、README等のsemantic epochが変わったとき、旧epochのactive claimとconsumerを検出する。 |

## 4. 非機能要求

| ID | 要求 |
|---|---|
| `DAC-NFR-001` | inventory、graph、findingは同一HEADと同一registry入力に対して決定的である。 |
| `DAC-NFR-002` | compatibility、historical、referenceの存在を欠陥扱いせず、active decision利用だけを拒否する。 |
| `DAC-NFR-003` | 全Markdownへ同じmetadataやRequirement IDを一律要求しない。 |
| `DAC-NFR-004` | GitHub、network、providerが無くてもrepo-local censusを再現できる。外部surfaceは別adapterで追加する。 |
| `DAC-NFR-005` | scannerは文書本文を書き換えず、削除せず、findingと修復候補だけを出力する。 |

## 5. authority境界

- 本候補は文書内容の正誤を自動判断する正本ではない。
- `CANONICAL`等の自己申告だけでauthorityを成立させず、registry、owner、consumer、provenanceへjoinする。
- candidateをcurrent、referenceをrequirement、generatedをsourceへ昇格しない。
- current文書の意味変更はRedesignまたはRequirement Re-entry、意味保存整理はRefactoringへ送る。
- 個別の旧文書是正はCensus完成を待たず#206等で進め、後からfinding receiptを接続する。
