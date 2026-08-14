---
plan_id: PLAN-L7-557-workflow-interview-unresolved
title: "PLAN-L7-557 (add-impl): Workflow interviewとunresolved engine"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-08-14 Issue #185 UWJ-FR-003/004 interviewとunresolved engine"
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 185
engineering_discipline_required: true
behavior_contract_id: WORKFLOW-INTERVIEW-UNRESOLVED-001
responsibility_owner: universal-workflow-judgment
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "UWJ-FR-003/004とAC-003/004がconfirmed L3正本に存在する"
contract_postconditions: "coreと該当conditionalだけを選び、未解決をsource span／履歴付きでfreeze blockする"
contract_invariants: "推測確定、非該当要求生成、stale回答再利用、DB/Git/GitHub writeを行わない"
contract_failures: "schema、stale、非該当回答、矛盾、authority不足、branch gapをstable findingへ変換する"
tdd_red_required: true
red_at: "2026-08-14T10:55:00+09:00"
green_at: "2026-08-14T11:05:30+09:00"
mutation_oracle_evidence: "WORKFLOW_CONDITIONAL_SIGNALS filterをvalue.signals[signal]から否定へ一時反転し、U-UWINT-001/002/003の3 testsがfailed、U-UWINT-004/005の2 testsがpassedとなることを2026-08-14に実測した。元実装へ復元後5 tests green。"
complexity_effect: justified_positive
complexity_justification: "既存src/workflow pure Zod contractへ単一evaluatorを追加し、永続化やserviceを増やさない"
removal_trigger: "Universal Workflow envelope admissionへ同一contractとして統合する時点"
parent_design: docs/design/helix/L6-function-design/workflow-interview-unresolved.md
pair_artifact: docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-interview-unresolved.md, oracle_id: U-UWINT-001, test_path: tests/workflow-interview-unresolved.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-interview-unresolved.md, oracle_id: U-UWINT-002, test_path: tests/workflow-interview-unresolved.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-interview-unresolved.md, oracle_id: U-UWINT-003, test_path: tests/workflow-interview-unresolved.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-interview-unresolved.md, oracle_id: U-UWINT-004, test_path: tests/workflow-interview-unresolved.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-interview-unresolved.md, oracle_id: U-UWINT-005, test_path: tests/workflow-interview-unresolved.test.ts }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/workflow-interview-unresolved.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/workflow-interview-unresolved.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-interview-unresolved.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-interview-unresolved-detail-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-workflow-interview-unresolved-system-test-design.md, artifact_type: test_design }
  - { artifact_path: src/workflow/workflow-interview-unresolved.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-interview-unresolved.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L6-function-design/workflow-interview-unresolved.md
  requires: [docs/plans/PLAN-L7-478-universal-workflow-envelope.md]
  blocks: [issue:186]
agent_slots:
  - { role: se, slot_label: "SE — deterministic interview evaluator" }
  - { role: qa, slot_label: "QA — conditional/stale/unresolved mutation oracle" }
  - { role: tl, slot_label: "TL — UWJ-FR-003/004 authority境界" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-14T04:44:56Z"
    tests_green_at: "2026-08-14T04:44:56Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    scope: "PR #680 HEAD 4d10451b の Codex 著寄与を Claude Code 収束レーンで独立レビューし blocker 0 と判定した。L4↔L9 / L5↔L8-detail / L6↔L8 の pair 双方向性、U-UWINT-001..005 の oracle 対応、WORKFLOW_CONDITIONAL_SIGNALS filter 否定反転で 3 failed / 2 passed となる mutation kill、依存が zod のみで DB/Git/GitHub write を持たない pure evaluator であることを実測確認した。canonical receipt は pull/680#issuecomment-5289332877、reviewed merge は 34ab1ae1。本 entry は main で merged-plan-status が draft PLAN の merge 済み deliverable を検出したため、同 review 結果を bookkeeping として記録するものである。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/workflow-interview-unresolved.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-14T04:44:56Z"
        evidence_path: tests/workflow-interview-unresolved.test.ts
        output_digest: "sha256:a08559a7d7aa7ace6fa91199e4cddd0cdb0c61f3964cd3fdf443df8d6908b7df"
        result: "5 passed (1 file)"
---

# Workflow interviewとunresolved engine

L3正本 UWJ-FR-003/004、UWJ-AC-003/004を、`U-UWINT-001`〜`U-UWINT-005`の
一対一V-pairへ降ろす。AIやadapterへfreeze／write authorityを追加しない。
