---
plan_id: PLAN-L6-95-worker-wrapper-admission
title: "PLAN-L6-95 (add-design): worker wrapper admission関数設計"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Feature #92 Issue #225 WCC-FR-02をL6/L7へ降下する"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-87がroute、digest、failure exact setを固定する"
contract_postconditions: "既存adapterの全worker sinkが同じadmissionを通る"
contract_invariants: "raw plan spawn 0、capability forge 0、新永続state 0"
contract_failures: "4 failureを実行fixtureとmutationで到達可能にする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "production新規file 0で既存spawn経路を一policyへ縮約する"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L5-detail/worker-wrapper-admission.md
pair_artifact: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — adapter admissionとsink関数設計" }
  - { role: qa, slot_label: "QA — failure branchとcapability oracle" }
  - { role: tl, slot_label: "TL — admitted execution消費境界監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-87-worker-wrapper-admission.md
  requires:
    - docs/design/helix/L5-detail/worker-wrapper-admission.md
    - docs/test-design/helix/L8-worker-wrapper-admission-unit-test-design.md
  blocks:
    - docs/plans/PLAN-L7-498-worker-wrapper-admission.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T02:38:00Z"
  review_binding:
    reviewer: "Codex independent reviewer / gpt-5.6-terra"
    reviewed_at: "2026-08-03T02:38:00Z"
    evidence_digest: "sha256:f731d60839fee253c5bfe68ac3d5282cacae99d914be423695bf3e39e142eb82"
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T02:38:00Z"
    tests_green_at: "2026-08-03T02:37:00Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "PR #361 HEAD a7921e846d581bd509c9d4b2989a433dcb03369fをclean exact-HEAD監査。21-path exact、DRB 4 failure、CLI/team/pair/loop sink、sealed executor、WCC-FR-03以降非混載を確認。Critical/High/Medium 0、blocker 0。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-wrapper-admission.test.ts tests/design-reality-binding.test.ts tests/runtime-adapter.test.ts tests/team-run.test.ts tests/pair-agent.test.ts tests/orchestration/loop-bridge.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T02:37:00Z", evidence_path: tests/worker-wrapper-admission.test.ts, output_digest: "sha256:0dbcb3afe8dfd3c49cd4c2a69acf9c5b35cba152e2604ef17e029a0460a2f163", result: "6 files / 97 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false --incremental false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-03T02:37:00Z", evidence_path: src/runtime/adapter.ts, output_digest: "sha256:deea675a38d1406a942d217a09a600dedda3f6d55a4b19929f9227db8494a1f4", result: "typecheck exit 0" }
      - { kind: lint, command: "npm run helix -- plan lint docs/plans/PLAN-L7-498-worker-wrapper-admission.md", runner: node, scope: changed-files, exit_code: 0, completed_at: "2026-08-03T02:37:00Z", evidence_path: docs/plans/PLAN-L7-498-worker-wrapper-admission.md, output_digest: "sha256:726635f3985a4bebadb0cee3a096a687938e0ab7ee48e45b3af107bd97a7d17e", result: "L5/L6/L7 plan lint green" }
---

# PLAN-L6-95: worker wrapper admission関数設計

既存`adapter.ts`へcanonical digest、origin、admission、sealed capabilityを追加し、CLI、team、pair-agent、loopへ接続する。
