---
plan_id: PLAN-L7-506-worker-lifecycle-receipt
title: "PLAN-L7-506 (add-impl): worker lifecycle receipt"
kind: add-impl
layer: L7
drive: agent
status: confirmed
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
complexity_effect: justified_positive
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
  - { parent_design: docs/design/helix/L6-function-design/worker-lifecycle-receipt.md, oracle_id: U-WLIFE-004, test_path: tests/l12-hybrid-recognition.test.ts }
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
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L6-103-worker-lifecycle-receipt.md
  blocks:
    - issue:227
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-04T03:20:11Z"
  review_binding: { reviewer: "Claude Code / independent AI-B", reviewed_at: "2026-08-04T03:20:11Z", evidence_digest: "sha256:9931c8555e0dc337fa0516ca7026a27b835ac46047556c566afb16d9e6e55343" }
  entries: []
review_evidence:
  - reviewer: "Claude Code / independent AI-B"
    review_kind: cross_agent
    reviewed_at: "2026-08-04T03:20:11Z"
    tests_green_at: "2026-08-04T03:11:12Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: claude-opus-5
    scope: "PLAN sliceの設計・実装はapprove、PR全体はgovernance blockerによりblock。PR #387 exact HEAD df5b192aで実装本体に技術的blockerなしと確認。review: https://github.com/RetryYN/HELIX-HARNESS/pull/387#issuecomment-5174221071"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/worker-isolation-broker.test.ts tests/design-reality-binding.test.ts tests/l12-hybrid-recognition.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-04T03:11:12Z", evidence_path: tests/worker-isolation-broker.test.ts, output_digest: "sha256:288f931e1645f3e420d9628b7ef1ae01161b92279b8f759cf9686132bda909fe", result: "3 files / 66 passed / 1 skipped" }
---

# PLAN-L7-506: worker lifecycle receipt実装

Redでlifecycle API不在を確認し、Greenでbroker実行からterminal receiptまでの唯一経路を作る。
