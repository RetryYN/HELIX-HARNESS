---
title: "HELIX L6機能設計 — layer ledger pair gate"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
design_slice: HDS-HIL-18
related_hst:
  - HST-HIL-030
  - HST-HIL-031
  - HST-HIL-032
  - HST-HIL-033
requirements:
  - HR-FR-HIL-18
  - HAC-HIL-18a
  - HAC-HIL-18b
  - HAC-HIL-18c
pair_artifact: docs/test-design/helix/L6-layer-ledger-pair-gate-unit-test-design.md
next_pair_freeze: L7
---
# HELIX L6機能設計 — 連鎖台帳・pair gate

## §0 API

`registerLayerLedgerType`、`extractTemplateObligations`、`appendLayerLedgerRow`、`evaluateVerticalLedgerPair`、`evaluateHorizontalVPair`、`planLedgerDesignRefactor`、`calculateFixedDesignProgress`、`authorizeLayerStageTransition`をpure判定とinjected portへ分離する。全APIはtyped Resultを返し、failure時のrow/edge/stage/freeze/implementation receipt増分は0とする。
`commitLedgerRefactorBundle`と`reconcileLedgerRefactorBundle`だけがrefactor/reroute/pair/rollback receiptをNode storeへcommitする。

progressは固定分母revisionとcurrent snapshotへbindし、artifact、semantic closure、audit、pair freeze、implementation verificationの値を混合しない。

