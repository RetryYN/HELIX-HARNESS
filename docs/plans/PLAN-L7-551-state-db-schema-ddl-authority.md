---
plan_id: PLAN-L7-551-state-db-schema-ddl-authority
title: "PLAN-L7-551 (add-impl): state DB schema DDL golden authority"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
entry_signals: ["issue:644 PLAN-L7-448 #21を原子的に実装する"]
created: 2026-08-13
updated: 2026-08-13
owner: Codex / TL
github_issue_id: 644
engineering_discipline_required: true
behavior_contract_id: STATE-DB-SCHEMA-DDL-AUTHORITY-001
responsibility_owner: state-db-schema-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "L5-100/L6-106とL8 test designが同じgolden authorityとfailureを定義する"
contract_postconditions: "自己比較をpinned digestとfresh migration sqlite_schema round-tripへ置換し、mutationをkillする"
contract_invariants: "schema/migration機能を変更せず、#6 parserと#19 fixture lifecycleを混載しない"
contract_failures: "goldenの実装追従だけでgreen化すること、missing/extra objectを無視することを拒否する"
tdd_red_required: true
red_at: "2026-08-13T07:13:11Z"
green_at: "2026-08-13T07:17:24Z"
mutation_oracle_evidence: "tests/state-db-schema-authority.test.ts の U-SDDA-001..005 がDDL追加・schema object missing/extra/changedをkillする。production module欠落のRed（1 suite failed）から、targeted tests/state-db-schema-authority.test.ts + tests/state-db.test.ts 18/18 greenへ遷移し、tests/state-db.test.tsの同一関数自己比較を退役した。"
complexity_effect: net_negative
complexity_justification: "空洞化した自己比較を独立authorityへ置換する"
parent_design: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md
pair_artifact: docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md
backprop_decision: not_required
backprop_decision_reason: "既存test infrastructure debtの実装でschema意味は不変"
agent_slots:
  - { role: se, slot_label: "SE — authority module implementation" }
  - { role: qa, slot_label: "QA — mutation and SQLite round-trip" }
  - { role: tl, slot_label: "TL — atomic scope/review convergence" }
generates:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/state-db-schema-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-106-state-db-schema-ddl-authority.md
  requires: [docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md]
  blocks: [issue:644]
---

# state DB schema DDL golden authority実装

Redでは現行自己比較がschemaDdlの同一mutationを検出できないことを固定し、GreenでDDL bytesと実SQLite object集合を独立照合する。
