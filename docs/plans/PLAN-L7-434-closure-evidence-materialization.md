---
plan_id: PLAN-L7-434-closure-evidence-materialization
title: "PLAN-L7-434 (impl): closure証跡materialization pipeline"
kind: impl
layer: L7
drive: agent
status: completed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-12 PLAN-L7-425 I8 production evidence materialization実装"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
agent_slots:
  - { role: se, slot_label: "SE - authority registry、runner、transaction実装" }
  - { role: qa, slot_label: "QA - crash/replay/361件敵対検証" }
backprop_decision: not_required
backprop_decision_reason: "confirmed PLAN-L6-72とU-CMAT-001..012を実装へ降下する。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-12T01:26:32Z"
  review_binding:
    reviewer: codex-independent-reviewer
    reviewed_at: "2026-07-12T01:26:32Z"
    evidence_digest: "sha256:07c4f66f9696a355639e3aa12cb9fbd5d6d779061d03a9e1699b7ae8f367fb59"
  entries: []
parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-001, test_path: tests/closure-authority-registry.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-002, test_path: tests/closure-authority-registry.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-003, test_path: tests/closure-evidence-materialization.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-004, test_path: tests/closure-evidence-runner.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-005, test_path: tests/closure-evidence-runner.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-006, test_path: tests/closure-evidence-materialization.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-007, test_path: tests/closure-evidence-materialization.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-008, test_path: tests/closure-evidence-materialization.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-009, test_path: tests/closure-evidence-materialization.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-010, test_path: tests/closure-evidence-materialization.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-011, test_path: tests/closure-process-receipt-schema.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-materialization.md, oracle_id: U-CMAT-012, test_path: tests/closure-materialization-lock.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-434-closure-evidence-materialization.md, artifact_type: markdown_doc }
  - { artifact_path: src/policy/closure-authority-registry.ts, artifact_type: source_module }
  - { artifact_path: src/policy/filesystem-durability.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/closure-authority-registry.yaml, artifact_type: yaml_config }
  - { artifact_path: src/state-db/closure-evidence-materialization.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-materialization-lock.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-evidence-runner.ts, artifact_type: source_module }
  - { artifact_path: src/lint/closure-authority-registry.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/closure-evidence-materialization.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-materialization-lock.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-authority-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-evidence-runner.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-process-receipt-schema.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-72-closure-evidence-materialization.md
  requires: [docs/plans/PLAN-L6-72-closure-evidence-materialization.md]
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-12T01:26:32Z"
    reviewed_at: "2026-07-12T01:26:32Z"
    verdict: approve_after_fixes
    scope: "authority registry、atomic lock、bounded worker pool、persistent physical receipt 1:N、crash recovery、Windows durability、CLI asyncを反復敵対監査し全severity 0。"
    green_commands:
      - { kind: unit_test, command: "bun run test:fast", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-12T01:26:32Z", evidence_path: tests/closure-evidence-materialization.test.ts, output_digest: "sha256:9ba0fe5adf6d73326e4b814220223059c76d6bf676fd827684b1cb2b1e538538" }
      - { kind: lint, command: "bun run lint", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-12T01:26:32Z", evidence_path: src/state-db/closure-evidence-materialization.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
      - { kind: typecheck, command: "bunx tsc --noEmit", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-12T01:26:32Z", evidence_path: src/state-db/closure-evidence-runner.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
---

# PLAN-L7-434: closure証跡materialization pipeline

## 1. 実装slice

1. authority registry schema・loader・drift lintを実装する。
2. typed subprocess runnerとVitest JSON oracle coverageを実装する。
3. gate receipt schema migration、staging、publish journal、recoveryを実装する。
4. manifest生成CLIと既存auto-approve dry-run E2Eを実装する。

## 2. 完了条件

`U-CMAT-001..012`、PLAN lint、TypeScript、Biome、全fast suite、独立adversarial reviewがgreenである。
実361件へのexecuteはmain merge後のproduction cycleへ残す。
