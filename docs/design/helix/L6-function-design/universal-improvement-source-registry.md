---
title: "Universal Improvement source registry機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
plan: docs/plans/PLAN-L7-703-universal-improvement-source-registry.md
pair_artifact: docs/test-design/helix/L8-universal-improvement-source-registry-unit-test-design.md
github_issue_id: 1231
behavior_contract_id: UNIVERSAL-IMPROVEMENT-SOURCE-REGISTRY-001
responsibility_owner: universal-improvement-source-registry
---

# Universal Improvement source registry機能設計

## 責務とauthority

本機能は、Universal Improvement Loopが既存の決定的detectorから観測を受け取る入口を提供する。
意味authorityはL3のUniversal Improvement Loop要求とし、registryはそのrequirements-owned authorityから
source、detector、schema、freshness、evidence contractを投影する。registry、doctor、runtime admissionは
同じanalyzerを再利用し、別の判定表やprovider固有の正本を作らない。

観測sourceのadmissionはread-onlyであり、finding、改善candidate、Issue、PLAN、DB、Requirementを生成・更新しない。
AIはproposal-onlyで、detector evidenceや意味authorityを代替しない。

## 入力・出力契約

| 境界 | 入力 | 出力 | 契約 |
|---|---|---|---|
| registry loader | repository内のversioned JSONとexact-bytes integrity record | parsed registryまたはtyped failure | JSON欠落・破損・schema違反・registry bytes driftをfail-closeする |
| authority binding | registryのartifact path／digestとregistry bytes digest | source authority tuple | 共通physical filesystem identityでdevice/inode、mount、symlink、hardlink、TOCTOUと実体digestを検証する |
| source inventory | 10種のsource kind | unique source／detector集合 | required kind欠落、duplicate source／detectorを拒否する |
| observation admission | source／schema／detector／revision／evidence | admission result | unknown、wrong identity、必須field欠落、digest不正、staleを拒否する |
| doctor adapter | repository root | LintResult | runtime loaderと同じ結果を返し、欠落やbytes driftをwarningへ丸めない |

## 正規source tuple

各entryは次の正規tuple（複合識別単位）を持つ。

各項目として `source_id`、`source_kind`、`owner`、`authority`、`schema_version`、`revision`、`retention`、`redaction`、`failure_disposition`、
detector、evidence_contract、freshnessの各項目を持ち、environments、trigger_events、statusを含む。sourceごとに
観測保持方針、redaction方針、失敗時のfail-close処理を宣言し、宣言されたevidence contractのidentity／digest／
required fieldをadmissionで再検証する。

初期source kindは ci、db、requirements、definition、dependency、review、operations、provider、
distribution、resource_security の10種とする。既存detectorの実体pathとdigestを参照し、
detector実装を本sliceで再実装しない。

## 失敗境界

- repository外、絶対path、空path、symlink経由のauthority／detectorを読む前に拒否する。
- registryのrequired source kindはcanonical setと完全一致させる。
- source／detector identityとsource revisionはregistry entryとobservationで完全一致させる。
- 各source kindは一つのactive entryだけを持ち、重複source kindを拒否する。
- observationのrequired／identity／digest fieldはregistry宣言の欠落を許容せず、source_revisionを必須化してentryの`revision`とexact照合する。
- observationのtimestampがRFC3339形式・実在日付でない、未来、またはentryのfreshness windowを超える場合は拒否する。
- observationへraw log、stdout／stderr、credential、secret、token、PII相当のfieldを混入させない。
- digestは形式だけでなくregistryが指す実体bytesと比較する。
- registry JSONのexact bytesは `config/universal-improvement-source-registry.v1.integrity.json` の
  `registry_bytes_digest`へ束縛する。integrity recordが欠落・破損するか、registry bytesが記録値と異なる場合は、
  registry versionを含む意味変更を再計算なしに受理しない。構造検査の結果は物理検証済みとは扱わず、admissionへ
  渡すにはloaderの `physical_binding_verified` が必須である。
- loader成功結果はmodule-private proofへ束縛し、構造検査結果のboolean偽装や成功後のresult改竄をadmissionで拒否する。
- registry／integrityの再読込と全targetのphysical identity再検証を行い、検査中のTOCTOU driftを成功へ縮退しない。
- 全判定は候補生成前のread-only admissionで、authorityへの副作用を持たない。

## 再構築と責務境界

同じrepository authority、registry bytes、detector digestを与えた場合、loader／analyzerの結果は同じ
failure code集合になる。DBや通知本文を意味正本にせず、後続UIL-02の観測正規化へadmission済みtupleだけを渡す。
candidate合成、global counterfactual、route、terminal outcomeはUIL-04以降へ分離する。
