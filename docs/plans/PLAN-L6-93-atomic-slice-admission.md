---
plan_id: PLAN-L6-93-atomic-slice-admission
title: "PLAN-L6-93 (add-design): Atomic Slice Admission関数設計"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-02 Issue #339 L3Q-IT-023をL6/L7へ降下する"
created: 2026-08-02
updated: 2026-08-02
owner: Codex / TL
github_issue_id: 339
engineering_discipline_required: true
behavior_contract_id: GH-AC-035
responsibility_owner: atomic-slice-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-85の型・failure・state・L8 oracleがPR #337でmainへmerge済み"
contract_postconditions: "pure canonicalizer／evaluator／design candidate selectorが副作用なしで一意になる"
contract_invariants: "exactly-one contract/owner、no-code-first、current blocker、exact path/companion、same-HEAD receipt"
contract_failures: "invalid、stale、no-code skip、blocker defer、binding、multiple owner、path/companion/expansion driftをfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存guard結果を1 pure moduleへ合成し、新detector/schema/state/table/jobを追加しない"
removal_trigger: "既存consumerとのdual-green後、旧分岐consumer=0 receipt成立時"
parent_design: docs/design/helix/L5-detail/atomic-slice-admission.md
pair_artifact: docs/test-design/helix/L8-atomic-slice-admission-runtime-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — pure型／canonicalizer／evaluator" }
  - { role: qa, slot_label: "QA — negative／mutation／stale oracle" }
  - { role: tl, slot_label: "TL — 既存owner再利用と非過剰設計監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-93-atomic-slice-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/atomic-slice-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-atomic-slice-admission-runtime-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-85-atomic-slice-admission.md
  requires:
    - docs/plans/PLAN-L4-59-atomic-slice-admission.md
    - docs/design/helix/L5-detail/atomic-slice-admission.md
    - docs/test-design/helix/L8-atomic-slice-admission-unit-test-design.md
    - docs/test-design/helix/L9-atomic-slice-admission-system-test-design.md
  blocks:
    - docs/plans/PLAN-L7-494-atomic-slice-admission.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-02T02:01:43Z"
    tests_green_at: "2026-08-02T02:00:44Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #340 exact HEAD f4e8f92d1c5c049c75a4cf060ad8b1af47573d25のPLAN-L6-93/L8 pair-freeze content gateをClaude AI-Bがread-only判定。content Critical/High/Medium 0、content_blocker_count 0、content_verdict approve。merge admissionはfull CI未実行のためrequest_changesを維持し、content承認と混同しない。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/340#issuecomment-5154560523"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/atomic-slice-admission.test.ts tests/design-coverage.test.ts tests/design-language-gate.test.ts tests/oracle-traceability.test.ts tests/plan-lint.test.ts tests/plan-layer-cross-validation.test.ts tests/plan-left-arm-carry.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-02T02:00:44Z", evidence_path: tests/atomic-slice-admission.test.ts, output_digest: "sha256:beacf2813d7b19406acb754a7e2f87ed119170360bb2b973cb518fc347c2d03b", result: "Codex author runtime: 3 files / 79 tests pass; Claude AI-B content reviewは別receipt" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-02T01:52:51Z", evidence_path: src/runtime/atomic-slice-admission.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "Codex author runtime: exit 0; command stdout is empty" }
---

# PLAN-L6-93: Atomic Slice Admission関数設計

1. L5型とfailure precedenceを公開pure functionへ一対一で降下する。
2. L6 unit test designでL8/L9 oracle exact traceとmutationを固定する。
3. 設計候補を4 complexity observablesとp95で比較し、既存owner再利用案を選ぶ。
4. independent AI-B review後にpairをconfirmedへ遷移する。
5. PLAN-L4-59所有のL9 artifactは再所有せず、ST-ATOMIC-011の測定条件だけを具体化する。
