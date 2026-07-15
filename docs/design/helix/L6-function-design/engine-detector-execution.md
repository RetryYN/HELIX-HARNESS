---
title: "HELIX L6 機能設計 — engine / detector execution"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
slice_id: HDS-HIL-10
related_l5: docs/design/helix/L5-detail/engine-detector-execution.md
design_slice: HDS-HIL-10
related_hst:
  - HST-HIL-008
  - HST-HIL-009
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/test-design/helix/L6-engine-detector-execution-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-10
  - HAC-HIL-10a
  - HAC-HIL-10b
  - HAC-HIL-10c
system_tests:
  - HST-HIL-008
  - HST-HIL-009
---

# HELIX L6 機能設計 — engine / detector execution

## §1 関数契約とexact oracle

| API | DbC | 単体oracle | exact HST disposition |
|---|---|---|---|
| `parseEngineVersionDescriptor` | capability/runtime/entrypoint/schema/package/config digestとstatusをstrict検証 | `U-EDX-001` | `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE` |
| `parseDetectorVersionDescriptor` | rule/config/result schema、severity policy、owner/statusをstrict検証 | `U-EDX-002` | `HST-CASE-009-07` → `HIL_DETECTOR_FINDING_INCOMPLETE` |
| `resolveRegisteredVersion` | kind/ID/exact versionをactiveからexactly-one解決、unknownはlease 0 | `U-EDX-003` | `HST-CASE-008-09` → `HIL_REGISTRY_VERSION_UNKNOWN`; `HST-CASE-009-03` → `HIL_REGISTRY_VERSION_UNKNOWN` |
| `deriveExecutionIdentity` | snapshot/atomization/current decision/coverage receipt/DB relation root/version/config/input/schema/normalizationから時刻・OS非依存ID | `U-EDX-004` | `HST-CASE-008-06` → `HIL_ENGINE_RUN_NONDETERMINISTIC`; `HST-CASE-009-10` → `HIL_NONDETERMINISTIC_RESULT` |
| `validateFixedExecutionInput` | current snapshot再読込を禁止し全input/config digestを再計算 | `U-EDX-005` | `HST-CASE-008-10` → `HIL_HYBRID_INGESTION_INCOMPLETE`; `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE` |
| `createEngineRunPlan` | engine run/lease/fence/worker requestをartifact authorityへ限定 | `U-EDX-006` | `HST-CASE-008-01` → `なし（正常系）`; `HST-CASE-008-05` → `なし（正常系）` |
| `validateEngineResultProposal` | run/version/input/config/exit/artifact set/provenanceを照合 | `U-EDX-007` | `HST-CASE-008-02` → `なし（正常系）`; `HST-CASE-008-03` → `なし（正常系）`; `HST-CASE-008-04` → `なし（正常系）` |
| `validateArtifactPath` | relative、root内、NULなし、symlink非escape | `U-EDX-008` | `HST-CASE-008-07` / `HIL_ARTIFACT_PATH_ESCAPE` |
| `validateArtifactManifest` | kind/path/schema/size/digest一意、manifest外bytes拒否 | `U-EDX-009` | `HST-CASE-008-01` → `なし（正常系）`; `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE` |
| `createDetectorRunPlan` | detector run/lease/fence/requestをfinding authorityへ限定 | `U-EDX-010` | `HST-CASE-009-01` → `なし（正常系）` |
| `validateDetectorResultProposal` | rule/finding count/set digest/provenanceとschemaを照合 | `U-EDX-011` | `HST-CASE-009-05` → `HIL_DETECTOR_FINDING_EVIDENCE_MISSING`; `HST-CASE-009-07` → `HIL_DETECTOR_FINDING_INCOMPLETE` |
| `canonicalizeFindingEvidence` | separator/改行をversioned正規化し意味bytesを固定 | `U-EDX-012` | `HST-CASE-009-06` / `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC` |
| `deriveDetectorFingerprint` | detector major/rule/subject/location/evidence/normalizationからNode再導出 | `U-EDX-013` | `HST-CASE-009-02` → `なし（正常系）`; `HST-CASE-009-06` → `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC` |
| `evaluateDetectorSuppression` | exact fingerprint/scope/approval/expiry/version/baselineを検証 | `U-EDX-014` | `HST-CASE-009-04` / `HIL_DETECTOR_SUPPRESSION_EXPIRED` |
| `compareDeterministicRerun` | engine artifact setまたはdetector finding setをkind別比較 | `U-EDX-015` | `HST-CASE-008-06`, `HST-CASE-009-10` / `HIL_ENGINE_RUN_NONDETERMINISTIC`, `HIL_NONDETERMINISTIC_RESULT` |
| `planEngineAuthorityCommit` | sealed artifact参照、terminal run、event、provenanceを単一DB transactionへ計画 | `U-EDX-016` | `HST-CASE-008-08` / `HIL_ENGINE_RESULT_PARTIAL` |
| `planDetectorAuthorityCommit` | finding/occurrence、terminal run、event、provenanceを単一DB transactionへ計画 | `U-EDX-017` | `HST-CASE-009-02` → `なし（正常系）`; `HST-CASE-009-08` → `HIL_DB_PROJECTION_BOUNDARY_INVALID`; `HST-CASE-009-09` → `HIL_PROSE_ONLY_EVIDENCE` |
| `invalidateExecutionEvidence` | source/version/config/schema/normalization driftでartifact/baseline/suppression/receiptをstale化 | `U-EDX-018` | `HST-CASE-009-10` / `HIL_NONDETERMINISTIC_RESULT` |
| `resolveCurrentExecutionAuthority` | identityのatomization/decision/coverage/relation authorityをtrusted store current headから解決 | `U-EDX-019` | supporting authority oracle |
| `commitExecutionAuthority` | engine/detector別Node portでoperation/digest/expected head/idempotency付きbundleをcommit | `U-EDX-019` | supporting authority transaction oracle |
| `reconcileExecutionAuthority` | seal済みartifact/proposalから同一bundleを再検証しprojectionとterminal receiptを収束 | `U-EDX-020` | supporting reconcile oracle |

