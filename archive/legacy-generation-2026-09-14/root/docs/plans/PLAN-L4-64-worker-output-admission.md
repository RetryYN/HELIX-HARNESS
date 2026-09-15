---
plan_id: PLAN-L4-64-worker-output-admission
title: "PLAN-L4-64 (add-design): worker output admission基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Issue #227 WCC-FR-05を連続dispatchする"]
created: 2026-08-03
updated: 2026-08-03
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
contract_preconditions: "Issue #226 WCC-FR-04がmainでgreenである"
contract_postconditions: "known schema contractからsealed outputまでの唯一経路を固定する"
contract_invariants: "raw stdout authority 0、fallback schema 0、relaxation 0、FR-06混載0"
contract_failures: "schema unresolved、process、encoding、canonical、shape、digest failure"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "schema service／DB／provider別parserを作らず既存brokerへ1 moduleを接続する"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-worker-output-admission-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — output authority境界" }
  - { role: qa, slot_label: "QA — L9 negative oracle" }
  - { role: tl, slot_label: "TL — FR-06非混載監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-output-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-output-admission-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires:
    - docs/plans/PLAN-L7-500-worker-isolation-policy.md
  blocks:
    - docs/plans/PLAN-L5-90-worker-output-admission.md
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T09:46:01Z"
    tests_green_at: "2026-08-03T09:46:01Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "base 1ee1bb5b上のdeclared working diffをread-only監査。closed AST、known schema exact解決、dynamic digest、Buffer stdout、raw stdout／stderr非公開、scope→status→admission、FR-06非混載を確認。Design Reality Binding checked=12、Critical/High/Medium 0、status transition可。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/worker-output-admission.test.ts tests/worker-isolation-broker.test.ts tests/design-reality-binding.test.ts tests/digest.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T09:46:01Z", evidence_path: tests/worker-output-admission.test.ts, output_digest: "sha256:5f13ecfe246db39a8606b087d9d035ceda10d7d97b14d55c914da5ffa900cf59", result: "4 files / 41 passed / 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false --incremental false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-03T09:46:01Z", evidence_path: src/runtime/worker-output-admission.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0; stdout empty" }
---

# PLAN-L4-64: worker output admission基本設計

descriptor、wrapper、broker、closed schema AST、sealed outputの責務境界を固定する。
