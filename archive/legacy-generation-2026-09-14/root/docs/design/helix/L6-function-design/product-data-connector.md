---
title: "HELIX L6 機能設計 — product data connector"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-11
related_hst:
  - HST-HIL-010
related_l5: docs/design/helix/L5-detail/product-data-connector.md
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/test-design/helix/L6-product-data-connector-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-11
  - HAC-HIL-11a
  - HAC-HIL-11b
  - HAC-HIL-11c
---

# HELIX L6 機能設計 — product data connector

## §0 関数境界

pure functionはnetwork、credential store、DB、filesystem、clockを直接読まず、明示入力を判定する。connector/Python adapterは
observation/proposalを返すだけで、projection commitはNode portに限定する。外部認証・接続、credential解決、write-back APIは
本sliceに実装しない。

## §1 public APIとexact oracle

| API | signature | DbC／result | 対応するL7 oracle | HAC | HST exact case | failure token |
|---|---|---|---|---|---|---|
| `parseProductConnectorContract` | `(raw: unknown) => ResultV1<ProductConnectorContractV1, ProductDataFailureV1>` | strict field/version、read-only、credential reference、policyを要求 | `U-PDC-001` | `HAC-HIL-11b` | `HST-CASE-010-10` | `HIL_CONNECTOR_CONTRACT_INVALID` |
| `activateProductConnectorVersion` | `(bundle: ConnectorActivationBundleV1, store: ConnectorActivationStoreV1) => Promise<ResultV1<ConnectorActivationReceiptV1, ProductDataFailureV1>>` | operation/contract digest/expected registry head/idempotencyをNode CAS commitしactive最大1 | `U-PDC-002` | `HAC-HIL-11b` | `HST-CASE-010-10` | `HIL_CONNECTOR_CONTRACT_INVALID` |
| `reconcileProductConnectorActivation` | `(bundle: ConnectorActivationBundleV1, store: ConnectorActivationStoreV1) => Promise<ResultV1<ConnectorActivationReceiptV1, ProductDataFailureV1>>` | 同一activation evidence/operation/digest/headから専用reconcileし別evidenceを拒否 | `U-PDC-002` | `HAC-HIL-11b` | supporting activation fault oracle | `HIL_CONNECTOR_CONTRACT_INVALID` |
| `planProductFullSync` | `(contract, intent, lease) => ProductIngestionPlanV1` | cursorなし、全page、read-only、stable idempotency key | `U-PDC-003` | `HAC-HIL-11a` | `HST-CASE-010-01` | `なし（正常系）` |
| `planProductIncrementalSync` | `(contract, watermark, intent, lease) => ProductIngestionPlanV1` | current cursor/fenceを開始点へ固定 | `U-PDC-004` | `HAC-HIL-11a` | `HST-CASE-010-02` | `なし（正常系）` |
| `compareProductCursor` | `(codec, previous, candidate) => CursorOrderDecisionV1` | registered codecのみ、greater/equal/regressed/invalidを決定 | `U-PDC-005` | `HAC-HIL-11b` | `HST-CASE-010-07` | `HIL_PRODUCT_WATERMARK_REGRESSION` |
| `validateProductPageChain` | `(plan, pages, terminal) => ResultV1<ValidatedRecordSetV1, ProductDataFailureV1>` | page sequence、record key、cursor、content digest、終端exactly-one | `U-PDC-006` | `HAC-HIL-11a` | `HST-CASE-010-11` | `HIL_PRODUCT_INGESTION_INVALID` |
| `validateProductSourceSchema` | `(registered, observed, driftPolicy) => SchemaValidationDecisionV1` | field/type/nullability/enum/identity差分を全件分類 | `U-PDC-007` | `HAC-HIL-11b` | `HST-CASE-010-03` | `HIL_PRODUCT_SCHEMA_DRIFT` |
| `deriveCanonicalProductEntity` | `(record, mapping, source) => ResultV1<CanonicalEntityProposalV1, ProductDataFailureV1>` | stable ID、record key digest、mapping version、classification必須 | `U-PDC-008` | `HAC-HIL-11a` | `HST-CASE-010-09` | `HIL_PRODUCT_DATA_LINEAGE_MISSING` |
| `deriveProductMappingEdges` | `(entity, targets, mapping) => ResultV1<ProductMappingEdgeV1[], ProductDataFailureV1>` | target存在、kind/ID/version/evidence一意 | `U-PDC-009` | `HAC-HIL-11a` | `HST-CASE-010-09` | `HIL_PRODUCT_DATA_LINEAGE_MISSING` |
| `applyProductTombstone` | `(current, deletion, retention) => TombstoneDecisionV1` | 正常deleteは直前version/delete lineageを要求しmappingをstale化。未知/lineageなしはingestion反例 | `U-PDC-010` | `HAC-HIL-11c` | `HST-CASE-010-04`（正常） / `HST-CASE-010-11`（反例） | `なし（正常系）` / `HIL_PRODUCT_INGESTION_INVALID` |
| `evaluateProductDataRedaction` | `(ephemeralInput, classification, policy, ttl, nodeClock) => RedactionDecisionV1` | bounded ephemeralだけを受理し、pre-classification seal禁止、secret即時reject、終端/TTL削除receiptを要求 | `U-PDC-011` | `HAC-HIL-11b` | `HST-CASE-010-08` | `HIL_PRODUCT_REDACTION_REQUIRED` |
| `evaluateProductSnapshotFreshness` | `(sourceObservedAtUntrusted, nodeReceivedAt, nodeNow, sla, allowedSkew) => FreshnessDecisionV1` | Node trusted clockでfresh-untilを再導出し、未来/許容skew超過/期限超過をstaleまたはquarantine | `U-PDC-012` | `HAC-HIL-11c` | `HST-CASE-010-05` | `HIL_PRODUCT_SNAPSHOT_STALE` |
| `buildProductDataLineage` | `(contract, run, records, mapping, worker) => ResultV1<ProductLineageV1, ProductDataFailureV1>` | source→connector→run→cursor→schema→mapping→resultを完全結線 | `U-PDC-013` | `HAC-HIL-11a` | `HST-CASE-010-09` | `HIL_PRODUCT_DATA_LINEAGE_MISSING` |
| `validateProductWorkerProposal` | `(run, staged, authority) => ResultV1<ValidatedProductProposalV1, ProductDataFailureV1>` | complete/schema/provenance/current fenceを検証し、proposal-onlyかつdirect write 0を要求 | `U-PDC-014` | `HAC-HIL-11b` | `HST-CASE-010-06` | `HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN` |
| `planProductProjectionTransaction` | `(current, snapshot, entities, mappings, tombstones, watermark) => ProjectionTransactionPlanV1` | 正常系は全stepを一計画へ閉じ、欠落stepはingestion反例として拒否 | `U-PDC-015` | `HAC-HIL-11a`, `HAC-HIL-11c` | `HST-CASE-010-01`（正常） / `HST-CASE-010-11`（反例） | `なし（正常系）` / `HIL_PRODUCT_INGESTION_INVALID` |
| `commitProductProjection` | `(bundle: ProductProjectionCommitBundleV1, nodePort: ProductProjectionNodePortV1, store: ProductProjectionStoreV1) => Promise<ResultV1<ProductProjectionCommitReceiptV1, ProductDataFailureV1>>` | Node portはadapterとして唯一write authorityのstoreへ一回だけ委譲。同key同digest一回、異digest/CAS/failure増分0 | `U-PDC-016` | `HAC-HIL-11a`, `HAC-HIL-11b` | `HST-CASE-010-07` | `HIL_PRODUCT_WATERMARK_REGRESSION` |
| `evaluateProductDataPolicy` | `(projection, contextRequest, policy, freshness) => ProductDataPolicyDecisionV1` | classification/redaction/retention/freshness/context allowlist全件評価 | `U-PDC-017` | `HAC-HIL-11b`, `HAC-HIL-11c` | `HST-CASE-010-12` | `HIL_PRODUCT_DATA_POLICY_VIOLATION` |
| `buildProductQuarantineItem` | `(failure, scope, evidence, policy) => ResultV1<ProductQuarantineItemV1, ProductDataFailureV1>` | redacted fingerprint、owner、expiry、release条件必須、raw payload禁止 | `U-PDC-018` | `HAC-HIL-11b` | `HST-CASE-010-11` | `HIL_PRODUCT_INGESTION_INVALID` |
| `reconcileProductProjection` | `(bundle: ProductProjectionCommitBundleV1, nodePort: ProductProjectionNodePortV1, store: ProductProjectionStoreV1) => Promise<ResultV1<ProductProjectionCommitReceiptV1, ProductDataFailureV1>>` | adapterから唯一write authorityへ一回だけ委譲し、同一operation/digest/expected snapshot-watermark-DB headでseal後DB faultを収束 | `U-PDC-019` | `HAC-HIL-11a`, `HAC-HIL-11b` | supporting fault oracle | `HIL_PRODUCT_INGESTION_INVALID` |
| `deriveFullSyncDisappearances` | `(priorSnapshot, completeFullResult) => ResultV1<TombstoneProposalV1[], ProductDataFailureV1>` | full完了時だけrecord-key集合差分をtombstone＋mapping staleへ変換 | `U-PDC-020` | `HAC-HIL-11a`, `HAC-HIL-11c` | supporting disappearance oracle | `HIL_PRODUCT_INGESTION_INVALID` |

