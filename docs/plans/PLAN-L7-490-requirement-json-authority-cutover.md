---
plan_id: PLAN-L7-490-requirement-json-authority-cutover
title: "PLAN-L7-490 (add-impl): Requirement JSON authority cutover"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-30 PR-5 JSON canonical cutover"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
github_issue_id: 287
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-JSON-AUTHORITY-CUTOVER
responsibility_owner: requirement-json-authority
change_slice: atomic
refactor_step: replace_legacy_authority
legacy_retirement_state: pending_consumer_zero
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-91がcanonical／generated／compatibility／DB切替をpair freezeする"
contract_postconditions: "canonical JSON、generated view、requirement_ir DB、既存doctor authority gateが同一rootへ収束する"
contract_invariants: "dual authority 0、legacy semantic writer 0、旧shadow DB/artifact 0、denominator drift 0"
contract_failures: "canonical/view/digest/consumer/table driftをfail-closeする"
tdd_red_required: true
red_at: "pending"
green_at: "pending"
mutation_oracle_evidence: "pending: generated view／compatibility digest／legacy consumer mutation"
complexity_effect: reduced
complexity_justification: "shadow loaderをmigration-onlyへ隔離し、canonical loaderと既存doctor責務へ収束する"
removal_trigger: "恒久authority contractのためなし。migration compilerはcompatibility consumer 0で削除する"
parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md
pair_artifact: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — canonical loader／projection／retirement"
  - role: qa
    slot_label: "QA — authority driftとnegative oracle"
  - role: tl
    slot_label: "TL — atomic cutover judgement"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-001, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-002, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-003, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-004, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-005, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-006, test_path: tests/requirement-authority.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-490-requirement-json-authority-cutover.md, artifact_type: markdown_doc }
  - { artifact_path: config/requirement-ir-authority.json, artifact_type: json_config }
  - { artifact_path: config/requirement-ir-schema.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: src/requirements/requirement-authority.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-authority-gate.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-91-requirement-json-authority-cutover.md
  requires:
    - docs/plans/PLAN-L6-91-requirement-json-authority-cutover.md
  references:
    - docs/plans/PLAN-L7-488-requirement-ir-shadow-migration.md
    - docs/plans/PLAN-L7-489-requirement-generated-view-projection.md
  blocks:
    - docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
---

# PLAN-L7-490: Requirement JSON authority cutover

## §工程表

1. Red: generated view、compatibility digest、legacy consumer、shadow table残存の反例を固定する。
2. Green: canonical loader、authority packet、既存doctor統合、v41 projectionを最小実装する。
3. Refactor: shadow generatorをmigration-onlyへ隔離し、dual authority surfaceを削除する。

## §closure

PLAN-L6-91 pair freeze、U-RAC-001..006、typecheck、full CI、DB convergence、
authoring runtimeと異なるAI-B reviewを同一HEADへ束縛した場合だけconfirmedへ遷移する。
