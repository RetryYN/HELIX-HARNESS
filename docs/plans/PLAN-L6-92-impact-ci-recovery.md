---
plan_id: PLAN-L6-92-impact-ci-recovery
title: "PLAN-L6-92 (add-design): Impact CI Recovery"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-01 Issue #93 L3Q-IT-024 implementation"
created: 2026-08-01
updated: 2026-08-01
owner: Codex / TL
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: configure
legacy_retirement_state: consumers_present
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L5-84の型・selector・receipt契約がPR #332でmainへmerge済み"
contract_postconditions: "draft PRはimpact-selected test、Ready candidateとmainはfull exact setを実行する"
contract_invariants: "unknown/high-riskはfull、required gate非縮退、surface間green相殺0"
contract_failures: "invalid inventory、unknown impactのtargeted化、partition/receipt driftをfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "既存workflowとrelation inventoryへ薄いselectorを追加しfull suite実装を複製しない"
removal_trigger: "恒久profile契約のためなし。legacy unconditional PR full stepはconsumer 0後に削除する"
parent_design: docs/design/helix/L5-detail/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
generates:
  - { artifact_path: docs/plans/PLAN-L6-92-impact-ci-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-84-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L5-84-impact-ci-recovery.md
  blocks:
    - docs/plans/PLAN-L7-493-impact-ci-recovery.md
---

# PLAN-L6-92: Impact CI Recovery

L5契約を、pure selector、receipt validator、CLI profile projection、既存workflow dispatchへ一対一で降下する。
新runner、cache、DB table、required jobは追加しない。
