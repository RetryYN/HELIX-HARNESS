---
layer: L8
artifact_type: test_design
status: confirmed
pair_artifact: docs/design/helix/L6-function-design/db-key-immutability-integrity.md
created: 2026-09-02
plan: docs/plans/PLAN-RECOVERY-90-db-key-immutability.md
---

# DB key／immutability整合 L8検証設計

対応PLAN: `PLAN-RECOVERY-90-db-key-immutability`

| Oracle | 入力 | 期待結果 |
| --- | --- | --- |
| U-DBKEY-001 | canonical tableのTEXT primary keyへNULLをinsert | SQLite constraint error |
| U-DBKEY-002 | 同一closure process dedupe tupleを2回insert | 2回目をunique constraintで拒否 |
| U-DBKEY-003 | v47 DBに同一dedupe tupleを2行保持してmigration | 最小keyをcanonicalに保持し、残余をimmutable監査表へ退避してunique制約を有効化 |
| U-DBIMM-001 | trigger付きruntime tableへ行を保存してrebuild | rebuild成功かつruntime行を保持 |
| U-DBIMM-002 | schema DDL全体 | 全primary key列が`NOT NULL PRIMARY KEY` |
| U-DBIMM-003 | truncate保持集合とDELETE immutability trigger集合 | trigger付きtableが保持集合へ包含される |

## Mutation境界

- `NOT NULL`をDDL生成から除くとU-DBKEY-001／002がredになる。
- dedupe indexの`unique`を除くとU-DBKEY-002がredになる。
- trigger付きtableを保持集合から除くとU-DBIMM-001／003がredになる。
