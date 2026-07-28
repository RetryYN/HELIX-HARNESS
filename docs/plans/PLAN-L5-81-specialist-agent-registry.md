---
plan_id: PLAN-L5-81-specialist-agent-registry
title: "PLAN-L5-81 (add-design): 専門agent registry詳細設計"
kind: add-design
layer: L5
drive: agent
status: draft
route_mode: add-feature
entry_signals: ["po_directive:2026-07-28 駆動モデルの専門工程経路と担当agent authorityを整備する"]
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 190
engineering_discipline_required: true
behavior_contract_id: UTH-FR-033
responsibility_owner: specialist-agent-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "L4/L9がcomponentとauthorityを定義する"
contract_postconditions: "entry/source/allowlist/team選定をversioned schema化する"
contract_invariants: "unknown capabilityや同provider verifierを補完しない"
contract_failures: "schema/digest/allowlist/capability/axis driftを拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "9 entryの単一configで既存4正本の結線を明示する"
removal_trigger: "registry major version cutover時にdual-green後に除去する"
pair_artifact: docs/test-design/helix/L5-specialist-agent-registry-integration-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — registry schema/digest" }
  - { role: qa, slot_label: "QA — L8 mutation" }
  - { role: tl, slot_label: "TL — minimality review" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-81-specialist-agent-registry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/specialist-agent-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L5-specialist-agent-registry-integration-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-54-specialist-agent-registry.md
  requires: []
  references:
    - docs/plans/PLAN-L4-54-specialist-agent-registry.md
  blocks:
    - docs/plans/PLAN-L6-85-specialist-agent-registry.md
---

# PLAN-L5-81: 専門agent registry詳細設計

entry field、digest、allowlist、team selectionとL8 mutationを閉じる。
