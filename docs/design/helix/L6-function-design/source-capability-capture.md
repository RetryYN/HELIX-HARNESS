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
| `canonicalizeSourceCaptureRequest` | `(raw: unknown, policy: SourceCapturePolicy) => SourceCaptureRequest` | local path、family、revision、scope、期待digest/countをstrict検証 | `U-SCAP-001, U-SCAP-003` |
| `deriveSourceSnapshotId` | `(request, probe, versions) => SourceSnapshotId` | source identityと全versionから決定、時刻/OS非依存 | `U-SCAP-002` |
| `probeSourceAdapter` | `(adapter, request) => Promise<SourceProbeResult>` | request familyとadapter一致、write/network 0 | `U-SCAP-004, U-SCAP-007, U-SCAP-008, U-SCAP-009, U-SCAP-010, U-SCAP-013, U-SCAP-014, U-SCAP-015, U-SCAP-016, U-SCAP-017, U-SCAP-018, U-SCAP-019` |
| `enumerateSourceEntries` | `(adapter, probe) => AsyncIterable<SourceEntry>` | raw path/bytes identityを保持、stable ID重複拒否 | `U-SCAP-004, U-SCAP-005, U-SCAP-006, U-SCAP-007, U-SCAP-008, U-SCAP-009, U-SCAP-010, U-SCAP-014, U-SCAP-016, U-SCAP-017, U-SCAP-018, U-SCAP-019` |
| `deriveGitOverlay` | `(mainEntries, refEntries, ancestry) => GitOverlay` | A/M/D/Rとempty overlayを証明、共通blob非複製 | `U-SCAP-011, U-SCAP-012, U-SCAP-013, U-SCAP-014, U-SCAP-015` |
| `classifySourceEntry` | `(entry, rules) => EntryClassification` | exactly one、rule/reason必須、fallback other禁止 | `U-SCAP-020, U-SCAP-021` |
| `renderSourceCaptureBundle` | `(snapshot, refs, entries, classifications) => RenderedBundle` | canonical JSON/JSONL、全count/digestを再計算 | `U-SCAP-001, U-SCAP-002, U-SCAP-003, U-SCAP-023` |
| `planSourceCapture` | `(request, adapters, rules) => Promise<CapturePlan>` | read-only、既存artifact/DB差分を返す | `U-SCAP-023` |
| `commitSourceCapture` | `(plan, store, projection) => Promise<CaptureReceipt>` | artifact publish成功後だけDB transaction、partial current禁止 | `U-SCAP-022, U-SCAP-023` |
| `verifySourceCapture` | `(bundle, projection) => VerificationReport` |全bytes/count/FK/current pointerを再計算 | `U-SCAP-022, U-SCAP-023` |
| `activateSourceSnapshot` | `(report, pointerPort) => ActivationReceipt` | verified、classification complete、behavior flag falseを保持 | `U-SCAP-023` |
| `markSourceSnapshotStale` | `(snapshot, cause, eventPort) => StaleReceipt` | append-only cause、旧artifact不変 | `U-SCAP-022` |
| `resolveSourceCaptureAuthority` | `(expectedManifestDigest, request, store: TrustedSourceManifestAuthorityStore) => Promise<Result<AuthorizedSourceCaptureRequestV1, SourceCaptureFailure>>` | trusted current store receiptとmanifest digest、ZIP SHA、UT exact 5 commit/tree、HEAD/countを照合しcaller自己申告を拒否 | `U-SCAP-024` |
| `reconcileSourceCaptureProjection` | `(pending: ProjectionPendingReceiptV1, artifact: RenderedBundle, store: SourceCaptureProjectionStore) => Promise<Result<ProjectionReconcileReceiptV1, SourceCaptureFailure>>` | operation/idempotency、expected artifact/DB headをCASしseal済みbytesからだけ再投影 | `U-SCAP-025` |

### §1.1 HST011主系のAPI tuple

