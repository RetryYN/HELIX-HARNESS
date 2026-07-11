---
plan_id: PLAN-L7-430-left-arm-carry-log
title: "PLAN-L7-430 (impl): 左腕差し戻しcarry log検出器"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 I6の未記録差し戻しを防止"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "L6 carry log契約をplan codec、doctor、G7へ降下する。"
parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-001, test_path: tests/left-arm-carry-log.test.ts }
agent_slots:
  - { role: se, slot_label: "SE - codec、analyzer、doctor/G7配線" }
  - { role: qa, slot_label: "QA - adversarial fixtureとreal repo回帰" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-430-left-arm-carry-log.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/left-arm-carry-log.ts, artifact_type: source_module }
  - { artifact_path: tests/left-arm-carry-log.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-70-left-arm-carry-log.md
  requires: [docs/plans/PLAN-L6-70-left-arm-carry-log.md]
---

# PLAN-L7-430: 左腕差し戻しcarry log検出器

## 1. 完了条件

`U-CARRY-001..016`、PLAN lint、doctor、G7/trace-freeze入口、全回帰がgreenである。
