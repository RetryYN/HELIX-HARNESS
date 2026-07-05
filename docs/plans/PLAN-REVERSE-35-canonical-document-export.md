---
plan_id: PLAN-REVERSE-35-canonical-document-export
title: "PLAN-REVERSE-35 (reverse): canonical document export fullback"
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
    slot_label: "TL - canonical document export fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-35-canonical-document-export.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-35-canonical-document-export.md
  requires:
    - docs/plans/PLAN-L6-34-canonical-document-export.md
    - docs/plans/PLAN-L7-35-canonical-document-export.md
---

# PLAN-REVERSE-35 (reverse): canonical document export fullback 逆流計画

## §0 位置づけ

将来の PLAN-L7-35 実装に対応する Reverse pair。この PLAN は、source implementation が存在するまでは draft のままとする。

## §1 R0 証跡

L7 後に期待する証跡:

- concept、requirements、detailed design、PLAN、ADR、test-design fixture に対する parser output;
- CSV/Markdown built-in render の証跡;
- optional XLSX/PPTX/D2 renderer の readiness findings;
- source snapshot hash と generated artifact metadata;
- export command が追加された場合の CLI smoke output。

## §2 R1 観測された Gap

分類すべき想定 gap:

- requirements §6.8.11 に追加の document family が必要か;
- physical-data §9.7 に projection column の追加が必要か;
- ADR-002 A-126 で document import と document export を区別する必要があるか;
- workflow docs に stale generated Office files へのより厳格なルールが必要か。

## §3 R2 整合

Forward implementation は次と整合しなければならない:

- requirements §6.8.11;
- physical-data §9.7;
- ADR-002 A-126;
- A-126 research memo;
- IMP-126.

## §4 R3 / R4

2026-06-11 時点で、canonical document export の L7 implementation evidence は存在する:

- PLAN-L7-35: U-DOCEXPORT-001..012 は、canonical document parsing、deterministic datasets、built-in CSV/Markdown rendering、optional renderer readiness findings、normalized projection rows、derived-artifact boundary、stale source snapshot detection について green。
- Backprop decision: lower-layer requirements / physical-data / ADR の意味変更は発見されなかった。generated Office/spreadsheet/deck outputs は derived artifacts のままとする。
- Safety boundary: package installation、external Office renderer invocation、canonical doc mutation、generated artifact gate truth は導入しない。

R4 fullback outcome: Forward L7 canonical document export implementation はこの Reverse plan へ merge back 済みであり、追加の governance/backlog additions は不要。

## §8 DoD

- [x] L7 implementation evidence が存在する。
- [x] 新しい lower-layer discoveries は `backprop_decision` で分類済み。
- [x] implementation が意味を変更しなかったため、Requirements / physical-data / ADR / backlog は未変更。
- [x] Generated Office/spreadsheet files は derived artifacts のままであり、canonical docs を置き換えない。
