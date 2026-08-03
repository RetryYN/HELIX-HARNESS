---
plan_id: PLAN-L4-68-worker-risk-admission
title: "PLAN-L4-68 (add-design): worker risk admission基本設計"
kind: add-design
layer: L4
drive: agent
status: draft
route_mode: add-feature
entry_signals: ["po_directive:Feature #92 WCC-FR-08をFR-07後に連続dispatchする"]
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "WCC-FR-07 sealed benchmark receiptがgreen"
contract_postconditions: "standalone finding、use policy、admit/retire、L9 oracleを固定"
contract_invariants: "critical finding平均相殺0、用途別decision、根拠なしeffort固定0"
contract_failures: "critical相殺、全用途一括admit、unsealed evidence、effort固定"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存receipt/digestを再利用するpure service一件、DB/workflow/provider fork 0"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-worker-risk-admission-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — 用途別admission基本設計" }
  - { role: qa, slot_label: "QA — L9 critical非相殺oracle" }
  - { role: tl, slot_label: "TL — FR-07/08境界監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-risk-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-risk-admission-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires: [docs/plans/PLAN-L7-504-worker-blind-benchmark.md]
  blocks: [docs/plans/PLAN-L5-94-worker-risk-admission.md]
---

# PLAN-L4-68: worker risk admission基本設計

WCC-FR-08だけをL4/L9へ降下する。
