---
canonical_vmodel: L1-L12
canonical_layer: L9
canonical_pair: L4
title: "Resident Lane Assignment管理境界 結合テスト設計"
layer: L9
kind: add-design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: QA / Codex TL
plan: PLAN-L7-860-resident-lane-assignment-kernel
parent_design: docs/test-design/helix/resident-lane-orchestration-acceptance.md
pair_artifact: docs/design/helix/L4-basic-design/resident-lane-assignment-boundary.md
---

# Resident Lane Assignment管理境界 結合テスト設計

## 現sliceの判定

pure kernelは外部I/Oを持たないため、本sliceでは結合を実行したと偽装しない。L4境界の接続点と後続oracleを固定し、
event adapter導入時に同じ契約revisionへ束縛して実行する。

| Oracle | 接続 | 合格条件 |
|---|---|---|
| `IT-RLA-001` | Assignment payload → event journal → replay | payload実体または不変参照から同一projectionを復元する |
| `IT-RLA-002` | historical event → current writer admission | 過去HEADを保存しつつ、current writeはcurrent HEAD/lease/fenceだけを受理する |
| `IT-RLA-003` | Assignment query → #1256 reservation | active writer exact setを渡し、競合規則をadapterへ複製しない |
| `IT-RLA-004` | #1771 role relation → #860 Assignment | required roleを照合し、relation側でlease/lifecycleを更新しない |
| `IT-RLA-005` | restart → checkpoint/replay | provider会話なしで同一owner、branch、HEAD、fenceへ収束する |

これらは後続atomの必須条件であり、本pure sliceのgreen条件には数えない。
