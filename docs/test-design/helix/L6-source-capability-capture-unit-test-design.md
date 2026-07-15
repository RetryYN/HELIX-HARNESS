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
| `U-SCAP-005` | ZIP filename／stream terminal | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。raw bytes/base64とNFC表示pathを分離し、不正pathは`HSCAP_PATH_UNSAFE`。mid-stream throw/rejectionはterminal `HSCAP_INTERNAL_ERROR`へ変換 | `tests/source-capture-zip.test.ts` |
| `U-SCAP-006` | ZIP duplicate | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。duplicate raw/display pathは`HSCAP_ENTRY_DUPLICATE` | `tests/source-capture-zip.test.ts` |
| `U-SCAP-007` | ZIP encryption | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。encrypted entryは展開せず`HSCAP_PATH_UNSAFE`でfail-close | `tests/source-capture-zip.test.ts` |
| `U-SCAP-008` | ZIP path safety | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。traversal、absolute、backslash escape、NULは`HSCAP_PATH_UNSAFE` | `tests/source-capture-zip.test.ts` |
| `U-SCAP-009` | ZIP symlink | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。symlinkは追跡せず`HSCAP_PATH_UNSAFE`でfinding化 | `tests/source-capture-zip.test.ts` |
| `U-SCAP-010` | ZIP integrity | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ZIP driftは`HIL_SOURCE_SNAPSHOT_STALE`。CRC、compression、ZIP64/size違反は`HSCAP_SOURCE_IDENTITY_MISMATCH` | `tests/source-capture-zip.test.ts` |
| `U-SCAP-011` | Git baseline | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ref driftは`HIL_SOURCE_SNAPSHOT_STALE`。synthetic main treeの欠落は`HSCAP_REF_SET_INCOMPLETE` | `tests/source-capture-git.test.ts` |
| `U-SCAP-012` | Git overlay | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ref driftは`HIL_SOURCE_SNAPSHOT_STALE`。A/M/D/R、tombstone、renameの重複は`HSCAP_DENOMINATOR_OVERLAP` | `tests/source-capture-git.test.ts` |
| `U-SCAP-013` | Git ref closure | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | current authority receiptとsealed mirrorのadvertised ref row omission/extraは`HSCAP_REF_SET_INCOMPLETE` | `tests/source-capture-git.test.ts` |
| `U-SCAP-014` | Git object | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | ref driftは`HIL_SOURCE_SNAPSHOT_STALE`。missing/corrupt object/tree/reachabilityは`HSCAP_REF_OBJECT_INCOMPLETE` | `tests/source-capture-git.test.ts` |
| `U-SCAP-015` | Git ancestry | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | unique tree entryへdedupeしても全ref-entry edgeを保持し、二重算入は`HSCAP_DENOMINATOR_OVERLAP` | `tests/source-capture-git.test.ts` |
| `U-SCAP-016` | current union | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | current tree driftは`HIL_SOURCE_SNAPSHOT_STALE`。core/outside非交差和の量差は`HSCAP_ENTRY_COUNT_MISMATCH` | `tests/source-capture-current-head.test.ts` |
| `U-SCAP-017` | current overlap | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | current tree driftは`HIL_SOURCE_SNAPSHOT_STALE`。同一pathの両partition所属は`HSCAP_DENOMINATOR_OVERLAP` | `tests/source-capture-current-head.test.ts` |
| `U-SCAP-018` | current gap | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | current tree driftは`HIL_SOURCE_SNAPSHOT_STALE`。tracked treeとの差分は`HSCAP_ENTRY_COUNT_MISMATCH` | `tests/source-capture-current-head.test.ts` |
| `U-SCAP-019` | dirty isolation | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | current tree driftは`HIL_SOURCE_SNAPSHOT_STALE`。dirty/foreign混入は`HSCAP_SOURCE_IDENTITY_MISMATCH` | `tests/source-capture-current-head.test.ts` |
| `U-SCAP-020` | classification totality | `HAC-HIL-09a`, `HAC-HIL-09b` | capture内部oracle | atomic source証拠欠落は`HIL_SOURCE_COMPLETENESS_UNPROVEN`。exactly-one rule/version/reason欠落は`HSCAP_ENTRY_UNCLASSIFIED` | `tests/source-capture-classifier.test.ts` |
| `U-SCAP-021` | unknown class | `HAC-HIL-09a`, `HAC-HIL-09b` | capture内部oracle | atomic source証拠欠落は`HIL_SOURCE_COMPLETENESS_UNPROVEN`。unknown classは`HSCAP_ENTRY_UNCLASSIFIED`でblocking | `tests/source-capture-classifier.test.ts` |
| `U-SCAP-022` | immutable publish | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | publish後driftは`HIL_SOURCE_SNAPSHOT_STALE`。tamper/conflictは`HSCAP_ARTIFACT_CONFLICT`、publish失敗は`HSCAP_ARTIFACT_PUBLISH_FAILED` | `tests/source-capture-artifact-store.test.ts` |
| `U-SCAP-023` | activation journal／dependency generation | `HAC-HIL-09b` | capture内部oracle | base digest不変の独立journalをsealし、dependency退役は初回0、旧consumerなし2、旧atomization/coverageあり6、logical consumer transitionは0/0/2をexact導出する。S1/A1/C1 current→S2 activationではA1 stale event/projection/active pointer実payloadとC1 stale status revision/current pointer実payloadをartifactへ封入して同一transactionで反映する。shared lifecycle append失敗、indexだけstale、consumerだけcurrent、pair片側、omit/extra、CAS/faultでは全pointer・receipt増分0 | `tests/source-capture-status.test.ts` |
| `U-SCAP-024` | capture authority binding | `HAC-HIL-09a`, `HAC-HIL-09c` | capture内部oracle | trusted store head/receipt/expected manifest digest、ZIP SHA、exact 2 current Git receipts、HEAD、3分母digestを個別改変しcaller自己申告をwrite 0で拒否 | `tests/source-capture-authority.test.ts` |
| `U-SCAP-025` | projection reconcile | `HAC-HIL-09a` | capture内部supporting fault | expected artifact/DB head、operation/digest/idempotencyを改変し、同key再送とDB faultを評価。silent rewrite/current増分0 | `tests/source-capture-reconcile.test.ts` |
| `U-SCAP-026` | advertised namespace canonicalization | `HAC-HIL-09a`, `HAC-HIL-09c` | Git authority oracle | heads/tags/pull head+mergeをbyte sortし、symbolic HEAD targetと`^{}` pseudo-lineを分母外evidenceへ固定する。ref分母への混入、evidence欠落は`HSCAP_REF_NAMESPACE_INVALID` | `tests/source-git-advertisement.test.ts` |
| `U-SCAP-027` | required repository identity | `HAC-HIL-09a`, `HAC-HIL-09c` | Git authority oracle | exact 2 repo以外、owner/repo swap、endpoint identity差替えは`HSCAP_REMOTE_IDENTITY_MISMATCH` | `tests/source-git-advertisement.test.ts` |
| `U-SCAP-028` | advertisement A/B race | `HAC-HIL-09a`, `HAC-HIL-09c` | Git authority oracle | ref add/delete/move、tag retarget、pull merge消滅を注入し`HSCAP_REF_ADVERTISEMENT_DRIFT`、seal 0 | `tests/source-git-advertisement.test.ts` |
| `U-SCAP-029` | exact object materialization | `HAC-HIL-09a`, `HAC-HIL-09c` | Git authority oracle | namespace ID、exact refspec manifest、write-set、default clone 0、scope escape 0を固定してadvertised OIDを全materializeする。隔離違反は`HSCAP_QUARANTINE_ISOLATION_FAILED`、missing/corrupt/unreachableは`HSCAP_REF_OBJECT_INCOMPLETE` | `tests/source-git-authority.test.ts` |
| `U-SCAP-030` | tag/pull/tree/edge closure | `HAC-HIL-09a`, `HAC-HIL-09c` | Git authority oracle | advertised object type、tag→tag→commit peel chain、terminal commit/tree、pull head/merge、unique tree dedupe、全ref edgeを閉じる。tree/blob terminalまたはchain不整合は`HSCAP_TAG_PEEL_INVALID` | `tests/source-git-authority.test.ts` |
| `U-SCAP-031` | authority CAS／atomic stale | `HAC-HIL-09a`, `HAC-HIL-09c` | Git authority oracle | same-op replay、stale receipt、expected head/revision、exact 2 receipt join、content set digest、A/B、quarantine、closure、seal/mirror連鎖を検証する。dependency indexのomit/duplicate/swap、before head、CAS/faultをmutateし、全依存before→stale transitionかpartial 0だけを許す。CAS競合は`HSCAP_REF_AUTHORITY_CONFLICT`、digest差替えは`HSCAP_SEALED_BUNDLE_TAMPERED` | `tests/source-git-authority.test.ts` |