`U-EDX-019`は`resolveCurrentExecutionAuthority` → `commitExecutionAuthority`のstable順exact function setを持つ
authority-resolution/commit compositionである。resolverはtrusted store current head、atomization、adoption decision、coverage receipt、
relation root、versionを一件ずつ偽装して反証し、commit側はresolver receipt、operation/identity digest、expected head、payload、write-set、
idempotencyを一件ずつ偽装してwrite 0を確認する。解決済みauthority以外をcommitできない一つの外部transaction結果として採点する。

### §1.1 complete public signatureとAPI逆引き

以下を本sliceのcomplete public signatureとする。全V1型は本書§2でslice-localに閉じ、未作成の
`src/schema/engine-detector-execution.ts`をdesign-time import authorityとして扱わない。

```ts
declare function parseEngineVersionDescriptor(raw: VersionDescriptorInputV1, policy: VersionDescriptorPolicyV1): ExecutionResultV1<EngineVersionDescriptorV1>;
declare function parseDetectorVersionDescriptor(raw: VersionDescriptorInputV1, policy: VersionDescriptorPolicyV1): ExecutionResultV1<DetectorVersionDescriptorV1>;
declare function resolveRegisteredVersion(lookup: RegisteredVersionLookupV1, registry: ExecutionRegistrySnapshotV1): ExecutionResultV1<ResolvedExecutionVersionV1>;
declare function deriveExecutionIdentity(authority: CurrentExecutionAuthorityV1, version: ResolvedExecutionVersionV1, input: FixedExecutionInputV1): ExecutionResultV1<ExecutionIdentityV1>;
declare function validateFixedExecutionInput(input: FixedExecutionInputV1, authority: CurrentExecutionAuthorityV1, version: ResolvedExecutionVersionV1): ExecutionResultV1<ValidatedExecutionInputV1>;
declare function createEngineRunPlan(identity: ExecutionIdentityV1, version: EngineVersionDescriptorV1, input: ValidatedExecutionInputV1, lease: ExecutionLeaseV1): ExecutionResultV1<EngineRunPlanV1>;
declare function validateEngineResultProposal(plan: EngineRunPlanV1, proposal: EngineResultProposalV1): ExecutionResultV1<EngineResultPayloadV1>;
declare function validateArtifactPath(path: ArtifactPathCandidateV1, root: ArtifactRootSnapshotV1): ExecutionResultV1<ValidatedArtifactPathV1>;
declare function validateArtifactManifest(payload: EngineResultPayloadV1, staged: StagedArtifactInventoryV1, root: ArtifactRootSnapshotV1): ExecutionResultV1<ValidatedEngineArtifactManifestV1>;
declare function createDetectorRunPlan(identity: ExecutionIdentityV1, version: DetectorVersionDescriptorV1, input: ValidatedExecutionInputV1, lease: ExecutionLeaseV1): ExecutionResultV1<DetectorRunPlanV1>;
declare function validateDetectorResultProposal(plan: DetectorRunPlanV1, proposal: DetectorResultProposalV1): ExecutionResultV1<DetectorResultPayloadV1>;
declare function canonicalizeFindingEvidence(raw: FindingEvidenceInputV1, normalization: EvidenceNormalizationPolicyV1): ExecutionResultV1<CanonicalFindingEvidenceV1>;
declare function deriveDetectorFingerprint(finding: DetectorFindingProposalV1, evidence: CanonicalFindingEvidenceV1, version: DetectorVersionDescriptorV1): ExecutionResultV1<DetectorFingerprintV1>;
declare function evaluateDetectorSuppression(fingerprint: DetectorFingerprintV1, suppression: SuppressionRuleV1 | null, current: SuppressionContextV1): ExecutionResultV1<SuppressionDecisionV1>;
declare function compareDeterministicRerun(identity: ExecutionIdentityV1, prior: ExecutionResultSnapshotV1, candidate: ExecutionResultSnapshotV1): ExecutionResultV1<RerunComparisonV1>;
declare function planEngineAuthorityCommit(authority: CurrentExecutionAuthorityV1, result: EngineResultPayloadV1, manifest: ValidatedEngineArtifactManifestV1, operation: ExecutionOperationV1): ExecutionResultV1<ExecutionAuthorityCommitBundleV1>;
declare function planDetectorAuthorityCommit(authority: CurrentExecutionAuthorityV1, result: DetectorResultPayloadV1, operation: ExecutionOperationV1): ExecutionResultV1<ExecutionAuthorityCommitBundleV1>;
declare function invalidateExecutionEvidence(current: ExecutionEvidenceSnapshotV1, drift: ExecutionDriftV1): ExecutionResultV1<ExecutionInvalidationPlanV1>;
declare function resolveCurrentExecutionAuthority(identity: ExecutionIdentityV1, expected: ExpectedAuthorityHeadV1, trustedNow: TrustedNowV1, store: CurrentExecutionAuthorityStoreV1): Promise<ExecutionResultV1<CurrentExecutionAuthorityV1>>;
declare function commitExecutionAuthority(bundle: ExecutionAuthorityCommitBundleV1, port: ExecutionAuthorityTransactionPortV1): Promise<ExecutionResultV1<ExecutionAuthorityCommitReceiptV1>>;
declare function reconcileExecutionAuthority(bundle: ExecutionAuthorityCommitBundleV1, port: ExecutionAuthorityTransactionPortV1): Promise<ExecutionResultV1<ExecutionAuthorityCommitReceiptV1>>;
```

