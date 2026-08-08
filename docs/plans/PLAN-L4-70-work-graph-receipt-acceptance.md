---
plan_id: PLAN-L4-70-work-graph-receipt-acceptance
title: "PLAN-L4-70 (add-design): work graphと三段receipt検収の基本設計"
kind: add-design
layer: L4
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
contract_preconditions: "MIC-FR-001 / MIC-R-01..04 / MIC-AC-001..004がrequirements-ir/refinement_contracts.jsonにadmit済み（#396 close）"
contract_postconditions: "graph/role/acceptance systemの責務境界、三段receipt（worker terminal／独立review／親acceptance）の順序・同一HEAD・identity分離、fail-close一覧とL9 oracleを固定する"
contract_invariants: "未来receipt先書き0、worker自己承認0、work graphなし着手0、既存worker-lifecycle-receipt／worker-review-receiptの契約を破壊しない"
contract_failures: "work graphなし着手、dependency前倒し、receipt先書き、同一identity自己検収、HEAD drift、review／親acceptance欠落"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存のworker-lifecycle-receipt／worker-review-receipt／graph_nodes・dependency_edges・continuation_fencesを再利用し、新規はacceptance評価とgraph validatorのpure serviceに限定する"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-work-graph-receipt-acceptance-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — graph/role/acceptance境界と三段receipt順序契約の基本設計" }
  - { role: qa, slot_label: "QA — fail-close 6系統のL9 system oracle設計" }
  - { role: tl, slot_label: "TL — MIC-R-01..04 exact traceと既存receipt資産との境界監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-work-graph-receipt-acceptance-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-43-management-integration-cell-model.md
  requires:
    - docs/plans/PLAN-RECOVERY-12-requirement-refinement-authority.md
  blocks:
    - issue:213
---

# work graphと三段receipt検収の基本設計（L4/L9 pair）

## 目的

Issue #213 の behavior contract を L4 基本設計として固定する。実作業前に work graph・dependency edge・
capacity route・delegation-request receipt を確定し、worker terminal receipt・独立 review receipt・
親 acceptance receipt を「別 identity/session/context かつ同一 HEAD・順序付き」で閉じる仕組みの
責務境界を定義し、L9 system test design と pair で凍結する。

## 範囲

- graph/role/acceptance system の責務境界（L4）と system-level oracle（L9）。
- fail-close 6 系統: work graph なし着手 / dependency 前倒し / receipt 先書き / 同一 identity 自己検収 /
  HEAD drift / review・親 acceptance 欠落。
- MIC-FR-001 / MIC-R-01..04 / MIC-AC-001..004 への exact trace。

## 範囲外

- L5 詳細 schema・CAS/stale 判定の実装形（後続 L5/L8 PLAN）。
- graph validator / receipt admission / acceptance evaluator の実装と mutation tests（後続 L6/L7 PLAN）。
- 8-slot scheduler（#214）と event projection/replay（#215）。

## 再利用資産

- `src/runtime/worker-lifecycle-receipt.ts`: hash-chained lifecycle events と terminal stage。
- `src/runtime/worker-review-receipt.ts`: identity/session/context 分離検証と HIL_ORCHESTRATION_* failure codes。
- `src/schema/harness-db-tables-graph.ts`: graph_nodes と dependency_edges の既存テーブル定義。
- `src/schema/harness-db-tables-core.ts`: continuation_fences（lease パターンの再利用元）と closure_authority_review_receipts（projection 形式の手本）。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | L4 基本設計 doc 起草（責務境界・fail-close・trace 表） | [直列] | downstream_dependency (L9 oracle は L4 の fail-close 一覧に依存) |
| 2 | L9 system test design 起草（U-WGR-S oracle） | [直列] | downstream_dependency (Step1 の fail-close 系統に 1:1 対応させる) |
| 3 | review（独立 AI-B）と pair-freeze 準備 | [直列] | shared_state (両 doc 完成後の全体整合レビュー) |
