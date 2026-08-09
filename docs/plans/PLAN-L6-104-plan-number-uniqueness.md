---
plan_id: PLAN-L6-104-plan-number-uniqueness
title: "PLAN-L6-104 (add-design): PLAN 採番一意性 gate の機能設計 — 並行レーンの採番衝突を検出可能にする"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-09 デザインハーネスを進めること（キャリー: PLAN-L7-525 / PLAN-L5-96 の採番重複解消）"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 175
engineering_discipline_required: true
behavior_contract_id: U-PLANNUM-001
responsibility_owner: plan-governance
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "PLAN 採番は docs/plans を観測して次の空き番号を取る方式であり、並行レーンが同時に払い出すと衝突する。実 repository で 15 組が衝突しているが、採番 key の一意性を見る contract が存在しない"
contract_postconditions: "採番 key（PLAN-<layer>-<number>、slug 非依存）の一意性を機能設計として明文化し、baseline ratchet と 2 経路配線を契約化する。実装は PLAN-L7-535 へ降下する"
contract_invariants: "PLAN 採番規約そのもの（命名形式・番号体系）は変更しない。既存 15 組を遡及 fail させない"
contract_failures: "設計側の判定は無く、fail-close は実装 PLAN（PLAN-L7-535）の U-PLANNUM-001〜006 が担う"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。本 PLAN の生成物は機能設計 doc と L8 oracle 表であり production code を 1 行も変更しない。red→green の実測は実装 PLAN（PLAN-L7-535）が担い、そちらで red 16:20:00Z / green 16:22:00Z と mutation 4/4 killed を記録している"
complexity_effect: net_neutral
complexity_justification: "設計 doc 1 本と L8 oracle 節の追加のみ。production code の変更は本 PLAN では 0"
removal_trigger: "採番が台帳 allocation へ移行し、検出 gate 自体が不要になった時"
backprop_decision: not_required
backprop_decision_reason: "PLAN 採番規約そのもの（PLAN-<layer>-<number>-<slug>）は変更せず、既に暗黙運用されている一意性を機械検査へ降ろすだけの L6 機能設計。上位の要件・工程・kind 体系に変更はない。"
parent_design: docs/design/harness/L6-function-design/plan-descent-gate.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE - L6 機能設計（採番 key 粒度と baseline ratchet）"
  - role: tl
    slot_label: "TL - 既存衝突を凍結するか改番するかの境界レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-104-plan-number-uniqueness.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/plan-number-uniqueness.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L6-55-plan-entry-routing.md
  requires: []
  references:
    - docs/design/harness/L6-function-design/plan-entry-routing.md
  blocks:
    - docs/plans/PLAN-L7-535-plan-number-uniqueness.md
---

# PLAN-L6-104: PLAN 採番一意性 gate の機能設計

## §1 動機

PLAN の採番は `docs/plans/` を観測して次の空き番号を取る方式である。並行レーン
（Claude / Codex）が同時に払い出すと同じ番号を取り、意味の異なる PLAN が同じ番号を名乗る。

実 repository を数えたところ **15 組**が衝突していた（`PLAN-L7-170` と `PLAN-RECOVERY-40` は
3 本）。裸の `PLAN-L7-525` 参照 12 件、`PLAN-L5-96` 参照 8 件がどちらを指すか判別できない。

`plan_id` の一意性は slug を含むため保たれ、既存 gate は検出しない。**採番 key（layer + 番号）の
一意性を見る contract が存在しなかった**ことが再発の原因である。

## §2 設計の要点

機能設計は `docs/design/harness/L6-function-design/plan-number-uniqueness.md` に置く。要点は 3 つ。

1. **判定単位は採番 key**（`PLAN-<layer>-<number>`、slug を含まない）。`plan_id` 一意性とは別軸。
2. **baseline ratchet**（plan-descent / plan-entry-routing と同型）。既存 15 組は凍結し、
   新規衝突だけを fail-close する。凍結は「許可」ではなく既知の負債であり、
   下回ったら報告して baseline を下げさせる。
3. **配線は 2 経路**。`helix plan lint` の既定合成と `--gate number-uniqueness` の双方。
   gate を書いても既定経路に載っていなければ CI で発火しないため、oracle が配線も固定する。

## §3 既存 15 組を凍結する判断

改番は confirmed PLAN の identity 変更であり、`plan_id`・filename に加えて inbound 参照
（設計 doc、テスト設計、他 PLAN の dependencies、review evidence、
`src/lint/l12-hybrid-reviewed-safe-v2.ts` の path pin、prose 中の裸参照）の一括追従を伴う。
両ランタイムのレーンをまたぐ不可逆 migration であり、検出 gate の導入とは分離する。

改番の是非は owner 判断として別 Issue へ送る。

## §4 実装への降下

実装は `PLAN-L7-535-plan-number-uniqueness` へ降ろす。oracle は
`docs/test-design/harness/L8-unit-test-design.md` の「PLAN採番一意性のoracle」節
（U-PLANNUM-001〜006）を正本とする。

## §5 本設計の非対象

- 採番の払い出し方式そのものの変更（観測方式 → 台帳 allocation）。衝突を構造的に消す本命だが、
  DB schema と起票フローの設計を伴うため別設計とする。
- `plan_id` と filename の一致検査（既存 gate の担当）。
