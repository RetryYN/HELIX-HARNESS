---
plan_id: PLAN-L7-502-worker-independent-review
title: "PLAN-L7-502 (add-impl): worker independent review"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: true
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
contract_preconditions: "PLAN-L6-99がtyped APIと検証順序を固定する"
contract_postconditions: "U-WRR-001..008、U-WIB-013..014、U-DRB-018がgreenになる"
contract_invariants: "copied capability 0、三軸collision 0、DB／Git／merge write 0"
contract_failures: "必須seal／join／separation分岐除去がmutation oracleをRedにする"
tdd_red_required: true
red_at: "2026-08-03T10:05:00Z"
green_at: "2026-08-03T12:41:51Z"
complexity_effect: net_negative
complexity_justification: "並行review経路を作らずsealed capability chainへ集約する"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/worker-independent-review.md
pair_artifact: docs/test-design/helix/L8-worker-independent-review-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — review admission実装" }
  - { role: qa, slot_label: "QA — executable oracle＋mutation" }
  - { role: tl, slot_label: "TL — exact scope／Feature復帰監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-WRR-001, test_path: tests/worker-review-receipt.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-WRR-002, test_path: tests/worker-review-receipt.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-WRR-003, test_path: tests/worker-review-receipt.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-WRR-004, test_path: tests/worker-review-receipt.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-WRR-005, test_path: tests/worker-review-receipt.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-WRR-006, test_path: tests/worker-review-receipt.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-WRR-007, test_path: tests/worker-review-receipt.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-WRR-008, test_path: tests/worker-review-receipt.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-WIB-013, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-WIB-014, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-independent-review.md, oracle_id: U-DRB-018, test_path: tests/design-reality-binding.test.ts }
generates:
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-isolation-broker.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-review-receipt.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: tests/worker-review-receipt.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-99-worker-independent-review.md
  blocks:
    - issue:227
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
    scope: "broker-issued process-local origin、actor自己申告除去、copy/model/stale拒否、三軸分離、FR-12非混載を監査。Critical/High/Medium 0。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/worker-review-receipt.test.ts tests/worker-isolation-broker.test.ts tests/design-reality-binding.test.ts tests/digest.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T12:41:51Z", evidence_path: tests/worker-review-receipt.test.ts, output_digest: "sha256:7d753055593cd45057ad99eeafd9c1563beca7fb5ca4adb964cf47e9d68eb850", result: "4 files / 46 passed / 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false --incremental false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-03T12:41:51Z", evidence_path: src/runtime/worker-review-receipt.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0; stdout empty" }
---

# PLAN-L7-502: worker independent review実装

Redでmodule不在を確認し、GreenでFR-05 proposalからsealed independent reviewへの唯一経路を作る。Issue #227は後続lifecycleが残るためcloseしない。
