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

本設計はZIP、前身repository exact 2件のsealed Git ref authority、現行HELIX commit済みHEADを、再現可能な
`source_snapshot`へ取り込むcapture段階だけを扱う。required repository setは
`unison-ai-product/UT-TDD_AGENT-HARNESS`と`RetryYN/ai-dev-kit-vscode`である。behavior atom抽出、採否、
HIL/design/test/gate結線は後続段階であり、capture成功時も`behavior_atom_closed=false`、behavior atom coverageは
`0 / unknown`とする。

captureは次の3分母を混同しない。

| 分母 | 導出 | 重複規則 |
|---|---|---|
| ref denominator | exact 2 repositoryのcurrent authority receiptにあるadvertised ref row | repo＋full refnameで一意。symbolic `HEAD`とtag `^{}` pseudo-lineは分母外 |
| content denominator | sealed treeのunique `(repository_id, tree_oid, raw_path)` | 同一OIDを指すbranch/pull/tagでcontentを重複算入しない |
| edge denominator | 全`ref -> peeled object -> commit/tree -> entry` edge | alias refを落とさず、ref単位の到達証拠を全件保存 |

旧観測の4,470 entry、5 ref、full-tree 8,935行、current HEAD 1,931件はgap発見用historical seedであり、
active authorityやacceptance分母にしない。ZIPの703 entryもarchive digestへbindした観測値としてreceiptに保持し、
設計上の可変Git/current分母との固定合計を作らない。remote refのlive件数を本文へ焼き付けず、snapshotごとの
authority receiptから再計算する。

requestのsource identity/countはcaller自己申告をauthorityにしない。canonical source snapshot manifest digestへZIP archive SHA-256、
exact 2 repositoryのcurrent Git authority receipt set、current HEAD commit/tree、ref/content/edge denominator digestをbindした
authority inputをNodeが読取り、requestとexact照合する。不一致、repo/ref差替え、件数自己申告、stale receiptはwrite 0で拒否する。

## §1 module境界

| module | 責務 | 入力 | 出力 | 禁止 |
|---|---|---|---|---|
| `SourceCaptureCoordinator` | probe→enumerate→classify→render→commitを順序制御 | capture request、adapter registry | dry-run planまたはcommit receipt | network fetch、暗黙activate |
| `ZipCaptureAdapter` | central directoryとentry bytesを列挙 | local ZIP path＋期待digest | ZIP ref/entry stream | extract先への書込み、path traversal追従 |
| `GitRefAuthorityAcquirer` | remote advertisement A/B、exact OID materialize、object/tree/tag peel検証、sealed receipt CAS | required repo identity、namespace policy、quarantine mirror | current Git authority receipt | default clone、暗黙refspec、capture正本への直接write |
| `GitCaptureAdapter` | sealed local mirrorのcommit/tree/overlayを列挙 | current authority receipt＋sealed mirror | ref、unique tree entry、全ref-entry edge | fetch、checkout、network、working tree変更 |
| `CurrentHeadCaptureAdapter` | commit済みHEAD full treeを列挙 | repo root、commit/tree | core/outside非交差entry | untracked/foreign tree混入 |
| `SourceEntryClassifier` | versioned ruleで全entryを一意分類 | entry metadata/bytes | classification exactly 1 | default `other`で未分類隠蔽 |
| `SourceArtifactStore` | capture bundleとactivation bundleをtemp→fsync→renameでpublish | rendered/activation bundle | immutable bundle locator | overwrite、partial publish |
| `SourceCaptureProjection` | artifactからDB read modelをtransaction再構築 | committed receipt/bundle | current projection | artifactより先のDB current化 |

adapter contractは次で固定する。

```ts
interface SourceCaptureAdapterV1 {
  probe(input: AuthorizedSourceAdapterInputV1, ports: LocalCaptureRuntimePortsV1): Promise<SourceCaptureResultV1<SourceProbeResultV1>>;
  enumerate(probe: SourceProbeResultV1, ports: LocalCaptureRuntimePortsV1): Promise<SourceCaptureResultV1<SourceEntryBatchSequenceV1>>;
}

type SourceFamilyV1 = "zip" | "git" | "current-head";
type EntryClassV1 =
  | "runtime-source" | "test" | "design" | "rule" | "workflow"
  | "generated-fixture" | "binary" | "duplicate-alias" | "evidence-only"
  | "unclassified";
```

