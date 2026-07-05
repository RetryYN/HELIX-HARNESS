---
plan_id: PLAN-REVERSE-329-l1-l2-elicitation-cycle-fullback
title: "PLAN-REVERSE-329 (kind=reverse): L1-L2 elicitation cycle S4 confirmed fullback"
kind: reverse
layer: cross
workflow_phase: R3
confirmed_reverse_type: design
drive: fe
status: draft
created: 2026-07-05
updated: 2026-07-05
owner: TL (Codex) / PO
parent_design: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
pair_artifact: tests/semantic-frontier-consistency.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - D11 S4 confirmed の Reverse fullback scope と正本反映先を整理する"
  - role: po
    slot_label: "PO - L1-L2 反復ループの正式採用範囲と人-AI 境界を確認する"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-329-l1-l2-elicitation-cycle-fullback.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L00-L06-design-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/gates.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
  requires:
    - docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
  references:
    - docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
    - docs/process/forward/L00-L06-design-phase.md
    - docs/process/gates.md
    - docs/design/harness/L1-requirements/screen-requirements.md
---

# PLAN-REVERSE-329: L1-L2 要求洗い出しサイクルの fullback

## 目的

`PLAN-DISCOVERY-11` は 2026-07-05 の PO S4 判断で `decision_outcome=confirmed` になった。PoC で実証した
L1-L2 反復ループ、AI gap-check read-only 境界、A-40 再検証点への接続を、Discovery 記録の中だけに閉じず
Forward front-end / gate / requirements 正本へ戻す。

## R0 現状

- S4 confirmed evidence は `PLAN-DISCOVERY-11` の `s4_decision_record` に記録済み。
- L1 PM-06 への Round 1 反映と S3 verify は済み。
- 残差は L2 側 1 件で、screen track 再開時に A-40 経由で扱う。
- `PLAN-L7-330` で L1/L2 consistency lint と doctor 接続は実装済み。
- process 正本反映、concept / requirements の trace seed 昇格、gap-check CLI / hook 結線の Forward descent 接続は未完了。よって whole-program completion には数えない。

## Fullback 方針

- R1: `docs/process/forward/L00-L06-design-phase.md` と `docs/process/gates.md` に、L1-L2 反復ループと収束 gate を正式な Forward 前段として戻す。`2026-07-05 completed`
- R2: concept / requirements の trace seed を confirmed 記述へ昇格する。AI は L1/L2 を確定せず、read-only gap-check のみを担う境界を維持する。`2026-07-05 completed`
- R3: L1/L2 consistency lint と gap-check read-only CLI / hook の Forward descent PLAN へ接続する。
- R4: fullback artifact、pair evidence、review evidence、green command を揃えて terminal 化する。

## R1/R2 反映記録

- `docs/process/forward/L00-L06-design-phase.md` に L1-L2 elicitation loop を追加し、人が L1/L2 を直接作成・収束宣言し、AI は read-only gap-check だけを担う境界を Forward 前段へ戻した。
- `docs/process/gates.md` に G1/G2 収束の扱いを追加し、consistency lint green は必要条件、最終 freeze は人の宣言、A-40 再検証へ接続する規則を明示した。
- `docs/governance/helix-harness-concept_v3.1.md` と `docs/governance/helix-harness-requirements_v1.2.md` の trace seed を PoC 段階から S4 confirmed の正式追補へ昇格した。
- 既存実装 `PLAN-L7-330` は ID-level L1/L2 consistency lint として完了済み。残る R3 は観点表 8 項目の gap-check read-only surface、CLI/hook 結線、Forward descent PLAN への接続であり、L1/L2 の自動起草や自動確定は含めない。

## 受入条件

- `PLAN-DISCOVERY-11` を参照する Reverse PLAN として `scrum-reverse` が orphan を出さない。
- confirmed PoC を semantic frontier pending decision に戻さない。
- D11 の S4 confirmed を completion claim と誤認せず、Reverse fullback 未了を outstanding として残す。
- 日本語 first の説明を保ち、コマンド名・識別子・ファイル名だけ原語を許可する。

## 次 action

R3 として、gap-check read-only surface を Forward descent PLAN に切り出す。観点表 8 項目の列挙、3 ラウンド bound、A-40 再検証接続、CLI/hook の non-mutating 実行契約を設計し、L1/L2 の起草・確定権を AI に渡さない。
