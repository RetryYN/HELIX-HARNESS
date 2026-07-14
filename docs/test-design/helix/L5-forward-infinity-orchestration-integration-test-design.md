---
title: "HELIX L8 結合テスト設計 — Forward Infinity orchestration"
layer: L5
executed_at_layer: L8
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
pair_artifact: docs/design/helix/L5-detail/forward-infinity-orchestration.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-02
  - HAC-HIL-02a
  - HAC-HIL-02b
  - HAC-HIL-02c
---

# HELIX L8 結合テスト設計 — Forward Infinity orchestration

isolated harness.db、固定clock、HDS01 handoff fixture、fake gate/CI/PR/audit/memory portを使う。外部APIは起動しない。
各scenarioでevent、node、edge、projection、checkpoint、closure、dispatchのbefore/after countとdigestを直接assertする。

## §1 主系atomic case

| HSTケース | 主IT | 事前状態 | 期待状態 | 正規failure | scenario／write-count oracle |
|---|---|---|---|---|---|
| `HST-CASE-001-04` | `IT-FIO-001` | `assertion_input_ready` | `assertion_pass` | `HIL_CAUSALITY_JOIN_BROKEN` | Issueからmemoryまでの各node/edgeを一つずつ削除・stale化・別root化し、closure 0、orphan finding 1、既存event改変0 |
| `HST-CASE-001-06` | `IT-FIO-002` | `assertion_input_ready` | `assertion_pass` | `HIL_STATE_TRANSITION_INVALID` | 全正規隣接辺を各一回通し、全飛越・逆行・terminal追記を拒否。正順eventのみ1、失敗時projection増分0 |
| `HST-CASE-001-09` | `IT-FIO-003` | `assertion_input_ready` | `assertion_pass` | `HIL_LOOP_BUDGET_UNBOUNDED` | 5軸を境界-1/境界/境界+1で反復し、上限時dispatch 0、checkpoint 1。同token resume 1、再送増分0 |

## §2 補助fault matrix

| ID | fixture／fault | 期待結果 |
|---|---|---|
| `IT-FIO-004` | event append、edge insert、projection、checkpoint各直後にtransaction fault | authoritative増分0。再試行は同operationで一回commit |
| `IT-FIO-005` | checkpoint後にIssue revision、event head、budget policy、evidenceを各変更 | stale resume 0、旧token消費0、fresh checkpoint要求 |
| `IT-FIO-006` | 同operation同digestを並行送信し、別payloadも競合投入 | winner event 1、同digest loser増分0、異digest state変更0 |
| `IT-FIO-007` | event JSONLからprojectionを全削除してrebuild | state/event/edge head、orphan count、checkpoint digestが元と一致 |
| `IT-FIO-008` | Redesign/child Issue分岐を作りre-entry edgeを欠落 | Forward継続0、未完obligation保持、closure 0 |
| `IT-FIO-009` | 全spine stateをresume targetにしてcheckpoint後再開し、2 event間へfault注入 | `checkpointed -> resumed -> target`だけ成立。fault時event/projection/nonce消費0、再送commit一回 |

## §3 合否

主系3/3と補助6件を全件実行し、処理量をsampleへ縮小しない。正常prose、current state文字列、
checkpoint row単独では合格にせず、exit、output digest、DB query digest、fault位置、write/dispatch countを保存する。
