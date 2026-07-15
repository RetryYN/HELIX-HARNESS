---
title: "HELIX L8 結合テスト設計 — source capability capture"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-09A
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-011
pair_artifact: docs/design/helix/L5-detail/source-capability-capture.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-09
  - HAC-HIL-09a
  - HAC-HIL-09b
  - HAC-HIL-09c
---

# HELIX L8 結合テスト設計 — source capability capture

## §0 共通oracle

全caseでsource revision、adapter/classification/schema version、command、exit code、stdout/stderr digest、bundle digest、
DB query digestを固定する。成功fixtureは初期4,470 entryをexactly onceで含み、5 ref full-tree 8,935行を
ref証拠として保持しながらcoverage分母へ重複算入しない。全caseは未実装である。

| ID | 結合対象 | HAC／supporting境界 | scenario | 期待結果／failure token |
|---|---|---|---|---|
| `IT-SCAP-001` | real ZIP→bundle | `HAC-HIL-09a`; capture内部oracle | 固定ZIPをcaptureし、ZIP欠落とdriftも注入 | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。703/703を満たし、欠落は`HSCAP_SOURCE_UNAVAILABLE`、件数差は`HSCAP_ENTRY_COUNT_MISMATCH` |
| `IT-SCAP-002` | real Git mirror→bundle | `HAC-HIL-09a`; capture内部oracle | 固定5 refをcaptureしてref driftも注入 | ref driftは`HIL_SOURCE_SNAPSHOT_STALE`。main 1,784＋overlay 52、full-ref証拠8,935、欠落は`HSCAP_REF_SET_INCOMPLETE` |
| `IT-SCAP-003` | seed HEAD→bundle | `HAC-HIL-09a`; capture内部oracle | seed commitをfull-tree captureしてsymbol driftも注入 | symbol driftは`HIL_SOURCE_SNAPSHOT_STALE`。core 1,756＋outside 175＝1,931、量差は`HSCAP_ENTRY_COUNT_MISMATCH` |
| `IT-SCAP-004` | 3 family→capture receipt | `HAC-HIL-09a`; capture内部oracle | family bundleを統合 | 4,470/4,470、unclassified 0、behavior atom 0、二重算入0。違反時は`HSCAP_DENOMINATOR_OVERLAP`または`HIL_SOURCE_AGGREGATE_ONLY` |
| `IT-SCAP-005` | artifact→event→DB | `HAC-HIL-09a`; capture内部supporting fault | immutable seal後にtransaction faultを注入してproject/rebuild | local `HSCAP_PROJECTION_FAILED`、partial 0、6 table一致、rebuild冪等。engine HSTを消込まない |
| `IT-SCAP-006` | drift→stale | `HAC-HIL-09c`; capture内部oracle | ZIP/ref/HEAD/ruleの各digestを変更 | 旧receipt stale、新snapshot必須。`HSCAP_SNAPSHOT_STALE`を境界`HIL_SOURCE_SNAPSHOT_STALE`へ結線 |
| `IT-SCAP-007` | clean Linux→Node CLI | `HAC-HIL-09b`; `HST-CASE-008-12` | Bunなし環境でcapture/verify | Node execution green、Python/DB authority bypass 0。違反時は`HIL_PYTHON_AUTHORITY_BYPASS` |
| `IT-SCAP-008` | fault injection→recovery | `HAC-HIL-09b`; capture内部supporting fault | write/fsync/rename/event/DB各段を失敗 | false-active 0。local causeは`HSCAP_ARTIFACT_PUBLISH_FAILED`または`HSCAP_PROJECTION_FAILED`、engine HSTを消込まない |
| `IT-SCAP-009` | trusted manifest store→authority→request | capture authority | expected digest、store head/receipt、ZIP SHA、UT 5 ref commit/tree、HEAD、family countを一件ずつ改変 | trusted current manifest exact一致だけplan生成。自己申告、stale head、ref差替え、count差はwrite 0 |
| `IT-SCAP-010` | sealed artifact→projection_pending→Node reconcile | capture recovery | artifact publish後DB fault、artifact/DB head conflict、同key再送 | silent rewrite 0、pending一件、reconcile成功時だけprojection/current、再送増分0 |

### §0.1 公開API→U→IT exact join

| owner API | U | exact IT | 変異構成API |
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

primary owner Uはcomponent API行でprotocol参照として再掲するが、U coverage分母へはprimary owner APIのowned setから一度だけ算入する。owned setはL6/L7のpartition台帳を正本とし、`U-SCAP-001`〜`U-SCAP-025`を欠落・重複なく覆う。

## §1 HST011主系の原子tuple

次の表だけをprimary case joinの正本とする。同じITへ複数fixtureを割り当ててもcase行をまとめない。

| HSTケース | 結合oracle | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-011-01` | `IT-SCAP-004` | `coverage_ready` | `pair_freeze_ready` | `なし（正常系）` |
| `HST-CASE-011-02` | `IT-SCAP-001` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-03` | `IT-SCAP-002` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-04` | `IT-SCAP-003` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-05` | `IT-SCAP-004` | `coverage_pending` | `coverage_pending` | `HIL_SOURCE_DECISION_PENDING` |
| `HST-CASE-011-06` | `IT-SCAP-004` | `coverage_ready` | `coverage_failed` | `HIL_SOURCE_ATOM_ORPHAN` |
| `HST-CASE-011-07` | `IT-SCAP-004` | `coverage_ready` | `coverage_failed` | `HIL_SOURCE_REJECT_UNJUSTIFIED` |
| `HST-CASE-011-08` | `IT-SCAP-004` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-011-09` | `IT-SCAP-004` | `assertion_input_ready` | `assertion_pass` | `HIL_ASSET_DECISION_MISSING` |
| `HST-CASE-011-10` | `IT-SCAP-006` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-11` | `IT-SCAP-004` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_COMPLETENESS_UNPROVEN` |

## §2 合否

10/10実行、期待failure code一致、4,470 entryと全digestの量閉じ、DB rebuild一致、別runtime reviewを必要とする。
HST green、prose manifest、代表sampleだけではL8合格にしない。
