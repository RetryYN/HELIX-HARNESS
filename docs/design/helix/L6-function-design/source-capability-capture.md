---
title: "HELIX L6 機能設計 — source capability capture"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-09A
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-011
related_l5: docs/design/helix/L5-detail/source-capability-capture.md
pair_artifact: docs/test-design/helix/L6-source-capability-capture-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-09
  - HAC-HIL-09a
  - HAC-HIL-09b
  - HAC-HIL-09c
---

# HELIX L6 機能設計 — source capability capture

## §1 schema/API

| API | signature | DbC | oracle |
|---|---|---|---|
| `canonicalizeSourceCaptureRequest` | `(raw: unknown, policy: SourceCapturePolicyV1) => SourceCaptureResultV1<SourceCaptureRequestV1>` | local path、family、revision、scope、期待digest/countをstrict検証 | `U-SCAP-001` |
| `deriveSourceSnapshotId` | `(request, probe, versions) => SourceCaptureResultV1<SourceSnapshotIdV1>` | source identityと全versionから決定、時刻/OS非依存 | `U-SCAP-002` |
| `probeSourceAdapter` | `(adapter, input: AuthorizedSourceAdapterInputV1, ports: LocalCaptureRuntimePortsV1) => Promise<SourceCaptureResultV1<SourceProbeResultV1>>` | request familyとadapter一致。Gitにはnetwork methodを持たないsealed-mirror read portとdeny guardだけを渡し、current membership proofにbindする | `U-SCAP-004` |
| `enumerateSourceEntries` | `(adapter, probe, ports: LocalCaptureRuntimePortsV1) => Promise<SourceCaptureResultV1<SourceEntryBatchSequenceV1>>` | sealed mirror read＋network deny guardを全enumerationへ強制し、bounded batch列とsandbox receiptをterminal result内で閉じる。iterator throwを公開境界へ逃がさない | `U-SCAP-005` |
| `deriveGitOverlay` | `(mainEntries, refEntries, ancestry) => SourceCaptureResultV1<GitOverlayV1>` | A/M/D/Rとempty overlayを証明、共通blob非複製 | `U-SCAP-011` |
| `observeAdvertisedGitRefs` | `(target, namespacePolicy, advertisementPort) => Promise<SourceCaptureResultV1<GitAdvertisementObservationV1>>` | exact repo identity、heads/tags/pullをcanonicalizeし、symbolic HEAD/`^{}`を分母外証拠化 | `U-SCAP-026`, `U-SCAP-027` |
| `materializeAndVerifyGitRefClosure` | `(before, mirrorPort, advertisementPort) => Promise<SourceCaptureResultV1<SealedGitRefAuthorityBundleV1>>` | advertised exact OIDをquarantineへmaterializeし、object/tree/tag peel/reachabilityとadvertisement B一致を検証 | `U-SCAP-028`, `U-SCAP-029`, `U-SCAP-030` |
| `commitGitRefAuthority` | `(transition: GitAuthorityStateTransitionBundleV1, trustedStore) => Promise<SourceCaptureResultV1<GitAuthorityCommitReceiptV1>>` | current昇格またはdrift stale伝播をexpected authority/dependency headへCASし、same-operation同digest冪等、異digest conflict | `U-SCAP-031` |
| `classifySourceEntry` | `(entry, rules) => SourceCaptureResultV1<EntryClassificationV1>` | exactly one、rule/reason必須、fallback other禁止 | `U-SCAP-020` |
| `renderSourceCaptureBundle` | `(snapshot, enumeration: SourceEntryBatchSequenceV1, classifications, authority) => SourceCaptureResultV1<RenderedBundleV1>` | canonical JSON/JSONL、unique contentと全ref-entry edge、3分母、exact 2 authority bindingを再計算 | `U-SCAP-003` |
| `planSourceCapture` | `(request, adapters, rules) => Promise<SourceCaptureResultV1<CapturePlanV1>>` | read-only、既存artifact/DB差分を返す | `U-SCAP-024` (`resolveSourceCaptureAuthority`のmutation component) |
| `commitSourceCapture` | `(plan, store, projection) => Promise<SourceCaptureResultV1<SourceCaptureReceiptV1>>` | artifact publish成功後だけDB transaction、partial current禁止 | `U-SCAP-022` |
| `verifySourceCapture` | `(bundle, projection) => SourceCaptureResultV1<VerificationReportV1>` |全bytes/count/FK/current pointerを再計算 | `U-SCAP-023` |
| `activateSourceSnapshot` | `(bundle: SourceSnapshotActivationBundleV1, artifactStore: SourceActivationArtifactStoreV1, lifecycleStore: SourceGenerationLifecycleArtifactStoreV1, store: SourceGenerationTransitionStoreV1) => Promise<SourceCaptureResultV1<ActivationReceiptV1>>` | activation bundleを先にimmutable sealし、旧dependency退役＋consumer本体stale＋新exact2 registration＋pointerをNode-only CASで不可分commit | `U-SCAP-023` (`verifySourceCapture`のmutation component) |
| `markSourceSnapshotStale` | `(snapshot, cause, eventPort) => Promise<SourceCaptureResultV1<StaleReceiptV1>>` | append-only cause、旧artifact不変 | `U-SCAP-022` (`commitSourceCapture`のmutation component) |
| `resolveSourceCaptureAuthority` | `(expectedManifestDigest, request, store: TrustedSourceManifestAuthorityStoreV1) => Promise<SourceCaptureResultV1<AuthorizedSourceCaptureRequestV1>>` | trusted current store receiptとmanifest digest、ZIP SHA、exact 2 current Git authority receipts、HEAD、3分母digestを照合しcaller自己申告を拒否 | `U-SCAP-024` |
| `reconcileSourceCaptureProjection` | `(pending: ProjectionPendingReceiptV1, artifact: RenderedBundleV1, store: SourceCaptureProjectionStoreV1) => Promise<SourceCaptureResultV1<ProjectionReconcileReceiptV1>>` | operation/idempotency、expected artifact/DB headをCASしseal済みbytesからだけ再投影 | `U-SCAP-025` |

