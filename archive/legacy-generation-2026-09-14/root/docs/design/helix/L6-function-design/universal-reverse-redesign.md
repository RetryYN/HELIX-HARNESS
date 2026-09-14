---
title: "HELIX L6 機能設計 — Universal Reverse／Redesign"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-04
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_l5: docs/design/helix/L5-detail/universal-reverse-redesign.md
related_hst:
  - HST-HIL-002
  - HST-HIL-018
pair_artifact: docs/test-design/helix/L6-universal-reverse-redesign-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-04
  - HAC-HIL-04a
  - HAC-HIL-04b
  - HAC-HIL-04c
source_capabilities:
  - HU-CAP-001
---

# HELIX L6 機能設計 — Universal Reverse／Redesign

## §0 関数境界

pure functionはDB、filesystem、clock、AI runtimeを直接読まない。Issue/drive/source、phase artifact、
layer/pair graph、screen receipt、approvalをimmutable snapshotとして受ける。event append、stale CAS、
claim leaseはinjected Node portだけが行う。

## §1 public APIとexact oracle

| API | signature | DbC／result | L7 oracle | HAC | exact HST | pre_state | expected_state | canonical failure対応 |
|---|---|---|---|---|---|---|---|---|
| `compileUniversalReverseManifest` | `(issue, drive, source) => ResultV1<UniversalReverseManifestV1, ReverseFailureV1[]>` | R0–R4の原子的分母とpair targetを生成 | `U-URR-001` | `HAC-HIL-04a` | `HST-CASE-002-01` | `reverse_r4` | `pair_freeze_ready` | `なし（正常系）` |
| `rejectMissingReverseStage` | `(manifest, artifacts) => ResultV1<OrderedReversePhasesV1, ReverseFailureV1[]>` | 欠落stageと全未完obligationを列挙 | `U-URR-002` | `HAC-HIL-04b` | `HST-CASE-002-02` | `reverse_incomplete` | `reverse_incomplete` | `HIL_REVERSE_STAGE_MISSING` |
| `invalidateL1VerticalPair` | `(finding, graph, current) => ResultV1<RedesignStalePlanV1, ReverseFailureV1[]>` | L1/L14と全descendant closure | `U-URR-003` | `HAC-HIL-04c` | `HST-CASE-002-03` | `pair_current` | `pair_stale` | `HIL_REDESIGN_PAIR_STALE` |
| `invalidateL2ScreenDecision` | `(finding, screen, graph) => ResultV1<RedesignStalePlanV1, ReverseFailureV1[]>` | screen/prototype/no-UIとL3以降をstale化 | `U-URR-004` | `HAC-HIL-04c` | `HST-CASE-002-04` | `screen_receipt_current` | `screen_receipt_stale` | `HIL_REDESIGN_SCREEN_STALE` |
| `requirePoEscalationForL0` | `(finding, approval, snapshot) => ResultV1<L0EscalationReceiptV1, ReverseFailureV1>` | PO decision前write/freeze/claim 0 | `U-URR-005` | `HAC-HIL-04c` | `HST-CASE-002-05` | `redesign_pending` | `po_escalation_required` | `HIL_REDESIGN_L0_APPROVAL_REQUIRED` |
| `validateDriveReversePair` | `(issue, driveReceipt, reverseReceipt) => ResultV1<UniversalReversePairReceiptV1, ReverseFailureV1[]>` | same revision/scope/snapshotとR0–R4を要求 | `U-URR-006` | `HAC-HIL-04a` | `HST-CASE-002-06` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_PAIR_MISSING` |
| `requireRedesignRoute` | `(finding, route, delta) => ResultV1<RedesignRouteV1, ReverseFailureV1[]>` | design defectのForward直行を拒否 | `U-URR-007` | `HAC-HIL-04c` | `HST-CASE-002-07` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_ROUTE_MISSING` |
| `validateReverseReadinessForTransition` | `(transition, reverse, route, freeze, gateBundle) => ResultV1<ReverseTransitionReadinessV1, ReverseFailureV1[]>` | 4 transitionのgate bypassを拒否 | `U-URR-008` | `HAC-HIL-04a` | `HST-CASE-002-08` | `assertion_input_ready` | `assertion_pass` | `HIL_ISSUE_GATE_BYPASS` |
| `resolveMinimalAffectedLayer` | `(delta, layerGraph, traces) => ResultV1<AffectedLayerDecisionV1, ReverseFailureV1[]>` | L0–L6の最初の意味差分を一意化 | `U-URR-009` | `HAC-HIL-04c` | `HST-CASE-002-09` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_LAYER_INVALID` |
| `authorizeClaimBeforeTool` | `(issue, pair, route, freeze, lease, port) => Promise<ResultV1<ImplementationClaimReceiptV1, ReverseFailureV1[]>>` | current bundle後だけclaim CAS | `U-URR-010` | `HAC-HIL-04a` | `HST-CASE-002-10` | `assertion_input_ready` | `assertion_pass` | `HIL_IMPLEMENTATION_NOT_READY` |
| `validateRedesignReentry` | `(route, stale, pairs, screens, oracles) => ResultV1<RedesignReentryReceiptV1, ReverseFailureV1[]>` | L1/L2のstale 0とsame lineageを要求 | `U-URR-011` | `HAC-HIL-04c` | `HST-CASE-002-11` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_REENTRY_BYPASS` |
| `sealReverseSubstanceCoverage` | `(phases, workload, assertions) => ResultV1<ReverseSubstanceReceiptV1, ReverseFailureV1[]>` | 全phase semantic coverage 100%だけseal | `U-URR-012` | `HAC-HIL-04a`, `HAC-HIL-04b` | `HST-CASE-018-01` | `reverse_r4` | `pair_freeze_ready` | `なし（正常系）` |
| `validateR0SourceSpans` | `(artifact, obligations) => ResultV1<ReversePhaseReceiptV1, ReverseFailureV1[]>` | pinned spanとnegative evidenceを要求 | `U-URR-013` | `HAC-HIL-04b` | `HST-CASE-018-02` | `reverse_r0` | `reverse_r0` | `HIL_REVERSE_SUBSTANCE_SOURCE_MISSING` |
| `validateR1ObservedContracts` | `(artifact, surfaces) => ResultV1<ReversePhaseReceiptV1, ReverseFailureV1[]>` | placeholder/skipを拒否し探索結論を要求 | `U-URR-014` | `HAC-HIL-04b` | `HST-CASE-018-03` | `reverse_r1` | `reverse_r1` | `HIL_REVERSE_SUBSTANCE_PLACEHOLDER` |
| `validateR2AsIsSemanticDelta` | `(r1, r2, obligations) => ResultV1<ReversePhaseReceiptV1, ReverseFailureV1[]>` | 同文、同assertion、孤立nodeを拒否 | `U-URR-015` | `HAC-HIL-04b` | `HST-CASE-018-04` | `reverse_r2` | `reverse_r2` | `HIL_REVERSE_SUBSTANCE_IDENTICAL` |
| `validateR3IntentDigest` | `(r2, r3, authority) => ResultV1<ReversePhaseReceiptV1, ReverseFailureV1[]>` | digest再利用、反証なし、PO欠落を拒否 | `U-URR-016` | `HAC-HIL-04b` | `HST-CASE-018-05` | `reverse_r3` | `reverse_r3` | `HIL_REVERSE_SUBSTANCE_DIGEST_REUSED` |
| `accountR4ObligationCoverage` | `(r4, manifest, completions) => ResultV1<ReverseWorkloadReceiptV1, ReverseFailureV1[]>` | obligation全件とrouteを要求 | `U-URR-017` | `HAC-HIL-04b` | `HST-CASE-018-06` | `reverse_r4` | `reverse_r4` | `HIL_REVERSE_OBLIGATION_MISSING` |
| `checkpointReverseBudget` | `(run, workload, budget, nextAction, port) => Promise<ResultV1<ReverseCheckpointV1, ReverseFailureV1>>` | totalを維持しcompletion/claim 0 | `U-URR-018` | `HAC-HIL-04b` | `HST-CASE-018-07` | `reverse_incomplete` | `reverse_incomplete` | `HIL_REVERSE_BUDGET_INCOMPLETE` |
| `validateReversePhaseSequence` | `(current, requested, predecessor) => ResultV1<ReversePhaseTransitionV1, ReverseFailureV1[]>` | R0→R4以外を拒否 | `U-URR-019` | `HAC-HIL-04b` | `HST-CASE-018-08` | `reverse_r0` | `reverse_r0` | `HIL_REVERSE_PHASE_SKIP` |
| `detectHollowReverseArtifact` | `(phase, artifact, siblings) => ResultV1<ReverseSemanticAssertionSetV1, ReverseFailureV1[]>` | 空/placeholder/同文/同digest/未被覆を分類 | `U-URR-020` | `HAC-HIL-04b` | `HST-CASE-018-09` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_SUBSTANCE_HOLLOW` |
| `preventReverseObligationWaiver` | `(manifest, workload, exemptions, claim) => ResultV1<ReverseIncompleteReceiptV1, ReverseFailureV1[]>` | skip/例外/budget免除を拒否 | `U-URR-021` | `HAC-HIL-04b` | `HST-CASE-018-10` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_OBLIGATION_WAIVED` |
| `validateReverseSemanticCoverage` | `(manifest, phases, spans, assertions) => ResultV1<ReverseCoverageReceiptV1, ReverseFailureV1[]>` | 非空でも意味coverage不足なら拒否 | `U-URR-022` | `HAC-HIL-04b` | `HST-CASE-018-11` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE` |
| `classifyRetrofitDelta` | `(delta, persistedSurfaces, runtimeSurfaces) => ResultV1<RetrofitClassificationV1, ReverseFailureV1[]>` | state/data/schema/runtime/dependency変更をtyped分類しRedesign併存を分離 | `U-URR-023` | `HAC-HIL-04c` | supporting | `route_pending` | `classified` | `HIL_RETROFIT_CLASSIFICATION_INVALID` |
| `validateRetrofitMigrationEvidence` | `(classification, plan, dryRun, backup, rollback, monitoring, current) => ResultV1<RetrofitEvidenceReceiptV1, ReverseFailureV1[]>` | target snapshot、dry-run、backup、rollback rehearsal、monitoring/abort thresholdをexact照合 | `U-URR-024` | `HAC-HIL-04c` | supporting | `classified` | `migration_ready` | `HIL_RETROFIT_EVIDENCE_INCOMPLETE` |
| `bindRedesignCausality` | `(finding, route, run, parentIssue, stalePlan) => ResultV1<RedesignCausalityReceiptV1, ReverseFailureV1[]>` | finding→run→route→affected layer→stale closureを一因果へbind | `U-URR-025` | `HAC-HIL-04c` | supporting | `route_pending` | `causality_bound` | `HIL_REDESIGN_CAUSALITY_INVALID` |
| `buildUniversalReverseCommitBundle` | `(run, phases, pair, route, operation) => ResultV1<UniversalReverseCommitBundleV1, ReverseFailureV1[]>` | Reverse本体のmanifest/R0–R4/workload/pair/routeだけのwrite setを正規化し、stale/refreeze payloadの混載を拒否 | `U-URR-026` | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting | `prepared` | `commit_ready` | `HIL_REVERSE_TRANSACTION_INVALID` |
| `commitUniversalReverseBundle` | `(bundle, store) => Promise<ResultV1<UniversalReverseCommitReceiptV1, ReverseFailureV1[]>>` | manifest/R0–R4/workload/pair/routeを単一Node transactionでCAS commitし、stale/refreezeは更新しない | `U-URR-027` | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting | `commit_ready` | `committed` | `HIL_REVERSE_TRANSACTION_CONFLICT` |
| `commitRedesignStaleClosure` | `(bundle, store) => Promise<ResultV1<StaleClosureReceiptV1, ReverseFailureV1[]>>` | causalityとdescendant stale edge全件を不可分commit | `U-URR-028` | `HAC-HIL-04c` | supporting | `pair_current` | `pair_stale` | `HIL_REDESIGN_STALE_COMMIT_FAILED` |
| `commitReentryRefreeze` | `(bundle, store) => Promise<ResultV1<ReentryFreezeReceiptV1, ReverseFailureV1[]>>` | stale supersession、pair/oracle再実行、same lineage、freezeを不可分commit | `U-URR-029` | `HAC-HIL-04c` | supporting | `pair_stale` | `refrozen` | `HIL_REDESIGN_REFREEZE_COMMIT_FAILED` |
| `reconcileUniversalReverseCommit` | `(operationId, immutableEvidence, store) => Promise<ResultV1<UniversalReverseCommitReceiptV1 | StaleClosureReceiptV1 | ReentryFreezeReceiptV1, ReverseFailureV1[]>>` | operation kindをreceiptから解決し、base/stale/refreeze各evidenceからprojectionをrebuildして同headだけresume | `U-URR-030` | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting | `commit_pending` | `committed` | `HIL_REVERSE_RECONCILE_FAILED` |

## §2 schema

```ts
type ResultV1<T, E> = { ok: true; value: T } | { ok: false; error: E };
type ReversePhaseV1 = "R0" | "R1" | "R2" | "R3" | "R4";
type GovernedLayerV1 = "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6";
interface UniversalReverseManifestV1 { schema_version: "helix-universal-reverse-manifest.v1"; reverse_run_id: string; issue_id: string; issue_revision: number; drive_receipt_digest: string; scope_digest: string; source_snapshot_digest: string; phase_obligation_set_digests: Record<ReversePhaseV1, string>; pair_target_digest: string; manifest_digest: string }
interface OrderedReversePhasesV1 { reverse_run_id: string; ordered_phases: ["R0", "R1", "R2", "R3", "R4"]; missing_phases: ReversePhaseV1[]; incomplete_obligation_ids: string[]; manifest_digest: string; ordering_digest: string }
interface RedesignStalePlanV1 { route_id: string; finding_digest: string; root_layer: GovernedLayerV1; source_revision: number; target_revision: number; descendant_layers: GovernedLayerV1[]; stale_edge_ids: string[]; pair_receipt_ids: string[]; screen_receipt_ids: string[]; stale_set_digest: string }
interface L0EscalationReceiptV1 { finding_digest: string; snapshot_digest: string; approval_receipt_id: string | null; status: "po_escalation_required"; design_write_count: 0; freeze_count: 0; claim_count: 0; receipt_digest: string }
interface UniversalReversePairReceiptV1 { issue_id: string; issue_revision: number; drive_receipt_digest: string; reverse_receipt_digest: string; scope_digest: string; snapshot_digest: string; phase_receipt_digests: [string, string, string, string, string]; route_digest: string; pair_target_digest: string; receipt_digest: string }
interface RedesignRouteV1 { finding_digest: string; route: "redesign"; affected_layer: Exclude<GovernedLayerV1, "L0">; before_semantic_digest: string; after_semantic_digest: string; consumer_set_digest: string; pair_set_digest: string; oracle_set_digest: string; redesign_causality_id: string; route_digest: string }
interface ReverseTransitionReadinessV1 { issue_id: string; issue_revision: number; transition: "ready" | "implement" | "merge" | "close"; reverse_receipt_digest: string; route_receipt_digest: string; freeze_receipt_digest: string; gate_bundle_digest: string; ready: true; receipt_digest: string }
interface AffectedLayerDecisionV1 { route: "forward_current" | "design_refactor" | "redesign" | "retrofit" | "escalate_l0"; root_layer: GovernedLayerV1 | null; descendant_layers: GovernedLayerV1[]; minimality_evidence_digest: string; trace_set_digest: string; decision_digest: string }
interface ImplementationClaimReceiptV1 { claim_id: string; issue_id: string; issue_revision: number; pair_receipt_digest: string; route_receipt_digest: string; freeze_receipt_digest: string; lease_digest: string; claimed_at: string; receipt_digest: string }
interface RedesignReentryReceiptV1 { route_id: string; issue_revision: number; root_layer: GovernedLayerV1; snapshot_lineage_digest: string; stale_supersession_digest: string; pair_set_digest: string; screen_receipt_set_digest: string; oracle_receipt_set_digest: string; stale_remaining_count: 0; receipt_digest: string }
interface ReverseSubstanceReceiptV1 { reverse_run_id: string; phase_receipt_digests: [string, string, string, string, string]; workload_receipt_set_digest: string; semantic_coverage_basis_points: 10000; blocked_count: 0; pair_freeze_ready: true; receipt_digest: string }
interface ReversePhaseReceiptV1 { reverse_run_id: string; phase: ReversePhaseV1; artifact_digest: string; obligation_set_digest: string; workload_receipt_digest: string; source_span_count: number; source_span_set_digest: string; semantic_assertion_count: number; semantic_assertion_set_digest: string; semantic_coverage_basis_points: 10000; status: "passed"; receipt_digest: string }
interface ReverseWorkloadReceiptV1 { reverse_run_id: string; phase: ReversePhaseV1; total: number; completed: number; blocked: number; item_set_digest: string; complete: boolean; receipt_digest: string }
interface ReverseCheckpointV1 { reverse_run_id: string; phase: ReversePhaseV1; workload_receipt_digest: string; budget_evidence_digest: string; next_action: string; completion_count: 0; claim_count: 0; checkpoint_digest: string }
interface ReversePhaseTransitionV1 { reverse_run_id: string; from_phase: ReversePhaseV1; to_phase: ReversePhaseV1; predecessor_receipt_digest: string; current_receipt_digest: string; allowed: true; transition_digest: string }
interface ReverseSemanticAssertionSetV1 { phase: ReversePhaseV1; assertion_ids: string[]; assertion_digests: string[]; hollow_finding_codes: ReverseFailureV1["code"][]; valid: boolean; assertion_set_digest: string }
interface ReverseIncompleteReceiptV1 { reverse_run_id: string; reason_code: "HIL_REVERSE_OBLIGATION_WAIVED" | "HIL_REVERSE_BUDGET_INCOMPLETE"; outstanding_obligation_ids: string[]; workload_receipt_digest: string; completion_count: 0; claim_count: 0; receipt_digest: string }
interface ReverseCoverageReceiptV1 { reverse_run_id: string; obligation_set_digest: string; phase_receipt_set_digest: string; source_span_set_digest: string; semantic_assertion_set_digest: string; semantic_coverage_basis_points: 10000; duplicate_assertion_count: 0; uncovered_obligation_count: 0; receipt_digest: string }
interface RetrofitClassificationV1 { classification_id: string; delta_digest: string; persisted_surfaces: ("state" | "data" | "schema")[]; runtime_surfaces: ("runtime" | "dependency")[]; contract_change: boolean; redesign_required: boolean; route: "retrofit"; classification_digest: string }
interface RetrofitEvidenceReceiptV1 { classification_id: string; target_snapshot_digest: string; migration_plan_digest: string; dry_run_receipt_digest: string; backup_receipt_digest: string; rollback_rehearsal_receipt_digest: string; monitoring_receipt_digest: string; abort_threshold_digest: string; all_current: true; receipt_digest: string }
interface RedesignCausalityReceiptV1 { redesign_causality_id: string; finding_digest: string; parent_issue_id: string; parent_issue_revision: number; reverse_run_id: string; route_digest: string; affected_layer: Exclude<GovernedLayerV1, "L0">; stale_set_digest: string; receipt_digest: string }

