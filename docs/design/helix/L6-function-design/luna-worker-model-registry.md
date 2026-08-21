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

# Luna worker model registry機能設計

## 責務

Codex T1/native workerのcurrent model identityを`gpt-5.6-luna`へversion-upし、standard reasoning effortを
`xhigh`へ束縛する。Solはfrontier parentのまま、Terraはhistorical pricing／receiptだけに残す。

## 現行projection

| field | value |
|---|---|
| `MODEL_IDS.codex.worker` | `gpt-5.6-luna` |
| standard effort | `xhigh` |
| API価格 input／cached／output（100万token単位） | `$0.20 / $0.02 / $1.20` |
| proposal T1 effort 上限 | `xhigh`（effort 自体は lane model の標準 effort から導出する） |

proposal lane の effort authority は **lane に載る model の標準 effort**（`standardEffortForModel`）で
あり、lane tier は `capEffort` による**上限**としてのみ働く（Issue #881）。tier だけで effort を決めると
`model: lane.model` と `effort` が別経路になり、T1 lane に何の model を載せても `xhigh` になる。
本 registry が worker 既定を `gpt-5.6-luna`（標準 `xhigh`）に保つ限り T1 の投影値は `xhigh` のままだが、
それは **model 由来の結果**であって tier 由来の固定値ではない。責務境界の正本は
`docs/design/helix/L6-function-design/proposal-lane-effort-binding.md` とする。

価格根拠は2026-08-21確認のOpenAI公式GPT-5.6 Luna model page
（`https://developers.openai.com/api/docs/models/gpt-5.6-luna`）とする。同pageが示すtext tokenの
input／cached input／output単価だけを投影し、長context、cache write、subscription creditは本registryの
standard short-context fallbackへ混載しない。

## 不変条件

- `gpt-5.6-sol`はparent/frontierでありworkerへ投影しない。
- `gpt-5.6-terra`をcurrent worker fallbackへ戻さない。
- historical usage再計算用Terra pricingを削除・Luna価格へ書き換えない。
- direct spawn admissionは後続contractとし、本registry greenだけでspawnを許可しない。
