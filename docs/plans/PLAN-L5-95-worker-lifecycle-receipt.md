---
plan_id: PLAN-L5-95-worker-lifecycle-receipt
title: "PLAN-L5-95 (add-design): worker lifecycle receipt詳細設計"
kind: add-design
layer: L5
drive: agent
status: draft
route_mode: add-feature
entry_signals: ["po_directive:Issue #227 durable lifecycle残差を閉じる"]
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 227
engineering_discipline_required: true
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-69がcomponentとauthorityを固定する"
contract_postconditions: "run receipt、event chain、terminal規則が実装可能になる"
contract_invariants: "seven-state exact chain、HEAD/parent/boundary digest exact"
contract_failures: "copy、mismatch、invalid transitionをtyped failureへ束縛する"
tdd_red_required: false
complexity_effect: net_positive
complexity_justification: "state/hash-chain schemaを追加するが、別event storeを作らずcanonical serialized receiptへ集約する"
removal_trigger: "#214 schedulerのcanonical event schemaへ同一fieldが移行しdual-green後に本schemaを廃止できる時"
pair_artifact: docs/test-design/helix/L8-worker-lifecycle-receipt-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — receipt schema／state" }
  - { role: qa, slot_label: "QA — reachability／mutation" }
  - { role: tl, slot_label: "TL — terminal整合監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-lifecycle-receipt.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-lifecycle-receipt-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-69-worker-lifecycle-receipt.md
  blocks:
    - docs/plans/PLAN-L6-103-worker-lifecycle-receipt.md
---

# PLAN-L5-95: worker lifecycle receipt詳細設計

run receipt field、hash-chain、terminal整合を固定する。
