---
title: "workflow switching／routing／allocation schema L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L5-102-workflow-switch-route-allocation-schema.md
pair_artifact: docs/design/helix/L5-detail/workflow-switch-route-allocation-schema.md
---

# workflow switching／routing／allocation schema L8単体テスト設計

L6/L7実装前のためcitationは付けずdraftを維持する。文書tokenの存在だけをpassにせず、production parserへ同じ
table-driven mutationを接続した時に各failure codeとside effect 0を観測する。

| U-ID | 対象 | 反例と期待結果 |
|---|---|---|
| `U-UWJSCHEMA-001` | root exact set | 9 fieldを1件ずつ削除／unknown追加しschema failure。入力は不変 |
| `U-UWJSCHEMA-002` | workflow identity | axis／ID／version／digestを欠落・stale化しauthority drift。legacy identity補完0 |
| `U-UWJSCHEMA-003` | decision context | HEAD、facts/policy digest、unresolved/evidenceを個別変異。blocking unresolvedは`decision_required` |
| `U-UWJSCHEMA-004` | switch exact fields | 5 fieldを個別欠落し`switch_contract_invalid` |
| `U-UWJSCHEMA-005` | switch graph | disabled選択、candidate外fallback、cycle、reassessment 0件を拒否 |
| `U-UWJSCHEMA-006` | route exact fields | 7 fieldを個別欠落し`route_contract_invalid` |
| `U-UWJSCHEMA-007` | route constraints | destination 0、capability/capacity違反、fallback緩和、dead-letter欠落を拒否 |
| `U-UWJSCHEMA-008` | allocation exact fields | 13 fieldを個別欠落し`allocation_contract_invalid` |
| `U-UWJSCHEMA-009` | allocation axis独立 | capacity/concurrency、cost/budget、priority/fairnessを相互相殺すると拒否 |
| `U-UWJSCHEMA-010` | lifecycle policy | unbounded preemption、fence欠落、復帰条件なしreallocation/degradationを拒否 |
| `U-UWJSCHEMA-011` | measurement exact mapping | 9 metricを個別欠落、HEAD/dataset/historyをstale化しmeasurement failure |
| `U-UWJSCHEMA-012` | measurement status | red／unknown／non-representative／hard-limit failをtest greenで相殺すると拒否 |
| `U-UWJSCHEMA-013` | publication union | Full V pair欠落、Scrum SR 4件、backfill欠落、revision driftを拒否 |
| `U-UWJSCHEMA-014` | proposal authority | proposal-only以外、commit/dispatch true、approved dispositionを拒否しwrite 0 |
| `U-UWJSCHEMA-015` | determinism／failure順 | 同一inputのbyte-equivalent result、複数failureのstable順、input mutation 0 |

## mutation行列

各exact objectは全field deletion、unknown field insertion、型違反、境界値、配列重複を生成する。各axisの単独mutationで
期待failureへ到達し、先行identity failureで後段oracleを隠さないvalid baseline fixtureを共有する。旧mode routing、
provider名、benchmark scoreを投入してもcandidate、destination、allocationを生成しない。
