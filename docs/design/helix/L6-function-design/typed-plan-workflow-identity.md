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

## Compatibility境界

`workflow_identity`を持たない既存PLANは既存baseline内でのみ`route_mode`を読み取れる。legacy greenはtyped
identityのversion／digest／entity不一致を相殺しない。DB projectionとexecution episode束縛は後続sliceで行う。