| 公開API | 既存L7 U | 既存L8 IT |
|---|---|---|
| `parseEngineVersionDescriptor` | `U-EDX-001` | `IT-EDX-001`, `IT-EDX-003` |
| `parseDetectorVersionDescriptor` | `U-EDX-002` | `IT-EDX-001`, `IT-EDX-004` |
| `resolveRegisteredVersion` | `U-EDX-003` | `IT-EDX-002` |
| `deriveExecutionIdentity` | `U-EDX-004` | `IT-EDX-008`, `IT-EDX-009`, `IT-EDX-012` |
| `validateFixedExecutionInput` | `U-EDX-005` | `IT-EDX-003`, `IT-EDX-004` |
| `createEngineRunPlan` | `U-EDX-006` | `IT-EDX-003`, `IT-EDX-005` |
| `validateEngineResultProposal` | `U-EDX-007` | `IT-EDX-003`, `IT-EDX-005` |
| `validateArtifactPath` | `U-EDX-008` | `IT-EDX-006` |
| `validateArtifactManifest` | `U-EDX-009` | `IT-EDX-003`, `IT-EDX-006` |
| `createDetectorRunPlan` | `U-EDX-010` | `IT-EDX-004`, `IT-EDX-005` |
| `validateDetectorResultProposal` | `U-EDX-011` | `IT-EDX-004`, `IT-EDX-007` |
| `canonicalizeFindingEvidence` | `U-EDX-012` | `IT-EDX-007`, `IT-EDX-009` |
| `deriveDetectorFingerprint` | `U-EDX-013` | `IT-EDX-007`, `IT-EDX-009` |
| `evaluateDetectorSuppression` | `U-EDX-014` | `IT-EDX-007` |
| `compareDeterministicRerun` | `U-EDX-015` | `IT-EDX-008`, `IT-EDX-009`, `IT-EDX-012` |
| `planEngineAuthorityCommit` | `U-EDX-016` | `IT-EDX-010`, `IT-EDX-011` |
| `planDetectorAuthorityCommit` | `U-EDX-017` | `IT-EDX-009`, `IT-EDX-010`, `IT-EDX-011` |
| `invalidateExecutionEvidence` | `U-EDX-018` | `IT-EDX-012` |
| `resolveCurrentExecutionAuthority` | `U-EDX-019` | `IT-EDX-013`, `IT-EDX-014` |
| `commitExecutionAuthority` | `U-EDX-019` | `IT-EDX-013`, `IT-EDX-014` |
| `reconcileExecutionAuthority` | `U-EDX-020` | `IT-EDX-014` |

`U-EDX-019`の順序付きcompositionは`resolveCurrentExecutionAuthority` → `commitExecutionAuthority`だけである。
`reconcileExecutionAuthority`はseal後のpending/fault収束を担う`U-EDX-020`として分離し、U-019へ混載しない。

