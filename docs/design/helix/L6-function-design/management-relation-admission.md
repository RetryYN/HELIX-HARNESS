---
title: "Management Relation Admission関数設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-13
updated: 2026-09-13
owner: SE
plan: docs/plans/PLAN-L7-730-management-relation-admission.md
pair_artifact: docs/test-design/helix/L8-management-relation-admission.md
---

# Management Relation Admission関数設計

## 1. 責務

`src/runtime/management-relation-admission.ts`は、PLANに埋め込まれたproduct contractと管理情報を
owner inventoryで分離し、legacy fieldと管理relationのdual-read結果を副作用なしで判定する。
GitHub、DB、filesystem、scheduler、Assignment lifecycle、lease／fenceを所有しない。

実Assignmentの有効性は#860、V-pair／上下traceは既存`TraceEdge`、Capability／Release配置は#1500が
引き続きauthorityを持つ。本moduleはそれらへのtyped参照を照合するだけで、第二の台帳やwriterを作らない。

## 2. 所有者台帳

top-level fieldと主要nested fieldを`product_contract`、`management_control`、
`transactional_control`、`projection`、`legacy`のexactly oneへ分類する。意味を二分すべき`status`、
`workflow_phase`、`review_evidence`、`l3_human_approval`は一方へ丸めず`split_required`とする。
未知fieldはfail-closeし、versioned inventory全体のcanonical digestを公開する。

## 3. 関係schema

- `WorkTicketAssignment`: required role/capabilityと#860 assignment ref／generation／validityを束縛する。
- `AdmissionDependency`: ticket間の着手依存だけを`requires`／`blocks`方向で表す。
- `TransitionEvent`: state machine、from/to、event ID、actor、evidence refを保持する。
- `EvidenceSubjectRef`: commit/tree、contract/policy revision、envelope、issuer、trust、approval kind、失効を保持する。

`dependencies.parent/references`を`AdmissionDependency`へ変換せず、技術reviewをPO承認へ昇格させない。

## 4. 二重読取の受入判定

結果は`match`、`legacy_only`、`relation_only`、`mismatch`、`unavailable`のexact setで返す。
pilot対象外だけ`legacy_only`を許容し、pilotではcanonical relation欠落をlegacy greenで相殺しない。
writer cutover後はrelationだけを書き込み、compatibility reader期間に限って`match`を許容する。
legacy consumerが0でなければretirementを拒否するが、readerを残したsingle-writer切替自体とは混同しない。
同一operationのdual-writeは禁止する。

transitionは同一ID・同一内容だけ冪等吸収し、同一ID・異内容、from-state不一致、同一from-stateからの
二重business transitionを拒否する。admission digestは入力と判定に追従するが、管理relationの変化で
product contractのsemantic digestを変更しない。

## 5. 初期slice境界

本sliceはschema、owner inventory、pure evaluator、反例oracleまでとする。DB shadow保存、production writer切替、
legacy field削除、digest v2切替は行わない。後続はconsumer単位でdual-greenとconsumer-zeroを実証してから進める。
