---
title: "current-location DB typed workflow identity単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-28
updated: 2026-08-28
owner: QA / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-L7-693-current-location-db-typed-workflow-identity.md
pair_artifact: docs/design/helix/L6-function-design/current-location-db-typed-workflow-identity.md
---

# current-location DB typed workflow identity単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CLDB-001 | schema exact tuple | typed 5列が欠落する、またはlegacy 2列を戻すとRed | `tests/current-location-db-workflow-identity.test.ts` |
| U-CLDB-002 | legacy candidate retirement | schema、index、ingestionのいずれかへ旧candidate tableを戻すとRed | `tests/current-location-db-workflow-identity.test.ts` |
| U-CLDB-003 | rebuild projection | current catalogのversion／digestと異なるrow、axis／ID欠落をRed | `tests/current-location-db-workflow-identity.test.ts` |

既存`state-db`、`db-projection-ingestion`、inventory oracleを併走し、schema／projection／replayの
接合退行と旧field再出現を検出する。
