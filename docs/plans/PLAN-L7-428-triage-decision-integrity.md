---
plan_id: PLAN-L7-428-triage-decision-integrity
title: "PLAN-L7-428 (impl): triage判断整合性検出器"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 I4/I7のfalse completion防止"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "L6 triage判断契約を実装へ降下する。"
parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-001, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-002, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-003, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-004, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-005, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-006, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-007, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-008, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-009, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-010, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-011, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-012, test_path: tests/slow/doctor.test.ts }
agent_slots:
  - { role: se, slot_label: "SE - analyzerとdoctor配線" }
  - { role: qa, slot_label: "QA - adversarial fixture" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-428-triage-decision-integrity.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/triage-decision-integrity.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/triage-decision-integrity.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-69-triage-decision-integrity.md
  requires: [docs/plans/PLAN-L6-69-triage-decision-integrity.md]
---

# PLAN-L7-428 triage判断整合性検出器実装

## 1. 目的

triage判断manifestと実sourceを突合し、doctor hard gateへ接続する。

## 2. 実装範囲

- strict loader/analyzer/message
- 独立期待集合pin
- adversarial unit testsとreal repository test
- doctor hard gate wiring

## 3. 完了条件

`U-TRIAGE-001..012`と全体回帰がgreen、独立reviewのblocker/highが0。
