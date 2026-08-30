---
plan_id: PLAN-L7-716-l12-reviewed-safe-inventory-lifecycle
title: "PLAN-L7-716: L12 reviewed-safe inventory lifecycleを対称化する"
kind: refactor
layer: L7
drive: agent
status: draft
backfill_state: pending_reverse
completion_claim_allowed: false
created: 2026-08-31
updated: 2026-08-31
review_evidence: []
owner: Codex / TL
github_issue_id: 1276
behavior_contract_id: L12-REVIEWED-SAFE-INVENTORY-LIFECYCLE-001
responsibility_owner: l12-hybrid-recognition
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: value_object
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "reviewed-safe registryと既存inventoryのprojection非対称を直すRETROFITであり、L1-L12 authorityやrecognition意味を変更しない。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #1276 L6/L8/PLAN reviewed-safe inventory lifecycleの非対称を是正"
contract_preconditions: "Document Semantic DiffのL6/L8/PLANがreviewed-safe registryへ登録済みである"
contract_postconditions: "同一familyのreviewed-safe memberがauthority-review一覧から対称にretireされ、件数driftをdoctorが拒否する"
contract_invariants: "L1-L12 authority、reviewed-safe disposition、historical/compatibility inventoryの意味を変更しない"
contract_failures: "family member欠落、reviewed-safe残留、section件数drift、doctor未接続をfail-closeする"
tdd_red_required: true
red_at: "2026-08-31T04:55:19+09:00"
green_at: "2026-08-31T04:58:12+09:00"
tdd_red_evidence: "U-L12INV-001がPLAN-L7-712のreviewed_safe_member_still_authority_reviewを検出し1 failed / 1 passed"
tdd_green_evidence: "PLANを§7からretireし表示件数を65→64へ収束し、doctor全体okをnamed check stateへ束縛後、U-L12INV-001/002/003の3 tests green、typecheck green"
mutation_oracle_required: true
mutation_oracle_evidence: "U-L12INV-002でPLAN再挿入、section件数drift、L8 reviewed-safe欠落をtyped findingでkillし、U-L12INV-003でfalse check stateの集約挙動とdoctor check state・全体ok・message配線の欠落をkillする。隣接行・空白へは依存しない"
complexity_effect: net_negative
complexity_justification: "手作業の3面同期を1つのfamily契約とdoctor gateへ集約する"
removal_trigger: "inventoryがreviewed-safe registryから完全生成され、同じ不変条件をgeneratorが強制した時"
parent_design: docs/design/helix/L6-function-design/l12-reviewed-safe-inventory-lifecycle.md
pair_artifact: docs/test-design/helix/L8-l12-reviewed-safe-inventory-lifecycle-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-712-document-semantic-diff-node-authority.md
  requires:
    - docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md
  references:
    - issue:1276
    - issue:206
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/l12-reviewed-safe-inventory-lifecycle.md, oracle_id: U-L12INV-001, test_path: tests/l12-hybrid-inventory-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l12-reviewed-safe-inventory-lifecycle.md, oracle_id: U-L12INV-002, test_path: tests/l12-hybrid-inventory-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l12-reviewed-safe-inventory-lifecycle.md, oracle_id: U-L12INV-003, test_path: tests/l12-hybrid-inventory-lifecycle.test.ts }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/l12-reviewed-safe-inventory-lifecycle.md, artifact_type: design_doc }
  - { artifact_path: docs/plans/PLAN-L7-716-l12-reviewed-safe-inventory-lifecycle.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-l12-reviewed-safe-inventory-lifecycle-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/l12-hybrid-inventory-lifecycle.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-hybrid-inventory-lifecycle.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
agent_slots:
  - { role: se, slot_label: "SE — reviewed-safe family lifecycle設計" }
  - { role: qa, slot_label: "QA — 片側更新と件数drift mutation" }
---

# L12 reviewed-safe inventory lifecycle対称化

Issue #1276だけを対象に、reviewed-safe registryとauthority-review inventoryの非対称を修正する。
一般inventory全体を一律retireせず、明示したartifact familyから段階的に適用する。
PR scope manifestは本PLANの`generates`／`modifies` exact setと一致させ、別familyへ拡張しない。
