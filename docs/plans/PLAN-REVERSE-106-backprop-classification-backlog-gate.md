---
plan_id: PLAN-REVERSE-106-backprop-classification-backlog-gate
title: "PLAN-REVERSE-106: backprop classification backlog gate の fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: db
status: confirmed
created: 2026-06-22
updated: 2026-06-22
owner: Codex
forward_routing: L5
promotion_strategy: reuse-as-is
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "Requirements は backlog backprop classification gate を定義する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "governance gate は外部 runtime function design を変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "governance gate は詳細な runtime data や module design を変更しない。"
agent_slots:
  - role: tl
    slot_label: "TL - backlog backprop classification fullback レビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-106-backprop-classification-backlog-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-106-backprop-classification-backlog-gate.md
  requires:
    - docs/plans/PLAN-L7-106-backprop-classification-backlog-gate.md
---

# PLAN-REVERSE-106: backprop classification backlog gate の fullback

## R0 証跡

Requirements §6.8.8 は、lower-layer Reverse back-propagation decision を分類する
6 つの field を定義していたが、`improvement-backlog` lint は row shape と enum
values だけを確認していた。

## R1 観測された gap

backlog row は lower-layer back-propagation に触れつつ、machine-readable decision
を省略できた。その状態では、database red/yellow/green work が可視化すべき failure
mode がそのまま残る。item は見えているが、recovery や upstream routing state を
query できない。

## R2 整合

backlog lint は現在、明示的な lower-layer/backprop row に次を必須として扱う。
`backprop_decision`, `reverse_type`, `target_layer`, `upstream_docs`,
`evidence_path`, and `closure_status`.

## R3 / R4 結果

Requirements はこの check を future work として扱わない。IMP-117 には classification
values を backfill 済みであり、今後一致する row がそれらを省略した場合、doctor は
hard-fail する。

## DoD

- [x] Requirements は現在の doctor hard gate を記載している。
- [x] IMP-117 は必須の machine-readable classification fields を含む。
- [x] Regression tests は lower-layer backprop row の欠落ケースと完全ケースを cover する。
