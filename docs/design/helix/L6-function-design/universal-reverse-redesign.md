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
| `compileUniversalReverseManifest` | `(issue, drive, source) => Result<Manifest, Failure[]>` | R0–R4の原子的分母とpair targetを生成 | `U-URR-001` | `HAC-HIL-04a` | `HST-CASE-002-01` | `reverse_r4` | `pair_freeze_ready` | `なし（正常系）` |
| `rejectMissingReverseStage` | `(manifest, artifacts) => Result<OrderedPhases, Failure[]>` | 欠落stageと全未完obligationを列挙 | `U-URR-002` | `HAC-HIL-04b` | `HST-CASE-002-02` | `reverse_incomplete` | `reverse_incomplete` | `HIL_REVERSE_STAGE_MISSING` |
| `invalidateL1VerticalPair` | `(finding, graph, current) => Result<StalePlan, Failure[]>` | L1/L14と全descendant closure | `U-URR-003` | `HAC-HIL-04c` | `HST-CASE-002-03` | `pair_current` | `pair_stale` | `HIL_REDESIGN_PAIR_STALE` |
| `invalidateL2ScreenDecision` | `(finding, screen, graph) => Result<StalePlan, Failure[]>` | screen/prototype/no-UIとL3以降をstale化 | `U-URR-004` | `HAC-HIL-04c` | `HST-CASE-002-04` | `screen_receipt_current` | `screen_receipt_stale` | `HIL_REDESIGN_SCREEN_STALE` |
| `requirePoEscalationForL0` | `(finding, approval, snapshot) => Result<L0Escalation, Failure>` | PO decision前write/freeze/claim 0 | `U-URR-005` | `HAC-HIL-04c` | `HST-CASE-002-05` | `redesign_pending` | `po_escalation_required` | `HIL_REDESIGN_L0_APPROVAL_REQUIRED` |
| `validateDriveReversePair` | `(issue, driveReceipt, reverseReceipt) => Result<PairReceipt, Failure[]>` | same revision/scope/snapshotとR0–R4を要求 | `U-URR-006` | `HAC-HIL-04a` | `HST-CASE-002-06` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_PAIR_MISSING` |
| `requireRedesignRoute` | `(finding, route, delta) => Result<RedesignRoute, Failure[]>` | design defectのForward直行を拒否 | `U-URR-007` | `HAC-HIL-04c` | `HST-CASE-002-07` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_ROUTE_MISSING` |
| `validateReverseReadinessForTransition` | `(transition, reverse, route, freeze, gateBundle) => Result<Ready, Failure[]>` | 4 transitionのgate bypassを拒否 | `U-URR-008` | `HAC-HIL-04a` | `HST-CASE-002-08` | `assertion_input_ready` | `assertion_pass` | `HIL_ISSUE_GATE_BYPASS` |
| `resolveMinimalAffectedLayer` | `(delta, layerGraph, traces) => Result<AffectedLayer, Failure[]>` | L0–L6の最初の意味差分を一意化 | `U-URR-009` | `HAC-HIL-04c` | `HST-CASE-002-09` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_LAYER_INVALID` |
| `authorizeClaimBeforeTool` | `(issue, pair, route, freeze, lease, port) => Promise<Result<Claim, Failure[]>>` | current bundle後だけclaim CAS | `U-URR-010` | `HAC-HIL-04a` | `HST-CASE-002-10` | `assertion_input_ready` | `assertion_pass` | `HIL_IMPLEMENTATION_NOT_READY` |
| `validateRedesignReentry` | `(route, stale, pairs, screens, oracles) => Result<ReentryReceipt, Failure[]>` | L1/L2のstale 0とsame lineageを要求 | `U-URR-011` | `HAC-HIL-04c` | `HST-CASE-002-11` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_REENTRY_BYPASS` |
| `sealReverseSubstanceCoverage` | `(phases, workload, assertions) => Result<SubstanceReceipt, Failure[]>` | 全phase semantic coverage 100%だけseal | `U-URR-012` | `HAC-HIL-04a`, `HAC-HIL-04b` | `HST-CASE-018-01` | `reverse_r4` | `pair_freeze_ready` | `なし（正常系）` |
| `validateR0SourceSpans` | `(artifact, obligations) => Result<PhaseReceipt, Failure[]>` | pinned spanとnegative evidenceを要求 | `U-URR-013` | `HAC-HIL-04b` | `HST-CASE-018-02` | `reverse_r0` | `reverse_r0` | `HIL_REVERSE_SUBSTANCE_SOURCE_MISSING` |
| `validateR1ObservedContracts` | `(artifact, surfaces) => Result<PhaseReceipt, Failure[]>` | placeholder/skipを拒否し探索結論を要求 | `U-URR-014` | `HAC-HIL-04b` | `HST-CASE-018-03` | `reverse_r1` | `reverse_r1` | `HIL_REVERSE_SUBSTANCE_PLACEHOLDER` |
| `validateR2AsIsSemanticDelta` | `(r1, r2, obligations) => Result<PhaseReceipt, Failure[]>` | 同文、同assertion、孤立nodeを拒否 | `U-URR-015` | `HAC-HIL-04b` | `HST-CASE-018-04` | `reverse_r2` | `reverse_r2` | `HIL_REVERSE_SUBSTANCE_IDENTICAL` |
| `validateR3IntentDigest` | `(r2, r3, authority) => Result<PhaseReceipt, Failure[]>` | digest再利用、反証なし、PO欠落を拒否 | `U-URR-016` | `HAC-HIL-04b` | `HST-CASE-018-05` | `reverse_r3` | `reverse_r3` | `HIL_REVERSE_SUBSTANCE_DIGEST_REUSED` |
| `accountR4ObligationCoverage` | `(r4, manifest, completions) => Result<WorkloadReceipt, Failure[]>` | obligation全件とrouteを要求 | `U-URR-017` | `HAC-HIL-04b` | `HST-CASE-018-06` | `reverse_r4` | `reverse_r4` | `HIL_REVERSE_OBLIGATION_MISSING` |
| `checkpointReverseBudget` | `(run, workload, budget, nextAction, port) => Promise<Result<Checkpoint, Failure>>` | totalを維持しcompletion/claim 0 | `U-URR-018` | `HAC-HIL-04b` | `HST-CASE-018-07` | `reverse_incomplete` | `reverse_incomplete` | `HIL_REVERSE_BUDGET_INCOMPLETE` |
| `validateReversePhaseSequence` | `(current, requested, predecessor) => Result<Transition, Failure[]>` | R0→R4以外を拒否 | `U-URR-019` | `HAC-HIL-04b` | `HST-CASE-018-08` | `reverse_r0` | `reverse_r0` | `HIL_REVERSE_PHASE_SKIP` |
| `detectHollowReverseArtifact` | `(phase, artifact, siblings) => Result<SemanticAssertions, Failure[]>` | 空/placeholder/同文/同digest/未被覆を分類 | `U-URR-020` | `HAC-HIL-04b` | `HST-CASE-018-09` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_SUBSTANCE_HOLLOW` |
| `preventReverseObligationWaiver` | `(manifest, workload, exemptions, claim) => Result<Incomplete, Failure[]>` | skip/例外/budget免除を拒否 | `U-URR-021` | `HAC-HIL-04b` | `HST-CASE-018-10` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_OBLIGATION_WAIVED` |
| `validateReverseSemanticCoverage` | `(manifest, phases, spans, assertions) => Result<CoverageReceipt, Failure[]>` | 非空でも意味coverage不足なら拒否 | `U-URR-022` | `HAC-HIL-04b` | `HST-CASE-018-11` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE` |
| `classifyRetrofitDelta` | `(delta, persistedSurfaces, runtimeSurfaces) => Result<RetrofitClassification, ReverseFailure[]>` | state/data/schema/runtime/dependency変更をtyped分類しRedesign併存を分離 | `U-URR-023` | `HAC-HIL-04c` | supporting | `route_pending` | `classified` | `HIL_RETROFIT_CLASSIFICATION_INVALID` |
| `validateRetrofitMigrationEvidence` | `(classification, plan, dryRun, backup, rollback, monitoring, current) => Result<RetrofitEvidenceReceipt, ReverseFailure[]>` | target snapshot、dry-run、backup、rollback rehearsal、monitoring/abort thresholdをexact照合 | `U-URR-024` | `HAC-HIL-04c` | supporting | `classified` | `migration_ready` | `HIL_RETROFIT_EVIDENCE_INCOMPLETE` |
| `bindRedesignCausality` | `(finding, route, run, parentIssue, stalePlan) => Result<RedesignCausalityReceipt, ReverseFailure[]>` | finding→run→route→affected layer→stale closureを一因果へbind | `U-URR-025` | `HAC-HIL-04c` | supporting | `route_pending` | `causality_bound` | `HIL_REDESIGN_CAUSALITY_INVALID` |
| `buildUniversalReverseCommitBundle` | `(run, phases, pair, route, stale, reentry, refreeze, operation) => Result<UniversalReverseCommitBundleV1, ReverseFailure[]>` | 全write set、expected heads/revisions、operation/payload digestを正規化 | `U-URR-026` | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting | `prepared` | `commit_ready` | `HIL_REVERSE_TRANSACTION_INVALID` |
| `commitUniversalReverseBundle` | `(bundle, store) => Promise<Result<UniversalReverseCommitReceiptV1, ReverseFailure[]>>` | R0–R4/workload/pair/route/stale/reentry/refreezeを単一Node transactionでCAS commit | `U-URR-027` | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting | `commit_ready` | `committed` | `HIL_REVERSE_TRANSACTION_CONFLICT` |
| `commitRedesignStaleClosure` | `(bundle, store) => Promise<Result<StaleClosureReceipt, ReverseFailure[]>>` | causalityとdescendant stale edge全件を不可分commit | `U-URR-028` | `HAC-HIL-04c` | supporting | `pair_current` | `pair_stale` | `HIL_REDESIGN_STALE_COMMIT_FAILED` |
| `commitReentryRefreeze` | `(bundle, store) => Promise<Result<ReentryFreezeReceipt, ReverseFailure[]>>` | stale supersession、pair/oracle再実行、same lineage、freezeを不可分commit | `U-URR-029` | `HAC-HIL-04c` | supporting | `pair_stale` | `refrozen` | `HIL_REDESIGN_REFREEZE_COMMIT_FAILED` |
| `reconcileUniversalReverseCommit` | `(operationId, immutableEvidence, store) => Promise<Result<UniversalReverseCommitReceiptV1, ReverseFailure[]>>` | event/artifact evidenceからprojectionをrebuildし同headだけresume | `U-URR-030` | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting | `commit_pending` | `committed` | `HIL_REVERSE_RECONCILE_FAILED` |

## §2 schema

```ts
interface ReversePhaseArtifactV1 {
  issue_id: string;
  issue_revision: number;
  phase: "R0" | "R1" | "R2" | "R3" | "R4";
  obligation_set_digest: string;
  input_digest: string;
  output_digest: string;
  predecessor_digest: string | null;
  source_spans: SourceSpan[];
  semantic_assertions: SemanticAssertion[];
  workload: { total: number; completed: number; blocked: number; item_set_digest: string };
}