## primary atomic assertion台帳

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 | U結線 |
|---|---|---|---|---|---|
| `HST-CASE-030-01` | `template_current` | `ledger_staged` | `なし（正常系）` | `IT-LLPG-001` | `U-LLPG-001` |
| `HST-CASE-030-02` | `template_current` | `failed` | `HIL_LAYER_REGISTRY_ENTRY_MISSING` | `IT-LLPG-002` | `U-LLPG-002` |
| `HST-CASE-030-03` | `ledger_staged` | `rejected` | `HIL_LAYER_OBLIGATION_PROVENANCE_MISSING` | `IT-LLPG-003` | `U-LLPG-003` |
| `HST-CASE-030-04` | `ledger_staged` | `rejected` | `HIL_LAYER_OBLIGATION_NOT_ATOMIC` | `IT-LLPG-004` | `U-LLPG-004` |
| `HST-CASE-030-05` | `ledger_current` | `quarantined` | `HIL_LAYER_EXTRACTION_NONDETERMINISTIC` | `IT-LLPG-005` | `U-LLPG-005` |
| `HST-CASE-030-06` | `ledger_current` | `stale` | `HIL_LAYER_TEMPLATE_VERSION_STALE` | `IT-LLPG-006` | `U-LLPG-006` |
| `HST-CASE-030-07` | `template_current` | `rejected` | `HIL_LAYER_TEMPLATE_FIELD_EMPTY` | `IT-LLPG-007` | `U-LLPG-007` |
| `HST-CASE-030-08` | `template_current` | `rejected` | `HIL_LAYER_TEMPLATE_PLACEHOLDER` | `IT-LLPG-008` | `U-LLPG-008` |
| `HST-CASE-030-09` | `template_current` | `rejected` | `HIL_LAYER_TEMPLATE_FIELD_UNKNOWN` | `IT-LLPG-009` | `U-LLPG-009` |
| `HST-CASE-030-10` | `ledger_staged` | `rejected` | `HIL_LAYER_OBLIGATION_DUPLICATE` | `IT-LLPG-010` | `U-LLPG-010` |
| `HST-CASE-030-11` | `ledger_current` | `failed` | `HIL_LAYER_AGGREGATE_ONLY` | `IT-LLPG-011` | `U-LLPG-011` |
| `HST-CASE-030-12` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_LEDGER_CHAIN_INCOMPLETE` | `IT-LLPG-012` | `U-LLPG-012` |
| `HST-CASE-030-13` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_LEDGER_TYPE_MISSING` | `IT-LLPG-013` | `U-LLPG-013` |
| `HST-CASE-030-14` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_TEMPLATE_EXTRACTION_EMPTY` | `IT-LLPG-014` | `U-LLPG-014` |
| `HST-CASE-030-15` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_LEDGER_COVERAGE_INVALID` | `IT-LLPG-015` | `U-LLPG-015` |
| `HST-CASE-031-01` | `ledger_ready` | `verified` | `なし（正常系）` | `IT-LLPG-016` | `U-LLPG-016` |
| `HST-CASE-031-02` | `ledger_ready` | `failed` | `HIL_LAYER_VERTICAL_DERIVED_FROM_MISSING` | `IT-LLPG-017` | `U-LLPG-017` |
| `HST-CASE-031-03` | `ledger_ready` | `failed` | `HIL_LAYER_VERTICAL_BACKPROP_MISSING` | `IT-LLPG-018` | `U-LLPG-018` |
| `HST-CASE-031-04` | `ledger_ready` | `stale` | `HIL_LAYER_VERTICAL_EDGE_STALE` | `IT-LLPG-019` | `U-LLPG-019` |
| `HST-CASE-031-05` | `ledger_ready` | `failed` | `HIL_LAYER_VERTICAL_ADJACENCY_BYPASS` | `IT-LLPG-020` | `U-LLPG-020` |
| `HST-CASE-031-06` | `ledger_ready` | `failed` | `HIL_LAYER_VERTICAL_GRANULARITY_INVALID` | `IT-LLPG-021` | `U-LLPG-021` |
| `HST-CASE-031-07` | `ledger_ready` | `stale` | `HIL_LAYER_VERTICAL_REVISION_MISMATCH` | `IT-LLPG-022` | `U-LLPG-022` |
| `HST-CASE-031-08` | `ledger_ready` | `stale` | `HIL_LAYER_VERTICAL_SNAPSHOT_MISMATCH` | `IT-LLPG-023` | `U-LLPG-023` |
| `HST-CASE-031-09` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_VERTICAL_PAIR_INCOMPLETE` | `IT-LLPG-024` | `U-LLPG-024` |
| `HST-CASE-032-01` | `ledger_ready` | `verified` | `なし（正常系）` | `IT-LLPG-025` | `U-LLPG-025` |
| `HST-CASE-032-02` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L0_L14_MISSING` | `IT-LLPG-026` | `U-LLPG-026` |
| `HST-CASE-032-03` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L1_L14_MISSING` | `IT-LLPG-027` | `U-LLPG-027` |
| `HST-CASE-032-04` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L2_L10_MISSING` | `IT-LLPG-028` | `U-LLPG-028` |
| `HST-CASE-032-05` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L3_L12_MISSING` | `IT-LLPG-029` | `U-LLPG-029` |
| `HST-CASE-032-06` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L4_L9_MISSING` | `IT-LLPG-030` | `U-LLPG-030` |
| `HST-CASE-032-07` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L5_L8_MISSING` | `IT-LLPG-031` | `U-LLPG-031` |
| `HST-CASE-032-08` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L6_L7_MISSING` | `IT-LLPG-032` | `U-LLPG-032` |
| `HST-CASE-032-09` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_REVERSE_MISSING` | `IT-LLPG-033` | `U-LLPG-033` |
| `HST-CASE-032-10` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_ORACLE_MISMATCH` | `IT-LLPG-034` | `U-LLPG-034` |
| `HST-CASE-032-11` | `paired` | `paired` | `HIL_LAYER_VPAIR_EXECUTION_MISSING` | `IT-LLPG-035` | `U-LLPG-035` |
| `HST-CASE-032-12` | `ledger_ready` | `stale` | `HIL_LAYER_VPAIR_SNAPSHOT_MISMATCH` | `IT-LLPG-036` | `U-LLPG-036` |
| `HST-CASE-032-13` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_FORWARD_MISSING` | `IT-LLPG-037` | `U-LLPG-037` |
| `HST-CASE-032-14` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_VPAIR_INCOMPLETE` | `IT-LLPG-038` | `U-LLPG-038` |
| `HST-CASE-033-01` | `diff_ready` | `candidate_created` | `なし（正常系）` | `IT-LLPG-039` | `U-LLPG-039` |
| `HST-CASE-033-02` | `diff_ready` | `rejected` | `HIL_LAYER_REFACTOR_DIFF_EMPTY` | `IT-LLPG-040` | `U-LLPG-040` |
| `HST-CASE-033-03` | `diff_ready` | `rejected` | `HIL_LAYER_REFACTOR_PROVENANCE_MISSING` | `IT-LLPG-041` | `U-LLPG-041` |
| `HST-CASE-033-04` | `candidate_created` | `candidate_created` | `HIL_LAYER_REFACTOR_CONSUMER_MISSING` | `IT-LLPG-042` | `U-LLPG-042` |
| `HST-CASE-033-05` | `candidate_created` | `rerouted` | `HIL_LAYER_REFACTOR_REDESIGN_REQUIRED` | `IT-LLPG-043` | `U-LLPG-043` |
| `HST-CASE-033-06` | `candidate_created` | `rerouted` | `HIL_LAYER_REFACTOR_RETROFIT_REQUIRED` | `IT-LLPG-044` | `U-LLPG-044` |
| `HST-CASE-033-07` | `candidate_created` | `verified` | `なし（正常系）` | `IT-LLPG-045` | `U-LLPG-045` |
| `HST-CASE-033-08` | `candidate_created` | `verified` | `なし（正常系）` | `IT-LLPG-046` | `U-LLPG-046` |
| `HST-CASE-033-09` | `candidate_created` | `verified` | `なし（正常系）` | `IT-LLPG-047` | `U-LLPG-047` |
| `HST-CASE-033-10` | `candidate_created` | `verified` | `なし（正常系）` | `IT-LLPG-048` | `U-LLPG-048` |
| `HST-CASE-033-11` | `candidate_created` | `rejected` | `HIL_LAYER_REFACTOR_PAIR_BROKEN` | `IT-LLPG-049` | `U-LLPG-049` |
| `HST-CASE-033-12` | `candidate_created` | `rerouted` | `HIL_LAYER_REFACTOR_REDESIGN_REQUIRED` | `IT-LLPG-050` | `U-LLPG-050` |
| `HST-CASE-033-13` | `candidate_created` | `candidate_created` | `HIL_LAYER_REFACTOR_ROLLBACK_MISSING` | `IT-LLPG-051` | `U-LLPG-051` |
| `HST-CASE-033-14` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_LEDGER_REFACTOR_INVALID` | `IT-LLPG-052` | `U-LLPG-052` |

52/52をrangeなしで検証し、supporting caseを混入させない。

## §1 完全signatureとDbC

```ts
declare function registerLayerLedgerType(input: LayerRegistryEntryV1, current: RegistrySnapshotV1): LayerGateResultV1<RegistryReceiptV1, LayerGateFailureV1>;
declare function extractTemplateObligations(template: TemplateSnapshotV1, schema: TemplateSchemaV1, operation: OperationIdV1): LayerGateResultV1<ObligationProposalSetV1, LayerGateFailureV1>;
declare function appendLayerLedgerRow(proposal: ObligationProposalV1, authority: AuthorityReceiptV1, current: LayerLedgerHeadV1): LayerGateResultV1<LayerRowCommitPlanV1, LayerGateFailureV1>;
declare function evaluateVerticalLedgerPair(parent: LayerRowSetV1, child: LayerRowSetV1, current: SnapshotDigestV1): LayerGateResultV1<VerticalPairReceiptV1, LayerGateFailureV1[]>;
declare function evaluateHorizontalVPair(design: PairSideV1, verification: PairSideV1, execution: ExecutionReceiptV1): LayerGateResultV1<HorizontalPairReceiptV1, LayerGateFailureV1[]>;
declare function planLedgerDesignRefactor(before: LedgerSnapshotV1, after: LedgerSnapshotV1, consumers: ConsumerOracleV1[], rollback: RollbackTargetV1): LayerGateResultV1<DesignRefactorPlanV1, LayerGateFailureV1>;
declare function calculateFixedDesignProgress(request: DesignProgressCalculationRequestV1, transaction: DesignProgressAtomicTransactionPortV1): Promise<LayerGateResultV1<DesignProgressProjectionV1, LayerGateFailureV1[]>>;
declare function commitDesignProgress(bundle: DesignProgressCommitBundleV1, transaction: DesignProgressAtomicTransactionPortV1): Promise<LayerGateResultV1<DesignProgressCommitReceiptV1, LayerGateFailureV1[]>>;
declare function reconcileDesignProgress(bundle: DesignProgressCommitBundleV1, transaction: DesignProgressAtomicTransactionPortV1): Promise<LayerGateResultV1<DesignProgressCommitReceiptV1, LayerGateFailureV1[]>>;
declare function authorizeLayerStageTransition(current: StageStateV1, requested: StageStateV1, evidence: StageEvidenceV1): LayerGateResultV1<StageTransitionReceiptV1, LayerGateFailureV1>;
declare function commitLayerLedgerOperation(bundle: LayerLedgerOperationBundleV1, store: LayerLedgerCommitStoreV1): Promise<LayerGateResultV1<LayerLedgerOperationReceiptV1, LayerGateFailureV1[]>>;
declare function reconcileLayerLedgerOperation(bundle: LayerLedgerOperationBundleV1, store: LayerLedgerCommitStoreV1): Promise<LayerGateResultV1<LayerLedgerOperationReceiptV1, LayerGateFailureV1[]>>;
declare function commitLedgerRefactorBundle(bundle: LedgerRefactorCommitBundleV1, store: LayerLedgerCommitStoreV1): Promise<LayerGateResultV1<LedgerRefactorCommitReceiptV1, LayerGateFailureV1[]>>;
declare function reconcileLedgerRefactorBundle(bundle: LedgerRefactorCommitBundleV1, store: LayerLedgerCommitStoreV1): Promise<LayerGateResultV1<LedgerRefactorCommitReceiptV1, LayerGateFailureV1[]>>;
```

registry completeness、template span、atomicity、adjacency、canonical V-pair、same revision/snapshot/oracle、execution receipt、fixed denominator authorityをDbCとする。Err時row/edge/receipt 0。

```ts
type LayerGateFailureCodeV1 =
  | "HIL_LAYER_AGGREGATE_ONLY"
  | "HIL_LAYER_EXTRACTION_NONDETERMINISTIC"
  | "HIL_LAYER_LEDGER_CHAIN_INCOMPLETE"
  | "HIL_LAYER_LEDGER_COVERAGE_INVALID"
  | "HIL_LAYER_LEDGER_REFACTOR_INVALID"
  | "HIL_LAYER_LEDGER_TYPE_MISSING"
  | "HIL_LAYER_OBLIGATION_DUPLICATE"
  | "HIL_LAYER_OBLIGATION_NOT_ATOMIC"
  | "HIL_LAYER_OBLIGATION_PROVENANCE_MISSING"
  | "HIL_LAYER_REFACTOR_CONSUMER_MISSING"
  | "HIL_LAYER_REFACTOR_DIFF_EMPTY"
  | "HIL_LAYER_REFACTOR_PAIR_BROKEN"
  | "HIL_LAYER_REFACTOR_PROVENANCE_MISSING"
  | "HIL_LAYER_REFACTOR_REDESIGN_REQUIRED"
  | "HIL_LAYER_REFACTOR_RETROFIT_REQUIRED"
  | "HIL_LAYER_REFACTOR_ROLLBACK_MISSING"
  | "HIL_LAYER_REGISTRY_ENTRY_MISSING"
  | "HIL_LAYER_TEMPLATE_EXTRACTION_EMPTY"
  | "HIL_LAYER_TEMPLATE_FIELD_EMPTY"
  | "HIL_LAYER_TEMPLATE_FIELD_UNKNOWN"
  | "HIL_LAYER_TEMPLATE_PLACEHOLDER"
  | "HIL_LAYER_TEMPLATE_VERSION_STALE"
  | "HIL_LAYER_VERTICAL_ADJACENCY_BYPASS"
  | "HIL_LAYER_VERTICAL_BACKPROP_MISSING"
  | "HIL_LAYER_VERTICAL_DERIVED_FROM_MISSING"
  | "HIL_LAYER_VERTICAL_EDGE_STALE"
  | "HIL_LAYER_VERTICAL_GRANULARITY_INVALID"
  | "HIL_LAYER_VERTICAL_PAIR_INCOMPLETE"
  | "HIL_LAYER_VERTICAL_REVISION_MISMATCH"
  | "HIL_LAYER_VERTICAL_SNAPSHOT_MISMATCH"
  | "HIL_LAYER_VPAIR_EXECUTION_MISSING"
  | "HIL_LAYER_VPAIR_FORWARD_MISSING"
  | "HIL_LAYER_VPAIR_INCOMPLETE"
  | "HIL_LAYER_VPAIR_L0_L14_MISSING"
  | "HIL_LAYER_VPAIR_L1_L14_MISSING"
  | "HIL_LAYER_VPAIR_L2_L10_MISSING"
  | "HIL_LAYER_VPAIR_L3_L12_MISSING"
  | "HIL_LAYER_VPAIR_L4_L9_MISSING"
  | "HIL_LAYER_VPAIR_L5_L8_MISSING"
  | "HIL_LAYER_VPAIR_L6_L7_MISSING"
  | "HIL_LAYER_VPAIR_ORACLE_MISMATCH"
  | "HIL_LAYER_VPAIR_REVERSE_MISSING"
  | "HIL_LAYER_VPAIR_SNAPSHOT_MISMATCH"
  | "HIL_LAYER_TRANSACTION_CAS_CONFLICT"
  | "HIL_LAYER_TRANSACTION_STORE_FAILURE"
  | "HIL_LAYER_MANIFEST_INVALID"
  | "HIL_LAYER_PROGRESS_DENOMINATOR_UNAUTHORIZED"
  | "HIL_LAYER_PROGRESS_DENOMINATOR_MISMATCH"
  | "HIL_LAYER_PROGRESS_STAGE_INCLUSION_INVALID"
  | "HIL_LAYER_PROGRESS_STAGE_ORDER_INVALID"
  | "HIL_LAYER_PROGRESS_EVIDENCE_STALE"
  | "HIL_LAYER_PROGRESS_AUDITOR_NOT_INDEPENDENT"
  | "HIL_LAYER_PROGRESS_RECEIPT_MISMATCH"
  | "HIL_LAYER_PROGRESS_PROJECTION_MISMATCH"
  | "HIL_LAYER_PROGRESS_SUPPORTING_INCLUDED";
