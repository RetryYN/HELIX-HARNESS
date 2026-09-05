---
title: "Execution Ticket利用要求の受入候補"
layer: L11
canonical_layer: L11
canonical_pair: L2
canonical_vmodel: L1-L12
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
related_issue: 1534
plan: PLAN-L3-88-execution-ticket-bench-authority
pair_artifact: docs/governance/candidates/execution-ticket-requests.md
---

# 利用要求の受入候補

| 要求 | 利用時の検証 |
|---|---|
| HXT-RQ-01 | provider交代・retry後も同じ仕事と異なる試行を追跡できる |
| HXT-RQ-02 | 成功・拒否・失敗・未実行の母数を利用者が区別できる |
| HXT-RQ-03 | 同一条件比較と比較不能を説明でき、共通oracleで採点できる |
| HXT-RQ-04 | 許可のない追加実験は起動せず、有限予算で通常laneを保護する |
| HXT-RQ-05 | 劣化を既存ownerへ根拠付きで返し、Benchが直接配車しない |
| HXT-RQ-06 | 旧task snapshotで既存Benchを継続し、切替scopeだけTicketを要求する |
| HXT-RQ-07 | 意味承認・危険操作承認と、委譲済みpolicy内の実行順選択を区別する |

このsliceはブラウザUIを追加しない。L2非UIのN/A receiptはfreeze時に対象HEAD・理由・再評価条件を記録する。ここで実行済みreceiptを発明しない。
