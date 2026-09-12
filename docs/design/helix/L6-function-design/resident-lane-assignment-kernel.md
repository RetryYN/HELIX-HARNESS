---
canonical_vmodel: L1-L12
canonical_layer: L6
canonical_pair: L7
title: "Resident Lane Assignment pure kernel 機能設計"
layer: L6
kind: add-design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
plan: PLAN-L7-860-resident-lane-assignment-kernel
parent_design: docs/design/helix/L5-detail/resident-lane-assignment-contract.md
pair_artifact: docs/plans/PLAN-L7-860-resident-lane-assignment-kernel.md
---

# Resident Lane Assignment pure kernel 機能設計

## Public API

- `residentLaneAssignmentSchema`
- `projectResidentLaneAssignments(raw)`
- `evaluateAssignmentReviewReturn(input)`
- `evaluateAssignmentTakeover(input)`

すべてpure functionとし、filesystem、Git、GitHub、DB、clock、environmentを読まない。観測時刻とremote HEADはcallerが
typed inputとして渡し、kernelは欠落値を推測しない。出力はeffect commandではなくadmission decisionまたは新しいvalue objectである。

## L7実装束縛

実装正本は`src/runtime/resident-lane-assignment.ts`、oracleは`tests/resident-lane-assignment.test.ts`とする。
event payload/reducer/query、production loader、#1256 adapterは本moduleへ追加せず、L4の後続順序で別module・別atomにする。
