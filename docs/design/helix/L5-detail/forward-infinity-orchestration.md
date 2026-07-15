---
title: "HELIX L5 詳細設計 — Forward Infinity orchestration"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-02
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-001
pair_artifact: docs/test-design/helix/L5-forward-infinity-orchestration-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-02
  - HAC-HIL-02a
  - HAC-HIL-02b
  - HAC-HIL-02c
---

# HELIX L5 詳細設計 — Forward Infinity orchestration

## §0 適用境界と入力契約

本sliceはHDS-HIL-01が渡す`initial_cause_edge_digest`、`initial_transition_digest`、
`scope_budget_metadata_digest`から一つのForward runを開始し、L4 §3の正規工程を順方向へ収束させる。
所有caseは`HST-CASE-001-04`、`HST-CASE-001-06`、`HST-CASE-001-09`の3件だけである。
intake正規化、Reverse内容採点、三段CI、PR監査、finding昇格、memory本文生成は各所有sliceへ委譲し、
本書はそれらのtyped receiptを同一causalityへjoinして遷移可否を決める。

## §1 componentと単一書込権限

| component | 責務 | write authority | fail-close条件 |
|---|---|---|---|
| `ForwardRunStarter` | admitted contractとHDS01 handoffをrun rootへbind | run creation event | digest不一致、既存current run |
| `ForwardTransitionPolicy` | current state、gate bundle、正規隣接辺をpure評価 | なし | 順序飛越、receipt stale、自己遷移 |
| `CausalityClosureValidator` | 必須node/edgeのroot到達性、単一root、orphan 0を検査 | finding proposal | missing edge、複数root、cycle |
| `LoopBudgetMeter` | iteration/time/token/costを同じpolicy snapshotで評価 | observation event | unknown単位、負値、計測欠落 |
| `ForwardCheckpointWriter` | 上限前に未完obligationとresume fenceをdurable commit | checkpoint event | side effect後判定、partial checkpoint |
| `ForwardResumeGate` | event head、Issue revision、policy、evidence freshnessを再検証 | resume event | stale token、別run、上限未更新 |
| `ForwardClosureGate` | current headのPR/CI/audit/oracle/memory/child joinを確認 | closure receipt | orphan、stale、未終端child |
| `InfinityRunCommitter` | event、edge、projection、checkpointを一transactionで更新 | Node `HarnessDbPort` | CAS競合、部分commit |

Claude/Codex、hook、workerはtransition proposalを返せるが、run state、cause edge、budget、checkpointを直接writeしない。

## §2 状態機械と遷移規律

許可spineはL4 §3を正本とし、`admitted -> reverse_r0 -> ... -> merged_closed`の隣接辺だけを許可する。
`redesign`、`design_refactor`、`finding_promoted -> child_issue -> intake`はtyped分岐であり、分岐先receiptから
Forwardへ戻るre-entry edgeを必須とする。各eventは`run_id`、`issue_revision`、`from_state`、`to_state`、
`operation_id`、`cause_id`、`gate_bundle_digest`、`previous_event_digest`、`event_digest`を持つ。
同operation同digestは増分0、異digestはconflict、同seqや非current headへのappendはCAS拒否とする。
`checkpointed`は通常spineの自己遷移ではない。保存済み`resume_target_state`へ戻る時だけ
`checkpointed -> resumed -> resume_target_state`を許可し、各辺を別eventとしてcommitする。
`resumed`から別state、`checkpointed`から直接spineへ戻る遷移、同checkpointの二重resumeを拒否する。

## §3 因果関係の閉鎖

全event、Issue/Reverse/Redesign/PLAN/commit/PR/CI/audit/memory/childは一つの`cause_root_id`へ有向辺で到達する。
edge kindはversioned allowlistとし、自由文字列relationを禁止する。closure評価は必須node集合、root到達、incoming edge、
current target digest、重複edge、cycleを同一snapshotで検査する。node本文は保持せず型、locator、digest、ownerだけを保存する。
一件でもmissing/stale/orphanならclosure receipt 0で、正常nodeの存在数による多数決をしない。

## §4 budget checkpointとfresh resume

budgetは`iteration`、`elapsed_ms`、`input_tokens`、`output_tokens`、`cost_micros`を別軸で評価し平均しない。
各stepの外部side effect前に次回予測値を検査し、いずれかが上限以上なら新規dispatch 0で`checkpointed`へ遷移する。
checkpointはcurrent event/edge head、Issue/scope/policy revision、使用量と上限、未完obligation、next transition、
lease fence、artifact/evidence set、`resume_target_state`、resume nonce digestを含む。resume時は全digestとtrusted clockを再評価し、
`checkpointed -> resumed`と`resumed -> resume_target_state`を順にappendする。古いcheckpointの再送は増分0、異head resumeは拒否する。

## §5 harness.db物理契約

