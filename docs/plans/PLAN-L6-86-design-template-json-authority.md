---
plan_id: PLAN-L6-86-design-template-json-authority
title: "PLAN-L6-86 (add-design): Design Template JSON authority機能設計"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-31 Issue #290 template validatorとshadow compilerをL6-L7へ降下する"
created: 2026-07-31
updated: 2026-07-31
owner: Codex / TL
github_issue_id: 290
engineering_discipline_required: true
behavior_contract_id: DESIGN-TEMPLATE-JSON-AUTHORITY
responsibility_owner: design-template-json-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L5-82がschema、predicate、state、finding、shadow parityをfreezeする"
contract_postconditions: "pure validator、applicability evaluator、shadow compiler、view verifierのsignature/DbC/pseudocodeとL7 oracleが閉じる"
contract_invariants: "filesystem/network/DB writeをcoreから排除し、入力byteとtyped valueだけから決定論resultを返す"
contract_failures: "parse、identity、predicate、trace、pair、measurement、parity、view digest、legacy authority違反をstable findingで拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "4 pure functionへ検証責務を閉じ、class階層、service、DB table、Markdown parserを追加しない"
removal_trigger: "Design Template schema major cutover後にv1 function consumer=0になった時点"
pair_artifact: docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — signature/DbC/pseudocode" }
  - { role: qa, slot_label: "QA — L7 unit mutation oracle" }
  - { role: tl, slot_label: "TL — pure coreと最小code監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-86-design-template-json-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-template-json-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md, artifact_type: test_design }
review_evidence: []
dependencies:
  parent: docs/plans/PLAN-L5-82-design-template-json-authority.md
  requires:
    - docs/design/helix/L5-detail/design-template-json-authority.md
    - docs/test-design/helix/L5-design-template-json-authority-integration-test-design.md
  references:
    - config/requirement-ir-schema.json
    - requirements-ir/requirements.json
  blocks:
    - docs/plans/PLAN-L7-491-design-template-json-authority.md
---

# PLAN-L6-86: Design Template JSON authority機能設計

pure functionのsignature、DbC、pseudocode、capacity、stable findingとL7 unit oracleを閉じる。
