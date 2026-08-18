---
title: "current runtime command guidance単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-18
updated: 2026-08-18
owner: QA / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md
pair_artifact: docs/design/helix/L6-function-design/current-runtime-guidance.md
---

# current runtime command guidance単体テスト設計

| U-ID | 対象 | 期待結果 | test citation |
|---|---|---|---|
| U-CRG-001 | L13 distribution／rename smoke | `npm run build`＋`node ./dist/helix.js`、またはnpm scriptを案内し、Bunを含まない | `tests/current-runtime-guidance.test.ts` |
| U-CRG-002 | Forward L7 test step | `npm run test`を案内し、Bun testへ戻らない | `tests/current-runtime-guidance.test.ts` |

対象文書を1つでもBun commandへ戻した場合、またはpackage.jsonにないscript／artifact commandへ変更した場合は
テストをfail-closeする。
