---
plan_id: PLAN-L4-65-worker-independent-review
title: "PLAN-L4-65 (add-design): worker independent review基本設計"
kind: add-design
layer: L4
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
ddd_modeling_decision: value_object
contract_preconditions: "WCC-FR-05 sealed output capabilityがmainでgreenである"
contract_postconditions: "proposal join、strict receipt、三軸独立性、sealed reviewの境界を固定する"
contract_invariants: "DB／Git／merge authority 0、provider別adapter 0、durable lifecycle混載0、未定義将来ID参照0"
contract_failures: "unsealed proposal、schema、digest、identity、session、context failure"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存capabilityとdigest helperを再利用しledger／service／workflowを追加しない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-worker-independent-review-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — independent review境界" }
  - { role: qa, slot_label: "QA — L9 negative oracle" }
  - { role: tl, slot_label: "TL — lifecycle非混載監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-independent-review.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-independent-review-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires:
    - docs/plans/PLAN-L7-501-worker-output-admission.md
  blocks:
    - docs/plans/PLAN-L5-91-worker-independent-review.md
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

# PLAN-L4-65: worker independent review基本設計

FR-05 sealed proposalから独立review receiptを作る責務境界を固定する。
