---
plan_id: PLAN-L7-449-durability-boundary-implementation
title: "PLAN-L7-449 (troubleshoot): diagnostic redaction / autonomous-loop durability実装"
kind: troubleshoot
layer: L7
drive: agent
parent_design: docs/design/harness/L6-function-design/durability-boundaries.md
pair_artifact: docs/test-design/harness/L8-durability-boundaries.md
status: confirmed
route_mode: incident
entry_signals:
  [
    "po_directive:2026-07-13 /goal『バグがあればその場で是正し検出力を強化』に基づくPLAN-L7-445 #29/#30実装slice",
  ]
created: 2026-07-13
updated: 2026-07-13
owner: Codex
agent_slots:
  - { role: aim, slot_label: "AIM — incident scopeとrecovery authority" }
  - { role: se, slot_label: "SE — cause digest/epoch store実装" }
  - { role: qa, slot_label: "QA — failure injectionとprocess oracle" }
verification_bindings:
  - {
      parent_design: docs/design/harness/L6-function-design/durability-boundaries.md,
      oracle_id: U-DUR-001,
      test_path: tests/doctor-cause-digest.test.ts,
    }
  - {
      parent_design: docs/design/harness/L6-function-design/durability-boundaries.md,
      oracle_id: U-DUR-002,
      test_path: tests/doctor-cause-digest.test.ts,
    }
  - {
      parent_design: docs/design/harness/L6-function-design/durability-boundaries.md,
      oracle_id: U-DUR-003,
      test_path: tests/doctor-cause-digest-contract.test.ts,
    }
  - {
      parent_design: docs/design/harness/L6-function-design/durability-boundaries.md,
      oracle_id: U-DUR-004,
      test_path: tests/loop-store-durability.test.ts,
    }
  - {
      parent_design: docs/design/harness/L6-function-design/durability-boundaries.md,
      oracle_id: U-DUR-005,
      test_path: tests/loop-store-durability.test.ts,
    }
  - {
      parent_design: docs/design/harness/L6-function-design/durability-boundaries.md,
      oracle_id: U-DUR-006,
      test_path: tests/loop-store-durability.test.ts,
    }
  - {
      parent_design: docs/design/harness/L6-function-design/durability-boundaries.md,
      oracle_id: U-DUR-007,
      test_path: tests/loop-store-durability.test.ts,
    }
  - {
      parent_design: docs/design/harness/L6-function-design/durability-boundaries.md,
      oracle_id: U-DUR-005,
      test_path: tests/durable-loop-store.test.ts,
    }
  - {
      parent_design: docs/design/harness/L6-function-design/durability-boundaries.md,
      oracle_id: U-DUR-007,
      test_path: tests/durable-loop-process.test.ts,
    }
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-78でL5/L6 contractとL8/L9 Vペアへbackprop済み。"
generates:
  - {
      artifact_path: docs/plans/PLAN-L7-449-durability-boundary-implementation.md,
      artifact_type: markdown_doc,
    }
  - {
      artifact_path: src/runtime/stable-cause-digest.ts,
      artifact_type: source_module,
    }
  - {
      artifact_path: src/orchestration/durable-loop-epoch.ts,
      artifact_type: source_module,
    }
  - {
      artifact_path: src/orchestration/durable-loop-epoch-node.ts,
      artifact_type: source_module,
    }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/failure.ts, artifact_type: source_module }
  - {
      artifact_path: src/orchestration/loop-store.ts,
      artifact_type: source_module,
    }
  - {
      artifact_path: src/orchestration/autonomous-loop-run-receipts.ts,
      artifact_type: source_module,
    }
  - {
      artifact_path: tests/doctor-cause-digest.test.ts,
      artifact_type: test_code,
    }
  - {
      artifact_path: tests/doctor-cause-digest-contract.test.ts,
      artifact_type: test_code,
    }
  - {
      artifact_path: tests/loop-store-durability.test.ts,
      artifact_type: test_code,
    }
  - {
      artifact_path: tests/loop-store-durability-node.test.ts,
      artifact_type: test_code,
    }
  - { artifact_path: tests/durable-loop-store.test.ts, artifact_type: test_code }
  - { artifact_path: tests/durable-loop-process.test.ts, artifact_type: test_code }
  - {
      artifact_path: tests/fixtures/durable-loop-process-child.ts,
      artifact_type: test_code,
    }
  - {
      artifact_path: tests/autonomous-loop-run-receipts.test.ts,
      artifact_type: test_code,
    }
  - {
      artifact_path: tests/orchestration/loop-bridge.test.ts,
      artifact_type: test_code,
    }
  - {
      artifact_path: tests/harness-check-workflow.test.ts,
      artifact_type: test_code,
    }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: source_module }
