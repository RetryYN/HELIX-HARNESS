---
plan_id: PLAN-L4-69-worker-lifecycle-receipt
title: "PLAN-L4-69 (add-design): worker lifecycle receipt基本設計"
kind: add-design
layer: L4
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
contract_preconditions: "WCC-FR-05/06 sealed output/reviewがmainでgreenである"
contract_postconditions: "worker lifecycleのcomponent、authority、data flowを固定する"
contract_invariants: "Node write authorityのみ、copied capability 0、terminal後遷移0"
contract_failures: "unsealed receipt、別proposal review、terminal矛盾"
tdd_red_required: false
complexity_effect: net_positive
complexity_justification: "#227完了に必須のdurable lifecycleを追加するが、既存broker capabilityとdigest coreを再利用し新DB/workflowを作らない"
removal_trigger: "#214 schedulerのcanonical event projectorが同じreceiptを吸収し、現APIを削除しても全oracleがgreenになる時"
pair_artifact: docs/test-design/helix/L9-worker-lifecycle-receipt-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — lifecycle component境界" }
  - { role: qa, slot_label: "QA — L9 negative oracle" }
  - { role: tl, slot_label: "TL — WCC-FR-05 exact scope監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-lifecycle-receipt-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires:
    - docs/plans/PLAN-L7-501-worker-output-admission.md
    - docs/plans/PLAN-L7-502-worker-independent-review.md
  blocks:
    - docs/plans/PLAN-L5-95-worker-lifecycle-receipt.md
---

# PLAN-L4-69: worker lifecycle receipt基本設計

Issue #227のdurable lifecycle残差だけをWCC-FR-05 deltaとして閉じる。
