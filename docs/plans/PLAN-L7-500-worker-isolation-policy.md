---
plan_id: PLAN-L7-500-worker-isolation-policy
title: "PLAN-L7-500 (add-impl): worker isolation policy"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
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
mutation_oracle_evidence: "U-DRB-014/015がpolicy identity、secret、egress、scope、--unshare-net分岐を除去した15 mutationをRedにしてkillする"
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
---

# PLAN-L7-500: worker isolation policy実装

Redでpolicy module不在を確認し、Greenでsecret/network/scopeの実行境界を成立させる。
