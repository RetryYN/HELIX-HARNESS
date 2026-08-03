---
plan_id: PLAN-L7-500-worker-isolation-policy
title: "PLAN-L7-500 (add-impl): worker isolation policy"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: true
entry_signals: ["po_directive:Issue #226 WCC-FR-04を連続dispatchする"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 226
engineering_discipline_required: true
behavior_contract_id: WCC-FR-04
responsibility_owner: worker-isolation-policy
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-97がtyped policy APIとfailureを固定する"
contract_postconditions: "U-WIP-001..008、U-WIB-010、U-DRB-015がgreenになる"
contract_invariants: "secret／unknown spawn 0、network deny、scope外result 0、FR-05/06混載0"
contract_failures: "policy／egress／scope mutationが対応oracleをRedにする"
tdd_red_required: true
red_at: "2026-08-03T07:07:34Z"
green_at: "2026-08-03T07:14:47Z"
mutation_oracle_evidence: "tests/design-reality-binding.test.ts のU-DRB-014/015がpolicy identity、secret、egress、scope、entry/depth bound、--unshare-net分岐を除去した17 mutationをRedにしてkillする"
complexity_effect: net_negative
complexity_justification: "provider別sandboxを増やさずpolicy module 1件をFR-03 brokerへ統合する"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md
pair_artifact: docs/test-design/helix/L8-worker-isolation-policy-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — policy実装" }
  - { role: qa, slot_label: "QA — 10 executable oracle＋mutation" }
  - { role: tl, slot_label: "TL — exact scope／Feature復帰監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md, oracle_id: U-WIP-001, test_path: tests/worker-isolation-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md, oracle_id: U-WIP-002, test_path: tests/worker-isolation-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md, oracle_id: U-WIP-003, test_path: tests/worker-isolation-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md, oracle_id: U-WIP-004, test_path: tests/worker-isolation-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md, oracle_id: U-WIP-005, test_path: tests/worker-isolation-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md, oracle_id: U-WIP-006, test_path: tests/worker-isolation-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md, oracle_id: U-WIP-007, test_path: tests/worker-isolation-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md, oracle_id: U-WIP-008, test_path: tests/worker-isolation-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md, oracle_id: U-WIB-010, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-policy.md, oracle_id: U-DRB-015, test_path: tests/design-reality-binding.test.ts }
generates:
  - { artifact_path: src/runtime/worker-isolation-policy.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-isolation-broker.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-isolation-policy.test.ts, artifact_type: test_code }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-97-worker-isolation-policy.md
  blocks:
    - issue:226
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T07:39:41Z"
  review_binding:
    reviewer: "Codex independent reviewer / gpt-5.6-terra"
    reviewed_at: "2026-08-03T07:39:41Z"
    evidence_digest: "sha256:c82fb6f266e96b5bd428133de8174b832b719592091ef637fd20ff8b8923d840"
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T07:39:41Z"
    tests_green_at: "2026-08-03T07:39:41Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "exact HEAD 3b5fb15bをclean read-only監査。secret/unknown/actual token spawn前deny、sealed wrapper origin、nonempty egress deny、--unshare-net、bounded streaming post-state scan、generic scope failure、FR-05/06非混載を確認。Critical/High/Medium 0、status transition可。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-isolation-policy.test.ts tests/worker-isolation-broker.test.ts tests/design-reality-binding.test.ts tests/digest.test.ts tests/worker-wrapper-admission.test.ts tests/worker-descriptor-admission.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T07:39:41Z", evidence_path: tests/worker-isolation-policy.test.ts, output_digest: "sha256:d3645e333ad0532475117a1cdd0d6fe2600de8d18603e0d7ddee36e202ef3064", result: "6 files / 59 passed / 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false --incremental false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-03T07:39:41Z", evidence_path: src/runtime/worker-isolation-policy.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0; stdout empty" }
---

# PLAN-L7-500: worker isolation policy実装

Redでpolicy module不在を確認し、Greenでsecret/network/scopeの実行境界を成立させる。
