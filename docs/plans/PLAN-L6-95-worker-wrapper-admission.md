---
plan_id: PLAN-L6-95-worker-wrapper-admission
title: "PLAN-L6-95 (add-design): worker wrapper admission関数設計"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Feature #92 Issue #225 WCC-FR-02をL6/L7へ降下する"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-87がroute、digest、failure exact setを固定する"
contract_postconditions: "既存adapterの全worker sinkが同じadmissionを通る"
contract_invariants: "raw plan spawn 0、capability forge 0、新永続state 0"
contract_failures: "4 failureを実行fixtureとmutationで到達可能にする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "production新規file 0で既存spawn経路を一policyへ縮約する"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L5-detail/worker-wrapper-admission.md
pair_artifact: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — adapter admissionとsink関数設計" }
  - { role: qa, slot_label: "QA — failure branchとcapability oracle" }
  - { role: tl, slot_label: "TL — admitted execution消費境界監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-87-worker-wrapper-admission.md
  requires:
    - docs/design/helix/L5-detail/worker-wrapper-admission.md
    - docs/test-design/helix/L8-worker-wrapper-admission-unit-test-design.md
  blocks:
    - docs/plans/PLAN-L7-498-worker-wrapper-admission.md
---

# PLAN-L6-95: worker wrapper admission関数設計

既存`adapter.ts`へcanonical digest、origin、admission、sealed capabilityを追加し、CLI、team、pair-agent、loopへ接続する。
