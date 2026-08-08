---
plan_id: PLAN-L5-96-work-graph-receipt-acceptance
title: "PLAN-L5-96 (add-design): work graphと三段receipt検収の詳細設計"
kind: add-design
layer: L5
drive: agent
status: draft
route_mode: add-feature
entry_signals: ["po_directive:Issue #213 work graphと三段receipt検収をMIC要件へexact traceして実装する"]
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 213
engineering_discipline_required: true
behavior_contract_id: MIC-FR-001
responsibility_owner: work-graph-receipt-acceptance
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L4-70のL4/L9 pairがconfirm・merge済み（PR #466）"
contract_postconditions: "delegation-request／parent acceptance receiptのtyped schema、ordering判定契約、CAS/stale判定、WORK_GRAPH_* failure code一覧、L8 unit oracleを固定する"
contract_invariants: "順序はdelegation→independent review sealed→worker terminal→親acceptance、既存worker-lifecycle-receipt／worker-review-receiptの契約を入力として使い新規wrapperを作らない"
contract_failures: "required cell binding欠落・unknown field相殺、ordering逆転、CAS後着admit、stale lease再利用、HEAD drift"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存receipt契約とfence tokenパターンをtyped schemaへ固定するのみで、新規ledger・DB系列・workflowを作らない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-work-graph-receipt-acceptance-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — typed schemaとordering/CAS判定契約の詳細設計" }
  - { role: qa, slot_label: "QA — L8 unit oracleとmutation条件の設計" }
  - { role: tl, slot_label: "TL — L4境界との整合とfailure code命名監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/work-graph-receipt-acceptance.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-work-graph-receipt-acceptance-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-70-work-graph-receipt-acceptance.md
  requires:
    - docs/plans/PLAN-L4-70-work-graph-receipt-acceptance.md
  blocks:
    - issue:213
---

# work graphと三段receipt検収の詳細設計（L5/L8 pair）

## 目的

PLAN-L4-70 で凍結した責務境界と fail-close 系統を、実装可能な typed schema・判定関数契約・
failure code 一覧（L5）と、判定単体を Red にできる unit oracle（L8）へ降ろす。

## 範囲

- delegation-request receipt / parent acceptance receipt の typed schema（required cell binding exact set）。
- ordering 判定（前段 receipt digest の単調 chain、同一 repository_head）の関数契約。
- CAS/stale 判定（fence token 取得・解放、後着 stale 拒否、reject/quarantine 後の新 lease 再割当）。
- WORK_GRAPH_* failure code 一覧と L8 unit oracle（U-WGR 連番）。

## 範囲外

- graph validator / receipt admission / acceptance evaluator の実装コードと mutation tests（後続 L6/L7 PLAN）。
- 8-slot scheduler（#214）と event projection/replay（#215）。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | L5 詳細設計 doc 起草（schema・判定契約・failure code） | [直列] | downstream_dependency (L8 oracle は L5 の判定契約に依存) |
| 2 | L8 unit test design 起草（U-WGR oracle・mutation 条件） | [直列] | downstream_dependency (Step1 の failure code に 1:1 対応させる) |
| 3 | review（独立 AI-B）と pair-freeze 準備 | [直列] | shared_state (両 doc 完成後の全体整合レビュー) |
