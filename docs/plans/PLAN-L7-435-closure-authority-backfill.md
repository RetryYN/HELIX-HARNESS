---
plan_id: PLAN-L7-435-closure-authority-backfill
title: "PLAN-L7-435 (impl): closure authority backfill"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-12 PLAN-L6-73 confirmed authority backfill implementation"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
agent_slots:
  - { role: se, slot_label: "SE - proposal builder、review verifier、atomic apply" }
  - { role: qa, slot_label: "QA - 361件敵対fixtureとincremental convergence" }
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-73とU-CABF-001..010を実装へ降下する。"
parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md, oracle_id: U-CABF-001, test_path: tests/closure-authority-backfill.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md, oracle_id: U-CABF-002, test_path: tests/closure-authority-backfill.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md, oracle_id: U-CABF-003, test_path: tests/closure-authority-backfill.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md, oracle_id: U-CABF-004, test_path: tests/closure-authority-backfill.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md, oracle_id: U-CABF-005, test_path: tests/closure-authority-backfill.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md, oracle_id: U-CABF-006, test_path: tests/closure-authority-backfill-transaction.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md, oracle_id: U-CABF-007, test_path: tests/closure-authority-backfill-transaction.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md, oracle_id: U-CABF-008, test_path: tests/closure-authority-backfill-transaction.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md, oracle_id: U-CABF-009, test_path: tests/closure-authority-backfill-transaction.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-backfill.md, oracle_id: U-CABF-010, test_path: tests/closure-authority-backfill-transaction.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-435-closure-authority-backfill.md, artifact_type: markdown_doc }
  - { artifact_path: src/policy/closure-authority-backfill.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-authority-backfill-loader.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-authority-backfill-verifier.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-authority-backfill.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/closure-authority-backfill.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-authority-backfill-transaction.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-73-closure-authority-backfill.md
  requires: [docs/plans/PLAN-L6-73-closure-authority-backfill.md]
---

# PLAN-L7-435: closure authority backfill（authority補完）

## 1. 実装slice

1. Vペア三者joinとtyped classificationをpure policyとして実装する。
2. read-only proposal bundleと独立review verifierを実装する。
3. canonical registryへのCAS付きrecoverable atomic applyと再分類保存則を実装する。
4. 361件censusをincremental windowで実行し、未解決reason別backlogを残す。

## 2. 完了条件

confirmed PLAN-L6-73、`U-CABF-001..010`、PLAN lint、TypeScript、Biome、full suite、独立reviewがgreenである。
