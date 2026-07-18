---
plan_id: PLAN-DISCOVERY-12-grok-build-worktree-precedent
title: "PLAN-DISCOVERY-12 (poc): 外部worker runtime／配布precedentのbehavior atom調査"
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

# 外部worker runtime／配布precedentのbehavior atom調査

## 目的

外部harnessのコードを取り込まず、worktreeの払い出しを含むorchestration、permanent bypass deny、worker output validation、
distribution catalogのbehavior atomだけを採取し、`HR-FR-P2-05..08`／`HR-FR-P6-06`のL4 Forward設計入力にする。
本PLANのownerが5要件すべての次工程routingを保持し、S4採否後に要件単位のL4 design PLANへ分割する。

## S0 backlog

- 公式source revision、license、参照日を固定する。
- allocation／lease／cleanup／recovery／conflictの状態遷移とfailure pathを列挙する。
- HELIX既存team/worktree/fencing契約との重複、矛盾、欠落を比較する。
- P2-07のrepository permanent denyとone-shot overrideの優先順位を反証試験する。
- P2-08のstrict schema／digest profileと期限付き緩和receiptを比較する。
- P6-06のcanonical/generated index、provenance、license、免責、artifact digestを比較する。
- 採用候補、却下、追加実験を分離し、bulk importしない。

## Forward owner台帳

| 要件 | S0-S4 owner | S4後のrouting |
|------|-------------|---------------|
| HR-FR-P2-05 | PMO-Tech / TL | L4 worker割当設計 |
| HR-FR-P2-06 | PMO-Tech / TL | L4 lease／cleanup／recovery設計 |
| HR-FR-P2-07 | AIM / TL | L4 bypass authority設計 |
| HR-FR-P2-08 | QA / TL | L4 worker validation profile設計 |
| HR-FR-P6-06 | PMO-Tech / TL | L4 distribution catalog設計 |

## 完了境界

本PLANの起票は調査完了を意味しない。S1〜S4の証拠と採否判断が揃うまで、外部precedentをHELIX authorityまたは実装済み能力として扱わない。
