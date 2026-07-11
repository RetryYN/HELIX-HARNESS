---
plan_id: PLAN-L7-426-development-ci-bounded-time
title: "PLAN-L7-426 (impl): 開発CI bounded-time fail-close"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "PLAN-L6-67 confirmed"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "confirmed L6契約をworkflowと回帰検出へ降下する。"
parent_design: docs/design/harness/L6-function-design/development-ci-bounded-time.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/development-ci-bounded-time.md, oracle_id: U-CITIME-001, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/development-ci-bounded-time.md, oracle_id: U-CITIME-002, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/development-ci-bounded-time.md, oracle_id: U-CITIME-003, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - role: se
    slot_label: "SE - workflow timeout実装"
  - role: qa
    slot_label: "QA - YAML構造とfail-open反例検証"
generates:
  - { artifact_path: docs/plans/PLAN-L7-426-development-ci-bounded-time.md, artifact_type: markdown_doc }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: source_module }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-67-development-ci-bounded-time.md
  requires:
    - docs/plans/PLAN-L6-67-development-ci-bounded-time.md
---

# PLAN-L7-426: 開発CI bounded-time実装

## 完了条件

- `U-CITIME-001..003`、PLAN lint、typecheck、lint、全回帰、doctorがgreen。
- 独立reviewでtimeout階層、fail-close、consumer非変更を確認する。