`probe`はsource identity、固定revision、期待count/digest、local-only制約を検証する。adapter内部はstreamを利用してよいが、
`enumerate`が全batchをconsumeし、mid-stream throw/rejectionを`HSCAP_INTERNAL_ERROR`へ変換したterminal resultだけを公開する。
Git adapterへ渡すportはsealed mirror object/tree/tag readとnetwork deny guardだけで、fetch/clone/socket capabilityを構造的に
持たない。sandbox receiptのnetwork attemptが1件でもあれば`HSCAP_OFFLINE_NETWORK_ATTEMPT`で失敗する。adapterはDB、repo正本、remoteへ書かない。
`SourceCaptureRequestV1`、`SourceProbeResultV1`、`SourceEntryV1`のexact fieldはL6 §2を正本とし、unversioned request/result/candidate名へ縮退しない。

## §2 正規bundle

immutable capture base rootは`.helix/evidence/source-capture/<snapshot_id>/base/`とし、次を必須にする。

| artifact | 内容 | 主な不変条件 |
|---|---|---|
| `capture-request.json` | source、revision、scope、adapter/rule version | canonical JSON、secret/PIIなし |
| `source-bundle.json` | snapshot identityと全digest root | schema/version/count固定 |
| `source-refs.jsonl` | archive/ref/commit/tree/merge-base、tag peel、symbolic target | repo＋full refname順、receipt ref集合とexact一致 |
| `source-entries.jsonl` | path、mode、size、blob digest、overlay operation | receipt由来content分母、entry ID一意 |
| `source-ref-entry-edges.jsonl` | refからpeeled object/tree/entryへの到達edge | receipt由来edge分母、alias ref省略0 |
| `git-authority-receipts.json` | exact 2 repoのauthority receipt参照とset digest | current/fresh/exact repo set |
| `entry-classifications.jsonl` | entry ID、class、rule ID/version、reason | entryごとexactly 1 |
| `capture-receipt.json` | command、exit、counts、digests、producer、status | bundle全bytesへdigest bind |

UTF-8、BOMなし、LF、path separator `/`、object key canonical order、stable ID順を使用する。raw path bytesと
表示用NFC pathは別fieldに保持し、Unicode正規化でentryを統合しない。bundleはcontent-addressedで、同一IDへ
異なるbytesを書こうとした場合は`HSCAP_ARTIFACT_CONFLICT`で拒否する。activationはbaseへappendせず、独立した
`.helix/evidence/source-activation/<snapshot_id>/<activation_revision>/source-activation.json`へcontent-addressed sealし、
append-only journal headで順序を固定する。base artifact root digestはactivation前後で不変とする。

## §3 DB projection契約

artifact bundleがcapture正本、`harness.db`は再構築可能なprojectionである。初期実装時に現行schema versionを
再確認し、次の10 tableを同一migration sliceで追加する。version番号は実装開始時のcurrent schemaから採番し、設計へ固定しない。

| table | key | 必須field / relation |
|---|---|---|
| `source_snapshots` | `snapshot_id` | family集合digest、bundle digest、status、behavior_atom_closed=false |
| `source_refs` | `source_ref_id` | snapshot外部key、kind、revision、tree、merge-base、counts |
| `source_entries` | `entry_id` | repository＋tree＋raw pathで一意なcontent、raw/display path、blob digest、mode、overlay operation。ref FKを持たない |
| `source_entry_classifications` | `classification_id` | entry FK＋rule revision一意、class、reason code |
| `source_capture_receipts` | `receipt_id` | snapshot FK一意、artifact root、count/digest、command evidence |
| `source_capture_events` | `event_id` | snapshot＋sequence一意、previous/event digest、actor、occurred_at |
| `git_ref_authorities` | `authority_receipt_id` | repository identity＋authority revision一意、A/B digest、sealed mirror digest、status |
| `git_advertised_refs` | `source_ref_id` | authority receipt FK、full refname、kind、advertised/peeled/tree OID、row digest |
| `git_ref_entry_edges` | `edge_id` | authority/ref/entry FKのM:N、peeled object/commit/tree/path、edge digest。alias refも全件保持 |
| `git_authority_dependencies` | `(authority_receipt_id, dependency_kind, dependency_id, registration_revision)` | snapshot/atomization/coverageへのappend-only世代edge、current digest/head/status、supersedes key、registration/supersession event digest。partial uniqueでauthority＋kindごとのcurrent consumerを一件にする |

projectionは一transactionで全行を検証してからcurrent化する。既存DB rebuildはregistered tableをtruncateするため、
table registry/schema migration、artifact再projection、rebuild testを同一実装sliceに含める。DBだけに存在するcapture、
Pythonからの直接write、partial row群、artifact digest不一致はcurrentとして読ませない。

