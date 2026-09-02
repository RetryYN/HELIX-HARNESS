# DB key／immutability整合 L8検証設計

対応PLAN: `PLAN-RECOVERY-90-db-key-immutability`

| Oracle | 入力 | 期待結果 |
| --- | --- | --- |
| U-DBKEY-001 | canonical tableのTEXT primary keyへNULLをinsert | SQLite constraint error |
| U-DBKEY-002 | 同一closure process dedupe tupleを2回insert | 2回目をunique constraintで拒否 |
| U-DBIMM-001 | trigger付きruntime tableへ行を保存してrebuild | rebuild成功かつruntime行を保持 |
| U-DBIMM-002 | schema DDL全体 | 全primary key列が`NOT NULL PRIMARY KEY` |
| U-DBIMM-003 | truncate保持集合とDELETE immutability trigger集合 | trigger付きtableが保持集合へ包含される |

## Mutation境界

- `NOT NULL`をDDL生成から除くとU-DBKEY-001／002がredになる。
- dedupe indexの`unique`を除くとU-DBKEY-002がredになる。
- trigger付きtableを保持集合から除くとU-DBIMM-001／003がredになる。