interface LayerGateFailureV1 { code: LayerGateFailureCodeV1; evidence_digest: string; retryable: boolean }
type LayerGateResultV1<T, E extends LayerGateFailureV1 | readonly LayerGateFailureV1[]> = { ok: true; value: T } | { ok: false; error: E };
interface LayerRegistryEntryV1 { schema_version: "helix-layer-registry-entry.v1"; layer_id: string; layer_revision: number; parent_layer_id: string | null; pair_layer_id: string; template_id: string; entry_digest: string }
interface RegistrySnapshotV1 { schema_version: "helix-layer-registry-snapshot.v1"; registry_revision: number; registry_digest: string; entry_ids: readonly string[]; event_head: string; snapshot_digest: string }
interface RegistryReceiptV1 { schema_version: "helix-layer-registry-receipt.v1"; layer_id: string; registry_revision: number; before_registry_digest: string; after_registry_digest: string; entry_digest: string; receipt_digest: string }
interface TemplateSnapshotV1 { schema_version: "helix-layer-template-snapshot.v1"; template_id: string; template_revision: number; schema_digest: string; content_digest: string; source_snapshot_digest: string }
interface TemplateSchemaV1 { schema_version: "helix-layer-template-schema.v1"; field_paths: readonly string[]; required_field_paths: readonly string[]; placeholder_policy_digest: string; schema_digest: string }
interface OperationIdV1 { schema_version: "helix-layer-operation.v1"; operation_id: string; operation_digest: string; idempotency_key: string }
interface ObligationProposalV1 { schema_version: "helix-layer-obligation-proposal.v1"; proposal_id: string; layer_id: string; source_span_digest: string; semantic_digest: string; provenance_digest: string; proposal_digest: string }
interface ObligationProposalSetV1 { schema_version: "helix-layer-obligation-proposal-set.v1"; operation_id: string; proposals: readonly ObligationProposalV1[]; proposal_ids: readonly string[]; proposal_set_digest: string }
interface AuthorityReceiptV1 { schema_version: "helix-layer-authority-receipt.v1"; receipt_id: string; authority_scope: "layer_ledger_write"; actor_identity_digest: string; issued_at: string; expires_at: string; registry_revision: number; receipt_digest: string }
interface LayerLedgerHeadV1 { schema_version: "helix-layer-ledger-head.v1"; layer_id: string; row_revision: number; event_head: string; row_set_digest: string; head_digest: string }
interface LayerRowCommitPlanV1 { schema_version: "helix-layer-row-commit-plan.v1"; operation_id: string; expected_head_digest: string; proposal_digest: string; authority_receipt_digest: string; next_row_digest: string; plan_digest: string }
interface LayerRowSetV1 { schema_version: "helix-layer-row-set.v1"; layer_id: string; registry_revision: number; row_ids: readonly string[]; row_set_digest: string; snapshot_digest: string }
interface VerticalPairReceiptV1 { schema_version: "helix-vertical-layer-pair-receipt.v1"; upper_layer_id: string; lower_layer_id: string; derived_from_digest: string; backprop_digest: string; snapshot_digest: string; verdict: "verified" | "failed" | "stale"; receipt_digest: string }
interface PairSideV1 { schema_version: "helix-horizontal-pair-side.v1"; layer_id: string; artifact_digest: string; oracle_digest: string; snapshot_digest: string; revision: number }
interface ExecutionReceiptV1 { schema_version: "helix-layer-execution-receipt.v1"; execution_id: string; oracle_digest: string; exit_code: number; output_digest: string; source_snapshot_digest: string; receipt_digest: string }
interface HorizontalPairReceiptV1 { schema_version: "helix-horizontal-layer-pair-receipt.v1"; forward_layer_id: string; reverse_layer_id: string; forward_digest: string; reverse_digest: string; execution_receipt_digest: string; verdict: "verified" | "failed" | "stale"; receipt_digest: string }
interface LedgerSnapshotV1 { schema_version: "helix-ledger-refactor-snapshot.v1"; registry_revision: number; row_set_digest: string; vertical_pair_digest: string; horizontal_pair_digest: string; consumer_set_digest: string; snapshot_digest: string }
interface ConsumerOracleV1 { schema_version: "helix-ledger-consumer-oracle.v1"; consumer_id: string; input_digest: string; expected_output_digest: string; oracle_digest: string }
interface RollbackTargetV1 { schema_version: "helix-ledger-rollback-target.v1"; target_revision: number; target_snapshot_digest: string; restore_receipt_digest: string }
interface DesignRefactorPlanV1 { schema_version: "helix-ledger-design-refactor-plan.v1"; before_snapshot_digest: string; after_snapshot_digest: string; consumer_oracle_digests: readonly string[]; rollback_target_digest: string; semantic_delta_digest: string; plan_digest: string }
interface LayerLedgerSnapshotV1 { snapshot_id: string; registry_revision: number; event_head: string; row_set_digest: string; vertical_pair_digest: string; horizontal_pair_digest: string; projection_digest: string }
interface LayerLedgerAdditionV1 { addition_id: string; layer_id: string; source_span_digest: string; authority_receipt_digest: string; semantic_digest: string; operation_id: string }
interface VerticalPairEdgeV1 { edge_id: string; upper_layer: string; lower_layer: string; derived_from_digest: string; backprop_digest: string; snapshot_digest: string; revision: number; status: "current" | "stale" }
interface HorizontalPairEdgeV1 { edge_id: string; forward_layer: string; reverse_layer: string; forward_digest: string; reverse_oracle_digest: string; execution_receipt_digest: string; snapshot_digest: string; revision: number; status: "current" | "stale" }
interface LayerPairReceiptV1 { receipt_id: string; kind: "vertical" | "horizontal"; left_revision: number; right_revision: number; oracle_digest: string; execution_receipt_digest: string; verdict: "verified" | "failed" | "stale" }
interface LayerGateFindingV1 { finding_id: string; subject_id: string; failure_code: string; evidence_digest: string; event_head: string; status: "open" | "resolved" | "stale" }
interface LayerLedgerEventV1 { event_id: string; sequence: number; operation_id: string; previous_digest: string; event_digest: string; payload_digest: string }
type DesignSliceIdV1 =
  | "HDS-HIL-01" | "HDS-HIL-02" | "HDS-HIL-03" | "HDS-HIL-04" | "HDS-HIL-05"
  | "HDS-HIL-06" | "HDS-HIL-07" | "HDS-HIL-08" | "HDS-HIL-09A" | "HDS-HIL-09B"
  | "HDS-HIL-10" | "HDS-HIL-11" | "HDS-HIL-12" | "HDS-HIL-13" | "HDS-HIL-14"
  | "HDS-HIL-15" | "HDS-HIL-16" | "HDS-HIL-17" | "HDS-HIL-18";
