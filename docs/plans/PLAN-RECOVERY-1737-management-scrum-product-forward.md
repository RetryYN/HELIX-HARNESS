---
plan_id: PLAN-RECOVERY-1737-management-scrum-product-forward
title: "管理Scrumとproduct Forwardの入口を分離する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
github_issue_id: 1737
behavior_contract_id: MANAGEMENT-SCRUM-PRODUCT-FORWARD-001
responsibility_owner: management-governance
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: policy
entry_signals: [regression_dev]
contract_preconditions: "管理見落としのIssue入口とproduct Forwardの責務境界を読める"
contract_postconditions: "管理見落としをScrumで収束しProjectへ投影した後、正規VモデルへReverseする"
contract_invariants: "Git authority、実行receipt、DB／Project projectionを混在させず、productをScrumで直接実装しない"
contract_failures: "管理Issueの証拠欠落、Project未登録、Reverse先不明、product Forward迂回をfail-closeする"
tdd_red_required: true
mutation_oracle_required: true
red_at: "2026-09-12T00:54:48Z"
green_at: "2026-09-12T00:55:00Z"
mutation_oracle_evidence: "tests/management-scrum-product-forward.test.ts::U-MSPF-003 killed the seeded required-heading rename mutant (1 failed, exit 1); restored template passed 4/4 (exit 0)"
complexity_effect: net_negative
complexity_justification: "分散していた入口規律を単一governance正本と最小テンプレへ集約する"
removal_trigger: "management operation registryが同一fieldをschema強制し全consumerが移行した時"
backprop_decision: not_required
backprop_decision_reason: "PO決定#1737を既存workflowの入口規律へ投影するRecoveryであるため"
parent_design: docs/governance/management-scrum-product-forward.md
pair_artifact: docs/governance/candidates/management-scrum-product-forward-acceptance.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
verification_bindings:
  - { parent_design: docs/governance/management-scrum-product-forward.md, oracle_id: U-MSPF-001, test_path: tests/management-scrum-product-forward.test.ts }
  - { parent_design: docs/governance/management-scrum-product-forward.md, oracle_id: U-MSPF-002, test_path: tests/management-scrum-product-forward.test.ts }
  - { parent_design: docs/governance/management-scrum-product-forward.md, oracle_id: U-MSPF-003, test_path: tests/management-scrum-product-forward.test.ts }
  - { parent_design: docs/governance/management-scrum-product-forward.md, oracle_id: U-MSPF-004, test_path: tests/management-scrum-product-forward.test.ts }
dependencies:
  parent: docs/governance/management-scrum-product-forward.md
  requires: []
  references: ["issue:1737", "issue:1500", "issue:1638", "issue:1688", "issue:1734"]
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 観測事実とprojection境界" }
  - { role: tl, slot_label: "TL — 管理Scrumとproduct Forwardの責務境界" }
  - { role: qa, slot_label: "QA — 最小Issue契約とauthority反例" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1737-management-scrum-product-forward.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/management-scrum-product-forward.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/candidates/management-scrum-product-forward-acceptance.md, artifact_type: test_design }
  - { artifact_path: .github/ISSUE_TEMPLATE/management-gap.md, artifact_type: markdown_doc }
  - { artifact_path: tests/management-scrum-product-forward.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: AGENTS.md, artifact_type: markdown_doc }
  - { artifact_path: CLAUDE.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
review_evidence: []
---

# 実装順序

1. 管理Scrumとproduct Forwardの入口境界をadapterとgovernanceへ固定する。
2. 管理見落としIssueの最小fieldをテンプレ化する。
3. Vペアoracle、独立review、CIを通してS4から正規Vモデルへ返す。
