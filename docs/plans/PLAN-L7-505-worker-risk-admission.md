---
plan_id: PLAN-L7-505-worker-risk-admission
title: "PLAN-L7-505 (add-impl): worker risk admission"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: true
entry_signals: ["po_directive:Feature #92 WCC-FR-08をFR-07後に連続dispatchする"]
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-102がtyped APIを固定"
contract_postconditions: "U-WRA-001..005、U-DRB-022、HAT-WCC-08、HAT-HIL-23がgreen"
contract_invariants: "critical非相殺、用途別admit/retire、sealed receipt、根拠なしeffort固定0"
contract_failures: "4 failure/7 reasonの正負oracleがcurrent HEADで成立"
tdd_red_required: true
red_at: "2026-08-03T18:23:00Z"
green_at: "2026-08-03T18:25:36Z"
mutation_oracle_evidence: "tests/design-reality-binding.test.ts::U-DRB-022のexecuteWorkerRiskAdmissionMutationOracleがcritical pre-filter、receipt seal、effort justification分岐を実source置換し、対応するU-WRA oracleをRedにしてseeded mutationをkillする"
complexity_effect: net_negative
complexity_justification: "pure domain service一件と既存benchmark accessor一件のみ"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md
pair_artifact: docs/test-design/helix/L8-worker-risk-admission-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — risk admission実装" }
  - { role: qa, slot_label: "QA — negative/mutation oracle" }
  - { role: tl, slot_label: "TL — Feature #92終端監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-WRA-001, test_path: tests/worker-risk-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-WRA-002, test_path: tests/worker-risk-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-WRA-003, test_path: tests/worker-risk-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-WRA-004, test_path: tests/worker-risk-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-WRA-005, test_path: tests/worker-risk-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-DRB-022, test_path: tests/design-reality-binding.test.ts }
generates:
  - { artifact_path: src/runtime/worker-risk-admission.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-blind-benchmark.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-risk-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-102-worker-risk-admission.md
  blocks:
    - issue:225
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T21:15:44Z"
  review_binding: { reviewer: "Claude Code / independent AI-B", reviewed_at: "2026-08-03T21:49:24Z", evidence_digest: "sha256:11b3181324b7b7a4e15cdd14721fe5cbac4b779d79c216df289248fef9e46c8d" }
  entries: []
review_evidence:
  - reviewer: "Claude Code / independent AI-B"
    review_kind: cross_agent
    reviewed_at: "2026-08-03T21:49:24Z"
    tests_green_at: "2026-08-03T21:23:58Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: claude-opus-5
    scope: "PLAN sliceの設計・実装はapprove、PR全体はgovernance blockerによりblock。PR #380 exact HEAD 1f224c3aでWCC-FR-08の設計・実装finding全件解消を再確認。review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/380#issuecomment-5172123791"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/worker-isolation-broker.test.ts tests/design-reality-binding.test.ts --pool=forks --maxWorkers=1", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T21:23:58Z", evidence_path: tests/worker-isolation-broker.test.ts, output_digest: "sha256:645e7b0e74a329488640540767762f7bc374c7b99502418ac0820089f54869f6", result: "2 files / 46 passed / 1 skipped" }
---

# PLAN-L7-505: worker risk admission実装

critical findingを平均へ入れる旧経路を持たず、用途別admit/retire receiptを実装する。
