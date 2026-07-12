---
plan_id: PLAN-L6-78-durability-boundary-design
title: "PLAN-L6-78 (add-design): diagnostic redaction / autonomous-loop durability Vペア設計"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "PLAN-L7-445 inventoryでQS4 #29/#30の実装上の反例を確認"
created: 2026-07-13
updated: 2026-07-13
owner: Codex / TL
backprop_decision: not_required
backprop_decision_reason: "既存doctor/loop contractのfail-close化でありL0-L4 capability境界を変更しない。"
pair_artifact: docs/test-design/harness/L8-durability-boundaries.md
generates:
  - {
      artifact_path: docs/plans/PLAN-L6-78-durability-boundary-design.md,
      artifact_type: markdown_doc,
    }
  - {
      artifact_path: docs/design/harness/L5-detailed-design/durability-boundaries.md,
      artifact_type: design_doc,
    }
  - {
      artifact_path: docs/design/harness/L6-function-design/durability-boundaries.md,
      artifact_type: design_doc,
    }
  - {
      artifact_path: docs/test-design/harness/L8-durability-boundaries.md,
      artifact_type: test_design,
    }
  - {
      artifact_path: docs/test-design/harness/L9-durability-boundaries-integration.md,
      artifact_type: test_design,
    }
dependencies:
  parent: docs/plans/PLAN-L7-445-qs4-durability-inventory.md
  requires: []
---

# PLAN-L6-78: diagnostic redaction / autonomous-loop durability Vペア設計

## 工程表

| Step | 実行     | 内容                                                  | 完了条件                                       |
| ---- | -------- | ----------------------------------------------------- | ---------------------------------------------- |
| 1    | [直列]   | L5 threat/crash modelをfreeze                         | secret/path leakとC0-C6 crash windowが分類済み |
| 2    | [直列]   | L6 cause digest / epoch commit / recovery DbCをfreeze | signature、pre/post/invariantが確定            |
| 3    | [直列]   | L8 unit / L9 process oracleをreverse trace            | U/IT ID孤児0                                   |
| 4    | [review] | 独立reviewerが設計と反例を敵対監査                    | Blocker/High 0                                 |

## 完了条件

- doctor failureはraw例外を出力・保存せず、bounded digestと有限cause kindを残す。
- loop stateのmissing/corrupt/uncommitted/committedを区別し、曖昧な外部side effectを自動再実行しない。
- partial write、SIGKILL、同時writer、tamper/corruptionをL8/L9 oracleで検出する。
