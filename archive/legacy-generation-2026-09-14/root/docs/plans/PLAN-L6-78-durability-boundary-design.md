---
plan_id: PLAN-L6-78-durability-boundary-design
title: "PLAN-L6-78 (add-design): diagnostic redaction / autonomous-loop durability Vペア設計"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-13 /goal『設計とテスト設計/検証設計でVペアを作る』に基づきPLAN-L7-445 inventoryでQS4 #29/#30の実装反例を確認"
created: 2026-07-13
updated: 2026-07-13
owner: Codex / TL
agent_slots:
  - { role: aim, slot_label: "AIM — durability threatと権限境界" }
  - { role: se, slot_label: "SE — redaction/epoch transaction DbC" }
  - { role: qa, slot_label: "QA — crash/corruption Vペア監査" }
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
review_evidence:
  - reviewer: audit_442_successors
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-13T06:42:28+09:00"
    tests_green_at: "2026-07-13T06:41:55+09:00"
    verdict: pass
    scope: "L5/L6とL8/L9のC5/C6、claim release durability、9-state read model、side-effect gate、stale claim recoveryを独立再監査しBlocker/High 0。"
    worker_model: codex
    reviewer_model: codex-fresh-subagent
    green_commands:
      - kind: integration_test
        command: "bun run test:fast -- tests/doctor-cause-digest.test.ts tests/doctor-cause-digest-contract.test.ts tests/loop-store-durability.test.ts tests/loop-store-durability-node.test.ts tests/durable-loop-store.test.ts tests/durable-loop-process.test.ts tests/autonomous-loop-run-receipts.test.ts tests/orchestration/loop-bridge.test.ts tests/harness-check-workflow.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-13T06:41:55+09:00"
        evidence_path: tests/durable-loop-process.test.ts
        output_digest: "sha256:fd5d1ae7c2294a5d7a5b75ab680d1511907938c96606b8eeba32ac9f5b1b4c87"
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
