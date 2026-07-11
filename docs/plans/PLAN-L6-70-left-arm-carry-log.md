---
plan_id: PLAN-L6-70-left-arm-carry-log
title: "PLAN-L6-70 (add-design): 左腕差し戻しcarry log"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 I6のcarry log機械強制"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存L07工程の差し戻し規範を機械契約へ具体化する。"
parent_design: docs/design/harness/L3-functional/gate-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: se, slot_label: "SE - carry contractとgate binding" }
  - { role: qa, slot_label: "QA - 時系列と偽証拠の敵対検証" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-70-left-arm-carry-log.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/left-arm-carry-log.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/process/forward/L07-implementation.md, artifact_type: process_doc }
dependencies:
  parent: docs/plans/PLAN-L6-69-triage-decision-integrity.md
  requires: [docs/plans/PLAN-L6-69-triage-decision-integrity.md]
---

# PLAN-L6-70: 左腕差し戻しcarry log設計

## 1. 完了条件

- 差し戻しmapping、resolution Vペア、gate再通過、review時系列をL6/L8で凍結する。
- no-pushback自己申告もtechnical reviewへ結合する。
