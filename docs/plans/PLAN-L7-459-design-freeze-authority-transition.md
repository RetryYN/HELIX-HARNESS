---
plan_id: PLAN-L7-459-design-freeze-authority-transition
title: "PLAN-L7-459: Design Freeze authority transition実装"
kind: add-impl
layer: L7
drive: agent
parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md
pair_artifact: docs/test-design/helix/L8-design-freeze-authority-transition.md
status: confirmed
created: 2026-07-16
updated: 2026-07-16
owner: Codex
agent_slots:
  - { role: se, slot_label: "SE — authority transactionとschema trace" }
  - { role: qa, slot_label: "QA — CAS・rollback・replay反例" }
dependencies:
  parent: docs/plans/PLAN-L4-05-workflow-orchestration.md
  requires: []
  references:
    - docs/governance/post-po-design-freeze-transition-contract-v1.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-001, test_path: tests/design-denominator-observer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-002, test_path: tests/po7-decision-activation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-003, test_path: tests/post-po-design-freeze-transition-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-004, test_path: tests/post-po-design-freeze-transition-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-005, test_path: tests/post-po-design-freeze-transition-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-006, test_path: tests/state-db.test.ts }
backprop_decision: not_required
backprop_decision_reason: "既存PO7/Design Freeze v2実装を、その実装前提から抽出したL6/L8ペアへ正規収容するtrace修復である。"
generates:
  - { artifact_path: docs/plans/PLAN-L7-459-design-freeze-authority-transition.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-freeze-authority-transition.md, artifact_type: test_design }
  - { artifact_path: src/cli/commands/authority.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-design-freeze.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-design-freeze-v2.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-po7.ts, artifact_type: source_module }
  - { artifact_path: src/shared/digest.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/design-denominator-observer.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/po7-decision-activation.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/po7-sealed-authority.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/post-po-design-freeze-transition.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/post-po-design-freeze-transition-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/design-denominator-observer.test.ts, artifact_type: test_code }
  - { artifact_path: tests/po7-decision-activation.test.ts, artifact_type: test_code }
  - { artifact_path: tests/post-po-design-freeze-transition-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db.test.ts, artifact_type: test_code }
---

# Design Freeze authority transition実装

## 目的

PO7 sealed authorityからDesign Freeze v2への遷移を、設計分母、Git観測、append-only DB、CLI表示まで一つの
Vペアへ収容する。baseline追加ではなく、既存実装の全sourceを明示的に設計へ逆接続する。

## 完了条件

- L6のDbCとL8の反例表が相互参照される。
- `generates`に列挙したsourceの実装—PLAN孤児が0になる。
- U-DFA-001〜006、Vpair、plan governance、typecheckがgreenになる。
