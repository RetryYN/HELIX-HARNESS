---
plan_id: PLAN-L7-449-durability-boundary-implementation
title: "PLAN-L7-449 (troubleshoot): diagnostic redaction / autonomous-loop durability実装"
kind: troubleshoot
layer: L7
drive: agent
parent_design: docs/design/harness/L6-function-design/durability-boundaries.md
pair_artifact: docs/test-design/harness/L8-durability-boundaries.md
status: draft
route_mode: incident
entry_signals:
  [
    "po_directive:2026-07-13 /goal『バグがあればその場で是正し検出力を強化』に基づくPLAN-L7-445 #29/#30実装slice",
  ]
created: 2026-07-13
updated: 2026-07-13
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-78でL5/L6 contractとL8/L9 Vペアへbackprop済み。"
generates:
  - {
      artifact_path: docs/plans/PLAN-L7-449-durability-boundary-implementation.md,
      artifact_type: markdown_doc,
    }
  - {
      artifact_path: src/runtime/stable-cause-digest.ts,
      artifact_type: source_module,
    }
  - {
      artifact_path: src/orchestration/durable-loop-epoch.ts,
      artifact_type: source_module,
    }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - {
      artifact_path: src/orchestration/loop-store.ts,
      artifact_type: source_module,
    }
  - {
      artifact_path: src/runtime/autonomous-loop-run-receipts.ts,
      artifact_type: source_module,
    }
dependencies:
  { parent: docs/plans/PLAN-L6-78-durability-boundary-design.md, requires: [] }
---

# PLAN-L7-449: durability boundary実装

## 工程表

| Step | 実行     | 内容                          | 完了条件                |
| ---- | -------- | ----------------------------- | ----------------------- |
| 1    | [直列]   | cause digest/doctor mapper    | U-DUR-001..003 green    |
| 2    | [直列]   | exclusive claim/epoch reader  | U-DUR-004..007 green    |
| 3    | [直列]   | receipt surface統合           | corrupt→missing経路0    |
| 4    | [review] | process crash/concurrency検証 | IT-DUR-001..005、High 0 |

## 完了条件

- PLAN-L6-78のDbCと全U/IT oracle、独立review evidenceを満たす。
- legacy stateを明示分類し、corruptをfresh startへ写さない。
