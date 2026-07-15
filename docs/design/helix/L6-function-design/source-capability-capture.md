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
| `probeSourceAdapter` | `(adapter, request) => Promise<SourceCaptureResultV1<SourceProbeResultV1>>` | request familyとadapter一致、write/network 0 | `U-SCAP-004` |
| `enumerateSourceEntries` | `(adapter, probe) => AsyncIterable<SourceCaptureResultV1<SourceEntryV1>>` | raw path/bytes identityを保持、stable ID重複拒否 | `U-SCAP-005` |
| `deriveGitOverlay` | `(mainEntries, refEntries, ancestry) => SourceCaptureResultV1<GitOverlayV1>` | A/M/D/Rとempty overlayを証明、共通blob非複製 | `U-SCAP-011` |
| `classifySourceEntry` | `(entry, rules) => SourceCaptureResultV1<EntryClassificationV1>` | exactly one、rule/reason必須、fallback other禁止 | `U-SCAP-020` |
| `renderSourceCaptureBundle` | `(snapshot, refs, entries, classifications) => SourceCaptureResultV1<RenderedBundleV1>` | canonical JSON/JSONL、全count/digestを再計算 | `U-SCAP-003` |
| `planSourceCapture` | `(request, adapters, rules) => Promise<SourceCaptureResultV1<CapturePlanV1>>` | read-only、既存artifact/DB差分を返す | `U-SCAP-024` (`resolveSourceCaptureAuthority`のmutation component) |
| `commitSourceCapture` | `(plan, store, projection) => Promise<SourceCaptureResultV1<SourceCaptureReceiptV1>>` | artifact publish成功後だけDB transaction、partial current禁止 | `U-SCAP-022` |
| `verifySourceCapture` | `(bundle, projection) => SourceCaptureResultV1<VerificationReportV1>` |全bytes/count/FK/current pointerを再計算 | `U-SCAP-023` |
| `activateSourceSnapshot` | `(bundle: SourceSnapshotActivationBundleV1, store: SourceSnapshotPointerStoreV1) => Promise<SourceCaptureResultV1<ActivationReceiptV1>>` | verified、classification complete、behavior flag false、expected pointer head/revisionをNode-only CASで不可分commit | `U-SCAP-023` (`verifySourceCapture`のmutation component) |
| `markSourceSnapshotStale` | `(snapshot, cause, eventPort) => Promise<SourceCaptureResultV1<StaleReceiptV1>>` | append-only cause、旧artifact不変 | `U-SCAP-022` (`commitSourceCapture`のmutation component) |
| `resolveSourceCaptureAuthority` | `(expectedManifestDigest, request, store: TrustedSourceManifestAuthorityStoreV1) => Promise<SourceCaptureResultV1<AuthorizedSourceCaptureRequestV1>>` | trusted current store receiptとmanifest digest、ZIP SHA、UT exact 5 commit/tree、HEAD/countを照合しcaller自己申告を拒否 | `U-SCAP-024` |
| `reconcileSourceCaptureProjection` | `(pending: ProjectionPendingReceiptV1, artifact: RenderedBundleV1, store: SourceCaptureProjectionStoreV1) => Promise<SourceCaptureResultV1<ProjectionReconcileReceiptV1>>` | operation/idempotency、expected artifact/DB headをCASしseal済みbytesからだけ再投影 | `U-SCAP-025` |

### §1.1 主所有APIと変異構成要素

14 public APIは各一行だけを持ち、25 Uは次のowner setへ重複なくpartitionする。component APIは新しいUを作らず、右欄のowner protocol内でmutationする。

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

### §1.2 HST011主系のAPI tuple

| HSTケース | API | 主U | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-011-01` | `verifySourceCapture` | `U-SCAP-023` | `coverage_ready` | `pair_freeze_ready` | `なし（正常系）` |
| `HST-CASE-011-02` | `probeSourceAdapter` | `U-SCAP-004` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-03` | `deriveGitOverlay` | `U-SCAP-011` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
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

