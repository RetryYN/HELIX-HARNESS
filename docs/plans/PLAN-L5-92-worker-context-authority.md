---
plan_id: PLAN-L5-92-worker-context-authority
title: "PLAN-L5-92 (add-design): worker context authority詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Issue #225 WCC-FR-09を連続dispatchする"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-09
responsibility_owner: worker-context-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-66がcomponentとauthority境界を固定"
contract_postconditions: "18-field packet、13 failure、reachability witnessを固定"
contract_invariants: "unknown/missing field 0、3軸変換0、unbounded budget 0"
contract_failures: "schema/HEAD/authority/rule/axes/scope/budget/schema/role/lens/payload/seal"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "packet/envelope/capability三型だけで状態を表現し永続ledgerを持たない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-worker-context-authority-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — packet/failure契約" }
  - { role: qa, slot_label: "QA — failure reachability" }
  - { role: tl, slot_label: "TL — design refactor gate" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-context-authority-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-66-worker-context-authority.md
  requires:
    - docs/design/helix/L4-basic-design/worker-context-authority.md
  blocks:
    - docs/plans/PLAN-L6-100-worker-context-authority.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T15:09:32Z"
  review_binding: { reviewer: "Codex independent reviewer / gpt-5.6-terra", reviewed_at: "2026-08-03T15:09:32Z", evidence_digest: "sha256:36132143923302cdb8b6dc0ecba7e18d2812f4d7a514cc8a07b90589da14de56" }
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T15:09:32Z"
    tests_green_at: "2026-08-03T15:09:32Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "current authority/rule exact binding、全process sinkのcontext必須化、spawn直前再attest、PLAN exact bindingsを監査。Critical/High/Medium 0。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/worker-context-packet.test.ts tests/worker-isolation-broker.test.ts tests/worker-wrapper-admission.test.ts tests/team-run.test.ts tests/pair-agent.test.ts tests/orchestration/loop-bridge.test.ts tests/design-reality-binding.test.ts tests/digest.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T15:09:32Z", evidence_path: tests/worker-context-packet.test.ts, output_digest: "sha256:7b07e4ae2409f7ea2d5456adcf9e5e7f7c210d09133d19e4e0ef68e36859c710", result: "8 files / 110 passed / 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false --incremental false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-03T15:09:32Z", evidence_path: src/runtime/worker-context-packet.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0; stdout empty" }
---

# PLAN-L5-92: worker context authority詳細設計

failure exact setと実行fixture/mutationを一対一にする。
