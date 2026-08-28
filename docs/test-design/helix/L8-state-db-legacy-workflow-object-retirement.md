---
title: "state DB legacy workflow object retirement単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-28
updated: 2026-08-28
owner: QA / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-L7-695-state-db-legacy-workflow-object-retirement.md
pair_artifact: docs/design/helix/L6-function-design/state-db-legacy-workflow-object-retirement.md
---

# state DB legacy workflow object retirement単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SDLW-001 | existing upgrade | revision 46 DBの旧table／index／2列がupgrade後に1件でも残ればRed | `tests/state-db-legacy-workflow-object-retirement.test.ts` |
| U-SDLW-002 | authoritative data | migration前後で非対象のauthoritative rowが欠落・変形すればRed | `tests/state-db-legacy-workflow-object-retirement.test.ts` |
| U-SDLW-003 | rollback | DROPを妨げる依存objectでmigrationを失敗させ、旧schemaまたはversionだけが部分更新されたらRed | `tests/state-db-legacy-workflow-object-retirement.test.ts` |
| U-SDLW-004 | idempotency | revision 47への再適用でschema object setが変わればRed | `tests/state-db-legacy-workflow-object-retirement.test.ts` |
| U-SDLW-005 | live doctor | live DBへauthority外objectをseedしてdoctorがgreenならRed | `tests/state-db-legacy-workflow-object-retirement.test.ts` |
| U-SDLW-006 | doctor wiring | schema authority checkがfull doctorのtrace、ok、messageから1箇所でも外れればRed | `tests/state-db-legacy-workflow-object-retirement.test.ts` |

旧table／index／列の復活を個別mutationとして扱い、fresh migrationのgreenでexisting upgradeの失敗を相殺しない。