type FixedDesignSliceIdsV1 = readonly [
  "HDS-HIL-01", "HDS-HIL-02", "HDS-HIL-03", "HDS-HIL-04", "HDS-HIL-05",
  "HDS-HIL-06", "HDS-HIL-07", "HDS-HIL-08", "HDS-HIL-09A", "HDS-HIL-09B",
  "HDS-HIL-10", "HDS-HIL-11", "HDS-HIL-12", "HDS-HIL-13", "HDS-HIL-14",
  "HDS-HIL-15", "HDS-HIL-16", "HDS-HIL-17", "HDS-HIL-18"
];
type DesignProgressStageV1 = "artifact_created" | "semantic_closed" | "independent_audited" | "pair_frozen" | "implementation_verified";
type QuartetArtifactKindV1 = "l5_design" | "l8_integration_test_design" | "l6_function_design" | "l7_unit_test_design";
interface MeasurementProvenanceV1 { source_commit: string; source_tree_digest: string; measurement_command: string; measurement_tool: string; measurement_version: string; measured_at: string; output_digest: string }
interface SnapshotDigestV1 { snapshot_digest: string; registry_revision: number; registry_digest: string; denominator_digest: string; source_commit: string; source_tree_digest: string; design_digest: string; event_head: string; measured_at: string }
interface CanonicalOracleInventoryV1 { unit_ids: readonly string[]; unit_count: 491; unit_set_digest: string; integration_ids: readonly string[]; integration_count: 360; integration_set_digest: string; hst_ids: readonly string[]; hst_count: 462; hst_set_digest: string; quartet_count: 851; total_count: 1313; combined_set_digest: string }
interface DenominatorArtifactInventoryV1 { slice_id: DesignSliceIdV1; kind: QuartetArtifactKindV1; path: string; content_digest: string }
interface ApprovedDenominatorV1 {
  schema_version: "helix-design-progress-denominator.v1";
  denominator_id: string;
  registry_revision: number;
  registry_digest: string;
  slice_ids: FixedDesignSliceIdsV1;
  slice_count: 19;
  artifacts: readonly DenominatorArtifactInventoryV1[];
  artifact_count: 76;
  artifact_set_digest: string;
  canonical_oracles: CanonicalOracleInventoryV1;
  supporting_inventory: { unit: readonly ["U-LLPG-S01"]; integration: readonly ["IT-LLPG-S01"]; included_in_canonical_denominator: false };
  denominator_digest: string;
  authority_receipt_id: string;
  authority_receipt_digest: string;
  authority_status: "current";
  authority_issued_at: string;
  authority_expires_at: string;
  freshness_evidence_digest: string;
  supersedes_denominator_id: string | null;
  supersession_chain_digest: string;
  supersession_terminal: true;
  source: MeasurementProvenanceV1;
}
interface QuartetArtifactEvidenceV1 { kind: QuartetArtifactKindV1; path: string; content_digest: string; source_commit: string; source_tree_digest: string; design_digest: string }
interface ArtifactQuartetReceiptV1 { receipt_id: string; receipt_digest: string; slice_id: DesignSliceIdV1; artifacts: readonly [QuartetArtifactEvidenceV1 & { kind: "l5_design" }, QuartetArtifactEvidenceV1 & { kind: "l8_integration_test_design" }, QuartetArtifactEvidenceV1 & { kind: "l6_function_design" }, QuartetArtifactEvidenceV1 & { kind: "l7_unit_test_design" }]; quartet_digest: string; snapshot_digest: string; status: "current" }
interface IndependentAuditEvidenceV1 { receipt_id: string; receipt_digest: string; slice_id: DesignSliceIdV1; status: "current"; snapshot_digest: string; source_commit: string; source_tree_digest: string; design_digest: string; author_runtime: string; author_model: string; reviewer_runtime: string; reviewer_model: string; runtime_model_separated: true; quartet_digest: string; audit_policy_id: string; audit_policy_version: string; finding_ids: readonly string[]; finding_closure_receipt_ids: readonly string[]; open_finding_count: 0; audit_digest: string }
interface PairFreezeEvidenceV1 { slice_id: DesignSliceIdV1; l5_l8_receipt_id: string; l5_l8_receipt_digest: string; l5_l8_status: "current"; l6_l7_receipt_id: string; l6_l7_receipt_digest: string; l6_l7_status: "current"; quartet_digest: string; snapshot: SnapshotDigestV1 }
interface OracleExecutionEvidenceV1 { oracle_id: string; command: string; command_version: string; exit_code: 0; output_digest: string; executed_at: string; source_commit: string; source_tree_digest: string; design_digest: string; artifact_or_db_evidence_digest: string }
interface ImplementationEvidenceV1 { receipt_id: string; receipt_digest: string; slice_id: DesignSliceIdV1; status: "current"; snapshot_digest: string; canonical_unit_count: number; canonical_integration_count: number; canonical_hst_count: number; canonical_unit_ids_digest: string; canonical_integration_ids_digest: string; canonical_hst_ids_digest: string; executions: readonly OracleExecutionEvidenceV1[]; supporting_excluded: readonly ["U-LLPG-S01", "IT-LLPG-S01"] }
interface StageReceiptBaseV1<S extends DesignProgressStageV1> {
  schema_version: "helix-design-stage-receipt.v1";
  receipt_id: string;
  receipt_digest: string;
  stage: S;
  denominator_id: string;
  denominator_digest: string;
  registry_revision: number;
  numerator_slice_ids: readonly DesignSliceIdV1[];
  numerator_count: number;
  numerator_set_digest: string;
  rate_basis_points: number;
  evidence_receipt_ids: readonly string[];
  evidence_receipt_digests: readonly string[];
  snapshot: SnapshotDigestV1;
  issued_at: string;
  fresh_until: string;
  supersedes_receipt_id: string | null;
  supersession_chain_digest: string;
  event_head: string;
  status: "current" | "stale";
  stale_cause_event_id: string | null;
}
interface ArtifactCreatedStageReceiptV1 extends StageReceiptBaseV1<"artifact_created"> { artifact_quartets: readonly ArtifactQuartetReceiptV1[] }
interface SemanticClosedEvidenceV1 { receipt_id: string; receipt_digest: string; slice_id: DesignSliceIdV1; quartet_digest: string; semantic_policy_id: string; semantic_policy_version: string; finding_closure_digest: string; status: "current"; snapshot_digest: string }
interface SemanticClosedStageReceiptV1 extends StageReceiptBaseV1<"semantic_closed"> { semantic_evidence: readonly SemanticClosedEvidenceV1[] }
interface IndependentAuditedStageReceiptV1 extends StageReceiptBaseV1<"independent_audited"> { independent_audits: readonly IndependentAuditEvidenceV1[] }
interface PairFrozenStageReceiptV1 extends StageReceiptBaseV1<"pair_frozen"> { pair_freezes: readonly PairFreezeEvidenceV1[] }
interface ImplementationVerifiedStageReceiptV1 extends StageReceiptBaseV1<"implementation_verified"> { implementation: readonly ImplementationEvidenceV1[] }
type StageReceiptV1 = ArtifactCreatedStageReceiptV1 | SemanticClosedStageReceiptV1 | IndependentAuditedStageReceiptV1 | PairFrozenStageReceiptV1 | ImplementationVerifiedStageReceiptV1;
type StageStateV1 = "absent" | "current" | "stale";
interface StageEvidenceV1 { stage: DesignProgressStageV1; denominator_digest: string; numerator_set_digest: string; evidence_receipt_digests: readonly string[]; snapshot_digest: string; event_head: string }
interface StageTransitionReceiptV1 { receipt_id: string; receipt_digest: string; stage: DesignProgressStageV1; from: StageStateV1; to: StageStateV1; evidence_digest: string; event_head: string; issued_at: string }
type ProgressStaleCauseV1 = "registry_changed" | "denominator_changed" | "artifact_changed" | "audit_policy_changed" | "audit_input_changed" | "freeze_changed" | "implementation_commit_changed" | "test_changed" | "command_changed" | "source_tree_changed" | "design_changed";
interface DesignProgressStaleEventV1 { schema_version: "helix-design-progress-stale.v1"; event_id: string; event_digest: string; cause: ProgressStaleCauseV1; changed_subject_digest: string; invalidated_stages: readonly DesignProgressStageV1[]; invalidated_receipt_ids: readonly string[]; replacement_receipt_ids: readonly string[]; supersession_chain_digest: string; denominator_digest: string; before_event_head: string; after_event_head: string; occurred_at: string }
interface DesignProgressAxisV1<S extends DesignProgressStageV1 = DesignProgressStageV1> { stage: S; numerator_slice_ids: readonly DesignSliceIdV1[]; numerator: number; denominator: 19; rate_basis_points: number; stage_receipt_ids: readonly string[]; stage_receipt_digests: readonly string[] }
interface EvidenceStoreRevisionV1 { revision: number; event_head: string; snapshot_digest: string }
interface EvidenceStoreRevisionVectorV1 { denominator: EvidenceStoreRevisionV1; artifacts: EvidenceStoreRevisionV1; semantic: EvidenceStoreRevisionV1; audits: EvidenceStoreRevisionV1; freezes: EvidenceStoreRevisionV1; implementation: EvidenceStoreRevisionV1; vector_digest: string }
interface DesignProgressProjectionV1 { schema_version: "helix-design-progress-projection.v1"; denominator: ApprovedDenominatorV1; stages: readonly [DesignProgressAxisV1<"artifact_created">, DesignProgressAxisV1<"semantic_closed">, DesignProgressAxisV1<"independent_audited">, DesignProgressAxisV1<"pair_frozen">, DesignProgressAxisV1<"implementation_verified">]; execution: { canonical_unit: number; canonical_integration: number; canonical_hst: number; canonical_total: number }; store_revision_vector: EvidenceStoreRevisionVectorV1; snapshot: SnapshotDigestV1; projection_digest: string }
interface DesignProgressCalculationRequestV1 { trusted_now: string; requested_denominator_hint: Pick<ApprovedDenominatorV1, "denominator_id" | "denominator_digest" | "registry_revision">; expected_event_head: string; expected_source_commit: string; expected_source_tree_digest: string; expected_design_digest: string }
interface CurrentEvidenceReadV1<T> { values: readonly T[]; revision: EvidenceStoreRevisionV1 }
interface DenominatorAuthorityStoreV1 { readCurrentAuthority(trustedNow: string): Promise<{ value: ApprovedDenominatorV1; revision: EvidenceStoreRevisionV1 }>; readCurrentStageReceipts(denominatorId: string): Promise<CurrentEvidenceReadV1<StageReceiptV1>>; readCurrentSnapshot(): Promise<SnapshotDigestV1> }
interface ArtifactEvidenceStoreV1 { readCurrentQuartets(sliceIds: readonly DesignSliceIdV1[]): Promise<CurrentEvidenceReadV1<ArtifactQuartetReceiptV1>> }
interface SemanticEvidenceStoreV1 { readCurrentSemanticClosure(sliceIds: readonly DesignSliceIdV1[]): Promise<CurrentEvidenceReadV1<SemanticClosedEvidenceV1>> }
interface AuditEvidenceStoreV1 { readCurrentAudits(sliceIds: readonly DesignSliceIdV1[]): Promise<CurrentEvidenceReadV1<IndependentAuditEvidenceV1>> }
interface FreezeEvidenceStoreV1 { readCurrentPairFreezes(sliceIds: readonly DesignSliceIdV1[]): Promise<CurrentEvidenceReadV1<PairFreezeEvidenceV1>> }
interface ImplementationEvidenceStoreV1 { readCurrentImplementation(sliceIds: readonly DesignSliceIdV1[]): Promise<CurrentEvidenceReadV1<ImplementationEvidenceV1>> }
interface DesignProgressAuthorityInternalStoresV1 { denominator: DenominatorAuthorityStoreV1; artifacts: ArtifactEvidenceStoreV1; semantic: SemanticEvidenceStoreV1; audits: AuditEvidenceStoreV1; freezes: FreezeEvidenceStoreV1; implementation: ImplementationEvidenceStoreV1 }
interface SupportingMetaOracleReceiptV1 { receipt_id: string; receipt_digest: string; oracle_ids: readonly ["U-LLPG-S01", "IT-LLPG-S01"]; status: "designed_not_implemented" | "implemented_verified"; canonical_denominator_included: false; snapshot_digest: string }
interface DesignProgressCommitBundleV1 { schema_version: "helix-design-progress-commit.v1"; operation_id: string; operation_digest: string; expected_event_head: string; expected_registry_revision: number; expected_store_revision_vector: EvidenceStoreRevisionVectorV1; denominator_hint: Pick<ApprovedDenominatorV1, "denominator_id" | "denominator_digest">; requested_stage_receipt_ids: readonly string[]; expected_projection_digest: string; expected_source_commit: string; expected_source_tree_digest: string; expected_design_digest: string; stale_event: DesignProgressStaleEventV1 | null; supporting_meta_oracle_receipt: SupportingMetaOracleReceiptV1; append_order: readonly ["event", "projection", "terminal_receipt"]; write_set_digest: string }
interface DesignProgressCommitReceiptV1 { schema_version: "helix-design-progress-commit-receipt.v1"; operation_id: string; operation_digest: string; before_head: string; after_head: string; committed_store_revision_vector: EvidenceStoreRevisionVectorV1; generated_event_digest: string; stale_event_digest: string | null; projection_digest: string; source_snapshot_digest: string; canonical_unit_set_digest: string; canonical_integration_set_digest: string; canonical_hst_set_digest: string; terminal_receipt_id: string; terminal_receipt_digest: string; supporting_meta_oracle_receipt_digest: string; write_set_digest: string; replay_digest: string }
interface DesignProgressAtomicTransactionPortV1 {
  calculateCurrent(request: DesignProgressCalculationRequestV1): Promise<LayerGateResultV1<DesignProgressProjectionV1, LayerGateFailureV1[]>>;
  readValidateAndCommit(bundle: DesignProgressCommitBundleV1): Promise<LayerGateResultV1<DesignProgressCommitReceiptV1, LayerGateFailureV1[]>>;
  readValidateAndReconcile(bundle: DesignProgressCommitBundleV1): Promise<LayerGateResultV1<DesignProgressCommitReceiptV1, LayerGateFailureV1[]>>;
  findTerminalReceipt(operationId: string): Promise<DesignProgressCommitReceiptV1 | null>;
}
interface DesignRefactorCandidateV1 { candidate_id: string; before_snapshot_digest: string; after_snapshot_digest: string; diff_digest: string; provenance_digest: string; consumer_set_digest: string; behavior_invariant_digest: string; pair_set_digest: string }
interface DesignRefactorRerouteV1 { route: "redesign" | "retrofit"; reason_code: "HIL_LAYER_REFACTOR_REDESIGN_REQUIRED" | "HIL_LAYER_REFACTOR_RETROFIT_REQUIRED"; target_plan_id: string; target_revision: number; causality_digest: string }
type LayerLedgerOperationPayloadV1 =
  | { kind: "registry"; value: LayerRegistryEntryV1 }
  | { kind: "extraction_rows"; extraction: ObligationProposalSetV1; rows: LayerLedgerAdditionV1[] }
  | { kind: "pair_edges_receipt"; edges: Array<VerticalPairEdgeV1 | HorizontalPairEdgeV1>; receipt: LayerPairReceiptV1 };
