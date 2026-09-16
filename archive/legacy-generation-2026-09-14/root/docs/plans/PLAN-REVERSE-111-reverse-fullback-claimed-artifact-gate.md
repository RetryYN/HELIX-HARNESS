---
plan_id: PLAN-REVERSE-111-reverse-fullback-claimed-artifact-gate
title: "PLAN-REVERSE-111: Reverse fullback claimed artifact gate fullback"
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
    reason: "Requirements define the claimed backprop artifact path gate."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "The governance gate does not change external basic design behavior."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "The governance gate does not change detailed runtime data or module design."
agent_slots:
  - role: tl
    slot_label: "TL - claimed artifact fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-111-reverse-fullback-claimed-artifact-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-111-reverse-fullback-claimed-artifact-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-111-reverse-fullback-claimed-artifact-gate.md
  requires:
    - docs/plans/PLAN-L7-111-reverse-fullback-claimed-artifact-gate.md
---

# PLAN-REVERSE-111: reverse fullback の claimed artifact gate fullback

## R0 証跡

legacy fullback sweep で path-class mismatch pattern が見つかった。PLAN は本文 prose で
artifact を更新したと主張できる一方、frontmatter の `generates` からその artifact が漏れる場合がある。

## R1 観測ギャップ

`PLAN-REVERSE-107` は scope-classification gap を閉じたが、machine はまだ本文中の literal artifact
path claim を確認せずに `generates` を信頼していた。そのため reviewer が本文を読み、特定 artifact が
更新されたと理解しても、database と plan-governance がその artifact を見えない trace hole が残る。

## R2 整合

正しい enforcement point は `plan-governance` である。これは PLAN admissibility invariant だからである。
natural-language design discussion からの false positive を避けるため、この rule は意図的に literal-path
だけを対象にする。

## R3 / R4 結果

新規または更新された R4 fullback PLAN は、本文が backprop artifact path を引用しているのに
`generates` にその path が無い場合、`reverse_fullback_claimed_artifact_missing` で fail する。

## DoD

- [x] Requirements が claimed-artifact invariant を記録している。
- [x] `plan-governance` が negative fixture に対して新しい violation を出す。
- [x] Live PLAN governance lint が通る。
