---
plan_id: PLAN-L5-82-design-template-json-authority
title: "PLAN-L5-82 (add-design): Design Template JSON authority詳細設計"
kind: add-design
layer: L5
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-31 Issue #290 template schemaとshadow parityをL5-L8へ降下する"
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
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-55がcomponent、authority、data flow、L9反例を定義する"
contract_postconditions: "template schema、applicability式、state/error、shadow parity、L8 mutationが実装可能な粒度で閉じる"
contract_invariants: "JSON構造正本、generated view、supplemental prose、inventoryのauthorityを混在させない"
contract_failures: "schema不正、unknown predicate、重複identity、trace/pair欠落、parity drift、旧正本化を拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "template・predicate・parityの三契約を単一versioned schema familyへ閉じ、個別Markdown parserを増やさない"
removal_trigger: "schema major versionをdual-green後にatomic cutoverし、v1 consumer=0になった時点"
pair_artifact: docs/test-design/helix/L5-design-template-json-authority-integration-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — schema/state/error詳細設計" }
  - { role: qa, slot_label: "QA — L8 mutation oracle" }
  - { role: tl, slot_label: "TL — 最小schemaと旧境界監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-82-design-template-json-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-template-json-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L5-design-template-json-authority-integration-test-design.md, artifact_type: test_design }
review_evidence: []
dependencies:
  parent: docs/plans/PLAN-L4-55-design-template-json-authority.md
  requires:
    - docs/design/helix/L4-basic-design/design-template-json-authority.md
    - docs/test-design/helix/L4-design-template-json-authority-system-test-design.md
  references:
    - config/requirement-ir-schema.json
    - requirements-ir/requirements.json
    - docs/design/design-catalog.yaml
  blocks:
    - docs/plans/PLAN-L6-86-design-template-json-authority.md
---

# PLAN-L5-82: Design Template JSON authority詳細設計

field、predicate、state、finding、shadow parity algorithmとL8 mutationを同じ原子契約で閉じる。
