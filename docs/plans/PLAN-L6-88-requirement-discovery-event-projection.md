---
plan_id: PLAN-L6-88-requirement-discovery-event-projection
title: "PLAN-L6-88 (add-design): Requirement Discovery event／candidate projection"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-30 Requirement Discovery LoopからL3 strict JSON正本へ収束する"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
github_issue_id: 284
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-DISCOVERY-EVENT-PROJECTION
responsibility_owner: requirement-discovery-event-projection
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PR #289のRDJ-FR-002/003/005/007契約と既存RequirementDefinitionLedgerが存在する"
contract_postconditions: "17種のappend-only event、L3と同一の8 surface、非canonical candidate projectionのL6/L7契約が実装可能な粒度で確定する"
contract_invariants: "別Requirement Engine／DBを作らず、L3 canonical write authorityを持たず、human decisionを捏造しない"
contract_failures: "event改変、sequence/digest不連続、unknown event、invalid lifecycle、AI acceptance、surface enum drift、none理由/再評価条件欠落、score-only convergenceを拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "17 event種のstrict schemaとpure projectionを新設するため正味増加するが、既存RequirementDefinitionLedger前段の一責務に限定し、DB/CLI/別engineを追加しない"
removal_trigger: "G1/G3後のRequirement Discovery Engineが同一schema/projectionを吸収し本移行componentのconsumerが0になった時点"
parent_design: docs/design/helix/L5-detail/requirement-translation-obligation.md
pair_artifact: docs/test-design/helix/L8-requirement-discovery-event-projection-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — discovery event schemaとpure candidate projection"
  - role: qa
    slot_label: "QA — chain／lifecycle／human authority／収束反例"
  - role: tl
    slot_label: "TL — L2 noncanonical／L3 canonical authority境界"
generates:
  - { artifact_path: docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-discovery-event-projection-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
  requires:
    - docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
  references:
    - docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
    - docs/design/helix/L5-detail/requirement-translation-obligation.md
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
  blocks:
    - docs/plans/PLAN-L7-487-requirement-discovery-event-projection.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-30T16:39:40Z"
    tests_green_at: "2026-07-30T16:39:40Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #291 HEAD 33f005f90d0530039da819c74f2e906507fe75a8をclean detached worktreeで独立review。17 event、12 lifecycle、21 question class、L3と同一の8 surface、none理由/再評価条件、human-only decision、10条件収束、pure/write-authority-none境界を確認。Critical/High/Medium 0。DB projection/checkpoint replay一致、stale/orphan/finding 0、converged=true。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/requirement-discovery.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-30T16:39:40Z"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: repository
        exit_code: 0
        completed_at: "2026-07-30T16:39:40Z"
      - kind: db_convergence
        command: "npx --no-install tsx src/doctor/l3-g3-logical-db-receipt.ts"
        runner: node
        scope: repository
        exit_code: 0
        completed_at: "2026-07-30T16:39:40Z"
---

# PLAN-L6-88: Requirement Discovery event／candidate projection

既存Requirement Engineへ接続するL2 shadow event schema、candidate lifecycle、question／reaction／agreement、
deterministic projection、10条件収束を一つのpure component境界へ設計する。

本PLANのconfirmはL6設計とL7 test-designのpair freezeだけを意味し、実装、L3 canonical cutover、
G1/G3 freeze、Requirement Discovery Engine runtime完了を意味しない。
