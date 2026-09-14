---
title: "state DB schema DDL authority L6/L7実装oracle設計"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-08-13
updated: 2026-08-13
owner: QA
plan: docs/plans/PLAN-L6-106-state-db-schema-ddl-authority.md
pair_artifact: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md
github_issue_id: 644
behavior_contract_id: STATE-DB-SCHEMA-DDL-AUTHORITY-001
responsibility_owner: state-db-schema-authority
---

# state DB schema DDL authority L6/L7実装oracle設計

| U-ID | 実行oracle |
|---|---|
| U-SDDA-001 | canonical DDL bytesのpinned SHA-256不一致を検出する |
| U-SDDA-002 | fresh migration後のSQLite object exact set不一致を検出する |
| U-SDDA-003 | missing objectを型付き結果で個別報告する |
| U-SDDA-004 | extra objectを型付き結果で個別報告する |
| U-SDDA-005 | 同名objectのSQL変更を型付き結果で個別報告する |
| U-SDDA-006 | 既存state DB migrationを回帰させない |
| U-SDDA-007 | L3 freeze catalog／packet／reviewed digestを同期する |

authority moduleはread-onlyとし、DDL digestとSQLite object比較を独立して検証する。production DDL、
missing／extra／changed objectのmutationで対応testがRedになることを要求する。
