---
plan_id: PLAN-REVERSE-NNN-reverse-slug   # 対応する Forward/poc PLAN と番号を揃える (例: L7-330 ↔ REVERSE-330)
title: "PLAN-REVERSE-NNN (kind=reverse): (日本語タイトル — 何を正本へ fullback するか)"
kind: reverse
layer: cross
workflow_phase: R0                       # R0 → R1 → R2 → R3 (po role 必須) → R4 → Forward merge
confirmed_reverse_type: design           # design / impl 等 (schema §1.1.reverse)
drive: fe
status: draft
created: 2026-MM-DD
updated: 2026-MM-DD
owner: TL / PO
parent_design: docs/plans/PLAN-XXX.md    # fullback 元 (confirmed poc / 実装 PLAN)
pair_artifact: tests/<oracle>.test.ts    # 起票時から必須 (plan lint missing_pair_artifact)
agent_slots:
  - role: tl
    slot_label: "TL — fullback 内容の正本整合"
  - role: po
    slot_label: "PO — R3 承認と Forward merge 判断"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-NNN-reverse-slug.md
    artifact_type: markdown_doc
  # 必須: terminal (confirmed) 化までに正本 (docs/plans/ 外) artifact を必ず追加する。
  # 自 doc のみのまま confirmed にすると scrum-reverse gate が「空 fullback」で fail-close する
  # (PLAN-L7-331)。追加例は本文 §fullback 義務の fenced block を参照。
dependencies:
  parent: docs/plans/PLAN-XXX.md
  requires:
    - docs/plans/PLAN-XXX.md
  references: []
---

# PLAN-REVERSE-NNN (kind=reverse): (日本語タイトル)

## 目的

(何を、どの正本 — concept / requirements / process / design — へ fullback するか)

## fullback 義務（正本反映のチェックリスト）

- [ ] 上位正本の **trace seed（PoC 段階）注記を正式追補へ変換**する。terminal 化後に seed が残ると
      scrum-reverse gate が `unresolvedSeedMarkers` で fail-close する (PLAN-L7-331)。
- [ ] 反映した正本 artifact を generates へ追加する（空 fullback 禁止）。追加例:

```yaml
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
```
- [ ] G-10 台帳（objective evidence ledger）の未了 PLAN 一覧との同期を確認する。

## 受入条件

(fullback 反映の実在を機械証跡で cite する。confirmed 前に review evidence + green_commands 記録)

## スケジュール
- mode: serial (R0 → R4 の順)

## 壊さない / 再発させない
