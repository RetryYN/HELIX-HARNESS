---
plan_id: PLAN-REVERSE-104-conditional-backfill-decision-gate
title: "PLAN-REVERSE-104: conditional backfill decision gate の fullback"
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
    reason: "Requirements が conditional backfill decision gate を定義する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "governance gate は外部 runtime function design を変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "governance gate は詳細 runtime data や module design を変更しない。"
agent_slots:
  - role: tl
    slot_label: "TL - conditional backfill rule review の確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-104-conditional-backfill-decision-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/conditional-backfill-decision-audit-2026-06-22.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-104-conditional-backfill-decision-gate.md
  requires:
    - docs/plans/PLAN-L7-104-conditional-backfill-decision-gate.md
---

# PLAN-REVERSE-104: conditional backfill decision gate の fullback

## R0 証跡

`backfill-pairing` は、`refactor`、`retrofit`、`troubleshoot` が contract または behavior を変更する場合に
Reverse が必要になり得ることを既に認識していた。ただし note を出すだけで、`ok=true` のままにしていた。

## R1 観測された gap

repository には、Reverse link または machine-readable な no-backprop decision を持たない active な
conditional-kind PLAN が 26 件あった。そのため、明示的な `add-impl` と R4 fullback path の外側で、
同種の design backprop 漏れが起こり得る状態だった。

## R2 整合

既存 entry は legacy debt として扱い、governance audit table に記録する。新規または更新された
conditional-kind PLAN は、Reverse で back-fill するか、具体的な no-backprop decision を宣言しなければならない。

## R3 / R4 結果

Requirements は conditional backfill decision gate を定義済みである。`backfill-pairing` は remediation 用の
legacy debt baseline を保持しながら、`conditionalDecisionMissing` でこの gate を強制する。

## DoD

- [x] Requirements が conditional-kind no-backprop decision contract を定義する。
- [x] legacy conditional gap が audit artifact に列挙されている。
- [x] regression test は、Reverse または no-backprop decision を持たない新規 conditional PLAN を失敗させる。
- [x] regression test は、明示的な no-backprop decision を受け入れる。
