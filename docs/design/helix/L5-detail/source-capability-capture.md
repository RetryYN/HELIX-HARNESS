---
title: "HELIX L5 詳細設計 — source capability capture"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-09A
related_hst:
  - HST-HIL-011
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/test-design/helix/L5-source-capability-capture-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-09
  - HAC-HIL-09a
  - HAC-HIL-09b
  - HAC-HIL-09c
---

# HELIX L5 詳細設計 — source capability capture

## §0 適用境界

本設計はZIP、前身HELIXの全固定ref、現行HELIX commit済みHEADを、再現可能な`source_snapshot`へ
取り込むcapture段階だけを扱う。behavior atom抽出、採否、HIL/design/test/gate結線は後続段階であり、
capture成功時も`behavior_atom_closed=false`、behavior atom coverageは`0 / unknown`とする。

初期captureのentry分母は4,470件である。

| source family | canonical entry | 根拠 |
|---|---:|---|
| `ZIP-HYBRID-V1` | 703 | archive central directory全entry |
| `UT-ALL-REMOTE/main` | 1,784 | `origin/main` tree |
| `UT-ALL-REMOTE/branch-overlay` | 52 | mainとの差分overlayの非重複和 |
| `CURRENT-HELIX/full-tree` | 1,931 | core 1,756＋outside 175の非交差和 |
| **合計** | **4,470** | family間の独立和 |

前身の5 ref full-tree 8,935行はref完全性と共通blobの証拠として保存するが、4,470件へ重複算入しない。
CURRENT 1,931件のseedはcommit `9c8d09c224c5fc506eb314933519981dadfea3e9`に固定する。実装時HEADは
別snapshotとして再captureし、seed receiptを`stale`にする。

requestのsource identity/countはcaller自己申告をauthorityにしない。canonical source snapshot manifest digestへZIP archive SHA-256、
UT固定5 refのcommit/tree exact set、current HEAD commit/tree、family別expected entry countをbindしたauthority inputをNodeが読取り、
requestとexact照合する。不一致、ref差替え、件数自己申告はwrite 0で拒否する。

## §1 module境界

| module | 責務 | 入力 | 出力 | 禁止 |
|---|---|---|---|---|
| `SourceCaptureCoordinator` | probe→enumerate→classify→render→commitを順序制御 | capture request、adapter registry | dry-run planまたはcommit receipt | network fetch、暗黙activate |
| `ZipCaptureAdapter` | central directoryとentry bytesを列挙 | local ZIP path＋期待digest | ZIP ref/entry stream | extract先への書込み、path traversal追従 |
| `GitCaptureAdapter` | local mirrorのcommit/tree/overlayを列挙 | local repo、固定ref集合 | ref、full-tree、overlay entry | fetch、checkout、working tree変更 |
| `CurrentHeadCaptureAdapter` | commit済みHEAD full treeを列挙 | repo root、commit/tree | core/outside非交差entry | untracked/foreign tree混入 |
| `SourceEntryClassifier` | versioned ruleで全entryを一意分類 | entry metadata/bytes | classification exactly 1 | default `other`で未分類隠蔽 |
| `SourceArtifactStore` | canonical bundleをtemp→fsync→renameでpublish | rendered bundle | immutable bundle locator | overwrite、partial publish |
| `SourceCaptureProjection` | artifactからDB read modelをtransaction再構築 | committed receipt/bundle | current projection | artifactより先のDB current化 |

adapter contractは次で固定する。

```ts
interface SourceCaptureAdapterV1 {
  probe(request: SourceCaptureRequestV1): Promise<SourceProbeResultV1>;
  entries(probe: SourceProbeResultV1): AsyncIterable<SourceEntryV1>;
}

type SourceFamilyV1 = "zip" | "git" | "current-head";
type EntryClassV1 =
  | "runtime-source" | "test" | "design" | "rule" | "workflow"
  | "generated-fixture" | "binary" | "duplicate-alias" | "evidence-only"
  | "unclassified";
```

