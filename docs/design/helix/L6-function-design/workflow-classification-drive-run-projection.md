---
title: "typed workflow identity drive_runs投影機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-18
updated: 2026-08-18
owner: Codex / TL
plan: docs/plans/PLAN-L7-583-workflow-classification-drive-run-projection.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-drive-run-projection-unit-test-design.md
---

# typed workflow identity drive_runs投影

## Authority

requirements正本とversioned classification registryが意味authorityであり、PLAN frontmatterの
`workflow_identity`がsource bindingである。`mode`、`model`、`route_mode`、PLAN ID prefix、`kind`から
current workflow identityを推測しない。旧列と旧`route_modes`はcompatibility inventoryとしてだけ保持する。

## 責務

`projectDriveRuns`はtyped PLANの5-field identityを`drive_runs`へ独立列として投影し、legacy `mode`を空値にする。
typed PLANを`route_modes`へ投影してはならない。identityを持たないlegacy PLANだけは既存のmode-ledgerと
`route_modes`を互換投影する。これによりDB rebuild／replayでもcurrent typed identityとlegacy inventoryを混在させない。

## Contract

- `U-DBWID-007`: typed PLANのschema version、registry version、registry digest、target axis、target IDを
  `drive_runs`の5列へexact投影する。
- `U-DBWID-008`: typed PLANの`drive_runs.mode`を空値にし、`route_modes`へcurrent identityを再出力しない。
- `U-DBWID-009`: legacy PLANの既存mode／`route_modes`互換投影を維持し、typed projection変更で相殺しない。
- `U-DBWID-010`: operational metricsは空のlegacy modeを集計せず、current typed identityを旧mode metricへ戻さない。

## Transaction境界

既存の`rebuildHarnessDb` atomic rebuild内でschema migrationと全PLAN projectionを行う。typed identityの
validation failureはDB全体をrollbackし、rebuildとreplayは同じsourceから同じ5-field tupleを返す。

## 非対象

`routeSignalToMode` consumer除去、CLIの旧compatibility adapter、README／process文書、`route_modes`の物理削除は
後続の#694原子的sliceで行う。本sliceのgreenを#204／#694全体の完了とは扱わない。
