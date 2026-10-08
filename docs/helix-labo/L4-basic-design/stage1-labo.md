# HELIX-LABO Stage 1 基本設計（親001／011）

## 1. 範囲と正本

本設計は、`HELIXLABO-L2-001` Aggregate と `HELIXLABO-L2-011` Aggregate-to-Correlate を対象とする。対象親は固定L2/L11に結び付いたL3/L10 revision `8fb2ae97960ad0f7a84380e3d52ab99920ee2dc7` の二親に限る。L3の機能ACは4件、L10機能caseは001の15件と011の13件であり、対のL9 §3の一行ごとに個別照合する。隣接するStage 2bの機能要件は対象外である。

このrevisionは `PIN-LABO-8fb2ae97` として承認され、判断記録は [`helix-labo-stage1-l3-l10-po-decision-2026-10-05.md`](../../governance/decisions/helix-labo-stage1-l3-l10-po-decision-2026-10-05.md) にある。Opus/Fable一致、親固定、6本文全体のpin、main反映後の効力は[Stage 1義務照合表](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md) §「権限連鎖」に従う。crosswalkは権限の新設ではなく索引である。比較用の現行bytesや後続Stageの本文をこの承認revisionの代用にしない。

| 固定本文（承認対象revision） | SHA-256 |
|---|---|
| L3業務 `docs/helix-labo/L3-requirements/business-requirements.md` | `af7c875eb2e43b99f85c092baf7cbb0379ec6b8c5c08c9e01f39f8b72f1192d0` |
| L3機能 `docs/helix-labo/L3-requirements/functional-requirements.md` | `6a2909c6163350025eadaa8fe028b9ab50376ebb07b6f2bd7666c17540261fb8` |
| L3 NFR `docs/helix-labo/L3-requirements/nfr-grade.md` | `95faea76e433f4144bf8b255b6b83a602161084b625a0bc095bda39d4bd416e8` |
| L10業務 `docs/helix-labo/L10-verification/business-verification.md` | `603612c09603d6be3c5b1d45bcbafbe7281457454474acef38d4ddb6e7e13d37` |
| L10機能 `docs/helix-labo/L10-verification/functional-verification.md` | `79a5e56ca68681136355c1f2d62bff8e9b8bb0b119565edeb4c75a71fad6e8d8` |
| L10 NFR `docs/helix-labo/L10-verification/nfr-verification.md` | `97545f30c540e63141e8cb53e27969b9f3d094d12580be03c99836086b7bc4eb` |

### 1.1 固定親、業務境界、依存

