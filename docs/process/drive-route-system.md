---
title: "Workflow分類と実行経路のtyped authority"
status: confirmed
authority: docs/governance/helix-harness-requirements_v1.3.md
registry: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
catalog: config/workflow-classification-catalog.v1.json
legacy_catalog: config/drive-route-catalog.json
---

# Workflow分類と実行経路のtyped authority

## 1. 正本境界

本書は、観測signalをrequirements-owned classificationへ接続する運用手順である。
意味の正本はrequirements v1.3.12、機械的な分類registryはversioned registry、
`config/workflow-classification-catalog.v1.json`はそのgenerated projectionである。
`config/drive-route-catalog.json`は旧route名のcompatibility inventoryであり、current identity、
signalの意味判断、Issue／PLAN／PR／DB／doctorの正本には使わない。

旧`mode`／`model`／旧route名をcurrent outputへ再出力しない。legacy入力はcompatibility
adapterで一方向にtyped identityへ変換し、変換元とwarningをreceiptへ残す。未対応または
曖昧な入力は推測せず`unsupported`／`ambiguous`としてfail-closeする。

## 2. 異なる分類軸

同じenum、CLI引数、DB fieldへ異なる軸を畳み込まない。

| 軸 | current identity | 役割 |
|---|---|---|
| development style | `FULL_L1_L12_V`、`PRODUCTION_SCRUM`、`V_DESIGN_SCRUM_IMPLEMENTATION` | production deliveryの分割様式 |
| case-driven model | `DISCOVERY_POC` | S0〜S4で不確実性と実現性を検証する案件駆動モデル |
| workflow model | `REVERSE`、`RECOVERY`、`INCIDENT`、`REFACTOR`、`RETROFIT`、`RESEARCH`、`ADD_FEATURE`、`VERSION_UP`等 | 現在のsignalを処理するworkflow |
| subroute | `SCRUM_REVERSE` | Production Scrum／Hybrid sliceをSR0〜SR4でV-pairへ戻す経路 |
| state machine | `DISCOVERY_POC_S0_S4`、`SCRUM_REVERSE_SR0_SR4` | 親identityに束縛された状態遷移 |
| specialist drive | `BE`、`FE`、`FULLSTACK`、`DB`、`AGENT` | 担当専門職 |
| PLAN kind | `design`、`impl`、`add-design`、`add-impl`、`reverse`等 | 1 PLANの変更内容 |
| execution mode | `STANDALONE`、`CLAUDE_ONLY`、`CODEX_ONLY`、`HYBRID` | runtime編成 |
| specialist workflow | `SCREEN_DESIGN`等 | 選択済みworkflow内の専門工程 |
| specialist capability | `DESIGN_HARNESS`、`UNIVERSAL_WORKFLOW`、`NFR_MEASUREMENT`等 | workflowを置換せず補助する能力 |

各identityは`target_axis`と`target_id`のtyped tupleで保持する。Production Scrumは
`development_style`であり、Discoveryと同じ`case_driven_model`へ再分類しない。Reverseや
Recoveryは`workflow_model`であり、専門職drive、PLAN kind、execution modeではない。

## 3. 正規導出線

```text
signal／work item
  → requirements registryのtarget_axis／target_id
  → state machine／execution policy／specialist binding
  → workflow receipt
  → Issue／PLAN／PR／DB current-location／right-arm evidence
```

signalから直接branch名、PLAN kind、専門職、runtime modeを推測しない。signal bindingが
`unresolved_until_decision`を返す場合はdecision gateへ送り、decision前にworkflowを確定しない。
execution policyはtyped identityから一方向に導出し、production impact、destructive data
operation、credential access、backend-derived等のconditionを明示入力として受け取る。

## 4. signalの代表的な接続

| signal群 | 導出先 |
|---|---|
| `drift` | `workflow_model:REVERSE` |
| `debt_degradation`、`code_smell`、`structural` | `workflow_model:REFACTOR` |
| `dependency_outdated`、`upgrade`、`config_drift` | `workflow_model:RETROFIT` |
| `agent_runaway`、`context_exhaustion`、`regression_dev`、`forced_stop` | `workflow_model:RECOVERY` |
| `production_incident`、`hotfix_required`、`regression_prod` | `workflow_model:INCIDENT` |
| `feature_addition`、`scope_extension` | `workflow_model:ADD_FEATURE` |
| `version_deferral` | `workflow_model:VERSION_UP` |
| `requirement_undefined`、`feasibility_unknown`、`success_condition_unclear` | `case_driven_model:DISCOVERY_POC` |
| `tech_decision_required`、`option_comparison_needed`、`adr_required` | `workflow_model:RESEARCH` |
| `user_feedback_iteration`、`requirement_continuous_refinement` | decision `IMPACT_CLASSIFICATION`（未決定のまま保持） |

signal bindingの完全な値はregistry／generated catalogを参照する。短縮表の列挙を新しい
exact setとして扱わない。

## 5. 互換入力と旧surface

旧`mode`／`model`や旧route名を受け取る場合だけcompatibility adapterを通す。変換可能な
`reverse`、`recovery`等はtyped workflow modelへ変換できるが、`scrum`、`forward`、
`design-bottomup`、`verification`のように複数軸へ対応する値は曖昧として拒否する。

旧catalogは移行対象の名称・branch・履歴を棚卸しするためにだけ読む。旧catalogのroute IDを
requirementsのentity IDへ改名しただけの一覧を新正本として作らない。current surfaceへは
registry version、registry digest、target axis、target ID、親state machine、policy bindingを
投影し、legacy identityは再出力しない。

## 6. L1〜L12と証跡

production delivery styleをL3 freezeで明示し、DiscoveryのS4 confirmed後もstyleを推測せず
選択記録を残す。各workflowはL1〜L12の該当pairへ接続し、実行時は次を同じcontract、owner、
HEAD、revisionへ束縛する。

- Issue／work itemのtyped classification
- PLANのworkflow identityとkind
- PRのscope／behavior contract
- DB episodeとcurrent-location
- right-arm evidenceと独立exact-HEAD review

legacy側がgreenでもcurrent側のfailureを相殺しない。分類、state、policy、HEADまたは証跡が
変わったらstaleとして再評価し、Forwardへ戻す前に対応するV-pairとverification evidenceを
再接着する。

## 7. 完了規律

workflowの完了は文書やPLANの存在だけでは成立しない。current requirements、registry／catalog
digest、typed identity、state transition、execution policy、CI、独立review、DB convergence、
right-arm evidence、Forward再入の全てが同一HEADで確認できることを要求する。

本書の分類表を編集する場合はrequirementsまたはregistryを先に更新し、generated catalog、
runtime、CLI、DB、doctor、README、label、templateへ依存順に投影する。説明文だけを先に変更して
旧runtimeを正本として残す変更は受け入れない。