interface LayerLedgerOperationBundleV1 { operation_id: string; operation_digest: string; expected_ledger_head: string; expected_registry_revision: number; expected_subject_revision: number; payload: LayerLedgerOperationPayloadV1; append_order: ["event", "projection", "receipt"]; write_set_digest: string }
interface LayerLedgerOperationReceiptV1 { operation_id: string; operation_digest: string; before_head: string; after_head: string; subject_revision: number; event_sequence: number; projection_digest: string; write_set_digest: string; replay_digest: string }
interface LedgerRefactorCommitBundleV1 { operation_id: string; operation_digest: string; expected_ledger_head: string; expected_registry_revision: number; candidate: DesignRefactorCandidateV1; reroute: DesignRefactorRerouteV1 | null; pair_receipts: LayerPairReceiptV1[]; rollback_target_digest: string; append_order: ["candidate", "reroute", "pair_receipts", "rollback_receipt", "projection", "receipt"]; write_set_digest: string }
interface LedgerRefactorCommitReceiptV1 { operation_id: string; operation_digest: string; before_head: string; after_head: string; candidate_count: number; reroute_count: number; pair_receipt_count: number; rollback_receipt_digest: string; projection_digest: string; write_set_digest: string }
interface LayerLedgerCommitStoreV1 { commitOperation(bundle: LayerLedgerOperationBundleV1): Promise<LayerGateResultV1<LayerLedgerOperationReceiptV1, LayerGateFailureV1[]>>; reconcileOperation(bundle: LayerLedgerOperationBundleV1): Promise<LayerGateResultV1<LayerLedgerOperationReceiptV1, LayerGateFailureV1[]>>; commitRefactor(bundle: LedgerRefactorCommitBundleV1): Promise<LayerGateResultV1<LedgerRefactorCommitReceiptV1, LayerGateFailureV1[]>>; reconcileRefactor(bundle: LedgerRefactorCommitBundleV1): Promise<LayerGateResultV1<LedgerRefactorCommitReceiptV1, LayerGateFailureV1[]>>; findReceipt(operationId: string): Promise<LayerLedgerOperationReceiptV1 | LedgerRefactorCommitReceiptV1 | null>; replay(head: string): Promise<LayerLedgerSnapshotV1> }
type LayerLedgerWriteTargetV1 = "event" | "projection" | "receipt" | "pair_receipt" | "stage_receipt";
interface LayerLedgerWriteSetSchemaV1 { schema_version: "helix-layer-ledger-write-set.v1"; targets: LayerLedgerWriteTargetV1[] }
declare function parseLayerLedgerWriteSet(raw: string): LayerGateResultV1<LayerLedgerWriteSetSchemaV1, LayerGateFailureV1>;
type LayerLedgerExecutionApiV1 =
  | "registerLayerLedgerType" | "extractTemplateObligations" | "appendLayerLedgerRow"
  | "evaluateVerticalLedgerPair" | "evaluateHorizontalVPair" | "planLedgerDesignRefactor"
  | "calculateFixedDesignProgress" | "commitDesignProgress" | "reconcileDesignProgress"
  | "authorizeLayerStageTransition" | "commitLayerLedgerOperation" | "reconcileLayerLedgerOperation"
  | "commitLedgerRefactorBundle" | "reconcileLedgerRefactorBundle" | "parseLayerLedgerWriteSet";