| 親 | L2/L11根拠と境界 | AC |
|---|---|---|
| 001 | L2 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、`labo-requirements.md:69–76`（本文SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`）、L11同revision `labo-acceptance.md:43–47,109–116`（本文SHA `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`）。20 observation field、7 source status、source identity/revision/provenance、source authorityをsource ownerに残すこと、書戻しなし。選択されたL2-021〜030の採択済みsource contractだけを対象にし、L2-031/032 Web/WEB-OSは選択時のみ任意接続。 | `LABO-001-AC-01/02` |
| 011 | 同じ固定L2/L11 revision。L2 `labo-requirements.md:163–166`（本文SHAは上記）、L11 `labo-acceptance.md:60–64,109–116`（本文SHAは上記）。Aggregate observationからepisode候補へ元source observation/revisionの往復参照と欠測を保つ。relation/evidenceは因果確定ではない。 | `LABO-011-AC-01/02` |

L3/L10業務本文はこの二親に独立したbusiness outcome/ACを定めず、機能ACと対L10で成果・失敗を照合し、観測からsource state/authority/業務完了を生成しない。これをL4で補わない。Stage 1の順序は `version_target: 1.0` のままとする。

011の技術接続は、採択済みCONNECT L2-001/002/003と対応L11の登録済みconnection identity、両端contract revision、scope・互換性・契約束縛通信fixtureへ接続する。要求ID `HELIXLABO-L2-011` は実connection identityではない。connection、operation、contract identity/revision、scope、schema/provenanceは別fieldのまま保持する。設計は既存adapter/authority契約の再利用であり、実通信や新しいpermissionを許可しない。実作用を伴う呼出しは既存K3/K7およびconnection ownerの現行契約が確定しない限り `Unknown`/hold とする。

## 2. 共通カーネルとの接続

本書は共通カーネルL4 [`common-kernel.md`](../../helix-harness/L4-basic-design/common-kernel.md)（SHA-256 `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696`）の型/APIを再利用する。対の既存L9 [`common-kernel-integration-verification.md`](../../helix-harness/L9-integration-verification/common-kernel-integration-verification.md)（SHA-256 `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`）が定める検証契約と別に、ここではLABO固有のデータ境界を定める。

| 既存契約 | LABOでの用途 | 保持する境界 |
|---|---|---|
| K1 `Observed<T>`（§2） | 各source読取・項目照合・往復照合の `Value` / `Unknown` / `Unobserved` / `Stale` / `NotApplicable` を元型のまま運ぶ。sourceの文字列status `unknown` / `not_observed` とK1の判定クラスは別fieldである。 | `Value`でない結果を空集合・成功・不存在へ写さず、reasonと成分を残す。異種成分はK1の成分別 `PolarityOf`/`combine` 契約に従い、独自の縮約値を作らない。 |
| K2 identity/revision/digest鍵（§3） | source observation、集積結果、episode候補、connection contract照合の各operationを別の完全な `ResultKey` で `key_of` / `record` / `lookup` する。 | source identity、revision、digest、scope、operation、operation version、正規化済みinput refsを鍵へ結ぶ。欠落はK2 `missing_key`、digest不正は`invalid_digest`、同一identityの重複競合は`duplicate_identity`の既存順。異なるsourceを一つのidentityへ混ぜない。 |
| K3 authority照合（§16）とK7 operation/CAS（§15） | 読取り／CONNECT adapter呼出しが既存authority記録を要する既存operationである場合に限り、そのadapterが構成するoperation tupleと既存許可を照合する。 | L2親IDを許可・connection identityに流用しない。既存許可がない、query/target/契約owner対応が解決不能ならK3診断またはK1 Unknownを保持し、操作を実行成功にしない。新しい許可やapproval gateは作らない。 |
| K6 evidence（§10） | 既存の検証receiptがsource/contractの検証材料として使われる場合、保存鍵と実読した入力を照合する。 | receiptはsourceの真正性・実作用・実通信を証明しない。source ownerの原記録はsource readerで別に読む。 |
| K10 dependency（§14） | 選択source contractと、その宣言が明示する必須依存を参照する。 | graph/declarationは実行済み証拠ではない。選択済み依存の欠落・unknown・staleは該当source/operationだけを止める。未選択の任意Web依存を必須化しない。 |

Web/WEB-OS 031/032のsource contractは未選択ならoptional/unconfiguredであり、1.0必須依存にしない。選択した合成入力では、そのsource contractのaccepted identity/revision/scopeを固定し、その範囲だけで観測を扱う。選択状態を保ったままcontractのaccepted根拠だけを欠落させた入力は取り込み成功にせず、元recordを保持して該当source ownerへ返す。契約の実在・採択や将来Web機能をこの設計から生成しない。これは固定L10 NFR:9の選択側を具体化した条件分岐である。

K4/K5/G3/K8/K9等はそれぞれの共通契約がLABO操作に適用される場合だけ使用する。無関係な契約の状態・authority・receiptを代用しない。K1/K2の値型、優先順位、鍵仕様をここで変更しない。

## 3. データ型と操作

### 3.1 入力・保存型

```text
SourceObservation = {
  observation_id: SubjectRef,
  source: SubjectRef,                 // source identity + exact revision + digest
  source_contract: SubjectRef,        // 選択されたadmitted contract identity/revision/digest
  scope: SubjectRef,
  schema: SubjectRef,
  provenance: SubjectRef,
  source_status: SourceDeclaredStatus,
  fields: Map<ObservationField, SourceDeclaredValue>
}

