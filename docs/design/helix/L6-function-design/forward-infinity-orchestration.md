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
type ForwardStateV1 = "admitted" | "reverse_r0" | "reverse_r1" | "reverse_r2" | "reverse_r3" |
  "reverse_r4" | "redesign" | "design_refactor" | "pair_freeze" | "implementation_preflight" |
  "implementation_claimed" | "implemented" | "local_prejoin_ci" | "forward_join" |
  "internal_postjoin_ci" | "pr_open_or_updated" | "github_external_ci" | "claude_audit" |
  "finding_promoted" | "child_issue" | "audit_pass" | "memory_compacted" | "closure_ready" |
  "merged_closed" | "checkpointed" | "resumed";
type BudgetAxisV1 = "iteration" | "elapsed_ms" | "input_tokens" | "output_tokens" | "cost_micros";
type ForwardFailureV1 =
  | { code: "HIL_CAUSALITY_JOIN_BROKEN"; node_ids: readonly string[]; evidence_digest: string }
  | { code: "HIL_STATE_TRANSITION_INVALID"; from: ForwardStateV1; to: ForwardStateV1; evidence_digest: string }
  | { code: "HIL_LOOP_BUDGET_UNBOUNDED"; exceeded_axes: readonly BudgetAxisV1[]; evidence_digest: string }
  | { code: "HIL_FORWARD_GATE_STALE" | "HIL_FORWARD_EVENT_CONFLICT" |
      "HIL_FORWARD_CHECKPOINT_STALE" | "HIL_FORWARD_RESUME_FENCE_MISMATCH"; digest: string };
type ForwardResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly ForwardFailureV1[] };

interface AdmissionHandoffV1 { schema_version: "helix-forward-admission-handoff.v1"; issue_id: string; issue_revision: number; admitted_contract_digest: string; source_snapshot_digest: string; scope_digest: string; initial_cause_edge_digest: string; initial_transition_digest: string; scope_budget_metadata_digest: string; cause_root_id: string; handoff_digest: string }
interface IssueRevisionV1 { schema_version: "helix-issue-revision.v1"; issue_id: string; revision: number; scope_digest: string; source_snapshot_digest: string; state: "admitted"; revision_digest: string }
interface OperationIdV1 { schema_version: "helix-forward-operation.v1"; operation_id: string; operation_digest: string; idempotency_key: string }
interface ForwardRunPlanV1 { schema_version: "helix-forward-run-plan.v1"; run_id: string; issue_id: string; issue_revision: number; attempt: number; cause_root_id: string; initial_state: "admitted"; initial_cause_edge_digest: string; initial_transition_digest: string; budget_policy_digest: string; operation: OperationIdV1; plan_digest: string }

interface ForwardProjectionV1 { schema_version: "helix-forward-projection.v1"; run_id: string; issue_id: string; issue_revision: number; current_state: ForwardStateV1; current_event_seq: number; current_event_digest: string; current_edge_head: string; cause_root_id: string; orphan_count: number; active_checkpoint_id: string | null; budget_policy_digest: string; projection_digest: string }
interface TransitionProposalV1 { schema_version: "helix-forward-transition-proposal.v1"; run_id: string; issue_revision: number; from_state: ForwardStateV1; to_state: ForwardStateV1; operation: OperationIdV1; cause_id: string; gate_bundle_digest: string; previous_event_digest: string; proposal_digest: string }
interface GateReceiptV1 { receipt_kind: "reverse" | "redesign" | "pair_freeze" | "implementation" | "ci" | "pr" | "audit" | "oracle" | "memory" | "child"; receipt_id: string; subject_revision: number; subject_digest: string; event_head: string; status: "current" | "stale"; receipt_digest: string }
interface GateReceiptSetV1 { schema_version: "helix-forward-gate-receipt-set.v1"; receipts: readonly GateReceiptV1[]; receipt_ids: readonly string[]; gate_bundle_digest: string }
interface TransitionDecisionV1 { schema_version: "helix-forward-transition-decision.v1"; proposal: TransitionProposalV1; accepted: true; expected_event_head: string; next_event_seq: number; required_receipt_ids: readonly string[]; decision_digest: string }

