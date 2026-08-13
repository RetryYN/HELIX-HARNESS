---
layer: L5
artifact_type: detail-design
status: draft
plan: docs/plans/PLAN-L5-100-state-db-schema-ddl-authority.md
pair_artifact: docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md
---

# state DB schema DDL authority詳細設計

authorityはcanonical DDL UTF-8 digestと、fresh migration後の非内部`sqlite_schema` object exact setで構成する。
table/index/triggerのname・type・normalized SQLを比較し、欠落・余剰・変更を区別する。