interface ProjectionDigestV1 {
  schema_version: "helix-projection-digest.v1";
  subject_kind: string;
  subject_id: string;
  subject_revision: number;
  event_head: string;
  projection_head: string;
  state_digest: string;
  row_count_digest: string;
}
interface SourceSpanV1 { artifact_id: string; source_revision: string; start_line: number; end_line: number; content_digest: string; negative_evidence_digest: string | null }
interface SemanticAssertionV1 { assertion_id: string; phase: "R0" | "R1" | "R2" | "R3" | "R4"; obligation_id: string; assertion_digest: string; evidence_digest: string }

interface ReversePhaseArtifactV1 {
  issue_id: string;
  issue_revision: number;
  phase: "R0" | "R1" | "R2" | "R3" | "R4";
  obligation_set_digest: string;
  input_digest: string;
  output_digest: string;
  predecessor_digest: string | null;
  source_spans: SourceSpanV1[];
  semantic_assertions: SemanticAssertionV1[];
  workload: { total: number; completed: number; blocked: number; item_set_digest: string };
}

interface ReverseRouteDecisionV1 {
  reverse_r4_digest: string;
  route: "forward_current" | "design_refactor" | "redesign" | "retrofit" | "escalate_l0";
  affected_layer: "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | null;
  stale_set_digest: string;
  authority_receipt_id: string | null;
}

