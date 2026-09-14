---
plan_id: PLAN-L7-494-atomic-slice-admission
title: "PLAN-L7-494 (add-impl): Atomic Slice Admission"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-08-02 Issue #339 L3Q-IT-023をTDD実装する"
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
contract_preconditions: "PLAN-L6-93がpure functionとL7 executable oracleをpair freezeする"
contract_postconditions: "atomic slice snapshotが決定的にadmitted/split/recoveryへ分類される"
contract_invariants: "副作用0、exact set、stable failure、same-HEAD receipt、current blocker非先送り"
contract_failures: "13 U-ATOMICの各mutationが最低1 executable testをredにする"
tdd_red_required: true
red_at: "2026-08-02T01:18:03Z"
green_at: "2026-08-02T01:19:42Z"
mutation_oracle_evidence: "tests/atomic-slice-admission.test.tsでunsafe/duplicate path、subset比較、companion欠落、self-review/stale receipt、multiple owner、failure相殺、入力順digest、add_code skip、current blocker defer、oracle 99%候補をseedすると各U-ATOMICがredとなる"
complexity_effect: net_negative
complexity_justification: "production module 1件、永続state 0、I/O 0で既存guard結果を合成し、重複detectorを作らない"
removal_trigger: "既存consumerとのdual-green後、旧分岐consumer=0 receipt成立時"
parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md
pair_artifact: docs/test-design/helix/L8-atomic-slice-admission-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-001, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-002, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-003, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-004, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-005, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-006, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-007, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-008, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-009, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-010, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-011, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-012, test_path: tests/atomic-slice-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-013, test_path: tests/atomic-slice-admission.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — canonicalizer／decision／digest実装" }
  - { role: qa, slot_label: "QA — 13 executable mutation oracle" }
  - { role: tl, slot_label: "TL — L5 fidelityとconsumer接続境界監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-494-atomic-slice-admission.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/atomic-slice-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/atomic-slice-admission.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-93-atomic-slice-admission.md
  requires:
    - docs/plans/PLAN-L6-93-atomic-slice-admission.md
    - docs/design/helix/L5-detail/atomic-slice-admission.md
    - docs/plans/PLAN-L4-59-atomic-slice-admission.md
    - docs/test-design/helix/L9-atomic-slice-admission-system-test-design.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-02T02:01:43Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-02T02:01:43Z"
    evidence_digest: "sha256:8877d00ed08f8419f37a0489fb7bc69bfc63047daae49bbc7a81f7c6529a9977"
  entries: []
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

# PLAN-L7-494: Atomic Slice Admission実装

1. Red: production module未存在でU-ATOMIC executable suiteをredにする。
2. Green: pure canonicalizer、admission evaluator、design candidate selectorを最小実装する。
3. Refactor: canonical JSON、set difference、failure orderを共有helperへ集約しI/Oを増やさない。
4. Claude AI-B content review、targeted green後にconfirmedへ遷移し、final HEADのfull CI／DB／reviewを閉じる。
5. PLAN-L4-59所有のL9 artifactは再所有せず、ST-ATOMIC-011の測定可能性だけを同一scopeで補強する。
