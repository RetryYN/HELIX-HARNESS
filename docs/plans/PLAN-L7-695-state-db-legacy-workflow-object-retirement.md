---
plan_id: PLAN-L7-695-state-db-legacy-workflow-object-retirement
title: "PLAN-L7-695: 既存state DBからlegacy workflow objectを除去する"
kind: retrofit
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
  - "po_directive:Issue #1129 existing harness.db legacy workflow object retirement"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1129
behavior_contract_id: STATE-DB-LEGACY-WORKFLOW-OBJECT-RETIREMENT-001
responsibility_owner: state-db-schema-migration
engineering_discipline_required: true
change_slice: atomic
refactor_step: remove_legacy
legacy_retirement_state: consumer_zero
backprop_decision: not_required
backprop_decision_reason: "requirements v1.3.13 §4.2がlegacy identityのcurrent DB再出力禁止を所有する。本sliceは既存DB migrationとdoctorを同authorityへ追従する。"
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L7-693のfresh typed schemaとrevision 46以前の既存DBが読める"
contract_postconditions: "fresh／upgraded／rebuilt DBのschema object exact setが一致し、旧workflow objectが0となる"
contract_invariants: "authoritative event／episode／PLAN／receiptを削除せず、外側transaction内でもatomicに移行する"
contract_failures: "DROP依存、DB read不能、extra object、half migrationをfail-closeする"
tdd_red_required: true
red_test: "U-SDLW-001..006を先行追加し、旧object残存とdoctor未接続をRedで確認する"
red_at: "2026-08-28T10:59:00+09:00"
green_at: "2026-08-28T11:10:38+09:00"
mutation_oracle_evidence: "2026-08-28T10:59:00+09:00にU-SDLW-001..006を先行追加し、doctor schema authority module不在でsuite loadがRedとなることを確認した。実装後はexisting upgrade、authoritative row保持、rollback、idempotency、live extra object、full doctor wiringを個別oracleとして再実行する。"
complexity_effect: justified_positive
complexity_justification: "legacy schema objectを除去し、single migration＋doctor authorityへ集約する"
removal_trigger: "legacy revision upgrade対象がretention期限を満了し、migration compatibility codeを削除できる時"
parent_design: docs/design/helix/L6-function-design/state-db-legacy-workflow-object-retirement.md
pair_artifact: docs/test-design/helix/L8-state-db-legacy-workflow-object-retirement.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/state-db-legacy-workflow-object-retirement.md, oracle_id: U-SDLW-001, test_path: tests/state-db-legacy-workflow-object-retirement.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/state-db-legacy-workflow-object-retirement.md, oracle_id: U-SDLW-002, test_path: tests/state-db-legacy-workflow-object-retirement.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/state-db-legacy-workflow-object-retirement.md, oracle_id: U-SDLW-003, test_path: tests/state-db-legacy-workflow-object-retirement.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/state-db-legacy-workflow-object-retirement.md, oracle_id: U-SDLW-004, test_path: tests/state-db-legacy-workflow-object-retirement.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/state-db-legacy-workflow-object-retirement.md, oracle_id: U-SDLW-005, test_path: tests/state-db-legacy-workflow-object-retirement.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/state-db-legacy-workflow-object-retirement.md, oracle_id: U-SDLW-006, test_path: tests/state-db-legacy-workflow-object-retirement.test.ts }
dependencies:
  parent: PLAN-L7-693-current-location-db-typed-workflow-identity
  requires:
    - docs/plans/PLAN-L7-693-current-location-db-typed-workflow-identity.md
  blocks: []
  references:
    - "issue:1129"
    - "issue:1123"
    - "issue:206"
    - "issue:204"
agent_slots:
  - { role: se, slot_label: "DBA — versioned schema retirement／transaction" }
  - { role: qa, slot_label: "QA — legacy object resurrection／rollback mutation" }
  - { role: tl, slot_label: "TL — requirements §4.2 current DB authority" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-695-state-db-legacy-workflow-object-retirement.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/state-db-legacy-workflow-object-retirement.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-state-db-legacy-workflow-object-retirement.md, artifact_type: test_design }
  - { artifact_path: src/doctor/state-db-schema-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/state-db-legacy-workflow-object-retirement.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db-schema-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db.test.ts, artifact_type: test_code }
---

# 既存state DB legacy workflow object除去

#1127で確立したfresh typed schemaを既存DB migrationとlive doctorへ接続する。
