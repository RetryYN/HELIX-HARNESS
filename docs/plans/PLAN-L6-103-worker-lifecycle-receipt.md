---
plan_id: PLAN-L6-103-worker-lifecycle-receipt
title: "PLAN-L6-103 (add-design): worker lifecycle receipt関数設計"
kind: add-design
layer: L6
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
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L5-95がschema、state、failure exact setを固定する"
contract_postconditions: "run receipt resolver、lifecycle factory、seal、serializer APIを固定する"
contract_invariants: "untrusted actor field 0、raw output公開0、Node以外のwrite 0"
contract_failures: "5 failure branchがU-WLIFE oracleへ到達する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "4 APIを追加するが、brokerの既存WeakMap sealとdigest coreを再利用しauthority surfaceを増やさない"
removal_trigger: "#214 scheduler projectorがsealed capabilityを直接所有し、本factory/serializerを置換できる時"
pair_artifact: docs/test-design/helix/L6-worker-lifecycle-receipt-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — typed lifecycle API" }
  - { role: qa, slot_label: "QA — seal／chain oracle" }
  - { role: tl, slot_label: "TL — broker結線監査" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/worker-lifecycle-receipt.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-worker-lifecycle-receipt-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-95-worker-lifecycle-receipt.md
  blocks:
    - docs/plans/PLAN-L7-506-worker-lifecycle-receipt.md
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

# PLAN-L6-103: worker lifecycle receipt関数設計

唯一の生成、検証、serialization APIを固定する。
