---
title: "PLAN typed workflow identity機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
plan: docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md
---

# PLAN typed workflow identity機能設計

## 責務

新規PLANはrequirements registryへ束縛した`workflow_identity`をcurrent identityとして保持する。
`target_axis`、`target_id`、registry version、registry source digestを別fieldで保存し、PLAN `kind`や
専門職`drive`と同一enumへ畳み込まない。旧`route_mode`はlegacy PLAN読取専用であり、typed PLANへ併記しない。

## 契約

- `U-TPWID-001`: frontmatterはversion／digest／typed axis／IDのstrict tupleだけを受理する。
- `U-TPWID-002`: plan-entry gateはtupleをcurrent generated catalogへexact照合する。
- `U-TPWID-003`: typed PLANへ`route_mode`を再出力した場合はfail-closeする。
- `U-TPWID-004`: PLAN `kind`とworkflow identityを同一enumとして整合判定しない。
- `U-TPWID-005`: L6/L8 pair登録をG3 freeze packetのdesign catalog digestへ伝播する。
- `U-TPWLOAD-001`: catalog／registry／requirements authorityのmissing、invalid、projection driftを
  別reasonとrepository-relative authority pathでfail-closeし、例外を`catalog=null`へ握り潰さない。
- `U-TPWSIG-001..004`: DBで解決済みのcanonical signal tokenだけをcatalog bindingへexact照合し、
  同一identityのbindingにdecision待ちが1件でもあれば配列順に依存せず`decision_required`で閉じ、
  identity一致を受理する。矛盾、unknown、decision待ち、ambiguityは別reasonでfail-closeし、
  `po_directive`からidentityを推測しない。
- `U-TPWLEG-001`: machine-generated exact inventory外の非typed PLANは
  `workflow_identity_required`でfail-closeする。`route_mode`、PLAN ID prefix、`kind`からcurrent identityを推測しない。
- `U-TPWLEG-002`: inventory内の既存非typed PLANだけをcompatibility inputとして読み、current outputへ
  legacy identityを再出力しない。
- `U-TPWLEG-003`: inventory schema、scope、sort、duplicate、digest driftをfail-closeする。
- `U-TPWLEG-004`: inventory件数は951を上限として増加を拒否する。active legacy集合はinventoryのsubsetだけを許し、
  typed移行による減少だけを許可する。既存violation baselineとは責務を分離する。
- `U-TPWBACK-001`: add-implのReverse pending判定はvalidな`workflow_model:ADD_FEATURE`と
  `backfill_state=pending_reverse`の完全一致をcurrent入力とする。別axis、別ID、不正digest、state欠落は
  推測せずorphanを維持する。旧`route_mode=add-feature`はcompatibility inputに限定する。

## Compatibility境界

`workflow_identity`を持たない既存PLANはexact legacy inventory内でのみ`route_mode`を読み取れる。既存の
violation baselineは別責務であり、identity admissionには使わない。legacy greenはtyped
identityのversion／digest／entity不一致を相殺しない。DB projectionとexecution episode束縛は後続sliceで行う。
