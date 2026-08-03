---
plan_id: PLAN-L7-504-worker-blind-benchmark
title: "PLAN-L7-504 (add-impl): worker blind benchmark"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Feature #92 WCC-FR-07をFR-09後に連続dispatchする"]
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-07
responsibility_owner: worker-blind-benchmark
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-101がtyped APIとmutation pointを固定"
contract_postconditions: "U-WBB-001..005、U-DRB-021がgreen"
contract_invariants: "definition/packet pre-execution binding、author/private context 0、sealed provenance 2件以上、smoke-only selection 0、FR-08非混載"
contract_failures: "11 failureとdefinition/context/observation/seal/provenance/judge/score mutationが対応oracleをRedにする"
tdd_red_required: true
red_at: "2026-08-03T15:28:23Z"
green_at: "2026-08-03T15:30:39Z"
mutation_oracle_evidence: "tests/design-reality-binding.test.ts::U-DRB-021がdefinition、smoke拒否、execution origin、fixture/task/risk binding、host observation、provenance uniqueness、judge packet bindingを実source置換し、対応fixtureをRedにする"
complexity_effect: net_negative
complexity_justification: "production owner一件と既存output schema追加だけで、DB/workflow/service 0"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/worker-blind-benchmark.md
pair_artifact: docs/test-design/helix/L8-worker-blind-benchmark-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — blind evaluator実装" }
  - { role: qa, slot_label: "QA — negative/mutation oracle" }
  - { role: tl, slot_label: "TL — Feature/FR-08境界監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-blind-benchmark.md, oracle_id: U-WBB-001, test_path: tests/worker-blind-benchmark.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-blind-benchmark.md, oracle_id: U-WBB-002, test_path: tests/worker-blind-benchmark.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-blind-benchmark.md, oracle_id: U-WBB-003, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-blind-benchmark.md, oracle_id: U-WBB-004, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-blind-benchmark.md, oracle_id: U-WBB-005, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-blind-benchmark.md, oracle_id: U-DRB-021, test_path: tests/design-reality-binding.test.ts }
generates:
  - { artifact_path: src/runtime/worker-blind-benchmark.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-output-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-blind-benchmark.test.ts, artifact_type: test_code }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-101-worker-blind-benchmark.md
  blocks:
    - issue:225
---

# PLAN-L7-504: worker blind benchmark実装

module不在のRedから開始し、fixed blind comparisonを実装する。Issue #225はFR-08が残るためcloseしない。
