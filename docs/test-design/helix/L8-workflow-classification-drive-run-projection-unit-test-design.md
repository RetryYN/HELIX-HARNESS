---
title: "typed workflow identity drive_runs投影 単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-18
updated: 2026-08-18
owner: QA / TL
plan: docs/plans/PLAN-L7-583-workflow-classification-drive-run-projection.md
pair_artifact: docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md
---

# typed workflow identity drive_runs投影 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DBWID-007 | typed PLAN identity | `drive_runs`の5列がfrontmatterとexact一致 | `tests/slow/projection-writer.test.ts` |
| U-DBWID-008 | legacy隔離 | typed PLANの`mode`は空、`route_modes`への行は0件 | `tests/slow/projection-writer.test.ts` |
| U-DBWID-009 | compatibility維持 | legacy PLANのmode／`route_modes`は従来どおり投影 | `tests/slow/projection-writer.test.ts` |
| U-DBWID-010 | metric projection | 空modeを集計せず、旧mode metricへtyped identityを混入させない | `tests/slow/projection-writer.test.ts` |
| U-DDB1437-001 | legacy registration boundary | legacy drive/mode行の欠落をcurrent registrationの失敗にせず、typed identityをcurrent判定に使う | `tests/drive-db-registration.test.ts` |
| U-DDB1437-002 | unknown identity failure | unknown typed workflow identityをlegacy modeから補完せずfail-closeする | `tests/drive-db-registration.test.ts` |

DB rebuild／replayは同じsourceに対して同じtyped tupleを返す。legacy-only greenでcurrent typed identity
projectionの失敗を相殺しない。
