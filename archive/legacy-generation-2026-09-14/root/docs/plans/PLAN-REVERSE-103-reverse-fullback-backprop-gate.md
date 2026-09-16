---
plan_id: PLAN-REVERSE-103-reverse-fullback-backprop-gate
title: "PLAN-REVERSE-103: Reverse fullback backprop gate の fullback 記録"
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
    reason: "Requirements が Reverse fullback backprop gate を定義する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "governance gate は external runtime function design を変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "governance gate は detailed runtime data や module design を変更しない。"
agent_slots:
  - role: tl
    slot_label: "TL - Reverse fullback backprop rule のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-103-reverse-fullback-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/reverse-fullback-backprop-audit-2026-06-22.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-103-reverse-fullback-backprop-gate.md
  requires:
    - docs/plans/PLAN-L7-103-reverse-fullback-backprop-gate.md
---

# PLAN-REVERSE-103: Reverse fullback backprop gate の fullback 記録

## R0 証跡

この repository には、design/governance/test-design artifact を生成していない confirmed R4 fullback
PLAN が存在していた。複数の古い PLAN は L1/L3/L4/L5 backfill が行われたと記述しているが、
machine-readable frontmatter だけでは対象 artifact を証明できない。

## R1 観測された gap

`plan-governance` は R4 field の存在を検査していたが、fullback が実際に更新された artifact へ
戻って指すべきという core invariant は強制していなかった。

## R2 整合方針

この rule は 2026-06-22 以降の前向き適用とする。古い gap は legacy debt として記録する。
全 historical Reverse PLAN を遡及的に fail させると、各 old PLAN を分類する前に無関係な current work を
block してしまうためである。

## R3 / R4 結果

Requirements は、confirmed/completed R4 fullback PLAN が少なくとも 1 つの `docs/design/`、
`docs/governance/`、または `docs/test-design/` artifact を生成しなければならない、と明記した。
`plan-governance` は new/updated fullback PLAN に対し、`reverse_fullback_backprop_missing` でこれを強制する。

## DoD（完了条件）

- [x] Requirements が fullback backprop target invariant を定義している。
- [x] Legacy fullback gap が audit artifact に列挙されている。
- [x] regression test が backprop のない new fullback を fail させる。
- [x] regression test が governance/design/test-design target を持つ new fullback を accept する。
