---
title: "L12 reviewed-safe inventory lifecycle 関数設計"
layer: L6
kind: function-design
status: confirmed
created: 2026-08-31
updated: 2026-08-31
owner: Codex / TL
plan: PLAN-L7-716-l12-reviewed-safe-inventory-lifecycle
parent_design: docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
pair_artifact: docs/test-design/helix/L8-l12-reviewed-safe-inventory-lifecycle-unit-test-design.md
---

# L12 reviewed-safe inventory lifecycle 関数設計

## 目的

L12 hybrid recognition inventoryのL6 design、L8 test design、PLANを、同じreviewed-safe lifecycleで
登録・retireする。reviewed-safe registryをdisposition正本とし、authority-review inventoryは未判定artifactだけを
保持する。

## 入力

- `REVIEWED_SAFE_DISPOSITIONS`: reviewed-safe artifactの正本集合
- `REVIEWED_SAFE_ARTIFACT_FAMILIES`: 同一責務を構成するL6／L8／PLANのexact family
- L12 hybrid recognition candidate inventory本文

## 判定

`analyzeReviewedSafeInventoryLifecycle`は次を独立して検査する。

1. family全memberがreviewed-safe registryに存在する。
2. reviewed-safe済みmemberが§5／§6／§7のauthority-review対象へ残っていない。
3. §6／§7の表示件数がbullet exact setと一致する。

いずれかが不一致ならfindingを返し、doctorはfail-closeする。一般inventoryに存在する
`safe-current`等の別dispositionを一律retireせず、明示familyだけを対象にする。
doctorは同じanalyzerを直接呼び、単体oracleと統合gateの判定分岐を複製しない。
doctor全体の`ok`はnamed check stateの失敗集合と既存boolean chainの両方へ束縛し、どちらか片側の
配線が欠落してもinventory lifecycle違反を合格へ降格させない。

## 出力

- `ok`: 全条件成立時のみ`true`
- `findings`: family member欠落、reviewed-safe残留、section件数driftのtyped finding

## 不変条件

- reviewed-safe registryとauthority-review inventoryを共同正本にしない。
- historical／compatibility entryを本契約だけで削除しない。
- family追加は明示的なexact set追加とoracleを必要とする。
