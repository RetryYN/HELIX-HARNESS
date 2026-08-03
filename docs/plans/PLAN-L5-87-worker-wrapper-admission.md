---
plan_id: PLAN-L5-87-worker-wrapper-admission
title: "PLAN-L5-87 (add-design): worker wrapper admission詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Feature #92 Issue #225 WCC-FR-02をL5-L7へ連続降下する"]
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
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-61のL4/L9 pairがmainへmerge済み"
contract_postconditions: "route、origin、digest、failure、sealed capabilityとL8 oracleが実sourceへ束縛される"
contract_invariants: "1 behavior、1 owner、raw再ラベル0、新service／DB／workflow 0"
contract_failures: "route、provider、plan digest、invocation digestを固定順でfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存adapterへpure policyを統合し重複spawn ownerを作らない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-worker-wrapper-admission-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — route／origin／digest／failure詳細契約" }
  - { role: qa, slot_label: "QA — L8 executable／mutation oracle" }
  - { role: tl, slot_label: "TL — DRB実在性と後続WCC非混載監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-wrapper-admission-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-61-worker-wrapper-admission.md
  requires:
    - docs/design/helix/L4-basic-design/worker-wrapper-admission.md
    - docs/test-design/helix/L9-worker-wrapper-admission-system-test-design.md
  blocks:
    - docs/plans/PLAN-L6-95-worker-wrapper-admission.md
---

# PLAN-L5-87: worker wrapper admission詳細設計

DRB v1はdeclared failureごとにexact-HEADの実sourceとexecutable witnessを要求するため、未実装symbolを含むL5だけを
confirmed化しない。同一WCC-FR-02／ownerのL6/L7実装と同一candidate HEADで、4 failureと7 oracleを閉じる。
