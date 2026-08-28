---
plan_id: PLAN-L7-694-visualization-typed-workflow-identity
title: "PLAN-L7-694: visualizationをtyped workflow identityへ移行する"
kind: impl
layer: L7
drive: fullstack
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #1124 visualization typed identity migration"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1124
behavior_contract_id: VISUALIZATION-TYPED-WORKFLOW-IDENTITY-001
responsibility_owner: workflow-output-visualization-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "requirements v1.3.13 §4.2がtyped identityとcurrent outputへのlegacy再出力禁止を所有する。本sliceは既存要件をvisualization consumerへ具体化する。"
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L7-693のtyped current-location tupleとclassification catalogが同一HEADで一致する"
contract_postconditions: "view model、generic tree、VS Code treeがtyped tupleだけをcurrent workflow identityとして返す"
contract_invariants: "provider model、specialist drive、skill applicabilityをworkflow identityへ混同しない"
contract_failures: "old field、partial tuple、unknown axis／ID、stale digest、receipt不一致、view/tree driftをfail-closeする"
tdd_red_required: true
red_test: "U-VTWI-001..005を先行追加し、typed tuple欠落とlegacy output残存を実測する"
red_at: "2026-08-28T09:03:56+09:00"
green_at: "2026-08-28T10:38:25+09:00"
mutation_oracle_evidence: "2026-08-28T09:03:56+09:00に#1123 stacked HEADでU-VTWI-001..005を実行し、typed contract欠落、legacy output残存、fail-close marker欠落、tree typed tuple欠落の4 failedと、legacy復活mutation検出1 passedを確認した。実装後はidentity／receipt同時unknown、同時stale、partial tuple、receipt単独driftを個別mutationとし、visualization focused 3 suite 26 testsで全てgreenを確認した。"
complexity_effect: net_negative
complexity_justification: "複数のlegacy model fieldとcandidate projectionを単一typed tupleへ集約する"
removal_trigger: "visualization compatibility consumerが0となりlegacy adapter retention期限が満了した時"
parent_design: docs/design/helix/L6-function-design/visualization-typed-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-visualization-typed-workflow-identity.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/visualization-typed-workflow-identity.md, oracle_id: U-VTWI-001, test_path: tests/visualization-typed-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/visualization-typed-workflow-identity.md, oracle_id: U-VTWI-002, test_path: tests/visualization-typed-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/visualization-typed-workflow-identity.md, oracle_id: U-VTWI-003, test_path: tests/visualization-typed-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/visualization-typed-workflow-identity.md, oracle_id: U-VTWI-004, test_path: tests/visualization-typed-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/visualization-typed-workflow-identity.md, oracle_id: U-VTWI-005, test_path: tests/visualization-typed-workflow-identity.test.ts }
dependencies:
  parent: PLAN-L7-693-current-location-db-typed-workflow-identity
  requires:
    - docs/plans/PLAN-L7-692-workflow-output-consumer-inventory.md
    - docs/plans/PLAN-L7-693-current-location-db-typed-workflow-identity.md
  blocks: []
  references:
    - "issue:1124"
    - "issue:1123"
    - "issue:206"
    - "issue:204"
agent_slots:
  - { role: se, slot_label: "SE — view／tree typed tuple projection" }
  - { role: qa, slot_label: "QA — legacy resurrection／stale tuple mutation" }
  - { role: tl, slot_label: "TL — requirements §4.2 identity境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-694-visualization-typed-workflow-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/visualization-typed-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-visualization-typed-workflow-identity.md, artifact_type: test_design }
  - { artifact_path: tests/visualization-typed-workflow-identity.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: config/workflow-output-consumer-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/schema/visualization-current-location-contract.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/visualization-read-model.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/visualization-view-model.ts, artifact_type: source_module }
  - { artifact_path: src/vmodel/visualization-tree-projector.ts, artifact_type: source_module }
  - { artifact_path: tests/design-coverage.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/visualization-treeview.test.ts, artifact_type: test_code }
  - { artifact_path: tests/visualization-view-model.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-output-consumer-inventory.test.ts, artifact_type: test_code }
---

# visualization typed workflow identity移行

#1123のtyped DB projectionをread modelからVS Code treeまで一方向に貫通させる。
旧fieldを別名で温存せず、current visualization contractをrequirements正本へ収束する。
