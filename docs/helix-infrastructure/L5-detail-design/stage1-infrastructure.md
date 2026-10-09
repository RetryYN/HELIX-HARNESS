---
title: "HELIX-INFRASTRUCTURE Stage 1 詳細設計"
canonical_vmodel: L1-L12
canonical_layer: L5
canonical_pair: L8
layer: L5
kind: detailed_design
status: draft_candidate
authority_status: approved_parent_design_candidate
freeze_blocking: true
paired_l8: ../L8-detail-verification/stage1-infrastructure-detail-verification.md
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 詳細設計

本書は[Stage 1 L4基本設計](../L4-basic-design/stage1-infrastructure.md)の詳細化であり、対象は採択済み `HELIXINFRASTRUCTURE-L2-001` と `HELIXINFRASTRUCTURE-L2-006`、および006に適用される場合だけの採択済みL2-005入力依存である。L2-005を親・受入対象へ加えない。L4/L9が固定するL3/L10全体pin、7 functional AC、34 functional case、6 NFR obligation、business境界を維持する。実環境の列挙、接続、権限照合、操作、測定、完了の証拠は本書から生成しない。

## 1. 親とpairの固定

L2/L11 revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA-256は `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、L11全体SHA-256は `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`。採択判断は[2026-10-05記録](../../governance/decisions/helix-infrastructure-stage1-l3-l10-po-decision-2026-10-05.md)と[L3/L10修正監査](../../governance/audits/requirements-stage/l3-l10-infra-stage1-review02-repair-2026-10-05-7a74a8bfc.json)を参照する。6つのL3/L10文書全体を固定対象とし、AC/case locatorだけへ承認scopeを狭めない。

| 固定文書 | SHA-256 |
|---|---|
| L3 functional | `22d90beb7fcec36e33b63cc3fa7921e224ff6ced66ea8f9a5f2fdb71570d28b6` |
| L3 business | `c2b22bc5af8bf721c9f6e4594e81046dde2ed2a9555fa0643accb76f8a37f97e` |
| L3 NFR | `a381b4b88fe6b5621fecf1195470b45bd5fbfd1f1dc88fee7dc3cf259abbb3ab` |
| L10 functional | `e9e3132d779e3ea9c8e4cfef2d066d0f5394cfb76069cb2af90468c4930172a7` |
| L10 business | `8801b848f6b16d5214a45b3652446a228e829c687f9203e50c02ad2bf5ddbe70` |
| L10 NFR | `562545cfb95e81bce5db29628b5fbb3a82c20fbb41db6867364ff60b2c84c63a` |

このL5はL4本文SHA-256 `84756e019c04744ede7825518e4a153f1373260df1b972c5651ade7824ab9dec` とL9本文SHA-256 `b83eee2452ec0b41ef23ffd6a3aea3e1374f82dbffc3e8c7bb54908b01ae9d8b` を親oracleとして具体化する。L8は本書のexact bytesを参照する。

## 2. 旧HELIX資産の保持と差分

下記5資産は台帳行とarchive本文を照合し、記載した全文SHA-256を再計算した。利用は意味の再導出に限定し、旧adapter、schema、workflow、runtime、test、CI、gateを実行・移植しない。

| 旧資産・読取箇所・全文SHA-256 | 旧consumer/failureの意味 | 本設計で保持・変更する点 |
|---|---|---|
| `LEGACY-ASSET-F542125805B777D8A56A` `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13–21,101,148–168` / `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | 要求FR/ACと対のverificationを次層へ結び、AC欠落で旧G3を通さない。 | 機能IDと個別oracleを結ぶtraceだけ再導出。現行L3/L10固定pinを用い、旧G3/AP-4は置換。新gateは設けない。 |
| `LEGACY-ASSET-17C4BF78919578FEBB18` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:68–73,74–98,108–119,140–171` / `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` | OPS-R-01はenvironment/resource/credential referenceを分離し、曖昧target・期限切れcredentialを閉じる。OPS-R-03はrollback plan/receiptを分離し、rollback successからincident closureを導かない。 | identity/source/unknownとrollback evidenceの意味を一部再利用。provider/schema/旧permission/全lifecycle/incident/SLOは固定L2 scope・現ownerへ再導出し、旧値は置換。 |
| `LEGACY-ASSET-F46AB11BD14F2C0469F4` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/product-lifecycle-operations-acceptance.md:20–39` / `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58` | OPS-AC-001/003のnegativeはambiguous identity、logical-only target、secret値保存、rollback target/backup欠落を識別する。 | 正常・負例の比較形だけ再導出し、固定L10 oracleへ対応させる。旧oracle、execution、acceptance値は置換。credential値を保存しない点は固定L2-010に従い、backup/snapshotへ無限定禁止を拡張しない。 |
| `LEGACY-ASSET-653A097F9C9EE51F6FDD` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-concept-v4.0.md:36,79–85,116–128` / `8c492aae7a3c2f2c27dd24794d2ba4c7a9fc025737fa7ea61215b3b6658a5e59` | 旧plane/topologyを前提にconsumerが運用境界を読む。 | plane名/topologyは置換。現行固定L2のresource identityと既存owner宣言を参照する。 |
| `LEGACY-ASSET-235F57A4DC453383E6C7` `archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/concept/HELIX_CONCEPT_v0.1.md:69–91,234–238` / `ab9d93f843875c1cd9b61049721c455ae067548196c216e64168711156afd475` | 資源制約と不足時の扱いを構想入力として扱うが、数値・配置判断は当時の概念である。 | source付きresource属性を観測する意味を再導出。旧数値・plane・容量/費用採否は持ち込まず、配置/評価ownerへ返す。 |

台帳は5行とも歴史資産として未解決で、consumer_refs自体は空である。consumer/failureの根拠は上記旧本文とINFRASTRUCTURE固定L3のsource-history、L10 negativeを突合したもの。旧asset statusや旧gateを現行authorityへ継承しない。

## 3. 共通kernel接続

この候補の起草時に参照した共通kernelの歴史固定snapshotはcommit `7d48e458fcff7e03df18abc4f768981410685cf7`であり、当該revisionのL4 `[common-kernel.md](../../helix-harness/L4-basic-design/common-kernel.md)` のSHA-256は`7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b`、L9 `[common-kernel-integration-verification.md](../../helix-harness/L9-integration-verification/common-kernel-integration-verification.md)` は`62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b`である。これらは参照した時点を特定する履歴pinであり、現行bytesのpinではない。現行の共通kernel本文はPR base `536c72b47c60ec2cd682574438003c13e56f8ea6`に含まれるL4 SHA-256 `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696`、L9 SHA-256 `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`であり、履歴snapshotとは別のbytesである。本書は履歴snapshotの語彙を再導出根拠として記録し、現行共通kernelの契約を上書き・変更しない。HELIX-INFRASTRUCTURE専用K型・K1状態・共通kernel結果理由を追加しない。

| 接続 | 入力と処理境界 | 出力・失敗時 |
|---|---|---|
| K1 `Observed<T>` | sourceの読取値、scope、source/revisionを組にする。欠落が完全読取で確定した場合と、unreadable/partial/owner unknownを区別する。 | 既存Value/Unknown/Unobserved/Stale/NotApplicableだけを使う。未読値を空集合やhealthyへ変換しない。 |
| K2 `SubjectRef` / `ResultKey` | resource/environment/path/storage/runtime/operation/authorityの参照とrole-bound inputをcanonical keyへ束縛する。各roleに元source revision/digestを残す。 | 異revisionのcache/resultをcurrentへ流用しない。raw sourceはK6側で読取り、K2 keyは固定入力identityを示す。 |
| K3 permission query/check | L2-006 `kind`はINFRA operation分類として保持し、K3 `PermissionQuery.operation`へ直接写さない。既存owner `OperationDecl`が当該INFRA operationとK3 actionを対応付けている場合に限り、そのactionを`operation`へ束縛する。対象を`target`、対象の版を`revision: SubjectRef`、scopeを`requested_scope`へ対応させ、残るrequired `operation_inputs`も既存owner declarationから解決する。別SECURITY authorityはpermission source refでありquery軸ではない。expiryはpermission record/adapterの既存規則で比較する。K3の7軸（actor, target, operation, revision, environment, scope, expiry）はcurrent owner resolverが構成する。対応する既存OperationDeclがない場合はその独立operationだけを未解決としてL4へ返し、K3 enumを拡張しない。 | permission結果のみをoperation eligibilityへ用いる。resource ready、OS停止、logical routeから許可を導かない。independent operation時のactor/environment供給元は現L4から一意に定まらず、該当operationをL4へ返す未決として記録する。 |
| K5 evidence / projection | source observationとoperation結果参照を追記可能なevidenceへ関連付ける。 | partial/corrupt readはcomplete/missingへ昇格しない。以前の値をcurrent成功で上書きしない。 |
| K6 read verifier/receipt | L9で宣言された固定sourceを、fixtureまたは宣言済みsource readerから読み取る境界。 | reader未登録・source未観測は該当fieldだけUnknown/Unobserved。read receiptは読取り範囲を示すだけで、物理適用/疎通/正常を証明しない。 |
| K7 generation pointer/fencing / K4 obligation | INFRA operation kind、OS ownerが実際に宣言するoperation ref・operation/attempt observation ref（存在・型を解決できる場合）、既存結果観測、未完義務を別に扱う。OS ownerの参照や型が未宣言・未解決なら該当operation/観測だけを未決にする。L2-005義務はrollback/recoveryに適用される範囲だけで照合する。 | `prepare_operation_check`はOS ownerの既存operation refが宣言される場合にだけ入力として束縛し、K7のgeneration pointer/EpochToken fencing inputを別に扱う。K7はgeneration pointerとEpochTokenによるfencingを定義するが、OS operation attempt identity/stateは定義しない。OS ownerが既存operation/attempt observation refと型を宣言している場合だけ別入力として保持し、source/typeが無い・解決しない場合は該当operationの観測だけを未決にする。K7 fencing inputをその代用にしない。物理実行は本設計範囲外。 |
| K10 dependency closure、K6/K5 observation | 宣言されたtyped dependency graphのclosureをK10で照合し、physical observationの読取・evidenceをK6/K5で別に追う。 | graph/pointerだけでは実体・経路・receiptを肯定しない。K9は独立reviewの独立性記録であり、このpath観測には使わない。未観測は該当source/operationのUnknown/Unobserved。 |

### 3.1 値の正規化とfield adapter

入力は固定scope、source `SubjectRef`群、各sourceのrevision/digest、宣言owner、対象environment参照である。各sourceのraw bytesはK6 readerの責務に残し、この層はsource本文を直接開いたと仮定しない。adapterは固定親が列挙する値のみを対応付け、欠けた値を既定値で埋めない。

- Resource recordはidentity、role、environment、location、version、dependencies、lifecycle stateの7項目を個別に持ち、各値にsource/revisionを結ぶ。
- Environment comparisonはscope/version/authority/source/config/network/credential scope/dataの8軸を同一視せず個別に扱う。同じ表示名はidentity同値の根拠にしない。
- Network path recordはsource/destination/protocol/endpoint/direction/purpose/security boundary/dependencyの8軸をlogical CONNECT referenceと別に保持する。複数physical pathは別identityにする。
- Storage recordはowner/durability/backup/retention/environment/confidentialityの6属性とrecovery referenceを分離する。resource/runtime属性は該当environment/source/revisionを付け、Model/Workerの能力・ticket・security policyをここから作らない。
- credential値は記録しない。scope/authorityのrefは値本体の代用品ではなく、既存SECURITY ownerへ戻す。

## 4. ComponentとAPI境界

下記はL4で定義された責務を関数/データ境界へ分解する設計候補で、外部作用を持たない。関数名はこのpair内の設計locatorであり、新しいAPI authority、owner、K1/K3/K7 result reasonではない。

| Component / API候補 | 引数境界 | 責務と返却 |
|---|---|---|
| `bind_inventory_inputs(scope_ref, source_refs)` | 固定scope、宣言source参照の集合 | K2 current keyへroleを束縛。戻りは既存K2 key/inputまたは既存`Rejected`診断に限り、重複/不明refを別resourceへ補完しない。 |
| `project_resource_observation(key, source_observations)` | keyとK6で読まれたsource observation | fieldごとの既存`Observed<T>`（`Value`/`Unknown`/`Unobserved`/`Stale`）を保持しorigin revisionを組み立てる。`NotApplicable`はowner declarationに適用外が明記され、既存K1成立条件を満たす場合に限る。完全走査で不在が確定した場合は既存resource field valueで表す。K1に`missing` variantはない。 |
| `compare_environment_axes(left, right)` | 2つのenvironment付きresource projection | 8軸ごとに既存`Observed<T>`を返し、確定一致/不一致はownerのdomain valueと既存polarity、未解決は既存`Unknown`/`Unobserved`/`Stale`に保つ。新しい比較result classは作らない。 |
| `project_path_and_storage(scope, source_observations)` | scope、CONNECT/INFRA source refs、読み取り結果 | logical connection、各physical path、storage、recovery ref、runtime fieldを別recordへ射影し、fieldごとの既存`Observed<T>`を保つ。軸欠落は埋めずowner境界を添える。 |
| `prepare_operation_check(request, current_inputs)` | INFRA `kind`、target/resource/path refs、revision/scope、既存OS operation ref（既存OS owner declarationが供給する場合）、SECURITY authority ref、current owner declaration | INFRA `kind`をK3 operation enumへ直写しない。既存owner `OperationDecl`が宣言する対応actionをK3 `PermissionQuery.operation`へ束縛し、`target`/`revision`/`requested_scope`と他required inputsをcurrent declarationから解決する。対応OperationDecl不在、またはOS operation refのowner source/typeが解決しない場合は当該operationだけ未決。戻りは元の`PermissionCheckResult`または`PermissionCheckDiagnostic`。OS owner observation refとK7 generation pointer/EpochToken fencing inputを混同せず、ここでは操作を開始しない。 |
| `record_operation_observation(os_owner_observation_refs, before_ref, result_ref, obligations)` | OS ownerが宣言する既存operation/attempt observation refs（存在・型が確認できる場合。未宣言なら当該観測は局所未決）、K5 evidence refs、rollback/recoveryに適用されるL2-005 duty refs | K5 evidenceは既存K5 APIで参照・追記し、K7は既存generation pointer/EpochTokenのcurrent/fencing照合に限って参照する。K7をOS operation/attempt result recordとして扱わない。K1 projectionは既存`Value` / `Unknown` / `Unobserved` / `Stale`を保持し、具体的なoperation result variantを増やさない。以前のsuccessでpartial/failure/unknownを消さない。 |

本節の関数候補は、次のL6で既存共通kernel契約に沿う具体的なAPI、引数、返却、失敗境界へ詳細化する責務を持つ。外部adapterのbindingと実operationの接続・実行方法は本書で確定しない。読み取りsource/ownerが確認できない場合は該当入力・operationの範囲だけ未解決のまま保持し、別ownerやfallbackを設けない。

## 5. INFRA-001詳細責務

固定functional obligations `INFRA-001-AC-01..04`、L10 functional `L10-INFRA-001-C01..C15` とL3 NFR `INFRA-NFR-001-01..03` はL4のtraceどおり全件維持する。詳細な個別fixtureは[L8 §3「INFRA-001 fixture展開」](../L8-detail-verification/stage1-infrastructure-detail-verification.md)を参照。

resource/environment/path/storage各projectionは、値、unknown、source/revision、該当ownerを単位ごとに保持する。完全scope scanを完了して不在を確認した場合のみmissingを表現する。scope・owner・sourceが解決不能、読取不能、部分更新ならunknown/unobservedを維持し、古い観測をcurrent値に再利用しない。route境界はCONNECT、security boundaryはSECURITY、resource fieldは宣言source owner、CORE設計の意味はCOREへ返す。capacity、runtime suitability、配置、費用、実環境healthを判断しない。

## 6. INFRA-006詳細責務

固定functional obligations `INFRA-006-AC-01..03`、L10 functional `L10-INFRA-006-C01..C19` とL3 NFR `INFRA-NFR-006-01..03` はL4のtraceどおり全件維持する。operation別のfixtureは[L8 §4「INFRA-006 fixture展開」](../L8-detail-verification/stage1-infrastructure-detail-verification.md)を参照。

operation kindはbootstrap、read-only health check、service stop、rollback、recoveryの5種に限定する。6th operationを別名で既存5種へ写像しない。INFRA `kind`はK3 operation enumへ直接写さない。既存owner `OperationDecl`が宣言するactionとのbindingがある場合だけ、そのactionをqueryの`operation`へ、対象を`target`、対象版を`revision`、scopeを`requested_scope`へ結ぶ。bindingがないoperationだけを未決としてL4へ返し、enumを追加しない。別SECURITY authorityはpermission source refであり、K3 tuple軸に置かない。K3 resolverが必要とするactor/environmentはcurrent OS assignmentとINFRASTRUCTURE environment declarationから構成するが、停止中OSでこれらを得る具体的owner sourceは現L4/L9で一意に定まらない。該当する独立operationだけをL4へ返す未決とし、L6で推測して埋めない。

health checkはread-only観測であり状態変更を開始しない。L2-005のbefore/after・backup/restore/rollback/recovery義務は、L9で明示されたrollback/recovery fixtureにだけ結び、bootstrap/service stopへ拡張しない。義務unknown/未充足は該当rollback/recoveryだけを保留する。個別結果は成功・拒否・失敗・部分・unknownのfixture入力として区別する。eligible revisionと未完義務は、存在する場合に限りK5 evidenceおよびOS ownerの既存参照から追跡し、K7 generation pointer/EpochTokenをoperation/attempt stateとみなさない。これらを新しいK7状態型にしない。fully automatic failoverは1.0要件や適格条件にしない。

## 7. NFRとbusiness境界

NFR six obligationsは個別の測定母集団・mutationをL8 §5に対応させる。001-01の7属性/8 environment axes/CORE design revision/runtime revision、001-02のpath 8 axes/storage 6属性+recovery ref、001-03の誤併合候補0件、006-01の6 authority条件、006-02の5 operation別coverage、006-03のprobe候補5秒×3回と比較値・遅延/timeout/途中復帰を保持する。技術候補値は承認済要件本文の検証用技術候補であり、採択済み実装値・実測値・SLOではない。

L3 business全文はこの2親に独立outcomeを置かず、functional FR/ACを正本とする。L10 business全文も独立business test/oracleを置かない。business rowsはこの境界の参照義務として保持し、業務成功、incident close、復旧完了、費用・配置の採否を生成しない。

## 8. 未解決境界と差戻し先

physical resource/pathを観測するsource、assignment、owner declarationが未登録または読取不能の場合、missingを主張せず観測不能/unknownとする。OS assignmentは必要なoperationのみ既存OS owner sourceへ戻す。independent path/authorityが不明ならINFRA-006該当operationだけ停止し、SECURITY/CONNECT/source ownerのうち既存契約で解決する範囲へ戻す。返却先owner自体が解決しない場合は未完scopeを保持する。

L2の意味/scope/owner/versionを変える必要があるときだけ固定要求へ戻す。技術詳細のunknownは該当source/operationだけに限り、他のACやStage全体へ拡張しない。L4/L9本文の意味は本書で変更しない。

### L4への返却事項

L4 §3「現行共通型と責務境界」のK9行は、K9をindependent path依存閉包・物理観測へ結び付けている。現行common-kernel §17のK9は独立reviewの独立性記録であり、path observation/依存閉包の型ではない。L5では意味を黙って書き換えず、K10を依存closure、K6/K5をsource observation/evidenceの参照先とした。このL4記述の修正はL4 ownerへ返す。L5/L8の設計からL4の誤参照が修正済みとは扱わない。

## 9. Stage 1 unit配置と宣言の候補

本節はrepository-layout L4 §2、§3.1–3.2（RL-C2–C5）、§7（RL-D1–D5）、§9.1（RL-T1–T3）と、Common Kernel L5 §7の配置・宣言・型番登録の分離をINFRA Stage 1へ技術的に具体化する。旧HELIX資産の保持・再導出・置換は§2の5資産表のままである。F542とF46のtrace/negativeの形、17C4のresource identityとowner分離は意味の起点だが、これらの旧sourceは現行unit identityやmodule pathを定めていない。したがって配置は旧pathの再利用ではなく、既存layout契約からの候補再導出であり、L2の要求意味を変更しない。

### 9.1 宣言項目への候補対応

既存declarationの項目だけを使う。次の値はunit候補を識別して後続設計を具体化するための案であり、現在mainに宣言・登録済みのunit、owner、依存、収載を意味しない。

| 既存 declaration 項目 | INFRA Stage 1候補 | 状態と境界 |
|---|---|---|
| `kind` / `identity` | `unit` / `infrastructure-stage1` | identity候補。小文字ASCIIとハイフンだけのため、既存`enc(identity)`で`infrastructure-stage1`になる。採用済み・登録済みのidentityではない。 |
| `version` / `maturity` | 未選択 | 実装対象revisionを決めていないため値を作らない。製品版・Stage番号から推測しない。 |
| `owner kind` / `owner identity` | 未選択 | L4の責務境界に対応する宣言ownerが未確定。機構名だけからowner identityを作らない。 |
| `input` / `output` contract | 本書§4の既存6 APIと、L6が固定するfunction境界への参照候補 | fieldの意味をdeclarationへ複製しない。`bind_inventory_inputs`のK2 `operation` / `operation_version` / `subject`選択、FN-05のINFRA `kind`から既存`OperationDecl` actionへのbindingは未決のままとする。 |
| `dependency type` / `identity` / `version` | CPython標準実行環境 `>=3.11` を外部実行接続欄へ置く技術候補 | L6のPython 3.11+候補を既存dependency項目で表すだけで、親要求・確定toolchain・登録runtimeではない。個別標準libraryや新しいdependency typeを追加しない。HELIX pack依存は未選択。 |
| `verification scope` / `oracle` | 本書§4、L6/L7の対象API・test locatorと、既存L8/L9参照候補 | L3/L10の固定範囲を参照する。declarationへfixture本文を複製せず、実行・合格を主張しない。 |
| `inclusion` / `exclusion` | 未選択 | 2親のStage 1範囲と、packとしての収載範囲は別である。release-unit declarationの候補集合とowner宣言が解決するまで値を作らない。 |

上表はrepository-layout L4 §3.1に既に列挙されたdeclaration項目の対応案であり、JSON field、schema、registration ruleを追加しない。Common Kernel L5 §7.1の候補値記述、§7.2のunit/source/tests/fixtures配置、§7.3の宣言bytesとledger registrationの区別を参照し、CKのidentity/version/owner値やK5 `ModelNumberDeclared` / `VersionRegistered`をINFRAへ流用しない。

### 9.2 source・test配置候補

unit候補のidentityを上記のとおり仮置きした場合、`enc(infrastructure-stage1)`の配下へ次を置く案とする。これはpath selectionを具体化する候補であり、treeに当該物が存在するという主張ではない。

| 候補locator | 役割 | 固定する範囲 |
|---|---|---|
| `helix/helix-infrastructure/units/infrastructure-stage1/declaration.json` | unit宣言の唯一の候補正本 | 既存宣言項目だけ。本文/field未選択は未確定のまま。 |
| `helix/helix-infrastructure/units/infrastructure-stage1/src/infrastructure.py` | FN-01–07候補のsource module | pure projection/照合候補。source reader、OS/SECURITY/CONNECT adapter、K5 writer、physical operationを置かない。 |
| `helix/helix-infrastructure/units/infrastructure-stage1/tests/test_infrastructure.py` | L7の個別unit test候補 | 合成入力のunit tests。moduleと同じ宣言済みunit root配下へ限定する。 |
| `helix/helix-infrastructure/units/infrastructure-stage1/fixtures/` | L8が参照するsynthetic input候補 | 合成dataのみ。実resource、credential、実行recordを置かない。 |

配置根拠はrepository-layout L4 §2/§3.1のmechanism/unit pathとdeclaration source-of-truth、Common Kernel L5 §7.2のpack/source/tests/fixtures分離である。`helix/helix-infrastructure`は既存機構名に対応する候補の親directoryであり、`infrastructure-stage1`はこの候補単位のidentityである。対象main `d4df293cbcdaf9dd357e3349c22057ea392f6fad`にINFRA unit、declaration、root `declarations/`またはmodel-number registration bytesは存在しない。ディレクトリ一覧からinventory・owner・登録・usableを生成しない。

### 9.3 固定参照とregistrationの境界

実装対象declarationのsource identityは既存`SubjectRef`（`kind`、`identity`、`revision`、`digest`）で固定し、repository tree内のpathは別のlocatorとして扱う。L6/L7側は対象revisionのtreeからlocator先bytesを読み、bytesのSHA-256を`SubjectRef.digest`と照合した後にのみ、宣言内identityと`enc(identity)`で求めたunit directoryの一致を確認する。pathは`SubjectRef`のfieldではなくrepository-layout RL-C4どおり照合用locatorに限る。Common Kernel K5の`FixedRef`（`store`、`locator`、`digest`）は保存・証拠参照の型であり、このsource `SubjectRef`とは別の契約である。moduleやtestをtree走査で選ばない。bytes digest不一致または宣言identityとlocatorの不一致を、path名だけで補正しない。

この`SubjectRef`＋独立tree locatorはsource selection用のbytes bindingであり、型番台帳の登録証拠ではない。declaration候補の内容とpathを対応づけても、K5のmodel-number-ledgerへの登録・packでの使用可能性は導かれない。登録有無、`ModelNumberDeclared` / `VersionRegistered`のowner segment、version、宣言owner、収載範囲は未解決であり、Common Kernel L5 §7.3のbootstrap/registration手順をINFRAの実在手続きとして扱わない。宣言bytesと登録事実が固定されるまでは、unitはcandidateのまま、pack usabilityは未判定である。既存L4のRL-C2–C5だけを適用し、L9へ新しいparent/verifier/gateを追加しない。