### §1.1 主所有APIと変異構成要素

17 public APIは各一行だけを持ち、31 Uは次のowner setへ重複なくpartitionする。component APIは新しいUを作らず、右欄のowner protocol内でmutationする。

| 主所有API | U | exact IT | 変異構成API |
|---|---|---|---|
| `canonicalizeSourceCaptureRequest` | `U-SCAP-001` | `IT-SCAP-001` | なし |
| `deriveSourceSnapshotId` | `U-SCAP-002` | `IT-SCAP-004` | なし |
| `renderSourceCaptureBundle` | `U-SCAP-003` | `IT-SCAP-005` | なし |
| `probeSourceAdapter` | `U-SCAP-004` | `IT-SCAP-001` | なし |
| `enumerateSourceEntries` | `U-SCAP-005` | `IT-SCAP-001` | なし |
| `enumerateSourceEntries` | `U-SCAP-006` | `IT-SCAP-001` | なし |
| `probeSourceAdapter` | `U-SCAP-007` | `IT-SCAP-001` | なし |
| `enumerateSourceEntries` | `U-SCAP-008` | `IT-SCAP-001` | なし |
| `enumerateSourceEntries` | `U-SCAP-009` | `IT-SCAP-001` | なし |
| `probeSourceAdapter` | `U-SCAP-010` | `IT-SCAP-001` | なし |
| `deriveGitOverlay` | `U-SCAP-011` | `IT-SCAP-002` | なし |
| `deriveGitOverlay` | `U-SCAP-012` | `IT-SCAP-002` | なし |
| `probeSourceAdapter` | `U-SCAP-013` | `IT-SCAP-002` | なし |
| `enumerateSourceEntries` | `U-SCAP-014` | `IT-SCAP-002` | なし |
| `deriveGitOverlay` | `U-SCAP-015` | `IT-SCAP-002` | なし |
| `enumerateSourceEntries` | `U-SCAP-016` | `IT-SCAP-003` | なし |
| `enumerateSourceEntries` | `U-SCAP-017` | `IT-SCAP-003` | なし |
| `enumerateSourceEntries` | `U-SCAP-018` | `IT-SCAP-003` | なし |
| `probeSourceAdapter` | `U-SCAP-019` | `IT-SCAP-003`, `IT-SCAP-007` | なし |
| `classifySourceEntry` | `U-SCAP-020` | `IT-SCAP-004` | なし |
| `classifySourceEntry` | `U-SCAP-021` | `IT-SCAP-004` | なし |
| `commitSourceCapture` | `U-SCAP-022` | `IT-SCAP-005`, `IT-SCAP-006`, `IT-SCAP-008` | `markSourceSnapshotStale` |
| `verifySourceCapture` | `U-SCAP-023` | `IT-SCAP-004`, `IT-SCAP-005`, `IT-SCAP-008` | `activateSourceSnapshot` |
| `resolveSourceCaptureAuthority` | `U-SCAP-024` | `IT-SCAP-009` | `planSourceCapture` |
| `reconcileSourceCaptureProjection` | `U-SCAP-025` | `IT-SCAP-010` | なし |
| `observeAdvertisedGitRefs` | `U-SCAP-026`, `U-SCAP-027` | `IT-SCAP-011`, `IT-SCAP-012` | なし |
| `materializeAndVerifyGitRefClosure` | `U-SCAP-028`, `U-SCAP-029`, `U-SCAP-030` | `IT-SCAP-011`, `IT-SCAP-012` | なし |
| `commitGitRefAuthority` | `U-SCAP-031` | `IT-SCAP-013` | なし |

### §1.2 HST011主系のAPI tuple

| HSTケース | API | 主U | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-011-01` | `verifySourceCapture` | `U-SCAP-023` | `coverage_ready` | `pair_freeze_ready` | `なし（正常系）` |
| `HST-CASE-011-02` | `probeSourceAdapter` | `U-SCAP-004` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-03` | `commitGitRefAuthority` | `U-SCAP-031` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-04` | `enumerateSourceEntries` | `U-SCAP-016` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-05` | `activateSourceSnapshot` | `U-SCAP-023` | `coverage_pending` | `coverage_pending` | `HIL_SOURCE_DECISION_PENDING` |
| `HST-CASE-011-06` | `classifySourceEntry` | `U-SCAP-020` | `coverage_ready` | `coverage_failed` | `HIL_SOURCE_ATOM_ORPHAN` |
| `HST-CASE-011-07` | `classifySourceEntry` | `U-SCAP-021` | `coverage_ready` | `coverage_failed` | `HIL_SOURCE_REJECT_UNJUSTIFIED` |
| `HST-CASE-011-08` | `activateSourceSnapshot` | `U-SCAP-023` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-011-09` | `classifySourceEntry` | `U-SCAP-020` | `assertion_input_ready` | `assertion_pass` | `HIL_ASSET_DECISION_MISSING` |
| `HST-CASE-011-10` | `markSourceSnapshotStale` | `U-SCAP-022` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-11` | `classifySourceEntry` | `U-SCAP-020` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_COMPLETENESS_UNPROVEN` |

主要typeは`src/schema/source-capture.ts`を唯一の正本候補とする。

```ts
interface SourceCapturePolicyV1 { schema_version: "helix-source-capture-policy.v1"; policy_revision: string; allowed_families: Array<"zip" | "git" | "current-head">; require_local_source: true; canonical_json_version: string; canonical_jsonl_version: string; maximum_entry_count: number; policy_digest: string }

interface SourceCaptureRequestV1 {
  schema_version: "source-capture-request.v1";
  family: "zip" | "git" | "current-head";
  local_source: string;
  revision: string;
  expected_identity: string;
  expected_entry_count: number;
  scope: string[];
}

