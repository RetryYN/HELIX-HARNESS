---
plan_id: PLAN-L6-89-requirement-ir-shadow-migration
title: "PLAN-L6-89 (add-design): Requirement IR shadow migration"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-30 現行153要求を意味不変のshadow JSONへ移行する"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
github_issue_id: 285
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-IR-SHADOW-MIGRATION
responsibility_owner: requirement-ir-shadow-migration
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PR #284のdiscovery event schemaとはauthorityを分離し、現行Markdown 153/24/72/24がcurrent authorityである"
contract_postconditions: "153/24/72/24のshadow JSON、semantic parity、既知12要求owner是正が実装可能な粒度で確定する"
contract_invariants: "Markdown authorityを維持し、発見証拠を捏造せず、Design Template JSONは3つの空port以外を実装しない"
contract_failures: "分母、statement digest、owner exact-one、HAC/HAT、既知12 ID、生成snapshot再現性の不一致を拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "移行compiler、schema、shadow snapshotを新設するが、別engine／DB／canonical readerを追加せずPR5 cutover時に吸収する"
removal_trigger: "PR5でJSON canonical readerとstable-ID manifestが有効になりshadow consumerが0になった時点"
parent_design: docs/design/helix/L5-detail/requirement-translation-obligation.md
pair_artifact: docs/test-design/helix/L8-requirement-ir-shadow-migration-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — 153/24/72/24の意味不変shadow設計"
  - role: qa
    slot_label: "QA — 分母／digest／owner／生成再現の反例設計"
  - role: tl
    slot_label: "TL — Markdown正本とshadow非正本のauthority境界"
generates:
  - { artifact_path: docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-ir-shadow-migration-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
  requires:
    - docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
    - docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md
  references:
    - docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
    - docs/governance/infinity-loop-requirement-definition-ledger.md
    - docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
    - docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md
  blocks:
    - docs/plans/PLAN-L7-488-requirement-ir-shadow-migration.md
---

# PLAN-L6-89: 要求IRのshadow移行

現行Markdown正本から153/24/72/24をshadow JSONへ射影し、既知12要求のownerを是正する。
本PLANのconfirmはL6設計とL8 test-designのpair freezeだけを意味し、JSON canonical cutover、
G1/G3 freeze、Design Template JSON完了を意味しない。
