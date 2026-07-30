---
plan_id: PLAN-L6-91-requirement-json-authority-cutover
title: "PLAN-L6-91 (add-design): Requirement JSON authority cutover"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-30 PR-5 JSON canonical cutover"
created: 2026-07-30
updated: 2026-07-31
owner: Codex / TL
github_issue_id: 287
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-JSON-AUTHORITY-CUTOVER
responsibility_owner: requirement-json-authority
change_slice: atomic
refactor_step: remove_legacy
legacy_retirement_state: consumer_zero
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "PR3 shadow exact setとPR4 generated view／DB shadowが同一root digestへ収束済み"
contract_postconditions: "JSON stable-ID shardだけがcanonicalで、Markdownはgeneratedまたはcompatibility read-only、DBはrequirement_irへ一回切替される"
contract_invariants: "153/24/72/24、12 owner correction、3 design port、human-only authorityを維持し、dual authorityを作らない"
contract_failures: "JSON/view/digest/compatibility drift、legacy semantic read、shadow artifact/table残存をfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "shadow/canonical二系統をcanonical loaderと既存doctor責務へ統合し、旧shadow artifact/tableを削除する"
removal_trigger: "恒久authority contractのためなし。compatibility inputはconsumer 0とfreeze後のretirement承認で削除する"
parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md
pair_artifact: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — canonical shard／view／DB atomic cutover"
  - role: qa
    slot_label: "QA — dual authority／digest／consumer negative oracle"
  - role: tl
    slot_label: "TL — legacy compatibilityとcutover境界"
generates:
  - { artifact_path: docs/plans/PLAN-L6-91-requirement-json-authority-cutover.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
  requires:
    - docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
  references:
    - docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
    - docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
  blocks:
    - docs/plans/PLAN-L7-490-requirement-json-authority-cutover.md
---

# PLAN-L6-91: Requirement JSON authority切替

pair freezeはJSON authority、generated view、compatibility exact set、DB projection、legacy retirementを
一つの切替契約として確定する。G1/G3 freezeやDesign Template JSON完了を意味しない。
