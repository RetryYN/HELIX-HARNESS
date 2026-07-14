---
title: "HELIX L7 単体テスト設計 — source capability capture"
layer: L6
executed_at_layer: L7
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
pair_artifact: docs/design/helix/L6-function-design/source-capability-capture.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-09
  - HAC-HIL-09a
  - HAC-HIL-09b
  - HAC-HIL-09c
---

# HELIX L7 単体テスト設計 — source capability capture

| ID | 対象 | HAC trace | HST trace | 反例と期待結果／failure token | test citation |
|---|---|---|---|---|---|
| `U-SCAP-001` | canonical JSON | `HAC-HIL-09c` | capture内部oracle | canonical driftは`HIL_SOURCE_SNAPSHOT_STALE`。不正値は詳細cause `HSCAP_INTERNAL_ERROR` | `tests/source-capture-canonical.test.ts` |
| `U-SCAP-002` | stable ID | `HAC-HIL-09c` | capture内部oracle | source identity、raw path、blob、versionから時刻/OS非依存ID。driftは`HIL_SOURCE_SNAPSHOT_STALE`、identity差は`HSCAP_SOURCE_IDENTITY_MISMATCH` | `tests/source-capture-canonical.test.ts` |
| `U-SCAP-003` | JSONL | `HAC-HIL-09c` | capture内部oracle | stable ID順、UTF-8、BOMなし、LF＋末尾LF。driftは`HIL_SOURCE_SNAPSHOT_STALE`、不正直列化は`HSCAP_INTERNAL_ERROR` | `tests/source-capture-canonical.test.ts` |
| `U-SCAP-004` | ZIP central directory | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。全entryとSHA-256を取得し、件数差は`HSCAP_ENTRY_COUNT_MISMATCH` | `tests/source-capture-zip.test.ts` |
| `U-SCAP-005` | ZIP filename | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。raw bytes/base64とNFC表示pathを分離し、不正pathは`HSCAP_PATH_UNSAFE` | `tests/source-capture-zip.test.ts` |
| `U-SCAP-006` | ZIP duplicate | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。duplicate raw/display pathは`HSCAP_ENTRY_DUPLICATE` | `tests/source-capture-zip.test.ts` |
| `U-SCAP-007` | ZIP encryption | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。encrypted entryは展開せず`HSCAP_PATH_UNSAFE`でfail-close | `tests/source-capture-zip.test.ts` |
| `U-SCAP-008` | ZIP path safety | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。traversal、absolute、backslash escape、NULは`HSCAP_PATH_UNSAFE` | `tests/source-capture-zip.test.ts` |
| `U-SCAP-009` | ZIP symlink | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。symlinkは追跡せず`HSCAP_PATH_UNSAFE`でfinding化 | `tests/source-capture-zip.test.ts` |
| `U-SCAP-010` | ZIP integrity | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。CRC、compression、ZIP64/size違反は`HSCAP_SOURCE_IDENTITY_MISMATCH` | `tests/source-capture-zip.test.ts` |
| `U-SCAP-011` | Git baseline | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ref driftは`HIL_SOURCE_SNAPSHOT_STALE`。synthetic main treeの欠落は`HSCAP_REF_SET_INCOMPLETE` | `tests/source-capture-git.test.ts` |
| `U-SCAP-012` | Git overlay | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ref driftは`HIL_SOURCE_SNAPSHOT_STALE`。A/M/D/R、tombstone、renameの重複は`HSCAP_DENOMINATOR_OVERLAP` | `tests/source-capture-git.test.ts` |
| `U-SCAP-013` | Git ref closure | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ref driftは`HIL_SOURCE_SNAPSHOT_STALE`。exact 5 ref欠落は`HSCAP_REF_SET_INCOMPLETE` | `tests/source-capture-git.test.ts` |
| `U-SCAP-014` | Git object | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ref driftは`HIL_SOURCE_SNAPSHOT_STALE`。missing/corrupt blobは`HSCAP_SOURCE_IDENTITY_MISMATCH` | `tests/source-capture-git.test.ts` |
| `U-SCAP-015` | Git ancestry | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ref driftは`HIL_SOURCE_SNAPSHOT_STALE`。ancestor＋empty overlayの重複算入は`HSCAP_DENOMINATOR_OVERLAP` | `tests/source-capture-git.test.ts` |
| `U-SCAP-016` | current union | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | current tree driftは`HIL_SOURCE_SNAPSHOT_STALE`。core/outside非交差和の量差は`HSCAP_ENTRY_COUNT_MISMATCH` | `tests/source-capture-current-head.test.ts` |
| `U-SCAP-017` | current overlap | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | current tree driftは`HIL_SOURCE_SNAPSHOT_STALE`。同一pathの両partition所属は`HSCAP_DENOMINATOR_OVERLAP` | `tests/source-capture-current-head.test.ts` |
| `U-SCAP-018` | current gap | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | current tree driftは`HIL_SOURCE_SNAPSHOT_STALE`。tracked treeとの差分は`HSCAP_ENTRY_COUNT_MISMATCH` | `tests/source-capture-current-head.test.ts` |
| `U-SCAP-019` | dirty isolation | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | current tree driftは`HIL_SOURCE_SNAPSHOT_STALE`。dirty/foreign混入は`HSCAP_SOURCE_IDENTITY_MISMATCH` | `tests/source-capture-current-head.test.ts` |
| `U-SCAP-020` | classification totality | `HAC-HIL-09a`, `HAC-HIL-09b` | capture内部oracle | atomic source証拠欠落は`HIL_SOURCE_COMPLETENESS_UNPROVEN`。exactly-one rule/version/reason欠落は`HSCAP_ENTRY_UNCLASSIFIED` | `tests/source-capture-classifier.test.ts` |
| `U-SCAP-021` | unknown class | `HAC-HIL-09a`, `HAC-HIL-09b` | capture内部oracle | atomic source証拠欠落は`HIL_SOURCE_COMPLETENESS_UNPROVEN`。unknown classは`HSCAP_ENTRY_UNCLASSIFIED`でblocking | `tests/source-capture-classifier.test.ts` |
| `U-SCAP-022` | immutable publish | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | publish後driftは`HIL_SOURCE_SNAPSHOT_STALE`。tamper/conflictは`HSCAP_ARTIFACT_CONFLICT`、publish失敗は`HSCAP_ARTIFACT_PUBLISH_FAILED` | `tests/source-capture-artifact-store.test.ts` |
| `U-SCAP-023` | coverage separation | `HAC-HIL-09b` | capture内部oracle | capture PASSでもcoverageをBLOCKEDに保ち、誤昇格は`HIL_SOURCE_AGGREGATE_ONLY` | `tests/source-capture-status.test.ts` |
| `U-SCAP-024` | capture authority binding | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | trusted store head/receipt/expected manifest digest、ZIP SHA、UT exact 5 commit/tree、HEAD、expected countを個別改変しcaller自己申告をwrite 0で拒否 | `tests/source-capture-authority.test.ts` |
| `U-SCAP-025` | projection reconcile | `HAC-HIL-09a` | capture内部supporting fault | expected artifact/DB head、operation/digest/idempotencyを改変し、同key再送とDB faultを評価。silent rewrite/current増分0 | `tests/source-capture-reconcile.test.ts` |

