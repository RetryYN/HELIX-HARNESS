---
title: "HELIX L5 詳細設計 — product data connector"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-11
related_hst:
  - HST-HIL-010
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/test-design/helix/L5-product-data-connector-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-11
  - HAC-HIL-11a
  - HAC-HIL-11b
  - HAC-HIL-11c
  - HIL-BR-15
  - HIL-FR-23
  - HIL-FR-24
  - HIL-TR-09
  - HIL-NFR-17
---

# HELIX L5 詳細設計 — product data connector

## §0 適用境界

本書はversioned read connectorからproduct dataをfull/incremental取得し、lineage、schema、freshness、classification、
redactionを検証したcanonical snapshot/entity/mapping/watermarkへ投影する契約を定義する。外部service、product DB、
credential storeへの実接続、認証設定、token取得、write-backは行わない。fixtureとinjected portによるcontract設計だけを扱う。

既定はread-onlyである。product側write-backは別Issue、Universal Reverse、security review、action-binding approvalを備えた
別設計が承認されるまでNode/Python双方から拒否する。connectorのgreen、Python workerの完了、raw snapshotの取得だけを
current projectionの完了証拠にしない。

## §1 componentとauthority

| component | 責務 | authority | 禁止 |
|---|---|---|---|
| `ProductDataConnectorRegistry` | source、connector/schema/mapping version、credential reference、classification、sync/read-write policy、owner、freshness/retentionを管理 | Node registry event | credential値保存、不明version、write権限の暗黙付与 |
| `ProductDataIngestionCoordinator` | full/incremental run、lease/fence、state、idempotency、checkpointを順序制御 | run event | connector固有mapping、Python結果の直接commit |
| `ProductDataReadConnectorPort` | versioned requestを外部read adapterへ渡しrecord pageとcursorを返す | bounded ephemeral observation | arbitrary query、write-back、credential本文の返却、raw inputのpersistent seal |
| `ProductDataProjectionWorker` | raw pageからcanonical entity/mapping proposalを導出 | Python proposal artifactだけ | harness.db、current pointer、watermarkへのwrite |
| `ProductDataProposalIngestionPort` | worker envelope、source/schema/mapping/lineage/digestをNodeで再検証 | staged proposal | partial result、late fence、schema不明resultの昇格 |
| `ProductDataPolicyGate` | classification、redaction、retention、freshness、agent-context field allowlistを評価 | policy receipt | PII/secret/raw payload複製、unknown classificationの通過 |
| `ProductDataProjectionCommitter` | entity/mapping、旧current、snapshot、watermarkを一transactionでcommit | Node `HarnessDbPort`だけ | Python/connectorからのDB write、watermark先行更新 |
| `ProductDataQuarantineStore` | drift/policy/authority findingとrelease条件をappend-only管理 | quarantine event | raw payload保存、無期限・ownerなしrelease |

Pythonは共通`PythonWorkerBroker`を通じてproposalだけを返す。run output root以外のwrite、DB pathの受領、repository/current
pointerへのアクセスを許可しない。Nodeは`complete`後にresult set、schema、provenance、lease/fence、artifact digestを再検証し、
検証済みproposalだけをprojection transactionへ渡す。`HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN`は
`HIL_PYTHON_AUTHORITY_BYPASS`をproduct-data境界で失わず集約する。

## §2 connector registry契約

connector versionは次を必須とする。

```ts
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
  sync_modes: Array<"full" | "incremental">;
  freshness_sla_ms: number;
  retention_policy_id: string;
  redaction_policy_id: string;
  quarantine_route_id: string;
  owner: string;
  config_digest: string;
}
```

credentialはopaque referenceだけを受理し、値、header、connection string、secret bodyをregistry、run、artifact、logへ保存しない。
同じsourceでactive connector versionは最大1件とする。version/schema/mapping/config digest変更は旧run/snapshotをstaleにし、
旧greenを新versionへ流用しない。disabled/revoked/quarantined connectorのclaimは0件にする。
activationはpure decisionだけで完了させず、operation ID、contract digest、expected registry head、idempotency keyを持つ
Node commit transactionでregistry event、旧active stale化、新active pointer、receiptをCAS commitする。fault時の部分active化、
同一key別digest、head競合を拒否し、seal済みactivation evidenceからNode reconcileできるようにする。

## §3 full／incremental取り込み

