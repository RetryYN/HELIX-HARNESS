---
plan_id: PLAN-L4-54-specialist-agent-registry
title: "PLAN-L4-54 (add-design): 専門agent registry基本設計"
kind: add-design
layer: L4
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
contract_preconditions: "UTH-FR-033/UTH-AC-025がconfirmed"
contract_postconditions: "registry/admission/selectionのcomponentとL9反例が閉じる"
contract_invariants: "drive/model/agent guardを複製せず既存正本を参照する"
contract_failures: "definition/allowlist/team独立性driftをfail-closeする"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "分散済みroster/allowlist/model検査を一つのadmissionへ束縛する"
removal_trigger: "runtime roster ownerへ完全統合しconsumer=0になった時点"
pair_artifact: docs/test-design/helix/L4-specialist-agent-registry-system-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — component/authority境界" }
  - { role: qa, slot_label: "QA — L9 system反例" }
  - { role: tl, slot_label: "TL — 既存roster再利用" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-54-specialist-agent-registry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/specialist-agent-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L4-specialist-agent-registry-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md
  requires: []
  references:
    - docs/test-design/helix/predecessor-harness-mechanism-hardening-acceptance.md
  blocks:
    - docs/plans/PLAN-L5-81-specialist-agent-registry.md
---

# PLAN-L4-54: 専門agent registry基本設計

component、authority、stale、failureとL9 system assertionを同じ粒度で閉じる。