### §0.1 主所有APIと変異構成要素

31 Uは次のexact ownerへ一度だけ属する。API名以外の旧「対象」ラベルはscenarioの短縮名でありowner authorityではない。

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
| `observeAdvertisedGitRefs` | `U-SCAP-026`, `U-SCAP-027` | `IT-SCAP-011`, `IT-SCAP-012` | なし |
| `materializeAndVerifyGitRefClosure` | `U-SCAP-028`, `U-SCAP-029`, `U-SCAP-030` | `IT-SCAP-011`, `IT-SCAP-012` | なし |
| `commitGitRefAuthority` | `U-SCAP-031` | `IT-SCAP-013` | なし |

各owner testはL6のclosed V1 result全fieldをmutationする。component APIはowner Uの同じfixture identityを使い、新規Uや追加分母を作らない。

## §1 HST011主系のunit tuple

| HSTケース | unit oracle | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-011-01` | `U-SCAP-023` | `coverage_ready` | `pair_freeze_ready` | `なし（正常系）` |
| `HST-CASE-011-02` | `U-SCAP-004` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-03` | `U-SCAP-031` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-04` | `U-SCAP-016` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-05` | `U-SCAP-023` | `coverage_pending` | `coverage_pending` | `HIL_SOURCE_DECISION_PENDING` |
| `HST-CASE-011-06` | `U-SCAP-020` | `coverage_ready` | `coverage_failed` | `HIL_SOURCE_ATOM_ORPHAN` |
| `HST-CASE-011-07` | `U-SCAP-021` | `coverage_ready` | `coverage_failed` | `HIL_SOURCE_REJECT_UNJUSTIFIED` |
| `HST-CASE-011-08` | `U-SCAP-023` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-011-09` | `U-SCAP-020` | `assertion_input_ready` | `assertion_pass` | `HIL_ASSET_DECISION_MISSING` |
| `HST-CASE-011-10` | `U-SCAP-022` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-11` | `U-SCAP-020` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_COMPLETENESS_UNPROVEN` |

31/31のRed/Green、failure code、write count、digestを保存する。mockが返した件数だけで合格せず、canonical bytes、
rollback後state、negative mutationを直接assertする。