`U-PDC-002`は`activateProductConnectorVersion` → `reconcileProductConnectorActivation`のstable順exact function setを持つ
activation commit/reconcile protocolである。activate固有mutationはregistry event、旧active stale、新pointer、append order、terminal receipt、
expected headとCAS、reconcile固有mutationはsealed activation evidence、operation/digest/head、pending receipt、別evidence再送である。
初回commitとseal後faultからの収束を同じactivation identityで採点するため一つのcanonical Uとし、別Uは追加しない。

## §2 schema

```ts
type ResultV1<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
type ProductSyncModeV1 = "full" | "incremental";

interface ProductConnectorContractV1 {
  schema_version: "helix-product-connector.v1";
  product_source_id: string;
  source_kind: string;
  external_identity_digest: string;
  connector_id: string;
  connector_version: string;
  source_schema_version: string;
  canonical_mapping_version: string;
  credential_reference: string;
  classification: string;
  read_write_policy: "read-only";
  sync_modes: ProductSyncModeV1[];
  freshness_sla_ms: number;
  retention_policy_id: string;
  redaction_policy_id: string;
  quarantine_route_id: string;
  owner: string;
  config_digest: string;
}

interface CursorOrderDecisionV1 { codec_version: string; codec_digest: string; previous_cursor_digest: string | null; candidate_cursor_digest: string; order: "greater" | "equal" | "regressed" | "invalid"; decision_digest: string }
interface ValidatedRecordSetV1 { operation_id: string; page_count: number; record_count: number; record_key_set_digest: string; page_chain_digest: string; cursor_end: string; terminal_count: 1; result_set_digest: string }
interface SchemaValidationDecisionV1 { registered_schema_digest: string; observed_schema_digest: string; drift_policy_digest: string; findings: { field_path_digest: string; kind: "added" | "removed" | "type" | "nullability" | "enum" | "identity"; evidence_digest: string }[]; pass: boolean; quarantine: boolean; decision_digest: string }
interface CanonicalEntityProposalV1 { entity_id: string; entity_version: number; source_id: string; run_id: string; record_key_digest: string; mapping_version: string; classification: string; redacted_payload_digest: string; lineage_digest: string; proposal_only: true; proposal_digest: string }
interface TombstoneProposalV1 { entity_id: string; previous_entity_version: number; record_key_digest: string; deletion_kind: "source_delete_event" | "full_sync_disappearance"; deletion_lineage_digest: string; stale_mapping_ids: string[]; proposal_only: true; proposal_digest: string }
interface TombstoneDecisionV1 { accepted: boolean; proposal: TombstoneProposalV1 | null; failure_code: ProductDataFailureCodeV1 | null; authoritative_mutation_count: 0; decision_digest: string }
interface RedactionDecisionV1 { classification: string; policy_digest: string; accepted_field_path_digests: string[]; rejected_field_path_digests: string[]; ephemeral_delete_receipt_digest: string | null; persistent_raw_value_count: 0; pass: boolean; decision_digest: string }
interface FreshnessDecisionV1 { source_observed_at_untrusted: string; node_received_at: string; captured_at: string; fresh_until: string; trusted_clock_receipt_digest: string; state: "fresh" | "stale" | "quarantined"; query_allowed: boolean; decision_digest: string }
interface ProductLineageV1 { product_source_id: string; connector_version_id: string; ingestion_run_id: string; cursor_digest: string; source_schema_digest: string; mapping_digest: string; worker_result_digest: string; ordered_edge_digests: string[]; lineage_digest: string }
interface ValidatedProductProposalV1 { ingestion_run_id: string; lease_id: string; fence_token: string; schema_digest: string; lineage_digest: string; result_set_digest: string; proposal_digest: string; complete: true; proposal_only: true; authoritative_write_count: 0 }
interface ProjectionTransactionPlanV1 { operation_id: string; expected_snapshot_head: string; expected_watermark_head: string; expected_db_head: string; snapshot: CanonicalProductSnapshotProposalV1; entity_digests: string[]; mapping_digests: string[]; tombstone_digests: string[]; watermark_digest: string; ordered_steps: ["entities", "prior_state", "tombstones", "snapshot", "watermark", "event_receipt"]; exact_write_set_digest: string; transaction_digest: string }
interface ProductDataPolicyDecisionV1 { projection_digest: string; context_request_digest: string; classification_pass: boolean; redaction_pass: boolean; retention_pass: boolean; freshness_pass: boolean; allowed_field_path_digests: string[]; denied_field_path_digests: string[]; publish_allowed: boolean; decision_digest: string }
interface ProductQuarantineItemV1 { quarantine_item_id: string; product_source_id: string; ingestion_run_id: string; snapshot_id: string | null; failure_code: ProductDataFailureCodeV1; redacted_fingerprint: string; evidence_digest: string; owner: string; expires_at: string; release_condition_digest: string; raw_payload_count: 0; item_digest: string }

interface ProductIngestionPlanV1 {
  schema_version: "helix-product-ingestion-plan.v1";
  operation_id: string;
  idempotency_key: string;
  product_source_id: string;
  connector_version_id: string;
  mode: ProductSyncModeV1;
  cursor_start: string | null;
  intent_digest: string;
  source_schema_version: string;
  mapping_version: string;
  classification: string;
  lease_id: string;
  fence_token: string;
  read_only: true;
}

interface CanonicalProductSnapshotProposalV1 {
  schema_version: "helix-product-snapshot-proposal.v1";
  product_source_id: string;
  connector_version_id: string;
  ingestion_run_id: string;
  mode: ProductSyncModeV1;
  cursor_start: string | null;
  cursor_end: string;
  source_schema_version: string;
  mapping_version: string;
  classification: string;
  source_observed_at_untrusted: string;
  source_content_digest: string;
  result_set_digest: string;
  entity_count: number;
  tombstone_count: number;
  proposal_only: true;
}

interface ProductProjectionCommitReceiptV1 {
  schema_version: "helix-product-projection-receipt.v1";
  operation_id: string;
  operation_digest: string;
  idempotency_key: string;
  product_source_id: string;
  ingestion_run_id: string;
  snapshot_id: string;
  previous_snapshot_id: string | null;
  cursor_start: string | null;
  cursor_end: string;
  before_heads: { db: string; snapshot: string; watermark: string };
  after_heads: { db: string; snapshot: string; watermark: string };
  status: "committed" | "projection_pending";
  node_received_at: string;
  captured_at: string;
  fresh_until: string;
  trusted_clock_receipt_digest: string;
  entity_insert_count: number;
  mapping_insert_count: number;
  tombstone_count: number;
  stale_mapping_count: number;
  watermark_updated: boolean;
  node_authority: true;
  transaction_digest: string;
  event_chain_digest: string;
  write_set_digest: string;
  action_counts: Record<string, number>;
  failure_codes: ProductDataFailureCodeV1[];
}

interface ConnectorRegistryEventV1 { event_id: string; operation_id: string; sequence: number; event_type: "connector_version_activated" | "connector_version_staled" | "activation_pending"; version_id: string; payload_digest: string; previous_event_head: string; event_head: string }
interface ConnectorActivationBundleV1 { operation_id: string; operation_digest: string; idempotency_key: string; contract_digest: string; activation_evidence_digest: string; expected_registry_head: string; candidate_version_id: string; previous_active_version_id: string | null; stale_previous_active: boolean; new_active_pointer: { version_id: string; contract_digest: string }; registry_events: ConnectorRegistryEventV1[]; terminal_receipt_payload_digest: string; exact_write_set: { table: string; key: string; action: "insert" | "update" }[]; append_order: ["version_insert", "registry_event", "old_active_stale", "new_active_pointer", "terminal_receipt"]; write_set_digest: string }
interface ConnectorActivationReceiptV1 { operation_id: string; operation_digest: string; before_registry_head: string; after_registry_head: string; active_version_id: string; activation_evidence_digest: string; status: "active" | "reconcile_pending"; write_set_digest: string; action_counts: Record<string, number> }
interface ConnectorActivationStoreV1 { commitActivation(bundle: ConnectorActivationBundleV1): Promise<ResultV1<ConnectorActivationReceiptV1, ProductDataFailureV1>>; reconcileActivationEvidence(bundle: ConnectorActivationBundleV1): Promise<ResultV1<ConnectorActivationReceiptV1, ProductDataFailureV1>>; findActivationReceipt(operationId: string): Promise<ConnectorActivationReceiptV1 | null> }
interface ProductProjectionCommitBundleV1 { operation_id: string; operation_digest: string; idempotency_key: string; projection_digest: string; sealed_artifact_digest: string; expected_snapshot_head: string; expected_watermark_head: string; expected_db_head: string; entities: CanonicalProductEntityVersionV1[]; mappings: ProductMappingEdgeV1[]; tombstones: ProductTombstoneV1[]; watermark: ProductWatermarkAdvanceV1; events: ProductIngestionEventV1[]; exact_write_set: { table: string; key: string; action: "insert" | "update" }[]; write_set_digest: string }
interface ProductProjectionNodePortV1 {
  authority_mode: "delegate_only";
  commitProjection(bundle: ProductProjectionCommitBundleV1, authority: ProductProjectionStoreV1): Promise<ResultV1<ProductProjectionCommitReceiptV1, ProductDataFailureV1>>;
  reconcileProjection(bundle: ProductProjectionCommitBundleV1, authority: ProductProjectionStoreV1): Promise<ResultV1<ProductProjectionCommitReceiptV1, ProductDataFailureV1>>;
  findProjectionReceipt(operationId: string, authority: ProductProjectionStoreV1): Promise<ProductProjectionCommitReceiptV1 | null>;
}

type ProductDataFailureCodeV1 =
  | "HIL_CONNECTOR_CONTRACT_INVALID"
  | "HIL_PRODUCT_CONNECTOR_DISABLED"
  | "HIL_PRODUCT_DATA_LINEAGE_MISSING"
  | "HIL_PRODUCT_DATA_POLICY_VIOLATION"
  | "HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN"
  | "HIL_PRODUCT_IDEMPOTENCY_CONFLICT"
  | "HIL_PRODUCT_INGESTION_INVALID"
  | "HIL_PRODUCT_PROJECTION_INVALID"
  | "HIL_PRODUCT_REDACTION_REQUIRED"
  | "HIL_PRODUCT_RETENTION_REQUIRED"
  | "HIL_PRODUCT_SCHEMA_DRIFT"
  | "HIL_PRODUCT_SNAPSHOT_STALE"
  | "HIL_PRODUCT_SOURCE_READ_ONLY_VIOLATION"
  | "HIL_PRODUCT_TOMBSTONE_INVALID"
  | "HIL_PRODUCT_WATERMARK_REGRESSION"
  | "HIL_PYTHON_AUTHORITY_BYPASS";
interface ProductDataFailureV1 { code: ProductDataFailureCodeV1; evidence_digest: string; cause_code: string | null }
```