type ReverseFailureV1 =
  | { code: "HIL_REVERSE_STAGE_MISSING" | "HIL_REVERSE_SUBSTANCE_SOURCE_MISSING" | "HIL_REVERSE_SUBSTANCE_PLACEHOLDER" | "HIL_REVERSE_SUBSTANCE_IDENTICAL" | "HIL_REVERSE_SUBSTANCE_DIGEST_REUSED" | "HIL_REVERSE_OBLIGATION_MISSING" | "HIL_REVERSE_BUDGET_INCOMPLETE" | "HIL_REVERSE_PHASE_SKIP" | "HIL_REVERSE_SUBSTANCE_HOLLOW" | "HIL_REVERSE_OBLIGATION_WAIVED" | "HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE"; phase: "R0" | "R1" | "R2" | "R3" | "R4" | null; evidence_digest: string }
  | { code: "HIL_REVERSE_PAIR_MISSING" | "HIL_ISSUE_GATE_BYPASS" | "HIL_IMPLEMENTATION_NOT_READY"; receipt_kind: string; evidence_digest: string }
  | { code: "HIL_REDESIGN_ROUTE_MISSING" | "HIL_REDESIGN_LAYER_INVALID" | "HIL_REDESIGN_PAIR_STALE" | "HIL_REDESIGN_SCREEN_STALE" | "HIL_REDESIGN_REENTRY_BYPASS" | "HIL_REDESIGN_L0_APPROVAL_REQUIRED" | "HIL_REDESIGN_CAUSALITY_INVALID"; layer: string | null; evidence_digest: string }
  | { code: "HIL_RETROFIT_CLASSIFICATION_INVALID" | "HIL_RETROFIT_EVIDENCE_INCOMPLETE"; migration_surface: string | null; evidence_digest: string }
  | { code: "HIL_REVERSE_TRANSACTION_INVALID" | "HIL_REVERSE_TRANSACTION_CONFLICT" | "HIL_REDESIGN_STALE_COMMIT_FAILED" | "HIL_REDESIGN_REFREEZE_COMMIT_FAILED" | "HIL_REVERSE_RECONCILE_FAILED"; operation_id: string; evidence_digest: string };


