---
title: "HELIX L7 単体テスト設計 — product data connector"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-11
related_hst:
  - HST-HIL-010
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/design/helix/L6-function-design/product-data-connector.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-11
  - HAC-HIL-11a
  - HAC-HIL-11b
  - HAC-HIL-11c
---

# HELIX L7 単体テスト設計 — product data connector

| ID | exact function | 反例と期待結果 | HAC | HST exact case | failure token | test参照先 |
|---|---|---|---|---|---|---|
| `U-PDC-001` | `parseProductConnectorContract` | 必須field/version/policy/reference欠落、credential本文、write policyを拒否 | `HAC-HIL-11b` | `HST-CASE-010-10` | `HIL_CONNECTOR_CONTRACT_INVALID` | `tests/product-connector-registry.test.ts` |
| `U-PDC-002` | composition/commit protocol: `activateProductConnectorVersion` → `reconcileProductConnectorActivation` | activate固有mutationとしてregistry event、旧active stale、新pointer、append order、terminal receipt、expected head/CASを各欠落・swapする。reconcile固有mutationとしてsealed activation evidence、operation/digest/head、pending receipt、別evidence再送を改変する。同じactivation identityの初回commitとseal後fault収束を一件として採点し、全反例でactive/pointer/receipt増分0 | `HAC-HIL-11b` | `HST-CASE-010-10`＋supporting activation fault oracle | `HIL_CONNECTOR_CONTRACT_INVALID` | `tests/product-connector-registry.test.ts` |
| `U-PDC-003` | `planProductFullSync` | read-only全page planとstable keyを返し正常planを確定 | `HAC-HIL-11a` | `HST-CASE-010-01` | `なし（正常系）` | `tests/product-ingestion-planner.test.ts` |
| `U-PDC-004` | `planProductIncrementalSync` | current watermark/fenceを固定し正常planを確定 | `HAC-HIL-11a` | `HST-CASE-010-02` | `なし（正常系）` | `tests/product-ingestion-planner.test.ts` |
| `U-PDC-005` | `compareProductCursor` | greater/equal/regressed/invalidとcodec version mismatchを決定的判定 | `HAC-HIL-11b` | `HST-CASE-010-07` | `HIL_PRODUCT_WATERMARK_REGRESSION` | `tests/product-cursor.test.ts` |
| `U-PDC-006` | `validateProductPageChain` | 欠番、重複record、終端欠落、page cursor不整合を全run failureにする | `HAC-HIL-11a` | `HST-CASE-010-11` | `HIL_PRODUCT_INGESTION_INVALID` | `tests/product-page-chain.test.ts` |
| `U-PDC-007` | `validateProductSourceSchema` | field追加/削除、型/nullability/enum/identity driftを個別finding化しcurrent 0 | `HAC-HIL-11b` | `HST-CASE-010-03` | `HIL_PRODUCT_SCHEMA_DRIFT` | `tests/product-schema-validator.test.ts` |
| `U-PDC-008` | `deriveCanonicalProductEntity` | 取得順非依存ID、redacted field、record/mapping lineageを要求 | `HAC-HIL-11a` | `HST-CASE-010-09` | `HIL_PRODUCT_DATA_LINEAGE_MISSING` | `tests/product-canonical-mapper.test.ts` |
| `U-PDC-009` | `deriveProductMappingEdges` | target欠落、重複edge、mapping version/evidence欠落を拒否 | `HAC-HIL-11a` | `HST-CASE-010-09` | `HIL_PRODUCT_DATA_LINEAGE_MISSING` | `tests/product-canonical-mapper.test.ts` |
| `U-PDC-010` | `applyProductTombstone` | 正常deleteはtombstone＋mapping stale、未知/lineageなしdeleteはingestion反例として更新0 | `HAC-HIL-11c` | `HST-CASE-010-04`（正常） / `HST-CASE-010-11`（反例） | `なし（正常系）` / `HIL_PRODUCT_INGESTION_INVALID` | `tests/product-tombstone.test.ts` |
| `U-PDC-011` | `evaluateProductDataRedaction` | bounded ephemeralだけを受理し、pre-classification seal 0、secret即時reject、終端/TTL削除receipt、evidence raw値0 | `HAC-HIL-11b` | `HST-CASE-010-08` | `HIL_PRODUCT_REDACTION_REQUIRED` | `tests/product-data-policy.test.ts` |
| `U-PDC-012` | `evaluateProductSnapshotFreshness` | Node trusted clockで再導出し、SLA境界、worker未来時刻、許容skew超過をstaleまたはquarantineしてquery 0 | `HAC-HIL-11c` | `HST-CASE-010-05` | `HIL_PRODUCT_SNAPSHOT_STALE` | `tests/product-data-policy.test.ts` |
| `U-PDC-013` | `buildProductDataLineage` | source/connector/run/cursor/schema/mapping/workerを一つずつ欠落させ全て拒否 | `HAC-HIL-11a` | `HST-CASE-010-09` | `HIL_PRODUCT_DATA_LINEAGE_MISSING` | `tests/product-data-lineage.test.ts` |
| `U-PDC-014` | `validateProductWorkerProposal` | partial/late/schema違反/direct write proposalをquarantineしauthoritative増分0 | `HAC-HIL-11b` | `HST-CASE-010-06` | `HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN` | `tests/product-worker-proposal.test.ts` |
| `U-PDC-015` | `planProductProjectionTransaction` | 正常系は全stepを不可分計画にし、欠落stepはingestion反例として拒否 | `HAC-HIL-11a`, `HAC-HIL-11c` | `HST-CASE-010-01`（正常） / `HST-CASE-010-11`（反例） | `なし（正常系）` / `HIL_PRODUCT_INGESTION_INVALID` | `tests/product-projection-transaction.test.ts` |
| `U-PDC-016` | `commitProductProjection` | delegate-only NodePortが同一bundleをwrite-authority storeの`commitAuthoritative`へexactly-once委譲し、adapter独自write/二重commit/別bundleを拒否。receiptのoperation/idempotency、before/after heads、status、write-set、action countも再導出 | `HAC-HIL-11a`, `HAC-HIL-11b` | `HST-CASE-010-07` | `HIL_PRODUCT_WATERMARK_REGRESSION` | `tests/product-projection-transaction.test.ts` |
| `U-PDC-017` | `evaluateProductDataPolicy` | classification/redaction/retention/freshness/context allowlistの各違反を公開0にする | `HAC-HIL-11b`, `HAC-HIL-11c` | `HST-CASE-010-12` | `HIL_PRODUCT_DATA_POLICY_VIOLATION` | `tests/product-data-policy.test.ts` |
| `U-PDC-018` | `buildProductQuarantineItem` | owner/expiry/release/evidence欠落とraw payloadを拒否しredacted fingerprintだけ保存 | `HAC-HIL-11b` | `HST-CASE-010-11` | `HIL_PRODUCT_INGESTION_INVALID` | `tests/product-quarantine.test.ts` |
| `U-PDC-019` | `reconcileProductProjection` | delegate-only NodePortが同一bundleを唯一storeの`reconcileAuthoritative`へexactly-once委譲。adapter独自write/二重reconcileを拒否し、projection_pending receipt、payload/head/action count swap、別digest、CAS競合も拒否 | `HAC-HIL-11a`, `HAC-HIL-11b` | supporting fault oracle | `HIL_PRODUCT_INGESTION_INVALID` | `tests/product-projection-transaction.test.ts` |
| `U-PDC-020` | `deriveFullSyncDisappearances` | prior/new record-key集合差分をfull終端時だけtombstone＋mapping staleへ変換しincremental未出現を無視 | `HAC-HIL-11a`, `HAC-HIL-11c` | supporting disappearance oracle | `HIL_PRODUCT_INGESTION_INVALID` | `tests/product-tombstone.test.ts` |

## §1 合否

`U-PDC-001`、`U-PDC-002`、`U-PDC-003`、`U-PDC-004`、`U-PDC-005`、`U-PDC-006`、`U-PDC-007`、
`U-PDC-008`、`U-PDC-009`、`U-PDC-010`、`U-PDC-011`、`U-PDC-012`、`U-PDC-013`、`U-PDC-014`、
`U-PDC-015`、`U-PDC-016`、`U-PDC-017`、`U-PDC-018`、`U-PDC-019`、`U-PDC-020`の20件すべてでRed/Green、exact HAC/HST/failure token、
state/result digest、authoritative/network/write countを保存する。pure testは外部接続せず、fixture observationを注入する。

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

`U-PDC-019`/`U-PDC-020`は5型の全FK/digest/statusをmutationし、full-sync disappearance限定、全mapping exact stale、watermark last、event chain、exact write-setをassertする。caller digest偽装、payload swap、incremental未出現、stale/CAS/store faultはwrite count 0とする。