interface SourceDenominatorSetV1 { ref: number; content: number; edge: number; ref_digest: string; content_digest: string; edge_digest: string; set_digest: string }
interface SourceSnapshotIdV1 { snapshot_id: string; source_identity_digest: string; request_digest: string; adapter_version: string; classifier_version: string; schema_version: string; derivation_digest: string }
interface GitAuthorityMembershipProofV1 { repository_id: GitRepositoryAuthorityTargetV1["repository_id"]; manifest_digest: string; required_repository_set_digest: string; git_authority_receipt_set_digest: string; authority_receipt_id: string; authority_receipt_digest: string; authority_store_head: string; authority_revision: number; verified_at: string; fresh_until: string; current_and_fresh: true; proof_digest: string }
interface GitCaptureAuthorityBindingV1 { repository_id: GitRepositoryAuthorityTargetV1["repository_id"]; authority_receipt: GitRefAuthorityReceiptV1; membership_proof: GitAuthorityMembershipProofV1; sealed_bundle_digest: string; sealed_mirror_locator: string; sealed_mirror_digest: string; closure_manifest_digest: string; tag_peel_manifest_digest: string; binding_digest: string }
type AuthorizedSourceAdapterInputV1 =
  | { family: "zip" | "current-head"; request: AuthorizedSourceCaptureRequestV1; git_binding: null }
  | { family: "git"; request: AuthorizedSourceCaptureRequestV1; git_binding: GitCaptureAuthorityBindingV1 };
