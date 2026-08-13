---
layer: L8
sub_doc: unit-test-design
parent_design: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md
pair_artifact: docs/plans/PLAN-L7-551-state-db-schema-ddl-authority.md
---

# state DB schema DDL authority unit test設計

| oracle | 観点 | kill対象 |
|---|---|---|
| U-SDDA-001 | canonical DDL digest | DDL変更、順序変更、区切り変更 |
| U-SDDA-002 | fresh migration round-trip | table/index/trigger欠落 |
| U-SDDA-003 | exact set | 余剰object黙殺 |
| U-SDDA-004 | changed SQL | name一致だけでpass |
| U-SDDA-005 | self-comparison退役 | expectedをactualから再生成 |

SQLite内部`sqlite_%` objectは比較対象外とし、production registryとmigrationが生成するobjectだけをexact照合する。
