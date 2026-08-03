---
plan_id: PLAN-L7-498-worker-wrapper-admission
title: "PLAN-L7-498 (add-impl): worker wrapper admission"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Feature #92 Issue #225 WCC-FR-02をTDD実装する"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L6-95が4 failureと全実行sinkを固定する"
contract_postconditions: "raw／copy／drift planはspawn前に拒否され、正規wrapperだけcapabilityを得る"
contract_invariants: "WCC-FR-03以降混載0、production新規file 0、DB／network／workflow 0"
contract_failures: "U-WWA-001..007が4 failureとcapability forge mutationをRedにする"
tdd_red_required: true
red_at: "2026-08-03T11:03:00+09:00"
green_at: "2026-08-03T11:07:48+09:00"
mutation_oracle_evidence: "tests/worker-wrapper-admission.test.ts::U-WWA-001..007でraw/copy、provider、plan digest、direct route、invocation digest、capability copyのmutantをkilled"
complexity_effect: net_negative
complexity_justification: "既存adapterへpure admissionを統合し4 spawn経路のprovenance判定を共通化する"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md
pair_artifact: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-WWA-001, test_path: tests/worker-wrapper-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-WWA-002, test_path: tests/worker-wrapper-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-WWA-003, test_path: tests/worker-wrapper-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-WWA-004, test_path: tests/worker-wrapper-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-WWA-005, test_path: tests/worker-wrapper-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-WWA-006, test_path: tests/worker-wrapper-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-WWA-007, test_path: tests/worker-wrapper-admission.test.ts }
generates:
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/team/run.ts, artifact_type: source_module }
  - { artifact_path: src/orchestration/pair-agent.ts, artifact_type: source_module }
  - { artifact_path: src/orchestration/loop-bridge.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-wrapper-admission.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-95-worker-wrapper-admission.md
  requires:
    - docs/plans/PLAN-L6-95-worker-wrapper-admission.md
    - docs/design/helix/L5-detail/worker-wrapper-admission.md
    - docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md
  blocks:
    - issue:225
---

# PLAN-L7-498: worker wrapper admission実装

Redでadmission export未存在を確認し、Greenで7 executable oracleと既存adapter回帰81 testを成立させた。
本PR merge後はWCC-FR-03のIssue #226へ連続dispatchする。