interface SourceProbeResultV1 { family: SourceCaptureRequestV1["family"]; revision: string; source_identity_digest: string; source_ref_set_digest: string; git_authority_binding_digest: string | null; sealed_mirror_digest: string | null; expected_denominators: SourceDenominatorSetV1 | null; observed_denominators: SourceDenominatorSetV1 | null; observed_entry_count: number; expected_entry_count: number; local_only: true; write_count: 0; network_count: 0; probe_digest: string }
interface SourceEntryV1 { entry_id: string; repository_id: GitRepositoryAuthorityTargetV1["repository_id"] | "zip-hybrid-v1" | "current-helix"; tree_oid: string | null; raw_path_base64: string; display_path_nfc: string; mode: string; byte_length: number; blob_digest: string; overlay_operation: "add" | "modify" | "delete" | "rename" | "none"; prior_entry_id: string | null; entry_digest: string }
interface SourceRefV1 { source_ref_id: string; repository_id: GitRepositoryAuthorityTargetV1["repository_id"] | "zip-hybrid-v1" | "current-helix"; full_refname: string; peeled_object_oid: string; commit_oid: string; tree_oid: string; ref_digest: string }
interface SourceRefEntryEdgeV1 { edge_id: string; source_ref_id: string; entry_id: string; peeled_object_oid: string; commit_oid: string; tree_oid: string; raw_path_base64: string; edge_digest: string }
interface SourceEntryBatchV1 { sequence: number; entries: readonly SourceEntryV1[]; entry_set_digest: string; batch_digest: string }
interface SourceEntryBatchSequenceV1 { batches: readonly SourceEntryBatchV1[]; refs: readonly SourceRefV1[]; ref_entry_edges: readonly SourceRefEntryEdgeV1[]; sandbox_receipt: GitOfflineSandboxReceiptV1 | null; terminal_status: "complete"; entry_count: number; ref_count: number; edge_count: number; entry_set_digest: string; ref_set_digest: string; ref_entry_edge_set_digest: string; denominators: SourceDenominatorSetV1; sequence_digest: string }
interface GitOfflineSandboxReceiptV1 { operation_id: string; sealed_mirror_digest: string; granted_capabilities: readonly ["read-object", "read-tree", "read-tag"]; network_capability: "absent"; denied_network_attempt_count: number; denied_attempt_transcript_digest: string; read_set_digest: string; status: "clean" | "denied"; receipt_digest: string }
interface SealedGitMirrorReadPortV1 { open(binding: GitCaptureAuthorityBindingV1): Promise<SourceCaptureResultV1<{ handle_id: string; sealed_mirror_digest: string; read_capabilities: readonly ["read-object", "read-tree", "read-tag"]; open_receipt_digest: string }>>; readObject(handleId: string, oid: string): Promise<SourceCaptureResultV1<Uint8Array>>; close(handleId: string): Promise<SourceCaptureResultV1<{ read_set_digest: string; close_receipt_digest: string }>> }
interface NetworkDenyGuardPortV1 { run<T>(operationId: string, task: () => Promise<SourceCaptureResultV1<T>>): Promise<SourceCaptureResultV1<{ value: T; sandbox_receipt: GitOfflineSandboxReceiptV1 }>> }
interface LocalCaptureRuntimePortsV1 { sealed_git_mirror: SealedGitMirrorReadPortV1; network_deny_guard: NetworkDenyGuardPortV1 }
interface GitOverlayV1 { main_tree_digest: string; ref_tree_digest: string; merge_base_commit: string; added_entry_ids: string[]; modified_entry_ids: string[]; deleted_entry_ids: string[]; renamed_entry_ids: string[]; shared_blob_set_digest: string; overlay_entry_count: number; overlay_digest: string }
interface GitRepositoryAuthorityTargetV1 { repository_id: "predecessor-ut" | "legacy-helix"; canonical_owner_repo: "unison-ai-product/UT-TDD_AGENT-HARNESS" | "RetryYN/ai-dev-kit-vscode"; remote_identity_digest: string; namespace_policy_version: string; namespace_policy_digest: string }
interface AdvertisedGitRefV1 { source_ref_id: string; full_refname: string; kind: "head" | "tag" | "pull-head" | "pull-merge"; advertised_oid: string; row_digest: string }
interface GitAdvertisementExcludedEvidenceV1 { symbolic_head_target: string | null; symbolic_head_row_digest: string | null; peeled_pseudo_line_count: number; peeled_pseudo_line_set_digest: string; excluded_from_ref_denominator: true; evidence_digest: string }
interface GitAdvertisementObservationV1 { target: GitRepositoryAuthorityTargetV1; observed_at: string; command_version: string; git_version: string; exit_code: 0; credential_redacted: true; evidence_locator: string; raw_advertisement_digest: string; canonical_ref_set_digest: string; ref_counts_by_kind: Record<AdvertisedGitRefV1["kind"], number>; refs: readonly AdvertisedGitRefV1[]; excluded_evidence: GitAdvertisementExcludedEvidenceV1; observation_digest: string }
interface GitObjectPeelStepV1 { depth: number; object_oid: string; object_type: "tag" | "commit"; target_oid: string; target_type: "tag" | "commit"; step_digest: string }
interface VerifiedGitRefClosureRowV1 { source_ref_id: string; full_refname: string; kind: AdvertisedGitRefV1["kind"]; advertised_oid: string; advertised_object_type: "tag" | "commit"; peel_chain: readonly GitObjectPeelStepV1[]; terminal_commit_oid: string; tree_oid: string; reachability_verified: true; row_digest: string }
interface GitRefspecManifestV1 { namespace_id: string; exact_refspecs: readonly string[]; advertised_oid_set_digest: string; exact_refspec_set_digest: string; implicit_refspec_count: 0; default_clone_count: 0; manifest_digest: string }
interface GitQuarantineMaterializationReceiptV1 { operation_id: string; namespace_id: string; quarantine_root_locator: string; refspec_manifest: GitRefspecManifestV1; before_write_set_digest: string; after_write_set_digest: string; materialized_object_set_digest: string; write_scope_escape_count: 0; status: "materialized"; receipt_digest: string }
interface GitVerifiedClosureManifestV1 { quarantine_receipt_digest: string; rows: readonly VerifiedGitRefClosureRowV1[]; closure_row_set_digest: string; tag_peel_manifest_digest: string; unique_object_count: number; unique_tree_count: number; unique_entry_count: number; unique_entry_set_digest: string; ref_entry_edge_count: number; ref_entry_edge_digest: string; status: "verified"; manifest_digest: string }
interface GitAdvertisementEqualityReceiptV1 { before_observation_locator: string; after_observation_locator: string; before_observation_digest: string; after_observation_digest: string; before_canonical_ref_set_digest: string; after_canonical_ref_set_digest: string; canonical_sets_equal: true; receipt_digest: string }
interface GitSealReceiptV1 { operation_id: string; quarantine_receipt_digest: string; closure_manifest_digest: string; sealed_mirror_locator: string; sealed_mirror_digest: string; quarantine_cleanup_receipt_digest: string; quarantine_cleanup_status: "removed_after_seal"; receipt_digest: string }
interface SealedGitRefAuthorityBundleV1 { operation_id: string; target: GitRepositoryAuthorityTargetV1; advertisement_equality_receipt: GitAdvertisementEqualityReceiptV1; seal_receipt: GitSealReceiptV1; ref_set_digest: string; quarantine_receipt_digest: string; exact_refspec_manifest_digest: string; closure_manifest_digest: string; tag_peel_manifest_digest: string; sealed_mirror_locator: string; sealed_mirror_digest: string; unique_object_count: number; unique_tree_count: number; unique_entry_count: number; unique_entry_set_digest: string; ref_entry_edge_count: number; ref_entry_edge_digest: string; status: "sealed"; bundle_digest: string }
interface GitRefAuthorityReceiptV1 { authority_receipt_id: string; operation_id: string; repository_id: GitRepositoryAuthorityTargetV1["repository_id"]; canonical_owner_repo: GitRepositoryAuthorityTargetV1["canonical_owner_repo"]; remote_identity_digest: string; namespace_policy_version: string; namespace_policy_digest: string; acquirer_version: string; git_version: string; authority_revision: number; before_store_head: string; after_store_head: string; before_observation_digest: string; after_observation_digest: string; advertisement_equality_receipt_digest: string; ref_set_digest: string; sealed_bundle_digest: string; seal_receipt_digest: string; quarantine_cleanup_receipt_digest: string; sealed_mirror_locator: string; sealed_mirror_digest: string; exact_refspec_manifest_digest: string; closure_manifest_digest: string; tag_peel_manifest_digest: string; quarantine_receipt_digest: string; ref_counts_by_kind: Record<AdvertisedGitRefV1["kind"], number>; unique_entry_count: number; unique_entry_set_digest: string; ref_entry_edge_count: number; ref_entry_edge_digest: string; observed_at: string; fresh_until: string; dependency_index_head: string; status: "current"; receipt_digest: string }
interface GitAuthorityDependencyV1 { dependency_kind: "source-snapshot" | "atomization" | "coverage"; dependency_id: string; source_snapshot_id: string; authority_receipt_id: string; registration_revision: number; current_digest: string; dependency_head: string; status: "current" | "superseded" | "stale"; supersedes_dependency_id: string | null; edge_digest: string }
interface GitAuthorityDependencyRegistrationV1 { authority_receipt_id: string; dependency_kind: GitAuthorityDependencyV1["dependency_kind"]; dependency_id: string; source_snapshot_id: string; registration_revision: number; current_digest: string; expected_dependency_index_head: string; expected_status: "current"; supersedes_dependency_id: string | null; registration_event_digest: string; registration_digest: string }
interface GitAuthorityDependencyRetirementV1 { authority_receipt_id: string; dependency_kind: GitAuthorityDependencyV1["dependency_kind"]; prior_dependency_id: string; source_snapshot_id: string; replacement_dependency_id: string | null; prior_registration_revision: number; expected_before_head: string; before_status: "current"; after_status: "superseded" | "stale"; retirement_event_digest: string; retirement_digest: string }
interface GitAuthorityDependencyStaleIntentV1 { dependency_kind: GitAuthorityDependencyV1["dependency_kind"]; dependency_id: string; authority_receipt_id: string; expected_before_head: string; expected_current_digest: string; expected_status: "current"; action: "stale"; intent_digest: string }
interface GitAuthorityDependencyStaleTransitionV1 { dependency_kind: GitAuthorityDependencyV1["dependency_kind"]; dependency_id: string; before_head: string; after_head: string; prior_status: "current"; after_status: "stale"; prior_digest: string; cause_digest: string; stale_event_digest: string; transition_digest: string }
interface GitAuthorityStalePropagationReceiptV1 { operation_id: string; repository_id: GitRepositoryAuthorityTargetV1["repository_id"]; prior_authority_receipt_id: string; cause_code: "HSCAP_REF_ADVERTISEMENT_DRIFT" | "HSCAP_REMOTE_IDENTITY_MISMATCH" | "HSCAP_SNAPSHOT_STALE"; cause_digest: string; dependency_index_count: number; dependency_index_set_digest: string; requested_dependency_set_digest: string; exact_dependency_index_match: true; dependency_transitions: readonly GitAuthorityDependencyStaleTransitionV1[]; dependency_transition_set_digest: string; stale_event_set_digest: string; before_dependency_index_head: string; after_dependency_index_head: string; authority_status: "stale"; snapshot_stale_count: number; atomization_stale_count: number; coverage_stale_count: number; atomic_commit: true; partial_write_count: 0; current_promotion_count: 0; receipt_digest: string }
type GitAuthorityStateTransitionBundleV1 =
  | { transition: "promote"; operation_id: string; sealed_bundle: SealedGitRefAuthorityBundleV1; expected_authority_head: string; expected_authority_revision: number; expected_dependency_index_head: string; exact_write_set_digest: string; transition_digest: string }
  | { transition: "stale"; operation_id: string; repository_id: GitRepositoryAuthorityTargetV1["repository_id"]; prior_authority_receipt_id: string; cause_code: GitAuthorityStalePropagationReceiptV1["cause_code"]; cause_digest: string; dependency_index_count: number; dependency_index_set_digest: string; dependency_intents: readonly GitAuthorityDependencyStaleIntentV1[]; requested_dependency_set_digest: string; exact_dependency_index_match: true; expected_authority_head: string; expected_dependency_index_head: string; exact_write_set_digest: string; transition_digest: string };
