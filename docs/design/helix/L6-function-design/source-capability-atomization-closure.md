---
title: "HELIX L6 機能設計 — source capability atomization closure"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-09B
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-020
related_l5: docs/design/helix/L5-detail/source-capability-atomization-closure.md
pair_artifact: docs/test-design/helix/L6-source-capability-atomization-closure-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-09
  - HAC-HIL-09a
  - HAC-HIL-09b
  - HAC-HIL-09c
---

# HELIX L6 機能設計 — source capability atomization closure

## §1 関数契約

| API | DbC | unit oracle |
|---|---|---|
| `parseExtractorDescriptor` | strict manifest、artifact/config digest、unknown key拒否 | `U-SATOM-001` |
| `selectExtractorPlugin` | entryごとexactly-one primaryまたはterminal route | `U-SATOM-002, U-SATOM-003` |
| `openExtractorSession` | Node/Python共通requestとversion handshake | `U-SATOM-004` |
| `advanceExtractorProtocol` | sequence、terminal、payload/source digest、limitsを検証 | `U-SATOM-005, U-SATOM-006, U-SATOM-007, U-SATOM-008, U-SATOM-009` |
| `validateAtomProposal` | source binding、span bounds/digest、schema、決定性 | `U-SATOM-010, U-SATOM-011, U-SATOM-012` |
| `splitAtomicCandidate` | 独立trigger/effect/failure/stateで分割し不可分契約を保持 | `U-SATOM-013, U-SATOM-014, U-SATOM-015, U-SATOM-016, U-SATOM-017, U-SATOM-018` |
| `deriveSemanticSignature` | lexicalを除くcanonical IR、意味差、collisionを検査 | `U-SATOM-019, U-SATOM-020, U-SATOM-021` |
| `resolveAtomKindAndLineage` | kind exactly-one、fixture lineage、weight保存 | `U-SATOM-022, U-SATOM-023, U-SATOM-024` |
| `validateCapabilityDecision` | current exactly-one、6 route固有証拠、pending block | `U-SATOM-025, U-SATOM-026, U-SATOM-027, U-SATOM-028` |
| `resolveCoverageClosure` | canonical edgeとreverse view、target digestを解決 | `U-SATOM-029, U-SATOM-030` |
| `computeAtomizationCoverage` | 5分母を別率で計算しweight保存 | `U-SATOM-031` |
| `invalidateAtomizationReceipt` | source/plugin/config/schema/target driftをappend-only stale化 | `U-SATOM-032` |
| `commitAtomizationProjection` | Node portでseal済みbundleをevent/projectionへCAS commitし`projection_pending`を明示 | `U-SATOM-033` |
| `reconcileAndActivateAtomization` | 同一operation/digest/expected headsからprojectionを再構築し検証後だけactive化 | `U-SATOM-034` |

### §1.1 HST020主系のAPI tuple

