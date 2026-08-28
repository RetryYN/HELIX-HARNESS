---
plan_id: PLAN-L7-696-windows-canary-policy-lease
title: "PLAN-L7-696 (impl): Windows canary policy／lease bindingをtyped化する"
kind: add-impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:Issue #1134 Windows Lite canary policy／lease receipt schema"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1134
behavior_contract_id: WINDOWS-LITE-CANARY-POLICY-LEASE-001
responsibility_owner: windows-lite-canary-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L3-70とWindows canary L3/L6/L8 authorityがconfirmedで、WorkGraphLeaseV1がfence CAS authorityである"
contract_postconditions: "versioned policyとlease bindingがexact schema、canonical digest、deep freezeで検証される"
contract_invariants: "第二queue／第二lease authorityを作らず、candidate HEAD／Linux artifact／run attemptを推測しない"
contract_failures: "missing／unknown key、invalid bound、heartbeat>=TTL、wrong SHA／digest／attempt／fence、time inversionをfail-closeする"
tdd_red_required: true
red_test: "U-WLCA-001／005／009／014を先行追加し、typed validator不在でRedを確認する"
red_at: "2026-08-28T16:32:33+09:00"
green_at: "2026-08-28T16:36:54+09:00"
mutation_oracle_evidence: "2026-08-28T16:36:40+09:00にheartbeat_interval_ms>=lease_ttl_ms拒否分岐をfalseへ変異し、U-WLCA-001が1 failed／3 passed（exit 1）としてequal TTLの誤受理をkillした。分岐復元後、Windows policy／leaseと既存WorkGraph leaseの2 suite 49 tests greenを再確認した。"
complexity_effect: justified_positive
complexity_justification: "Windows lane固有bindingを単一value objectへ閉じ、後続queue／Actions adapterの重複validationを防ぐ"
removal_trigger: "Windows heavy laneが汎用host-global admission contractへ型互換のまま統合された時"
parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md
pair_artifact: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-001, test_path: tests/windows-lite-canary-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-005, test_path: tests/windows-lite-canary-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-009, test_path: tests/windows-lite-canary-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-014, test_path: tests/windows-lite-canary-admission.test.ts }
dependencies:
  parent: PLAN-L3-70-windows-lite-canary-admission
  requires:
    - docs/plans/PLAN-L3-70-windows-lite-canary-admission.md
  blocks: []
  references:
    - "issue:1134"
    - "issue:1106"
agent_slots:
  - { role: se, slot_label: "SE — exact schema／canonical digest／WorkGraph fence reuse" }
  - { role: qa, slot_label: "QA — missing／unknown／boundary／immutability mutation" }
  - { role: tl, slot_label: "TL — WLCA authorityと後続slice境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-696-windows-canary-policy-lease.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/windows-lite-canary-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/windows-lite-canary-admission.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/work-graph-receipt-acceptance.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
---

# Windows canary policy／lease binding typed化

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | U-WLCA-001／005／009／014をRed固定 | validator不在または境界欠落を反証する |
| 2 | WorkGraph lease validatorを共有可能化 | fence CAS意味を複製しない |
| 3 | policy／binding exact validatorを実装 | canonical digestとdeep freezeが成立する |
| 4 | mutation／全gate／独立review | current HEAD blocker 0、main read-afterまで成立する |

queue、expiry evaluator、Actions adapter、measurement projectionは#1135以降へ分離する。