ObservationField = episode_id | requirement_revision | ticket_id |
  responsibility_id | product | mechanism | worker | provider | model |
  configuration | artifact | "CI/test" | release | deployment | runtime |
  failure | rework | cost | time | result

SourceDeclaredStatus = success | failure | rejected | cancelled | blocked |
  unknown | not_observed

AggregateObservation = {
  source_observation_ref: SubjectRef,
  exact_source: SubjectRef,
  source_status: SourceDeclaredStatus,
  field_presence: Map<ObservationField, Present<SourceDeclaredValue> | Missing>,
  lab_processing: Observed<LabProcessingDisposition>
}

EpisodeCandidate = {
  candidate_ref: SubjectRef,
  observation_refs: NonEmptyList<SubjectRef>,
  source_refs: NonEmptyList<SubjectRef>,
  source_contract_refs: NonEmptyList<SubjectRef>,
  schema_refs: NonEmptyList<SubjectRef>,
  provenance_refs: NonEmptyList<SubjectRef>,
  relation: Observed<SourceDeclaredRelation>,
  causal_assertion: false
}
```

`SourceDeclaredValue`, `SourceDeclaredStatus`, `SourceDeclaredRelation`, `LabProcessingDisposition`, `Present`, `Missing`はこの入力/出力の区別を表すスキーマ上のfieldであり、K1の判定型を拡張しない。実際のfield型・必須性・status語彙・provenance構文は選択sourceのadmitted contractが宣言する。未登録schemaやowner契約、固定親で定義されないrelationは `Unknown(unsupported|unregistered|missing_input)` 等、実際の原因に合う既存K1 reasonに写し、架空値を補わない。

`source`はsource identityとその正確なrevision/digestを一つの `SubjectRef` として持つ。schema、scope、provenance、contractは独立refで保存し、source identityと混同しない。履歴sourceはその時点のrefを保持してhistoricalとして読める。過去refをcurrentに偽装した入力はcurrent一致として扱わない。source側のcanonical state/authorityと原recordはsource ownerに残り、LABO recordは観測内容と固定参照だけを持つ。

### 3.2 API境界と処理

| API境界 | 入力 | 出力・保存 | エラーとownerへの返却 |
|---|---|---|---|
| `observe_source(contract_ref, source_ref, scope_ref, input_heads)` | 選択されたadmitted contract、source ownerが宣言するsource ref、scope、共通K7等で解決したcurrent input heads。callerがsourceのstatus/authority/current性を自己申告して代用しない。 | source ownerのread-only adapterが返したraw record、digest、source revision、schema/provenanceをそのまま`SourceObservation`へ束縛する。operation resultをK1/K2で記録する。 | current owner declaration/reader/contract欠落は既存K1 `Unknown(unregistered\|missing_input)`、読取不能は`Unknown(unreadable)`、未着は`Unobserved(not_run)`。影響sourceだけを保留しsource ownerへ返す。 |
| `aggregate_observations(selected_sources, input_heads)` | 選択されたsource refsの集合。sourceごとにcontractとscopeを明示。 | sourceごとに独立した `AggregateObservation` を作り、20 fieldと実在status、raw source ref、観測時点、presence/missingnessを保持。入力集合とoperationをK2 keyへ束縛する。 | 1 sourceの破損・field欠落はそのrecordだけ処理holdにし、他sourceの有効recordを維持。欠落や権限外情報は固定L2-001:73のsource責務へ。異identity混合やcurrent偽装は元記録を保ってholdし、新routeを作らない。 |
| `correlate_observations(aggregate_refs, selected_connection, input_heads)` | Aggregate refs、選択したCONNECT connection identity、admitted contract revision、scope、schema/provenance、relation入力。要求親IDはconnection identityに使わない。 | `EpisodeCandidate`。候補から各元observationとsource revisionへ往復できるrefを保持。欠測・unresolved relationをそのまま表現。connection技術結果はその別成分としてK1/K2で保持。 | relation不一致の根拠がある場合だけ固定L2-011のCorrelate ownerへ返す。observation ID/source revision欠落は依存L2-001:73のsource責務へ。revision不一致、contract比較不能、別connection receiptは元記録保持のhold/Unknownで停止し新routeを作らない。 |

`ObservationField`の20個はL2-001の列挙を順序を保って写したもの。観測時点は追加fieldとして発明せず、親が要求する`time`とsource provenanceの宣言範囲で保持する。正規化はcontractが明示する場合だけ行い、raw observed valueを別保存する。statusの値 `unknown` / `not_observed` はsourceが報告した事実であり、K1の `Unknown` / `Unobserved` と同じ列にしない。各source readとLABO processing outcomeを別成分で保持するため、一方の処理警告がsource statusを上書きしない。

011ではepisode candidateからobservation/source identity/revisionと、そのobservationに束縛されたsource contract/schema/provenance refsを個別に元値へ往復できるようにする。ref先recordはimmutableなsource observationとし、後からcurrent値へ差替えない。relationは相関候補としてのみ保存する。時間・path近接や因果らしいevidenceも原因を確定しない。L2-002の時間/path条件は別の固定親条件として保持し、011に未指定のjoin key、time window、similarity score、因果confidence threshold、correlation algorithmを定義しない。

### 3.3 NFRと業務要件へのtrace

業務は独立outcomeを追加しない（固定L3/L10業務全体各2行）。以下は固定L3 NFR:7–11と対L10 NFR:7–11にある5測定項目を設計境界へ結ぶもので、実測結果や追加SLOではない。

| 固定NFR項目 | 設計上の観測と反例 | 適用範囲 |
|---|---|---|
| 001: observation field coverage（L3 NFR:7 / L10 NFR:7） | 20 fieldのpresent/missingをsource別に記録。1項目ずつ欠落した反例でも推測補完しない。 | 001のみ |
| 001: status coverage and fidelity（:8 / :7） | 7 source statusを個別に保持し、非success eventの脱落0、未発生statusの生成0、`unknown`/`not_observed` success化0を照合する。 | 001のみ |
| 001: source authority leakage（:9 / :8） | source owner stateへ書き戻さず、LABO processing outcomeをsource statusと分ける。新しいclassification detectorは追加しない。 | 001のみ |
| 011: roundtrip reference completeness（:10 / :10） | episode candidateから元observation/source identity/revisionへ往復し、欠測も保持。join/time-window/similarity方式は未指定のまま。 | 011のみ |
| 011: false causality（:11 / :11） | L2-011出力のcausal assertionを0に保つ。evidenceあり/時刻・pathだけの別fixtureを照合する。 | 011のみ |

旧NFRのIPA grade、memory/timeout/confidence値、旧承認/CIは移さない。L3 NFR:13の候補選択/測定の共通注記も保ち、これらの技術候補は固定L3/L10本文の承認scope内に記載された検証設計値であると扱う。採択済み実装値・実測結果ではなく、parameterごとのPO gateを追加しない。

## 4. 旧HELIXとの対応と変更理由

旧資産は `docs/governance/legacy-asset-reuse-control.md`、資産明細台帳の各行、固定L3機能/NFR本文に示されたsource/consumer/failureを起点に確認した。以下は本設計での意味の扱いであり、台帳dispositionの変更やverbatim copyを主張しない。旧test/runtime/CIは実行・再利用しない。

| Asset ID / source（path、行、full SHA-256） | 観測したconsumer/failure | 保持・変更 |
|---|---|---|
| `LEGACY-ASSET-F542125805B777D8A56A` `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13–21,101,148–168` SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`；`LEGACY-ASSET-B30F3C82B6B0FDC0D2A8` `archive/legacy-generation-2026-09-14/root/docs/process/gates.md:41,64` SHA `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`；`LEGACY-ASSET-6EBDB617A8104A7756D0` `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82–85` SHA `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb` | FR+AC/対応検証、工程上の対、AI起草と人の上流要件承認。旧層名・runtime手順は現行責務ではない。 | 要件と検証の対応、L3上流境界を保持。Stage 1固定親に合わせて再導出し、旧工程名/runtime/sub-gateは置換。 |
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:137–145` SHA `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | BR-21 dashboardのAC-FR-BR21-09ではinvocation_log破損を個別skipし、警告しつつ他3 sourceの集計を維持する。 | 部分source failure時に無関係なsourceを保持するfailure classだけ再導出。旧HARNESS dashboard、4 source/5 metric/30秒poll/token costは移さない。 |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:22–34` SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`；`LEGACY-ASSET-EE5DBACC7F28F7D1F605` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:134–153,178–190` SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | 旧HARNESS一般FRおよび旧HELIX機能要求。現行LABO source-observation/correlationとの同一interfaceは固定L3で確認されていない。 | 直接移植なし。固定L2/L11へ意味を再導出し、旧FR ID・command・runtimeは置換。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:43–50,67–90,91–120` SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 旧受入test designは対のoracle/異常・境界caseを担う。旧caseは現行L2-001/011への直接一致ではない。 | caseごとの異常分離という設計意図だけを再導出。旧case ID、数値、fixture、runtimeは置換し、現行L10の28 caseを正とする。 |
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md:1–73` SHA `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`；`LEGACY-ASSET-DB669724249A14A665F0` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–34,58–74` SHA `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d` | 旧NFR projection、IPA grade、HARNESSのmemory/timeout/confidence等の数値と計測consumer。LABOの固定NFRは20 field/status/owner/roundtrip中心。 | 測定根拠と対の観測へ結ぶ構造のみ再導出。旧grade、閾値、旧承認・CI・consumerを置換。 |

