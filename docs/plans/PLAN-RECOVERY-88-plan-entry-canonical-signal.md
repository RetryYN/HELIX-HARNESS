---
plan_id: PLAN-RECOVERY-88-plan-entry-canonical-signal
title: "PLAN-RECOVERY-88: PLAN entry canonical signal authority"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1453
behavior_contract_id: PLAN-ENTRY-CANONICAL-SIGNAL-AUTHORITY-001
responsibility_owner: plan-entry-routing
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "requirements-owned workflow catalogがcanonical signal tokenとtyped routeを提供する"
contract_postconditions: "exact canonical tokenはcatalog_signalとして解決され、human directive provenanceへ昇格しない"
contract_invariants: "DB feedback／issue_queue provenance、unknown／ambiguous／decision-required fail-close、po_directive compatibilityを維持する"
contract_failures: "canonical tokenのunresolvable化、literal tokenのhuman directive偽装、unknown tokenの受理を拒否する"
tdd_red_required: true
red_test: "PLAN-RECOVERY-87のentry_signalsにregression_devを指定するとplan-entry-routingがentry_signal_unresolvableでredになった"
red_at: "2026-09-02T15:25:00+09:00"
green_at: "2026-09-02T15:40:00+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/plan-entry-routing.test.tsのcatalog_signal解決分岐を除くmutationでU-PROUTE-003bがentry_signal_unresolvableとなりfailedし、復元後は29 tests green。"
complexity_effect: net_neutral
complexity_justification: "既存catalog resolverを再利用し、DB provenanceとclassification tokenを一つのhuman authority型へ畳み込む誤りを除く"
removal_trigger: "なし。typed PLAN entry分類の恒久境界"
backprop_decision: not_required
backprop_decision_reason: "Issue #1449の既存authority語彙境界を先行Recoveryし、新しい要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/plan-entry-canonical-signal-authority.md
pair_artifact: docs/test-design/helix/L8-plan-entry-canonical-signal-authority-unit-test-design.md
dependencies:
  parent: null
  requires: []
  references:
    - "issue:1449"
    - "issue:1451"
    - "issue:1453"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-88-plan-entry-canonical-signal.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/plan-entry-canonical-signal-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-plan-entry-canonical-signal-authority-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/design/harness/L6-function-design/plan-entry-routing.md, artifact_type: design_doc }
  - { artifact_path: src/lint/plan-entry-routing.ts, artifact_type: source_module }
  - { artifact_path: tests/plan-entry-routing.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — human authorityとclassification signalの境界監査" }
  - { role: se, slot_label: "SE — catalog signal resolver接続" }
  - { role: qa, slot_label: "QA — canonical／unknown signal反例" }
  - { role: tl, slot_label: "TL — #1449／#1451先行Recovery収束" }
review_evidence: []
---

# PLAN開始シグナル正本

PLANの開始理由をtyped classification signalで表現できるようにし、単なるIssue由来Recoveryを
human directive、approval、decisionへ昇格させない。
