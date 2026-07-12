---
plan_id: PLAN-L7-434-closure-evidence-materialization
title: "PLAN-L7-434 (impl): closure証跡materialization pipeline"
kind: impl
layer: L7
drive: agent
status: draft
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
backprop_decision_reason: "confirmed PLAN-L6-72とU-CMAT-001..010を実装へ降下する。"
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
generates:
  - { artifact_path: docs/plans/PLAN-L7-434-closure-evidence-materialization.md, artifact_type: markdown_doc }
  - { artifact_path: src/policy/closure-authority-registry.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/closure-authority-registry.yaml, artifact_type: yaml_config }
  - { artifact_path: src/state-db/closure-evidence-materialization.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-materialization-lock.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-evidence-runner.ts, artifact_type: source_module }
  - { artifact_path: src/lint/closure-authority-registry.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/closure-evidence-materialization.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-materialization-lock.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-authority-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-evidence-runner.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-72-closure-evidence-materialization.md
  requires: [docs/plans/PLAN-L6-72-closure-evidence-materialization.md]
---

# PLAN-L7-434: closure証跡materialization pipeline

## 1. 実装slice

1. authority registry schema・loader・drift lintを実装する。
2. typed subprocess runnerとVitest JSON oracle coverageを実装する。
3. gate receipt schema migration、staging、publish journal、recoveryを実装する。
4. manifest生成CLIと既存auto-approve dry-run E2Eを実装する。

## 2. 完了条件

`U-CMAT-001..010`、PLAN lint、TypeScript、Biome、全fast suite、独立adversarial reviewがgreenである。
実361件へのexecuteはmain merge後のproduction cycleへ残す。