raw product inputはbounded ephemeral領域だけに置き、classification/redaction前のpersistent sealを禁止する。projection schemaは
raw product payload、credential値、未redact PII/secretをfieldとして持たない。cursorはopaque valueとして保存できるが、比較は
connector codecのversionとdigestへbindする。`source_observed_at_untrusted`は非権威的observationであり、Node trusted clock receiptの
`node_received_at`から`captured_at`と`fresh_until`を再導出する。これらの時刻をentity identityやcontent determinism digestへ混入させない。

## §3 state、不変条件、idempotency

許可stateはL5 §3だけとし、`completed/failed/quarantined/cancelled`から遷移しない。

1. sourceごとのcurrent snapshotは最大1件。
2. `completed -> node_commit AND watermark_updated AND current_snapshot_count == 1`。
3. `failed|quarantined|cancelled -> authoritative_increment_count == 0`。
4. `python_authoritative_write_count == 0`、`connector_write_back_count == 0`。
5. watermark更新は旧snapshot、旧cursor、current fenceのCAS成功後だけ。
6. 同じidempotency key＋同digestは同receipt、異digestはcommit 0。
7. tombstoned entityのactive mappingは0。
8. stale/quarantined snapshotのquery/context返却は0。

## §4 実装配置候補

| path候補 | 責務 |
|---|---|
| `src/schema/product-data.ts` | connector、run、snapshot、entity、mapping、watermark、quarantine、failure型 |
| `src/product-data/connector-registry.ts` | versioned contractとactive revision解決 |
| `src/product-data/ingestion-planner.ts` | full/incremental plan、idempotency、cursor codecを管理 |
| `src/product-data/schema-validator.ts` | source schema drift判定 |
| `src/product-data/canonical-mapper.ts` | entity、mapping、tombstone proposalのpure変換 |
| `src/product-data/lineage.ts` | lineage graphとdigest検証 |
| `src/product-data/policy.ts` | classification、redaction、retention、freshness、context allowlistを判定 |
| `src/product-data/python-worker-adapter.ts` | 共通Python brokerへのconsumer request/result schema adapter |
| `src/product-data/projection-transaction.ts` | Node transaction plan、watermark CAS、idempotencyを管理 |
| `src/state-db/product-data-projection.ts` | L4の9 table projection、query、rebuild |

