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

## §2 schema

```ts
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
    trigger: unknown[];
    inputs: unknown[];
    outputs: unknown[];
    effects: unknown[];
    failures: unknown[];
    state_transitions: unknown[];
    observables: unknown[];
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

type CapabilityDecision = "adopt" | "harden" | "redesign" | "reject" | "absorbed" | "pending";
type AtomKind = "behavior" | "regression_fixture" | "evidence_only" | "duplicate_alias";

interface AtomizationProjectionCommitBundleV1 { operation_id: string; operation_digest: string; idempotency_key: string; bundle_digest: string; expected_artifact_head: string; expected_db_head: string; expected_active_head: string; atoms: SourceAtomV1[]; decisions: CapabilityDecisionRevisionV1[]; edges: CapabilityCoverageEdgeV1[]; events: AtomizationEventV1[]; projection: AtomizationProjectionV1; exact_write_set: { table: string; key: string; action: "insert" | "update" }[]; append_order: ["artifact_seal", "event_append", "projection", "active_pointer", "terminal_receipt"]; write_set_digest: string }
interface AtomizationProjectionCommitReceiptV1 { operation_id: string; operation_digest: string; bundle_digest: string; before_heads: { artifact: string; db: string; active: string }; after_heads: { artifact: string; db: string; active: string }; status: "committed" | "projection_pending"; event_sequence: number; write_set_digest: string; action_counts: Record<string, number> }
interface SourceAtomizationFailure { code: SourceAtomizationFailureCode; evidence_digest: string; cause_code: string | null }
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
type SourceAtomizationFailureCode =
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
interface SourceAtomV1 { schema_version: "helix-source-atom.v1"; atom_id: string; revision: number; source_snapshot_id: string; entry_id: string; source_span_digest: string; atom_kind: AtomKind; semantic_ir_digest: string; semantic_signature: string; coverage_weight: 0 | 1; fixture_producer_atom_id: string | null; fixture_assertion_id: string | null; canonical_bytes_digest: string }
interface CapabilityDecisionRevisionV1 { atom_id: string; decision_revision: number; decision: CapabilityDecision; evidence_digests: string[]; reviewer_authority_receipt_id: string; absorbed_into_atom_id: string | null; current: boolean; supersedes_revision: number | null; canonical_bytes_digest: string }
interface CapabilityCoverageEdgeV1 { edge_id: string; revision: number; source_kind: "decision" | "requirement" | "design" | "assertion"; source_id: string; source_digest: string; relation: "satisfies" | "refines" | "verifies" | "rejects" | "absorbed_into" | "derived_from" | "paired_with" | "gates" | "supersedes"; target_kind: "requirement" | "non_goal" | "design" | "assertion" | "gate" | "atom"; target_id: string; target_digest: string; status: "current" | "stale"; canonical_bytes_digest: string }
interface AtomizationEventV1 { event_id: string; operation_id: string; sequence: number; event_type: "bundle_committed" | "projection_pending" | "projection_reconciled" | "bundle_activated" | "receipt_invalidated"; aggregate_id: string; payload_digest: string; previous_event_head: string; event_head: string }
interface AtomizationProjectionV1 { projection_revision: number; event_head: string; atom_root_digest: string; decision_root_digest: string; edge_root_digest: string; active_bundle_digest: string | null; source_snapshot_id: string; source_snapshot_digest: string }
interface AtomizationProjectionStore {
  commit(bundle: AtomizationProjectionCommitBundleV1): Promise<Result<AtomizationProjectionCommitReceiptV1, SourceAtomizationFailure>>;
  reconcile(bundle: AtomizationProjectionCommitBundleV1): Promise<Result<AtomizationProjectionCommitReceiptV1, SourceAtomizationFailure>>;
  readCurrent(expectedDbHead: string): Promise<Result<AtomizationProjectionV1, SourceAtomizationFailure>>;
  findReceipt(operationId: string): Promise<AtomizationProjectionCommitReceiptV1 | null>;
}
```

storeはcanonical bytesから全ID/digest、coverage weight、absorbed target、FK、expected head、event chain、exact write-setを再計算する。caller提示digest/countをauthorityにせず、payload swap、stale revision、CAS競合、各append faultではauthoritative増分0とする。
