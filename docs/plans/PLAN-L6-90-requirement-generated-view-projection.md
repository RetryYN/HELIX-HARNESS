---
plan_id: PLAN-L6-90-requirement-generated-view-projection
title: "PLAN-L6-90 (add-design): Requirement generated view／DB shadow projection"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-30 JSON generated viewとharness.db shadow projectionを閉じる"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
github_issue_id: 286
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-IR-GENERATED-VIEW-PROJECTION
responsibility_owner: requirement-ir-generated-view-projection
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-89の153/24/72/24 stable-ID shadow shardとroot manifestがpair freeze済みである"
contract_postconditions: "generated Markdown round-tripと既存harness.db shadow rebuild x2が実装可能な粒度で確定する"
contract_invariants: "PR5までlegacy Markdown authorityを維持し、別DB／別engine／canonical writer／Design Template JSONを追加しない"
contract_failures: "path、kind、count、stable ID、shard/root digest、round-trip、DB denominator、owner/oracle不一致を拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "generator/parserと既存DBの1 tableを追加するが、raw requirement本文をDBへ複製せず別service／dependencyを作らない"
removal_trigger: "PR5 cutoverでshadow authorityがcanonical readerへ吸収され、shadow projection consumerが0になった時点"
parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md
pair_artifact: docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — stable-ID shard loader、generated view、DB projection"
  - role: qa
    slot_label: "QA — round-trip、digest drift、rebuild x2、orphan反例"
  - role: tl
    slot_label: "TL — authority境界とschema revision review"
generates:
  - { artifact_path: docs/plans/PLAN-L6-90-requirement-generated-view-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
  requires:
    - docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
  references:
    - generated/requirements-ir/manifest.json
    - docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md
  blocks:
    - docs/plans/PLAN-L7-489-requirement-generated-view-projection.md
---

# PLAN-L6-90: Requirement generated view／DB shadow projection

PR3 shadow JSONからgenerated Markdownと既存harness.db shadow read modelを再構築する。
本PLANのconfirmはL6設計とL8 test-designのpair freezeだけを意味し、PR5 canonical cutover、
G1/G3 freeze、Design Template JSON完了を意味しない。