## §2 schema候補

```ts
type ExecutionKindV1 = "engine" | "detector";
type ExecutionResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; error: ExecutionAuthorityTransactionFailureV1 };

interface VersionDescriptorInputV1 { schema_version: "helix-version-descriptor-input.v1"; descriptor_text: string; descriptor_bytes_digest: string }
interface VersionDescriptorPolicyV1 { schema_version: "helix-version-descriptor-policy.v1"; allowed_runtimes: readonly ("node" | "python")[]; allowed_statuses: readonly ("active" | "draft" | "retired")[]; allowed_schema_majors: readonly number[]; policy_digest: string }
interface EngineVersionDescriptorV1 { schema_version: "helix-engine-version-descriptor.v1"; kind: "engine"; capability_id: string; engine_id: string; exact_version: string; runtime: "node" | "python"; worker_id: string; entrypoint: string; package_digest: string; input_schema_digest: string; result_schema_digest: string; result_schema_major: number; config_schema_digest: string; owner: string; status: "active" | "draft" | "retired"; descriptor_digest: string }
interface DetectorVersionDescriptorV1 { schema_version: "helix-detector-version-descriptor.v1"; kind: "detector"; capability_id: string; detector_id: string; exact_version: string; runtime: "node" | "python"; worker_id: string; entrypoint: string; package_digest: string; input_schema_digest: string; rule_schema_digest: string; config_schema_digest: string; result_schema_digest: string; result_schema_major: number; severity_policy_digest: string; owner: string; status: "active" | "draft" | "retired"; descriptor_digest: string }
interface RegisteredVersionLookupV1 { schema_version: "helix-registered-version-lookup.v1"; kind: ExecutionKindV1; capability_id: string; exact_version: string }
interface ExecutionRegistrySnapshotV1 { schema_version: "helix-execution-registry-snapshot.v1"; registry_revision: number; registry_head: string; descriptors: readonly (EngineVersionDescriptorV1 | DetectorVersionDescriptorV1)[]; descriptor_set_digest: string; snapshot_digest: string }
interface ResolvedExecutionVersionV1 { schema_version: "helix-resolved-execution-version.v1"; kind: ExecutionKindV1; capability_id: string; exact_version: string; descriptor: EngineVersionDescriptorV1 | DetectorVersionDescriptorV1; registry_revision: number; registry_head: string; resolution_digest: string }
interface FixedExecutionInputV1 { schema_version: "helix-fixed-execution-input.v1"; source_snapshot_id: string; source_snapshot_digest: string; atomization_revision: number; atom_id: string; atom_revision: number; atom_digest: string; adoption_decision_digest: string; coverage_receipt_digest: string; relation_root_digest: string; config_digest: string; input_ids: readonly string[]; input_set_digest: string; result_schema_major: number; normalization_version: string; input_digest: string }
interface ValidatedExecutionInputV1 { schema_version: "helix-validated-execution-input.v1"; input: FixedExecutionInputV1; authority_head: string; version_digest: string; recomputed_input_set_digest: string; validation_digest: string }
interface ExecutionLeaseV1 { schema_version: "helix-execution-lease.v1"; run_id: string; lease_id: string; fence_digest: string; operation_id: string; issued_at: string; fresh_until: string; authority_head: string; lease_digest: string }
interface EngineRunPlanV1 { schema_version: "helix-engine-run-plan.v1"; kind: "engine"; run_id: string; identity: ExecutionIdentityV1; identity_digest: string; version: EngineVersionDescriptorV1; input: ValidatedExecutionInputV1; config_digest: string; lease_id: string; fence_digest: string; worker_request_digest: string; authority_scope: "proposal_only"; plan_digest: string }
interface DetectorRunPlanV1 { schema_version: "helix-detector-run-plan.v1"; kind: "detector"; run_id: string; identity: ExecutionIdentityV1; identity_digest: string; version: DetectorVersionDescriptorV1; input: ValidatedExecutionInputV1; config_digest: string; lease_id: string; fence_digest: string; worker_request_digest: string; authority_scope: "proposal_only"; plan_digest: string }
interface EngineArtifactProposalV1 { kind: string; relative_path: string; media_type: string; schema_version: string; size_bytes: number; content_digest: string; source_provenance_digest: string }
interface EngineResultProposalV1 { schema_version: "helix-engine-result-proposal.v1"; kind: "engine"; run_id: string; identity_digest: string; version_digest: string; input_set_digest: string; config_digest: string; exit_code: number; artifacts: readonly EngineArtifactProposalV1[]; artifact_set_digest: string; staged_root_digest: string; provenance_digest: string; proposal_digest: string }
interface DetectorResultProposalV1 { schema_version: "helix-detector-result-proposal.v1"; kind: "detector"; run_id: string; identity_digest: string; version_digest: string; input_set_digest: string; config_digest: string; rule_set_digest: string; findings: readonly DetectorFindingProposalV1[]; finding_set_digest: string; provenance_digest: string; proposal_digest: string }
interface ArtifactPathCandidateV1 { schema_version: "helix-artifact-path-candidate.v1"; relative_path: string; path_bytes_digest: string; declared_root_digest: string }
interface ArtifactRootSnapshotV1 { schema_version: "helix-artifact-root-snapshot.v1"; root_id: string; root_path_digest: string; root_realpath_digest: string; symlink_policy: "reject_escape"; snapshot_digest: string }
interface ValidatedArtifactPathV1 { schema_version: "helix-validated-artifact-path.v1"; relative_path: string; normalized_path_digest: string; resolved_path_digest: string; root_snapshot_digest: string; validation_digest: string }
interface StagedArtifactV1 { staged_artifact_id: string; relative_path: string; validated_path_digest: string; size_bytes: number; content_digest: string; sealed_bytes_digest: string }
interface StagedArtifactInventoryV1 { schema_version: "helix-staged-artifact-inventory.v1"; staged_root_digest: string; artifacts: readonly StagedArtifactV1[]; artifact_ids: readonly string[]; artifact_set_digest: string; artifact_count: number }
interface ValidatedEngineArtifactManifestV1 { schema_version: "helix-validated-engine-artifact-manifest.v1"; run_id: string; artifacts: readonly EngineArtifactV1[]; artifact_ids: readonly string[]; artifact_set_digest: string; artifact_count: number; staged_root_digest: string; sealed_bytes_set_digest: string; manifest_digest: string }
interface FindingEvidenceInputV1 { schema_version: "helix-finding-evidence-input.v1"; raw_evidence_bytes_digest: string; raw_location: string; encoding: "utf-8"; separator_style: "lf" | "crlf"; input_digest: string }
interface EvidenceNormalizationPolicyV1 { schema_version: "helix-evidence-normalization-policy.v1"; normalization_version: string; line_ending: "lf"; path_separator: "/"; unicode_normalization: "NFC"; policy_digest: string }
interface CanonicalFindingEvidenceV1 { schema_version: "helix-canonical-finding-evidence.v1"; normalization_version: string; canonical_location: string; canonical_location_digest: string; semantic_bytes_digest: string; evidence_digest: string }
interface DetectorFingerprintV1 { schema_version: "helix-detector-fingerprint.v1"; detector_id: string; detector_major: number; rule_id: string; subject_kind: string; subject_id: string; canonical_location_digest: string; evidence_digest: string; normalization_version: string; fingerprint: string }
interface SuppressionRuleV1 { schema_version: "helix-detector-suppression-rule.v1"; rule_id: string; exact_fingerprint: string; scope_kind: "finding" | "subject" | "rule"; scope_id: string; owner: string; approval_receipt_digest: string; expires_at: string; detector_version_range: string; baseline_digest: string; evidence_digest: string; rule_revision: number; status: "active" | "expired" | "stale"; rule_digest: string }
interface TrustedNowV1 { schema_version: "helix-trusted-now.v1"; instant: string; clock_source: "node_trusted_clock"; clock_receipt_id: string; clock_receipt_digest: string }
interface SuppressionContextV1 { schema_version: "helix-suppression-context.v1"; trusted_now: TrustedNowV1; current_baseline_digest: string; current_detector_version: string; current_scope_digest: string; context_digest: string }
interface SuppressionDecisionV1 { schema_version: "helix-suppression-decision.v1"; fingerprint: string; rule_id: string | null; verdict: "suppressed" | "open"; failure_code: ExecutionFailureCodeV1 | null; decision_digest: string }
type ExecutionResultSnapshotV1 =
  | { schema_version: "helix-execution-result-snapshot.v1"; kind: "engine"; identity_digest: string; result: EngineResultPayloadV1; result_set_digest: string }
  | { schema_version: "helix-execution-result-snapshot.v1"; kind: "detector"; identity_digest: string; result: DetectorResultPayloadV1; result_set_digest: string };
interface RerunComparisonV1 { schema_version: "helix-rerun-comparison.v1"; kind: ExecutionKindV1; identity_digest: string; prior_result_set_digest: string; candidate_result_set_digest: string; equal: boolean; difference_ids: readonly string[]; comparison_digest: string; verdict: "current" | "quarantine" }
interface ExecutionOperationV1 { schema_version: "helix-execution-operation.v1"; operation_id: string; operation_digest: string; idempotency_key: string; expected_db_head: string; exact_write_set: readonly { table: string; key: string; action: "insert" | "update" }[]; write_set_digest: string }
interface ExecutionEvidenceSnapshotV1 { schema_version: "helix-execution-evidence-snapshot.v1"; authority_head: string; result_receipt_ids: readonly string[]; result_digests: readonly string[]; baseline_digests: readonly string[]; suppression_rule_ids: readonly string[]; projection_head: string; snapshot_digest: string }
interface ExecutionDriftV1 { schema_version: "helix-execution-drift.v1"; drift_kind: "source" | "version" | "config" | "schema" | "normalization"; subject_id: string; before_digest: string; after_digest: string; observed_event_head: string; drift_digest: string }
interface ExecutionInvalidationPlanV1 { schema_version: "helix-execution-invalidation-plan.v1"; invalidated_result_receipt_ids: readonly string[]; invalidated_baseline_digests: readonly string[]; invalidated_suppression_rule_ids: readonly string[]; stale_event_digest: string; expected_projection_head: string; plan_digest: string }
interface ExpectedAuthorityHeadV1 { schema_version: "helix-expected-authority-head.v1"; authority_head: string; authority_head_digest: string }

interface ExecutionIdentityV1 {
  schema_version: "helix-execution-identity.v1";
  kind: ExecutionKindV1;
  capability_id: string;
  exact_version: string;
  source_snapshot_digest: string;
  atomization_revision: number;
  current_adoption_decision_digest: string;
  coverage_receipt_digest: string;
  db_relation_root_digest: string;
  config_digest: string;
  input_set_digest: string;
  result_schema_major: number;
  normalization_version: string;
}

interface DetectorFindingProposalV1 {
  run_id: string;
  detector_id: string;
  detector_version: string;
  rule_id: string;
  subject_kind: string;
  subject_id: string;
  canonical_location: string;
  severity: string;
  evidence_digest: string;
  fingerprint: string;
  proposal_only: true;
}

interface CurrentExecutionAuthorityStoreV1 { readCurrent(expected: ExpectedAuthorityHeadV1, trustedNow: TrustedNowV1): Promise<ExecutionResultV1<CurrentExecutionAuthorityV1>> }
interface CurrentExecutionAuthorityResolverV1 { resolve(identity: ExecutionIdentityV1, expected: ExpectedAuthorityHeadV1, trustedNow: TrustedNowV1, store: CurrentExecutionAuthorityStoreV1): Promise<ExecutionResultV1<CurrentExecutionAuthorityV1>> }
interface ExecutionAuthorityCommitBundleV1 { operation_id: string; operation_digest: string; idempotency_key: string; identity: ExecutionIdentityV1; authority: CurrentExecutionAuthorityV1; expected_authority_head: string; sealed_result_digest: string; expected_db_head: string; authority_kind: ExecutionKindV1; result_payload: EngineResultPayloadV1 | DetectorResultPayloadV1; events: ExecutionEventV1[]; provenance_edges: ExecutionProvenanceEdgeV1[]; exact_write_set: { table: string; key: string; action: "insert" | "update" }[]; append_order: ["result_reference", "terminal_run", "event", "provenance", "terminal_receipt"]; write_set_digest: string }
interface ExecutionAuthorityCommitReceiptV1 { operation_id: string; operation_digest: string; identity_digest: string; before_db_head: string; after_db_head: string; authority_kind: ExecutionKindV1; status: "committed" | "reconcile_pending"; terminal_receipt_digest: string; write_set_digest: string; action_counts: Record<string, number> }
type ExecutionFailureCodeV1 =
  | "HIL_ARTIFACT_PATH_ESCAPE"
  | "HIL_DB_PROJECTION_BOUNDARY_INVALID"
  | "HIL_DETECTOR_FINDING_EVIDENCE_MISSING"
  | "HIL_DETECTOR_FINDING_INCOMPLETE"
  | "HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC"
  | "HIL_DETECTOR_SUPPRESSION_EXPIRED"
  | "HIL_ENGINE_RESULT_PARTIAL"
  | "HIL_ENGINE_RUN_INCOMPLETE"
  | "HIL_ENGINE_RUN_NONDETERMINISTIC"
  | "HIL_HYBRID_INGESTION_INCOMPLETE"
  | "HIL_NONDETERMINISTIC_RESULT"
  | "HIL_PROSE_ONLY_EVIDENCE"
  | "HIL_PYTHON_AUTHORITY_BYPASS"
  | "HIL_REGISTRY_VERSION_UNKNOWN"
  | "HIL_RUN_IDEMPOTENCY_CONFLICT"
  | "HIL_WORKER_RESULT_QUARANTINED";
interface ExecutionAuthorityTransactionFailureV1 { code: ExecutionFailureCodeV1; evidence_digest: string; cause_code: string | null }
interface ExecutionAuthorityTransactionPortV1 { commit(bundle: ExecutionAuthorityCommitBundleV1): Promise<ExecutionResultV1<ExecutionAuthorityCommitReceiptV1>>; reconcile(bundle: ExecutionAuthorityCommitBundleV1): Promise<ExecutionResultV1<ExecutionAuthorityCommitReceiptV1>>; findReceipt(operationId: string): Promise<ExecutionAuthorityCommitReceiptV1 | null> }
```

