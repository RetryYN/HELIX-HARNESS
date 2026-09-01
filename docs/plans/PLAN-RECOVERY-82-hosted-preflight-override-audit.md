---
plan_id: PLAN-RECOVERY-82-hosted-preflight-override-audit
title: "PLAN-RECOVERY-82: hosted preflight override audit"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1390
behavior_contract_id: HOSTED-PREFLIGHT-OVERRIDE-AUDIT-001
responsibility_owner: hosted-preflight
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: removed
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:外部監査で検出したP0 hosted preflight監査なしoverrideを正規Recoveryする"
contract_preconditions: "hosted surfaceはrepo-local hookが実行されないことを明示ackする"
contract_postconditions: "foreign edit overrideは理由、subject digest、nonce、DB transactionへ束縛される"
contract_invariants: "PATや暗黙fallbackを追加せず、既存guard override transactionを再利用する"
contract_failures: "理由欠落、audit失敗、nonce再利用、hook非強制ack欠落をexit 2で拒否する"
tdd_red_required: true
red_test: "HU-PILLAR-NAC-03..05追加前は理由なしbypassと同一override再利用が通過"
red_at: "2026-09-02T07:49:00+09:00"
green_at: "2026-09-02T07:52:04+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "reason必須分岐を除去するとHU-PILLAR-NAC-03がfailedし、nonceを固定せず再生成するとHU-PILLAR-NAC-05がfailedする設計。production復元後はtests/hosted-preflight.test.ts 9 tests green／exit 0。"
complexity_effect: net_negative
complexity_justification: "hook側と同じcommitOverrideUse／guard_override_transactionsを共有し、CLI専用auditを作らない"
removal_trigger: "なし。hosted enforcement境界の恒久不変条件"
backprop_decision: required
backprop_decision_reason: "hosted preflightの旧boolean自己申告を監査可能receiptへ置換する"
parent_design: docs/design/helix/L6-function-design/hosted-preflight-override-audit.md
pair_artifact: docs/test-design/helix/L8-hosted-preflight-override-audit-unit-test-design.md
dependencies:
  parent: PLAN-L7-215-hosted-preflight
  requires:
    - docs/plans/PLAN-L7-215-hosted-preflight.md
  references:
    - "issue:1390"
    - "issue:895"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-82-hosted-preflight-override-audit.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/hosted-preflight-override-audit.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-hosted-preflight-override-audit-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/hosted-preflight.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — override transaction共有" }
  - { role: qa, slot_label: "QA — reason／nonce／ack反例" }
  - { role: tl, slot_label: "TL — hosted enforcement終端" }
review_evidence: []
---

# Hosted preflight override audit

hook非対応surfaceの例外を、理由なしbooleanから既存のdigest-only DB監査と再利用不能nonceへ移行する。
