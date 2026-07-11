---
plan_id: PLAN-L6-69-triage-decision-integrity
title: "PLAN-L6-69 (add-design): triage判断整合性"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 I4/I7の判断を機械固定"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存triage判断を具体化し上位要求は変更しない。"
parent_design: docs/design/harness/L3-functional/gate-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: se, slot_label: "SE - triage判断契約" }
  - { role: qa, slot_label: "QA - 同時縮退敵対検証" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-69-triage-decision-integrity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/triage-decision-integrity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/system-review-triage-decisions.yaml, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L6-68-active-plan-selection.md
  requires: [docs/plans/PLAN-L6-68-active-plan-selection.md]
---

# PLAN-L6-69: triage判断整合性設計

## 1. 目的

PLAN-L7-425 I4/I7の判断を、独立pinを持つfail-close契約へ落とす。

## 2. 完了条件

- L6契約とL8 oracleがVペアを作る。
- catalog 3件、system保留、backlog 14件、IMP-118残差、未列挙10件を網羅する。