type CausalityNodeKindV1 = "issue" | "reverse" | "redesign" | "plan" | "commit" | "pr" | "ci" | "audit" | "oracle" | "memory" | "child_issue";
type CausalityEdgeKindV1 = "causes" | "derives" | "pairs_with" | "gates" | "produces" | "promotes" | "reenters" | "supersedes";
interface CausalityNodeV1 { node_id: string; node_kind: CausalityNodeKindV1; target_id: string; target_digest: string; owner: string; locator_digest: string; status: "current" | "stale"; node_digest: string }
interface CausalityEdgeV1 { edge_id: string; from_node_id: string; to_node_id: string; edge_kind: CausalityEdgeKindV1; edge_version: "v1"; evidence_digest: string; event_digest: string; edge_digest: string }
interface CausalityGraphV1 { schema_version: "helix-forward-causality-graph.v1"; run_id: string; cause_root_id: string; nodes: readonly CausalityNodeV1[]; edges: readonly CausalityEdgeV1[]; node_set_digest: string; edge_set_digest: string; graph_digest: string }
interface RequiredNodeSetV1 { schema_version: "helix-forward-required-node-set.v1"; required: readonly { node_kind: CausalityNodeKindV1; target_id: string; target_digest: string }[]; required_node_ids: readonly string[]; required_set_digest: string }
interface CausalityClosureV1 { schema_version: "helix-forward-causality-closure.v1"; run_id: string; cause_root_id: string; reachable_node_ids: readonly string[]; missing_node_ids: readonly string[]; orphan_node_ids: readonly string[]; stale_node_ids: readonly string[]; duplicate_edge_ids: readonly string[]; cycle_edge_ids: readonly string[]; node_set_digest: string; edge_set_digest: string; closure_digest: string }

interface BudgetVectorV1 { iteration: number; elapsed_ms: number; input_tokens: number; output_tokens: number; cost_micros: number }
interface BudgetUsageV1 extends BudgetVectorV1 { schema_version: "helix-forward-budget-usage.v1"; observation_event_digest: string; usage_digest: string }
interface BudgetLimitsV1 extends BudgetVectorV1 { schema_version: "helix-forward-budget-limits.v1"; budget_policy_id: string; policy_version: string; authority_receipt_digest: string; effective_from: string; effective_until: string | null; limits_digest: string }
interface BudgetDeltaV1 extends BudgetVectorV1 { schema_version: "helix-forward-budget-delta.v1"; prediction_model_version: string; prediction_input_digest: string; delta_digest: string }
interface BudgetDecisionV1 { schema_version: "helix-forward-budget-decision.v1"; usage: BudgetUsageV1; limits: BudgetLimitsV1; predicted: BudgetDeltaV1; projected: BudgetVectorV1; exceeded_axes: readonly BudgetAxisV1[]; dispatch_allowed: boolean; checkpoint_required: boolean; decision_digest: string }

interface ForwardObligationV1 { obligation_id: string; owner: string; required_state: ForwardStateV1; status: "pending" | "blocked" | "completed"; evidence_digest: string | null; obligation_digest: string }
interface ObligationSetV1 { schema_version: "helix-forward-obligation-set.v1"; obligations: readonly ForwardObligationV1[]; incomplete_obligation_ids: readonly string[]; obligation_set_digest: string }
interface ResumeFenceV1 { schema_version: "helix-forward-resume-fence.v1"; lease_id: string; lease_generation: number; worker_fence_digest: string; artifact_set_digest: string; evidence_set_digest: string; fence_digest: string }
interface ForwardCheckpointV1 { schema_version: "helix-forward-checkpoint.v1"; checkpoint_id: string; run_id: string; generation: number; issue_revision: number; current_event_digest: string; current_edge_head: string; budget_policy_digest: string; usage: BudgetUsageV1; limits: BudgetLimitsV1; incomplete_obligation_ids: readonly string[]; obligation_set_digest: string; next_transition: TransitionProposalV1; resume_target_state: ForwardStateV1; fence: ResumeFenceV1; artifact_set_digest: string; evidence_set_digest: string; resume_nonce_digest: string; status: "checkpointed" | "resumed"; checkpoint_digest: string }
interface TrustedClockReceiptV1 { schema_version: "helix-trusted-clock-receipt.v1"; instant: string; clock_source: "node_trusted_clock"; receipt_id: string; receipt_digest: string }
interface ResumeContextV1 { schema_version: "helix-forward-resume-context.v1"; run_id: string; issue_revision: number; current_event_digest: string; current_edge_head: string; budget_policy_digest: string; artifact_set_digest: string; evidence_set_digest: string; fence_digest: string; trusted_clock: TrustedClockReceiptV1; context_digest: string }
interface ResumeNonceV1 { schema_version: "helix-forward-resume-nonce.v1"; checkpoint_id: string; nonce_digest: string; expected_generation: number }
interface ResumeDecisionV1 { schema_version: "helix-forward-resume-decision.v1"; checkpoint_id: string; run_id: string; nonce_digest: string; current_event_digest: string; resume_target_state: ForwardStateV1; checkpoint_to_resumed: TransitionProposalV1; resumed_to_target: TransitionProposalV1; expected_projection_digest: string; decision_digest: string }

