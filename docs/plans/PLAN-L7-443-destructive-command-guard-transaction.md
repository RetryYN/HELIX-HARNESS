---
plan_id: PLAN-L7-443-destructive-command-guard-transaction
title: "PLAN-L7-443 (troubleshoot): 破壊的 command guard transaction強化"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-13 PLAN-L7-442 QS4-GUARD annex #18/#20/#32 の敵対監査でgrammar残差、未分類destructive operation、audit失敗後allowを確認"
created: 2026-07-13
updated: 2026-07-13
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存L6のsilent bypass禁止をL5 threat model、L6 atomic nonce transaction、L8 fault oracle、L9 integration crash matrixへ具体化した。"
generates:
  - { artifact_path: docs/plans/PLAN-L7-443-destructive-command-guard-transaction.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L5-detailed-design/destructive-command-guard.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/destructive-command-guard.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-destructive-command-guard.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/harness/L9-destructive-command-guard-integration.md, artifact_type: test_design }
  - { artifact_path: src/runtime/guard-override-transaction.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/git-command-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/work-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: .claude/hooks/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: tests/git-command-guard.test.ts, artifact_type: test_code }
  - { artifact_path: tests/hook-contract.test.ts, artifact_type: test_code }
  - { artifact_path: tests/guard-override-transaction.test.ts, artifact_type: test_code }
  - { artifact_path: tests/work-guard.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-442-quality-sweep-successor-clusters.md
  requires: []
review_evidence:
  - reviewer: review_443_round9
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-13T03:49:00+09:00"
    tests_green_at: "2026-07-13T03:49:00+09:00"
    verdict: pass
    scope: "L5/L6/L8/L9、guard実装、SQLite retry/CAS/crash/adapter/redactionを再審査しBlocker/High 0。別provider receipt基盤の欠陥はPLAN-L7-444へ責務分離し、本technical reviewをcross-runtime reviewと称さない。"
    worker_model: codex
    reviewer_model: codex-fresh-subagent
  - reviewer: codex-fresh-cas-stress
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-13T03:12:00+09:00"
    tests_green_at: "2026-07-13T03:12:00+09:00"
    verdict: pass
    scope: "U-GITGUARD-008/IT-GITGUARD-001のbarrier付き2-process CASを30回反復し、各回allow 1/block 1/敗者blocked_reuse/DB row 1を確認。cross-runtime terminal reviewの代替にはしない。"
    worker_model: codex
    reviewer_model: codex-fresh-subagent
    green_commands:
      - kind: integration_test
        command: "for i in $(seq 1 30); do bunx vitest run tests/git-command-guard.test.ts -t 'allows at most one of two competing processes' >/dev/null || exit 1; done; echo CAS_STRESS_GREEN=30"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-13T03:12:00+09:00"
        evidence_path: tests/git-command-guard.test.ts
        output_digest: "sha256:6b3f8c70c5eb7093d8f2dbbfb6cc5591630079783ad9c44e0c9ea9aa66480d2f"
agent_slots:
  - { role: aim, slot_label: "AIM — troubleshoot分類と既存guard契約の維持を監査" }
  - { role: se, slot_label: "SE — taxonomyと共通transaction実装" }
  - { role: qa, slot_label: "QA — grammar property/failure injection/adapter parity敵対検証" }
---

# PLAN-L7-443: 破壊的 command guard transaction強化

## 工程表

| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [直列] | `U-GITGUARD-003/004`をred化しtaxonomyとgrammarを実装 | destructive変形block、safe fence green |
| 2 | [直列] | `U-GITGUARD-005/006`をred化し共通transactionを実装 | audit/consume failureが全てblock |
| 3 | [直列] | dev/work/CLI/consumer adapterを共通primitiveへ移行 | parity oracle green |
| 4 | [review] | threat modelとfailure順序を独立監査し、別runtime receipt gapは専用PLANへ分離 | Blocker/High 0、green evidence記録、PLAN-L7-444接続 |

## 完了条件

- force clean、branch force delete、stash drop/clearと同値shell変形をblockする。
- audit commitとmarker consumeの双方が成功した呼出しだけallowする。
- audit/consume/crash/retry failureで二重allowせず、secret/pathを監査へ漏らさない。
- auditとnonce reservationを`harness.db.guard_override_transactions`の単一transactionへcommitし、JSONL/nonce sidecarを正本にしない。
- `U-GITGUARD-003..009` / `IT-GITGUARD-001..004`、typecheck、hook contract、doctor gateがgreenである。