## §1 HST011主系のunit tuple

| HSTケース | unit oracle | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-011-01` | `U-SCAP-023` | `coverage_ready` | `pair_freeze_ready` | `なし（正常系）` |
| `HST-CASE-011-02` | `U-SCAP-004` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-03` | `U-SCAP-011` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-04` | `U-SCAP-016` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-05` | `U-SCAP-023` | `coverage_pending` | `coverage_pending` | `HIL_SOURCE_DECISION_PENDING` |
| `HST-CASE-011-06` | `U-SCAP-020` | `coverage_ready` | `coverage_failed` | `HIL_SOURCE_ATOM_ORPHAN` |
| `HST-CASE-011-07` | `U-SCAP-021` | `coverage_ready` | `coverage_failed` | `HIL_SOURCE_REJECT_UNJUSTIFIED` |
| `HST-CASE-011-08` | `U-SCAP-023` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-011-09` | `U-SCAP-020` | `assertion_input_ready` | `assertion_pass` | `HIL_ASSET_DECISION_MISSING` |
| `HST-CASE-011-10` | `U-SCAP-022` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-11` | `U-SCAP-020` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_COMPLETENESS_UNPROVEN` |

25/25のRed/Green、failure code、write count、digestを保存する。mockが返した件数だけで合格せず、canonical bytes、
rollback後state、negative mutationを直接assertする。
