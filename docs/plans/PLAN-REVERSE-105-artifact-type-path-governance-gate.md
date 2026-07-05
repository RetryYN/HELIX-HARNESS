---
plan_id: PLAN-REVERSE-105-artifact-type-path-governance-gate
title: "PLAN-REVERSE-105: artifact path/type governance gate の fullback"
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
    reason: "要件定義は artifact path/type governance gate を定義している。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "governance gate は外部 runtime 機能設計を変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "governance gate は runtime data や module の詳細設計を変更しない。"
agent_slots:
  - role: tl
    slot_label: "TL - artifact path/type fullback レビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-105-artifact-type-path-governance-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-105-artifact-type-path-governance-gate.md
  requires:
    - docs/plans/PLAN-L7-105-artifact-type-path-governance-gate.md
---

# PLAN-REVERSE-105: artifact path/type governance gate の fullback

## R0 証跡

要件定義はすでに `artifact_path x artifact_type` の整合性を定義していたが、
有効な validator は `artifact_type` enum だけを強制していた。そのため PLAN は、
design または test-design artifact を generic な markdown file として登録できていた。

## R1 観測したギャップ

この pattern では generated artifact 自体は存在する一方、database と review gate がそれを
design、test-design、PLAN evidence のいずれかへ確実に分類できない。そのため Reverse と
add-impl の traceability が弱くなる。

## R2 整合

`plan-governance` は、現在指定済みの path である `docs/design/`、`docs/test-design/`、
`docs/plans/` から期待される type を導出する。この gate は明示された要件 path に限定し、
source や runtime artifact naming へ過剰に踏み込まない。

## R3 / R4 結果

要件定義は path/type validation を future work として扱わない。mismatch は
`artifact_type_mismatch` で fail し、regression test は design、test-design、PLAN の
path class を cover する。

## DoD

- [x] 要件定義は path/type mismatch を現行の fail-close rule として記述している。
- [x] PLAN governance は `artifact_type_mismatch` を出力する。
- [x] Regression test は design、test-design、PLAN path mismatch を cover している。
