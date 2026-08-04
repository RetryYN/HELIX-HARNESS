---
plan_id: PLAN-L7-506-worker-lifecycle-receipt
title: "PLAN-L7-506 (add-impl): worker lifecycle receipt"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: true
entry_signals: ["po_directive:Issue #227 durable lifecycle残差を閉じる"]
created: 2026-08-04
updated: 2026-08-04
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
contract_preconditions: "PLAN-L6-103がtyped APIと検証順序を固定する"
contract_postconditions: "U-WLIFE-001..003と既存broker/review回帰がgreenになる"
contract_invariants: "seven-state chain、sealed境界、HEAD/parent、terminal整合"
contract_failures: "run seal、proposal join、terminal分岐除去が対応oracleをRedにする"
tdd_red_required: true
red_at: "2026-08-04T00:13:27Z"
green_at: "2026-08-04T00:14:53Z"
mutation_oracle_evidence: "tests/design-reality-binding.test.ts::U-DRB-023がrun/review seal、proposal join、terminal分岐、previous digest、serialized receipt再計算を個別除去するとRedにする"
complexity_effect: net_positive
complexity_justification: "約一moduleのcodeを追加するが、散在する実行証拠を単一receiptへ集約しclosure判断を簡素化する"
removal_trigger: "#214 scheduler projectorへ同一oracle付きで統合し本moduleを削除できる時"
parent_design: docs/design/helix/L6-function-design/worker-lifecycle-receipt.md
pair_artifact: docs/test-design/helix/L8-worker-lifecycle-receipt-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — lifecycle実装" }
  - { role: qa, slot_label: "QA — executable oracle" }
  - { role: tl, slot_label: "TL — Feature #92復帰監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-lifecycle-receipt.md, oracle_id: U-WLIFE-001, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-lifecycle-receipt.md, oracle_id: U-WLIFE-002, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-lifecycle-receipt.md, oracle_id: U-WLIFE-003, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-lifecycle-receipt.md, oracle_id: U-DRB-023, test_path: tests/design-reality-binding.test.ts }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-independent-review.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-independent-review.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/worker-isolation-broker.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-lifecycle-receipt.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L6-103-worker-lifecycle-receipt.md
  blocks:
    - issue:227
---

# PLAN-L7-506: worker lifecycle receipt実装

Redでlifecycle API不在を確認し、Greenでbroker実行からterminal receiptまでの唯一経路を作る。
