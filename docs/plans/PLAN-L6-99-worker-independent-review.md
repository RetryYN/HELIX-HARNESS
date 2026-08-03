---
plan_id: PLAN-L6-99-worker-independent-review
title: "PLAN-L6-99 (add-design): worker independent review関数設計"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Issue #227 WCC-FR-06を連続dispatchする"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 227
engineering_discipline_required: true
behavior_contract_id: WCC-FR-06
responsibility_owner: worker-independent-review
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L5-91がschema／failure／state transitionを固定する"
contract_postconditions: "public API、評価順序、module-private sealを固定する"
contract_invariants: "copied proposal／review成功0、provider別分岐0、write authority 0"
contract_failures: "proposal、schema、digest、三軸collisionでreview capability 0"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "FR-05 capabilityへ純粋なadmission moduleを1つ接続し永続化を分離する"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L6-worker-independent-review-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — typed review API" }
  - { role: qa, slot_label: "QA — negative／mutation oracle" }
  - { role: tl, slot_label: "TL — exact execution order監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-independent-review.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/worker-independent-review.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-worker-independent-review-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-91-worker-independent-review.md
  blocks:
    - docs/plans/PLAN-L7-502-worker-independent-review.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T12:41:51Z"
  review_binding: { reviewer: "Codex independent reviewer / gpt-5.6-terra", reviewed_at: "2026-08-03T12:41:51Z", evidence_digest: "sha256:caee5f6dade053213d4a00ade70eb8fb68637c6c9c9f2ab5ae5cfa705e2f7f73" }
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T12:41:51Z"
    tests_green_at: "2026-08-03T12:41:51Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "broker-issued process-local origin、actor自己申告除去、copy/model/stale拒否、三軸分離、durable lifecycle非混載、未定義将来ID参照0を監査。Critical/High/Medium 0。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/worker-review-receipt.test.ts tests/worker-isolation-broker.test.ts tests/design-reality-binding.test.ts tests/digest.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T12:41:51Z", evidence_path: tests/worker-review-receipt.test.ts, output_digest: "sha256:7d753055593cd45057ad99eeafd9c1563beca7fb5ca4adb964cf47e9d68eb850", result: "4 files / 46 passed / 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false --incremental false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-03T12:41:51Z", evidence_path: src/runtime/worker-review-receipt.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0; stdout empty" }
---

# PLAN-L6-99: worker independent review関数設計

FR-05 capabilityを入力とするtyped admission APIと検証順序を固定する。