台帳上の該当assetは `Historical` / `unresolved` で、consumer_refsは空欄である。空欄をconsumer不在の証明やcopy許可にしない。本書は新世代L4/L9のtraceを作るだけで、旧資産の正式dispositionは変更しない。

## 5. 未解決条件と状態保持

| 条件 | 結果 | 停止範囲 |
|---|---|---|
| source/contract/scope/schema/provenanceのowner宣言またはcurrent revisionを解決できない | `Unknown(missing_input\|unregistered\|unsupported\|unreadable)` 等、実際の原因を保持。 | 当該sourceまたはconnection operationのみ。 |
| 読取未着、選択sourceが未選択 | `Unobserved(not_run)` またはsource未選択の既存明示状態。件数0やpassを作らない。 | 当該source operationのみ。 |
| 許可sourceのobservation ID/source revision欠落 | 元recordを保持し、固定L2-001:73に従いsource責務へ戻す。 | 当該record。 |
| identity/revision不一致、relationに根拠がない、connection receipt不一致 | 元recordを保持してhold/Unknown。source revision不一致をrelation不一致としてCorrelateへ送らない。 | 当該episode/connection operation。 |
| source status=`unknown`/`not_observed`、一source破損、部分field欠落 | sourceのraw statusとrecordを保持し、LABO processing結果を別成分で記録。成功へ補完しない。 | 当該source record。 |
| 選択されたCONNECT既存contractに明記された技術failure | そのcontractの明示戻し先だけを使う。明記がなければUnknown/staleで停止しownerを創作しない。 | 当該connection。 |

この表は新routeや新しい人間gateではない。要件意味・owner・version変更や新しい共通型が必要な場合は上流の既存境界へ戻す。未解決のsourceは他の有効sourceを無効化しない。
