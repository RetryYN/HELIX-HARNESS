---
plan_id: PLAN-REVERSE-344-session-handover-retirement-backprop
title: "PLAN-REVERSE-344: 廃止済みsession handover契約をDB+memory継続状態へfullback"
kind: reverse
layer: cross
workflow_phase: R0
confirmed_reverse_type: fullback
route_mode: reverse
drive: agent
status: draft
created: 2026-07-11
updated: 2026-07-11
owner: Codex / TL
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
forward_routing: L6
promotion_strategy: replace-with-hardening
entry_signals:
  - "po_directive:2026-07-11『ハンドオーバーは廃止した』— session/prose handoverを廃止済みの正本判断として固定"
backprop_scope:
  - layer: concept
    decision: update_required
    evidence_path: docs/governance/helix-harness-concept_v3.1.md
    reason: "Handover aggregateをDB+memory continuationへ置換する。"
  - layer: requirements
    decision: update_required
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "handover必須、3層原則、CLI/CURRENT.json契約を廃止する。"
  - layer: requirements
    decision: update_required
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "session continuationをstatus/DB/memoryへ置換する。"
  - layer: L4-basic-design
    decision: update_required
    evidence_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    reason: "handover block/flowをcontinuation stateへ置換する。"
  - layer: L5-detailed-design
    decision: update_required
    evidence_path: docs/design/helix/L5-detail/pillar-detail-design.md
    reason: "handover input/output/failure contractをDB+memoryへ置換する。"
agent_slots:
  - role: se
    slot_label: "SE — L0-L5 handover契約inventoryとtyped disposition"
  - role: tl
    slot_label: "TL — PO決定境界、provider/operations evidence非混同、Reverse mergeレビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-344-session-handover-retirement-backprop.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/pillar-detail-design.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-61-handover-retirement.md
  requires: []
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
    - docs/design/harness/L6-function-design/harness-memory-structure.md
---

# PLAN-REVERSE-344: session handover廃止の上位fullback

## R0 起点

POはsession/prose handoverを廃止済みと再確定した。一方、confirmed L0-L5正本は`helix handover`、
`.helix/handover/CURRENT.json`、DB+log+handoverの3層原則を現役契約として保持している。この意味driftを
L6だけで隠さず、Reverseで上位正本へ戻す。

## R1-R4工程

1. R1: `handover`参照を`session_prose` / `provider_evidence` / `operations_transition` / `legacy_archive`
   にtyped inventoryし、未分類0を検証する。
2. R2: session継続の必要情報をharness.db status、feedback lifecycle、takeover memory、session logへ割当て、
   情報欠落と二重正本を反証する。
3. R3: concept / requirements / L3 / L4 / L5と対向test-designを同じ変更波で更新する。
4. R4: provider/operations証跡を保持したままL6-61へForward mergeし、runtime撤去descentを許可する。

## 不変境界

- session/prose handover、CURRENT.json、`helix handover`を復活させない。
- provider delegation evidenceと開発→運用transition成果物は別型として保持する。
- `.helix`識別子renameはPLAN-M-02承認まで行わない。
- takeover deliveryはat-least-onceを偽装せず、stable delivery IDとconsumer dedupeを必須にする。