engine proposalとdetector proposalはdiscriminated unionの別variantとし、artifact fieldとfinding fieldの同時存在を拒否する。
proposalにauthoritative ID/current flagを持たせない。Nodeがvalidated proposalとrun identityから正本IDを生成する。

## §3 配置候補と依存方向

| path候補 | 責務 |
|---|---|
| `src/schema/engine-detector-execution.ts` | version、run、artifact、finding、receipt、failure unionの定義 |
| `src/runtime/execution-registry.ts` | versioned descriptorのexact解決 |
| `src/runtime/execution-identity.ts` | 正規化したinput/config/run identity |
| `src/runtime/engine-runner.ts` | engine planとworker proposal受領 |
| `src/runtime/engine-artifact.ts` | path/manifest/digest/seal検証 |
| `src/runtime/detector-runner.ts` | detector planとworker proposal受領 |
| `src/runtime/detector-finding.ts` | evidence/fingerprint/suppression/dedupeの判定 |
| `src/runtime/execution-determinism.ts` | rerun比較とquarantine finding |
| `src/state-db/engine-execution-projection.ts` | engine transaction/rebuild |
| `src/state-db/detector-execution-projection.ts` | detector transaction/rebuild |

runnerは共通`PythonWorkerBroker`/`ResultIngestionPort`へ依存するが、child processやSQLite driverを直接操作しない。
engine moduleはfinding repositoryへ、detector moduleはartifact registryへwriteしない。

