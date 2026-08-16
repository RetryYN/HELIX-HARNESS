---
title: "PLAN registry typed workflow identity投影 単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: QA / TL
plan: docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md
pair_artifact: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md
---

# PLAN registry typed workflow identity投影 単体テスト設計

## Oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DBWID-001 | validな5-field `workflow_identity`を持つPLAN | `plan_registry`の5列がsourceとexact一致 | `tests/slow/projection-writer.test.ts` |
| U-DBWID-002 | registry digest欠損、authority drift、unknown identity | identityなしへ丸めずrebuild failure | `tests/slow/projection-writer.test.ts` |
| U-DBWID-003 | identity未宣言のlegacy PLAN | 5列が全てSQL `NULL` | `tests/slow/projection-writer.test.ts` |
| U-DBWID-004 | schema inventory | legacy identity列が存在せず、typed 5列だけが存在 | `tests/state-db.test.ts` |
| U-DBWID-005 | generic projectionの部分tuple | DB write前にall-or-none violationとして拒否 | `tests/slow/projection-writer.test.ts` |
| U-DBWID-006 | L6/L8 pairとcatalog digest | current catalogとG3 packetのdigestが一致 | `tests/l3-g3-freeze-packet-v2.test.ts` |

## Regression境界

schema migration、atomic rebuild、既存PLAN projection、DB replayを含む`tests/state-db.test.ts`と
`tests/slow/projection-writer.test.ts`を実行する。targeted greenだけでDB全体のcompletionを主張しない。