`probe`はsource identity、固定revision、期待count/digest、local-only制約を検証する。`entries`は副作用を持たず、
順序非依存の入力をcanonical sort可能なrecordへ変換する。adapterはDB、repo正本、remoteへ書かない。
`SourceCaptureRequestV1`、`SourceProbeResultV1`、`SourceEntryV1`のexact fieldはL6 §2を正本とし、unversioned request/result/candidate名へ縮退しない。

## §2 正規bundle

bundle rootは`.helix/evidence/source-atomization/<snapshot_id>/`とし、次を必須にする。

| artifact | 内容 | 主な不変条件 |
|---|---|---|
| `capture-request.json` | source、revision、scope、adapter/rule version | canonical JSON、secret/PIIなし |
| `source-bundle.json` | snapshot identityと全digest root | schema/version/count固定 |
| `source-refs.jsonl` | archive/ref/commit/tree/merge-base | stable ID順、重複refなし |
| `source-entries.jsonl` | path、mode、size、blob digest、overlay operation | 4,470件、entry ID一意 |
| `entry-classifications.jsonl` | entry ID、class、rule ID/version、reason | entryごとexactly 1 |
| `capture-receipt.json` | command、exit、counts、digests、producer、status | bundle全bytesへdigest bind |

UTF-8、BOMなし、LF、path separator `/`、object key canonical order、stable ID順を使用する。raw path bytesと
表示用NFC pathは別fieldに保持し、Unicode正規化でentryを統合しない。bundleはcontent-addressedで、同一IDへ
異なるbytesを書こうとした場合は`HSCAP_ARTIFACT_CONFLICT`で拒否する。

## §3 DB projection契約

artifact bundleがcapture正本、`harness.db`は再構築可能なprojectionである。初期実装時に現行schema versionを
再確認し、現在のv39から実装する場合はv40として次の6 tableを同一migration sliceで追加する。

| table | key | 必須field / relation |
|---|---|---|
| `source_snapshots` | `snapshot_id` | family集合digest、bundle digest、status、behavior_atom_closed=false |
| `source_refs` | `source_ref_id` | snapshot外部key、kind、revision、tree、merge-base、counts |
| `source_entries` | `entry_id` | ref外部key、raw/display path、blob digest、mode、overlay operation |
| `source_entry_classifications` | `classification_id` | entry FK＋rule revision一意、class、reason code |
| `source_capture_receipts` | `receipt_id` | snapshot FK一意、artifact root、count/digest、command evidence |
| `source_capture_events` | `event_id` | snapshot＋sequence一意、previous/event digest、actor、occurred_at |

projectionは一transactionで全行を検証してからcurrent化する。既存DB rebuildはregistered tableをtruncateするため、
table registry/schema migration、artifact再projection、rebuild testを同一実装sliceに含める。DBだけに存在するcapture、
Pythonからの直接write、partial row群、artifact digest不一致はcurrentとして読ませない。

## §4 CLIと状態遷移

```text
helix source capture --family <zip|git|current-head> --source <local-path> --revision <id> --dry-run --json
helix source capture --family <...> --source <local-path> --revision <id> --execute --json
helix source verify --snapshot <snapshot-id> --json
helix source activate --snapshot <snapshot-id> --json
```

`dry-run`はdefaultでwrite 0、`execute`は明示必須とする。`capture`はlocal sourceだけを受け、clone/fetch/downloadを
行わない。`verify`はbundleを再読込してcount、digest、classification total、DB projection差分を返す。
`activate`はcapture receiptがgreen、4,470/4,470分類済み、unclassified 0、bundleとprojection一致の場合だけ
current snapshot pointerを更新する。ただしbehavior atom freezeは開かない。

状態遷移は`planned -> capturing -> rendered -> committed -> projected -> verified -> active`とし、任意failureは
`failed`、source/rule/HEAD driftは`stale`へ送る。`failed/stale`から同じsnapshotをsilent rewriteせず、新snapshotを作る。

artifact publish後のDB faultだけはartifactを変更せず`projection_pending`へ遷移する。operation/digest、idempotency key、
expected artifact head、expected DB headをreceiptに固定し、Node reconcileが同じartifact bytesからprojection/event/current pointerを再構築する。
同key同digestは同receipt、異digest/head conflictはDB/current増分0、reconcile receiptはbefore/after headとtable別countを持つ。