interface UniversalReverseCommitBundleV1 {
  mutation_kind: "reverse_commit";
  operation_id: string;
  payload_digest: string;
  issue_id: string;
  issue_revision: number;
  expected_event_head: string;
  expected_projection_head: string;
  expected_run_revision: number | null;
  expected_route_revision: number | null;
  manifest_digest: string;
  phase_artifact_workload_set_digest: string;
  drive_pair_digest: string;
  route_causality_digest: string;
  retrofit_evidence_digest: string | null;
}

interface RedesignStaleCommitBundleV1 {
  mutation_kind: "redesign_stale";
  operation_id: string;
  payload_digest: string;
  parent_reverse_operation_id: string;
  parent_reverse_receipt_digest: string;
  issue_id: string;
  issue_revision: number;
  expected_event_head: string;
  expected_projection_head: string;
  causality_receipt_digest: string;
  stale_edge_set_digest: string;
}

interface ReentryRefreezeCommitBundleV1 {
  mutation_kind: "reentry_refreeze";
  operation_id: string;
  payload_digest: string;
  parent_stale_operation_id: string;
  parent_stale_receipt_digest: string;
  issue_id: string;
  issue_revision: number;
  expected_event_head: string;
  expected_projection_head: string;
  stale_supersession_digest: string;
  pair_oracle_lineage_digest: string;
  refreeze_receipt_digest: string;
}

