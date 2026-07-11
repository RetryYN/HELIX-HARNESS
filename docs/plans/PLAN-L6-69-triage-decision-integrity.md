---
plan_id: PLAN-L6-69
title: triage判断整合性設計
kind: design
status: draft
parent_design: docs/design/harness/L3-functional/gate-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
generates:
  design_doc:
    - docs/design/harness/L6-function-design/triage-decision-integrity.md
---

# PLAN-L6-69 triage判断整合性設計

## 1. 目的

PLAN-L7-425 I4/I7の判断を、独立pinを持つfail-close契約へ落とす。

## 2. 完了条件

- L6契約とL8 oracleがVペアを作る。
- catalog 3件、system保留、backlog 14件、IMP-118残差、未列挙10件を網羅する。
