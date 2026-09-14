---
plan_id: PLAN-REVERSE-112-reverse-r4-claimed-artifact-gate
title: "PLAN-REVERSE-112: Reverse R4 claimed artifact gate fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
forward_routing: L5
promotion_strategy: reuse-as-is
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "Requirements define the non-fullback Reverse R4 claimed artifact gate."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "The governance gate does not change external basic design behavior."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "The governance gate does not change detailed runtime data or module design."
agent_slots:
  - role: tl
    slot_label: "TL - Reverse R4 claimed artifact fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-112-reverse-r4-claimed-artifact-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-112-reverse-r4-claimed-artifact-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/reverse-fullback-backprop-audit-2026-06-22.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-112-reverse-r4-claimed-artifact-gate.md
  requires:
    - docs/plans/PLAN-L7-112-reverse-r4-claimed-artifact-gate.md
---

# PLAN-REVERSE-112: Reverse R4 の claimed artifact gate fullback 対応

## R0 証跡

fullback 専用の sweep では、design-return trace drift の別分類を取りこぼしていた。
non-fullback R4 Reverse PLAN は、本文で upstream artifact path を参照しながら、
その path を `generates` に含めない状態を作れる。

## R1 観測した不整合

既存の `reverse_fullback_claimed_artifact_missing` rule は
`confirmed_reverse_type=fullback` だけを対象にしていた。そのため `design`、`code`、
`normalization` の Reverse PLAN は、同じ literal path consistency check の外側に残っていた。

## R2 整合

この invariant は R4 Reverse routing に共通する。PLAN 本文が upstream artifact path を
design/governance/test-design の return path の一部として示す場合、frontmatter は
database projection と review のためにその artifact を公開しなければならない。

## R3 / R4 結果

新規または更新された non-fullback R4 Reverse PLAN は、本文で参照した upstream artifact path が
`generates` に無い場合、`reverse_r4_claimed_artifact_missing` で失敗する。legacy case は
`docs/governance/reverse-fullback-backprop-audit-2026-06-22.md` に引き続き列挙する。

## DoD

- [x] Requirements に non-fullback R4 claimed-artifact invariant を記録した。
- [x] Audit に legacy non-fullback R4 claimed-artifact debt を記録した。
- [x] negative fixture に対して `plan-governance` が新しい violation を出す。
- [x] live PLAN governance lint が通る。
