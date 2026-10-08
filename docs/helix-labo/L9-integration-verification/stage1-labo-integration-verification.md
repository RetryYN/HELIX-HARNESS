# HELIX-LABO Stage 1 L4/L9統合検証設計（親001／011）

## 1. 検証範囲と固定入力

本書は [Stage 1基本設計](../L4-basic-design/stage1-labo.md) の対となる未実行のL9検証設計である。L4の本文SHA-256は `b5a0f984cf317a1aea7c6511c5d4ea1036df3e7dc1b9b05273a1ced6ea3d0062`。固定L3/L10対象は承認revision `8fb2ae97960ad0f7a84380e3d52ab99920ee2dc7` の二親 `LABO-001` / `LABO-011` に限定する。L3機能ACは合計4件、L10機能caseは合計28件であり、全件を§3に個別定義する。実行済み・pass・製品成果を主張しない。

承認された6本文pinと権限連鎖は[L4 §1](../L4-basic-design/stage1-labo.md#1-範囲と正本)を参照する。六文書のSHAは順に、L3業務 `af7c875eb2e43b99f85c092baf7cbb0379ec6b8c5c08c9e01f39f8b72f1192d0`、L3機能 `6a2909c6163350025eadaa8fe028b9ab50376ebb07b6f2bd7666c17540261fb8`、L3 NFR `95faea76e433f4144bf8b255b6b83a602161084b625a0bc095bda39d4bd416e8`、L10業務 `603612c09603d6be3c5b1d45bcbafbe7281457454474acef38d4ddb6e7e13d37`、L10機能 `79a5e56ca68681136355c1f2d62bff8e9b8bb0b119565edeb4c75a71fad6e8d8`、L10 NFR `97545f30c540e63141e8cb53e27969b9f3d094d12580be03c99836086b7bc4eb`。

対の共通kernelは [L4 common-kernel](../../helix-harness/L4-basic-design/common-kernel.md) SHA-256 `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b` と [L9 common-kernel integration verification](../../helix-harness/L9-integration-verification/common-kernel-integration-verification.md) SHA-256 `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b`。共通型・鍵・authorityの挙動は各IV-K契約を使い、このpairで再定義しない。

## 2. 共有入力、記録、判定

Fixtureはsource ownerが許可した合成recordとsource contract declarationを用いる。実source read・CONNECT実通信・L10実行がない場合はその事実を維持する。各L9 caseは`case_id`, fixed parent revision, source identity/revision/digest, contract identity/revision/digest, scope, schema, provenance, input refs, source status, 欠測field, 元記録digest, oracle classとreasonを別fieldで記録する。結果の型は共通K1 `Observed<T>`の元classを保持し、K2 `ResultKey`はoperation/source revision/full refsを含む完全keyを使う。missingを0件/成功/未選択と混同せず、K2のmissing/digest/duplicate優先順を共通契約のまま照合する。

固定L3/L10業務文書は「この2親に独立した別business outcome/ACはない」とする。よって独立business pass/failは生成しない。業務境界としてsource state/authority/業務完了をobservationから作らないことを、機能caseに含まれる負例で確認する。NFRの正確な項目・適用・L10測定行は別表に記し、NFR IDが存在しないという意味ではない。

## 3. 機能case別oracle

`L9 oracle ID`列がこの文書で定義する一意IDである。`L10 case`列は承認済みsourceの参照IDであり、L9定義IDではない。L10 NFRは固定L10 NFR本文の測定項目を示す。全行は静的に設計されたexpected resultで、実行結果ではない。

| L9 oracle ID | 固定L3 AC | 固定L10 case | L10 NFR参照 | 個別fixtureと期待結果 |
|---|---|---|---|---|
| `IV-LABO-001-C01` | `LABO-001-AC-01` | `L10-LABO-001-C01` | 20-field coverage / status fidelity | 選択済みL2-021〜030 contractの許可sourceと実在eventを入力。20 field、source identity/revision、実在statusだけを保持し未発生statusを作らない。 |
| `IV-LABO-001-C02` | `LABO-001-AC-01/02` | `L10-LABO-001-C02` | source isolation / partial failure | 1 sourceのみ破損、他sourceは有効。対象sourceのstatus不変、対象recordだけ理由付きprocessing hold/warningとsource owner返却、他source record保持。 |
| `IV-LABO-001-C03` | `LABO-001-AC-01/02` | `L10-LABO-001-C03` | status fidelity | 非success eventがあるのにsuccess-only projectionが落とす負例はhold/warning、source status不変。元sourceに非success eventがない対照入力は拒否しない。 |
| `IV-LABO-001-C04` | `LABO-001-AC-01/02` | `L10-LABO-001-C04` | 20-field coverage / status fidelity | source revision欠落と既知過去revisionのcurrent偽装を別fixtureにする。欠落は固定L2-001:73のsource責務へ、current偽装は元記録を保つLABO hold。正確な歴史revisionはhistoricalとして保持。 |
| `IV-LABO-001-C05` | `LABO-001-AC-01/02` | `L10-LABO-001-C05` | source isolation / partial failure | secretまたはscope外のsource inputを一つずつ与える。取り込み成功を作らず、source ownerへ理由付きで返す。secret値自体をfixture/receiptに記録しない。 |
| `IV-LABO-001-C06` | `LABO-001-AC-01/02` | `L10-LABO-001-C06` | source authority leakage | LABOからsource canonical recordへ書こうとする負例。LABO observation保持、source writeback 0、既存authority境界で拒否。 |
| `IV-LABO-001-C07` | `LABO-001-AC-01/02` | `L10-LABO-001-C07` | scope boundary | Web/WEB-OS contractが未選択/未採択。接続状態はoptional/unconfiguredで、1.0必須依存エラーにしない。 |
| `IV-LABO-001-C08` | `LABO-001-AC-01` | `L10-LABO-001-C08` | status fidelity | success eventだけの許可source。正常に保持し、存在しない非success statusを生成せず、その欠落errorも出さない。 |
| `IV-LABO-001-C09` | `LABO-001-AC-01/02` | `L10-LABO-001-C09` | source revision / status fidelity | 正確な過去revisionと、同じ旧revisionをcurrentと偽装した入力を分離。前者はhistory保持、後者だけLABO stale hold、source status不変。 |
| `IV-LABO-001-C10` | `LABO-001-AC-01/02` | `L10-LABO-001-C10` | 20-field coverage / source isolation | 20 fieldを一つずつ独立欠落する20変異と別sourceのvalid recordを与える。欠落recordは成功扱いせず、値を補わずsource責務へ戻し、他recordを保持。 |
| `IV-LABO-001-C11` | `LABO-001-AC-01` | `L10-LABO-001-C11` | 20-field coverage / status fidelity | 既存fixtureにないが許可contract内のsource identity/revision・実在status・20 field・観測時点を入力。正常oracleを満たし、未発生statusを足さない。 |
| `IV-LABO-001-C12` | `LABO-001-AC-02` | `L10-LABO-001-C12` | status fidelity | source status `unknown`だけを`success`へ変える。raw statusは`unknown`を保持し、LABO処理holdを記録。新routeを作らない。 |
| `IV-LABO-001-C13` | `LABO-001-AC-02` | `L10-LABO-001-C13` | status fidelity | source status `not_observed`だけを`success`へ変える。raw statusは`not_observed`を保持し、LABO処理holdを記録。新routeを作らない。 |
| `IV-LABO-001-C14` | `LABO-001-AC-02` | `L10-LABO-001-C14` | source isolation / partial failure | 異なるsource identityのrecordを一つのidentityへ混ぜる。混合を受理せず、元記録を保った理由付きhold。新routeなし。 |
| `IV-LABO-001-C15` | `LABO-001-AC-02` | `L10-LABO-001-C15` | source isolation / scope boundary | scope欠落または未許可の各fixtureで横断完了を主張する。完了を出さずscope理由とsource ownerへの戻しを保持。 |
| `IV-LABO-011-C01` | `LABO-011-AC-01/02` | `L10-LABO-011-C01` | roundtrip reference completeness | L2-001 source revision付きAggregate output、欠測field、選択CONNECT identity/revision/schema/provenanceを入力。episodeから元観測/source identity・revisionとsource contract・schema・provenanceへ個別に戻り、欠測・選択connection契約束縛を保つ。要求parent IDはconnection identityに使わない。 |
| `IV-LABO-011-C02` | `LABO-011-AC-01/02` | `L10-LABO-011-C02` | roundtrip reference completeness | observation ID欠落/不一致、source revision欠落/不一致、relation不一致、source contract/schema/provenanceまたは選択connection contract identity/revision/schema/provenance欠落・不一致、receiptのscope/旧revision流用を別々に変異し、併発も別入力で行う。各期待は固定routeに従い、異なるfailure routeを混同しない。 |
| `IV-LABO-011-C03` | `LABO-011-AC-01/02` | `L10-LABO-011-C03` | false causality | Aggregate engineだけ成功しCorrelate接続が未完。Aggregate resultと接続状態を分け、未接続を成功表示しない。 |
| `IV-LABO-011-C04` | `LABO-011-AC-02` | `L10-LABO-011-C04` | roundtrip / false causality | relationだけを不一致にする。補完せずunresolvedと元recordを保持し、固定親のCorrelate返却先へ送る。 |
| `IV-LABO-011-C05` | `LABO-011-AC-02` | `L10-LABO-011-C05` | false causality | 因果らしいevidenceを含むevent。evidenceの有無によらずL2-011出力のcausal assertionは0、因果未確定。 |
| `IV-LABO-011-C06` | `LABO-011-AC-01/02` | `L10-LABO-011-C06` | roundtrip reference completeness | relation不一致をCorrelateへ返して再照合。原source record/revision不変、relationを暗黙補完せず、訂正revisionは別入力として照合。 |
| `IV-LABO-011-C07` | `LABO-011-AC-01` | `L10-LABO-011-C07` | roundtrip / false causality | 許可contract内の未見observation/episode identity。source revision/field/欠測/選択connectionを束縛し元sourceへ往復、欠測維持、因果未確定。 |
| `IV-LABO-011-C08` | `LABO-011-AC-02` | `L10-LABO-011-C08` | roundtrip reference completeness | C01の欠測fieldだけをepisode側で落とす。欠測保持要件を満たさず不成立。 |
| `IV-LABO-011-C09` | `LABO-011-AC-02` | `L10-LABO-011-C09` | roundtrip reference completeness | C01の欠測fieldだけをsuccessまたはdefaultへ変える。補完せず不成立。 |
| `IV-LABO-011-C10` | `LABO-011-AC-02` | `L10-LABO-011-C10` | roundtrip reference completeness | observation IDだけを欠落。原recordを保ち、依存L2-001:73のsource責務へ返す。 |
| `IV-LABO-011-C11` | `LABO-011-AC-02` | `L10-LABO-011-C11` | roundtrip reference completeness | source revisionだけを欠落。原recordを保ち、依存L2-001:73のsource責務へ返す。 |
| `IV-LABO-011-C12` | `LABO-011-AC-02` | `L10-LABO-011-C12` | roundtrip reference completeness | source revisionだけを不一致にする。原record保持のhold、新しいsource-owner routeなし。relation不一致の根拠がある場合だけCorrelateへ戻す。 |
| `IV-LABO-011-C13` | `LABO-011-AC-02` | `L10-LABO-011-C13` | roundtrip reference completeness | 要求parent IDをCONNECT identityとして使う、または別connection identity/receiptで選択connectionを代用。固定L2本文:159どおり区別し、receipt不一致を示して受領/成功を生成せず停止。新routeなし。 |

### 3.1 固定sourceのroutingとnegative優先

固定L2-001:73に示されたobservation ID/source revision/必須情報の欠落または権限外入力だけをsource責務へ返す。固定L2-011で関係不一致の根拠がある場合だけCorrelateへ返す。revision不一致や接続receipt不一致にそれらのrouteを流用しない。独自routeが固定親にない結果は元記録を保ってhold/Unknownとする。1つのsourceの失敗は他sourceの有効recordを消さない。

source status `unknown`/`not_observed`は元sourceの値として残し、LABO processing holdを別にする。K1のUnknown/Unobservedとは別列である。観測対象・source contract・revisionを読めない状態は、完全走査済み0件やsuccessへ変換しない。全てのcaseはfixtureの`expected`と実際の`observed`を分離し、実行前は観測値なしとする。

## 4. NFR・業務境界の個別trace

L3 NFR項目名と固定L3/L10 source locator、L9専用NFR oracle ID、既存functional oracle参照を別列に分ける。L3/L10本文のSHAは§1固定pinに従う。各行は固定候補に対する測定計画であり、測定結果ではない。

| L9 NFR oracle ID | 固定L3 NFR項目・source locator | 固定L10 NFR測定項目・source locator | functional oracle参照 | 測定入力・変異 | 記録する観測・適用限界 |
|---|---|---|---|---|---|
| `IV-LABO-NFR-001-01` | `HELIXLABO-L2-001` — observation field coverage（固定L3 `docs/helix-labo/L3-requirements/nfr-grade.md:7`） | `HELIXLABO-L2-001` — 20-field coverage / observed-status fidelity（固定L10 `docs/helix-labo/L10-verification/nfr-verification.md:7`） | `IV-LABO-001-C01`, `IV-LABO-001-C04`, `IV-LABO-001-C08`, `IV-LABO-001-C10`, `IV-LABO-001-C11` | 20 fieldを各1つずつ独立に欠落させ、present/missingを照合する。 | field coverageとfield別の補完0を記録。未提供fieldは元source statusを変更しない。 |
| `IV-LABO-NFR-001-02` | `HELIXLABO-L2-001` — status coverage and fidelity（固定L3 `docs/helix-labo/L3-requirements/nfr-grade.md:8`） | `HELIXLABO-L2-001` — 20-field coverage / observed-status fidelity（固定L10 `docs/helix-labo/L10-verification/nfr-verification.md:7`） | `IV-LABO-001-C01`, `IV-LABO-001-C03`, `IV-LABO-001-C08`, `IV-LABO-001-C09`, `IV-LABO-001-C11`, `IV-LABO-001-C12`, `IV-LABO-001-C13` | 7 source statusを個別に照合し、unknown→successとnot_observed→successを別々に変異する。 | statusの区別、source上の非success event脱落0、未発生statusの捏造0、unknown/not_observedのsuccess coercion各0を記録する。 |
| `IV-LABO-NFR-001-03` | `HELIXLABO-L2-001` — source authority leakage（固定L3 `docs/helix-labo/L3-requirements/nfr-grade.md:9`） | `HELIXLABO-L2-001` — source isolation / partial failure（固定L10 `docs/helix-labo/L10-verification/nfr-verification.md:8`） | `IV-LABO-001-C02`, `IV-LABO-001-C05`, `IV-LABO-001-C06`, `IV-LABO-001-C14`, `IV-LABO-001-C15` | 1 sourceだけcorrupt/unauthorized/secret/out-of-scopeとし、別sourceにはvalid recordを与える。identity混合、scope欠落、scope未許可は別変異とする。 | source status writeback 0、元source record保持、他sourceの有効record保持を記録する。新しい分類機構は設けない。 |
| `IV-LABO-NFR-011-01` | `HELIXLABO-L2-011` — roundtrip reference completeness（固定L3 `docs/helix-labo/L3-requirements/nfr-grade.md:10`） | `HELIXLABO-L2-011` — reference roundtrip（固定L10 `docs/helix-labo/L10-verification/nfr-verification.md:10`） | `IV-LABO-011-C01`, `IV-LABO-011-C02`, `IV-LABO-011-C04`, `IV-LABO-011-C06`, `IV-LABO-011-C07`, `IV-LABO-011-C08`, `IV-LABO-011-C09`, `IV-LABO-011-C10`, `IV-LABO-011-C11`, `IV-LABO-011-C12`, `IV-LABO-011-C13` | 元observation/source identity/revisionをAggregateからCorrelate、episode candidateを経て元sourceへ往復し、missingnessを保持する。欠落と不一致は別変異にする。 | referenceの往復一致、source ID/revision、missingnessを記録し、欠落と不一致を別集計する。join key、time window、similarity値は置かない。 |
| `IV-LABO-NFR-011-02` | `HELIXLABO-L2-011` — false causality（固定L3 `docs/helix-labo/L3-requirements/nfr-grade.md:11`） | `HELIXLABO-L2-011` — false causality（固定L10 `docs/helix-labo/L10-verification/nfr-verification.md:11`） | `IV-LABO-011-C03`, `IV-LABO-011-C04`, `IV-LABO-011-C05`, `IV-LABO-011-C07` | 因果らしく見えるevidenceを含む入力と、時刻/pathだけの入力を別々に与える。 | evidenceの有無にかかわらずL2-011 causal assertion 0を記録する。relation mismatchは固定Correlate routeのみ。新しい因果thresholdやalgorithmを置かない。 |

固定L3 NFR `docs/helix-labo/L3-requirements/nfr-grade.md:13` と固定L10 NFR `docs/helix-labo/L10-verification/nfr-verification.md:13` は測定不能・未観測・未指定値を全caseで成功扱いしない共通注記であり、独立NFR項目や追加oracleではない。Stage 1義務crosswalkのLABO/001行にはL10 NFR:10もlocatorとして含まれるが、固定本文の同じ行は親011のreference roundtripである。本書では固定本文の親列に従い011へ対応させ、001の独立NFR項目として数えない。索引の参照範囲から新しい要求を生成しない。

L10 NFR:9は001のWeb/WEB-OS scope boundaryを別途要求する。L3 NFRに独立の数値candidateはなく、L3 functionalのoptional source境界を`IV-LABO-001-C07`で照合し、未選択を任意/未構成として保持する。L3/L10業務本文は各2行（各文書:1–2）で独立outcomeなし、機能caseで業務境界を確認する。業務case/passを別に生成しない。

## 5. 旧HELIX source・consumer・failureとの照合

旧資産の詳細な保持・変更理由は[L4 §4](../L4-basic-design/stage1-labo.md#4-旧helixとの対応と変更理由)に集約し、L9ではoracleに影響するconsumer/failureだけを再掲する。旧資産明細台帳のasset IDは各行 `Historical` / `unresolved`、consumer_refs空欄であり、本書はそのdispositionを更新しない。

| 旧asset ID / source path:lines / full SHA-256 | 旧consumer・failureの根拠 | 現行oracleとの関係 |
|---|---|---|
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:137–145`, `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | BR-21 dashboard consumerは破損invocation_logをskipし、他sourceの集計を残す。 | 部分失敗のisolationだけを`IV-LABO-001-C02/C10`へ再導出。旧metric/dashboard consumerは使わない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:43–50,67–90,91–120`, `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 旧HATは別のHARNESS/HELIX consumer向けで、現行source observation identity・欠測往復との一致は固定L2/L11にない。 | 旧test/case/oracleを実行・copyせず、固定L10のcaseごとに新L9 oracleを定義。 |
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md:1–73`, `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`; `LEGACY-ASSET-DB669724249A14A665F0` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–34,58–74`, `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d` | 旧NFRは別HARNESS consumer、grade/timeout/confidence等を持つ。 | source/測定根拠を結ぶ方法だけ再導出。旧値・閾値・旧CIを oracle に入れない。 |

その他、FR/ACと対の要求検証、AIによる起草と上流要件承認の保持・置換理由はL4 §4のsource一覧に従う。旧実行で結果を補わない。

## 6. 検証状態・完了条件

各oracleは `Positive / Negative / Undetermined`相当のK1意味とsource-statusの値を区別して保存する。ケースが肯定でも、source recordの `success` と処理判定の肯定を同一視しない。negative、Unknown、Unobserved、Staleは別状態で、元record・reason・source revision・return targetを保持する。該当sourceが選択されていない場合は未選択を明示し、観測ゼロという実測にしない。

この文書のID・case mapping・参照・expected oracleが設計されたことだけでは、L8/L10実行、L10合格、実source permission、CONNECT通信、sourceの真正性、因果の発見、製品完了を示さない。L4 source owner/contractが不明なら影響するoperationだけUnknownのままにする。レビュー時は各caseの固定revision参照、K1/K2型・優先順、正常/negative/unknownの分離、戻し先、raw source/status不変を照合する。
