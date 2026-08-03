---
plan_id: PLAN-L7-501-worker-output-admission
title: "PLAN-L7-501 (add-impl): worker output admission"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: true
entry_signals: ["po_directive:Issue #227 WCC-FR-05を連続dispatchする"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 227
engineering_discipline_required: true
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-98がtyped APIとbroker call orderを固定する"
contract_postconditions: "U-WOA-001..006、U-WIB-010..012、mutation oracleがgreenになる"
contract_invariants: "raw stdout success 0、unknown schema spawn 0、FR-06 field／DB 0"
contract_failures: "必須validation分岐除去が対応testをRedにする"
tdd_red_required: true
red_at: "2026-08-03T09:22:05Z"
green_at: "2026-08-03T09:46:01Z"
mutation_oracle_evidence: "tests/worker-output-admission.test.ts と tests/design-reality-binding.test.ts がschema／canonical／digest／broker結線mutationをRedにする"
complexity_effect: net_negative
complexity_justification: "raw stdout success surfaceをsealed output capabilityへ置換しauthority経路を減らす"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/worker-output-admission.md
pair_artifact: docs/test-design/helix/L8-worker-output-admission-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — output admission実装" }
  - { role: qa, slot_label: "QA — executable oracle＋mutation" }
  - { role: tl, slot_label: "TL — exact scope／Feature復帰監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-WOA-001, test_path: tests/worker-output-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-WOA-002, test_path: tests/worker-output-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-WOA-003, test_path: tests/worker-output-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-WOA-004, test_path: tests/worker-output-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-WOA-005, test_path: tests/worker-output-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-WOA-006, test_path: tests/worker-output-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-WIB-010, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-WIB-011, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-WIB-012, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-DRB-016, test_path: tests/design-reality-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-output-admission.md, oracle_id: U-DRB-017, test_path: tests/design-reality-binding.test.ts }
generates:
  - { artifact_path: src/runtime/worker-output-admission.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-isolation-broker.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-output-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-98-worker-output-admission.md
  blocks:
    - issue:227
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T09:46:01Z"
  review_binding:
    reviewer: "Codex independent reviewer / gpt-5.6-terra"
    reviewed_at: "2026-08-03T09:46:01Z"
    evidence_digest: "sha256:34b0ad3e0c5b23b929856b835e799fa5b5a1a3f2b87f4b72015417c5613f96c6"
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T09:46:01Z"
    tests_green_at: "2026-08-03T09:46:01Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "base 1ee1bb5b上のdeclared working diffをread-only監査。closed AST、known schema exact解決、dynamic digest、Buffer stdout、raw stdout／stderr非公開、scope→status→admission、FR-06非混載を確認。Design Reality Binding checked=12、Critical/High/Medium 0、status transition可。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/worker-output-admission.test.ts tests/worker-isolation-broker.test.ts tests/design-reality-binding.test.ts tests/digest.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T09:46:01Z", evidence_path: tests/worker-output-admission.test.ts, output_digest: "sha256:5f13ecfe246db39a8606b087d9d035ceda10d7d97b14d55c914da5ffa900cf59", result: "4 files / 41 passed / 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false --incremental false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-03T09:46:01Z", evidence_path: src/runtime/worker-output-admission.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0; stdout empty" }
---

# PLAN-L7-501: worker output admission実装

Redでmodule不在を確認し、Greenでstrict outputを唯一のbroker成功経路へする。Issue #227はFR-06後にcloseする。
