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
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
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
mutation_oracle_evidence: "tests/windows-lite-canary-admission.test.tsで2026-08-28T16:36:40+09:00にheartbeat_interval_ms>=lease_ttl_ms拒否分岐をfalseへ変異し、U-WLCA-001が1 failed／3 passed（exit 1）としてequal TTLの誤受理をkillした。2026-08-28T18:56:19+09:00にcanonical UTC round-trip検証をDate.parse成功だけへ弱め、U-WLCA-009が存在しない2026-02-30を受理して1 failed／3 passed（exit 1）となることを確認した。両分岐を復元し、共有validateWorkGraphLeaseの静的negative oracleを含むWindows／WorkGraph suiteをgreenへ戻した。"
review_evidence:
  - reviewer: "Codex intra-runtime / Anscombe"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-28T10:05:52Z"
    tests_green_at: "2026-08-28T10:05:52Z"
    verdict: approve
    worker_model: codex:gpt-5.4-codex
    reviewer_model: codex:gpt-5.4-codex
    reviewer_session_id: 01a047c7-3780-7893-9958-131b1c9d5859
    reviewed_head_sha: 8e7a8f2c986cc1d19630e0f74180fc7289fd8a43
    scope: "PR #1139候補HEAD 8e7a8f2c986cc1d19630e0f74180fc7289fd8a43をread-only再検収し、fake self-CASを共有validateWorkGraphLeaseへ置換したこと、canonical UTC round-trip、全required key、known digest byte、immutability／authority oracleを確認した。初回REJECTの2 blockerとmedium所見は全て解消し、対象変更blocker 0 approve。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/windows-lite-canary-admission.test.ts tests/work-graph-receipt-acceptance.test.ts tests/digest.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-28T10:05:52Z"
        evidence_path: tests/windows-lite-canary-admission.test.ts
        output_digest: "sha256:06aa8a5cddf5edd3d409305e0527ff371df5b05cc956ffa9da73ad2a5d7007b6"
        result: "3 suites / 59 tests passed"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-28T10:05:52Z"
  review_binding:
    reviewer: "Codex intra-runtime / Anscombe"
    reviewed_at: "2026-08-28T10:05:52Z"
    evidence_digest: "sha256:eb7e4571396c6d34ba0d9574a70f3e90184e62324cb8460791cb4c2e52d28366"
  entries: []
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
    - docs/plans/PLAN-REVERSE-696-windows-canary-policy-lease.md
agent_slots:
  - { role: se, slot_label: "SE — exact schema／canonical digest／WorkGraph fence reuse" }
  - { role: qa, slot_label: "QA — missing／unknown／boundary／immutability mutation" }
  - { role: tl, slot_label: "TL — WLCA authorityと後続slice境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-696-windows-canary-policy-lease.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/windows-lite-canary-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/windows-lite-canary-admission.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/slot-scheduler-quota-handover.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/slot-scheduler-quota-handover.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/work-graph-receipt-acceptance.ts, artifact_type: source_module }
  - { artifact_path: tests/work-graph-receipt-acceptance.test.ts, artifact_type: test_code }
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
実装後のrequirements／L6／L8再接着とmain read-afterは
`PLAN-REVERSE-696-windows-canary-policy-lease`でfullbackする。
