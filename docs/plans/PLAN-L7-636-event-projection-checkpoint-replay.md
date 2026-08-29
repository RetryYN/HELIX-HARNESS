---
plan_id: PLAN-L7-636-event-projection-checkpoint-replay
title: "PLAN-L7-636 (impl): orchestration event projection と checkpoint replay の pure 判定を実装する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
review_evidence:
  - reviewer: "Codex TL preflight"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-19T12:52:54Z"
    tests_green_at: "2026-08-19T12:52:54Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "PLAN-L7-636のpure judgement実装について、canonical PLAN identity、L5/L8 pair、U-EPR oracle、#499 transactional I/Oとの責務境界をread-onlyで確認した。completion_claim_allowed:falseを維持し、これはClaude Code Opusの独立exact-HEAD reviewを代替しない。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/event-projection-checkpoint-replay.test.ts tests/event-projection-plan-identity.test.ts tests/ddd-tdd-rules.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-19T12:52:37Z"
        evidence_path: tests/event-projection-checkpoint-replay.test.ts
        output_digest: "sha256:3e5f60333b6aa9911ab9c8d90ce7d30bb2c8b456a1f5163d4316f88d28eec674"
        result: "3 files / 187 tests passed"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-19T12:52:54Z"
        evidence_path: tsconfig.json
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "exit 0"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-19T12:52:54Z"
        evidence_path: docs/plans/PLAN-L7-636-event-projection-checkpoint-replay.md
        output_digest: "sha256:1d40a899b37b0575006e302bdeb133fb06bf74d07fac32adf679333ce68d2bf1"
        result: "plan-governance OK (989 records)"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-19T12:52:54Z"
  review_binding:
    reviewer: "Codex TL preflight"
    reviewed_at: "2026-08-19T12:52:54Z"
    evidence_digest: "sha256:f172aa5dbb692d432692485c04216cdb0518ea51f5e0c4631cdb8aa8ef89a54a"
  entries: []
entry_signals:
  - "po_directive:Issue #215 event projectionとcheckpoint replayのpure judgement"
  - "po_directive:Issue #503 closed後のL6/L7再入"
created: 2026-08-19
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 215
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-REPLAY-001
responsibility_owner: event-projection-checkpoint-replay
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-98のL5/L8 pairとIssue #503の到達可能性是正がcurrent authorityとして存在し、U-EPR-001..102がcanonical表として固定されている"
contract_postconditions: "8 pure judgement exportsがL5 schema、failure code、判定順序を再定義せず実装され、U-EPR-001..102のexecutable oracleとsource mutationで分岐が反証可能になる"
contract_invariants: "入力を変更しない、digestはsrc/runtime/digest.tsを再利用する、scope未指定を全体scopeへ昇格しない、DB／filesystem／network／CLI writeを持たない、#213/#214/#499の責務を再実装しない"
contract_failures: "event片肺、unknown field相殺、duplicate side effect、causal inversion、illegal transition、projection drift、orphan lane、checkpoint／HEAD／parent欠落、scope流用、non-idempotent replay、無制限retryをfail-closeする"
tdd_red_required: false
mutation_oracle_required: true
mutation_oracle_evidence: "tests/event-projection-checkpoint-replay.test.ts と tests/tools/event-projection-checkpoint-replay-mutation/run-mutation.ts を npx --no-install tsx で実行し、total=10 killed=10 survived=0 pattern_missing=0 を実測した。対象は exact envelope keys、payload/head binding、causal order、lifecycle transition、projection drift、checkpoint stale HEAD、retry budget の fail-close 分岐である。"
complexity_effect: net_negative
complexity_justification: "pure judgementを1 moduleへ集約し、既存digestと#213/#214のauthorityを再利用する。transactional I/Oは#499へ分離する"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md
pair_artifact: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IDENTITY-001, test_path: tests/event-projection-plan-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-001, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-002, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-003, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-004, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-005, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-006, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-007, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-008, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-009, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-010, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-011, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-012, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-013, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-014, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-015, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-016, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-017, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-018, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-019, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-020, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-021, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-022, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-023, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-024, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-025, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-026, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-027, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-028, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-029, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-030, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-031, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-032, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-033, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-034, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-035, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-036, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-037, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-038, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-039, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-040, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-041, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-042, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-043, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-044, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-045, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-046, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-047, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-048, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-049, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-050, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-051, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-052, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-053, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-054, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-055, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-056, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-057, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-058, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-059, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-060, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-061, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-062, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-063, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-064, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-065, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-066, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-067, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-068, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-069, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-070, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-071, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-072, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-073, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-074, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-075, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-076, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-077, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-078, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-079, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-080, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-081, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-082, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-083, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-084, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-085, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-086, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-087, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-088, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-089, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-090, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-091, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-092, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-093, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-094, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-095, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-096, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-097, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-098, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-099, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-100, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-101, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-102, test_path: tests/event-projection-checkpoint-replay.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — pure judgement moduleとtyped input/output" }
  - { role: qa, slot_label: "QA — U-EPR-001..102とmutation oracle" }
  - { role: tl, slot_label: "TL — #213/#214境界と#499引き渡し" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-636-event-projection-checkpoint-replay.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: tests/event-projection-plan-identity.test.ts, artifact_type: test_code }
  - { artifact_path: src/runtime/event-projection-checkpoint-replay.ts, artifact_type: source_module }
  - { artifact_path: tests/event-projection-checkpoint-replay.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md
  requires:
    - docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md
    - docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
  blocks:
    - issue:215
    - issue:499
---

# orchestration event projection と checkpoint replay の pure 判定

## 目的

旧 `PLAN-L7-531-event-projection-checkpoint-replay` は既存の `PLAN-L7-531-psc-l9-gate-system.md`
と採番キーが衝突するため採用しない。本PLANは、L5/L8 pairのcurrent authorityをL6/L7実装へ
接続するための正規IDである。採番訂正と実装着手を同じ完了主張にしない。

## 実装範囲

- event envelope（イベント封筒）、causal order（因果順序）、idempotent ingest（冪等取込み）、lifecycle transition（ライフサイクル遷移）
- projection drift（投影ドリフト）、checkpoint scope（チェックポイント範囲）、checkpoint replay（チェックポイント再生）、bounded recovery routing（有界リカバリ経路）
- U-EPR-001..102のexecutable oracleとsource mutation

## 非対象

- `#499`のtransactional I/O、append、projection table、checkpoint persistence
- 新CLI、GitHub Projects API、network、filesystem write
- #213/#214のlease、terminal、slot accounting authorityの再実装

このPLANはdraftかつ`completion_claim_allowed: false`であり、実装・検証・Claude独立reviewが
同一HEADで成立するまでconfirmedまたは完了扱いにしない。
