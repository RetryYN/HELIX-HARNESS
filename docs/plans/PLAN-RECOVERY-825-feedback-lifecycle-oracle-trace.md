---
plan_id: PLAN-RECOVERY-825-feedback-lifecycle-oracle-trace
title: "PLAN-RECOVERY-825: feedback lifecycle統合oracleの追跡関係を復旧する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 825
behavior_contract_id: FEEDBACK-LIFECYCLE-ORACLE-TRACE-001
responsibility_owner: feedback-lifecycle
engineering_discipline_required: true
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: none
complexity_effect: net_neutral
backprop_decision: not_required
backprop_decision_reason: "confirmed済みL9契約の意味や実行挙動を変えず、既存test titleへ欠落していたoracle IDを復旧する。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "L9はIT-FLIFE-003をconfirmed済みだが、実行可能test titleから同一IDを直接追跡できずintegration-oracle-traceがmainを拒否する。"
contract_postconditions: "group-first surfaceとbatch/replayの既存oracleがIT-FLIFE-003を明示し、L9から実行証拠まで決定的に追跡できる。"
contract_invariants: "test body、feedback lifecycleの挙動、L9受入意味、既存U-FLIFE oracleを変更しない。"
contract_failures: "ID欠落または誤ったtestへの付与をintegration-oracle-traceと対象testでfail-closeする。"
tdd_red_required: false
mutation_oracle_required: false
mutation_oracle: "追跡metadataのみの復旧であり、IDを除去した実状態をintegration-oracle-traceが既に検出したため追加mutationは不要。"
parent_design: docs/design/harness/L6-function-design/feedback-lifecycle.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/feedback-lifecycle.md, oracle_id: U-FLIFE-013, test_path: tests/feedback-lifecycle.test.ts }
dependencies:
  parent: docs/plans/PLAN-L7-455-sessionstart-feedback-receipt-batch.md
  requires: []
  references:
    - "issue:825"
    - docs/test-design/harness/L9-integration-test-design.md
  blocks: []
agent_slots:
  - { role: tl, slot_label: "TL — L9契約と既存oracleの意味同一性を確認" }
  - { role: qa, slot_label: "QA — trace gateと対象testを検証" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-825-feedback-lifecycle-oracle-trace.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: tests/feedback-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/feedback-lifecycle.test.ts, artifact_type: test_code }
---

# PLAN-RECOVERY-825

mainで露出した`IT-FLIFE-003`の孤児追跡を復旧する。既存のgroup-first surface oracleと
batch/replay oracleのtest titleへL9の統合oracle IDを明示し、挙動を変えずに追跡関係だけを閉じる。
