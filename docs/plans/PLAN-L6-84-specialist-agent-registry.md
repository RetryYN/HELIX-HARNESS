---
plan_id: PLAN-L6-84-specialist-agent-registry
title: "PLAN-L6-84 (add-design): 専門agent registry機能設計"
kind: add-design
layer: L6
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
contract_preconditions: "L5/L8がschemaとmutationを定義する"
contract_postconditions: "loader/analyzer/selectorのpure contractが確定する"
contract_invariants: "process起動/write/fallback補正を行わない"
contract_failures: "findingをteam admission deniedへ変換する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "loader、pure analyzer、pure selectorだけを追加する"
removal_trigger: "team runtimeのregistry ownerへ統合し公開consumer=0になった時点"
pair_artifact: docs/test-design/helix/L8-specialist-agent-registry-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — loader/analyzer/selector" }
  - { role: qa, slot_label: "QA — U oracle" }
  - { role: tl, slot_label: "TL — authority review" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-84-specialist-agent-registry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/specialist-agent-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-specialist-agent-registry-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-81-specialist-agent-registry.md
  requires: []
  references:
    - docs/plans/PLAN-L5-81-specialist-agent-registry.md
  blocks:
    - docs/plans/PLAN-L7-479-specialist-agent-registry.md
---

# PLAN-L6-84: 専門agent registry機能設計

DbCとU-SAREG-001〜004をone-to-oneでL7 testへ降ろす。
