---
title: "xhigh reasoning effort schema機能設計"
layer: L6
artifact_type: function-design
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
authority: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
plan: docs/plans/PLAN-L7-638-xhigh-reasoning-effort-schema.md
pair_artifact: docs/test-design/helix/L8-xhigh-reasoning-effort-schema-unit-test-design.md
github_issue_id: 624
behavior_contract_id: CODEX-NATIVE-WORKER-EFFORT-001
responsibility_owner: codex-native-worker-effort-schema
---

# xhigh reasoning effort schema

## 目的

`CNW-R-02`を実装するため、Codex native workerが要求する`xhigh`をreasoning effortのcurrent exact
valueへ追加する。model identityとspawn policyは別contractとし、この設計はeffort value objectだけを所有する。

## 契約

### effort exact set

current exact setは`low | medium | high | xhigh`とする。team schema、model policy、model registry validatorは
同じsetを受理し、未知値をfail-closeする。

### adaptive ladder

順序は`low → medium → high → xhigh`とする。`shallow`だけがtrueなら一段上げ、`tooSlow`だけがtrueなら
一段下げる。`xhigh`での上昇と`low`での下降は据え置き、両signalまたは無signalも据え置く。

## 不変条件

- `xhigh`追加をmodel IDやpricing変更の根拠にしない。
- callerのexplicit effort許可とpolicy-derived effortは既存fieldで区別する。
- historical receiptに記録済みの`low | medium | high`を書き換えない。

## failure

- consumer間のexact set drift
- `high`を上限のまま残す退行
- `xhigh`からの上昇、未知値のsilent fallback
