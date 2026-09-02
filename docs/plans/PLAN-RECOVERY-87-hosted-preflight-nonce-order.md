---
plan_id: PLAN-RECOVERY-87-hosted-preflight-nonce-order
title: "PLAN-RECOVERY-87: hosted preflight nonce order"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1451
behavior_contract_id: HOSTED-PREFLIGHT-OVERRIDE-NONCE-ORDER-001
responsibility_owner: hosted-preflight
engineering_discipline_required: true
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "hosted preflightがwork guard結果と明示ackを評価し、override transactionを記録できる"
contract_postconditions: "全preflight条件がallowとなった試行だけがnonceをcommitし、deny後の同一入力訂正を許可する"
contract_invariants: "同一の成功済みnonce再利用、DB障害、reason欠落、legacy env単独overrideをfail-closeする"
contract_failures: "deny試行によるnonce消費、未commit監査を成功済みoverrideとして出力する退行を拒否する"
tdd_red_required: true
red_test: "ack欠落でdenyした後、同一session／reason／targetへackだけを追加した再試行がnonce reusedでexit 2となることを実測"
red_at: "2026-09-02T15:20:08+09:00"
green_at: "2026-09-02T15:21:34+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "commitOverrideUseをhosted preflight判定前へ戻すとHOSTED-PREFLIGHT-OVERRIDE-NONCE-ORDER-001がcorrected status 2でredになり、判定後commitへ復元すると11 tests green。"
complexity_effect: net_neutral
complexity_justification: "既存CLI action内のtransaction順序だけを変更し、新しい監査storeやnonce体系を追加しない"
removal_trigger: "なし。hosted preflightとoverride監査の恒久順序契約"
backprop_decision: not_required
backprop_decision_reason: "#1428の既存fail-close契約から検出されたoperability Recoveryであり、新要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/hosted-preflight-override-audit.md
pair_artifact: docs/test-design/helix/L8-hosted-preflight-override-audit-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-RECOVERY-82-hosted-preflight-override-audit.md
  requires:
    - docs/plans/PLAN-RECOVERY-82-hosted-preflight-override-audit.md
  references:
    - "issue:1390"
    - "issue:1451"
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-87-hosted-preflight-nonce-order.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/hosted-preflight-override-audit.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-hosted-preflight-override-audit-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/hosted-preflight.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — override監査とpreflight許可の意味順序確認" }
  - { role: qa, slot_label: "QA — deny後の訂正再試行と成功nonce再利用oracle" }
  - { role: tl, slot_label: "TL — fail-close不変条件とatomic scope管理" }
review_evidence: []
---

# hosted preflight nonce順序の復旧

denyされた試行を成功済みoverrideとしてcommitせず、全preflight条件がallowになった後だけ既存transactionへ記録する。
