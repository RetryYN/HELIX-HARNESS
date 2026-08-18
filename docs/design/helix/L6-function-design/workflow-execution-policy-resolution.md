---
title: "workflow execution policy resolution機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
plan: docs/plans/PLAN-L7-565-workflow-execution-policy-resolution.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-policy-resolution-runtime-unit-test-design.md
---

# workflow execution policy resolution機能設計

## 責務

requirements-owned execution policy registryのtyped bindingを解決し、consumer contractに定義された
dispositionだけを返す。未登録policyは`policy_unsupported`、同一precedenceの複数一致は
`policy_ambiguous`としてfail-closeし、旧短縮tokenをcurrent outputへ再出力しない。

## 契約

- `U-WFEPOLRES-001`: exact bindingは`resolved`と登録済みbindingを返す。
- `U-WFEPOLRES-002`: identityまたはrisk combination未登録は`policy_unsupported`を返す。
- `U-WFEPOLRES-003`: schema通過後のintegrity driftで同一precedenceの複数bindingが生じても
  `policy_ambiguous`を返す。canonical registryの重複自体はschemaで先に拒否する。
- `U-WFEPOLRES-004`: 旧`unsupported`／`ambiguous` tokenをcurrent resolver出力へ戻さない。
- `U-WFEPOLRES-005`: design catalog登録をG3 freeze digestへ伝播する。

旧route-map、15-route catalog、legacy modeはpolicy resolutionの意味authorityにしない。