interface UniversalReverseCommitReceiptV1 { mutation_kind: "reverse_commit"; operation_id: string; payload_digest: string; issue_id: string; issue_revision: number; before_event_head: string; after_event_head: string; before_projection_head: string; after_projection_head: string; write_set_digest: string; projection_digest: string }
interface StaleClosureReceiptV1 { mutation_kind: "redesign_stale"; operation_id: string; payload_digest: string; issue_id: string; issue_revision: number; parent_reverse_receipt_digest: string; stale_edge_set_digest: string; before_projection_head: string; after_projection_head: string; projection_digest: string }
interface ReentryFreezeReceiptV1 { mutation_kind: "reentry_refreeze"; operation_id: string; payload_digest: string; issue_id: string; issue_revision: number; parent_stale_receipt_digest: string; stale_supersession_digest: string; pair_oracle_lineage_digest: string; freeze_receipt_digest: string; projection_digest: string }
interface ReverseImmutableEvidenceV1 { mutation_kind: "reverse_commit"; operation_id: string; payload_digest: string; artifact_set_digest: string; route_digest: string; expected_event_head: string; expected_projection_head: string }
interface RedesignStaleImmutableEvidenceV1 { mutation_kind: "redesign_stale"; operation_id: string; payload_digest: string; parent_reverse_receipt_digest: string; causality_digest: string; stale_edge_set_digest: string; expected_projection_head: string }
interface ReentryRefreezeImmutableEvidenceV1 { mutation_kind: "reentry_refreeze"; operation_id: string; payload_digest: string; parent_stale_receipt_digest: string; stale_supersession_digest: string; pair_oracle_lineage_digest: string; expected_projection_head: string }