## §4 transactionと冪等性

`plan*AuthorityCommit`はpure planを返し、`commitExecutionAuthority`だけがNode portを通じて一transactionで
operation、identity digest、expected DB head、idempotency keyを検証し、event append、kind別projection、terminal receiptを行う。
artifact seal失敗はDB write 0、DB rollbackはauthoritative row 0、seal済みorphanは非currentのままreconcileする。
`reconcileExecutionAuthority`は同一operation/identity/sealed digest/expected headからのみ再開し、別digest再送、head競合、
engine/detector write set混載、暗黙のartifact rewriteを拒否する。
同じidempotency key＋同じidentityは同じterminal receiptを返し、異なるidentityは
`HIL_RUN_IDEMPOTENCY_CONFLICT`でcommit 0とする。

`ExecutionFailureCodeV1`はL5/L6/L7/L8 quartetが使用する16 tokenのclosed unionであり、transaction固有5 tokenだけへ
縮退させない。known failureはL5 §7のtokenをそのままdiscriminated unionにし、alias/renameしない。unknown例外はcause digest付き
`HIL_WORKER_RESULT_QUARANTINED`へ境界変換する。CLI候補は成功0、契約/検証failure 2、I/O 3、internal/reconcile 4。

## §5 実装順とfreeze

1. 20 unit oracleとfailure token一致testをRedにする。
2. engine/detector descriptor、exact version解決、execution identityを実装する。
3. engine result、artifact path/manifest/seal検証を実装する。
4. detector result、evidence/fingerprint/suppression/dedupeを実装する。
5. rerun comparatorとquarantineを実装する。
6. engine/detector別Node transaction、event、projection/rebuildを実装する。
7. 20 unit、14 integration、22 HST、ZIP固定snapshot実run、別runtime reviewを実行する。

