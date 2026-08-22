---
title: "Forward工程専門workflow"
status: confirmed
authority: docs/governance/helix-harness-requirements_v1.3.md
registry: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
catalog: config/workflow-classification-catalog.v1.json
legacy_catalog: config/drive-route-catalog.json
target_axis: specialist_workflow
target_id: SCREEN_DESIGN
---

<!-- HELIX:workflow-specialist-process-authority:v1 axis=specialist_workflow id=SCREEN_DESIGN -->

> requirements v1.3.13 → registry v1.1.5 → generated catalog が意味authorityである。旧catalogは
> compatibility-onlyであり、current identityやroute判断へ再出力しない。

# Forward工程専門workflow

工程専門は独立したworkflow model、PLAN kind、専門職drive、execution modeではなく、選択済みstyle内で
条件に応じて発火するspecialist workflowである。current identityは
`specialist_workflow:SCREEN_DESIGN`として保持し、`workflow_model`や旧`mode`へ畳み込まない。

`frontend-design`はこのspecialist workflowに付随する実装・検証手順であり、独立したclassification enumを
新設しない。画面設計の適用可否、UI contract、実装後のvisual／a11y確認を同じtyped evidenceへ束縛する。

## 画面設計（screen-design）

- layer/pair: L2↔L11
- entry: `screen_requirement_gap`、`wireframe_missing`、`screen_impl_pair_gap`
- artifacts: screen list、screen flow、wireframe、UI elements、prototype agreementまたはno-UI receipt
- exit: L2↔L11 pair currentかつ、画面適用性判断がcurrent
- 禁止: 静的wireframeだけを操作可能prototypeや利用者合意として扱わない

## フロントエンド設計（frontend-design）

- layer/pair: L10↔L3
- entry: `a11y_regression`、`visual_regression`、`token_drift`、`ux_feedback`
- artifacts: visual、design token、a11y、VRT、UX reviewの実装後証拠
- exit: L3↔L10 pair currentかつ、real implementation evidence current
- 禁止: L2のprototype工程をL10へ先送りしない。screenshot単体をUX完了証拠にしない

## 共通収束

各workflowのfindingは現在behavior contractを破る場合だけ現PRのblockerにする。設計改善候補は
親Issueへ階層化して後続へ送り、専門工程を無限review loopにしない。

## 正本・証跡境界

- signal／work itemから専門工程を直接推測せず、選択済みdevelopment styleとtyped conditionを入力にする。
- `registry_version`、`registry_source_digest`、`target_axis`、`target_id`をIssue、PLAN、PR、DB、right-arm evidenceへ束縛する。
- L1-L12のpairとForward reentryを満たすまで、screenshotや静的wireframeだけで完了を宣言しない。
- legacy `mode`／`model`／旧route名はinput-only compatibilityとしてのみ読み、current outputへ再出力しない。