## §5 failure契約

| code | 条件 | 副作用 |
|---|---|---|
| `HSCAP_SOURCE_UNAVAILABLE` | local source/ref/revisionなし | write 0 |
| `HSCAP_SOURCE_IDENTITY_MISMATCH` | archive/commit/tree digest不一致 | write 0 |
| `HSCAP_ENTRY_COUNT_MISMATCH` | 期待分母との差分 | activate 0 |
| `HSCAP_ENTRY_DUPLICATE` | family内stable entry ID重複 | commit 0 |
| `HSCAP_ENTRY_UNCLASSIFIED` | classification未解決 | activate 0 |
| `HSCAP_PATH_UNSAFE` | traversal、absolute、NUL、不正symlink | entry隔離、green 0 |
| `HSCAP_REF_SET_INCOMPLETE` | 固定5 refまたはoverlay証拠欠落 | activate 0 |
| `HSCAP_DENOMINATOR_OVERLAP` | main/ref/full-treeを二重算入 | receipt 0 |
| `HSCAP_ARTIFACT_CONFLICT` | 同一snapshot IDへ異bytes | overwrite 0 |
| `HSCAP_ARTIFACT_PUBLISH_FAILED` | fsync/rename/rollback失敗 | projection 0 |
| `HSCAP_PROJECTION_FAILED` | DB transaction/rebuild失敗 | current pointer 0 |
| `HSCAP_SNAPSHOT_STALE` | source/rule/schema/HEAD drift |旧receiptをstale化 |
| `HSCAP_INTERNAL_ERROR` | 未知例外を境界でcause digest付き変換 | current pointer 0、internal failure |

L6の`SourceCaptureFailureCodeV1`は上表13件のcapture-local causeに、HST/L3境界で正本化された
`HIL_SOURCE_*`／`HIL_ASSET_*` 7件を加えたclosed unionとする。`SourceCaptureFailureV1`は必ず
このcodeとcause digestを保持し、unknown文字列やunion外codeを通さない。

## §6 freeze条件

L5/L8 pairは、10 integration oracle、初期4,470件のgenerated manifest、全artifact digest、DB rebuild、
negative fixture、別runtime reviewが揃うまでdraftのままとする。capture完了をsource atomization完了、採否完了、
またはInfinity Loop全体の設計完了として数えない。

### §6.1 integration oracle追跡

| L5境界 | L8 oracle |
|---|---|
| real ZIP adapterとclassification | `IT-SCAP-001` |
| 前身5 ref、main、overlay非重複 | `IT-SCAP-002` |
| CURRENT seed full-tree分割 | `IT-SCAP-003` |
| 3 family量閉じとcoverage分離 | `IT-SCAP-004` |
| 不変artifact、event、DB projection/rebuild | `IT-SCAP-005` |
| source/rule driftとstale伝播 | `IT-SCAP-006` |
| Linux primary、Node authority、Bunなし実行 | `IT-SCAP-007` |
| cross-resource faultとfalse-active防止 | `IT-SCAP-008` |
| trusted manifest authorityとplan component | `IT-SCAP-009` |
| projection pending reconcile | `IT-SCAP-010` |

14 public APIはL6のprimary owner台帳に各一回だけ現れ、`planSourceCapture`は`resolveSourceCaptureAuthority`、`activateSourceSnapshot`は`verifySourceCapture`、`markSourceSnapshotStale`は`commitSourceCapture`の`mutation_component_of`として採点する。25 U、10 IT、4,470 entry分母は増減させない。

#### U単位のexact API→U→IT結線

API単位のIT集合を全owned Uへ直積展開してはならない。次表を25 Uの唯一のexact joinとする。

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

### §6.2 HST011主系の厳密追跡

| HSTケース | L8対応先 | 事前状態 | 期待状態 | 正規failure |
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

### trusted manifest authority追補

capture manifestはtrusted authority storeのcurrent headへexpected digestを指定して取得し、store receipt、manifest digest、HEADを
Nodeが照合する。caller提供manifestやstale store headはcapture plan 0とする。
