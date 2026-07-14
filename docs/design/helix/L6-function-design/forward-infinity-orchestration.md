---
title: "HELIX L6 機能設計 — Forward Infinity orchestration"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-02
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_l5: docs/design/helix/L5-detail/forward-infinity-orchestration.md
related_hst:
  - HST-HIL-001
pair_artifact: docs/test-design/helix/L6-forward-infinity-orchestration-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-02
  - HAC-HIL-02a
  - HAC-HIL-02b
  - HAC-HIL-02c
---

# HELIX L6 機能設計 — Forward Infinity orchestration

## §0 型契約

```ts
type ForwardState = "admitted" | "reverse_r0" | "reverse_r1" | "reverse_r2" | "reverse_r3" |
  "reverse_r4" | "redesign" | "design_refactor" | "pair_freeze" | "implementation_preflight" |
  "implementation_claimed" | "implemented" | "local_prejoin_ci" | "forward_join" |
  "internal_postjoin_ci" | "pr_open_or_updated" | "github_external_ci" | "claude_audit" |
  "finding_promoted" | "child_issue" | "audit_pass" | "memory_compacted" | "closure_ready" |
  "merged_closed" | "checkpointed" | "resumed";
type ForwardFailure =
  | { code: "HIL_CAUSALITY_JOIN_BROKEN"; node_ids: string[] }
  | { code: "HIL_STATE_TRANSITION_INVALID"; from: ForwardState; to: ForwardState }
  | { code: "HIL_LOOP_BUDGET_UNBOUNDED"; exceeded_axes: BudgetAxis[] }
  | { code: "HIL_FORWARD_GATE_STALE" | "HIL_FORWARD_EVENT_CONFLICT" |
      "HIL_FORWARD_CHECKPOINT_STALE" | "HIL_FORWARD_RESUME_FENCE_MISMATCH"; digest: string };
type BudgetAxis = "iteration" | "elapsed_ms" | "input_tokens" | "output_tokens" | "cost_micros";
```

## §1 完全signatureとDbC

| function | TypeScript signature | DbC | 主L7 |
|---|---|---|---|
| `startForwardRun` | `(handoff: AdmissionHandoffV1, issue: IssueRevision, op: OperationId) => Result<ForwardRunPlan, ForwardFailure>` | 3 handoff digest、Issue revision、単一root一致 | `U-FIO-004` |
| `decideForwardTransition` | `(current: ForwardProjection, proposal: TransitionProposal, gates: GateReceiptSet) => Result<TransitionDecision, ForwardFailure>` | 隣接辺、current gate、cause、previous digest必須 | `U-FIO-002` |
| `validateCausalityClosure` | `(graph: CausalityGraph, required: RequiredNodeSet) => Result<CausalityClosure, ForwardFailure>` | exactly-one root、全required到達、orphan/cycle/stale 0 | `U-FIO-001` |
| `evaluateLoopBudget` | `(usage: BudgetUsage, limits: BudgetLimits, predicted: BudgetDelta) => BudgetDecision` | 5軸別比較、side effect前、unknown/負値拒否 | `U-FIO-003` |
| `buildForwardCheckpoint` | `(run: ForwardProjection, budget: BudgetDecision, obligations: ObligationSet, fence: ResumeFence) => Result<ForwardCheckpointV1, ForwardFailure>` | current headと全未完obligationをcanonical化 | `U-FIO-005` |
| `validateForwardResume` | `(checkpoint: ForwardCheckpointV1, current: ResumeContext, nonce: ResumeNonce) => Result<ResumeDecision, ForwardFailure>` | head/revision/policy/evidence/fence fresh、nonce一回 | `U-FIO-006` |
| `commitForwardResume` | `(decision: ResumeDecision, port: ForwardStorePort) => Promise<Result<ForwardCommitReceipt, ForwardFailure>>` | nonce、`checkpointed -> resumed -> resume_target_state`、projectionを一transactionでcommit | `U-FIO-009` |
| `commitForwardStep` | `(decision: TransitionDecision, writes: ForwardWriteSet, port: ForwardStorePort) => Promise<Result<ForwardCommitReceipt, ForwardFailure>>` | event/edge/projection/checkpointを不可分commit、CAS | `U-FIO-007` |
| `evaluateForwardClosure` | `(projection: ForwardProjection, graph: CausalityGraph, evidence: ClosureEvidenceSet) => Result<ClosureReceipt, ForwardFailure>` | current digest、child終端、orphan 0 | `U-FIO-008` |

## §2 主系API tuple

| HSTケース | 主API | 主U | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-001-04` | `validateCausalityClosure` | `U-FIO-001` | `assertion_input_ready` | `assertion_pass` | `HIL_CAUSALITY_JOIN_BROKEN` |
| `HST-CASE-001-06` | `decideForwardTransition` | `U-FIO-002` | `assertion_input_ready` | `assertion_pass` | `HIL_STATE_TRANSITION_INVALID` |
| `HST-CASE-001-09` | `evaluateLoopBudget` | `U-FIO-003` | `assertion_input_ready` | `assertion_pass` | `HIL_LOOP_BUDGET_UNBOUNDED` |

## §3 配置とtransaction境界

`src/forward/state-policy.ts`、`causality-closure.ts`、`budget.ts`、`checkpoint.ts`をpure core、
`src/forward/orchestrator.ts`をapplication service、`src/state-db/infinity-run-projection.ts`をNode portとする。
pure coreはDB/clock/runtimeを読まず値を受ける。portはL5 §5のFK/unique/CHECKを再検証し、event chain、projection、
checkpointを一transactionでcommitする。全functionはstable ordered errorを返し、exceptionを正常decisionへ変換しない。
`ResumeDecision`はcheckpoint ID、nonce digest、current head、resume target、2本のtransition proposalを必須とし、
通常transition APIは`checkpointed`と`resumed`を受理しない。

## §4 完了境界

L7主系3/3、supporting unit、L8 8件、projection rebuild、fault injection、別runtime reviewまで未実装扱いとする。