```text
received -> claimed -> fetching -> staged -> validating -> committing -> completed
                |          |          |            |              |
                +----------+----------+------------+-> failed
                                      +--------------> quarantined
                +------------------------------------> cancelled
```

fullはcursorなしの固定source intentから全pageを取得し、source record key digestの重複・欠落、page chain、終端cursorを検査する。
incrementalはcurrent watermarkを`cursor_start`として固定し、page/event sequenceと`cursor_end`の単調前進を検査する。
cursorの比較はconnector登録済みcodecだけが行い、文字列辞書順や時刻推測へ縮退しない。

operation idempotency keyはsource、connector version、mode、cursor start、intent digestから導出する。同じkey・同じdigestの再送は
同じreceiptを返して増分0、同じkey・異なるdigestは`HIL_PRODUCT_IDEMPOTENCY_CONFLICT`で停止する。full/incrementalとも
snapshot、entity、mapping、watermarkを別々の成功として公開しない。

## §4 snapshot、lineage、schemaの検証

connectorのraw inputはrun固有のbounded ephemeral領域だけで扱い、byte/record上限、TTL、owner、run/lease/fenceを付与する。
classificationとredactionが完了する前にartifact、content-addressed store、DB、logへpersistent sealしてはならない。
secret検出時は即時rejectし、当該inputをquarantine後に削除する。TTL到達時またはvalidation終端時に削除し、
`ephemeral-input-delete-receipt`へdigest、count、expiry、delete result、`deleted_at`、Node clock receiptだけを保存する。
削除失敗はpolicy failureとしてcurrent昇格を0にする。classification/redaction済みproposalとprojectionは最低限、
source ID、connector/version、run/request、mode、cursor start/end、source schema、mapping version、record key digest、source content digestを記録し、
parent snapshot、captured/fresh-until、classification、redaction policy、worker/result digestをlineageとして持つ。

source schemaは登録versionとstrict validatorで比較する。field追加、削除、型・nullability・enum・identity変更をpolicyに従って
分類し、未承認差分は`HIL_PRODUCT_SCHEMA_DRIFT`でsnapshot全体をquarantineする。unknown fieldを黙ってdropしてgreenにせず、
drift findingへsource span相当のfield pathとdigestだけを保存する。

lineage必須field欠落、parent/cursor/connector mismatch、mapping target不明はcurrent化しない。raw record本文、未redact PII、secret、
credentialをlineage/evidenceへ複製しない。

## §5 canonical entity、mapping、tombstoneの扱い

source recordはversioned mappingでcanonical entity ID/type、redacted fields、source record key digestへ変換する。entity IDはsourceの
表示名や取得順に依存せず、source identity、record key、mapping versionから決定する。requirement、design、Issue等へのmapping edgeは
target kind/ID、mapping version、evidence digestを持ち、存在しないtargetをactiveにしない。

tombstoneは削除対象record key、直前entity version、source delete event/snapshot lineageを要求する。受理時は新entity versionを
`tombstoned`、既存mappingを`stale`にし、物理削除やrelationのsilent dropを行わない。未知recordのdelete、lineageなしdelete、
再出現recordはversioned conflictとして判定し、retention policyなしにpurgeしない。

full syncでは前回current snapshotのrecord-key集合と新しい完全snapshotの集合をNodeが差分比較し、新snapshotから消失した
recordを明示的なtombstone proposalへ変換してmapping staleを導出する。incremental syncの単なる未出現をdelete扱いせず、
full終端、page完全性、prior snapshot digest、差分集合digestが揃わない場合は消失判定をcommitしない。

## §6 freshness、classification、redaction、retentionの方針

worker/connector由来時刻は`source_observed_at_untrusted`という非権威的observationだけとし、proposalから`fresh_until`を
指定できない。Nodeはtrusted clock receiptの`received_at`、connector policy、freshness SLAから`captured_at`と
`fresh_until`を再導出する。未来時刻、許容skew超過、形式不正はquarantineまたはstaleとしcurrent化しない。期限超過時はsnapshot/entityを
`stale`へ遷移し、current queryとagent contextから除外する。古いprojectionをwarning付きで返すfail-openを認めない。

全source/entity fieldはclassificationを持ち、agent contextへ渡せるfieldはconnector contractの明示allowlistとredaction済み
artifactだけに限定する。PII、secret、credential、自由形式raw payload、unknown classificationは通常projectionへ保存しない。
redactionは値を不可逆変換またはdropし、evidenceにはpolicy/version、field path、input/output digest、finding countだけを残す。

