---
title: "workflow switching／routing／allocation 基本設計"
layer: L4
kind: add-design
artifact_type: design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
plan: docs/plans/PLAN-L4-75-workflow-switch-route-allocation-boundary.md
pair_artifact: docs/test-design/helix/L9-workflow-switch-route-allocation-system-test-design.md
related_l3: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
---

# workflow switching／routing／allocation 基本設計

## 1. 目的とauthority

本設計は`UWJ-FR/AC-011..015`をL4 system境界へ降下する。意味authorityはrequirements-owned workflow registryの
`target_axis`、`target_id`、`registry_version`、`registry_source_digest`である。
generated catalogはidentity存在確認用projectionに限定し、旧`mode`／`model`／`catalog_route_id`／
`route_class`やprovider名からcurrent identityを推測しない。

## 2. component境界

| component | 責務 | authority | failure |
|---|---|---|---|
| `WorkflowIdentityAdmissionPort` | typed identityとregistry digestをexact照合 | requirements registry read-only | stale/unknown identity、legacy入力 |
| `WorkflowSwitchBoundary` | decision point、candidate set、enable/disable、selection rule、fallback、reassessment trigger | proposal生成だけ | 必須欠落、disabled選択、fallback/reassessment欠落 |
| `WorkflowRouteBoundary` | source、destinations、capability/capacity constraint、rule、fallback、dead-letter | route proposalだけ | destination 0、constraint違反、fallback/dead-letter欠落 |
| `WorkflowAllocationBoundary` | priority、deadline、capability、capacity、concurrency、cost/budget、objective、fairness/preemption、reallocation、degradation、fallback | allocation proposalだけ | over-capacity、budget不明、fairness/preemption欠落 |
| `WorkflowMeasurementBindingPort` | #193 declaration/evaluationと#221 historyのversion/digest/currentnessを参照 | measurement read-only | missing/stale/fail、別contract、別HEAD/dataset |
| `ProposalAuthorityPort` | #187のproposal-only境界へ接続 | commit/dispatch authority 0 | 自己承認、direct DB/Git/GitHub/worker write |
| `WorkflowPublicationBoundary` | Full V freezeとScrum SR0..SR4 backfillをrelease前に照合 | release readiness判定だけ | 部分freeze、slice-only publication、backfill欠落 |

## 3. 正規入力envelope

system境界の入力は次の6区画をcompositionする。

1. `workflow_identity`: typed axis／IDとregistryのversion／digestを保持する。
2. `decision_context`: 事実、policy制約、未解決事項、候補evidenceを保持する。
3. `switch_contract`: UWJ-FR-011 exact fields。
4. `route_contract`: UWJ-FR-012 exact fields。
5. `allocation_contract`: UWJ-FR-013 exact fields。
6. `measurement_binding`と`publication_binding`: UWJ-FR-014/015の外部authority reference。

L4はfield型やscore式を確定しない。L5でstrict schemaへ降下するまで、任意field補完やdefault fallbackを許可しない。

## 4. stateとauthority

`received → identity_admitted → proposal_valid → constraints_satisfied → measurement_current → publication_ready`
だけをrelease候補経路とする。各段階はread-only decision receiptを返し、commit/dispatchを行わない。
failureは`rejected`、一意に判断できない入力は`decision_required`へ分離し、暗黙fallbackでgreenにしない。
全拒否経路はside effect 0とし、DB／Git／GitHub／worker writeへ到達しない。

`CHANGES_REQUESTED`のような実行通知、assignment lease、resident lane配送は#819配下のcontrol plane責務であり、
本境界は決定proposalを返すだけである。

## 5. switching／routing／allocationの不変条件

- candidateはtyped capabilityとcurrent capacity evidenceを持ち、provider名やbenchmark score単独で選ばない。
- routeは`capability constraint`と`capacity constraint`を別軸として検証する。
- fallbackは元候補と同じconstraintを満たし、dead-letterはroute不能理由と再評価条件を保持する。
- concurrencyとcapacity、costとbudget、priorityとfairnessを別軸として保持し、一方のgreenで他方を相殺しない。
- preemption、reallocation、degradationはtrigger、対象、上限、復帰条件を持つ。
- reassessmentはmeasurement/historyのcurrent receiptか明示eventでのみ起動し、wall clock推測を使わない。
- unresolved blocking項目とpolicy failureがあるproposalを実行可能にしない。

## 6. measurementとpublication

判断固有metric mappingはquality、latency、cost、queue、failure、fallback rate、misdecision rate、
human override、driftを#193の共通measurement contractへbindする。schema、threshold、historyを複製しない。
missing／stale／non-representative／threshold fail／hard-limit failをtest greenで相殺しない。

Full Vはsystem workflow全体のL1〜L5 freezeとcurrent pairを要求する。Production Scrumのslice deltaは許容するが、
review/release前にSR0〜SR4とsystem workflow backfillが同じrevisionへ収束しなければpublicationを拒否する。

## 7. 非対象

- score algorithm、schema field型、planner/evaluator実装、DB table、CLI、provider adapter。
- #635 workflow guide生成／SessionStart injection。
- #819のassignment／lease／notification fabric。
- `src/workflow/routing-contracts.ts`のlegacy mode routing移植。

## 8. trace

| requirement | L4 concern | L9 oracle |
|---|---|---|
| UWJ-FR/AC-011 | switchのexact境界 | IT-UWJ-011 |
| UWJ-FR/AC-012 | routeのexact境界 | IT-UWJ-012 |
| UWJ-FR/AC-013 | allocationのexact境界 | IT-UWJ-013 |
| UWJ-FR/AC-014 | measurement束縛とfail-close | IT-UWJ-014 |
| UWJ-FR/AC-015 | Full V／Scrumのpublication | IT-UWJ-015 |

IT-UWJ-011..013はL9 composition境界でL8 contractのbinding欠落を検出する。field型、schema cardinality、
局所判断のexact field oracleは後続L5↔L8が所有し、L9で再定義しない。

## 9. 設計実在性束縛

runtime assetは後続L6/L7で追加する。本設計sliceでは未実装を既存assetとして主張しない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
