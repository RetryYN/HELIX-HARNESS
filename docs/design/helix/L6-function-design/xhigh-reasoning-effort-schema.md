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

# xhigh reasoning effort schema機能設計

## 目的

`CNW-R-02`を実装するため、Codex native workerが要求する`xhigh`をreasoning effortのcurrent exact
valueへ追加する。model identityとspawn policyは別contractとし、この設計はeffort value objectだけを所有する。

## 契約

### effortの正確な値集合

current exact setは`low | medium | high | xhigh`とする。team schema、model policy、model registry validatorは
同じsetを受理し、未知値をfail-closeする。

### 適応境界

順序は`low → medium → high → xhigh`とする。ただし`xhigh`への到達は`CNW-R-02/03`の
requirements-owned policyがLuna native workerへ明示導出する場合に限定する。genericな`shallow` signalは
`low → medium → high`まで一段上げ、既存`high` modelを`xhigh`へ自動昇格させない。`tooSlow`だけがtrueなら
`xhigh → high → medium → low`へ一段下げる。上限／下限、両signal、無signalは据え置く。

## 不変条件

- `xhigh`追加をmodel IDやpricing変更の根拠にしない。
- 既存modelのstandard effortとgeneric adaptation上限を暗黙変更しない。
- callerのexplicit effort許可とpolicy-derived effortは既存fieldで区別する。
- historical receiptに記録済みの`low | medium | high`を書き換えない。

## failure

- consumer間のexact set drift
- generic adaptationだけで既存`high` modelを`xhigh`へ昇格するscope逸脱
- `xhigh`からの上昇、未知値のsilent fallback