dependencies:
  parent: docs/plans/PLAN-L6-78-durability-boundary-design.md
  requires: []
review_evidence:
  - reviewer: qs4_445_atomic_loop_final
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-13T06:42:28+09:00"
    tests_green_at: "2026-07-13T06:41:55+09:00"
    verdict: pass
    scope: "diagnostic redaction、production durable epoch store、worker/verifier stage resume、legacy migration、receipt、Windows実runner、C1-C6 child SIGKILL、2-process single winner、release proof/GC/recoveryを最終監査。Blocker/High 0、IT-DUR-001..005 PASS。trusted approval SSoT未実装中はproduction recovery route 0を維持する。"
    worker_model: codex
    reviewer_model: codex-fresh-subagent
    green_commands:
      - kind: integration_test
        command: "bun run test:fast -- tests/doctor-cause-digest.test.ts tests/doctor-cause-digest-contract.test.ts tests/loop-store-durability.test.ts tests/loop-store-durability-node.test.ts tests/durable-loop-store.test.ts tests/durable-loop-process.test.ts tests/autonomous-loop-run-receipts.test.ts tests/orchestration/loop-bridge.test.ts tests/harness-check-workflow.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-13T06:41:55+09:00"
        evidence_path: tests/durable-loop-process.test.ts
        output_digest: "sha256:fd5d1ae7c2294a5d7a5b75ab680d1511907938c96606b8eeba32ac9f5b1b4c87"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-13T06:41:25+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
  - reviewer: audit_442_successors_final
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-13T07:34:00+09:00"
    tests_green_at: "2026-07-13T07:30:07+09:00"
    verdict: pass
    scope: "899a5345でhistorical tombstone、runtime→orchestration非依存、green-command-digest、design drift 0、implementation-binding/trace-impact-integrity pass、別command digest分離を再監査。Blocker/High/Medium 0。"
    worker_model: codex
    reviewer_model: codex-fresh-subagent
    green_commands:
      - kind: integration_test
        command: "bun run test:fast -- tests/doctor-cause-digest.test.ts tests/doctor-cause-digest-contract.test.ts tests/loop-store-durability.test.ts tests/loop-store-durability-node.test.ts tests/durable-loop-store.test.ts tests/durable-loop-process.test.ts tests/autonomous-loop-run-receipts.test.ts tests/orchestration/loop-bridge.test.ts tests/harness-check-workflow.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-13T07:29:31+09:00"
        evidence_path: tests/durable-loop-process.test.ts
        output_digest: "sha256:fd5d1ae7c2294a5d7a5b75ab680d1511907938c96606b8eeba32ac9f5b1b4c87"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-13T07:29:40+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts current-location --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-13T07:28:45+09:00"
        evidence_path: docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md
        output_digest: "sha256:11c1dad89572d5b93873158cc687845dd3b3d278bb787507a1ae919a2cfd20bd"
---

# PLAN-L7-449: durability boundary実装

## 工程表

| Step | 実行     | 内容                          | 完了条件                |
| ---- | -------- | ----------------------------- | ----------------------- |
| 1    | [直列]   | cause digest/doctor mapper    | U-DUR-001..003 green    |
| 2    | [直列]   | exclusive claim/epoch reader  | U-DUR-004..007 green    |
| 3    | [直列]   | receipt surface統合           | corrupt→missing経路0    |
| 4    | [review] | process crash/concurrency検証 | IT-DUR-001..005、High 0 |

## 完了条件

- PLAN-L6-78のDbCと全U/IT oracle、独立review evidenceを満たす。
- legacy stateを明示分類し、corruptをfresh startへ写さない。