retention expiry時もNodeのpurge plan、対象digest、policy、owner、実行receiptが必要である。本sliceは実purgeを行わず、receiptなしの
削除を`HIL_PRODUCT_RETENTION_REQUIRED`で拒否する。

## §7 projection transaction、watermark、quarantineの境界

Node transactionは次を不可分に行う。

1. staged entity versionsとmapping edgesを検証済みdigestでinsertする。
2. 旧current entity/snapshotをsupersedeまたはstaleにする。
3. tombstoneとmapping staleを反映する。
4. 新snapshotをsourceごと最大1件の`current`へ昇格する。
5. watermarkを旧current snapshot/fenceに対するcompare-and-swapで前進させる。
6. ingestion eventとcompletion receiptをappendする。

cursor逆行、同値なのに異content、fence mismatch、transaction failureではwatermarkとcurrent増分を0件にする。artifact seal後のDB failureは
`projection_pending` receiptを残し、operation ID、projection digest、expected snapshot/watermark/DB head、idempotency keyを固定した
Node reconcile APIがstaged evidenceから収束させる。connector/Pythonへ再commitさせず、別digest再送、CAS競合、暗黙rewriteを拒否する。

quarantine itemはsource/run/snapshot、failure code、redacted fingerprint、evidence digest、owner、expiry、release条件を持つ。
schema/policy/credential/authority failureを個別recordにしつつ、run全体のcurrent昇格を0にする。releaseは原因修正、新connector/policy
revision、再validation receiptを要求し、過去itemの書換えではなくsuperseding eventで行う。

## §8 failure契約

| failure token | 条件 | 副作用 |
|---|---|---|
| `HIL_CONNECTOR_CONTRACT_INVALID` | 必須field、version、policy、credential reference不正またはcredential本文混入 | registry active化0 |
| `HIL_PRODUCT_CONNECTOR_DISABLED` | disabled/revoked/quarantined connectorをclaim | run 0 |
| `HIL_PRODUCT_SOURCE_READ_ONLY_VIOLATION` | connector/Pythonがwrite-backまたはarbitrary queryを要求 | request 0、quarantine |
| `HIL_PRODUCT_IDEMPOTENCY_CONFLICT` | 同じoperation keyに異digest | commit 0 |
| `HIL_PRODUCT_SCHEMA_DRIFT` | source schemaが登録policy外 | current昇格0、quarantine |
| `HIL_PRODUCT_DATA_LINEAGE_MISSING` | source/connector/run/cursor/schema/mapping lineage欠落・不一致 | current昇格0 |
| `HIL_PRODUCT_WATERMARK_REGRESSION` | cursor逆行、同cursor異content、CAS/fence不一致 | watermark更新0 |
| `HIL_PRODUCT_TOMBSTONE_INVALID` | delete対象、直前version、lineage不正 | tombstone/mapping更新0 |
| `HIL_PRODUCT_SNAPSHOT_STALE` | freshness SLA超過 | current query 0、stale遷移 |
| `HIL_PRODUCT_REDACTION_REQUIRED` | PII/secret/raw/unknown classificationが未redact | entity増分0、quarantine |
| `HIL_PRODUCT_RETENTION_REQUIRED` | retention receiptなしのpurge | purge 0 |
| `HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN` | Python/connectorからDB/current/watermark write | authoritative増分0、quarantine |
| `HIL_PRODUCT_INGESTION_INVALID` | full/incrementalのpage、cursor、entity、mapping、transaction契約不成立 | run failed/quarantined |
| `HIL_PRODUCT_DATA_POLICY_VIOLATION` | classification/redaction/retention/freshness/context policy違反 | projection/context公開0 |
| `HIL_PRODUCT_PROJECTION_INVALID` | HST境界で上記詳細failureを集約 | HST-HIL-010失敗 |

## §9 L8 oracleへのexact trace

