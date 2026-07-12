---
plan_id: PLAN-L6-77-destructive-command-guard-design
title: "PLAN-L6-77 (design): 破壊的command guard transaction Vペア設計"
kind: design
layer: L6
drive: agent
status: confirmed
entry_signals:
  - "po_directive:2026-07-13 /goal『設計とテスト設計/検証設計でVペアを作る』に基づきPLAN-L7-443のL6 owner欠落を是正"
created: 2026-07-13
updated: 2026-07-13
owner: Codex / TL
backprop_decision: not_required
backprop_decision_reason: "L5 threat model、L6 transaction contract、L8/L9 oracleを既存要求のsilent bypass禁止へ接続する設計是正。"
pair_artifact: docs/test-design/harness/L8-destructive-command-guard.md
generates:
  - { artifact_path: docs/plans/PLAN-L6-77-destructive-command-guard-design.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L5-detailed-design/destructive-command-guard.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/destructive-command-guard.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-destructive-command-guard.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/harness/L9-destructive-command-guard-integration.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L7-442-quality-sweep-successor-clusters.md
  requires: []
review_evidence:
  - reviewer: review_443_round9
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-13T03:49:00+09:00"
    tests_green_at: "2026-07-13T03:54:25+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-fresh-subagent
    scope: "L5/L6のthreat model・atomic transaction・bounded retryとL8/L9 negative oracleを独立再審査しBlocker/High 0。"
    green_commands:
      - kind: regression_test
        command: "bunx vitest run tests/guard-override-transaction.test.ts tests/work-guard.test.ts tests/hook-contract.test.ts --reporter=dot"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-13T03:54:25+09:00"
        evidence_path: tests/guard-override-transaction.test.ts
        output_digest: "sha256:0b17b75c762180b6c0287fb04324f48fa57fc5c55efb3e8483469ef276c168a4"
---

# PLAN-L6-77: 破壊的command guard transaction Vペア設計

## 工程表

| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [直列] | L5 threat modelとdestructive taxonomyをfreeze | safe/destructive/indeterminate境界が明示 |
| 2 | [直列] | L6 audit/nonce/consume transaction DbCをfreeze | pre/post/invariantとfailure順序が確定 |
| 3 | [直列] | L8 unit/L9 integration oracleをreverse trace | U/IT ID孤児0 |
| 4 | [review] | 独立reviewerがVペアを敵対監査 | Blocker/High 0、green command証跡 |

## 完了条件

- L6公開signatureごとにpre/post/invariant/oracleがある。
- L8/L9がbusy/lock/crash/CAS/adapter/redactionをnegative oracleで検出する。
- L7実装PLANは本PLANをparentとして参照する。
