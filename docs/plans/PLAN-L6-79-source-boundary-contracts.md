---
plan_id: PLAN-L6-79-source-boundary-contracts
title: "PLAN-L6-79 (add-design): source boundary contracts"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-13 PLAN-L5-79のownership/effect architectureをDbCとL8 negative oracleへ具体化"
created: 2026-07-13
updated: 2026-07-13
owner: Codex / TL
backprop_decision: not_required
backprop_decision_reason: "PLAN-L5-79を変更せず、公開contractとpolicy evaluatorを具体化する。"
pair_artifact: docs/test-design/harness/L8-source-boundary-contracts.md
agent_slots:
  - { role: aim, slot_label: "AIM — contractとpolicy DbC" }
  - { role: se, slot_label: "SE — DTO/projector/probe receipt API" }
  - { role: qa, slot_label: "QA — direction/effect/policy負例" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-79-source-boundary-contracts.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/source-boundary-contracts.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-source-boundary-contracts.md, artifact_type: test_design }
  - { artifact_path: tests/source-boundary-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L5-79-source-boundary-architecture.md
  requires: []
---

# PLAN-L6-79: source boundary contract設計

## 工程表

| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [直列] | DTO/projector/effect receipt/policy evaluator DbCをfreeze | signature/pre/post/invariant確定 |
| 2 | [直列] | L8 negative oracleをreverse trace | contract ID孤児0 |
| 3 | [review] | 別runtime/modelがfail-close境界を監査 | Blocker/High 0 |

## 完了条件

- analyzerからwrite/child-process authorityへ直接到達できない。
- type-only edgeもarchitecture edgeとして判定する。
- missing/EMPTY/new module policyをgreenへ縮退しない。