interface ForwardEventWriteV1 { transition_event_id: string; event_seq: number; proposal: TransitionProposalV1; previous_event_digest: string; event_digest: string }
interface ForwardWriteSetV1 { schema_version: "helix-forward-write-set.v1"; operation: OperationIdV1; expected_event_head: string; expected_projection_digest: string; events: readonly ForwardEventWriteV1[]; nodes: readonly CausalityNodeV1[]; edges: readonly CausalityEdgeV1[]; projection: ForwardProjectionV1; checkpoint: ForwardCheckpointV1 | null; closure: ClosureReceiptV1 | null; exact_write_keys: readonly string[]; write_set_digest: string }
interface ForwardCommitReceiptV1 { schema_version: "helix-forward-commit-receipt.v1"; operation_id: string; operation_digest: string; run_id: string; before_event_head: string; after_event_head: string; before_projection_digest: string; after_projection_digest: string; event_count: number; node_count: number; edge_count: number; checkpoint_count: number; closure_count: number; write_set_digest: string; terminal_receipt_digest: string }
interface ForwardStorePortV1 { commitStep(decision: TransitionDecisionV1, writes: ForwardWriteSetV1): Promise<ForwardResultV1<ForwardCommitReceiptV1>>; commitResume(decision: ResumeDecisionV1): Promise<ForwardResultV1<ForwardCommitReceiptV1>> }

interface ClosureEvidenceV1 { evidence_kind: "pr" | "ci" | "audit" | "oracle" | "memory" | "child"; evidence_id: string; target_digest: string; event_head: string; status: "current" | "stale"; terminal: boolean; evidence_digest: string }
interface ClosureEvidenceSetV1 { schema_version: "helix-forward-closure-evidence-set.v1"; evidence: readonly ClosureEvidenceV1[]; required_evidence_ids: readonly string[]; child_issue_ids: readonly string[]; evidence_set_digest: string }
interface ClosureReceiptV1 { schema_version: "helix-forward-closure-receipt.v1"; closure_receipt_id: string; run_id: string; issue_revision: number; current_event_digest: string; current_projection_digest: string; node_set_digest: string; edge_set_digest: string; pr_receipt_digest: string; ci_receipt_digest: string; audit_receipt_digest: string; oracle_receipt_digest: string; memory_receipt_digest: string; child_receipt_set_digest: string; orphan_count: 0; closure_digest: string }
```

## §1 完全signatureとDbC

| function | TypeScript signature | DbC | 主L7 |
|---|---|---|---|
| `startForwardRun` | `(handoff: AdmissionHandoffV1, issue: IssueRevisionV1, op: OperationIdV1) => ForwardResultV1<ForwardRunPlanV1>` | 3 handoff digest、Issue revision、単一root一致 | `U-FIO-004` |
| `decideForwardTransition` | `(current: ForwardProjectionV1, proposal: TransitionProposalV1, gates: GateReceiptSetV1) => ForwardResultV1<TransitionDecisionV1>` | 隣接辺、current gate、cause、previous digest必須 | `U-FIO-002` |
| `validateCausalityClosure` | `(graph: CausalityGraphV1, required: RequiredNodeSetV1) => ForwardResultV1<CausalityClosureV1>` | exactly-one root、全required到達、orphan/cycle/stale 0 | `U-FIO-001` |
| `evaluateLoopBudget` | `(usage: BudgetUsageV1, limits: BudgetLimitsV1, predicted: BudgetDeltaV1) => ForwardResultV1<BudgetDecisionV1>` | 5軸別比較、side effect前、unknown/負値拒否 | `U-FIO-003` |
| `buildForwardCheckpoint` | `(run: ForwardProjectionV1, budget: BudgetDecisionV1, obligations: ObligationSetV1, fence: ResumeFenceV1) => ForwardResultV1<ForwardCheckpointV1>` | current headと全未完obligationをcanonical化 | `U-FIO-005` |
| `validateForwardResume` | `(checkpoint: ForwardCheckpointV1, current: ResumeContextV1, nonce: ResumeNonceV1) => ForwardResultV1<ResumeDecisionV1>` | head/revision/policy/evidence/fence fresh、nonce一回 | `U-FIO-006` |
| `commitForwardResume` | `(decision: ResumeDecisionV1, port: ForwardStorePortV1) => Promise<ForwardResultV1<ForwardCommitReceiptV1>>` | nonce、`checkpointed -> resumed -> resume_target_state`、projectionを一transactionでcommit | `U-FIO-009` |
| `commitForwardStep` | `(decision: TransitionDecisionV1, writes: ForwardWriteSetV1, port: ForwardStorePortV1) => Promise<ForwardResultV1<ForwardCommitReceiptV1>>` | event/edge/projection/checkpointを不可分commit、CAS | `U-FIO-007` |
| `evaluateForwardClosure` | `(projection: ForwardProjectionV1, graph: CausalityGraphV1, evidence: ClosureEvidenceSetV1) => ForwardResultV1<ClosureReceiptV1>` | current digest、child終端、orphan 0 | `U-FIO-008` |

### §1.1 API→U→IT厳密結線

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
`ResumeDecisionV1`はcheckpoint ID、nonce digest、current head、resume target、2本のtransition proposalを必須とし、
通常transition APIは`checkpointed`と`resumed`を受理しない。

## §4 完了境界

L7主系3/3、supporting unit、L8 9件、projection rebuild、fault injection、別runtime reviewまで未実装扱いとする。
