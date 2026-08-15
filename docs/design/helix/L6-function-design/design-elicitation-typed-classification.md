---
title: "design elicitation typed workflow分類機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
plan: docs/plans/PLAN-L7-570-design-elicitation-typed-classification.md
pair_artifact: docs/test-design/helix/L8-design-elicitation-typed-classification-unit-test-design.md
---

# design elicitation typed workflow分類機能設計

backend由来の画面要求を、旧`design-bottomup` modeではなく、`SCREEN_DESIGN` specialist workflow、
`backend_derived` trigger condition、`DISCOVERY_POC` case-driven modelの直交する3軸として合成する。
entry signalはrequirements-owned typed routerで再検証し、一意なDiscovery分類にならなければ生成しない。

- `U-DESIGNELIC-001`: `design_uncertain`を`DISCOVERY_POC`へ一意に分類する。
- `U-DESIGNELIC-002`: specialist workflow、trigger、case modelを別fieldで返す。
- `U-DESIGNELIC-003`: current outputへ旧`mode`／`model`／catalog route identityを再出力しない。
- `U-DESIGNELIC-004`: design／test design登録をG3 freeze digestへ伝播する。

旧`routeSignalToMode` exportや他consumerは本sliceで一括削除せず、各責務ownerの原子的移行後に除去する。
