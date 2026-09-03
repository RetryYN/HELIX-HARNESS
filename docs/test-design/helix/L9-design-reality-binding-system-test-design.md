---
title: "Design Reality Binding L9システムテスト設計"
layer: L9
artifact_type: test_design
sub_doc: system-test-design
status: confirmed
created: 2026-08-03
updated: 2026-09-04
owner: QA
plan: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
pair_artifact: docs/design/helix/L4-basic-design/design-reality-binding.md
---

# Design Reality Binding L9システムテスト設計

| oracle | 経路 | 完了条件 |
|---|---|---|
| ST-DRB-001 | `plan lint --gate design-reality-binding` | #355回帰bindingと新設計bindingが同一HEADでgreen |
| ST-DRB-002 | default `plan lint` | Reality findingを他gateのgreenで相殺しない |
| ST-DRB-003 | `helix doctor` | Reality findingがhard failureとfailing-checkへ現れる |
| ST-DRB-004 | source mutation | export削除、digest drift、identity field追加で最低1経路がred |
| ST-DRB-005 | `helix doctor`／`plan lint` | 空failure bindingの件数、baseline digest、本文gap advisoryが同じ解析結果へ束縛される |
| ST-DRB-006 | current design inventory | baseline外の新規空bindingはfail-closeし、解消済みentryはbaseline縮小候補として表示される |
