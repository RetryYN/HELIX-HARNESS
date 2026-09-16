---
plan_id: PLAN-L5-95-worker-lifecycle-receipt
title: "PLAN-L5-95 (add-design): worker lifecycle receipt詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
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
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-69がcomponentとauthorityを固定する"
contract_postconditions: "run receipt、event chain、terminal規則が実装可能になる"
contract_invariants: "seven-state exact chain、HEAD/parent/boundary digest exact"
contract_failures: "copy、mismatch、invalid transitionをtyped failureへ束縛する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "state/hash-chain schemaを追加するが、別event storeを作らずcanonical serialized receiptへ集約する"
removal_trigger: "#214 schedulerのcanonical event schemaへ同一fieldが移行しdual-green後に本schemaを廃止できる時"
pair_artifact: docs/test-design/helix/L8-worker-lifecycle-receipt-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — receipt schema／state" }
  - { role: qa, slot_label: "QA — reachability／mutation" }
  - { role: tl, slot_label: "TL — terminal整合監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-lifecycle-receipt.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-lifecycle-receipt-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-69-worker-lifecycle-receipt.md
  blocks:
    - docs/plans/PLAN-L6-103-worker-lifecycle-receipt.md
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

# PLAN-L5-95: worker lifecycle receipt詳細設計

run receipt field、hash-chain、terminal整合を固定する。
