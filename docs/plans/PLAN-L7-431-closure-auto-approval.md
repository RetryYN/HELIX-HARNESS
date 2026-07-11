---
plan_id: PLAN-L7-431-closure-auto-approval
title: "PLAN-L7-431 (impl): closure自走承認とbounded batch"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 I8 closure自走化"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-71の機械証跡AND条件と不可逆境界を実装へ降下する。"
parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-001, test_path: tests/current-location.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-002, test_path: tests/current-location.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-003, test_path: tests/current-location.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-004, test_path: tests/current-location.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-005, test_path: tests/current-location.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-006, test_path: tests/current-location.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-431-closure-auto-approval.md, artifact_type: markdown_doc }
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/current-location.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-71-closure-auto-approval.md
  requires: [docs/plans/PLAN-L6-71-closure-auto-approval.md]
---

# PLAN-L7-431: closure自走承認とbounded batch

## 完了条件

`U-CAUTO-001..006`、PLAN lint、Biome、TypeScriptがgreenで、実データへのexecuteは親レーンに残す。
