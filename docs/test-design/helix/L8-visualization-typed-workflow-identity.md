---
title: "visualization typed workflow identity test design"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
parent_design: docs/design/helix/L6-function-design/visualization-typed-workflow-identity.md
plan: docs/plans/PLAN-L7-694-visualization-typed-workflow-identity.md
---

# visualization typed workflow identity test design

## oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-VTWI-001 | typed tuple伝播 | 実DB projectionのregistry exact tupleがview modelで欠落・変形するとRed | `tests/visualization-typed-workflow-identity.test.ts` |
| U-VTWI-002 | legacy output禁止 | view model、generic tree、VS Code treeのcurrent workflow surfaceへlegacy identity keyが再出現するとRed | `tests/visualization-typed-workflow-identity.test.ts` |
| U-VTWI-003 | fail-close | stale digest、unknown axis／ID、partial tuple、receipt不一致を受理するとRed | `tests/visualization-typed-workflow-identity.test.ts` |
| U-VTWI-004 | tree parity | generic treeとVS Code treeのaxis／ID／digestが異なる、またはtooltip等から旧identityを再構成するとRed | `tests/visualization-typed-workflow-identity.test.ts` |
| U-VTWI-005 | mutation | legacy key復活mutationを`U-VTWI-002`が検出できなければRed | `tests/visualization-typed-workflow-identity.test.ts` |

## 検証範囲

対象は`ProjectCurrentLocationView`、`buildVisualizationViewModel`、`buildVisualizationTree`、
`buildVisualizationTreeView`。CLI presentationとskill applicabilityの独自分類は後続Issueのoracleへ分離する。
