---
layer: L6
artifact_type: design_doc
status: confirmed
pair_artifact: docs/test-design/helix/L8-db-key-immutability-integrity-unit-test-design.md
created: 2026-09-02
plan: docs/plans/PLAN-RECOVERY-90-db-key-immutability.md
---

# DB key／immutability整合 L6機能設計

## 責務

`harness-db-schema`は、table key、dedupe index、runtime append-only tableのrebuild保持を一つの
schema integrity境界として管理する。

## 契約

- `primaryKey: true`の列は型にかかわらずDDLで`NOT NULL PRIMARY KEY`となる。
- closure process receiptの同一`repository_head`／`dedupe_key`／`completed_at`はDB制約で重複を拒否する。
- DELETE immutability triggerを持つruntime tableはdocument projection rebuildのtruncate対象外とする。
- `closure_terminal_boundaries`はtracked ledger由来のdocument projectionなのでgeneric truncateから外し、
  rebuild transaction内のcontrolled replacement後にimmutability triggerを再設置する。
- UPDATE／DELETEをDB triggerで禁止しないruntime tableは、唯一writerと更新可否をコードコメントで明示する。
- 既存file-backed DBはcanonical rebuildで新DDLへ再生成し、暗黙migrationで旧NULL行を再解釈しない。

## Fail-close境界

NULL key、dedupe重複、trigger付きtableのtruncate、owner不明のappend-only claimを成功扱いにしない。
