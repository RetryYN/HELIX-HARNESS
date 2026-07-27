---
title: "Forward工程専門workflow"
status: confirmed
authority: config/drive-route-catalog.json
---

# Forward工程専門workflow

工程専門は独立modeではなく、Forwardの特定layerで発火する必須sub-workflowである。

## screen-design

- layer/pair: L2↔L11
- entry: `screen_requirement_gap`、`wireframe_missing`、`screen_impl_pair_gap`
- artifacts: screen list、screen flow、wireframe、UI elements、prototype agreementまたはno-UI receipt
- exit: L2↔L11 pair currentかつ、画面適用性判断がcurrent
- 禁止: 静的wireframeだけを操作可能prototypeや利用者合意として扱わない

## frontend-design

- layer/pair: L10↔L3
- entry: `a11y_regression`、`visual_regression`、`token_drift`、`ux_feedback`
- artifacts: visual、design token、a11y、VRT、UX reviewの実装後証拠
- exit: L3↔L10 pair currentかつ、real implementation evidence current
- 禁止: L2のprototype工程をL10へ先送りしない。screenshot単体をUX完了証拠にしない

## 共通収束

各workflowのfindingは現在behavior contractを破る場合だけ現PRのblockerにする。設計改善候補は
親Issueへ階層化して後続へ送り、専門工程を無限review loopにしない。
