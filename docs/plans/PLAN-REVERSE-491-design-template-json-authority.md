---
plan_id: PLAN-REVERSE-491-design-template-json-authority
title: "PLAN-REVERSE-491: Design Template JSON authorityの設計逆投影"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-07-31
updated: 2026-07-31
owner: Codex / TL
forward_routing: L4
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    reason: "既存のDesign Template JSON要件を変更せず、実装moduleと設計正本の接着だけを行う。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/architecture.md
    reason: "src/designをpure domain層として登録し、runtimeのcanonical JSON／digest ownerへの依存方向を明示する。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "PLAN-L5-88でfreeze済みの責務、例外、状態遷移を変更しない。"
  - layer: L6-function-design
    decision: not_impacted
    reason: "PLAN-L6-86でfreeze済みの5 pure function契約を変更しない。"
agent_slots:
  - role: tl
    slot_label: "TL — architecture backfillと境界整合"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-491-design-template-json-authority.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-491-design-template-json-authority.md
  requires:
    - docs/plans/PLAN-L7-491-design-template-json-authority.md
  references:
    - docs/plans/PLAN-L7-491-design-template-json-authority.md
review_evidence: []
---

# PLAN-REVERSE-491: Design Template JSON authorityの設計逆投影

## 目的

`PLAN-L7-491`で追加する`src/design`を孤立実装にせず、L4 architectureの構成要素と
module boundary matrixへ逆投影する。新しい要求、機能、writer、永続化責務は追加しない。

## 逆投影結果

- `src/design`はDesign Template JSONを検証するpure domain ownerとする。
- canonical JSONとSHA-256は`src/runtime/digest.ts`の既存ownerを再利用する。
- 許可方向は`design -> runtime`だけとし、DB、CLI、filesystem、networkへの依存を許可しない。
- L5/L6のfreeze済み契約は変更せず、architecture上の実装着地点だけを明示する。

## 受入条件

- Forward PLANとReverse PLANが相互に`requires`する。
- module drift、source boundary、backfill pairingがgreenになる。
- 新しいauthority、gate、dependencyを追加しない。
