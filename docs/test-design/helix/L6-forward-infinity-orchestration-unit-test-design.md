---
title: "HELIX L7 単体テスト設計 — Forward Infinity orchestration"
layer: L6
executed_at_layer: L7
artifact_type: test_design
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-02
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-001
pair_artifact: docs/design/helix/L6-function-design/forward-infinity-orchestration.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-02
  - HAC-HIL-02a
  - HAC-HIL-02b
  - HAC-HIL-02c
---

# HELIX L7 単体テスト設計 — Forward Infinity orchestration

全testは固定clock/IDとin-memory portを使い、外部runtimeを起動しない。

## §1 主系atomic case

| HSTケース | 主unit | 事前状態 | 期待状態 | 正規failure | mutation oracle |
|---|---|---|---|---|---|
| `HST-CASE-001-04` | `U-FIO-001` | `assertion_input_ready` | `assertion_pass` | `HIL_CAUSALITY_JOIN_BROKEN` | node/edge/root/current digestを一項目ずつ欠落・重複・stale化し、全反例を個別findingへ返す |
| `HST-CASE-001-06` | `U-FIO-002` | `assertion_input_ready` | `assertion_pass` | `HIL_STATE_TRANSITION_INVALID` | state adjacency全辺と全非辺、逆行、自己、terminal追記を総当たりし、許可辺だけdecisionを返す |
| `HST-CASE-001-09` | `U-FIO-003` | `assertion_input_ready` | `assertion_pass` | `HIL_LOOP_BUDGET_UNBOUNDED` | 5軸ごとlimit-1/limit/limit+1、複数同時超過、負値/unknownを検査し上限時dispatch allowance 0 |

## §2 補助unit

| ID | function | 反例と直接assert |
|---|---|---|
| `U-FIO-004` | `startForwardRun` | handoff三digest、Issue revision、cause rootを各変異しrun plan 0 |
| `U-FIO-005` | `buildForwardCheckpoint` | 未完obligation順序をcanonical化し、空head/fence/policyを拒否 |
| `U-FIO-006` | `validateForwardResume` | head/revision/policy/evidence/fence/nonceを各変異しresume 0。同一nonce再送は増分0 |
| `U-FIO-007` | `commitForwardStep` | 各write位置faultとCAS競合でpartial 0、winner receipt exactly-one |
| `U-FIO-008` | `evaluateForwardClosure` | PR/CI/audit/oracle/memory/child digestを各欠落・別head化しclosure 0 |
| `U-FIO-009` | `commitForwardResume` | 全resume target、片辺fault、nonce再送を検査し2 event＋projectionが全commitまたは全rollback |

## §3 合否

主系3件をまとめず各case ID、pre/post/failure、主unitへ一意bindする。全caseでResult、stable error順、
write/dispatch count、input/output digestをassertし、mock call成功だけをgreenにしない。