interface SourceSnapshotIdV1 { snapshot_id: string; source_identity_digest: string; request_digest: string; adapter_version: string; classifier_version: string; schema_version: string; derivation_digest: string }
interface SourceProbeResultV1 { family: SourceCaptureRequestV1["family"]; revision: string; source_identity_digest: string; source_ref_set_digest: string; observed_entry_count: number; expected_entry_count: number; local_only: true; write_count: 0; network_count: 0; probe_digest: string }
interface SourceEntryV1 { entry_id: string; source_ref_id: string; raw_path_base64: string; display_path_nfc: string; mode: string; byte_length: number; blob_digest: string; overlay_operation: "add" | "modify" | "delete" | "rename" | "none"; prior_entry_id: string | null; entry_digest: string }
interface GitOverlayV1 { main_tree_digest: string; ref_tree_digest: string; merge_base_commit: string; added_entry_ids: string[]; modified_entry_ids: string[]; deleted_entry_ids: string[]; renamed_entry_ids: string[]; shared_blob_set_digest: string; overlay_entry_count: number; overlay_digest: string }
interface EntryClassificationV1 { classification_id: string; entry_id: string; entry_class: "runtime-source" | "test" | "design" | "rule" | "workflow" | "generated-fixture" | "binary" | "duplicate-alias" | "evidence-only" | "unclassified"; rule_id: string; rule_version: string; reason_code: string; classification_digest: string }
interface CapturePlanV1 { operation_id: string; operation_digest: string; idempotency_key: string; authorized_request: AuthorizedSourceCaptureRequestV1; adapter_id: string; adapter_version: string; classifier_version: string; expected_artifact_head: string; expected_db_head: string; expected_entry_count: number; dry_run: boolean; plan_digest: string }

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
  | "HIL_ASSET_DECISION_MISSING"
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
  artifact_manifest: { path: string; content_digest: string; byte_length: number }[];
}

interface CanonicalSourceSnapshotManifestV1 { manifest_digest: string; zip_archive_sha256: string; ut_refs: { ref: string; commit: string; tree: string }[]; current_head_commit: string; current_head_tree: string; expected_entry_counts: Record<"zip" | "git-main" | "git-overlay" | "current-head", number> }
interface AuthorizedSourceCaptureRequestV1 { request: SourceCaptureRequestV1; authority_manifest_digest: string; authority_binding_digest: string }
interface TrustedSourceManifestAuthorityStoreV1 { readCurrent(expectedManifestDigest: string): Promise<SourceCaptureResultV1<{ manifest: CanonicalSourceSnapshotManifestV1; authority_receipt_digest: string; store_head: string }>> }

