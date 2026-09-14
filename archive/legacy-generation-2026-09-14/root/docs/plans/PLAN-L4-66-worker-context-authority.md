---
plan_id: PLAN-L4-66-worker-context-authority
title: "PLAN-L4-66 (add-design): worker context authority基本設計"
kind: add-design
layer: L4
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
contract_preconditions: "WCC-FR-01/02 descriptor/wrapperとWCC-FR-03/04 brokerがmainでgreen"
contract_postconditions: "packet component、authority、data flow、system oracle境界を固定"
contract_invariants: "1 behavior/owner、三軸直交、新service/DB/workflow 0、FR07/08/06/lifecycle非混載"
contract_failures: "compatibility authority、HEAD、scope、budget、payload drift"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存digest/role/lens/adapter/brokerを再利用しproduction module一件へ集約"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-worker-context-authority-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — context authority基本設計" }
  - { role: qa, slot_label: "QA — L9 negative oracle" }
  - { role: tl, slot_label: "TL — scope/authority監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-context-authority-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires:
    - docs/plans/PLAN-L7-498-worker-wrapper-admission.md
    - docs/plans/PLAN-L7-500-worker-isolation-policy.md
  blocks:
    - docs/plans/PLAN-L5-92-worker-context-authority.md
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

# PLAN-L4-66: worker context authority基本設計

WCC-FR-09だけをL4/L9へ降下し、Issue本文やhistorical receiptをcurrent authorityにしない。
