---
plan_id: PLAN-L7-428
title: triage判断整合性検出器実装
kind: impl
status: draft
parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
generates:
  source_module:
    - src/lint/triage-decision-integrity.ts
  test_code:
    - tests/triage-decision-integrity.test.ts
verification_bindings:
  - parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md
    pair_artifact: docs/test-design/harness/L8-unit-test-design.md
    oracle_id: U-TRIAGE-001
    test_path: tests/triage-decision-integrity.test.ts
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