interface ReverseRouteDecisionV1 {
  reverse_r4_digest: string;
  route: "forward_current" | "design_refactor" | "redesign" | "retrofit" | "escalate_l0";
  affected_layer: "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | null;
  stale_set_digest: string;
  authority_receipt_id: string | null;
}

type ReverseFailure =
  | { code: "HIL_REVERSE_STAGE_MISSING" | "HIL_REVERSE_SUBSTANCE_SOURCE_MISSING" | "HIL_REVERSE_SUBSTANCE_PLACEHOLDER" | "HIL_REVERSE_SUBSTANCE_IDENTICAL" | "HIL_REVERSE_SUBSTANCE_DIGEST_REUSED" | "HIL_REVERSE_OBLIGATION_MISSING" | "HIL_REVERSE_BUDGET_INCOMPLETE" | "HIL_REVERSE_PHASE_SKIP" | "HIL_REVERSE_SUBSTANCE_HOLLOW" | "HIL_REVERSE_OBLIGATION_WAIVED" | "HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE"; phase: "R0" | "R1" | "R2" | "R3" | "R4" | null; evidence_digest: string }
  | { code: "HIL_REVERSE_PAIR_MISSING" | "HIL_ISSUE_GATE_BYPASS" | "HIL_IMPLEMENTATION_NOT_READY"; receipt_kind: string; evidence_digest: string }
  | { code: "HIL_REDESIGN_ROUTE_MISSING" | "HIL_REDESIGN_LAYER_INVALID" | "HIL_REDESIGN_PAIR_STALE" | "HIL_REDESIGN_SCREEN_STALE" | "HIL_REDESIGN_REENTRY_BYPASS" | "HIL_REDESIGN_L0_APPROVAL_REQUIRED" | "HIL_REDESIGN_CAUSALITY_INVALID"; layer: string | null; evidence_digest: string }
  | { code: "HIL_RETROFIT_CLASSIFICATION_INVALID" | "HIL_RETROFIT_EVIDENCE_INCOMPLETE"; migration_surface: string | null; evidence_digest: string }
  | { code: "HIL_REVERSE_TRANSACTION_INVALID" | "HIL_REVERSE_TRANSACTION_CONFLICT" | "HIL_REDESIGN_STALE_COMMIT_FAILED" | "HIL_REDESIGN_REFREEZE_COMMIT_FAILED" | "HIL_REVERSE_RECONCILE_FAILED"; operation_id: string; evidence_digest: string };

type Failure = ReverseFailure;

interface UniversalReverseCommitBundleV1 {
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
  stale_edge_set_digest: string;
  reentry_refreeze_digest: string | null;
}

interface UniversalReverseStore {
  commitBundle(bundle: UniversalReverseCommitBundleV1): Promise<UniversalReverseCommitReceiptV1>;
  readOperation(operationId: string): Promise<UniversalReverseCommitReceiptV1 | null>;
  readEventHead(issueId: string, revision: number): Promise<string>;
  rebuildProjection(issueId: string, revision: number): Promise<ProjectionDigest>;
  reconcile(operationId: string, immutableEvidence: ReverseImmutableEvidence): Promise<UniversalReverseCommitReceiptV1>;
}
```

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
