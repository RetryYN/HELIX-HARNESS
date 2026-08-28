---
title: "visualization typed workflow identity projection"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-L7-694-visualization-typed-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-visualization-typed-workflow-identity.md
---

# visualization typed workflow identity 投影

## 目的

`project_current_location`のtyped workflow identityをvisualization view model、generic tree、
VS Code treeへ一方向に投影し、旧`drive_model`／`selected_model`／`default_model`／
`available_models`をcurrent workflow identityとして再出力しない。

## 入力契約

- 入力は#1123が確立するregistry version、registry source digest、`target_axis`、`target_id`の
  exact tupleとする。
- visualization builderはlegacy modelからidentityを再推測しない。composition boundaryで検証済みの
  typed receiptを受け取る。
- typed tupleとreceiptのversion、digest、axis、IDが一致しない場合は描画をfail-closeする。
- provider model、specialist drive、skill applicabilityは別責務であり、workflow identityへ畳み込まない。

## 出力契約

- view modelは`workflow_identity`をprimary identityとして一度だけ公開する。
- generic treeとVS Code treeは同じtyped tupleからlabel、description、tooltip、context valueを生成する。
- closure、recovery、layer progressがworkflow identityを表示する場合もtyped tupleを参照し、旧model名を
  別名fieldへ移して温存しない。
- old field、partial tuple、unknown axis／ID、stale digest、view/tree間のtuple差異を拒否する。
- compatibility outputのgreenでcurrent visualizationの失敗を相殺しない。

## 移行境界

current-location内部のlegacy producerは本sliceの入力正本ではない。skill applicability固有のmigrationは
#1044/#248、CLI presentationは#1125が所有する。visualization contractから削除した旧fieldを
consumer convenienceのために復活させない。
