---
plan_id: PLAN-RECOVERY-93-provider-process-env-boundary
title: "PLAN-RECOVERY-93: provider processのenv／stderr境界をfail-closeする"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1412
behavior_contract_id: PROVIDER-PROCESS-ENV-BOUNDARY-001
responsibility_owner: worker-wrapper-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retired
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
contract_preconditions: "provider childがprocess.env全体を継承し、plan digestがenvを束縛せず、失敗stderr本文を例外へ載せる"
contract_postconditions: "allowlist envだけを渡し、env key/value digestをsealし、失敗例外はstderr digestと長さだけを返す"
contract_invariants: "CLI／サブスク認証、provider command、worker context、sandbox責務を変更しない"
contract_failures: "credential継承、HELIX state path継承、seal後env改竄、stderr本文再露出を拒否する"
tdd_red_required: true
red_at: "2026-09-03T01:27:01+09:00"
green_at: "2026-09-03T01:27:52+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/worker-wrapper-admission.test.ts U-WWA-010/011とtests/orchestration/loop-bridge.test.ts U-WWA-012がprocess.env複製、env digest除去、stderr slice復帰を個別にRed化する"
complexity_effect: net_negative
complexity_justification: "legacy blocklistとstderr本文露出を削除し、既存adapter admissionへ単一allowlistとdigest projectionを集約する"
removal_trigger: "not_applicable"
backprop_decision: not_required
backprop_decision_reason: "既存security／worker wrapper契約の実装gapを閉じ、新しい要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md
pair_artifact: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-498-worker-wrapper-admission.md
  requires:
    - docs/plans/PLAN-L7-498-worker-wrapper-admission.md
  references: ["issue:362", "issue:669", "issue:1166"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-93-provider-process-env-boundary.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: src/orchestration/loop-bridge.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-wrapper-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/orchestration/loop-bridge.test.ts, artifact_type: test_code }
agent_slots:
  - { role: security, slot_label: "Security — env／stderr egress境界監査" }
  - { role: qa, slot_label: "QA — 3つの独立mutation oracle" }
  - { role: tl, slot_label: "TL — #1412 Recovery収束" }
review_evidence: []
---

# Provider process環境境界Recovery

HELIX control planeの環境をprovider processへ暗黙継承せず、必要な実行環境だけを明示投影する。