20/20のRed/Green、全failure code、mutation、authoritative write count、digest冪等性が揃うまでL7をgreenにしない。

## primary atomic assertion台帳

supporting caseを混入させず、正本primary caseをrangeなしで主IT/Uへ結線する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 | U結線 |
|---|---|---|---|---|---|
| `HST-CASE-008-01` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-006`, `U-EDX-009` |
| `HST-CASE-008-02` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-007` |
| `HST-CASE-008-03` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-007` |
| `HST-CASE-008-04` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-007` |
| `HST-CASE-008-05` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-006` |
| `HST-CASE-008-06` | `committed` | `quarantined` | `HIL_ENGINE_RUN_NONDETERMINISTIC` | `IT-EDX-008` | `U-EDX-004`, `U-EDX-015` |
| `HST-CASE-008-07` | `result_staged` | `quarantined` | `HIL_ARTIFACT_PATH_ESCAPE` | `IT-EDX-006` | `U-EDX-008` |
| `HST-CASE-008-08` | `result_staged` | `failed` | `HIL_ENGINE_RESULT_PARTIAL` | `IT-EDX-010` | `U-EDX-016` |
| `HST-CASE-008-09` | `queued` | `queued` | `HIL_REGISTRY_VERSION_UNKNOWN` | `IT-EDX-002` | `U-EDX-003` |
| `HST-CASE-009-01` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-004` | `U-EDX-010` |
| `HST-CASE-009-02` | `committed` | `committed` | `なし（正常系）` | `IT-EDX-009` | `U-EDX-013`, `U-EDX-017` |
| `HST-CASE-009-03` | `queued` | `queued` | `HIL_REGISTRY_VERSION_UNKNOWN` | `IT-EDX-002` | `U-EDX-003` |
| `HST-CASE-009-04` | `running` | `committed` | `HIL_DETECTOR_SUPPRESSION_EXPIRED` | `IT-EDX-007` | `U-EDX-014` |
| `HST-CASE-009-05` | `result_staged` | `quarantined` | `HIL_DETECTOR_FINDING_EVIDENCE_MISSING` | `IT-EDX-007` | `U-EDX-011` |
| `HST-CASE-009-06` | `result_staged` | `quarantined` | `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC` | `IT-EDX-007` | `U-EDX-012`, `U-EDX-013` |
| `HST-CASE-008-10` | `assertion_input_ready` | `assertion_pass` | `HIL_HYBRID_INGESTION_INCOMPLETE` | `IT-EDX-003` | `U-EDX-005` |
| `HST-CASE-008-11` | `assertion_input_ready` | `assertion_pass` | `HIL_ENGINE_RUN_INCOMPLETE` | `IT-EDX-001` | `U-EDX-001`, `U-EDX-005`, `U-EDX-009` |
| `HST-CASE-009-07` | `assertion_input_ready` | `assertion_pass` | `HIL_DETECTOR_FINDING_INCOMPLETE` | `IT-EDX-001` | `U-EDX-002`, `U-EDX-011` |
| `HST-CASE-008-12` | `assertion_input_ready` | `assertion_pass` | `HIL_PYTHON_AUTHORITY_BYPASS` | `IT-EDX-005` | `U-EDX-016` |
| `HST-CASE-009-08` | `assertion_input_ready` | `assertion_pass` | `HIL_DB_PROJECTION_BOUNDARY_INVALID` | `IT-EDX-011` | `U-EDX-017` |
| `HST-CASE-009-09` | `assertion_input_ready` | `assertion_pass` | `HIL_PROSE_ONLY_EVIDENCE` | `IT-EDX-007` | `U-EDX-017` |
| `HST-CASE-009-10` | `assertion_input_ready` | `assertion_pass` | `HIL_NONDETERMINISTIC_RESULT` | `IT-EDX-012` | `U-EDX-004`, `U-EDX-015`, `U-EDX-018` |

