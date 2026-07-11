---
plan_id: PLAN-L6-68-active-plan-selection
title: "PLAN-L6-68 (add-design): active PLAN選択整合性"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-12 PLAN-L7-425 I5 hook orphan増加バグを恒久修正"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存session-logのactive PLAN選択境界を具体化し、上位要求の意味は変更しない。"
parent_design: docs/design/harness/L6-function-design/active-plan-selection.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: se, slot_label: "SE - canonical ID照合とCLI状態変更境界" }
  - { role: qa, slot_label: "QA - 截断/未知/空registry敵対検証" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-68-active-plan-selection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/active-plan-selection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: tests/session-log.test.ts, artifact_type: test_code }
  - { artifact_path: tests/drive-db-registration.test.ts, artifact_type: test_code }
  - { artifact_path: tests/runtime-hook-entrypoints.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-67-development-ci-bounded-time.md
  requires: [docs/plans/PLAN-L6-67-development-ci-bounded-time.md]
---

# PLAN-L6-68: active PLAN選択整合性

## 受入条件

- exact canonical IDだけを受理する。
- 截断・未知・空registryはcurrent-planを書き換えず、候補提示付きで失敗する。
- `--clear`とsession-log fail-open契約は維持する。