| L5責務 | HAC | HST exact case | L8 oracle | failure token |
|---|---|---|---|---|
| full原子的projection | `HAC-HIL-11a` | `HST-CASE-010-01` | `IT-PDC-001` | `なし（正常系）` |
| incremental cursor前進 | `HAC-HIL-11a` | `HST-CASE-010-02` | `IT-PDC-002` | `なし（正常系）` |
| schema drift quarantine | `HAC-HIL-11b` | `HST-CASE-010-03` | `IT-PDC-003` | `HIL_PRODUCT_SCHEMA_DRIFT` |
| tombstoneとmapping stale | `HAC-HIL-11c` | `HST-CASE-010-04`（正常） / `HST-CASE-010-11`（反例） | `IT-PDC-004` | `なし（正常系）` / `HIL_PRODUCT_INGESTION_INVALID` |
| freshness失効 | `HAC-HIL-11c` | `HST-CASE-010-05` | `IT-PDC-005` | `HIL_PRODUCT_SNAPSHOT_STALE` |
| Python直接write拒否 | `HAC-HIL-11b` | `HST-CASE-010-06` | `IT-PDC-006` | `HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN` |
| watermark逆行拒否 | `HAC-HIL-11b` | `HST-CASE-010-07` | `IT-PDC-007` | `HIL_PRODUCT_WATERMARK_REGRESSION` |
| PII redaction | `HAC-HIL-11b` | `HST-CASE-010-08` | `IT-PDC-008` | `HIL_PRODUCT_REDACTION_REQUIRED` |
| end-to-end lineage | `HAC-HIL-11a` | `HST-CASE-010-09` | `IT-PDC-009` | `HIL_PRODUCT_DATA_LINEAGE_MISSING` |
| connector registryのactivation commit/reconcile | `HAC-HIL-11b` | `HST-CASE-010-10`＋補助activation fault oracle | `IT-PDC-010` | `U-PDC-002`: `activateProductConnectorVersion` → `reconcileProductConnectorActivation`／`HIL_CONNECTOR_CONTRACT_INVALID` |
| ingestion複合反例 | `HAC-HIL-11a`, `HAC-HIL-11b`, `HAC-HIL-11c` | `HST-CASE-010-11` | `IT-PDC-011` | `HIL_PRODUCT_INGESTION_INVALID` |
| projection/context policy | `HAC-HIL-11b`, `HAC-HIL-11c` | `HST-CASE-010-12` | `IT-PDC-012` | `HIL_PRODUCT_DATA_POLICY_VIOLATION` |
| seal後projection reconcile | `HAC-HIL-11a`, `HAC-HIL-11b` | supporting fault oracle | `IT-PDC-013` | `HIL_PRODUCT_INGESTION_INVALID` |
| full-sync消失recordのtombstone化 | `HAC-HIL-11a`, `HAC-HIL-11c` | supporting disappearance oracle | `IT-PDC-014` | `HIL_PRODUCT_INGESTION_INVALID` |

## §10 freeze条件

L5/L8 pairは`IT-PDC-001`、`IT-PDC-002`、`IT-PDC-003`、`IT-PDC-004`、`IT-PDC-005`、`IT-PDC-006`、
`IT-PDC-007`、`IT-PDC-008`、`IT-PDC-009`、`IT-PDC-010`、`IT-PDC-011`、`IT-PDC-012`の12件、全failure fixture、
`IT-PDC-013`、`IT-PDC-014`を含む14件、Node authoritative write count、Python direct write count、DB query/event digest、
別runtime reviewが揃うまでdraftとする。
外部serviceへの接続成功、mock件数、raw snapshot保存をfreeze証拠にしない。

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

projection bundleはentity version、mapping edge、tombstone、watermark advance、event、exact write-setの実payloadを一括する。
count/digestだけのprojection、payload欠落、watermark/event先行を禁止し、同一bundleだけreconcileする。

## §11 projection DB不変条件

`canonical_product_entity_versions`は`entity_id + entity_version`をPK、source snapshot/run/record keyをFKとしcurrent partial uniqueを一件にする。`product_mapping_edges`は`mapping_id + revision`をPK、source entity versionとtarget digestをFK、tombstone対象の全current mappingを同一transactionでexactにstale化する。`product_tombstones`は直前entity versionとdelete lineageを必須にし、incremental未出現からの生成をCHECKで拒否する。`product_watermark_advances`はrun内最後のauthoritative rowで、before cursor/headからの単調CASとcompletion eventを必須にする。`product_ingestion_events`はoperation sequence uniqueのappend-onlyである。full-sync disappearanceはcomplete page-chainのprior/new exact set差分だけを許し、entity/mapping/tombstone/watermark/event/receiptのexact write-set不一致は全rollbackする。
