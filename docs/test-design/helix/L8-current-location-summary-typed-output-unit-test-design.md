---
title: "current-location summary typed workflow output単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-25
updated: 2026-08-25
owner: QA / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-L7-672-current-location-summary-typed-output.md
pair_artifact: docs/design/helix/L6-function-design/current-location-summary-typed-output.md
---

# current-location summary の typed workflow 出力・単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CLSO-001 | authority-backed summary | current registry tupleを`workflow_identity`へ投影し、receiptを`converted`として返す | `tests/cli-surface.test.ts` |
| U-CLSO-002 | missing authority | registry無しfixtureはidentityを推測せずnullと`unsupported` receiptを返す | `tests/cli-surface.test.ts` |
| U-CLSO-003 | legacy output exclusion | summary／frontierに旧drive/model fieldを再出力しない | `tests/cli-surface.test.ts` |
| U-CLSO-004 | frontier contract | frontier schema v2、typed identity、workflow route status、workflow commandを返す | `tests/cli-surface.test.ts` |
| U-CLSO-005 | text contract | text出力が旧`drive=...`／旧drive-routeを出さずtyped workflow routeを表示する | `tests/cli-surface.test.ts` |
| U-CLSO-006 | schema mutation | summary schema v2をv1へ退行させるmutationをproduction-root regressionが検出する | `tests/cli-surface.test.ts` |

旧compatibility commandの内部出力をpositive oracleにしない。legacy greenでcurrent summaryの
canonical failureを相殺しない。
