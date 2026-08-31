---
plan_id: PLAN-L7-718-universal-improvement-sensitive-field-policy
title: "PLAN-L7-718 (refactor): sensitive observation fieldをtoken family policyへ収束する"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1244
behavior_contract_id: UIL-SENSITIVE-FIELD-POLICY-001
responsibility_owner: universal-improvement-sensitive-field-policy
engineering_discipline_required: true
change_slice: atomic
refactor_step: replace_conditionals_with_policy
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: policy
contract_preconditions: "UIL-01 source registryがmainに存在する"
contract_postconditions: "sensitive field境界をversion付きtoken familyが決定する"
contract_invariants: "raw key/valueをreceiptへ出さず、UIL routeとDB schemaを変更しない"
contract_failures: "結合key、numeric suffix、benign key誤拒否、policy version driftをfail-closeする"
tdd_red_required: true
red_test: "U-UILSFP-001で結合keyと数字接尾辞の通過を検出する"
complexity_effect: net_neutral
complexity_justification: "単一regexをversion付きfamily policyへ置換して境界追加を局所化する"
removal_trigger: "観測schemaがfield classificationを上流で署名済み供給する時"
parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md
pair_artifact: docs/test-design/helix/L8-universal-improvement-source-registry-unit-test-design.md
entry_signals:
  - "po_directive:Issue #1244 sensitive observation field boundaryをtoken-family schemaへ収束"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REFACTOR
agent_slots:
  - { role: se, slot_label: "SE — token family policy実装" }
  - { role: qa, slot_label: "QA — boundary mutationとbenign誤拒否検証" }
dependencies:
  parent: docs/design/helix/L6-function-design/universal-improvement-source-registry.md
  requires: []
  references:
    - issue:1231
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSFP-001, test_path: tests/universal-improvement-source-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSFP-002, test_path: tests/universal-improvement-source-registry.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-718-universal-improvement-sensitive-field-policy.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-universal-improvement-source-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/universal-improvement-source-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/universal-improvement-source-registry.test.ts, artifact_type: test_code }
---

# PLAN-L7-718: sensitive observation fieldポリシー

## 工程表

- [x] 既存regexとreview findingを棚卸しする。
- [x] version付きtoken family matcherへ置換する。
- [x] 結合key、numeric suffix、benign keyを回帰固定する。
- [ ] mutation、全gate、独立reviewを完了する。