## authority／result完全schema

```ts
interface CurrentExecutionAuthorityV1 { authority_head: string; source_snapshot_id: string; source_snapshot_digest: string; atomization_revision: number; atom_id: string; atom_revision: number; atom_digest: string; adoption_decision_revision: number; adoption_decision_digest: string; coverage_receipt_id: string; coverage_receipt_digest: string; relation_root_digest: string; capability_id: string; registry_version: string; registry_version_digest: string; schema_major: number; normalization_version: string; issued_at: string; fresh_until: string }
interface EngineArtifactV1 { artifact_id: string; kind: string; relative_path: string; media_type: string; schema_version: string; size_bytes: number; content_digest: string; source_provenance_digest: string }
interface EngineResultPayloadV1 { kind: "engine"; run_id: string; identity_digest: string; version_digest: string; input_set_digest: string; config_digest: string; exit_code: number; artifacts: EngineArtifactV1[]; artifact_set_digest: string }
interface DetectorFindingV1 { finding_id: string; rule_id: string; subject_kind: string; subject_id: string; location: string; severity: string; evidence_digest: string; fingerprint: string }
interface DetectorResultPayloadV1 { kind: "detector"; run_id: string; identity_digest: string; version_digest: string; input_set_digest: string; config_digest: string; rule_set_digest: string; findings: DetectorFindingV1[]; finding_set_digest: string }
interface ExecutionEventV1 { event_id: string; operation_id: string; sequence: number; run_id: string; kind: ExecutionKindV1; event_type: "result_committed" | "result_quarantined" | "reconciled"; payload_digest: string; previous_event_head: string; event_head: string }
interface ExecutionProvenanceEdgeV1 { edge_id: string; result_id: string; authority_head: string; source_kind: "snapshot" | "atom" | "decision" | "coverage" | "relation_root" | "registry_version"; source_id: string; source_digest: string }
```

resolverはstoreのcurrent bytesから全bindingとfreshnessを再検証する。engine/detector strict unionのunknown/余剰field、artifact/finding swap、authority head/version/provenance mismatch、caller digest、stale/CAS/faultはcommit 0とする。