type GitAuthorityCommitReceiptV1 = GitRefAuthorityReceiptV1 | GitAuthorityStalePropagationReceiptV1;
interface GitAdvertisementPortV1 { observe(target: GitRepositoryAuthorityTargetV1): Promise<SourceCaptureResultV1<GitAdvertisementObservationV1>> }
interface GitRefMaterializationPortV1 { materializeExactRefs(observation: GitAdvertisementObservationV1): Promise<SourceCaptureResultV1<GitQuarantineMaterializationReceiptV1>>; verifyObjectClosure(receipt: GitQuarantineMaterializationReceiptV1, refs: readonly AdvertisedGitRefV1[]): Promise<SourceCaptureResultV1<GitVerifiedClosureManifestV1>>; sealVerifiedClosure(receipt: GitQuarantineMaterializationReceiptV1, closure: GitVerifiedClosureManifestV1): Promise<SourceCaptureResultV1<GitSealReceiptV1>> }
interface GitRefAuthorityStoreV1 { commit(transition: GitAuthorityStateTransitionBundleV1): Promise<SourceCaptureResultV1<GitAuthorityCommitReceiptV1>>; readCurrent(repositoryId: GitRepositoryAuthorityTargetV1["repository_id"]): Promise<GitRefAuthorityReceiptV1 | null>; readDependencies(authorityReceiptId: string, expectedIndexHead: string): Promise<SourceCaptureResultV1<readonly GitAuthorityDependencyV1[]>> }
interface EntryClassificationV1 { classification_id: string; entry_id: string; entry_class: "runtime-source" | "test" | "design" | "rule" | "workflow" | "generated-fixture" | "binary" | "duplicate-alias" | "evidence-only" | "unclassified"; rule_id: string; rule_version: string; reason_code: string; classification_digest: string }
interface CapturePlanV1 { operation_id: string; operation_digest: string; idempotency_key: string; authorized_request: AuthorizedSourceCaptureRequestV1; adapter_id: string; adapter_version: string; classifier_version: string; expected_artifact_head: string; expected_db_head: string; expected_entry_count: number; expected_denominators: SourceDenominatorSetV1 | null; git_authority_receipt_set_digest: string; dry_run: boolean; plan_digest: string }

type SourceCaptureFailureCodeV1 =
  | "HSCAP_SOURCE_UNAVAILABLE"
  | "HSCAP_SOURCE_IDENTITY_MISMATCH"
  | "HSCAP_ENTRY_COUNT_MISMATCH"
  | "HSCAP_ENTRY_DUPLICATE"
  | "HSCAP_ENTRY_UNCLASSIFIED"
  | "HSCAP_PATH_UNSAFE"
  | "HSCAP_REF_SET_INCOMPLETE"
  | "HSCAP_DENOMINATOR_OVERLAP"
  | "HSCAP_ARTIFACT_CONFLICT"
  | "HSCAP_ARTIFACT_PUBLISH_FAILED"
  | "HSCAP_PROJECTION_FAILED"
  | "HSCAP_SNAPSHOT_STALE"
  | "HSCAP_INTERNAL_ERROR"
  | "HSCAP_REMOTE_IDENTITY_MISMATCH"
  | "HSCAP_REF_ADVERTISEMENT_UNAVAILABLE"
  | "HSCAP_REF_ADVERTISEMENT_DRIFT"
  | "HSCAP_REF_NAMESPACE_INVALID"
  | "HSCAP_REF_OBJECT_INCOMPLETE"
  | "HSCAP_TAG_PEEL_INVALID"
  | "HSCAP_REF_AUTHORITY_CONFLICT"
  | "HSCAP_QUARANTINE_ISOLATION_FAILED"
  | "HSCAP_SEALED_BUNDLE_TAMPERED"
  | "HSCAP_OFFLINE_NETWORK_ATTEMPT"
  | "HIL_ASSET_DECISION_MISSING"
  | "HIL_PYTHON_AUTHORITY_BYPASS"
  | "HIL_SOURCE_AGGREGATE_ONLY"
  | "HIL_SOURCE_ATOM_ORPHAN"
  | "HIL_SOURCE_COMPLETENESS_UNPROVEN"
  | "HIL_SOURCE_DECISION_PENDING"
  | "HIL_SOURCE_REJECT_UNJUSTIFIED"
  | "HIL_SOURCE_SNAPSHOT_STALE";

