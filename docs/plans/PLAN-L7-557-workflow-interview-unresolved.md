---
plan_id: PLAN-L7-557-workflow-interview-unresolved
title: "PLAN-L7-557 (add-impl): Workflow interviewとunresolved engine"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: complete
completion_claim_allowed: true
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
  requires:
    - docs/plans/PLAN-L7-478-universal-workflow-envelope.md
    - docs/plans/PLAN-REVERSE-557-workflow-interview-unresolved-backfill.md
  blocks: [issue:186]
agent_slots:
  - { role: se, slot_label: "SE — deterministic interview evaluator" }
  - { role: qa, slot_label: "QA — conditional/stale/unresolved mutation oracle" }
  - { role: tl, slot_label: "TL — UWJ-FR-003/004 authority境界" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-14T04:07:03Z"
    tests_green_at: "2026-08-14T04:05:21Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    scope: "PR #680 HEAD 4d10451b785f20d009dfa5d1e12c4bfe5cd22995を独立reviewしblocker 0。L4↔L9、L5↔L8-detail、L6↔L8のpair、U-UWINT-001..005、3 failed／2 passedのmutation evidence、DB/Git/GitHub writeを持たないpure evaluatorを確認した。draft CI 31767783778 success、canonical receipt pull/680#issuecomment-5289332877、reviewed merge 34ab1ae15f4df4d2566c2063afcff5a6504a840a。"
    green_commands:
      - { kind: smoke, command: "gh run view 31767783778 --json databaseId,status,conclusion,headSha,event", runner: ci, scope: full, exit_code: 0, completed_at: "2026-08-14T04:05:21Z", evidence_path: tests/workflow-interview-unresolved.test.ts, output_digest: "sha256:bb1dc6ab5a34114eff741196ce9081dec682f7b288addfc4ef9b17f614e6cf9f", result: "completed / success / HEAD 4d10451b785f20d009dfa5d1e12c4bfe5cd22995" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-14T04:07:03Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-14T04:07:03Z"
    evidence_digest: "sha256:01a735020ee9c699150386a229506e52ffe9d8b6c99364227bc1afccb8b1db73"
  entries: []
---

# Workflow interviewとunresolved engine

L3正本 UWJ-FR-003/004、UWJ-AC-003/004を、`U-UWINT-001`〜`U-UWINT-005`の
一対一V-pairへ降ろす。AIやadapterへfreeze／write authorityを追加しない。