| HSTケース | 主API | 主U | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-020-01` | `computeAtomizationCoverage` | `U-SATOM-031` | `snapshot_current` | `atoms_current` | `なし（正常系）` |
| `HST-CASE-020-02` | `resolveAtomKindAndLineage` | `U-SATOM-024` | `atoms_partial` | `failed` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-020-03` | `computeAtomizationCoverage` | `U-SATOM-024` | `atoms_partial` | `failed` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-020-04` | `splitAtomicCandidate` | `U-SATOM-013` | `staged` | `rejected` | `HIL_SOURCE_ATOM_NOT_ATOMIC` |
| `HST-CASE-020-05` | `resolveAtomKindAndLineage` | `U-SATOM-022` | `atoms_partial` | `failed` | `HIL_SOURCE_ATOM_UNCLASSIFIED` |
| `HST-CASE-020-06` | `splitAtomicCandidate` | `U-SATOM-018` | `staged` | `rejected` | `HIL_SOURCE_ATOM_OVERLAP` |
| `HST-CASE-020-07` | `invalidateAtomizationReceipt` | `U-SATOM-032` | `atoms_current` | `stale` | `HIL_SOURCE_ATOM_EXTRACTOR_STALE` |
| `HST-CASE-020-08` | `selectExtractorPlugin` | `U-SATOM-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_ATOMIZATION_INCOMPLETE` |
| `HST-CASE-020-09` | `computeAtomizationCoverage` | `U-SATOM-031` | `assertion_input_ready` | `assertion_pass` | `HIL_ATOMIC_COVERAGE_DENOMINATOR_INVALID` |

### §1.2 complete public signatureとAPI逆引き

以下を本sliceのcomplete public signatureとする。`SourceAtomizationResultV1`を含む全V1型は本書§2で
slice-localに閉じ、未作成の`src/schema/*`をdesign-time import authorityとして扱わない。

```ts
declare function parseExtractorDescriptor(raw: ExtractorDescriptorInputV1, policy: ExtractorDescriptorPolicyV1): SourceAtomizationResultV1<ExtractorCapabilityDescriptorV1>;
declare function selectExtractorPlugin(entry: CapturedSourceEntryV1, descriptors: readonly ExtractorCapabilityDescriptorV1[], policy: ExtractorSelectionPolicyV1): SourceAtomizationResultV1<ExtractorSelectionV1>;
declare function openExtractorSession(selection: ExtractorSelectionV1, request: ExtractorSessionRequestV1, broker: ExtractorSessionBrokerV1): Promise<SourceAtomizationResultV1<ExtractorSessionV1>>;
declare function advanceExtractorProtocol(session: ExtractorSessionV1, frame: ExtractorProtocolFrameV1, limits: ExtractorProtocolLimitsV1): SourceAtomizationResultV1<ExtractorProtocolStateV1>;
declare function validateAtomProposal(proposal: SourceAtomProposalV1, context: AtomProposalValidationContextV1): SourceAtomizationResultV1<ValidatedAtomProposalV1>;
declare function splitAtomicCandidate(proposal: ValidatedAtomProposalV1, policy: AtomicSplitPolicyV1): SourceAtomizationResultV1<AtomicCandidateSetV1>;
declare function deriveSemanticSignature(candidate: AtomicCandidateV1, schema: SemanticSignatureSchemaV1): SourceAtomizationResultV1<AtomSemanticSignatureV1>;
declare function resolveAtomKindAndLineage(candidate: AtomicCandidateV1, signature: AtomSemanticSignatureV1, fixtures: FixtureLineageInputV1): SourceAtomizationResultV1<ResolvedAtomLineageV1>;
declare function validateCapabilityDecision(atom: SourceAtomV1, proposal: CapabilityDecisionProposalV1, authority: DecisionAuthorityReceiptV1, current: CurrentDecisionSnapshotV1): SourceAtomizationResultV1<CapabilityDecisionRevisionV1>;
declare function resolveCoverageClosure(decision: CapabilityDecisionRevisionV1, targets: CoverageTargetSnapshotV1, policy: CoverageRelationPolicyV1): SourceAtomizationResultV1<CoverageClosureV1>;
declare function computeAtomizationCoverage(input: AtomizationCoverageInputV1): SourceAtomizationResultV1<AtomizationCoverageReceiptV1>;
declare function invalidateAtomizationReceipt(receipt: AtomizationCoverageReceiptV1, drift: AtomizationDriftV1, current: AtomizationProjectionV1): SourceAtomizationResultV1<AtomizationInvalidationPlanV1>;
declare function commitAtomizationProjection(bundle: AtomizationProjectionCommitBundleV1, store: AtomizationProjectionStoreV1): Promise<SourceAtomizationResultV1<AtomizationProjectionCommitReceiptV1>>;
declare function reconcileAndActivateAtomization(bundle: AtomizationProjectionCommitBundleV1, pending: AtomizationProjectionCommitReceiptV1, store: AtomizationProjectionStoreV1): Promise<SourceAtomizationResultV1<AtomizationProjectionCommitReceiptV1>>;
```

| 公開API | 主owner U | composition／mutation／supporting U | 既存L8 IT |
|---|---|---|---|
| `parseExtractorDescriptor` | `U-SATOM-001` | — | `IT-SATOM-002` |
| `selectExtractorPlugin` | `U-SATOM-002` | `U-SATOM-003` | `IT-SATOM-002` |
| `openExtractorSession` | `U-SATOM-004` | — | `IT-SATOM-003` |
| `advanceExtractorProtocol` | `U-SATOM-005` | `U-SATOM-006`, `U-SATOM-007`, `U-SATOM-008`, `U-SATOM-009` | `IT-SATOM-003`, `IT-SATOM-012` |
| `validateAtomProposal` | `U-SATOM-010` | `U-SATOM-011`, `U-SATOM-012` | `IT-SATOM-002`, `IT-SATOM-003`, `IT-SATOM-004` |
| `splitAtomicCandidate` | `U-SATOM-013` | `U-SATOM-014`, `U-SATOM-015`, `U-SATOM-016`, `U-SATOM-017`, `U-SATOM-018` | `IT-SATOM-005`, `IT-SATOM-006` |
| `deriveSemanticSignature` | `U-SATOM-019` | `U-SATOM-020`, `U-SATOM-021` | `IT-SATOM-004`, `IT-SATOM-005` |
| `resolveAtomKindAndLineage` | `U-SATOM-022` | `U-SATOM-023`, `U-SATOM-024` | `IT-SATOM-006`, `IT-SATOM-007`, `IT-SATOM-010` |
| `validateCapabilityDecision` | `U-SATOM-025` | `U-SATOM-026`, `U-SATOM-027`, `U-SATOM-028` | `IT-SATOM-007`, `IT-SATOM-008`, `IT-SATOM-010` |
| `resolveCoverageClosure` | `U-SATOM-029` | `U-SATOM-030` | `IT-SATOM-009`, `IT-SATOM-010`, `IT-SATOM-011` |
| `computeAtomizationCoverage` | `U-SATOM-031` | — | `IT-SATOM-001`, `IT-SATOM-006`, `IT-SATOM-010` |
| `invalidateAtomizationReceipt` | `U-SATOM-032` | — | `IT-SATOM-011` |
| `commitAtomizationProjection` | `U-SATOM-033` | — | `IT-SATOM-013` |
| `reconcileAndActivateAtomization` | `U-SATOM-034` | — | `IT-SATOM-013` |

primary ownerは14 APIでexactly-oneとする。残る20 Uは同じAPIを別ownerとして所有せず、上表のcomposition／mutation／supporting laneとして反例量と既存分母を保持する。

`IT-SATOM-013`の順序付きcompositionは
`commitAtomizationProjection` → `reconcileAndActivateAtomization`である。前者は`projection_pending`を
返し得る初回commit、後者は同一operation/digest/expected headsの検証済みreconcile/activateであり、Uを統合しない。

## §2 schema

```ts
type SourceAtomizationResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; error: SourceAtomizationFailureV1 };

type ExtractorRuntimeV1 = "node" | "python";
type ExtractorInputClassV1 = "file" | "directory" | "archive_entry" | "generated_artifact";
type SemanticAxisV1 = "trigger" | "input" | "output" | "effect" | "failure" | "state_transition" | "observable";

interface ExtractorDescriptorInputV1 { schema_version: "helix-extractor-descriptor-input.v1"; descriptor_bytes_digest: string; descriptor_text: string }
interface ExtractorLimitsV1 { max_entries: number; max_payload_bytes: number; deadline_ms: number; max_in_flight: number }
interface ExtractorDescriptorPolicyV1 { schema_version: "helix-extractor-descriptor-policy.v1"; allowed_runtimes: readonly ExtractorRuntimeV1[]; allowed_input_classes: readonly ExtractorInputClassV1[]; proposal_schema_version: "helix-source-atom-proposal.v1"; maximum_limits: ExtractorLimitsV1; policy_digest: string }
interface ExtractorCapabilityDescriptorV1 { schema_version: "helix-extractor-capability-descriptor.v1"; plugin_id: string; plugin_version: string; runtime: ExtractorRuntimeV1; artifact_digest: string; input_classes: readonly ExtractorInputClassV1[]; mime_types: readonly string[]; proposal_schema_version: "helix-source-atom-proposal.v1"; determinism_config_digest: string; limits: ExtractorLimitsV1; descriptor_digest: string; status: "active" | "retired" }
interface CapturedSourceEntryV1 { schema_version: "helix-captured-source-entry.v1"; source_snapshot_id: string; source_snapshot_digest: string; entry_id: string; entry_blob_digest: string; path_digest: string; mime_type: string; input_class: ExtractorInputClassV1; classification: "extractable" | "terminal"; status: "current" | "stale" }
interface ExtractorSelectionPolicyV1 { schema_version: "helix-extractor-selection-policy.v1"; registry_revision: number; registry_digest: string; terminal_routes: readonly { input_class: ExtractorInputClassV1; route: "evidence_only" | "reject" }[]; policy_digest: string }
interface ExtractorSelectionV1 { schema_version: "helix-extractor-selection.v1"; entry_id: string; plugin_id: string | null; plugin_version: string | null; runtime: ExtractorRuntimeV1 | null; descriptor_digest: string | null; terminal_route: "evidence_only" | "reject" | null; selection_digest: string }
interface ExtractorSessionRequestV1 { schema_version: "helix-extractor-session-request.v1"; run_id: string; request_id: string; source_snapshot_id: string; source_snapshot_digest: string; entry_id: string; entry_blob_digest: string; plugin_id: string; plugin_version: string; config_digest: string; operation_id: string; expected_sequence: 0; deadline_at: string; fence_digest: string }
interface ExtractorSessionV1 { schema_version: "helix-extractor-session.v1"; run_id: string; request_id: string; plugin_id: string; plugin_version: string; runtime: ExtractorRuntimeV1; protocol_version: "helix-extractor-protocol.v1"; source_snapshot_digest: string; entry_blob_digest: string; config_digest: string; expected_sequence: number; deadline_at: string; fence_digest: string; state: "opened" | "streaming" | "completed" | "failed" | "cancelled" }
interface ExtractorSessionBrokerV1 { open(request: ExtractorSessionRequestV1, selection: ExtractorSelectionV1): Promise<SourceAtomizationResultV1<ExtractorSessionV1>> }
interface ExtractorProtocolFrameV1 { schema_version: "helix-extractor-protocol-frame.v1"; protocol_version: "helix-extractor-protocol.v1"; kind: "hello" | "proposal" | "complete" | "error" | "cancelled"; run_id: string; request_id: string; sequence: number; source_snapshot_digest: string; entry_blob_digest: string; plugin_digest: string; config_digest: string; payload_digest: string; proposal: SourceAtomProposalV1 | null; frame_digest: string }
interface ExtractorProtocolLimitsV1 { schema_version: "helix-extractor-protocol-limits.v1"; max_payload_bytes: number; max_proposals: number; max_in_flight: number; deadline_at: string; limits_digest: string }
interface ExtractorProtocolStateV1 { schema_version: "helix-extractor-protocol-state.v1"; run_id: string; request_id: string; next_sequence: number; terminal_state: "open" | "completed" | "failed" | "cancelled"; accepted_proposal_digests: readonly string[]; accepted_set_digest: string; fenced: boolean; state_digest: string }
interface CanonicalSemanticTermV1 { term_id: string; axis: SemanticAxisV1; canonical_value_digest: string; source_span_digest: string }
interface AtomProposalValidationContextV1 { schema_version: "helix-atom-proposal-validation-context.v1"; source_snapshot_id: string; source_snapshot_digest: string; entry_id: string; entry_blob_digest: string; plugin_id: string; plugin_version: string; config_digest: string; proposal_schema_version: "helix-source-atom-proposal.v1"; maximum_span_end: number; current_protocol_state_digest: string; context_digest: string }
interface ValidatedAtomProposalV1 { schema_version: "helix-validated-atom-proposal.v1"; proposal: SourceAtomProposalV1; validated_spans: readonly SourceSpanV1[]; canonical_payload_digest: string; validation_context_digest: string }
interface AtomicSplitPolicyV1 { schema_version: "helix-atomic-split-policy.v1"; independent_axes: readonly SemanticAxisV1[]; require_disjoint_spans: true; require_complete_span_coverage: true; authority_boundary_digest: string; policy_digest: string }
interface AtomicCandidateV1 { schema_version: "helix-atomic-candidate.v1"; candidate_id: string; source_snapshot_id: string; entry_id: string; source_spans: readonly SourceSpanV1[]; trigger_digest: string; input_digest: string; output_digest: string; effect_digest: string; failure_digest: string; state_transition_digest: string; observable_digest: string; canonical_ir_digest: string; candidate_digest: string }
interface AtomicCandidateSetV1 { schema_version: "helix-atomic-candidate-set.v1"; candidates: readonly AtomicCandidateV1[]; candidate_ids: readonly string[]; source_span_coverage_digest: string; candidate_set_digest: string }
interface SemanticSignatureSchemaV1 { schema_version: "helix-semantic-signature-schema.v1"; signature_version: "v1"; axis_order: readonly SemanticAxisV1[]; canonicalization_rules_digest: string; schema_digest: string }
interface AtomSemanticSignatureV1 { schema_version: "helix-atom-semantic-signature.v1"; signature_version: "v1"; canonical_ir_digest: string; trigger_digest: string; input_digest: string; output_digest: string; effect_digest: string; failure_digest: string; state_transition_digest: string; observable_digest: string; determinism_digest: string; signature_digest: string }
interface FixtureLineageInputV1 { schema_version: "helix-fixture-lineage-input.v1"; producer_atom_ids: readonly string[]; assertion_ids: readonly string[]; canonical_target_ids: readonly string[]; fixture_set_digest: string }
interface ResolvedAtomLineageV1 { schema_version: "helix-resolved-atom-lineage.v1"; candidate_id: string; atom_kind: AtomKindV1; coverage_weight: 0 | 1; fixture_producer_atom_id: string | null; fixture_assertion_id: string | null; canonical_target_ids: readonly string[]; lineage_digest: string }
interface CapabilityDecisionProposalV1 { schema_version: "helix-capability-decision-proposal.v1"; atom_id: string; expected_atom_revision: number; decision: CapabilityDecisionV1; evidence_digests: readonly string[]; absorbed_into_atom_id: string | null; proposal_digest: string }
interface DecisionAuthorityReceiptV1 { schema_version: "helix-decision-authority-receipt.v1"; reviewer_authority_receipt_id: string; reviewer_id: string; authority_scope: "capability_decision"; issued_at: string; fresh_until: string; receipt_digest: string }
interface CurrentDecisionSnapshotV1 { schema_version: "helix-current-decision-snapshot.v1"; atom_id: string; current_revision: number | null; current_decision: CapabilityDecisionV1 | null; current_decision_digest: string | null; decision_head: string; snapshot_digest: string }
interface CoverageTargetV1 { target_kind: "requirement" | "non_goal" | "design" | "assertion" | "gate" | "atom"; target_id: string; target_digest: string; status: "current" | "stale" }
interface CoverageTargetSnapshotV1 { schema_version: "helix-coverage-target-snapshot.v1"; targets: readonly CoverageTargetV1[]; target_ids: readonly string[]; target_root_digest: string; snapshot_revision: number }
interface CoverageRelationPolicyV1 { schema_version: "helix-coverage-relation-policy.v1"; allowed_relations: readonly CapabilityCoverageEdgeV1["relation"][]; require_reverse_view: true; policy_digest: string }
interface CoverageClosureV1 { schema_version: "helix-coverage-closure.v1"; decision_revision: number; edges: readonly CapabilityCoverageEdgeV1[]; reverse_root_digest: string; open_target_ids: readonly string[]; closure_digest: string }
interface CoverageAxisCountV1 { denominator_ids: readonly string[]; numerator_ids: readonly string[]; denominator_digest: string; numerator_digest: string; denominator_count: number; numerator_count: number; rate: number }
interface AtomizationCoverageInputV1 { schema_version: "helix-atomization-coverage-input.v1"; source_snapshot_id: string; source_snapshot_digest: string; atom_ids: readonly string[]; decision_revision_ids: readonly string[]; edge_ids: readonly string[]; requirement_target_ids: readonly string[]; design_target_ids: readonly string[]; assertion_target_ids: readonly string[]; gate_target_ids: readonly string[]; fixture_target_ids: readonly string[]; input_digest: string }
interface AtomizationCoverageReceiptV1 { schema_version: "helix-atomization-coverage-receipt.v1"; receipt_id: string; source_snapshot_id: string; source_snapshot_digest: string; atomic: CoverageAxisCountV1; requirement: CoverageAxisCountV1; design: CoverageAxisCountV1; assertion: CoverageAxisCountV1; gate: CoverageAxisCountV1; fixture: CoverageAxisCountV1; decision_root_digest: string; edge_root_digest: string; receipt_digest: string; status: "current" | "stale" }
interface AtomizationDriftV1 { schema_version: "helix-atomization-drift.v1"; drift_kind: "source" | "plugin" | "config" | "schema" | "target"; subject_id: string; before_digest: string; after_digest: string; observed_event_head: string; drift_digest: string }
interface AtomizationInvalidationPlanV1 { schema_version: "helix-atomization-invalidation-plan.v1"; receipt_id: string; invalidated_receipt_ids: readonly string[]; invalidated_edge_ids: readonly string[]; stale_event: AtomizationEventV1; expected_projection_head: string; plan_digest: string }

interface SourceAtomProposalV1 {
  schema_version: "helix-source-atom-proposal.v1";
  run_id: string;
  request_id: string;
  sequence: number;
  source_snapshot_id: string;
  entry_id: string;
  entry_blob_digest: string;
  plugin_id: string;
  plugin_version: string;
  config_digest: string;
  candidate: {
    trigger: CanonicalSemanticTermV1[];
    inputs: CanonicalSemanticTermV1[];
    outputs: CanonicalSemanticTermV1[];
    effects: CanonicalSemanticTermV1[];
    failures: CanonicalSemanticTermV1[];
    state_transitions: CanonicalSemanticTermV1[];
    observables: CanonicalSemanticTermV1[];
    source_spans: SourceSpanV1[];
  };
  payload_digest: string;
}

interface SourceSpanV1 {
  source_snapshot_id: string;
  entry_id: string;
  entry_blob_digest: string;
  start_byte: number;
  end_byte_exclusive: number;
  span_digest: string;
}

type CapabilityDecisionV1 = "adopt" | "harden" | "redesign" | "reject" | "absorbed" | "pending";
type AtomKindV1 = "behavior" | "regression_fixture" | "evidence_only" | "duplicate_alias";

interface AtomizationProjectionCommitBundleV1 { operation_id: string; operation_digest: string; idempotency_key: string; bundle_digest: string; expected_artifact_head: string; expected_db_head: string; expected_active_head: string; atoms: SourceAtomV1[]; decisions: CapabilityDecisionRevisionV1[]; edges: CapabilityCoverageEdgeV1[]; events: AtomizationEventV1[]; projection: AtomizationProjectionV1; exact_write_set: { table: string; key: string; action: "insert" | "update" }[]; append_order: ["artifact_seal", "event_append", "projection", "active_pointer", "terminal_receipt"]; write_set_digest: string }
interface AtomizationProjectionCommitReceiptV1 { operation_id: string; operation_digest: string; bundle_digest: string; before_heads: { artifact: string; db: string; active: string }; after_heads: { artifact: string; db: string; active: string }; status: "committed" | "projection_pending"; event_sequence: number; write_set_digest: string; action_counts: Record<string, number> }
interface SourceAtomizationFailureV1 { code: SourceAtomizationFailureCodeV1; evidence_digest: string; cause_code: string | null }
```

proposalはstable IDとdecisionを持たない。Nodeがvalidated proposalからcanonical IR、semantic signature、source spanを
組み合わせてatom IDを生成する。hash一致かつcanonical IR不一致はcollisionとしてcommitしない。

## §3 実装配置

| path候補 | 責務 |
|---|---|
| `src/schema/source-atomization.ts` | proposal、atom、decision、edge、receipt、failure union定義 |
| `src/source/extractor-registry.ts` | allowlisted plugin descriptorとexact selection |
| `src/source/atomization-coordinator.ts` | capture bundle読込とrun orchestration |
| `src/source/atom-proposal-ingestion.ts` | Node authorityのschema/digest/span検証 |
| `src/source/atomic-split.ts` | atomic splitとgap/overlap検査 |
| `src/source/semantic-signature.ts` | canonical semantic IRとcollision検査 |
| `src/source/fixture-lineage.ts` | producer/assertion/alias relationとweight |
| `src/source/capability-decision.ts` | 6 decision証拠matrixとrevision |
| `src/source/capability-coverage.ts` | edge closure、reverse projection、率、receipt |
| `src/state-db/source-atomization-projection.ts` | artifact由来projectionとrebuild |

generic `PythonWorkerBroker`、`ResultIngestionPort`、L4の`source_capability_atoms`/`capability_coverage`を再定義せず、
atom固有adapter/schema/projectorだけを追加する。source moduleからSQLite driverを直接importしない。

## §4 failure union定義

canonical failureは原子化契約§7を正本とし、追加固有codeを次に限定する。

```ts
type SourceAtomizationFailureCodeV1 =
  | "HIL_SOURCE_SET_OPEN"
  | "HIL_SOURCE_ENTRY_UNCLASSIFIED"
  | "HIL_SOURCE_ATOM_EXTRACTION_EMPTY"
  | "HIL_SOURCE_ATOM_NOT_ATOMIC"
  | "HIL_SOURCE_ATOM_UNCLASSIFIED"
  | "HIL_SOURCE_ATOM_OVERLAP"
  | "HIL_SOURCE_ATOM_EXTRACTOR_STALE"
  | "HIL_SOURCE_AGGREGATE_ONLY"
  | "HIL_SOURCE_FIXTURE_MISCOUNT"
  | "HIL_SOURCE_FIXTURE_ORPHAN"
  | "HIL_SOURCE_BRANCH_DELTA_OPEN"
  | "HIL_SOURCE_ABSORPTION_UNPROVEN"
  | "HIL_SOURCE_DECISION_PENDING"
  | "HIL_SOURCE_REJECT_UNJUSTIFIED"
  | "HIL_SOURCE_ATOM_ORPHAN"
  | "HIL_SOURCE_EDGE_STALE"
  | "HIL_SOURCE_RECEIPT_DIGEST_MISMATCH"
  | "HIL_SOURCE_EXTRACTOR_PLUGIN_UNREGISTERED"
  | "HIL_SOURCE_EXTRACTOR_PLUGIN_AMBIGUOUS"
  | "HIL_SOURCE_EXTRACTOR_PROTOCOL_INVALID"
  | "HIL_SOURCE_EXTRACTOR_NONDETERMINISTIC"
  | "HIL_SOURCE_PROPOSAL_STALE"
  | "HIL_SOURCE_PROPOSAL_LATE"
  | "HIL_SOURCE_SEMANTIC_SIGNATURE_INVALID"
  | "HIL_SOURCE_SEMANTIC_SIGNATURE_COLLISION"
  | "HIL_SOURCE_ATOMIZATION_INCOMPLETE"
  | "HIL_SOURCE_COMPLETENESS_UNPROVEN"
  | "HIL_SOURCE_SNAPSHOT_STALE"
  | "HIL_ATOMIC_COVERAGE_DENOMINATOR_INVALID"
  | "HIL_PYTHON_AUTHORITY_BYPASS"
  | "HIL_WORKER_PROTOCOL_VERSION_UNSUPPORTED"
  | "HIL_WORKER_SEQUENCE_GAP"
  | "HIL_WORKER_PAYLOAD_DIGEST_MISMATCH"
  | "HIL_WORKER_PAYLOAD_OVERSIZE"
  | "HIL_WORKER_BACKPRESSURE_EXCEEDED"
  | "HIL_WORKER_TIMEOUT"
  | "HIL_WORKER_CANCELLED"
  | "HIL_WORKER_LATE_RESULT_FENCED"
  | "HIL_WORKER_CRASHED"
  | "HIL_SOURCE_ATOMIZATION_INTERNAL_ERROR";
```

`HIL_SOURCE_ATOM_NOT_ATOMIC`、`HIL_SOURCE_ATOM_UNCLASSIFIED`、`HIL_SOURCE_ATOM_OVERLAP`、
`HIL_SOURCE_ATOM_EXTRACTOR_STALE`、fixture、decision、reject、absorbed、orphanの
edge、receipt failureは原子化契約と同じtokenを使い、aliasを作らない。unknown exceptionはcause digest付き
`HIL_SOURCE_ATOMIZATION_INTERNAL_ERROR`へ境界変換する。

## §5 transactionと実装順

1. failure enumと既存HST/assertion tokenの一致testをRedにする。
2. plugin descriptor、selection、proposal schemaを実装する。
3. Node plugin stubとPython worker stubを同じproposal contractへ結ぶ。
4. ingestion、span検証、atomic split、semantic signatureをpure coreで実装する。
5. atom kind、fixture lineage、decision evidence matrixを実装する。
6. coverage edge、reverse projection、別率、stale invalidationを実装する。
7. immutable child bundleをsealしてからDB projectionを再構築する。
8. 34 unit、13 integration、4,470 entry実run、別runtime reviewを実行する。

artifactとSQLiteの偽cross-resource transactionを主張しない。artifact seal前の失敗はpublish 0、seal後projection失敗は
`projection_pending` receiptへ遷移する。Node transaction bundleは`operation_id`、canonical bundle digest、expected artifact/
DB/active head、idempotency key、固定write setを持ち、artifact seal、event append、projection、active pointer、terminal receiptの
順序を強制する。reconcileは同一bundleからreplayし、全digest/head検証後だけactive pointerを更新する。同一key別digest、
expected head不一致、順序違反、暗黙のartifact rewriteを拒否する。

## §6 完全schemaとstore DbC

```ts
interface SourceAtomV1 { schema_version: "helix-source-atom.v1"; atom_id: string; revision: number; source_snapshot_id: string; entry_id: string; source_span_digest: string; atom_kind: AtomKindV1; semantic_ir_digest: string; semantic_signature: string; coverage_weight: 0 | 1; fixture_producer_atom_id: string | null; fixture_assertion_id: string | null; canonical_bytes_digest: string }
interface CapabilityDecisionRevisionV1 { atom_id: string; decision_revision: number; decision: CapabilityDecisionV1; evidence_digests: string[]; reviewer_authority_receipt_id: string; absorbed_into_atom_id: string | null; current: boolean; supersedes_revision: number | null; canonical_bytes_digest: string }
interface CapabilityCoverageEdgeV1 { edge_id: string; revision: number; source_kind: "decision" | "requirement" | "design" | "assertion"; source_id: string; source_digest: string; relation: "satisfies" | "refines" | "verifies" | "rejects" | "absorbed_into" | "derived_from" | "paired_with" | "gates" | "supersedes"; target_kind: "requirement" | "non_goal" | "design" | "assertion" | "gate" | "atom"; target_id: string; target_digest: string; status: "current" | "stale"; canonical_bytes_digest: string }
interface AtomizationEventV1 { event_id: string; operation_id: string; sequence: number; event_type: "bundle_committed" | "projection_pending" | "projection_reconciled" | "bundle_activated" | "receipt_invalidated"; aggregate_id: string; payload_digest: string; previous_event_head: string; event_head: string }
interface AtomizationProjectionV1 { projection_revision: number; event_head: string; atom_root_digest: string; decision_root_digest: string; edge_root_digest: string; active_bundle_digest: string | null; source_snapshot_id: string; source_snapshot_digest: string }
interface AtomizationProjectionStoreV1 {
  commit(bundle: AtomizationProjectionCommitBundleV1): Promise<SourceAtomizationResultV1<AtomizationProjectionCommitReceiptV1>>;
  reconcile(bundle: AtomizationProjectionCommitBundleV1): Promise<SourceAtomizationResultV1<AtomizationProjectionCommitReceiptV1>>;
  readCurrent(expectedDbHead: string): Promise<SourceAtomizationResultV1<AtomizationProjectionV1>>;
  findReceipt(operationId: string): Promise<AtomizationProjectionCommitReceiptV1 | null>;
}
```

storeはcanonical bytesから全ID/digest、coverage weight、absorbed target、FK、expected head、event chain、exact write-setを再計算する。caller提示digest/countをauthorityにせず、payload swap、stale revision、CAS競合、各append faultではauthoritative増分0とする。
