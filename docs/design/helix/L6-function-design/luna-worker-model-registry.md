---
title: "Luna worker model registry機能設計"
layer: L6
artifact_type: function-design
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
authority: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
plan: docs/plans/PLAN-L7-639-luna-worker-model-registry.md
pair_artifact: docs/test-design/helix/L8-luna-worker-model-registry-unit-test-design.md
github_issue_id: 624
behavior_contract_id: CODEX-NATIVE-WORKER-MODEL-001
responsibility_owner: codex-native-worker-model-registry
---

# Luna worker model registry

## 責務

Codex T1/native workerのcurrent model identityを`gpt-5.6-luna`へversion-upし、standard reasoning effortを
`xhigh`へ束縛する。Solはfrontier parentのまま、Terraはhistorical pricing／receiptだけに残す。

## current projection

| field | value |
|---|---|
| `MODEL_IDS.codex.worker` | `gpt-5.6-luna` |
| standard effort | `xhigh` |
| API input／cached／output per 1M | `$0.20 / $0.02 / $1.20` |
| proposal T1 effort | `xhigh` |

価格根拠は2026-08-21確認のOpenAI公式GPT-5.6 Luna model pageとする。長context、cache write、subscription
creditは本registryのstandard short-context fallbackへ混載しない。

## 不変条件

- `gpt-5.6-sol`はparent/frontierでありworkerへ投影しない。
- `gpt-5.6-terra`をcurrent worker fallbackへ戻さない。
- historical usage再計算用Terra pricingを削除・Luna価格へ書き換えない。
- direct spawn admissionは後続contractとし、本registry greenだけでspawnを許可しない。
