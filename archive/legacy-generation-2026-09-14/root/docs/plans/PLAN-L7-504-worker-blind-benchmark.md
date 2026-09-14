---
plan_id: PLAN-L7-504-worker-blind-benchmark
title: "PLAN-L7-504 (add-impl): worker blind benchmark"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: true
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
complexity_justification: "同一ownerのdefinition seal／評価runtime二件と既存output schema追加だけで、循環依存・DB/workflow/service 0"
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
  - { artifact_path: src/runtime/worker-blind-definition.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-blind-benchmark.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-output-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-blind-benchmark.test.ts, artifact_type: test_code }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-101-worker-blind-benchmark.md
  blocks:
    - issue:225
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T17:58:28Z"
  review_binding: { reviewer: "Codex independent reviewer / gpt-5.6-terra", reviewed_at: "2026-08-03T17:58:28Z", evidence_digest: "sha256:3d0f6ee441111f999e8e923b1e3f4b0e3995213c0f72dd5e5174f31523f2ee91" }
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T17:58:28Z"
    tests_green_at: "2026-08-03T17:58:28Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "definition→candidate launch、packet→judge launchのopaque capability因果束縛、broker host observation、blind provenance、copy/unbound/cross-task/cross-risk/different-packet/mutation oracleを監査。Critical/High/Medium 0。"
    green_commands:
      - { kind: smoke, command: "git diff --check HEAD^ HEAD", runner: bash, scope: changed-files, exit_code: 0, completed_at: "2026-08-03T17:58:28Z", evidence_path: src/runtime/worker-blind-benchmark.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "出力0 byte。whitespace errorなし。" }
      - { kind: unit_test, command: "npx --no-install vitest run tests/worker-blind-benchmark.test.ts tests/worker-isolation-broker.test.ts tests/worker-review-receipt.test.ts tests/design-reality-binding.test.ts -t 'U-WBB-00[1-5]|U-DRB-021|U-WRR-00[1-8]' --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T17:58:28Z", evidence_path: tests/worker-isolation-broker.test.ts, output_digest: "sha256:8d0e5228ddb6607c46a7d5dd9120c57449b3c72d3199e5583e3e29b4ab1cd0fd", result: "4 files / 13 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: gate, exit_code: 0, completed_at: "2026-08-03T17:58:28Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "TypeScript error 0。" }
---

# PLAN-L7-504: worker blind benchmark実装

module不在のRedから開始し、fixed blind comparisonを実装する。Issue #225はFR-08が残るためcloseしない。
