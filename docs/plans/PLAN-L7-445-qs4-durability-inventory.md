---
plan_id: PLAN-L7-445-qs4-durability-inventory
title: "PLAN-L7-445 (troubleshoot): QS4 durability Vペア入口監査"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
route_mode: incident
entry_signals:
  [
    "po_directive:2026-07-13 /goal『抜け漏れを許さず検出力を強化』に基づきPLAN-L7-442 QS4-DURABILITY #29/#30をexact successorへ接続",
  ]
created: 2026-07-13
updated: 2026-07-13
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "現状inventoryとVペア起票境界を確定するresearch。設計変更は後続L5/L6 PLANで判断する。"
agent_slots:
  [
    { role: aim, slot_label: "AIM — durability threat境界" },
    { role: se, slot_label: "SE — redaction/atomic write棚卸し" },
    { role: qa, slot_label: "QA — crash/corruption oracle監査" },
  ]
generates:
  [
    {
      artifact_path: docs/plans/PLAN-L7-445-qs4-durability-inventory.md,
      artifact_type: markdown_doc,
    },
  ]
dependencies:
  {
    parent: docs/plans/PLAN-L7-442-quality-sweep-successor-clusters.md,
    requires: [],
  }
review_evidence:
  - reviewer: qs4_445_atomic_loop_final
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-13T06:42:28+09:00"
    tests_green_at: "2026-07-13T06:41:55+09:00"
    verdict: pass
    scope: "QS4 #29/#30のinventory、PLAN-L6-78/PLAN-L7-449 exact successor、L5/L6↔L8/L9 Vペア、redaction/corrupt/process crash/recovery oracleを確認。PLAN-L7-449 final reviewでBlocker/High 0、IT-DUR-001..005 PASS。"
    worker_model: codex
    reviewer_model: codex-fresh-subagent
    green_commands:
      - kind: integration_test
        command: "npx --no-install vitest run tests/doctor-cause-digest.test.ts tests/doctor-cause-digest-contract.test.ts tests/loop-store-durability.test.ts tests/loop-store-durability-node.test.ts tests/durable-loop-store.test.ts tests/durable-loop-process.test.ts tests/autonomous-loop-run-receipts.test.ts tests/orchestration/loop-bridge.test.ts tests/harness-check-workflow.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-13T06:41:55+09:00"
        evidence_path: tests/durable-loop-process.test.ts
        output_digest: "sha256:7e9abd94a0a448c376b11f64b65472f7995672d07198f6a2d0f66736de12e03c"
---

# PLAN-L7-445: QS4 durability Vペア入口監査

## 工程表

| Step | 実行     | 内容                                                | 完了条件                                |
| ---- | -------- | --------------------------------------------------- | --------------------------------------- |
| 1    | [直列]   | #29 redacted cause digestの全writer/read pathを測定 | raw path/secret流出点と既存oracle一覧   |
| 2    | [直列]   | #30 atomic state writeとcorrupt≠missing分岐を測定   | crash windowとrecovery route一覧        |
| 3    | [直列]   | L5/L6 design PLANとL8/L9 pairを起票                 | exact PLAN ID、parent、pair、oracle固定 |
| 4    | [review] | 独立reviewerがorphan 0を確認                        | Blocker/High 0                          |

## 完了条件

- #29/#30がexact design/impl PLANへ接続される。
- secret/path redaction、partial write、fsync/rename、corrupt recoveryのnegative oracleがある。

## inventory結果とexact successor

| QS4 | 実装観測                                                                                     | exact successor                          | Vペア                                                                                     |
| --- | -------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| #29 | `src/doctor/index.ts`のcause消失/raw文字列化                                                 | design `PLAN-L6-78` / impl `PLAN-L7-449` | `L6-function-design/durability-boundaries.md` ↔ `L8-durability-boundaries.md`             |
| #30 | `loop-store.ts`と`autonomous-loop-run-receipts.ts`のcorrupt→missing、direct/whole-file write | design `PLAN-L6-78` / impl `PLAN-L7-449` | `L5-detailed-design/durability-boundaries.md` ↔ `L9-durability-boundaries-integration.md` |

successorは診断redactionとloop epoch durabilityを別contractとして保持し、共通atomic file primitiveだけを共有する。
