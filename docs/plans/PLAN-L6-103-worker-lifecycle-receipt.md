---
plan_id: PLAN-L6-103-worker-lifecycle-receipt
title: "PLAN-L6-103 (add-design): worker lifecycle receipt関数設計"
kind: add-design
layer: L6
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
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L5-95がschema、state、failure exact setを固定する"
contract_postconditions: "run receipt resolver、lifecycle factory、seal、serializer APIを固定する"
contract_invariants: "untrusted actor field 0、raw output公開0、Node以外のwrite 0"
contract_failures: "5 failure branchがU-WLIFE oracleへ到達する"
tdd_red_required: false
complexity_effect: net_positive
complexity_justification: "4 APIを追加するが、brokerの既存WeakMap sealとdigest coreを再利用しauthority surfaceを増やさない"
removal_trigger: "#214 scheduler projectorがsealed capabilityを直接所有し、本factory/serializerを置換できる時"
pair_artifact: docs/test-design/helix/L6-worker-lifecycle-receipt-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — typed lifecycle API" }
  - { role: qa, slot_label: "QA — seal／chain oracle" }
  - { role: tl, slot_label: "TL — broker結線監査" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/worker-lifecycle-receipt.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-worker-lifecycle-receipt-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-95-worker-lifecycle-receipt.md
  blocks:
    - docs/plans/PLAN-L7-506-worker-lifecycle-receipt.md
---

# PLAN-L6-103: worker lifecycle receipt関数設計

唯一の生成、検証、serialization APIを固定する。
