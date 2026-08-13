---
layer: L8
sub_doc: unit-test-design
parent_design: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md
pair_artifact: docs/plans/PLAN-L7-551-state-db-schema-ddl-authority.md
---

# state DB schema DDL authority unit test設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SDDA-001 | canonical DDL digest | DDL変更、順序変更、区切り変更を検出する | `tests/state-db-schema-authority.test.ts` |
| U-SDDA-002 | fresh migration round-trip | table/index/trigger欠落を検出する | `tests/state-db-schema-authority.test.ts` |
| U-SDDA-003 | missing object | object欠落を個別に報告する | `tests/state-db-schema-authority.test.ts` |
| U-SDDA-004 | extra object | 余剰objectを黙殺しない | `tests/state-db-schema-authority.test.ts` |
| U-SDDA-005 | changed SQL | name一致だけではpassしない | `tests/state-db-schema-authority.test.ts` |
| U-SDDA-006 | 既存state DB回帰 | authority導入で既存migrationを破壊しない | `tests/state-db.test.ts` |
| U-SDDA-007 | L3 freeze同期 | catalog、packet、reviewed digestの不一致を検出する | `tests/l3-g3-freeze-packet-v2.test.ts` |

SQLite内部`sqlite_%` objectは比較対象外とし、production registryとmigrationが生成するobjectだけをexact照合する。
