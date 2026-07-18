---
plan_id: PLAN-DISCOVERY-12-grok-build-worktree-precedent
title: "PLAN-DISCOVERY-12 (poc): grok-build worktree運用precedentのbehavior atom調査"
kind: poc
layer: cross
workflow_phase: S0
scrum_type: design-spike
drive: fe
status: draft
created: 2026-07-19
updated: 2026-07-19
owner: PMO-Tech / TL
parent_design: docs/design/helix/L3-requirements/pillar-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — external precedentの採取境界とHELIX適合性を監査する"
  - role: se
    slot_label: "PMO-Tech — source revision、license、behavior atomを記録する"
generates:
  - artifact_path: docs/plans/PLAN-DISCOVERY-12-grok-build-worktree-precedent.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires:
    - docs/research/harness-improvement-from-grok-kimi-oss-2026-07-19.md
  references:
    - docs/adr/ADR-009-node-python-linux-runtime.md
    - docs/adr/ADR-010-python-node-runtime-authority.md
---

# grok-build worktree運用precedentのbehavior atom調査

## 目的

外部harnessのコードを取り込まず、worktreeの払い出し、所有権、回収、crash recovery、競合検出、衝突時停止のbehavior atomだけを採取し、`HR-FR-P2-05`／`HR-FR-P2-06`の設計入力にする。

## S0 backlog

- 公式source revision、license、参照日を固定する。
- allocation／lease／cleanup／recovery／conflictの状態遷移とfailure pathを列挙する。
- HELIX既存team/worktree/fencing契約との重複、矛盾、欠落を比較する。
- 採用候補、却下、追加実験を分離し、bulk importしない。

## 完了境界

本PLANの起票は調査完了を意味しない。S1〜S4の証拠と採否判断が揃うまで、外部precedentをHELIX authorityまたは実装済み能力として扱わない。
