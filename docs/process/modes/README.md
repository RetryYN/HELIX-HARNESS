---
title: "HELIX workflow分類索引"
status: confirmed
authority: docs/governance/helix-harness-requirements_v1.3.md
registry: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
catalog_projection: config/workflow-classification-catalog.v1.json
legacy_catalog: config/drive-route-catalog.json
legacy_catalog_role: compatibility_inventory
---

# HELIX workflow分類索引

## 1. 正本境界

workflow分類の意味authorityはrequirementsであり、versioned registryがmachine-readable mirror、
`config/workflow-classification-catalog.v1.json`がgenerated projectionである。
`config/drive-route-catalog.json`の旧15-route集合はmigration、drift監査、legacy input読込のための
compatibility inventoryに限り、current identity、件数、親子関係、CLI、DB、生成文書の判断正本にしない。

current primary identityは次のexact tupleである。

```text
registry_version + registry_source_digest + target_axis + target_id
```

旧`mode`／`model`はinput-only compatibility adapterへ一方向変換し、変換元とwarningをreceiptへ残す。
曖昧な`forward`、`scrum`、`design-bottomup`、`verification`は推測せずfail-closeする。
legacy identityをcurrent PLAN、Issue、PR、DB、doctor、CLI、生成文書へ再出力しない。

## 2. 独立axis

| axis | current identity | process文書 |
|---|---|---|
| development style | `FULL_L1_L12_V` | [Forward L1–L12](../forward/overview.md) |
| development style | `PRODUCTION_SCRUM` | [Production Scrum](scrum.md) |
| development style | `V_DESIGN_SCRUM_IMPLEMENTATION` | [V設計＋Scrum実装Hybrid](scrum.md) |
| case-driven model | `DISCOVERY_POC` | [Discovery PoC](discovery.md) |
| workflow model | `REVERSE` | [Reverse](reverse.md) |
| workflow model | `RECOVERY` | [Recovery](recovery.md) |
| workflow model | `INCIDENT` | [Incident](incident.md) |
| workflow model | `REFACTOR` | [Refactor](refactor.md) |
| workflow model | `RETROFIT` | [Retrofit](retrofit.md) |
| workflow model | `RESEARCH` | [Research](research.md) |
| workflow model | `ADD_FEATURE` | [Add Feature](add-feature.md) |
| workflow model | `VERSION_UP` | [Version Up](version-up.md) |
| workflow model | `REDESIGN` | requirements registry（専用process projectionは後続） |
| workflow model | `DESIGN_REFACTOR` | requirements registry（専用process projectionは後続） |
| workflow model | `PERFORMANCE_REFACTOR` | requirements registry（専用process projectionは後続） |
| subroute | `SCRUM_REVERSE` | [Production Scrum／Hybrid](scrum.md) |

この表は異なるaxisを一つのroute enumへ畳み込む一覧ではない。各行の`target_axis`と`target_id`を
組として扱う。PLAN kind、専門職drive、execution mode、specialist workflow、specialist capabilityも
別axisであり、workflow identityの代用にしない。

## 3. state machineと親子関係

- `DISCOVERY_POC_S0_S4`は`DISCOVERY_POC`だけを親とする。
- `SCRUM_REVERSE`は`PRODUCTION_SCRUM`または`V_DESIGN_SCRUM_IMPLEMENTATION`を親とする。
- `SCRUM_REVERSE_SR0_SR4`は`SCRUM_REVERSE`だけを親とする。
- Production Scrum自体をDiscoveryのS0–S4へ入れず、DiscoveryをScrum phaseとして扱わない。
- Discovery／Production Scrumは S3 verified evidence で終端せず、S4 `decision_outcome=confirmed` → L1 要求定義へ再合流する。
- Full V、Production Scrum、Hybridのdevelopment styleはL3 freezeで明示選択し、signalから推測しない。

## 4. 実行線

`signal / work item → target_axis + target_id → execution policy → workflow`を正規導出線とする。
unknown、unsupported、ambiguous、decision pendingを別dispositionで保持し、Full V fallbackで成功扱いしない。

選択済みidentityはIssue、PLAN、PR、DB episode、current-location、right-arm evidenceへ同じregistry version、
digest、axis、IDで投影する。HEAD、behavior contract、responsibility owner、dependency frontierが変われば
証拠をstale化し、legacy greenでcurrent failureを相殺しない。

## 5. L1–L12再入

current canonicalはL1–L12、L0 charterは層外authority anchorである。旧L0–L14のpathやIDは
compatibility projectionとしてだけ読み、current pair判定へ直接入力しない。

DiscoveryはS4採用判断後に選択済みdevelopment styleへ接続する。Production Scrum／Hybridの各sliceは
`SCRUM_REVERSE`のSR0–SR4でL1–L5をbackfillし、pair freeze後にForwardへ再入する。
workflow modelは目的を満たした後、影響するrequirements／design layerへ有限遷移で再入する。
