---
plan_id: PLAN-L7-499-worker-isolation-broker
title: "PLAN-L7-499 (add-impl): worker isolation broker"
kind: recovery
layer: L7
drive: agent
status: draft
route_mode: recovery
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Issue #226 WCC-FR-03をTDD実装する"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 226
engineering_discipline_required: true
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-96がprepare/run、failure、resource boundを固定する"
contract_postconditions: "WCC-FR-03の9 executable oracleがcurrent Linux backendでgreenになる"
contract_invariants: "WCC-FR-04以降混載0、main/state/DB/credential bind 0、新DB/workflow 0"
contract_failures: "U-WIB-001..009が境界緩和、copy、stale、prose-only mutationをRedにする"
tdd_red_required: true
red_at: "2026-08-03T13:27:58+09:00"
green_at: "2026-08-03T13:29:30+09:00"
mutation_oracle_evidence: "U-WIB-001..009でrepo内scratch、symlink/state/DB、platform/backend、wrapper copy、broker copy、admission stale、隔離flag除去をkilled"
complexity_effect: net_negative
complexity_justification: "broker 1 moduleとadapter identity helper 1関数でgit worktree/history/provider別実装を不要にする"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md
pair_artifact: docs/test-design/helix/L8-worker-isolation-broker-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — isolated broker実装" }
  - { role: qa, slot_label: "QA — 9 executable oracle" }
  - { role: tl, slot_label: "TL — exact scope／Feature復帰監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-001, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-002, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-003, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-004, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-005, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-006, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-007, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-008, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-009, test_path: tests/worker-isolation-broker.test.ts }
generates:
  - { artifact_path: src/runtime/worker-isolation-broker.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-96-worker-isolation-broker.md
  blocks:
    - issue:226
---

# PLAN-L7-499: worker isolation broker実装

Redでmodule不在を確認し、Greenで実bubblewrap processを含む9 oracleを成立させた。merge後は同IssueのWCC-FR-04へ連続dispatchする。
