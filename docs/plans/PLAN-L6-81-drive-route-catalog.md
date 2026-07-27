---
plan_id: PLAN-L6-81-drive-route-catalog
title: "PLAN-L6-81 (add-design): 全駆動モデル経路catalog"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-28 Forward／Scrum／Hybrid以外も含む全駆動モデル経路を整備する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 165
engineering_discipline_required: true
behavior_contract_id: U-DRCAT-001
responsibility_owner: drive-route-catalog
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "route catalogが全entry routeの機械可読契約を提示する"
contract_postconditions: "全routeの入口、工程、承認、合流、終了、後続をexact setで検査できる"
contract_invariants: "mode、delivery route、kind、drive、execution mode、工程専門workflowを混同しない"
contract_failures: "route欠落・重複、孤児遷移、model不許可kind、文書欠落をfail-closeする"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "分散した経路定数を単一catalogへ投影し、個別gateの古い経路前提を検出する"
removal_trigger: "workflow schemaが同じ全fieldとexact-set検査を直接所有した時点で統合する"
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
agent_slots:
  - { role: se, slot_label: "SE — route catalog schemaと純関数lint設計" }
  - { role: qa, slot_label: "QA — 欠落、孤児、kind drift反例" }
  - { role: tl, slot_label: "TL — 全駆動モデルの意味境界レビュー" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-81-drive-route-catalog.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/drive-route-catalog.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/drive-route-catalog.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-drive-route-catalog.md, artifact_type: test_design }
  - { artifact_path: config/drive-route-catalog.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L3-19-github-operations-projection.md
  requires:
    - docs/process/modes/README.md
  references:
    - docs/governance/helix-harness-concept_v3.1.md
    - docs/governance/helix-harness-requirements_v1.3.md
  blocks:
    - docs/plans/PLAN-L7-476-drive-route-catalog-gate.md
---

# PLAN-L6-81: 全駆動モデル経路catalog

## 完了条件

- route exact setと軸分離を正本化する。
- L6設計とL8 test-designが`U-DRCAT-001..004`で対応する。
- L7 gateがcatalog欠落・driftをdoctorでfail-closeする。