## §4 CLIと状態遷移

```text
helix source capture --family <zip|git|current-head> --source <local-path> --revision <id> --dry-run --json
helix source capture --family <...> --source <local-path> --revision <id> --execute --json
helix source verify --snapshot <snapshot-id> --json
helix source activate --snapshot <snapshot-id> --json
helix source authority refresh --repo <predecessor-ut|legacy-helix> --dry-run --json
helix source authority refresh --repo <...> --execute --json
```

`dry-run`はdefaultでwrite 0、`execute`は明示必須とする。`capture`はlocal sourceだけを受け、clone/fetch/downloadを
行わない。`verify`はbundleを再読込してcount、digest、classification total、DB projection差分を返す。
`activate`はcapture receiptがgreen、exact 2 Git authority receiptsがcurrent/fresh、ref/content/edgeのexpected/observedが
それぞれexact、全content entry分類済み、unclassified 0、bundleとprojection一致の場合だけcurrent snapshot pointerを更新する。
activation bundleとdependency registration/retirement実rowを独立content-addressed journalへ先にsealし、同じDB transactionで
exact 2 authority各1件の旧`source-snapshot` current rowを`superseded`へ遷移する。旧snapshotにcurrent atomization/coverageが
存在すれば、その4 dependency rowだけでなくatomization stale event/projection/active pointerとcoverage receipt/current pointerも
同じtransactionで`stale`化してfalse-currentを残さず、新snapshot 2行をCAS登録する。retirement件数はdependency index rowの
初回0、consumer未生成の世代交代2、consumer生成済み6のexactいずれかとし、logical consumer transitionはそれぞれ0/0/2である。
consumerはatomization＋coverageのexact pair以外をbroken invariantとして拒否し、indexだけstale、domain本体だけcurrent、
omit/extra、head競合、任意write faultではpointer/receiptを0件にする。
consumer transitionはdigestだけで代理せず、atomization stale event、`status=stale` projection、active pointer clear、coverage status revision、
coverage current pointer clearの実payloadをactivation artifactへ封入する。artifact seal後にshared lifecycle entryをCAS appendし、そのentryを
DB commitの必須入力へ渡す。lifecycle append失敗はDB write 0、append後DB faultは同じartifact＋entryだけがreconcile可能なpendingとし、
lifecycleに存在しないDB current、別fork entry、receiptの自己申告headを拒否する。
activation receiptは独立journal locator/digest/headとregistration/retirement manifest rootを保持し、DB rebuildはimmutable base＋
activation/atomization artifactを共通`source-generation` lifecycle headの順に再生してindex、domain status、projection、pointerを復元する。
domain別のまとめ再生は禁止し、`S1 activation -> S1 atomization -> S2 activation(stale) -> S2 atomization`の因果順を固定する。
ただしbehavior atom freezeは開かない。

authority取得は`observed -> materializing -> verified -> sealed -> current`とし、terminalは
`drifted | incomplete | failed | stale | conflict`である。advertisement Aで得たexact OIDをquarantine namespaceへ
明示materializeし、object/type/tree/reachability/tag peelを検証した後にadvertisement Bを再取得する。A/Bのcanonical
refname＋OID setが完全一致したequality receiptと、quarantine cleanupまで完了したseal receiptをbundleへbindしたときだけ
trusted storeへexpected head/revision CASする。current receiptはremote identity、namespace、A/B equality、exact refspec、closure、
tag peel、unique content set、seal/cleanup、mirrorのdigest連鎖を全て保持する。capture CLI自身は引き続きlocal-onlyであり、trusted manifestの
exact 2 membership proofとcurrent receiptに対応するsealed mirror以外を読まず、network capabilityを受け取らない。

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
| `HSCAP_REF_SET_INCOMPLETE` | sealed mirrorとauthority receiptのref row差 | activate 0 |
| `HSCAP_DENOMINATOR_OVERLAP` | main/ref/full-treeを二重算入 | receipt 0 |
| `HSCAP_ARTIFACT_CONFLICT` | 同一snapshot IDへ異bytes | overwrite 0 |
| `HSCAP_ARTIFACT_PUBLISH_FAILED` | fsync/rename/rollback失敗 | projection 0 |
| `HSCAP_PROJECTION_FAILED` | DB transaction/rebuildまたはactivation artifact replay失敗 | current pointer 0 |
| `HSCAP_SNAPSHOT_STALE` | source/rule/schema/HEAD drift |旧receiptをstale化 |
| `HSCAP_INTERNAL_ERROR` | 未知例外を境界でcause digest付き変換 | current pointer 0、internal failure |
| `HSCAP_REMOTE_IDENTITY_MISMATCH` | required owner/repo/endpointとremote identity不一致 | authority candidate 0 |
| `HSCAP_REF_ADVERTISEMENT_UNAVAILABLE` | advertisement A/B取得不能 | seal 0 |
| `HSCAP_REF_ADVERTISEMENT_DRIFT` | A/B間でref add/delete/move/retarget | seal 0、旧authorityと全依存snapshot/atomization/coverageを同一transactionでstale、partial 0 |
| `HSCAP_REF_NAMESPACE_INVALID` | namespace外/malformed/pseudo refを分母へ混入 | seal 0 |
| `HSCAP_REF_OBJECT_INCOMPLETE` | exact OID/object/tree/reachability不足またはcorrupt | seal 0 |
| `HSCAP_TAG_PEEL_INVALID` | annotated/lightweight tagのpeel/target不整合 | seal 0 |
| `HSCAP_REF_AUTHORITY_CONFLICT` | trusted store CASまたはsame-operation digest競合 | current増分0 |
| `HSCAP_QUARANTINE_ISOLATION_FAILED` | exact refspec外write、default clone、quarantine scope escape、cleanup不成立 | seal 0、trusted store増分0 |
| `HSCAP_SEALED_BUNDLE_TAMPERED` | authority receipt、sealed bundle、mirror、closure/tag peel digestの推移的binding不一致 | capture/activate 0 |
| `HSCAP_OFFLINE_NETWORK_ATTEMPT` | sealed mirror capture中のfetch/clone/remote access | capture write 0、network attemptをterminal failure化 |