interface SourceCaptureFailureV1 {
  code: SourceCaptureFailureCodeV1;
  cause_digest: string;
  operation_id: string | null;
}
type SourceCaptureResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; error: SourceCaptureFailureV1 };

interface RenderedBundleV1 {
  schema_version: "helix-source-capture-rendered-bundle.v1";
  snapshot_id: string;
  artifact_root_digest: string;
  request_digest: string;
  refs_digest: string;
  entries_digest: string;
  classifications_digest: string;
  entry_count: number;
  classification_count: number;
  git_authority_receipt_set_digest: string;
  expected_denominators: SourceDenominatorSetV1;
  observed_denominators: SourceDenominatorSetV1;
  exact_denominator_match: boolean;
  git_authority_receipt_ids: readonly [string, string];
  ref_denominator: number;
  content_denominator: number;
  edge_denominator: number;
  ref_entry_edge_digest: string;
  artifact_manifest: { path: string; content_digest: string; byte_length: number }[];
}

interface CanonicalSourceSnapshotManifestV1 { manifest_digest: string; zip_archive_sha256: string; required_repository_set_digest: string; git_namespace_policy_version: string; predecessor_git_authorities: readonly [GitRefAuthorityReceiptV1 & { repository_id: "predecessor-ut" }, GitRefAuthorityReceiptV1 & { repository_id: "legacy-helix" }]; git_authority_receipt_set_digest: string; current_head_commit: string; current_head_tree: string; expected_denominator_digests: { ref: string; content: string; edge: string } }
interface AuthorizedSourceCaptureRequestV1 { request: SourceCaptureRequestV1; authority_manifest_digest: string; git_authority_receipt_set_digest: string; git_authority_bindings: readonly [GitCaptureAuthorityBindingV1 & { repository_id: "predecessor-ut"; authority_receipt: GitRefAuthorityReceiptV1 & { repository_id: "predecessor-ut" } }, GitCaptureAuthorityBindingV1 & { repository_id: "legacy-helix"; authority_receipt: GitRefAuthorityReceiptV1 & { repository_id: "legacy-helix" } }]; expected_denominators: SourceDenominatorSetV1; authority_binding_digest: string }
interface TrustedSourceManifestAuthorityStoreV1 { readCurrent(expectedManifestDigest: string): Promise<SourceCaptureResultV1<{ manifest: CanonicalSourceSnapshotManifestV1; authority_receipt_digest: string; store_head: string }>> }

