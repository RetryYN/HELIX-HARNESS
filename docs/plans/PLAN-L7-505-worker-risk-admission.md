---
plan_id: PLAN-L7-505-worker-risk-admission
title: "PLAN-L7-505 (add-impl): worker risk admission"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
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
contract_postconditions: "U-WRA-001..004、U-DRB-022、HAT-WCC-08がgreen"
contract_invariants: "critical非相殺、用途別admit/retire、sealed receipt、根拠なしeffort固定0"
contract_failures: "4 failure/7 reasonの正負oracleがcurrent HEADで成立"
tdd_red_required: true
red_at: "2026-08-03T18:23:00Z"
green_at: "2026-08-03T18:25:36Z"
mutation_oracle_evidence: "U-DRB-022がcritical pre-filter、receipt seal、effort justification分岐を実source置換し、対応するU-WRA oracleをRedにする"
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
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-WRA-001, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-WRA-002, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-WRA-003, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-WRA-004, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md, oracle_id: U-DRB-022, test_path: tests/design-reality-binding.test.ts }
generates:
  - { artifact_path: src/runtime/worker-risk-admission.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-blind-benchmark.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-102-worker-risk-admission.md
  blocks:
    - issue:225
---

# PLAN-L7-505: worker risk admission実装

critical findingを平均へ入れる旧経路を持たず、用途別admit/retire receiptを実装する。