interface SourceCaptureReceiptV1 {
  schema_version: "source-capture-receipt.v1";
  snapshot_id: string;
  status: "committed" | "projection_pending" | "verified" | "active" | "failed" | "stale";
  entry_count: number;
  classification_count: number;
  behavior_atom_closed: false;
  artifact_root_digest: string;
  projection_digest: string | null;
  failure_codes: SourceCaptureFailureCodeV1[];
}
interface VerificationReportV1 { snapshot_id: string; artifact_root_digest: string; projection_digest: string; expected_entry_count: number; actual_entry_count: number; classification_count: number; unclassified_count: number; foreign_key_violation_count: number; current_pointer_matches: boolean; behavior_atom_closed: false; status: "verified" | "failed"; failure_codes: SourceCaptureFailureCodeV1[]; report_digest: string }
interface SourceSnapshotActivationBundleV1 { schema_version: "helix-source-snapshot-activation.v1"; operation_id: string; operation_digest: string; report: VerificationReportV1 & { status: "verified"; unclassified_count: 0; foreign_key_violation_count: 0; behavior_atom_closed: false }; expected_pointer_head: string; expected_pointer_revision: number; expected_projection_digest: string; append_order: readonly ["activation_event", "active_pointer", "terminal_receipt"]; exact_write_set: readonly [{ table: "source_capture_events"; key: string; action: "insert" }, { table: "source_snapshot_pointers"; key: "current"; action: "update" }, { table: "source_capture_receipts"; key: string; action: "insert" }]; write_set_digest: string; bundle_digest: string }
interface ActivationReceiptV1 { schema_version: "helix-source-snapshot-activation-receipt.v1"; operation_id: string; operation_digest: string; snapshot_id: string; verification_report_digest: string; before_pointer_head: string; after_pointer_head: string; before_pointer_revision: number; after_pointer_revision: number; entry_count: number; classification_count: number; behavior_atom_closed: false; status: "active"; event_digest: string; write_set_digest: string; terminal_receipt_digest: string }
interface StaleReceiptV1 { snapshot_id: string; prior_status: "committed" | "projected" | "verified" | "active"; cause_code: "HSCAP_SNAPSHOT_STALE"; cause_digest: string; prior_artifact_root_digest: string; artifact_write_count: 0; status: "stale"; event_digest: string }
interface ProjectionPendingReceiptV1 { operation_id: string; operation_digest: string; idempotency_key: string; snapshot_id: string; expected_artifact_head: string; expected_db_head: string; artifact_root_digest: string; status: "projection_pending" }
interface ProjectionReconcileReceiptV1 { operation_id: string; artifact_head: string; before_db_head: string; after_db_head: string; event_sequence: number; counts: Record<string, { inserted: number; updated: number }>; status: "reconciled" }
interface SourceCaptureProjectionStoreV1 { reconcile(pending: ProjectionPendingReceiptV1, artifact: RenderedBundleV1): Promise<SourceCaptureResultV1<ProjectionReconcileReceiptV1>> }
interface SourceSnapshotPointerStoreV1 { commitActivation(bundle: SourceSnapshotActivationBundleV1): Promise<SourceCaptureResultV1<ActivationReceiptV1>>; findActivationReceipt(operationId: string): Promise<ActivationReceiptV1 | null>; reconcileActivation(bundle: SourceSnapshotActivationBundleV1): Promise<SourceCaptureResultV1<ActivationReceiptV1>> }
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
| `src/source/adapters/current-head.ts` | input adapter | commit tree read-only、working tree隔離 |
| `src/source/artifact-store.ts` | 出力adapter | temp/fsync/rename、content-addressed immutable publish |
| `src/state-db/source-capture-projection.ts` | Node DB接続 | 6 table transaction、rebuild/reprojection |
| `src/cli/commands/source-capture.ts` | CLI adapter | dry-run既定、execute/activate明示、JSON output |

Node control planeだけがartifact publish、DB transaction、active pointerを行う。Python workerは将来のatom候補抽出に
利用できるが、本capture API、DB、repo、pointerへwrite authorityを持たない。source capture sliceでNode/Bun
cutover全体、Python packaging、network取得を同時に解決したと主張しない。

## §3 transaction／WBS実装順

1. current schema versionとtable registry/rebuild contractを再監査する。
2. strict schema、failure union、canonical digestをRedで固定する。
3. ZIP adapterを703件fixtureで実装する。
4. Git adapterをmain 1,784＋overlay 52＋5 ref evidenceで実装する。
5. current HEAD adapterをfull-tree scopeで実装する。
6. classifierと4,470件量閉じを実装する。
7. immutable artifact storeとfault rollbackを実装する。
8. DB migration、6 table、rebuild/reprojectionを同一sliceで実装する。
9. CLI dry-run/execute/verify/activateとJSON contractを配線する。
10. L7 25 unit＋L8 10 integration、Linux primary smoke、別runtime reviewを実行する。

各段階は前段のRed/Green evidenceとsnapshot digestを引き継ぐ。DB schema追加だけ、artifact生成だけ、代表sourceだけを
先行完了扱いにしない。

## §4 failure/result規律

全public APIは既知failureを`SourceCaptureFailureV1`のdiscriminated unionで返し、unknown exceptionは
`HSCAP_INTERNAL_ERROR`へcause digest付きで境界変換する。CLIは成功0、契約/検証failure 2、I/O failure 3、
internal failure 4とし、stdoutはschema準拠JSONだけ、診断はstderrへ出す。secret、remote credential、source本文を
receiptへ保存しない。
