---
plan_id: PLAN-L7-551-state-db-schema-ddl-authority
title: "PLAN-L7-551 (add-impl): state DB schema DDL golden authority"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Issue #644 と PLAN-L7-448 #21を原子的に実装する"]
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
green_at: "2026-08-13T07:35:42Z"
mutation_oracle_evidence: "tests/state-db-schema-authority.test.ts の U-SDDA-001..005 がDDL追加・schema object missing/extra/changedをkillする。production module欠落のRed（1 suite failed）から、targeted tests/state-db-schema-authority.test.ts + tests/state-db.test.ts 20/20 greenへ遷移し、tests/state-db.test.tsの同一関数自己比較を退役した。canonical authority setも80/80 greenである。"
complexity_effect: net_negative
complexity_justification: "空洞化した自己比較を独立authorityへ置換する"
removal_trigger: "後継schema migration verifierが同じgolden authorityとmutation oracleを担い、現行test consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md
pair_artifact: docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md, oracle_id: U-SDDA-001, test_path: tests/state-db-schema-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md, oracle_id: U-SDDA-002, test_path: tests/state-db-schema-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md, oracle_id: U-SDDA-003, test_path: tests/state-db-schema-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md, oracle_id: U-SDDA-004, test_path: tests/state-db-schema-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md, oracle_id: U-SDDA-005, test_path: tests/state-db-schema-authority.test.ts }
backprop_decision: not_required
backprop_decision_reason: "既存test infrastructure debtの実装でschema意味は不変"
backfill_state: pending_reverse
agent_slots:
  - { role: se, slot_label: "SE — authority module implementation" }
  - { role: qa, slot_label: "QA — mutation and SQLite round-trip" }
  - { role: tl, slot_label: "TL — atomic scope/review convergence" }
generates:
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/state-db-schema-authority.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-106-state-db-schema-ddl-authority.md
  requires: [docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md]
  blocks: [issue:644]
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-13T09:43:45Z"
    tests_green_at: "2026-08-13T09:30:03Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    scope: "PR #645 HEAD e747d4d8ff398ed96bce2ef607d4791511931a23をclean detached worktreeで独立review。U-SDDA-001..005、pinned DDL digest、fresh migration sqlite_schema exact set、missing／extra／changed反例、schema／migration非変更を照合しblocker 0。Actions run 31685333466 terminal success、DB projection/replayとcheckpoint/replay一致、converged=true。canonical receipt: pull/645#issuecomment-5278674102、digest sha256:efa7081cef7a477dce0cf8b1e35f0126fc42a2fb2557a0b673c022427edede84。"
    green_commands:
      - { kind: unit_test, command: "gh run view 31685333466 --json databaseId,status,conclusion,headSha,event", runner: ci, scope: full, exit_code: 0, completed_at: "2026-08-13T09:30:03Z", evidence_path: tests/state-db-schema-authority.test.ts, output_digest: "sha256:efa7081cef7a477dce0cf8b1e35f0126fc42a2fb2557a0b673c022427edede84", result: "completed / success / HEAD e747d4d8ff398ed96bce2ef607d4791511931a23" }
---

# state DB schema DDL golden authority実装

Redでは現行自己比較がschemaDdlの同一mutationを検出できないことを固定し、GreenでDDL bytesと実SQLite object集合を独立照合する。