connector固有SDK、credential解決、network I/Oは`ProductDataReadConnectorPort`の外部adapter責務であり、本sliceには追加しない。
consumerはPython process、SQLite driver、credential storeを直接importしない。

## §5 failure、CLI、WBSの規律

`ProductDataFailureCodeV1`はquartetで参照する16 tokenのclosed unionとし、Python runtimeの詳細causeもreceiptに保持する。未知例外は
`HIL_PRODUCT_PROJECTION_INVALID`へcause digest付きで境界変換し、schema/policy/authorityの具体failureを丸めない。

CLI候補は成功0、contract/policy failure 2、adapter/I/O failure 3、internal/reconciliation failure 4とする。stdoutはschema JSON、
stderrは診断、evidenceは双方のdigestだけを保存する。

実装順は、(1) schema/failure、(2) registry/full/incremental/cursor、(3) schema/mapping/tombstone、(4) lineage/redaction/freshness、
(5) Python proposal adapter、(6) Node transaction/CAS/idempotency、(7) quarantine/query/reconcile、(8) L7 20件、L8 14件、
HST-HIL-010、別runtime reviewとする。本書はdraftであり、外部connector接続や実装完了を主張しない。

## primary atomic assertion台帳

supporting caseを混入させず、正本primary caseをrangeなしで主IT/Uへ結線する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 | U結線 |
|---|---|---|---|---|---|
| `HST-CASE-010-01` | `claimed` | `completed` | `なし（正常系）` | `IT-PDC-001` | `U-PDC-003`, `U-PDC-015` |
| `HST-CASE-010-02` | `claimed` | `completed` | `なし（正常系）` | `IT-PDC-002` | `U-PDC-004` |
| `HST-CASE-010-03` | `validating` | `quarantined` | `HIL_PRODUCT_SCHEMA_DRIFT` | `IT-PDC-003` | `U-PDC-007` |
| `HST-CASE-010-04` | `validating` | `completed` | `なし（正常系）` | `IT-PDC-004` | `U-PDC-010` |
| `HST-CASE-010-05` | `current` | `stale` | `HIL_PRODUCT_SNAPSHOT_STALE` | `IT-PDC-005` | `U-PDC-012` |
| `HST-CASE-010-06` | `fetching` | `quarantined` | `HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN` | `IT-PDC-006` | `U-PDC-014` |
| `HST-CASE-010-07` | `committing` | `failed` | `HIL_PRODUCT_WATERMARK_REGRESSION` | `IT-PDC-007` | `U-PDC-005`, `U-PDC-016` |
| `HST-CASE-010-08` | `staged` | `quarantined` | `HIL_PRODUCT_REDACTION_REQUIRED` | `IT-PDC-008` | `U-PDC-011` |
| `HST-CASE-010-09` | `assertion_input_ready` | `assertion_pass` | `HIL_PRODUCT_DATA_LINEAGE_MISSING` | `IT-PDC-009` | `U-PDC-008`, `U-PDC-009`, `U-PDC-013` |
| `HST-CASE-010-10` | `assertion_input_ready` | `assertion_pass` | `HIL_CONNECTOR_CONTRACT_INVALID` | `IT-PDC-010` | `U-PDC-001`, `U-PDC-002` |
| `HST-CASE-010-11` | `assertion_input_ready` | `assertion_pass` | `HIL_PRODUCT_INGESTION_INVALID` | `IT-PDC-004`, `IT-PDC-011` | `U-PDC-006`, `U-PDC-010`, `U-PDC-015`, `U-PDC-018` |
| `HST-CASE-010-12` | `assertion_input_ready` | `assertion_pass` | `HIL_PRODUCT_DATA_POLICY_VIOLATION` | `IT-PDC-012` | `U-PDC-017` |