interface UniversalReverseStoreV1 {
  commitBundle(bundle: UniversalReverseCommitBundleV1): Promise<UniversalReverseCommitReceiptV1>;
  commitRedesignStale(bundle: RedesignStaleCommitBundleV1): Promise<StaleClosureReceiptV1>;
  commitReentryRefreeze(bundle: ReentryRefreezeCommitBundleV1): Promise<ReentryFreezeReceiptV1>;
  readOperation(operationId: string): Promise<UniversalReverseCommitReceiptV1 | StaleClosureReceiptV1 | ReentryFreezeReceiptV1 | null>;
  readEventHead(issueId: string, revision: number): Promise<string>;
  readProjectionHead(issueId: string, revision: number): Promise<string>;
  rebuildProjection(issueId: string, revision: number): Promise<ProjectionDigestV1>;
  reconcile(operationId: string, immutableEvidence: ReverseImmutableEvidenceV1): Promise<UniversalReverseCommitReceiptV1>;
  reconcileRedesignStale(operationId: string, evidence: RedesignStaleImmutableEvidenceV1): Promise<StaleClosureReceiptV1>;
  reconcileReentryRefreeze(operationId: string, evidence: ReentryRefreezeImmutableEvidenceV1): Promise<ReentryFreezeReceiptV1>;
}
```

`ProjectionDigestV1`の共有semantic shape正本はL4基本設計 §2.3とし、base/stale/refreezeの各immutable evidenceとreceiptはmutation kindで混在を防ぐ。

## §3 不変条件

1. 全Issueは主駆動モデルとR0–R4をsame revision/snapshotでpairにする。
2. 各phaseは一件以上の原子的obligation、stage固有assertion、異digest、source spanを持つ。
3. range、sample、skip、例外値、budget免除でworkloadを減らさない。
4. design defectはRedesign、state/data/schema/runtime移行はRetrofit、L0はPO escalationへ送る。
5. affected Lは最小root、stale setは完全descendant closureとする。
6. L1/L2 re-entryはpair/screen/oracleがsame lineageでcurrentになるまで完了しない。
7. Reverse/route/re-freeze receiptより前のclaimとtool callは0。
8. HST002/018のcase/state/failure tupleを別tokenで上書きしない。

## §4 実装配置候補

| path候補 | 責務 |
|---|---|
| `src/schema/universal-reverse.ts` | phase、workload、pair、route、stale、re-entry型 |
| `src/reverse/obligation-compiler.ts` | R0–R4分母生成 |
| `src/reverse/substance-gate.ts` | stage schema、span、assertion、coverageを検査 |
| `src/reverse/workload-ledger.ts` | 計数とcheckpoint |
| `src/reverse/change-route.ts` | minimality、Redesign/Retrofit/L0分類 |
| `src/reverse/redesign-reentry.ts` | L1/L2 stale closureとre-freeze |
| `src/issue/reverse-implementation-entry.ts` | claim-before-tool interlockを強制 |
| `src/state-db/universal-reverse-projection.ts` | event/projection |

## §5 実装順と完了境界

schema→obligation→substance/workload→drive pair→route minimality→stale/re-entry→claim interlockの順で実装する。
L7 22件、L8 22件、HST002/018 22 tuple、pinned source、別runtime reviewまでdraftとし、実装完了を主張しない。
