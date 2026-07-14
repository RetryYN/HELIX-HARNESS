---
title: "HELIX L8 結合テスト設計 — product data connector"
layer: L5
executed_at_layer: L8
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
pair_artifact: docs/design/helix/L5-detail/product-data-connector.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-11
  - HAC-HIL-11a
  - HAC-HIL-11b
  - HAC-HIL-11c
---

# HELIX L8 結合テスト設計 — product data connector

## §0 共通oracle

全caseはin-memory/fake read connector、固定source pages、Python worker fixture、isolated DBを使い、外部認証・接続を行わない。
source/connector/schema/mapping/policy/fixture version、cursor codec、run/lease/fence、command、exit、artifact/event/DB digestを固定する。
raw PII、secret、credential値、自由形式raw payloadをevidenceへ保存しない。各caseは`HST-HIL-010`のexact assertionへ対応し、未実装である。

| ID | 前提／操作 | 期待結果／evidence | HAC | HST exact case | failure token | 対応するL5箇所 |
|---|---|---|---|---|---|---|
| `IT-PDC-001` | enabled read-only connectorで3 pageのfull syncを再送 | snapshot/entity/mapping/watermarkを一transactionでcurrent化し、再送増分0、Python write 0 | `HAC-HIL-11a` | `HST-CASE-010-01` | `なし（正常系）` | `§2`, `§3`, `§7` |
| `IT-PDC-002` | current cursor 100から差分update/addをincremental sync | cursorがcodec上で前進し、変更entityだけ新version、同一input再送増分0 | `HAC-HIL-11a` | `HST-CASE-010-02` | `なし（正常系）` | `§3`, `§7` |
| `IT-PDC-003` | 登録schemaに対しfield削除、型変更、unknown fieldを個別投入 | run quarantined、current/watermark増分0、redacted drift evidence | `HAC-HIL-11b` | `HST-CASE-010-03` | `HIL_PRODUCT_SCHEMA_DRIFT` | `§4`, `§7`, `§8` |
| `IT-PDC-004` | current entityへのlineage付きdeleteと未知record deleteを投入 | 正常deleteはtombstoned＋mapping stale、未知/lineage欠落は更新0 | `HAC-HIL-11c` | `HST-CASE-010-04`（正常） / `HST-CASE-010-11`（反例） | `なし（正常系）` / `HIL_PRODUCT_INGESTION_INVALID` | `§5`, `§7`, `§8` |
| `IT-PDC-005` | Node trusted clockを固定し、期限超過、worker未来時刻、許容skew超過を個別投入 | Nodeの`received_at`からfresh-untilを再導出し、各反例でsnapshot/entityをstaleまたはquarantine、返却0 | `HAC-HIL-11c` | `HST-CASE-010-05` | `HIL_PRODUCT_SNAPSHOT_STALE` | `§6`, `§7`, `§8` |
| `IT-PDC-006` | Python worker fixtureがDB/current/watermarkへwriteを試行 | sandbox/Node ingestionでquarantine、authoritative増分0、詳細cause保持 | `HAC-HIL-11b` | `HST-CASE-010-06` | `HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN` | `§1`, `§7`, `§8` |
| `IT-PDC-007` | current cursor 100へ99、同cursor異content、旧fenceを個別commit | 全反例でwatermark/current増分0、run failed、CAS evidence | `HAC-HIL-11b` | `HST-CASE-010-07` | `HIL_PRODUCT_WATERMARK_REGRESSION` | `§3`, `§7`, `§8` |
| `IT-PDC-008` | bounded ephemeral inputへPII/secret/unknown classificationを混入しTTL/validation終端を進める | pre-classification persistent seal 0、secret即時reject、entity/context増分0、TTL削除とdelete receipt、evidence内raw値0 | `HAC-HIL-11b` | `HST-CASE-010-08` | `HIL_PRODUCT_REDACTION_REQUIRED` | `§4`, `§6`, `§8` |
| `IT-PDC-009` | full snapshotのconnector/run/cursor/schema/mapping lineageを一つずつ欠落 | 完備時だけcurrent、各欠落で昇格0とlineage finding | `HAC-HIL-11a` | `HST-CASE-010-09` | `HIL_PRODUCT_DATA_LINEAGE_MISSING` | `§4`, `§7`, `§8` |
| `IT-PDC-010` | `U-PDC-002`の`activateProductConnectorVersion` → `reconcileProductConnectorActivation`をstable順に実行する。connector必須field、credential本文、disabled/revoked version、registry event/旧active stale/new pointer/receipt/append orderを個別mutationし、各append fault後は同じsealed activationだけreconcileする | 完全activation bundleだけactive化。fault時部分更新0、同一reconcile/再送は同一receipt、別evidence/digest/head/order競合拒否 | `HAC-HIL-11b` | `HST-CASE-010-10`＋supporting activation fault oracle | `HIL_CONNECTOR_CONTRACT_INVALID` | `§2`, `§8` |
| `IT-PDC-011` | full/incremental、drift、delete、cursor逆行、idempotency conflictを同一matrixで実行 | 正常routeだけ冪等commit、各反例の詳細tokenを保持し境界codeへ集約 | `HAC-HIL-11a`, `HAC-HIL-11b`, `HAC-HIL-11c` | `HST-CASE-010-11` | `HIL_PRODUCT_INGESTION_INVALID` | `§3`, `§4`, `§5`, `§7`, `§8` |
| `IT-PDC-012` | classification、redaction、retention、freshness違反をprojection/contextへ個別投入 | projection/context公開0、quarantine、raw payload/PII/secret evidence 0 | `HAC-HIL-11b`, `HAC-HIL-11c` | `HST-CASE-010-12` | `HIL_PRODUCT_DATA_POLICY_VIOLATION` | `§6`, `§7`, `§8` |
| `IT-PDC-013` | delegate-only NodePortと唯一write-authority storeをspyし、adapter独自write/二重委譲/別bundleに加え、entity/mapping/tombstone/watermark/event/exact write-set、receipt heads/status/count swapとseal後DB faultを注入 | storeの対応`*Authoritative`が同一bundleでexactly-onceだけ呼ばれた完全payloadだけcommit。初回は`projection_pending`、同一reconcileは同receipt、二重authority/payload/head/status/count競合は増分0 | `HAC-HIL-11a`, `HAC-HIL-11b` | supporting fault oracle | `HIL_PRODUCT_INGESTION_INVALID` | `§7`, `§8` |
| `IT-PDC-014` | prior full snapshotの一部recordを新しい完全full resultから除外し、incremental未出現も対照実行 | full消失recordだけtombstoned＋mapping stale。incremental未出現、full不完全、prior digest不一致は更新0 | `HAC-HIL-11a`, `HAC-HIL-11c` | supporting disappearance oracle | `HIL_PRODUCT_INGESTION_INVALID` | `§3`, `§5`, `§7` |

## §1 合否

`IT-PDC-001`、`IT-PDC-002`、`IT-PDC-003`、`IT-PDC-004`、`IT-PDC-005`、`IT-PDC-006`、`IT-PDC-007`、
`IT-PDC-008`、`IT-PDC-009`、`IT-PDC-010`、`IT-PDC-011`、`IT-PDC-012`、`IT-PDC-013`、`IT-PDC-014`の14件すべてで期待state、failure token、
authoritative write count、watermark/current/entity/mapping増分、quarantine/event digestを直接assertする。一部case、sample field、
Python自己申告、外部接続結果で代替しない。

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

`IT-PDC-013`/`IT-PDC-014`はentity/mapping/tombstone/watermark/eventを一件ずつ欠落・swapし、full-sync終端前とincremental未出現からの偽delete、mapping stale過不足、watermark非最終write、各append fault、stale/CASを注入する。完全bundle以外はcurrent/watermark/receipt増分0、seal後faultだけ同一bundle reconcileを許可する。
