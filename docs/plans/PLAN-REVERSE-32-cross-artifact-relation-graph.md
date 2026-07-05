---
plan_id: PLAN-REVERSE-32-cross-artifact-relation-graph
title: "PLAN-REVERSE-32 (reverse): cross-artifact relation graph fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-11
owner: Codex TL / PO
forward_routing: L5
promotion_strategy: reuse-as-is
agent_slots:
  - role: tl
    slot_label: "TL - relation graph fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-32-cross-artifact-relation-graph.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
  requires:
    - docs/plans/PLAN-L6-31-cross-artifact-relation-graph.md
    - docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
    - docs/plans/PLAN-L7-36-relation-graph-export.md
---

# PLAN-REVERSE-32（reverse）: 成果物間 relation graph fullback

## §0 位置づけ

将来の A-124 / A-125 relation graph 実装に対応する Reverse pairing。L6/L7 実装が実際に着地するまでは、この PLAN は draft として扱う。

## §1 R0 証跡

L7 後に期待する証跡:

- relation graph の pure function と test。
- impact / export / evidence projection の CLI smoke 出力。
- graph と verification profile の DB projection row contract。
- 新たに発見された requirements または workflow rule。

## §2 R1 観測 gap

抽出を想定する gap:

- changed-file impact に新しい FR / AC が必要か。
- diagram export が新しい acceptance artifact を追加するか。
- DB collector/rebuild に追加の migration または doctor rule が必要か。

## §3 R2 整合

Forward 実装は次と整合する必要がある:

- requirements §6.8.8 / §6.8.9 / §6.8.10;
- physical-data §9.5 / §9.6;
- ADR-002 A-124 / A-125;
- IMP-118..125.

## §4 R3 / R4

2026-06-11 時点で、分割された relation graph 範囲の L7 実装証跡が存在する:

- PLAN-L7-32: relation graph collection と impact expansion について、U-RELGRAPH-001..006 は green。
- PLAN-L7-36: deterministic Mermaid export、利用不能な DOT/D2 adapter finding、A-125 verification evidence projection について、U-RELGRAPH-007..010 は green。
- Backprop decision: lower-layer requirements / physical-data / ADR の意味変更は発見されていない。DB write path と external adapter execution は、この L7 範囲では引き続き scope 外。
- Recovery-03 recurrence check: 実装は承認済み PLAN files と source/test owners の範囲内に収まり、`vendor/helix-source/` は編集していない。

R4 fullback outcome: Forward L7 relation graph 実装はこの Reverse plan へ back merge 済みであり、追加の governance/backlog 追加は不要。

## §8 DoD

- [x] L7 実装証跡が存在する。
- [x] 新しい lower-layer discovery は `backprop_decision` で分類済み。
- [x] 実装が意味を変更していないため、Requirements / physical-data / ADR / backlog は未変更。
- [x] この実装 path では Recovery-03 が再発していない。
