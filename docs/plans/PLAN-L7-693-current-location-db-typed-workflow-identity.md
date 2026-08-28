---
plan_id: PLAN-L7-693-current-location-db-typed-workflow-identity
title: "PLAN-L7-693: current-location DB projectionをtyped workflow identityへ移行する"
kind: impl
layer: L7
drive: db
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #1123 current-location DB typed identity migration"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1123
behavior_contract_id: CLDB-TYPED-WORKFLOW-IDENTITY-001
responsibility_owner: current-location-db-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "requirements v1.3.13 §4.2.1〜4.2.4がtyped identity、legacy input-only、current DB再出力禁止を所有する。本sliceは既存要件をDB consumerへ具体化し、新FRを重複追加しない。"
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "current-location snapshot、requirements-owned classification catalog、既存legacy input-only adapterが同一repo HEADで読める"
contract_postconditions: "project_current_locationがregistry exact tupleだけをprimary identityとして投影し、旧model列とcandidate tableが存在しない"
contract_invariants: "provider model語彙をworkflow identityへ混同せず、compatibility greenでcanonical failureを相殺しない"
contract_failures: "registry欠落、digest drift、unknown、ambiguous、unsupportedを空値やForwardへ丸めずprojection transactionをfail-closeする"
tdd_red_required: true
red_test: "U-CLDB-001..003を先行追加し、typed列欠落、legacy table残存、実row列欠落の3 failureを確認する"
red_at: "2026-08-28T08:12:43+09:00"
green_at: "2026-08-28T08:15:22+09:00"
mutation_oracle_evidence: "2026-08-28T08:12:43+09:00に未実装baseでtests/current-location-db-workflow-identity.test.tsを実行し、typed列欠落、project_drive_model_candidates残存、実DB列欠落の3 failedを確認した。実装後、同testとstate-db／db-projection-ingestion／inventoryの4 suite 28 testsがgreenとなった。"
complexity_effect: net_negative
complexity_justification: "legacy 2列、candidate table、candidate index、candidate projection loopを削除し、既存typed identity resolverと単一tupleへ集約する"
removal_trigger: "current-location内部のlegacy drive-model producerがtyped routingへ置換され、input-only adapter retention期限が満了した時"
parent_design: docs/design/helix/L6-function-design/current-location-db-typed-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-current-location-db-typed-workflow-identity.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/current-location-db-typed-workflow-identity.md, oracle_id: U-CLDB-001, test_path: tests/current-location-db-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-db-typed-workflow-identity.md, oracle_id: U-CLDB-002, test_path: tests/current-location-db-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-db-typed-workflow-identity.md, oracle_id: U-CLDB-003, test_path: tests/current-location-db-workflow-identity.test.ts }
dependencies:
  parent: PLAN-L7-692-workflow-output-consumer-inventory
  requires:
    - docs/plans/PLAN-L7-692-workflow-output-consumer-inventory.md
  blocks: []
  references:
    - "issue:1123"
    - "issue:1119"
    - "issue:206"
    - "issue:204"
agent_slots:
  - { role: db, slot_label: "DB — current-location schema／projection／replay exact tuple" }
  - { role: qa, slot_label: "QA — legacy field resurrection mutation" }
  - { role: tl, slot_label: "TL — requirements §4.2 typed identity境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-693-current-location-db-typed-workflow-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/current-location-db-typed-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-current-location-db-typed-workflow-identity.md, artifact_type: test_design }
  - { artifact_path: tests/current-location-db-workflow-identity.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/workflow-output-consumer-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-g3-logical-db-bootstrap-policy.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/doctor/l3-g3-logical-db-receipt.ts, artifact_type: source_module }
  - { artifact_path: src/lint/db-projection-ingestion.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-design.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: tests/db-projection-ingestion.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-coverage.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db.test.ts, artifact_type: test_code }
---

# current-location DB typed workflow identity移行

Issue #1119で固定したDB legacy inventoryを実削除し、#206/#204のcurrent output収束を一段進める。
CLI／visualizationを同一PRへ混載せず、schema、projection、rebuild、checkpointだけを原子的に閉じる。
