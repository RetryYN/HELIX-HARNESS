---
plan_id: PLAN-RECOVERY-90-db-key-immutability
title: "PLAN-RECOVERY-90: DB key／immutability整合"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1436
behavior_contract_id: DB-KEY-IMMUTABILITY-INTEGRITY-001
responsibility_owner: harness-db-schema
engineering_discipline_required: true
change_slice: atomic
refactor_step: strengthen_contract
legacy_retirement_state: canonical_only
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
contract_preconditions: "HARNESS_DB_TABLESがDDL正本で、runtime receipt tableとdocument projection tableのownerが分離される"
contract_postconditions: "TEXT primary keyはNULLを拒否し、closure process dedupeはDB制約で一意、append-only runtime tableはrebuildで削除されない"
contract_invariants: "schema SSoT、transactional rebuild、runtime receipt preservation、deterministic document projectionを維持する"
contract_failures: "NULL primary key重複、dedupe key重複、immutability triggerによるrebuild abort、app-layer-only不変性の無根拠拡大を拒否する"
tdd_red_required: true
red_test: "TEXT PRIMARY KEYへNULLを2回insertでき、closure process dedupe重複が通り、trigger付き3表がtruncate対象に残ることを再現する"
red_at: "2026-09-02T20:45:00+09:00"
green_at: null
mutation_oracle_required: true
mutation_oracle_evidence: null
complexity_effect: net_reduction
complexity_justification: "DDL制約とrebuild保持集合をschema authorityへ揃え、呼出側の暗黙前提をDB境界へ集約する"
removal_trigger: "なし。state DB integrityの恒久境界"
backprop_decision: not_required
backprop_decision_reason: "Issue #1436で既存DB authorityの実装欠陥をRecoveryし、新しい要求意味は追加しない"
parent_design: docs/design/helix/L6-function-design/db-key-immutability-integrity.md
pair_artifact: docs/test-design/helix/L8-db-key-immutability-integrity-unit-test-design.md
dependencies:
  parent: null
  requires: []
  references:
    - "issue:644"
    - "issue:1391"
    - "issue:1436"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-90-db-key-immutability.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/db-key-immutability-integrity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-db-key-immutability-integrity-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: tests/state-db.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — schema／runtime owner境界監査" }
  - { role: se, slot_label: "SE — DDL制約とrebuild保持集合の整合" }
  - { role: qa, slot_label: "QA — NULL／dedupe／trigger反例" }
  - { role: tl, slot_label: "TL — #1436 Recovery収束" }
review_evidence: []
---

# DB key／immutability整合 Recovery

DB schemaが宣言するkey一意性とappend-only境界を実際のSQLite制約およびrebuild挙動へ一致させる。