L6の`SourceCaptureFailureCodeV1`は上表23件のcapture-local causeに、HST/L3境界で正本化された
`HIL_SOURCE_*`／`HIL_ASSET_*` 7件と`HIL_PYTHON_AUTHORITY_BYPASS`を加えたclosed unionとする。`SourceCaptureFailureV1`は必ず
このcodeとcause digestを保持し、unknown文字列やunion外codeを通さない。

## §6 freeze条件

L5/L8 pairは、13 integration oracle、exact 2 repositoryのA/B一致済authority receipt、receipt由来3分母、全artifact digest、DB rebuild、
negative fixture、別runtime reviewが揃うまでdraftのままとする。capture完了をsource atomization完了、採否完了、
またはInfinity Loop全体の設計完了として数えない。

### §6.1 integration oracle追跡

| L5境界 | L8 oracle |
|---|---|
| real ZIP adapterとclassification | `IT-SCAP-001` |
| exact 2 repoのsealed all-advertised ref mirror | `IT-SCAP-002` |
| CURRENT seed full-tree分割 | `IT-SCAP-003` |
| receipt由来ref/content/edge量閉じとcoverage分離 | `IT-SCAP-004` |
| capture/activation不変artifact、event、dependency世代、DB projection/rebuild | `IT-SCAP-005` |
| source/rule driftとstale伝播 | `IT-SCAP-006` |
| Linux primary、Node authority、Bunなし実行 | `IT-SCAP-007` |
| cross-resource faultとfalse-active防止 | `IT-SCAP-008` |
| trusted manifest authorityとplan component | `IT-SCAP-009` |
| projection pending reconcile | `IT-SCAP-010` |
| recorded advertisement fixtureの全namespace materialize/seal | `IT-SCAP-011` |
| advertisement A/B raceとtag/pull変化 | `IT-SCAP-012` |
| authority CASとdependency index exact joinによるatomic stale propagation | `IT-SCAP-013` |

17 public APIはL6のprimary owner台帳に各一回だけ現れ、`planSourceCapture`は`resolveSourceCaptureAuthority`、`activateSourceSnapshot`は`verifySourceCapture`、`markSourceSnapshotStale`は`commitSourceCapture`の`mutation_component_of`として採点する。31 U、13 IT、receipt由来3分母をexact closure対象とする。

#### U単位のexact API→U→IT結線

API単位のIT集合を全owned Uへ直積展開してはならない。次表を31 Uの唯一のexact joinとする。

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

### §6.2 HST011主系の厳密追跡

| HSTケース | L8対応先 | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-011-01` | `IT-SCAP-004` | `coverage_ready` | `pair_freeze_ready` | `なし（正常系）` |
| `HST-CASE-011-02` | `IT-SCAP-001` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
| `HST-CASE-011-03` | `IT-SCAP-013` | `coverage_current` | `coverage_stale` | `HIL_SOURCE_SNAPSHOT_STALE` |
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