| table | PK | FK／unique | 必須field・CHECK |
|---|---|---|---|
| `infinity_runs` | `run_id` | Issue revisionへの外部key、`issue_id+revision+attempt`一意 | 原因root、現在状態/event、budget policy、状態、作成・更新時刻 |
| `infinity_transition_events` | `transition_event_id` | runへの外部key、`run_id+event_seq`、`operation_id`一意 | 遷移前後、gate bundle、原因、直前/event digest、発生時刻。追記専用 |
| `infinity_causality_nodes` | `causality_node_id` | runへの外部key、`run_id+node_kind+target_id+target_digest`一意 | 所有者、current/stale判定、locator digest |
| `infinity_causality_edges` | `causality_edge_id` | runと接続nodeへの外部key、`run_id+from+to+edge_kind`一意 | edge種別/version、証拠/event digest |
| `infinity_run_projections` | `run_id` | run FKかつ一対一 | current state/event/edge head、orphan count、checkpoint、projection digest |
| `infinity_budget_policies` | `budget_policy_id` | `policy_name+version` unique | 5上限、authority、effective range、digest |
| `infinity_budget_checkpoints` | `checkpoint_id` | run/policy/eventへの外部key、`run_id+generation`、resume nonce一意 | 使用量、上限、義務/次遷移/証拠/fence digest、resume target、状態 |
| `infinity_closure_receipts` | `closure_receipt_id` | run FK、current eventを一意参照 | node/edge/PR/CI/audit/oracle/memory/child digest、orphan=0 |

status/stateはenum CHECK、全FKは`PRAGMA foreign_keys=ON`で強制する。正規commitはevent append、node/edge、projection、
checkpointまたはclosure receiptを`BEGIN IMMEDIATE`内でall-or-nothing更新し、event chainからprojectionを再構築可能にする。
resume commitはnonce消費、2 transition event、projection、checkpointの`resumed`化を同transactionへ含め、片辺だけを公開しない。

## §6 failure契約

`HIL_CAUSALITY_JOIN_BROKEN`、`HIL_STATE_TRANSITION_INVALID`、`HIL_LOOP_BUDGET_UNBOUNDED`を正本tokenとする。
詳細causeは`HIL_FORWARD_GATE_STALE`、`HIL_FORWARD_EVENT_CONFLICT`、`HIL_FORWARD_CHECKPOINT_STALE`、
`HIL_FORWARD_RESUME_FENCE_MISMATCH`に限定し、canonical failureを別名へ置換しない。

## §7 HST主系の厳密追跡

| HSTケース | L8主oracle | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-001-04` | `IT-FIO-001` | `assertion_input_ready` | `assertion_pass` | `HIL_CAUSALITY_JOIN_BROKEN` |
| `HST-CASE-001-06` | `IT-FIO-002` | `assertion_input_ready` | `assertion_pass` | `HIL_STATE_TRANSITION_INVALID` |
| `HST-CASE-001-09` | `IT-FIO-003` | `assertion_input_ready` | `assertion_pass` | `HIL_LOOP_BUDGET_UNBOUNDED` |

### §7.1 完全API→U→IT正本

全input/outputのslice-local closed V1契約はL6 §0/§1を正本とする。既存owner、9 U、9 IT、主系3 HSTの
分母を増減せず、公開APIを次のexact joinへ固定する。

| public API | existing U | existing IT |
|---|---|---|
| `validateCausalityClosure` | `U-FIO-001` | `IT-FIO-001`, `IT-FIO-008` |
| `decideForwardTransition` | `U-FIO-002` | `IT-FIO-002`, `IT-FIO-008`, `IT-FIO-009` |
| `evaluateLoopBudget` | `U-FIO-003` | `IT-FIO-003` |
| `startForwardRun` | `U-FIO-004` | `IT-FIO-001`, `IT-FIO-006` |
| `buildForwardCheckpoint` | `U-FIO-005` | `IT-FIO-003`, `IT-FIO-004` |
| `validateForwardResume` | `U-FIO-006` | `IT-FIO-003`, `IT-FIO-005`, `IT-FIO-009` |
| `commitForwardStep` | `U-FIO-007` | `IT-FIO-002`, `IT-FIO-004`, `IT-FIO-006`, `IT-FIO-007` |
| `evaluateForwardClosure` | `U-FIO-008` | `IT-FIO-001`, `IT-FIO-008` |
| `commitForwardResume` | `U-FIO-009` | `IT-FIO-003`, `IT-FIO-005`, `IT-FIO-009` |

Forward収束ownerは`decideForwardTransition`／`commitForwardStep`／`evaluateForwardClosure`、因果閉鎖ownerは
`validateCausalityClosure`、budget checkpoint ownerは`evaluateLoopBudget`／`buildForwardCheckpoint`／
`validateForwardResume`／`commitForwardResume`とし、owner移管やcase統合を行わない。

## §8 freeze条件

主系3/3、全state隣接辺mutation、必須causality node/edge mutation、5 budget軸、checkpoint crash/reconcile、
fresh/stale resume、row/event/write/dispatch count、projection rebuild、別runtime reviewが揃うまでdraftとする。
