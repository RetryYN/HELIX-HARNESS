---
title: "PLAN registry typed workflow identity投影 単体テスト設計"
layer: L8
artifact_type: test_design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
pair_artifact: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md
---

# PLAN registry typed workflow identity投影 単体テスト設計

## Oracle

| ID | 入力 | 期待結果 |
|---|---|---|
| U-DBWID-001 | validな5-field `workflow_identity`を持つPLAN | `plan_registry`の5列がsourceとexact一致 |
| U-DBWID-002 | registry digest欠損、authority drift、unknown identity | identityなしへ丸めずrebuild failure |
| U-DBWID-003 | identity未宣言のlegacy PLAN | 5列が全てSQL `NULL` |
| U-DBWID-004 | schema inventory | legacy identity列が存在せず、typed 5列だけが存在 |
| U-DBWID-005 | generic projectionの部分tuple | DB write前にall-or-none violationとして拒否 |

## Regression境界

schema migration、atomic rebuild、既存PLAN projection、DB replayを含む`tests/state-db.test.ts`と
`tests/slow/projection-writer.test.ts`を実行する。targeted greenだけでDB全体のcompletionを主張しない。