type LayerLedgerExecutionPipelineV1 = "commitLedgerRefactorBundle+reconcileLedgerRefactorBundle";
type LayerLedgerFixtureManifestPathV1 = "docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest";
interface LayerLedgerExecutableCaseV1 { case_id: `HST-CASE-${string}`; fixture_id: string; fixture_revision: number; execution_api: LayerLedgerExecutionApiV1 | LayerLedgerExecutionPipelineV1; fault_position: string | null; expected_write_set: LayerLedgerWriteTargetV1[]; expected_receipt_digest: string; fixture_manifest_path: LayerLedgerFixtureManifestPathV1 }
```

progress APIはstore current値とrequested値の一致、authority freshness、supersession終端、event head CASを必須とする。
`calculateFixedDesignProgress`はhintをauthorityとして採用せず、6 evidence storeからcurrent authority、artifact、semantic、audit、freeze、
implementation evidenceとcurrent snapshotを同じrevision/head vectorで読み直す。fixed exact 19 ID集合、76 artifact path/digest集合、
canonical U 491/IT 360/HST 462のexact ID list/set digest、registry revision/digest、denominator digest、source commit/tree、design digestのいずれかが
不一致ならprojectionを返さない。各stageの分子はexact slice ID集合であり、重複、registry外ID、後段だけのID、別stage receiptの差し替えを
拒否する。包含不変条件は`implementation_verified ⊆ pair_frozen ⊆ independent_audited ⊆ semantic_closed ⊆ artifact_created`
である。ただし各率は独立軸のまま保持し、包含を理由に前段receiptを合成しない。

`artifact_created`は各sliceのexact 4 kind、4 path、4 content digestとquartet digestを要求する。`semantic_closed`は同じquartet digestへ
bindする。`independent_audited`はauthorとreviewerのruntime-model組が異なり、policy/version、finding全件、closure receipt、open 0を要求する。
`pair_frozen`は同一slice ID、quartet digest、固定`SnapshotDigestV1`に対するcurrentなL5↔L8とL6↔L7の2 receiptを要求する。receiptごとに
snapshot/registry/denominator/source commit/tree/design/event headをexact joinし、別sliceまたは別snapshot receiptの組合せを拒否する。`implementation_verified`はslice配下の
全canonical U/IT/HSTをcommand、command version、exit 0、output digest、source commit/tree、design digest、artifact/DB evidenceへbindする。
全19 slice完了時だけcanonical U 491、IT 360、HST 462とのexact集合一致を追加検査する。`U-LLPG-S01`と`IT-LLPG-S01`は
supporting存在inventoryであり、stage分母、canonical execution分母、完了集合へ混入させない。

registry/denominator、artifact、audit policy/input、freeze receipt、implementation commit/test/command、source tree、design digestの変更は、
旧snapshotへbindした当該stageと全後段stageを同一event内で`stale`へ遷移させる。
superseded authority、期限切れfreshness、receipt swap、missing receipt、commit/tree drift、axis mixingではauthoritative numerator増分を0とする。
progress transactionはauthority、全stage receipt、projectionが同一denominator/snapshot/store revision-head vectorを持つ一つのpayloadであり、
append順はevent→projection→terminal receipt、CAS loser、partial write、異digest retryでは増分0とする。execution件数は補助軸でありstage率へ加算しない。
`commitDesignProgress`と`reconcileDesignProgress`は`DesignProgressAtomicTransactionPortV1`だけをpublic write portとして受け取る。同port内部で
6 evidence storeを同一transaction snapshotからcurrent再読し、計算後かつwrite直前に全revision/headを再検証して、生成progress event、
projection、terminal receiptを単一CAS/reconcile単位にする。内部6 store、生成projection、低水準commit primitiveをcallerへ公開せず、
`readValidateAndCommit`を経ない直書き経路を型境界から除外する。caller提供projection、authorityの分裂、terminal receiptだけの先行を許可しない。
`LayerLedgerOperationPayloadV1`はprogress variantを型として持たない。generic `commitLayerLedgerOperation`からprogress event、stage receipt、
projection、terminal receiptを書けず、`commitDesignProgress`だけを唯一writerとする。store revision/head vectorの一要素でも再読値と異なれば
`HIL_LAYER_TRANSACTION_CAS_CONFLICT`でTOCTOUをfail-closeする。

## §3 S01 digest正規preimage規約

共通algorithm IDは`helix-llpg-s01-digest.v1`、hashはSHA-256、出力はlowercase hexへ`sha256:`を付ける。preimageはUTF-8、BOMなし、
field/record separatorはLF (`0x0A`)、aggregate末尾LFなしとする。ID、path、digest、commit/treeはraw scalar bytesをquote/escapeせず使い、
booleanはlowercase `true`/`false`とする。対象scalarにTAB、LF、CR、NUL、非ASCIIがあればfail-closeする。arrayはASCII byte昇順へsortし、
重複を拒否する。manifest記載順やlocale sortはauthorityにしない。nested digestには`sha256:`付きの完全なdigest文字列を入れる。

| digest | exact preimage record順 | sort／包含・除外 |
|---|---|---|
| `slice_set_digest` | `slice_ids[*]` | slice IDをsort。countやfield名は除外 |
| `artifact_path_content_set_digest` | 各recordを`path<TAB>content_digest` | record全体をsort。`slice_id`、count、field名は除外。各`content_digest`はfile exact bytes（file末尾LFを含む）のSHA-256 |
| `canonical_unit_set_digest` | `canonical_unit_ids[*]` | IDをsort。supporting `U-LLPG-S01`は除外 |
| `canonical_integration_set_digest` | `canonical_integration_ids[*]` | IDをsort。supporting `IT-LLPG-S01`は除外 |
| `canonical_hst_set_digest` | `canonical_hst_ids[*]` | IDをsort |
| `canonical_combined_set_digest` | unit set digest、integration set digest、HST set digest | 左記3 recordの固定順。再sort禁止 |
| `design_snapshot_digest` | source commit、source tree、slice set、artifact set、unit set、integration set、HST set digest | 左記7 recordの固定順。fixture revision等は除外 |
| supporting receipt `receipt_digest` | receipt ID、fixed design snapshot digest、`U-LLPG-S01`、`IT-LLPG-S01`、status、included flag | 左記6 recordの固定順。oracle ID arrayを再sortせずexact 2順、flagは`false` |
| `expected_terminal_receipt_digest` | fixture ID、design snapshot、slice set、artifact set、unit set、integration set、HST set、supporting receipt digest | 左記8 recordの固定順。terminal ID/status/algorithm名は除外 |

依存順はleaf 5集合＋artifact content → combined/design → supporting receipt → terminal receiptとする。manifestの
`digest_contract.preimages`に同じfield pointer、sort、separator、末尾LF、included/excluded fieldを構造化し、loaderはmanifest以外のsource/globを
分母解決へ使わない。列挙arrayがcanonical sort済みでない、count不一致、duplicate、規約外scalar、nested digest差は
`HIL_LAYER_MANIFEST_INVALID`としてcommit前に拒否する。

52-case manifestの空field、重複/range、存在しないfixture manifest artifact pathを拒否する。実装test fileの存在は別のL7 receiptで検証する。
parserは`none`または`+`区切りallowlistをstable順のexact setへ変換し、unknown/duplicate/順序違反を拒否する。

## §4 public API primary owner正本

15 public APIは次のprimary U/ITへ一意にbindする。52 primary caseの残余行とsupporting S01は各owner APIの
composition/mutationであり、第2 ownerまたはcanonical分母として数えない。

| public API | primary U | primary IT |
|---|---|---|
| `registerLayerLedgerType` | `U-LLPG-002` | `IT-LLPG-002` |
| `extractTemplateObligations` | `U-LLPG-001` | `IT-LLPG-001` |
| `appendLayerLedgerRow` | `U-LLPG-003` | `IT-LLPG-003` |
| `evaluateVerticalLedgerPair` | `U-LLPG-016` | `IT-LLPG-016` |
| `evaluateHorizontalVPair` | `U-LLPG-025` | `IT-LLPG-025` |
| `planLedgerDesignRefactor` | `U-LLPG-039` | `IT-LLPG-039` |
| `calculateFixedDesignProgress` | `U-LLPG-011` | `IT-LLPG-011` |
| `commitDesignProgress` | `U-LLPG-012` | `IT-LLPG-012` |
| `reconcileDesignProgress` | `U-LLPG-015` | `IT-LLPG-015` |
| `authorizeLayerStageTransition` | `U-LLPG-015` | `IT-LLPG-015` |
| `commitLayerLedgerOperation` | `U-LLPG-001` | `IT-LLPG-001` |
| `reconcileLayerLedgerOperation` | `U-LLPG-016` | `IT-LLPG-016` |
| `commitLedgerRefactorBundle` | `U-LLPG-039` | `IT-LLPG-039` |
| `reconcileLedgerRefactorBundle` | `U-LLPG-039` | `IT-LLPG-039` |
| `parseLayerLedgerWriteSet` | `U-LLPG-052` | `IT-LLPG-052` |

`LayerLedgerExecutionApiV1 | LayerLedgerExecutionPipelineV1`と
`LayerLedgerFixtureManifestPathV1`だけをexecutable caseへ許可し、未知API、暗黙alias、別fixture pathを実行前に拒否する。
