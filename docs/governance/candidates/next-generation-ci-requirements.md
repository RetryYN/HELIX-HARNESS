---
title: "新世代CIの上流要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
created: 2026-09-14
updated: 2026-09-14
product_targets:
  - HELIX-HARNESS
  - HELIX-OS
derived_from:
  - docs/governance/candidates/helix-concept-v4.1.md
  - docs/governance/candidates/ci-event-concurrency-generation-requests.md
  - docs/governance/candidates/ci-event-concurrency-generation-requirements.md
  - docs/governance/candidates/ci-event-concurrency-generation-acceptance.md
---

# 新世代CIの上流要求候補

## 目的

いまからを新世代とし、既存CIを現行要求の実行基盤・比較基準・移行判定として使用せず、承認された上流要求から
検証責務と実行責務を再導出する。
本候補は要求整理だけを行う。workflow、action、script、runtime、gate、test、設定、GitHub保護規則は変更しない。

## 責務境界

| 対象 | 所有する責務 | 所有しない責務 |
|---|---|---|
| HELIX-HARNESS | 各layer・V-pair・artifact class・変更種別が要求するoracle、証拠、失敗、再検証、完了条件 | runner、job構成、GitHub Actions、queue、cache、retry、秘密情報、実行資源の運転 |
| HELIX-OS | 承認済みHARNESS検証契約と対象プロダクト要求からCI profileを組み立て、実行・隔離・監視・回収・再開する | 要求意味、Concept承認、L2合意、L3承認、利用者受入の代行 |
| 対象プロダクト | 自身の要求、環境、risk、外部境界、受入条件 | HARNESS共通契約やOS実行統制の別正本 |
| GitHub等のprovider | OSが選択する実行adapterと証拠surface | CI意味、要求採否、工程完了のauthority |

## HARNESSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| NCI-HARNESS-001 | layer、V-pair、artifact class、変更種別、riskから必要な検証義務を決められる | 同じ変更でも上流意味review、設計検証、実装test、利用者受入、運用評価が混在しない |
| NCI-HARNESS-002 | 各検証義務が対象revision、入力、oracle、expected failure、証拠形式、有効期限、差戻し先を持つ | command成功やjob greenだけでは義務充足にならない |
| NCI-HARNESS-003 | required、conditional、informational、not-applicableを理由付きで区別し、unknownをskipへ変換しない | profile縮小時も必要検査が消えず、非適用条件を再評価できる |
| NCI-HARNESS-004 | 上流変更からstale化する下流と再検証範囲を導出できる | 旧authorityに対するgreenや無関係なfull runで新revisionの欠落を相殺しない |

## HELIX-OSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| NCI-OS-001 | 承認済み上流revision、HARNESS版、対象product、変更集合から実行CI profileを生成する | workflow filenameや旧job集合を要求入力にしない |
| NCI-OS-002 | 上流意味review、下流verification、merge admission、release、post-deploy observationを別pipeline classとして扱う | Concept候補のreviewが旧merge CIやrelease作用を起動しない |
| NCI-OS-003 | pipelineと各runをrequirement、pair、oracle、commit/tree、environment、runner、generationへ束縛する | 別HEAD、別要求版、別環境の結果を再利用しない |
| NCI-OS-004 | fail、cancel、timeout、infrastructure failure、not-run、blocked、staleを区別し、修復先を返す | failureを再実行だけで覆わず、要求・設計・実装・環境のどこへ戻るか分かる |
| NCI-OS-005 | queue、parallelism、cache、shard、retry、budgetを最適化してもHARNESSのrequired oracleを維持する | 高速化やgreen化のための検査削除を拒否する |
| NCI-OS-006 | provider adapterを交換でき、provider固有状態から要求・合意・受入・完了を生成しない | GitHub Actionsを外しても同じ検証契約と証拠identityを保てる |
| NCI-OS-007 | 旧CIと新世代CIを別identity・別writer・別evidence namespaceで隔離し、旧CIを実行せずarchive referenceへ移す | legacy成功、失敗、job構成を新世代のbaselineや移行oracleにせず、旧workflowが新authorityを拒否しても上流を巻き戻さない |

## 上流意味reviewの要求

U0–U4の候補文書は、remote commitを対象にread-onlyで意味reviewできることを要求する。このreviewはCI jobではなく、
reviewer identity、対象revision、source set、観点、finding、判定時刻を持つ独立operationである。

- branch pushからPR、CI、merge admission、Issue closeを自動導出しない。
- reviewerのpassからConcept承認、L2合意、L3承認を自動導出しない。
- review対象が変われば旧findingとreceiptをstaleにする。
- 専用laneが無い場合は`review_waiting`で停止し、旧PR／CIへfallbackしない。

## 再構築順序

1. ConceptでHARNESSとHELIX-OSのCI責務を確定する。
2. 対象別L1で利用価値、利用者、範囲、成功条件を確定する。
3. L2で上記要求を合意し、L11の利用者確認を対にする。
4. L3／L10でprofile compiler、pipeline class、evidence、failure、provider境界を仕様化する。
5. L4–L9とL6↔L7で設計・実装・testを新規導出する。
6. 新世代CIだけを隔離環境でshadow実行し、承認要求から導出したoracleと照合する。旧CIは実行・比較しない。
7. 新世代の要求trace、negative oracle、rollback、consumer read-afterを確認後、旧CIを非実行archiveへ移す。

## 現在の停止条件

- 本候補の記載でHARNESS／HELIX-OSのL2合意やConcept承認を成立させない。
- 既存`.github/workflows/`を新要求へ合わせて修正しない。
- 既存CIを起動せず、新世代CIのbaseline、oracle、parity、合格条件として固定しない。
- 新世代CIのworkflow名、job数、provider、時間、費用、並列度をL2で捏造しない。
- U1–U4の上流確定前にCI実装PLAN、Issue、PRを起動しない。

## L11受入候補

全件未実行である。

- Concept候補だけを変更し、remote syncしても旧CI／merge pipelineが起動しない。
- 承認済み実装要求を変更すると、対象pair・riskに必要なprofileが生成され、無関係な検査を必須化しない。
- required oracleを一件削除したprofile、unknownをN/Aにしたprofile、別HEADのreceiptを拒否する。
- providerを交換してもrequirement、pair、oracle、evidence identityが維持される。
- 旧CI green、新世代CI not-runを与え、新世代の結果をgreenやverifiedにしない。
- 旧CIを呼び出すprofile、旧workflowとのdual-green、旧job件数との一致を移行条件として要求しない。
- pipeline failureから正しい上流または下流の差戻し先を識別し、Concept変更を実装修正へ誤配送しない。

本候補は[上流再整備と既存資産統制方針](../upstream-rebaseline-and-asset-governance-policy-2026-09-14.md)の
`upstream meaning review`とU6 cutoverの間を、要求から再導出するための入力である。
[既存CI・AI候補との対応](../audits/l2-requirements/new-generation-ci-ai-source-crosswalk.md)は、旧候補から採る意味と
持ち込まない実装前提を記録する。
