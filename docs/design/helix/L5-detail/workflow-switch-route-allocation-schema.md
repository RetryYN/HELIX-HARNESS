---
title: "workflow switching／routing／allocation typed decision schema 詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
plan: docs/plans/PLAN-L5-102-workflow-switch-route-allocation-schema.md
parent_design: docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md
pair_artifact: docs/test-design/helix/L8-workflow-switch-route-allocation-schema-unit-test-design.md
---

# workflow switching／routing／allocation typed decision schema 詳細設計

## 1. schema正本

current schemaは`helix-workflow-decision-envelope.v1`である。rootは`schema_version`、`workflow_identity`、
`decision_context`、`switch_contract`、`route_contract`、`allocation_contract`、`measurement_binding`、
`publication_binding`、`proposal_authority`のexact 9 fieldだけを持つ。unknown field、欠落field、型違反を
拒否し、既定値、provider名、benchmark score、旧`mode`／`model`／`catalog_route_id`／`route_class`から補完しない。

parserはinputを変更せず、成功時にcanonical value、失敗時にstable failure codeとJSON pointerを返す。
clock、network、DB、Git、GitHub、worker dispatchへ触れないpure contractとする。

## 2. workflow identityとdecision context

`workflow_identity`は`target_axis`、`target_id`、`registry_version`、`registry_source_digest`のexact setである。
digestは`sha256:<64 lowercase hex>`、versionはregistryのcurrent exact value、axis／IDはrequirements registryの
typed identityとして照合する。generated catalogは存在projectionの照合材料に限り、意味authorityにはしない。

`decision_context`は`decision_id`、`candidate_head`、`facts_digest`、`policy_version`、`policy_digest`、
`unresolved`、`evidence_refs`のexact setである。HEADは40 lowercase hex、digestはsha256、配列はstable IDで
重複不可とする。blocking unresolvedが1件以上なら`decision_required`であり、proposalをexecutableにしない。

## 3. switch契約

`switch_contract`のexact setは次である。

| field | contract |
|---|---|
| `decision_point_id` | 非空stable ID |
| `candidates` | 1件以上の`candidate_id`、`workflow_identity`、`capability_refs`、`capacity_evidence_ref`、`enabled` |
| `selection_rule` | version／digest／objectiveの完全束縛 |
| `fallback_order` | candidatesの重複なしsubset。元constraintを緩和しない |
| `reassessment_triggers` | 1件以上のtyped eventまたはcurrent measurement binding |

disabled candidateの選択、candidate外fallback、fallback cycle、capacity evidence欠落、reassessment 0件を
`switch_contract_invalid`で拒否する。candidate順をscore順と推測せず、selection ruleだけが順序authorityを持つ。

## 4. route契約

`route_contract`は`source`、`destinations`、`capability_constraints`、`capacity_constraints`、`routing_rule`、
`fallback_routes`、`dead_letter`のexact setである。destinationは`destination_id`、typed workflow identity、
capability/capacity evidence refを持つ。capabilityとcapacityを別配列として評価し、一方のgreenで他方を相殺しない。

`dead_letter`は`reason_codes`、`reassessment_condition`、`retention_policy_ref`を必須とする。destination 0、unknown
capability、capacity超過、fallback cycle、元constraintを緩和するfallback、reason／再評価条件欠落を
`route_contract_invalid`で拒否する。

## 5. allocation契約

`allocation_contract`のexact setは`priority`、`deadline`、`capability_requirement`、`capacity_requirement`、
`concurrency_limit`、`cost_limit`、`budget_ref`、`objective`、`fairness_policy`、`preemption_policy`、
`reallocation_policy`、`degradation_policy`、`fallback_allocation`である。

- `priority`はbounded integer、`deadline`はcaller注入UTC RFC 3339とし、wall clockで補完しない。
- capacityとconcurrency、cost limitとbudget、priorityとfairnessは独立axisとして保持する。
- preemptionはtrigger、対象、上限、fence、復帰条件を必須とし、無制限または自己preemptionを拒否する。
- reallocationとdegradationはtrigger、上限、復帰条件を持ち、fallbackも元capability／budget constraintを維持する。

over-capacity、unknown budget、期限不正、fairness欠落、unbounded preemption、復帰条件なしdegradationを
`allocation_contract_invalid`で拒否する。

## 6. measurement束縛

`measurement_binding`は`contract_id`、`contract_version`、`contract_digest`、`candidate_head`、`dataset_digest`、
`history_digest`、`evaluated_at`、`metrics`のexact setである。metricsはquality、latency、cost、queue、failure、
fallback_rate、misdecision_rate、human_override、driftをexact 9件持ち、各metricはdeclaration ID、observation ID、
evaluation receipt digest、statusを保持する。

statusは`green|red|unknown`であり、全9件greenかつHEAD／dataset／contract current時だけmeasurementを満たす。
missing、stale、non-representative、threshold fail、hard-limit fail、red、unknownをtest greenで相殺せず、
`measurement_binding_invalid`または`measurement_not_green`を返す。#193／#220／#221のschemaやhistoryを複製しない。

## 7. publication束縛

`publication_binding`はdiscriminated unionとする。

| kind | exact fields | ready条件 |
|---|---|---|
| `full_v` | `kind`、`workflow_revision`、`l1_l5_freeze_digest`、`pair_receipt_digests` | L1〜L5 freezeとcurrent pair exact setが同revision |
| `production_scrum` | `kind`、`workflow_revision`、`slice_delta_digest`、`sr0_sr4_receipt_digests`、`system_backfill_digest` | SR0〜SR4 exact 5件とsystem backfillが同revision |

部分freeze、pair欠落、SR receipt 4件以下、slice-only green、revision driftを`publication_binding_invalid`で拒否する。

## 8. proposal authorityとresult

`proposal_authority`は`proposal_only:true`、`commit_authority:false`、`dispatch_authority:false`、
`approval_required`、`authority_digest`のexact setである。booleanを反転または欠落させた入力を
`proposal_authority_invalid`で拒否する。

成功resultは`schema_version`、`decision_id`、`candidate_head`、`disposition`、`selected_candidate_id`、
`route_destination_ids`、`allocation_summary_digest`、`measurement_receipt_digest`、`publication_receipt_digest`、
`findings`のexact setを持つ。dispositionは`proposed|decision_required|rejected`だけで、`approved`、`committed`、
`dispatched`を持たない。failure順はidentity、context、switch、route、allocation、measurement、publication、authorityとする。

## 9. L8 pairと後続境界

`U-UWJSCHEMA-001..015`がroot strictness、identity、各contract、axis独立、measurement、publication、proposal-only、
immutability、failure順を反証する。L6/L7は本schemaのparser／planner／evaluatorを実装し、L9 compositionへ接続する。
本設計はDB table、CLI、assignment lease、notification fabric、provider adapter、#635 guide injectionを実装しない。

## 10. 設計実在性束縛

runtime assetは後続L6/L7で追加する。未実装の型やfailure codeを実在扱いしない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