interface SourceCaptureReceiptV1 {
  schema_version: "source-capture-receipt.v1";
  snapshot_id: string;
  status: "committed" | "projection_pending" | "verified" | "active" | "failed" | "stale";
  entry_count: number;
  classification_count: number;
  git_authority_receipt_set_digest: string;
  expected_denominators: SourceDenominatorSetV1;
  observed_denominators: SourceDenominatorSetV1;
  exact_denominator_match: boolean;
  behavior_atom_closed: false;
  artifact_root_digest: string;
  projection_digest: string | null;
  failure_codes: SourceCaptureFailureCodeV1[];
}
interface VerificationReportV1 { snapshot_id: string; artifact_root_digest: string; projection_digest: string; git_authority_receipt_set_digest: string; expected_denominators: SourceDenominatorSetV1; observed_denominators: SourceDenominatorSetV1; exact_denominator_match: boolean; expected_entry_count: number; actual_entry_count: number; classification_count: number; unclassified_count: number; foreign_key_violation_count: number; current_pointer_matches: boolean; behavior_atom_closed: false; status: "verified" | "failed"; failure_codes: SourceCaptureFailureCodeV1[]; report_digest: string }
interface AtomizationEventV1 { event_id: string; operation_id: string; sequence: number; event_type: "bundle_committed" | "projection_pending" | "projection_reconciled" | "bundle_activated" | "receipt_invalidated"; aggregate_id: string; payload_digest: string; previous_event_head: string; event_head: string }
interface AtomizationProjectionV1 { projection_revision: number; event_head: string; atom_root_digest: string; decision_root_digest: string; edge_root_digest: string; active_bundle_digest: string | null; source_snapshot_id: string; source_snapshot_digest: string; git_authority_receipt_set_digest: string; authority_dependency_registration_set_digest: string; status: "current" | "stale"; projection_digest: string }
interface AtomizationActivePointerV1 { source_snapshot_id: string; atomization_id: string; projection_digest: string; active_bundle_digest: string | null; pointer_revision: number; previous_pointer_head: string; pointer_head: string; status: "current" | "stale"; pointer_digest: string }
interface AtomizationCoverageStatusRevisionV1 { receipt_id: string; source_snapshot_id: string; prior_receipt_digest: string; status_revision: number; previous_status_head: string; status_head: string; status: "current" | "stale"; revision_digest: string }
interface AtomizationCoverageCurrentPointerV1 { source_snapshot_id: string; coverage_receipt_id: string | null; coverage_status_revision_digest: string; pointer_revision: number; previous_pointer_head: string; pointer_head: string; status: "current" | "stale"; pointer_digest: string }
interface AtomizationCascadeStaleTransitionV1 { transition_kind: "atomization"; source_snapshot_id: string; atomization_id: string; prior_status: "current"; after_status: "stale"; stale_event: AtomizationEventV1 & { event_type: "receipt_invalidated" }; stale_projection: AtomizationProjectionV1 & { status: "stale"; active_bundle_digest: null }; before_active_pointer: AtomizationActivePointerV1 & { status: "current" }; after_active_pointer: AtomizationActivePointerV1 & { status: "stale"; active_bundle_digest: null }; transition_digest: string }
interface CoverageCascadeStaleTransitionV1 { transition_kind: "coverage"; source_snapshot_id: string; coverage_receipt_id: string; prior_status: "current"; after_status: "stale"; stale_event: AtomizationEventV1 & { event_type: "receipt_invalidated" }; stale_receipt_revision: AtomizationCoverageStatusRevisionV1 & { status: "stale" }; before_current_pointer: AtomizationCoverageCurrentPointerV1 & { status: "current"; coverage_receipt_id: string }; after_current_pointer: AtomizationCoverageCurrentPointerV1 & { status: "stale"; coverage_receipt_id: null }; transition_digest: string }
type ConsumerCascadeTransitionsV1 = readonly [] | readonly [AtomizationCascadeStaleTransitionV1, CoverageCascadeStaleTransitionV1];
interface SourceGenerationLifecycleFailureV1 { code: "HIL_SOURCE_GENERATION_LIFECYCLE_CONFLICT" | "HIL_SOURCE_GENERATION_LIFECYCLE_INCOMPLETE"; evidence_digest: string }
type SourceGenerationLifecycleResultV1<T> = { ok: true; value: T } | { ok: false; error: SourceGenerationLifecycleFailureV1 };
interface SourceGenerationLifecycleEntryV1 { lifecycle_authority_id: "helix-source-generation-lifecycle.v1"; lifecycle_sequence: number; artifact_kind: "snapshot-activation" | "atomization-commit"; source_snapshot_id: string; artifact_locator: string; artifact_digest: string; previous_source_generation_head: string; after_source_generation_head: string; entry_digest: string }
interface SourceSnapshotActivationBundleV1 { schema_version: "helix-source-snapshot-activation.v1"; operation_id: string; operation_digest: string; report: VerificationReportV1 & { status: "verified"; exact_denominator_match: true; unclassified_count: 0; foreign_key_violation_count: 0; behavior_atom_closed: false }; exact_git_authority_receipt_ids: readonly [string, string]; expected_git_authority_receipt_set_digest: string; authority_dependency_registrations: readonly [GitAuthorityDependencyRegistrationV1 & { dependency_kind: "source-snapshot" }, GitAuthorityDependencyRegistrationV1 & { dependency_kind: "source-snapshot" }]; authority_dependency_registration_set_digest: string; prior_dependency_retirements: readonly GitAuthorityDependencyRetirementV1[]; expected_retirement_count: 0 | 2 | 6; dependency_retirement_set_digest: string; consumer_cascade_transitions: ConsumerCascadeTransitionsV1; expected_consumer_transition_count: 0 | 2; consumer_transition_set_digest: string; expected_activation_journal_head: string; expected_source_generation_head: string; activation_revision: number; expected_pointer_head: string; expected_pointer_revision: number; expected_projection_digest: string; append_order: readonly ["activation_artifact_seal", "source_generation_lifecycle_append", "activation_event", "authority_dependency_retirement", "consumer_stale_event", "consumer_stale_projection", "consumer_stale_pointer", "authority_dependency_registration", "active_pointer", "terminal_receipt"]; exact_write_set: readonly { table: "source_capture_events" | "source_snapshots" | "git_authority_dependencies" | "atomization_events" | "atomization_projection" | "atomization_active_pointer" | "atomization_coverage_receipts" | "coverage_current_pointer" | "source_snapshot_pointers" | "source_capture_receipts"; key: string; action: "insert" | "update" }[]; write_set_digest: string; bundle_digest: string }
interface SourceSnapshotActivationArtifactV1 { schema_version: "helix-source-snapshot-activation-artifact.v1"; operation_id: string; snapshot_id: string; activation_revision: number; previous_activation_journal_head: string; previous_source_generation_head: string; bundle: SourceSnapshotActivationBundleV1; registration_manifest_digest: string; retirement_manifest_digest: string; consumer_transition_set_digest: string; base_capture_artifact_digest: string; artifact_digest: string }
interface SourceActivationArtifactReceiptV1 { operation_id: string; activation_revision: number; previous_journal_head: string; after_journal_head: string; artifact_locator: string; artifact_digest: string; byte_length: number; publish_status: "sealed"; receipt_digest: string }
interface ActivationReceiptV1 { schema_version: "helix-source-snapshot-activation-receipt.v1"; operation_id: string; operation_digest: string; snapshot_id: string; verification_report_digest: string; activation_artifact_locator: string; activation_artifact_digest: string; lifecycle_entry_digest: string; before_activation_journal_head: string; after_activation_journal_head: string; before_source_generation_head: string; after_source_generation_head: string; git_authority_receipt_set_digest: string; denominator_set_digest: string; authority_dependency_registration_set_digest: string; dependency_retirement_set_digest: string; retirement_count: 0 | 2 | 6; consumer_transition_set_digest: string; consumer_transition_count: 0 | 2; before_dependency_index_heads: readonly [string, string]; after_dependency_index_heads: readonly [string, string]; before_pointer_head: string; after_pointer_head: string; before_pointer_revision: number; after_pointer_revision: number; entry_count: number; classification_count: number; behavior_atom_closed: false; status: "active"; event_digest: string; write_set_digest: string; terminal_receipt_digest: string }
interface StaleReceiptV1 { snapshot_id: string; prior_status: "committed" | "projected" | "verified" | "active"; cause_code: "HSCAP_SNAPSHOT_STALE"; cause_digest: string; prior_artifact_root_digest: string; artifact_write_count: 0; status: "stale"; event_digest: string }
interface ProjectionPendingReceiptV1 { operation_id: string; operation_digest: string; idempotency_key: string; snapshot_id: string; expected_artifact_head: string; expected_db_head: string; artifact_root_digest: string; status: "projection_pending" }
interface ProjectionReconcileReceiptV1 { operation_id: string; artifact_head: string; before_db_head: string; after_db_head: string; event_sequence: number; counts: Record<string, { inserted: number; updated: number }>; status: "reconciled" }
interface SourceCaptureProjectionStoreV1 { reconcile(pending: ProjectionPendingReceiptV1, artifact: RenderedBundleV1): Promise<SourceCaptureResultV1<ProjectionReconcileReceiptV1>> }
interface SourceActivationArtifactStoreV1 { publish(artifact: SourceSnapshotActivationArtifactV1): Promise<SourceCaptureResultV1<SourceActivationArtifactReceiptV1>>; read(locator: string, expectedDigest: string): Promise<SourceCaptureResultV1<SourceSnapshotActivationArtifactV1>>; listBySnapshotOrder(): AsyncIterable<SourceCaptureResultV1<SourceActivationArtifactReceiptV1>> }
interface SourceGenerationLifecycleArtifactStoreV1 { readonly lifecycle_authority_id: "helix-source-generation-lifecycle.v1"; append(entry: SourceGenerationLifecycleEntryV1): Promise<SourceGenerationLifecycleResultV1<SourceGenerationLifecycleEntryV1>>; listByLifecycleOrder(): AsyncIterable<SourceGenerationLifecycleResultV1<SourceGenerationLifecycleEntryV1>> }
interface SourceGenerationTransitionStoreV1 { commitActivationCascade(bundle: SourceSnapshotActivationBundleV1, artifactReceipt: SourceActivationArtifactReceiptV1, lifecycle: SourceGenerationLifecycleEntryV1): Promise<SourceCaptureResultV1<ActivationReceiptV1>>; findActivationReceipt(operationId: string): Promise<ActivationReceiptV1 | null>; reconcileActivationCascade(artifact: SourceSnapshotActivationArtifactV1, lifecycle: SourceGenerationLifecycleEntryV1): Promise<SourceCaptureResultV1<ActivationReceiptV1>> }
```

## §2 実装配置とauthority

| path | owner | 制約 |
|---|---|---|
| `src/schema/source-capture.ts` | schema定義 | request/entity/receipt/failure union |
| `src/source/canonical.ts` | pure policy | ID、sort、JSON/JSONL、digest。OS時刻非依存 |
| `src/source/snapshotter.ts` | coordinator | adapterを順序制御。DB/remote直接write禁止 |
| `src/source/entry-classifier.ts` | pure規則 | versioned deterministic rules |
| `src/source/adapters/zip.ts` | 入力adapter | central directory/bytes read-only |
| `src/source/adapters/git.ts` | input adapter | local Git object read-only、fetch/checkout禁止 |
| `src/source/git-ref-authority.ts` | authority domain | advertisement canonicalize、A/B equality、sealed bundle、CAS receipt |
| `src/source/adapters/git-advertisement-node.ts` | network input port | exact repo read-only advertisement、credential redaction、timeout |
| `src/source/adapters/git-materialization-node.ts` | quarantine port | advertised exact OID refspecだけmaterialize、fsck/object/tree/tag検証 |
| `src/state-db/git-ref-authority-store.ts` | trusted authority store | expected head/revision CAS、current receipt、stale event |
| `src/source/adapters/current-head.ts` | input adapter | commit tree read-only、working tree隔離 |
| `src/source/artifact-store.ts` | 出力adapter | temp/fsync/rename、content-addressed immutable publish |
| `src/state-db/source-capture-projection.ts` | Node DB接続 | 10 table transaction、dependency index、rebuild/reprojection |
| `src/cli/commands/source-capture.ts` | CLI adapter | dry-run既定、execute/activate明示、JSON output |

Node control planeだけがartifact publish、DB transaction、active pointerを行う。Python workerは将来のatom候補抽出に
利用できるが、本capture API、DB、repo、pointerへwrite authorityを持たない。source capture sliceでNode/Bun
cutover全体、Python packaging、network取得を同時に解決したと主張しない。

## §3 transaction／WBS実装順

1. current schema versionとtable registry/rebuild contractを再監査する。
2. strict schema、failure union、canonical digestをRedで固定する。
3. ZIP adapterを703件fixtureで実装する。
4. exact 2 repositoryのrecorded advertisement fixture、namespace canonicalization、A/B driftをRedで固定する。
5. Git authority acquirerのexact OID quarantine materialize、object/tree/tag peel/reachability検証、CAS receiptを実装する。
6. Git capture adapterをsealed mirror＋current receiptだけから動くoffline境界で実装する。
7. current HEAD adapterをfull-tree scopeで実装する。
8. classifierとreceipt由来ref/content/edge分母の量閉じを実装する。
9. immutable artifact storeとfault rollbackを実装する。
10. DB migration、10 table、authority dependency registration/index、rebuild/reprojectionを同一sliceで実装する。
11. authority refreshとcapture dry-run/execute/verify/activateのCLI JSON contractを配線する。
12. L7 31 unit＋L8 13 integration、BunなしLinux Node smoke、別runtime reviewを実行する。

各段階は前段のRed/Green evidenceとsnapshot digestを引き継ぐ。DB schema追加だけ、artifact生成だけ、代表sourceだけを
先行完了扱いにしない。

## §4 failure/result規律

全public APIは既知failureを`SourceCaptureFailureV1`のdiscriminated unionで返し、unknown exceptionは
`HSCAP_INTERNAL_ERROR`へcause digest付きで境界変換する。CLIは成功0、契約/検証failure 2、I/O failure 3、
internal failure 4とし、stdoutはschema準拠JSONだけ、診断はstderrへ出す。secret、remote credential、source本文を
receiptへ保存しない。
