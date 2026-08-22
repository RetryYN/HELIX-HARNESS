---
title: "workflow switching／routing／allocation L9 system test設計"
layer: L9
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L4-75-workflow-switch-route-allocation-boundary.md
parent_design: docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md
pair_artifact: docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md
---

# workflow switching／routing／allocation L9 system test設計

## 1. system境界

typed identity、AI proposal authority、measurement evidence、publication evidenceをswitch／route／allocation境界へ
compositionし、API／DB／queue／resource／authority接合でfalse-greenとside effect 0を検証する。
L5/L8 schemaとL6/L7 runtimeが未実装の間は、本書を実装完了証拠にしない。
identity入力は`target_axis`、`target_id`、`registry_version`、`registry_source_digest`をexact照合する。
`generated catalog`は存在確認projectionに限定し、意味authorityには昇格させない。

## 2. system検証oracle

### IT-UWJ-011 — switchingのexact contract

decision point、candidate set、enable/disable、selection rule、fallback、reassessment triggerを一つずつ欠落させ、
各caseを個別に拒否する。disabled candidate、fallbackのconstraint drift、stale reassessment evidenceも拒否し、
別candidateのgreenで相殺しない。

### IT-UWJ-012 — routingのexact contract

source、destinations、capability constraint、capacity constraint、rule、fallback、dead-letterを一つずつ欠落させる。
destination 0、unknown capability、capacity超過、fallback cycle、dead-letter reason/再評価条件欠落を拒否する。
legacy mode文字列からdestinationを補完しない。

### IT-UWJ-013 — allocationのexact contract

`priority`、`deadline`、`capability`、`capacity`、`concurrency`、`cost/budget`、`objective`、`fairness/preemption`、`reallocation`、
degradation、fallbackを一つずつ欠落させる。capacityとconcurrency、costとbudget、priorityとfairnessを
独立axisとして検査し、over-capacity、unknown budget、unbounded preemption、復帰条件なしdegradationを拒否する。

### IT-UWJ-014 — measurementの束縛

quality、latency、cost、queue、failure、fallback rate、misdecision rate、human override、driftの各mappingを
#193 declarationと#221 historyのversion/digest/HEAD/datasetへbindする。missing、stale、non-representative、
threshold fail、hard-limit failの各caseでcompletionとdispatchを0件にする。

### IT-UWJ-015 — Full V／Scrumのpublication

Full Vでsystem workflowのL1〜L5 freezeまたはcurrent V-pairを一つ欠落させ、release-readyを拒否する。
Production Scrumではslice deltaがgreenでもSR0〜SR4またはsystem workflow backfillが欠けるcaseを拒否する。
同じrevisionへ収束した時だけpublication-ready proposalを返す。

## 3. authorityのnegative matrix

| mutation | expected |
|---|---|
| registryのversion／digest drift | `identity_stale`、side effect 0 |
| `mode`／`model`／`catalog_route_id`／`route_class`だけを入力 | compatibility推測せず拒否 |
| AI proposalがcommit/dispatch authorityを主張 | authority denied、DB/Git/GitHub/worker write 0 |
| generated catalogだけを意味authorityとして提示 | requirements registry欠落で拒否 |
| provider名またはbenchmark score単独でcandidate選択 | capability/capacity evidence欠落で拒否 |
| fallback/dead-letterで元constraintを緩和 | constraint violation |
| measurement failureをtest greenで相殺 | completion denied |

## 4. system接合

L9 fixtureはidentity admission、proposal validator、measurement evaluator/history port、publication boundaryを
test doubleで結合し、入力・decision receipt・side-effect spyを観測する。未知field、欠落field、順序変更で
別failureがfirst-errorに隠れないようtable-drivenで各axisを独立反証する。

## 5. trace

| L4 component | oracle |
|---|---|
| WorkflowIdentityAdmissionPort | authorityのnegative matrix |
| WorkflowSwitchBoundary | IT-UWJ-011 |
| WorkflowRouteBoundary | IT-UWJ-012 |
| WorkflowAllocationBoundary | IT-UWJ-013 |
| WorkflowMeasurementBindingPort | IT-UWJ-014 |
| ProposalAuthorityPort | authorityのnegative matrix |
| WorkflowPublicationBoundary | IT-UWJ-015 |
