---
layer: L6
artifact_type: function-design
status: confirmed
plan: docs/plans/PLAN-L6-106-state-db-schema-ddl-authority.md
pair_artifact: docs/test-design/helix/L6-state-db-schema-ddl-authority-unit-test-design.md
---

# state DB schema DDL authority機能設計

| 関数 | 入力 | 出力 |
|---|---|---|
| `schemaDdlDigest` | DDL string列 | canonical SHA-256 |
| `readSqliteSchemaObjects` | 開いている`HarnessDb` | 内部要素を除いた整列済みobject |
| `compareSchemaAuthority` | 期待値／実測値 | 欠落／余剰／変更を分けた型付き結果 |

関数はread-onlyで、migration適用はcaller fixtureが行う。

## L8 oracle

`U-SDDA-001`、`U-SDDA-002`、`U-SDDA-003`、`U-SDDA-004`、`U-SDDA-005`は
DDL digestとSQLite object集合を検証する。`U-SDDA-006`は既存state DB suiteから自己比較が
退役したこと、`U-SDDA-007`はL3 freeze packetとreviewed digest mapの同期を検証する。