| HSTケース | API | 主U | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-011-01` | `verifySourceCapture` | `U-SCAP-023` | `coverage_ready` | `pair_freeze_ready` | `なし（正常系）` |
| `HST-CASE-011-02` | `probeSourceAdapter` | `U-SCAP-004` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-03` | `deriveGitOverlay` | `U-SCAP-011` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-04` | `enumerateSourceEntries` | `U-SCAP-016` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-05` | `activateSourceSnapshot` | `U-SCAP-023` | `coverage_pending` | `coverage_pending` | `HIL_SOURCE_DECISION_PENDING` |
| `HST-CASE-011-06` | `verifySourceCapture` | `U-SCAP-020` | `coverage_ready` | `coverage_failed` | `HIL_SOURCE_ATOM_ORPHAN` |
| `HST-CASE-011-07` | `verifySourceCapture` | `U-SCAP-021` | `coverage_ready` | `coverage_failed` | `HIL_SOURCE_REJECT_UNJUSTIFIED` |
| `HST-CASE-011-08` | `activateSourceSnapshot` | `U-SCAP-023` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-011-09` | `verifySourceCapture` | `U-SCAP-020` | `assertion_input_ready` | `assertion_pass` | `HIL_ASSET_DECISION_MISSING` |
| `HST-CASE-011-10` | `markSourceSnapshotStale` | `U-SCAP-022` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-11` | `classifySourceEntry` | `U-SCAP-020` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_COMPLETENESS_UNPROVEN` |

主要typeは`src/schema/source-capture.ts`を唯一の正本候補とする。

```ts
interface SourceCaptureRequest {
  schema_version: "source-capture-request.v1";
  family: "zip" | "git" | "current-head";
  local_source: string;
  revision: string;
  expected_identity: string;
  expected_entry_count: number;
  scope: string[];
}

interface CanonicalSourceSnapshotManifestV1 { manifest_digest: string; zip_archive_sha256: string; ut_refs: { ref: string; commit: string; tree: string }[]; current_head_commit: string; current_head_tree: string; expected_entry_counts: Record<"zip" | "git-main" | "git-overlay" | "current-head", number> }
interface AuthorizedSourceCaptureRequestV1 { request: SourceCaptureRequest; authority_manifest_digest: string; authority_binding_digest: string }
interface TrustedSourceManifestAuthorityStore { readCurrent(expectedManifestDigest: string): Promise<Result<{ manifest: CanonicalSourceSnapshotManifestV1; authority_receipt_digest: string; store_head: string }, SourceCaptureFailure>> }

interface SourceCaptureReceipt {
  schema_version: "source-capture-receipt.v1";
  snapshot_id: string;
  status: "committed" | "projection_pending" | "verified" | "active" | "failed" | "stale";
  entry_count: number;
  classification_count: number;
  behavior_atom_closed: false;
  artifact_root_digest: string;
  projection_digest: string | null;
  failure_codes: string[];
}
interface ProjectionPendingReceiptV1 { operation_id: string; operation_digest: string; idempotency_key: string; snapshot_id: string; expected_artifact_head: string; expected_db_head: string; artifact_root_digest: string; status: "projection_pending" }
interface ProjectionReconcileReceiptV1 { operation_id: string; artifact_head: string; before_db_head: string; after_db_head: string; event_sequence: number; counts: Record<string, { inserted: number; updated: number }>; status: "reconciled" }
interface SourceCaptureProjectionStore { reconcile(pending: ProjectionPendingReceiptV1, artifact: RenderedBundle): Promise<Result<ProjectionReconcileReceiptV1, SourceCaptureFailure>> }
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

全public APIは既知failureを`SourceCaptureFailure`のdiscriminated unionで返し、unknown exceptionは
`HSCAP_INTERNAL_ERROR`へcause digest付きで境界変換する。CLIは成功0、契約/検証failure 2、I/O failure 3、
internal failure 4とし、stdoutはschema準拠JSONだけ、診断はstderrへ出す。secret、remote credential、source本文を
receiptへ保存しない。
