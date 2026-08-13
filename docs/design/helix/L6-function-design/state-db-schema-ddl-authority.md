---
layer: L6
artifact_type: function-design
status: draft
plan: docs/plans/PLAN-L6-106-state-db-schema-ddl-authority.md
pair_artifact: docs/plans/PLAN-L7-551-state-db-schema-ddl-authority.md
---

# state DB schema DDL authority機能設計

| 関数 | 入力 | 出力 |
|---|---|---|
| `schemaDdlDigest` | DDL string列 | canonical SHA-256 |
| `readSqliteSchemaObjects` | open `HarnessDb` | sorted non-internal objects |
| `compareSchemaAuthority` | expected/actual | missing/extra/changed typed result |

関数はread-onlyで、migration適用はcaller fixtureが行う。
