---
plan_id: PLAN-REVERSE-34-tool-adapter-probes
title: "PLAN-REVERSE-34 (reverse): graph / diagram tool adapter probe の fullback"
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
    slot_label: "TL - tool adapter probe fullback 確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-34-tool-adapter-probes.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-34-tool-adapter-probes.md
  requires:
    - docs/plans/PLAN-L6-33-tool-adapter-probes.md
    - docs/plans/PLAN-L7-34-tool-adapter-probes.md
---

# PLAN-REVERSE-34 (reverse): graph / diagram tool adapter probe の fullback

## §0 位置づけ

将来の PLAN-L7-34 implementation に対応する Reverse pairing として扱う。
この PLAN は source implementation が存在するまで draft のまま保持する。

## §1 証跡

L7 後の expected evidence は、adapter catalog rows、package/executable readiness findings、
normalized tool run rows、diagram stale detection、command が追加された場合の CLI smoke を含む。

## §2 整合

Implementation は requirements §6.8.9、physical-data §9.5、ADR-002 A-124、
A-124 research memo、IMP-120 と整合する必要がある。

## §8 DoD

2026-06-11 時点で tool adapter probes の L7 implementation evidence は存在する。

- PLAN-L7-34: adapter catalog、readiness findings、workspace scope refusal、normalized tool-run/dependency/finding rows、stale diagram refresh planning について U-TOOLADAPTER-001..010 が green。
- Backprop decision: lower-layer requirements / physical-data / ADR の意味変更は検出されていない。adapters は insight-only のままとし、normalized projection rows を gate-consumable boundary として維持する。
- Safety boundary: package installation、external command execution、destructive auto-fix、raw adapter output を gate truth として扱う変更は導入しない。

- [x] L7 implementation evidence が存在する。
- [x] normalization 前の adapter output を gate truth として扱わない。
- [x] missing external tooling は implicit install ではなく finding として扱う。
