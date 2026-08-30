---
plan_id: PLAN-L7-714-summary-frontier-typed-workflow
title: "PLAN-L7-714: summary・frontierの旧drive identityをtyped workflowへ収束する"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-31
updated: 2026-08-31
owner: Codex / TL
github_issue_id: 1264
behavior_contract_id: SUMMARY-FRONTIER-TYPED-WORKFLOW-001
responsibility_owner: summary-frontier-workflow-identity
change_slice: atomic
refactor_step: migrate_one_consumer
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: value_object
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "requirements-owned typed workflow authorityは確定済みで、本sliceは残存summary consumerの一方向移行である。skill applicabilityは#1265へ分離した。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #1264 summary・frontierの旧drive identity収束"
contract_preconditions: "current-location typed workflow identityとregistry receiptがcurrent authorityとして利用可能である"
contract_postconditions: "project-frontier／tree-view summaryとsummary contract command mapがworkflow_identity／workflow_routeだけをprimary identityとして返す"
contract_invariants: "legacy drive model commandはcompatibility surfaceに限定し、current summary failureをlegacy greenで相殺しない"
contract_failures: "drive_model object／command key再混入、registry tuple欠落、wrong navigation commandをfail-closeする"
tdd_red_required: true
tdd_red_evidence: "tests/summary-surface-audit.test.tsとtests/cli-surface.test.tsへ旧drive object／command再混入を拒否するoracleを先行追加する"
mutation_oracle_required: true
mutation_oracle_evidence: "drive_model object、commands.drive_model、旧command literalのいずれかを戻すとU-CLSO-007がfailする"
complexity_effect: net_negative
complexity_justification: "同じtyped identityをdrive_model wrapperへ重複投影する経路と旧navigation keyを除去する"
removal_trigger: "summary surfaceが後継generated view contractへ完全移行し同oracleが移管された時"
parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md
pair_artifact: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md
dependencies:
  parent: issue:206
  requires:
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
  references:
    - docs/plans/PLAN-L7-672-current-location-summary-typed-output.md
    - issue:1264
    - issue:206
    - issue:1265
  blocks:
    - issue:206
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-007, test_path: tests/summary-surface-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-008, test_path: tests/cli-surface.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-714-summary-frontier-typed-workflow.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/summary-surface-audit.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/summary-surface-audit.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — summary identity projection境界" }
  - { role: qa, slot_label: "QA — legacy object／command再混入mutation" }
---

# summary・frontier typed workflow収束

Issue #1264のsummary／frontier consumerだけを変更する。skill applicability consumerは#1265、DB legacy object retirement、release／cutoverは含めない。PLANはForward検証と独立reviewが完了するまでdraft、completion claim falseを維持する。
