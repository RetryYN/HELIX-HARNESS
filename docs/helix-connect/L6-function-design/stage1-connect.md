---
title: "HELIX-CONNECT Stage 1 L6 関数設計"
layer: L6
status: design_draft
owner: HELIX-CONNECT
parents:
  - HELIXCONNECT-L2-001
  - HELIXCONNECT-L2-002
  - HELIXCONNECT-L2-003
  - HELIXCONNECT-L2-004
  - HELIXCONNECT-L2-005
paired_l7: ../L7-unit-test-design/stage1-connect-unit-test-design.md
base: main `cb75db4daa35e84d4b2a02e3cb80dab6a84f127d`
---

# HELIX-CONNECT Stage 1 L6 関数設計

本書は固定されたStage 1の親要求とL4〜L5の論理契約を、実装可能な関数境界と入力・出力・依存へ分解する設計案である。設計案は実装、実通信、外部接続、運転、合格または権限を意味しない。検証側は[L7](../L7-unit-test-design/stage1-connect-unit-test-design.md)が対応し、期待oracleの正本は既存[L9](../L9-integration-verification/stage1-connect-integration-verification.md)である。

## 1. 固定対象、source bytes、authority境界

対象は承認済み`HELIXCONNECT-L2-001`〜`005`のStage 1、`version_target: 1.0`である。CONNECT-001の固定revisionは`617801a9e66fe6ff30bfddc8c1e72a3c43c2a722`、CONNECT-002〜005は`53fc2a1441b890b5bcd904e6d9805453c8c833d1`。L3/L10各文書bytesと親ごとの適用範囲は[L4 §1](../L4-basic-design/stage1-connect.md#1-対象範囲と固定source)および[義務crosswalk](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md)に従う。

以下の固定入力5文書はmain `74c64308ff9fc3e7eeec22b9821e99e66d63c218`の本文bytesを参照する。front matterの`base`は起草開始時点であり、この入力snapshotや最新mainを表さない。後続mainで更新された共通kernel本文へ、この固定SHAを継承しない。

| 固定入力文書 | SHA-256 |
|---|---|
| L4 `docs/helix-connect/L4-basic-design/stage1-connect.md` | `10711d9c3897f7351f6d8cc0535264d4b68f642a08177cf8373f030356741002` |
| L5 `docs/helix-connect/L5-detail-design/stage1-connect.md` | `7e5bb8a0f0756e76feaa101939a1d73940cceaba62e5b46034584ba4820772a0` |
| L8 `docs/helix-connect/L8-detail-verification/stage1-connect-detail-verification.md` | `8cf9f0326594629c64ade663e2df61bf7d382d238ae3f4ea958a331cb9699b62` |
| 既存L9 `docs/helix-connect/L9-integration-verification/stage1-connect-integration-verification.md` | `0e956080febe084fdf4747b6d9bd3f86ea6400a65e3ecc179d59566dabefc92a` |
| 共通kernel L5 `docs/helix-harness/L5-detail-design/common-kernel.md` | `3f3867df4e04927fbf05615984654f2994dd76ac71fed0ee420d5edce36a2c69` |

これらの値はこの設計候補の入力固定値であり、承認や実装の証明ではない。L9が定義済みの18件の`IV-CONNECT-*`を参照する。L6/L7は既存verifier IDを再定義・再採番しない。L7の`UT-CONNECT-*`はこの文書対内部のfixture locatorで、要求AC・L9 oracle IDではない。

### 1.1 旧HELIX source、保持と変更

L4/L5で再読した以下の旧資産本文の指定span・全体bytesとledger rowを、今回も対応根拠として保持する。ledgerは全件`unresolved`、`consumer_refs=[]`であり、旧consumerが現存・稼働するとは推定しない。archiveは参照のみで、旧runtime/test/CIは実行していない。

| Asset ID・旧source span | SHA-256 / ledger | 保持する意味 | 再利用・再導出・置換 |
|---|---|---|---|
| `LEGACY-ASSET-9A772391C7FB1298D45F` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56` | `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`; `unresolved`, `consumer_refs=[]` | functional/business/NFRの分離とFR/ACから対の検証へのtrace | 文書構造を意味再導出。旧L12、G3 gate、UI/CLI、旧progression authorityは置換・継承しない。 |
| `LEGACY-ASSET-F542125805B777D8A56A` `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13–21,148–168` | `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`; `unresolved`, `consumer_refs=[]` | 設計と検証設計の対、要求から下流へのtrace | 現行V-pairへ再導出。旧freeze/L10 UX/旧roleは持ち込まない。 |
| `LEGACY-ASSET-9B7682EBDEA171005D45` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md:22–29,58–64,68–95` | `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`; `unresolved`, `consumer_refs=[]` | source/consumer境界、versioned contract、driftの明示 | 隣接比較から境界の形だけ再導出。package profile/allowlist/release authority/promotion/algorithmは異なるため使わない。 |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md:15–32,48–58` | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`; `unresolved`, `consumer_refs=[]` | 入力・正常・negative・証拠の対応 | fixture構成の形をL8から再導出。旧oracle/profile/CLI/runtime/CIを移さない。 |
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md:19–27,39–67` | `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`; `unresolved`, `consumer_refs=[]` | NFR候補・測定対象・受入traceの分離 | 固定5候補をL3/L10から再導出。旧grade/timeout/confidence/approval snapshot値や共通SLAは継承しない。 |

### 1.2 責務と非作用境界

- CONNECTは論理connection identity、owner宣言、scope、互換照合、接続・operationに結び付いた端点観測、retry/traceの論理照合を担う。
- INFRASTRUCTUREが物理resource/network pathとその観測を所有する。logical routeから物理到達性を導かない。
- SECURITYが既存permission/data-use/classificationの適用を判断する。CONNECTは判定結果を保持するだけで新許可・policyを作らない。
- OSがassignmentと運転・attempt状態、開始/停止/再開を所有する。K7はgeneration pointerとEpochTokenだけに使い、operation/attempt fenceやidempotencyへ拡張しない。
- 両端ownerがbusiness意味と結果を所有する。HARNESSは検証scopeと証拠契約を所有する。技術receiptからbusiness success、approval、SECURITY permission、保存完了を生成しない。
- 全関数は合成入力に対するread-onlyの比較・検証候補である。保存、append、transport、network、credential/provider、実send/receive/retry、OS assignment変更を行わない。保存を必要とする場合は既存K5 writerの別境界であり、ここから呼び出したり保存済みと称したりしない。

## 2. 共通kernel型と照合順序

新しいresult型、K1 reason、K3 permission、拒否理由、owner、gateを導入しない。現在の共通kernel契約に合わせる。

1. **K1**: `Observed<T>`のValue/Unknown/Unobserved/Stale/NotApplicableの既存意味を保持する。域内不一致はL9が固定したclassに従う。NotApplicableを推測で生成しない。
2. **K2**: `ResultKey={operation, operation_version, subject, inputs, scope}`および`KeyOfResult=ResultKey | Rejected(missing_key | invalid_digest | duplicate_identity)`を使う。完全keyにはcanonical operation/version/scope、SubjectRefの完全識別、uniqueなidentity集合のinputsを束縛する。queryや時刻観測、SegmentHeadをraw key fieldへ追加しない。完全keyを作る前のrequired ref欠落・同identity異refは既存K2順序でRejectまたは診断可能な未観測として扱い、K1 Unknownを合成しない。
3. K2 lookupでは候補identity集合を完全keyと比較する。候補なし/identity集合違いは`Unobserved(not_run)`。同一identity・revision内でdigest等が競合する場合は`Unknown(conflict)`。完全一致があれば保存されたclassを返す。同一identityの旧revisionでprior `Value`しかなければ`Stale`であり、別identityの結果を転用しない。旧非ValueはK2の既存lookup classを保つ。
4. **K3**: 既存`PermissionQuery{operation,target,revision:SubjectRef,requested_scope,operation_inputs}`の5 fieldを使う。actor/environment/current contextはAPI callerの自己申告値で補わず、既存ownerのcurrent sourceから`resolve_authority_context`が解決する。K3の結果は`PermissionCheckResult | PermissionCheckDiagnostic`の現unionを維持する。permission判定とcompatibilityは別fieldの結果にする。
5. **K5/K6/K7/K8/K9/K10**: append-only evidence、receipt/provenance、generation pointer/EpochToken、input label、independent review、dependency declarationの既存契約を参照する。異なる責務をまとめて新しいAPI結果へしない。

`Rejected(missing_key)`は呼出し境界のkey構成失敗であり、L8が定めるsource-content欠落の`Unknown(missing_input)`や、owner observationにすでに含まれるUnknownとは区別する。L8のoracle期待を変更しない。

## 3. 関数設計

内部設計locatorを`CONNECT-FN-01`〜`CONNECT-FN-07`とする。各locatorはL5に既に定義されたAPIを指し、新API名やpublic schemaの定義ではない。`CONNECT-BIZ-BOUNDARY`と`CONNECT-NFR-OBSERVATION-HOLD`はAPIのないL8境界を指すだけである。

| L6 locator | 既存L5 API / L8範囲 | 入力・事前条件 | 処理・出力 | 非作用・不足時 |
|---|---|---|---|---|
| `CONNECT-FN-01` | `validate_connection_declaration`; `L8-CONNECT-001-*` | Source/consumer owner宣言のSubjectRef、identity、direction/scope、contract/adapter/transport/dependency refs、適用される既存識別子。明示されたregistration-only scopeも保持する。 | 宣言の完全性・同一性・適用scopeを純粋照合。K2 keyが完全ならL8/L9指定のK1 observationを返す候補。 | 登録保存・permission・send許可を発行しない。owner ref自体が欠けてResultKeyが作れなければ既存`Rejected(missing_key)`境界。keyが完全でsource contentだけ欠けるケースはL8の`Unknown(missing_input)`を保つ。 |
| `CONNECT-FN-02` | `compare_compatibility`; `L8-CONNECT-002-*` | 登録時とcurrentの端点・意味contract・adapter/transport・compatibility range/dependency revision refs、宣言されたread scope。登録時と実使用時を別fieldにする。 | 固定されたrevision pairを純粋比較し、互換結果と原因revisionを保持。K2で同一identityのprior Valueを新revision keyから引く場合は`Stale(prior=Value, recorded_key, current_key)`。 | revision登録、scopeまたはcurrent sourceを補完しない。物理経路は読まず、send eligibilityをこの結果から導出しない。 |
| `CONNECT-FN-03` | `check_send_eligibility`; L8のauthority/scope/expiry/send-deny行 | 既存current `OperationDecl`から解決されるoperation、target、revision SubjectRef、requested scope、operation_inputs、およびowner-current authority/data-use refs。actor/environmentはcaller入力でなくcurrent owner resolverから解決する。 | 既存K3 permission query/checkの結果をその型のまま返し、compatibilityとは別結果に保持する。 | 新permission、policy、operation kindを作らない。owner mapping/contextが解決しない操作だけ非肯定。送信せず、attemptを開始しない。 |
| `CONNECT-FN-04` | `bind_endpoint_observations`; `L8-CONNECT-003-*` | connection/operation identity、使用contract revision、correlation/idempotency refs、双方のowner receipt/required handoff/schema refs、scope。全refsはK2 keyへ束縛する。 | 両端の技術観測を個別保持し、同じconnection/operation/revisionへのbindingとrequired refの完全性を照合する。 | receipt authenticity、physical send/receive、business completionを証明しない。one-side missing/stale/conflictを相手側の値で埋めない。 |
| `CONNECT-FN-05` | `assess_retry`; `L8-CONNECT-004-*`, `L8-CONNECT-NFR-001-*` | Same operation identity/content digest、prior attempt/result ref、single contract revision、failure classification、owner-declared retry boundary、existing authority/expiry refs。 | retry可否のpure candidate assessmentとunfinished statusを返す。same identity+digestのeffect countは増加させず、L8の境界値を測定対象へ対応させる。 | retry送信、backoff/timeout/上限値新設、business resultの再試行は行わない。prior Valueのrevision driftをK2 current keyへ流用しない。 |
| `CONNECT-FN-06` | `validate_trace_append`; `L8-CONNECT-005-*`, `L8-CONNECT-NFR-004-*` | `DeclaredEvent{event_type,refs}`候補、current `LogDecl.event_types`、connection/operation/contract/attempt refs、data-use識別子とrequired evidence refs。raw payload/secret/credential値を含めない。 | 宣言済event type、ref完全性、order/immutabilityとの整合をread-onlyで照合し、K1観測とK5 append境界を分ける。 | append/writeせず、K5 `Rejected(reason)`をK1 Unknownに写さない。欠落required inputのK1 `Unknown(missing_input)`はL8どおり保持。保存件数candidateも実測値にしない。 |
| `CONNECT-FN-07` | `measure_connection_nfr`; `L8-CONNECT-NFR-005-*` | NFR ID、根拠付き候補/declared value、測定条件・method、fixture evidence refs。 | 固定5候補のうち対象NFRのみについてmeasurement evidenceを参照し、candidateと観測を区別する。 | threshold、common SLA、実測・承認済み実装値を発明しない。evidenceがなければ達成とはしない。 |
| `CONNECT-NFR-OBSERVATION-HOLD` | L8 `L8-CONNECT-NFR-002-LOCAL-HOLD` | receiver effect observation APIがL5に定義されていないという固定境界。 | API呼出しも測定結果も生成しない。L9の局所holdをそのまま参照する。 | 新API、receiver state、effect receiptを補わない。 |
| `CONNECT-BIZ-BOUNDARY` | L8 `L8-CONNECT-BIZ-001-*` 48件 | 12固定source caseそれぞれの技術statusと、business success/approval/SECURITY permission/save-completeのprojection要求。 | APIを呼ばず、negative oracleとして禁止projectionの不在だけを照合する。 | 48行とも出力APIなし。business resultやK1 business resultを作らない。 |

### 3.1 関数依存と境界

`CONNECT-FN-01`のdeclaration観測を、保存済登録として扱うには既存owner/K5 writerの証拠が別途必要である。`CONNECT-FN-02`のcompatibilityと`CONNECT-FN-03`のK3 permission checkは独立しており、一方を他方から推論しない。`CONNECT-FN-04`は両端の技術観測を束ねるだけで、K3のpermission resultをoperation executionへ読み替えない。`CONNECT-FN-05`はassessmentであってK7 pointer/EpochToken操作を行わない。`CONNECT-FN-06`はevent候補の照合で、K5 appendそのものではない。L9が要求するnormal/negative/Unknown expectationとfixture単位は[L7 §3](../L7-unit-test-design/stage1-connect-unit-test-design.md#3-fixture-matrix)で固定する。

## 4. 実装候補と依存

L6/L7実装候補はCPython 3.11以降と標準ライブラリ、`unittest`とする。理由はpair内の処理がbytes/ref/keyの正規化、pure comparison、日時値の構造検査、表形式fixtureの検証で足り、L5/L8から外部package/runtime/providerは要求されないためである。これは実装上の技術候補で、親要件、承認、共通toolchain登録、実行済み証拠ではない。浮動point計算やnetwork clientは追加しない。

関数の依存方向はL5の既存API型とK1/K2/K3/K5/K6/K7/K8契約から内部判定へ向ける。`validate_connection_declaration`等の名前は既存L5 APIであり、関数シグネチャとpublic record schemaはL5および既存kernelを超えて拡張しない。K2 canonical operation version、SubjectRefの全field、query/inputs digestは現行kernel canonicalizationを使う。未宣言fieldを補う独自serializerやAPI result wrapperを作らない。

## 5. 未決と検証範囲

物理path/transport、実operation owner mapping、ownerが保持する外部receiptの真性、永続writer実装、実送受信・retry実行、measurement sourceの実在は本書から確定しない。未解決なら影響するoperation/fixtureのみ非肯定またはL9既存holdにする。全Stage/全接続の停止、追加owner/gate、L2要求変更は作らない。formal L7 fixtureは設計のみで未実行である。§6のprivate helper実装・補助testは範囲限定のsource候補であり、正式L5 API、formal coverage、独立review、CI、L8/L9適合、運転結果を主張しない。

## 6. ローカルsource候補の実装範囲

次の記録はmain `4b647b837d5fe1f873611907fca373ac8239a928`上のローカルsource-only候補である。正式pack、declaration、型番・版・owner登録、L5公開API実装、owner reader接続、L8/L9適合、運転・配布を意味しない。§1の共通kernel L5 pin `3f3867…`は当時の固定入力snapshotとして残す。下表の現行実装参照は後続mainの設計/実装時点を別に示す。

| 参照 | 現行main 4bのSHA-256 | この候補での使い方 |
|---|---|---|
| `docs/helix-harness/L5-detail-design/common-kernel.md` | `1310b538c268532a4aa15d3b47048bcdf592e6a6a85af88c2fb9fa08986a43a7` | `Observed<T>`とK1各classの既存形を確認する現行設計参照。 |
| `helix/helix-harness/units/common-kernel/src/common_kernel.py` | `ce9c7a87cd318c2ff5d12f68c71129f6ad99f0b78616f89c501ccdd2c4643178` | private helperが型検査する既存`Value`/`Unknown`/`Unobserved`/`Stale`/`NotApplicable`と`SubjectRef`の実装参照。 |
| `helix/helix-connect/units/connect-stage1/src/connection_contract.py` | `e98e09c1eaa2b20c17891dfa0c2c1d1fb7510eeef3d53880847cfd02c3dcbd72` | 既存`SubjectRef`とK1 `Observed`を明示slot順で保持するprivate helperのみ。 |
| `helix/helix-connect/units/connect-stage1/tests/test_connection_contract.py` | `19f9efdba21ca5965f78a30ae43ed08e29adccfb98d673fe96a150bbb119a04e` | synthetic helper probes。正式L7 fixtureの完了証拠ではない。 |

この実装はL5公開APIを一つも実装しない。private `_retain_observation_slots`は`(slot name, existing SubjectRef, existing K1 Observed)`行を与えられた順で返し、重複除去、順序判定、field選択、意味比較、K1 class/reason選択、K2 key作成、owner current-source読取をしない。helperのPython call-shape `TypeError`はCONNECT/K1のresultや診断ではない。

| L6 locator / L5 API | 状態と未接続境界 |
|---|---|
| `CONNECT-FN-01` / `validate_connection_declaration` | 未実装。current source/consumer declaration reader、K2 key binding、宣言妥当性の結果mappingが未接続。 |
| `CONNECT-FN-02` / `compare_compatibility` | 未実装。登録/current revision readerと完全key lookupを結ぶowner境界が未接続。 |
| `CONNECT-FN-03` / `check_send_eligibility` | 未実装。current `OperationDecl`/actor/environment resolverと既存K3 query/resultのowner compositionが未接続。caller authority/queryは受け取らない。 |
| `CONNECT-FN-04` / `bind_endpoint_observations` | 公開APIは未実装。private slot helperは既に与えられたendpoint observationsの保持のみを検査し、同一性・相関・required ref・期待classを判定しない。 |
| `CONNECT-FN-05` / `assess_retry` | 未実装。failure/authority/expiryのowner observationと実operation attempt境界は未接続。retry/sendは行わない。 |
| `CONNECT-FN-06` / `validate_trace_append` | 未実装。current K5 prefix/LogDecl readerとの結合がなく、event order/append判定も行わない。append/writeは行わない。 |
| `CONNECT-FN-07` / `measure_connection_nfr` | 未実装。measurement source/method/evidenceが未接続。実測や達成判定をしない。 |
| `CONNECT-NFR-OBSERVATION-HOLD` / `UT-CONNECT-088` | L9既存局所holdのまま。receiver effect observation APIを作らない。 |
| `CONNECT-BIZ-BOUNDARY` / `UT-CONNECT-090–137` | business-result APIを作らない。正式L7 negative fixtureの実行/不在検証を主張しない。 |

正式L7の152 locatorは全て未実行の設計fixtureのままであり、4件のsupplemental helper testをformal locatorへ割り当てない。実行範囲、具体的test method、expected resultの区別は対の[L7 §5](../L7-unit-test-design/stage1-connect-unit-test-design.md#5-ローカルhelper検証状況)に記録する。