## projection完全schemaとstore DbC

```ts
interface CanonicalProductEntityVersionV1 { entity_id: string; entity_version: number; source_id: string; source_snapshot_id: string; run_id: string; record_key_digest: string; schema_version: string; mapping_version: string; classification: string; redacted_payload_digest: string; lineage_digest: string; status: "current" | "superseded" | "tombstoned" | "stale" }
interface ProductMappingEdgeV1 { mapping_id: string; revision: number; source_entity_id: string; source_entity_version: number; relation: string; target_kind: string; target_id: string; target_digest: string; mapping_version: string; evidence_digest: string; status: "current" | "stale" }
interface ProductTombstoneV1 { tombstone_id: string; entity_id: string; previous_entity_version: number; record_key_digest: string; deletion_kind: "source_delete_event" | "full_sync_disappearance"; deletion_lineage_digest: string; stale_mapping_ids: string[] }
interface ProductWatermarkAdvanceV1 { source_id: string; run_id: string; before_cursor: string | null; after_cursor: string; expected_watermark_head: string; page_chain_digest: string; projection_digest: string; is_last_authoritative_write: true }
interface ProductIngestionEventV1 { event_id: string; operation_id: string; sequence: number; event_type: "projection_committed" | "projection_pending" | "projection_reconciled"; payload_digest: string; previous_event_head: string; event_head: string }
interface ProductProjectionStoreV1 {
  write_authority: "product_projection_store";
  commitAuthoritative(bundle: ProductProjectionCommitBundleV1): Promise<ResultV1<ProductProjectionCommitReceiptV1, ProductDataFailureV1>>;
  reconcileAuthoritative(bundle: ProductProjectionCommitBundleV1): Promise<ResultV1<ProductProjectionCommitReceiptV1, ProductDataFailureV1>>;
  findReceiptAuthoritative(operationId: string): Promise<ProductProjectionCommitReceiptV1 | null>;
  readCurrent(sourceId: string, expectedDbHead: string): Promise<ResultV1<{ entities: CanonicalProductEntityVersionV1[]; mappings: ProductMappingEdgeV1[]; watermark: ProductWatermarkAdvanceV1; event_head: string }, ProductDataFailureV1>>;
}
```

`ProductProjectionStoreV1`だけがprojection row/event/watermark/receiptのwrite authorityである。`ProductProjectionNodePortV1`は
process/runtime境界のadapterであり、自身のstorageやtransactionを持たず、受け取った同一bundleをstoreの対応する
`*Authoritative` methodへexactly-once委譲する。adapterとstoreの両方がwriteする実装、別bundleへの変換、二重commitを禁止する。
storeはfull-sync completion、prior/new exact set、tombstone対象mapping exact set、watermark最終writeを再導出する。caller digest、incremental disappearance、mapping一部stale、watermark先行、stale/CAS/faultは全増分0とする。
